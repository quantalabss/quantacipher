use crate::error::QuantaCipherError;
use crate::registry::KemAlgorithm;
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Key, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::{Zeroize, Zeroizing};

pub const PREFIX_VAULT_V2: &str = "QZ_VAULT_V2:";
pub const PREFIX_SECURE_V2: &str = "QZ_SECURE_V2:";
pub const PREFIX_VAULT_V1: &str = "QZ_VAULT_V1:";
pub const PREFIX_SECURE_V1: &str = "QZ_SECURE_V1:";
pub const PREFIX_LEGACY_PQC: &str = "QZ_TRUE_PQC_KEM:";

/// Derives the 256-bit AES-GCM key via HKDF-SHA256 from the KEM shared secret
/// and mode-specific context information (which includes the authenticated header).
pub fn derive_aes_key(shared_secret: &[u8], context_info: &[u8]) -> Result<Key<Aes256Gcm>, QuantaCipherError> {
    let hkdf = Hkdf::<Sha256>::new(None, shared_secret);
    let mut okm = [0u8; 32];
    hkdf.expand(context_info, &mut okm).map_err(|_| QuantaCipherError::EncryptionFailed)?;
    let key = Key::<Aes256Gcm>::from_slice(&okm).clone();
    okm.zeroize();
    Ok(key)
}

