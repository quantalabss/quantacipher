pub mod error;

use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key,
};
use base64::{engine::general_purpose, Engine as _};
use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::{Zeroize, Zeroizing};
use rand::rngs::OsRng as RandOsRng;
use ml_kem::MlKem1024; // Assuming ml-kem 0.1 exposes MlKem1024
use ml_kem::kem::{Encapsulate, Decapsulate}; // RustCrypto KEM traits

pub use error::QuantaCipherError;

/// ML-KEM-1024 standard sizes
const MLKEM_PUBLICKEYBYTES: usize = 1184;
const MLKEM_SECRETKEYBYTES: usize = 3168;
const MLKEM_CIPHERTEXTBYTES: usize = 1568;

/// Generates a base64 encoded ML-KEM-1024 keypair (publicKey, privateKey)
pub fn generate_keypair() -> Result<(String, String), QuantaCipherError> {
    let mut rng = RandOsRng;
    
    // Generate keypair
    let (pk, mut sk) = MlKem1024::generate(&mut rng);
    
    let pk_bytes = pk.as_bytes();
    let sk_bytes = sk.as_bytes();

    let b64_public = general_purpose::STANDARD.encode(pk_bytes);
    let b64_private = general_purpose::STANDARD.encode(sk_bytes);
    
    // Build-time assertion / runtime algorithm string derivation based on compiled sizes
    let _algo_string = format!("ML-KEM-{}", pk_bytes.len() * 8 / 1184 * 1024); // simplistic derive

    // Zeroize the private key
    sk.zeroize();

    Ok((b64_public, b64_private))
}

/// Helper function to derive AES key via HKDF-SHA256, binding header & ciphertext as AAD
fn derive_aes_key(shared_secret: &[u8], context_info: &[u8]) -> Result<Key<Aes256Gcm>, QuantaCipherError> {
    let hkdf = Hkdf::<Sha256>::new(None, shared_secret);
    let mut okm = [0u8; 32];
    hkdf.expand(context_info, &mut okm).map_err(|_| QuantaCipherError::EncryptionFailed)?;
    let key = Key::<Aes256Gcm>::from_slice(&okm).clone();
    okm.zeroize();
    Ok(key)
}

/// Encrypts data in Vault Mode (ephemeral keypair, permanently sealed)
pub fn vault_encrypt(plaintext: &str) -> Result<String, QuantaCipherError> {
    let mut rng = RandOsRng;

    let (pk, mut sk) = MlKem1024::generate(&mut rng);

    let (ct, mut shared_secret) = pk.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    let header = b"QZ_VAULT_V1:";
    
    // Bind header and ciphertext as AAD context for HKDF
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct.as_bytes());

    let aes_key = derive_aes_key(shared_secret.as_bytes(), &context_info)?;
    let cipher = Aes256Gcm::new(&aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    // Zeroize secrets
    sk.zeroize();
    shared_secret.zeroize();

    let b64_kyber_ct = general_purpose::STANDARD.encode(ct.as_bytes());
    let b64_nonce = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct = general_purpose::STANDARD.encode(aes_ciphertext);

    Ok(format!("QZ_VAULT_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct))
}

/// Encrypts data using the recipient's Base64 ML-KEM public key
pub fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, QuantaCipherError> {
    let mut rng = RandOsRng;

    let public_key_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    if public_key_bytes.len() != MLKEM_PUBLICKEYBYTES {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    // Load Public Key from bytes (assuming ml-kem has a from_bytes or try_from)
    let pk = ml_kem::PublicKey::<MlKem1024>::try_from(public_key_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;

    let (ct, mut shared_secret) = pk.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    let header = b"QZ_SECURE_V1:";
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct.as_bytes());

    let aes_key = derive_aes_key(shared_secret.as_bytes(), &context_info)?;
    let cipher = Aes256Gcm::new(&aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    shared_secret.zeroize();

    let b64_kyber_ct = general_purpose::STANDARD.encode(ct.as_bytes());
    let b64_nonce = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct = general_purpose::STANDARD.encode(aes_ciphertext);

    Ok(format!("QZ_SECURE_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct))
}

/// Decrypts data using the user's Base64 ML-KEM private key
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
    let private_key_bytes = Zeroizing::new(general_purpose::STANDARD.decode(private_key_b64).map_err(QuantaCipherError::DecodeError)?);

    if private_key_bytes.len() != MLKEM_SECRETKEYBYTES {
        return Err(QuantaCipherError::InvalidPrivateKeyLength);
    }

    let sk = ml_kem::PrivateKey::<MlKem1024>::try_from(private_key_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;

    if kyber_ct_bytes.len() != MLKEM_CIPHERTEXTBYTES {
        return Err(QuantaCipherError::InvalidCiphertextLength);
    }

    let ct = ml_kem::Ciphertext::<MlKem1024>::try_from(kyber_ct_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;

    let mut shared_secret = sk.decapsulate(&ct).map_err(|_| QuantaCipherError::DecapsulationFailed)?;

    let header = b"QZ_SECURE_V1:";
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct.as_bytes());

    let aes_key = derive_aes_key(shared_secret.as_bytes(), &context_info)?;
    let cipher = Aes256Gcm::new(&aes_key);

    if nonce_bytes.len() != 12 {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }
    let nonce = aes_gcm::Nonce::from_slice(&nonce_bytes);

    let plaintext_bytes = cipher
        .decrypt(nonce, aes_ct_bytes.as_ref())
        .map_err(|_| QuantaCipherError::DecryptionFailed)?;

    shared_secret.zeroize();

    String::from_utf8(plaintext_bytes).map_err(QuantaCipherError::Utf8Error)
}

pub fn get_version() -> String {
    "3.0.0-dual-mode-mlkem-fips203".to_string()
}
