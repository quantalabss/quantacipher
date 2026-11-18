use crate::error::QuantaCipherError;
use crate::telecom::types::{ProtectionScheme, Suci, Supi};
use aes::cipher::{BlockEncrypt, KeyInit};
use aes::Aes256;
use hmac::{Hmac, Mac};
use sha2::{Digest, Sha256};
use zeroize::{Zeroize, Zeroizing};
use ml_kem::{
    MlKem768, KemCore, EncodedSizeUser,
    kem::{Encapsulate, Decapsulate},
};
use x25519_dalek::{EphemeralSecret, PublicKey as X25519PublicKey, StaticSecret};

type HmacSha256 = Hmac<Sha256>;

pub const AES_256_KEY_LEN: usize = 32;
pub const AES_CTR_IV_LEN: usize = 16;
pub const HMAC_KEY_LEN: usize = 32;
pub const TOTAL_KDF_KEY_LEN: usize = AES_256_KEY_LEN + AES_CTR_IV_LEN + HMAC_KEY_LEN; // 80 bytes
pub const MAC_TAG_LEN: usize = 8; // 8 octets / 64 bits per 3GPP TS 33.501 Annex C

pub const X25519_PUBKEY_LEN: usize = 32;
pub const MLKEM768_CIPHERTEXT_LEN: usize = 1088;
pub const MLKEM768_PUBKEY_LEN: usize = 1184;
pub const MLKEM768_PRIVKEY_LEN: usize = 2400;

/// ANSI X9.63 Key Derivation Function with SHA-256 per 3GPP TS 33.501 Annex C.
/// Generates `key_len` bytes from shared secret `z` and `shared_info`.
pub fn ansi_x963_kdf(z: &[u8], shared_info: &[u8], key_len: usize) -> Vec<u8> {
    let mut derived = Vec::with_capacity(key_len);
    let mut counter: u32 = 1;

    while derived.len() < key_len {
        let mut hasher = Sha256::new();
        hasher.update(z);
        hasher.update(&counter.to_be_bytes());
        hasher.update(shared_info);
        let block = hasher.finalize();

        let needed = key_len - derived.len();
        if needed < 32 {
            derived.extend_from_slice(&block[..needed]);
        } else {
            derived.extend_from_slice(&block);
        }
        counter += 1;
    }
    derived
}

/// Splits the 80-byte KDF output into (K_enc [32B], IV [16B], K_mac [32B]).
pub(crate) fn split_kdf_keys(kdf_out: &[u8]) -> Result<(&[u8], &[u8], &[u8]), QuantaCipherError> {
    if kdf_out.len() < TOTAL_KDF_KEY_LEN {
        return Err(QuantaCipherError::DecryptionFailed);
    }
    let k_enc = &kdf_out[0..AES_256_KEY_LEN];
    let iv = &kdf_out[AES_256_KEY_LEN..AES_256_KEY_LEN + AES_CTR_IV_LEN];
    let k_mac = &kdf_out[AES_256_KEY_LEN + AES_CTR_IV_LEN..TOTAL_KDF_KEY_LEN];
    Ok((k_enc, iv, k_mac))
}

/// AES-256-CTR encrypt / decrypt using 128-bit big-endian counter increment
/// per 3GPP TS 33.501 and RFC 3686.
pub fn aes_256_ctr_crypt(key: &[u8], iv: &[u8], data: &[u8]) -> Result<Vec<u8>, QuantaCipherError> {
    if key.len() != AES_256_KEY_LEN || iv.len() != AES_CTR_IV_LEN {
        return Err(QuantaCipherError::InvalidCiphertextLength);
    }

    let key_array = aes::cipher::generic_array::GenericArray::from_slice(key);
    let cipher = Aes256::new(key_array);
    let mut out = data.to_vec();

    let mut iv_array = [0u8; 16];
    iv_array.copy_from_slice(iv);
    let mut counter = u128::from_be_bytes(iv_array);

    for chunk in out.chunks_mut(16) {
        let block_bytes = counter.to_be_bytes();
        let mut block = aes::cipher::generic_array::GenericArray::from(block_bytes);
        cipher.encrypt_block(&mut block);

        for (b, k) in chunk.iter_mut().zip(block.iter()) {
            *b ^= *k;
        }
        counter = counter.wrapping_add(1);
    }
    Ok(out)
}