/// Formats a V2 Vault Mode ciphertext string:
/// `QZ_VAULT_V2:{alg}:{b64_kem_ct}:{b64_nonce}:{b64_aes_ct}`
/// where header `QZ_VAULT_V2:{alg}:` is authenticated via AAD.
pub fn seal_vault_v2(plaintext: &[u8], alg: KemAlgorithm) -> Result<String, QuantaCipherError> {
    let (ct, mut shared_secret) = alg.encapsulate_ephemeral()?;

    let header = format!("QZ_VAULT_V2:{}:", alg.id());
    let mut context_info = Vec::with_capacity(header.len() + ct.len());
    context_info.extend_from_slice(header.as_bytes());
    context_info.extend_from_slice(&ct);

    let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
    shared_secret.zeroize();

    let cipher = Aes256Gcm::new(&aes_key);
    let mut nonce_bytes = [0u8; 12];
    rand::RngCore::fill_bytes(&mut rand::rngs::OsRng, &mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let payload = Payload {
        msg: plaintext,
        aad: header.as_bytes(),
    };

    let aes_ciphertext = cipher
        .encrypt(nonce, payload)
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    let b64_kem_ct = general_purpose::STANDARD.encode(&ct);
    let b64_nonce = general_purpose::STANDARD.encode(nonce_bytes);
    let b64_aes_ct = general_purpose::STANDARD.encode(&aes_ciphertext);

    Ok(format!("QZ_VAULT_V2:{}:{}:{}:{}", alg.id(), b64_kem_ct, b64_nonce, b64_aes_ct))
}

/// Formats a V2 Secure Mode ciphertext string:
/// `QZ_SECURE_V2:{alg}:{b64_kem_ct}:{b64_nonce}:{b64_aes_ct}`
/// where header `QZ_SECURE_V2:{alg}:` is authenticated via AAD.
pub fn seal_secure_v2(plaintext: &[u8], pk_bytes: &[u8], alg: KemAlgorithm) -> Result<String, QuantaCipherError> {
    let (ct, mut shared_secret) = alg.encapsulate(pk_bytes)?;

    let header = format!("QZ_SECURE_V2:{}:", alg.id());
    let mut context_info = Vec::with_capacity(header.len() + ct.len());
    context_info.extend_from_slice(header.as_bytes());
    context_info.extend_from_slice(&ct);

    let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
    shared_secret.zeroize();

    let cipher = Aes256Gcm::new(&aes_key);
    let mut nonce_bytes = [0u8; 12];
    rand::RngCore::fill_bytes(&mut rand::rngs::OsRng, &mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let payload = Payload {
        msg: plaintext,
        aad: header.as_bytes(),
    };

    let aes_ciphertext = cipher
        .encrypt(nonce, payload)
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    let b64_kem_ct = general_purpose::STANDARD.encode(&ct);
    let b64_nonce = general_purpose::STANDARD.encode(nonce_bytes);
    let b64_aes_ct = general_purpose::STANDARD.encode(&aes_ciphertext);

    Ok(format!("QZ_SECURE_V2:{}:{}:{}:{}", alg.id(), b64_kem_ct, b64_nonce, b64_aes_ct))
}

/// Decrypts both V2 authenticated envelopes and V1 legacy ciphertexts with default policy.
pub fn open_secure(ciphertext_payload: &str, private_key_b64: &str) -> Result<String, QuantaCipherError> {
    open_secure_with_policy(ciphertext_payload, private_key_b64, &crate::policy::SecurityPolicy::default())
}

/// Decrypts both V2 authenticated envelopes and V1 legacy ciphertexts, enforcing a SecurityPolicy.
pub fn open_secure_with_policy(
    ciphertext_payload: &str,
    private_key_b64: &str,
    policy: &crate::policy::SecurityPolicy,
) -> Result<String, QuantaCipherError> {
    let sk_bytes = Zeroizing::new(
        general_purpose::STANDARD
            .decode(private_key_b64)
            .map_err(QuantaCipherError::DecodeError)?
    );

    // Branch 1: V2 Versioned Envelope
    if ciphertext_payload.starts_with(PREFIX_SECURE_V2) {
        let parts: Vec<&str> = ciphertext_payload.splitn(5, ':').collect();
        if parts.len() != 5 {
            return Err(QuantaCipherError::InvalidPayloadFormat);
        }

        let alg_id = parts[1];
        let alg = KemAlgorithm::from_id(alg_id)?;
        policy.check_level(alg.nist_level())?;

        let header = format!("QZ_SECURE_V2:{}:", alg.id());

        let kem_ct_bytes = general_purpose::STANDARD.decode(parts[2]).map_err(QuantaCipherError::DecodeError)?;
        let nonce_bytes = general_purpose::STANDARD.decode(parts[3]).map_err(QuantaCipherError::DecodeError)?;
        let aes_ct_bytes = general_purpose::STANDARD.decode(parts[4]).map_err(QuantaCipherError::DecodeError)?;

        if nonce_bytes.len() != 12 {
            return Err(QuantaCipherError::InvalidPayloadFormat);
        }

        let mut shared_secret = alg.decapsulate(&sk_bytes, &kem_ct_bytes)?;

        let mut context_info = Vec::with_capacity(header.len() + kem_ct_bytes.len());
        context_info.extend_from_slice(header.as_bytes());
        context_info.extend_from_slice(&kem_ct_bytes);

        let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
        shared_secret.zeroize();

        let cipher = Aes256Gcm::new(&aes_key);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let payload = Payload {
            msg: &aes_ct_bytes,
            aad: header.as_bytes(),
        };

        let plaintext_bytes = cipher
            .decrypt(nonce, payload)
            .map_err(|_| QuantaCipherError::DecryptionFailed)?;

        return String::from_utf8(plaintext_bytes).map_err(QuantaCipherError::Utf8Error);
    }

    // Branch 2: Legacy V1 Format (Implicit ML-KEM-1024, no AAD)
    if ciphertext_payload.starts_with(PREFIX_SECURE_V1) || ciphertext_payload.starts_with(PREFIX_LEGACY_PQC) {
        if policy.reject_legacy {
            return Err(QuantaCipherError::LegacyPayloadRejected);
        }
        let alg = KemAlgorithm::MlKem1024;
        policy.check_level(alg.nist_level())?;

        let parts: Vec<&str> = ciphertext_payload.splitn(4, ':').collect();
        if parts.len() != 4 {
            return Err(QuantaCipherError::InvalidPayloadFormat);
        }

        let alg = KemAlgorithm::MlKem1024;
        let kem_ct_bytes = general_purpose::STANDARD.decode(parts[1]).map_err(QuantaCipherError::DecodeError)?;
        let nonce_bytes = general_purpose::STANDARD.decode(parts[2]).map_err(QuantaCipherError::DecodeError)?;
        let aes_ct_bytes = general_purpose::STANDARD.decode(parts[3]).map_err(QuantaCipherError::DecodeError)?;

        if nonce_bytes.len() != 12 {
            return Err(QuantaCipherError::InvalidPayloadFormat);
        }

        let mut shared_secret = alg.decapsulate(&sk_bytes, &kem_ct_bytes)?;

        let header = b"QZ_SECURE_V1:";
        let mut context_info = Vec::with_capacity(header.len() + kem_ct_bytes.len());
        context_info.extend_from_slice(header);
        context_info.extend_from_slice(&kem_ct_bytes);

        let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
        shared_secret.zeroize();

        let cipher = Aes256Gcm::new(&aes_key);
        let nonce = Nonce::from_slice(&nonce_bytes);

        // V1 legacy passed no AAD
        let plaintext_bytes = cipher
            .decrypt(nonce, aes_ct_bytes.as_ref())
            .map_err(|_| QuantaCipherError::DecryptionFailed)?;

        return String::from_utf8(plaintext_bytes).map_err(QuantaCipherError::Utf8Error);
    }

    Err(QuantaCipherError::InvalidPayloadFormat)
}
