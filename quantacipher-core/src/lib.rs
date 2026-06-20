pub mod error;

use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key,
};
use base64::{engine::general_purpose, Engine as _};
use pqc_kyber::*;
use rand::rngs::OsRng as RandOsRng;

pub use error::QuantaCipherError;

/// Generates a base64 encoded Kyber-1024 keypair (publicKey, privateKey)
pub fn generate_keypair() -> Result<(String, String), QuantaCipherError> {
    let mut rng = RandOsRng;
    let keys = keypair(&mut rng).map_err(|_| QuantaCipherError::KeygenFailed)?;

    let b64_public = general_purpose::STANDARD.encode(&keys.public);
    let b64_private = general_purpose::STANDARD.encode(&keys.secret);

    Ok((b64_public, b64_private))
}

/// Encrypts data in Vault Mode (ephemeral keypair, permanently sealed)
pub fn vault_encrypt(plaintext: &str) -> Result<String, QuantaCipherError> {
    let mut rng = RandOsRng;

    let keys = keypair(&mut rng).map_err(|_| QuantaCipherError::KeygenFailed)?;

    let (kyber_ciphertext, shared_secret) =
        encapsulate(&keys.public, &mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    let aes_key = Key::<Aes256Gcm>::from_slice(&shared_secret);
    let cipher = Aes256Gcm::new(aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    let b64_kyber_ct = general_purpose::STANDARD.encode(kyber_ciphertext);
    let b64_nonce = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct = general_purpose::STANDARD.encode(aes_ciphertext);

    Ok(format!("QZ_VAULT_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct))
}

/// Encrypts data using the recipient's Base64 Kyber public key
pub fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, QuantaCipherError> {
    let mut rng = RandOsRng;

    let public_key_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    if public_key_bytes.len() != KYBER_PUBLICKEYBYTES {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    let mut pk = [0u8; KYBER_PUBLICKEYBYTES];
    pk.copy_from_slice(&public_key_bytes);

    let (kyber_ciphertext, shared_secret) =
        encapsulate(&pk, &mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    let aes_key = Key::<Aes256Gcm>::from_slice(&shared_secret);
    let cipher = Aes256Gcm::new(aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    let b64_kyber_ct = general_purpose::STANDARD.encode(kyber_ciphertext);
    let b64_nonce = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct = general_purpose::STANDARD.encode(aes_ciphertext);

    Ok(format!("QZ_SECURE_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct))
}

/// Decrypts data using the user's Base64 Kyber private key
pub fn secure_decrypt(ciphertext_payload: &str, private_key_b64: &str) -> Result<String, QuantaCipherError> {
    if !ciphertext_payload.starts_with("QZ_SECURE_V1:") {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }

    let parts: Vec<&str> = ciphertext_payload.splitn(4, ':').collect();
    if parts.len() != 4 {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }

    let kyber_ct_bytes = general_purpose::STANDARD.decode(parts[1]).map_err(QuantaCipherError::DecodeError)?;
    let nonce_bytes = general_purpose::STANDARD.decode(parts[2]).map_err(QuantaCipherError::DecodeError)?;
    let aes_ct_bytes = general_purpose::STANDARD.decode(parts[3]).map_err(QuantaCipherError::DecodeError)?;
    let private_key_bytes = general_purpose::STANDARD.decode(private_key_b64).map_err(QuantaCipherError::DecodeError)?;

    if private_key_bytes.len() != KYBER_SECRETKEYBYTES {
        return Err(QuantaCipherError::InvalidPrivateKeyLength);
    }

    let mut sk = [0u8; KYBER_SECRETKEYBYTES];
    sk.copy_from_slice(&private_key_bytes);

    if kyber_ct_bytes.len() != KYBER_CIPHERTEXTBYTES {
        return Err(QuantaCipherError::InvalidCiphertextLength);
    }

    let mut kyber_ct = [0u8; KYBER_CIPHERTEXTBYTES];
    kyber_ct.copy_from_slice(&kyber_ct_bytes);

    let shared_secret = decapsulate(&kyber_ct, &sk).map_err(|_| QuantaCipherError::DecapsulationFailed)?;

    let aes_key = Key::<Aes256Gcm>::from_slice(&shared_secret);
    let cipher = Aes256Gcm::new(aes_key);

    if nonce_bytes.len() != 12 {
        return Err(QuantaCipherError::InvalidPayloadFormat); // Nonce length
    }
    let nonce = aes_gcm::Nonce::from_slice(&nonce_bytes);

    let plaintext_bytes = cipher
        .decrypt(nonce, aes_ct_bytes.as_ref())
        .map_err(|_| QuantaCipherError::DecryptionFailed)?;

    String::from_utf8(plaintext_bytes).map_err(QuantaCipherError::Utf8Error)
}

pub fn get_version() -> String {
    "3.0.0-dual-mode-pqc".to_string()
}