/// Computes truncated 8-octet HMAC-SHA256 over data.
pub(crate) fn compute_mac(mac_key: &[u8], data: &[u8]) -> Result<[u8; MAC_TAG_LEN], QuantaCipherError> {
    let mut mac = <HmacSha256 as Mac>::new_from_slice(mac_key).map_err(|_| QuantaCipherError::EncryptionFailed)?;
    mac.update(data);
    let full_mac = mac.finalize().into_bytes();
    let mut tag = [0u8; MAC_TAG_LEN];
    tag.copy_from_slice(&full_mac[..MAC_TAG_LEN]);
    Ok(tag)
}

// =============================================================================
// Profile C: Homogeneous Post-Quantum Concealment (TEC 910028 Section 6.4.1)
// =============================================================================

/// Conceals a SUPI into a SUCI using Profile C (Homogeneous ML-KEM-768 + AES-256-CTR).
pub fn conceal_profile_c(
    supi: &Supi,
    routing_indicator: &str,
    hn_public_key_id: u8,
    hn_mlkem_public_key_bytes: &[u8],
) -> Result<Suci, QuantaCipherError> {
    if hn_mlkem_public_key_bytes.len() != MLKEM768_PUBKEY_LEN {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    let pk_array = ml_kem::array::Array::try_from(hn_mlkem_public_key_bytes)
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let ek = <MlKem768 as KemCore>::EncapsulationKey::from_bytes(&pk_array);

    let mut rng = rand::rngs::OsRng;
    let (ct, mut ss) = ek.encapsulate(&mut rng)
        .map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    // SharedInfo1 is empty string for Profile C per TEC 910028 Page 59
    let kdf_out = Zeroizing::new(ansi_x963_kdf(ss.as_slice(), b"", TOTAL_KDF_KEY_LEN));
    ss.as_mut_slice().zeroize();
    let (k_enc, iv, k_mac) = split_kdf_keys(&kdf_out)?;

    // Encrypt MSIN
    let ciphertext2 = aes_256_ctr_crypt(k_enc, iv, supi.msin.as_bytes())?;

    // Compute MAC over Ciphertext2
    let mac_tag = compute_mac(k_mac, &ciphertext2)?;

    // Scheme output: [ Ciphertext1 (1088B) || Ciphertext2 (encrypted MSIN) || MAC (8B) ]
    let mut scheme_output = Vec::with_capacity(MLKEM768_CIPHERTEXT_LEN + ciphertext2.len() + MAC_TAG_LEN);
    scheme_output.extend_from_slice(ct.as_slice());
    scheme_output.extend_from_slice(&ciphertext2);
    scheme_output.extend_from_slice(&mac_tag);

    Ok(Suci {
        supi_type: 0, // IMSI
        mcc: supi.mcc.clone(),
        mnc: supi.mnc.clone(),
        routing_indicator: routing_indicator.to_string(),
        protection_scheme: ProtectionScheme::ProfileC,
        hn_public_key_id,
        scheme_output,
    })
}

/// De-conceals a Profile C SUCI back into a SUPI using the Home Network's ML-KEM private key.
pub fn deconceal_profile_c(
    suci: &Suci,
    hn_mlkem_private_key_bytes: &[u8],
) -> Result<Supi, QuantaCipherError> {
    if suci.protection_scheme != ProtectionScheme::ProfileC {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }

    if suci.scheme_output.len() < MLKEM768_CIPHERTEXT_LEN + MAC_TAG_LEN {
        return Err(QuantaCipherError::InvalidSignatureFormat);
    }

    let ct1_bytes = &suci.scheme_output[..MLKEM768_CIPHERTEXT_LEN];
    let mac_start = suci.scheme_output.len() - MAC_TAG_LEN;
    let ct2_bytes = &suci.scheme_output[MLKEM768_CIPHERTEXT_LEN..mac_start];
    let mac_tag = &suci.scheme_output[mac_start..];

    let sk_array = ml_kem::array::Array::try_from(hn_mlkem_private_key_bytes)
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
    let dk = <MlKem768 as KemCore>::DecapsulationKey::from_bytes(&sk_array);

    let ct_array = ml_kem::array::Array::try_from(ct1_bytes)
        .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;

    let mut ss = dk.decapsulate(&ct_array)
        .map_err(|_| QuantaCipherError::DecapsulationFailed)?;

    let kdf_out = Zeroizing::new(ansi_x963_kdf(ss.as_slice(), b"", TOTAL_KDF_KEY_LEN));
    ss.as_mut_slice().zeroize();
    let (k_enc, iv, k_mac) = split_kdf_keys(&kdf_out)?;

    // Verify MAC
    let expected_mac = compute_mac(k_mac, ct2_bytes)?;
    if expected_mac.as_slice() != mac_tag {
        return Err(QuantaCipherError::DecryptionFailed);
    }

    // Decrypt MSIN
    let msin_bytes = aes_256_ctr_crypt(k_enc, iv, ct2_bytes)?;
    let msin = String::from_utf8(msin_bytes).map_err(|_| QuantaCipherError::DecryptionFailed)?;

    Ok(Supi {
        mcc: suci.mcc.clone(),
        mnc: suci.mnc.clone(),
        msin,
    })
}

// =============================================================================
// Profile D: Hybrid Post-Quantum Concealment (TEC 910028 Section 6.4.2)
// =============================================================================

/// Conceals a SUPI into a SUCI using Profile D (Hybrid ML-KEM-768 + X25519 + AES-256-CTR).
pub fn conceal_profile_d(
    supi: &Supi,
    routing_indicator: &str,
    hn_public_key_id: u8,
    hn_mlkem_public_key_bytes: &[u8],
    hn_x25519_public_key_bytes: &[u8],
) -> Result<Suci, QuantaCipherError> {
    if hn_mlkem_public_key_bytes.len() != MLKEM768_PUBKEY_LEN {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }
    if hn_x25519_public_key_bytes.len() != X25519_PUBKEY_LEN {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    let mut rng = rand::rngs::OsRng;

    // 1. Classical Ephemeral X25519 Key Exchange
    let eph_secret = EphemeralSecret::random_from_rng(&mut rng);
    let eph_public = X25519PublicKey::from(&eph_secret);
    let hn_x25519_pk = X25519PublicKey::from(
        <[u8; 32]>::try_from(hn_x25519_public_key_bytes)
            .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?
    );
    let ss1_classical = eph_secret.diffie_hellman(&hn_x25519_pk);

    // 2. Post-Quantum ML-KEM-768 Encapsulation
    let pk_array = ml_kem::array::Array::try_from(hn_mlkem_public_key_bytes)
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let ek = <MlKem768 as KemCore>::EncapsulationKey::from_bytes(&pk_array);
    let (ct1, mut ss2_pq) = ek.encapsulate(&mut rng)
        .map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    // 3. Concatenate shared secrets: ss = ss1 (32B) || ss2 (32B) = 64 bytes
    let mut combined_ss = Vec::with_capacity(64);
    combined_ss.extend_from_slice(ss1_classical.as_bytes());
    combined_ss.extend_from_slice(ss2_pq.as_slice());
    ss2_pq.as_mut_slice().zeroize();
    let combined_ss = Zeroizing::new(combined_ss);

    // 4. SharedInfo = Ephemeral X25519 PK (32B) || HN ML-KEM PK (1184B) per TEC 910028 Page 63
    let mut shared_info = Vec::with_capacity(X25519_PUBKEY_LEN + MLKEM768_PUBKEY_LEN);
    shared_info.extend_from_slice(eph_public.as_bytes());
    shared_info.extend_from_slice(hn_mlkem_public_key_bytes);

    let kdf_out = Zeroizing::new(ansi_x963_kdf(&combined_ss, &shared_info, TOTAL_KDF_KEY_LEN));
    let (k_enc, iv, k_mac) = split_kdf_keys(&kdf_out)?;

    // 5. Encrypt MSIN with AES-256-CTR
    let ciphertext2 = aes_256_ctr_crypt(k_enc, iv, supi.msin.as_bytes())?;

    // 6. Compute MAC over Ciphertext2
    let mac_tag = compute_mac(k_mac, &ciphertext2)?;

    // Scheme output: [ Ephemeral X25519 PK (32B) || ML-KEM Ciphertext1 (1088B) || Ciphertext2 || MAC (8B) ]
    let mut scheme_output = Vec::with_capacity(
        X25519_PUBKEY_LEN + MLKEM768_CIPHERTEXT_LEN + ciphertext2.len() + MAC_TAG_LEN
    );
    scheme_output.extend_from_slice(eph_public.as_bytes());
    scheme_output.extend_from_slice(ct1.as_slice());
    scheme_output.extend_from_slice(&ciphertext2);
    scheme_output.extend_from_slice(&mac_tag);

    Ok(Suci {
        supi_type: 0,
        mcc: supi.mcc.clone(),
        mnc: supi.mnc.clone(),
        routing_indicator: routing_indicator.to_string(),
        protection_scheme: ProtectionScheme::ProfileD,
        hn_public_key_id,
        scheme_output,
    })
}

/// De-conceals a Profile D SUCI back into a SUPI using the Home Network's ML-KEM and X25519 private keys.
pub fn deconceal_profile_d(
    suci: &Suci,
    hn_mlkem_private_key_bytes: &[u8],
    hn_x25519_private_key_bytes: &[u8],
    hn_mlkem_public_key_bytes: &[u8],
) -> Result<Supi, QuantaCipherError> {
    if suci.protection_scheme != ProtectionScheme::ProfileD {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }

    let min_len = X25519_PUBKEY_LEN + MLKEM768_CIPHERTEXT_LEN + MAC_TAG_LEN;
    if suci.scheme_output.len() < min_len {
        return Err(QuantaCipherError::InvalidSignatureFormat);
    }

    let eph_pk_bytes = &suci.scheme_output[..X25519_PUBKEY_LEN];
    let ct1_bytes = &suci.scheme_output[X25519_PUBKEY_LEN..X25519_PUBKEY_LEN + MLKEM768_CIPHERTEXT_LEN];
    let mac_start = suci.scheme_output.len() - MAC_TAG_LEN;
    let ct2_bytes = &suci.scheme_output[X25519_PUBKEY_LEN + MLKEM768_CIPHERTEXT_LEN..mac_start];
    let mac_tag = &suci.scheme_output[mac_start..];

    // 1. Classical ECDH reconstruction
    let hn_x25519_sk = StaticSecret::from(
        <[u8; 32]>::try_from(hn_x25519_private_key_bytes)
            .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?
    );
    let eph_pk = X25519PublicKey::from(
        <[u8; 32]>::try_from(eph_pk_bytes)
            .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?
    );
    let ss1_classical = hn_x25519_sk.diffie_hellman(&eph_pk);

    // 2. Post-Quantum ML-KEM-768 Decapsulation
    let sk_array = ml_kem::array::Array::try_from(hn_mlkem_private_key_bytes)
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
    let dk = <MlKem768 as KemCore>::DecapsulationKey::from_bytes(&sk_array);

    let ct_array = ml_kem::array::Array::try_from(ct1_bytes)
        .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;
    let mut ss2_pq = dk.decapsulate(&ct_array)
        .map_err(|_| QuantaCipherError::DecapsulationFailed)?;

    // 3. Concatenate shared secrets: ss = ss1 || ss2
    let mut combined_ss = Vec::with_capacity(64);
    combined_ss.extend_from_slice(ss1_classical.as_bytes());
    combined_ss.extend_from_slice(ss2_pq.as_slice());
    ss2_pq.as_mut_slice().zeroize();
    let combined_ss = Zeroizing::new(combined_ss);

    // 4. SharedInfo = Ephemeral X25519 PK || HN ML-KEM PK
    let mut shared_info = Vec::with_capacity(X25519_PUBKEY_LEN + MLKEM768_PUBKEY_LEN);
    shared_info.extend_from_slice(eph_pk_bytes);
    shared_info.extend_from_slice(hn_mlkem_public_key_bytes);

    let kdf_out = Zeroizing::new(ansi_x963_kdf(&combined_ss, &shared_info, TOTAL_KDF_KEY_LEN));
    let (k_enc, iv, k_mac) = split_kdf_keys(&kdf_out)?;

    // 5. Verify MAC
    let expected_mac = compute_mac(k_mac, ct2_bytes)?;
    if expected_mac.as_slice() != mac_tag {
        return Err(QuantaCipherError::DecryptionFailed);
    }

    // 6. Decrypt MSIN
    let msin_bytes = aes_256_ctr_crypt(k_enc, iv, ct2_bytes)?;
    let msin = String::from_utf8(msin_bytes).map_err(|_| QuantaCipherError::DecryptionFailed)?;

    Ok(Supi {
        mcc: suci.mcc.clone(),
        mnc: suci.mnc.clone(),
        msin,
    })
}

/// Generate a 5G Home Network (UDM) keypair holding both Post-Quantum ML-KEM-768
/// and Classical X25519 keypairs per TEC 910028:2025.
pub fn generate_hn_keypair() -> Result<crate::telecom::types::HnKeyPair, QuantaCipherError> {
    use base64::{engine::general_purpose, Engine as _};
    let mut rng = rand::rngs::OsRng;
    let (dk_mlkem, ek_mlkem) = MlKem768::generate(&mut rng);
    let sk_x25519 = StaticSecret::random_from_rng(&mut rng);
    let pk_x25519 = X25519PublicKey::from(&sk_x25519);

    Ok(crate::telecom::types::HnKeyPair {
        mlkem_public_key: general_purpose::STANDARD.encode(ek_mlkem.as_bytes().as_slice()),
        mlkem_private_key: general_purpose::STANDARD.encode(dk_mlkem.as_bytes().as_slice()),
        x25519_public_key: general_purpose::STANDARD.encode(pk_x25519.as_bytes()),
        x25519_private_key: general_purpose::STANDARD.encode(sk_x25519.to_bytes()),
    })
}

