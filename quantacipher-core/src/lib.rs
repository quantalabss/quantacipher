pub mod error;
pub mod sign;


use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key,
};
use base64::{engine::general_purpose, Engine as _};
use hkdf::Hkdf;
use sha2::Sha256;
use zeroize::{Zeroize, Zeroizing};
use rand::rngs::OsRng as RandOsRng;

use ml_kem::{MlKem1024, KemCore, EncodedSizeUser};
use ml_kem::kem::{Encapsulate, Decapsulate};

pub use error::QuantaCipherError;

/// The algorithm implemented by this crate — single source of truth.
/// If the KEM type above ever changes, update this constant alongside it.
/// All runtime labels (WASM exports, version strings, receipts) must derive
/// from here rather than maintaining separate free-floating strings.
pub const KEM_ALGORITHM_LABEL: &str = "ML-KEM-1024";
pub const KEM_STANDARD_LABEL: &str  = "FIPS 203";
pub const KEM_SCHEME_LABEL: &str    = "ML-KEM-1024 (FIPS 203) + AES-256-GCM";

const MLKEM_PUBLICKEYBYTES: usize  = 1568;
const MLKEM_SECRETKEYBYTES: usize  = 3168;
const MLKEM_CIPHERTEXTBYTES: usize = 1568;

pub fn generate_keypair() -> Result<(String, String), QuantaCipherError> {
    let mut rng = RandOsRng;
    
    // Generate keypair
    let (dk, ek) = MlKem1024::generate(&mut rng);
    
    let pk_bytes = ek.as_bytes();
    let sk_bytes = dk.as_bytes();

    let b64_public = general_purpose::STANDARD.encode(pk_bytes.as_slice());
    let b64_private = general_purpose::STANDARD.encode(sk_bytes.as_slice());
    
    Ok((b64_public, b64_private))
}

fn derive_aes_key(shared_secret: &[u8], context_info: &[u8]) -> Result<Key<Aes256Gcm>, QuantaCipherError> {
    let hkdf = Hkdf::<Sha256>::new(None, shared_secret);
    let mut okm = [0u8; 32];
    hkdf.expand(context_info, &mut okm).map_err(|_| QuantaCipherError::EncryptionFailed)?;
    let key = Key::<Aes256Gcm>::from_slice(&okm).clone();
    okm.zeroize();
    Ok(key)
}

pub fn vault_encrypt(plaintext: &str) -> Result<String, QuantaCipherError> {
    let mut rng = RandOsRng;

    let (_dk, ek) = MlKem1024::generate(&mut rng);

    let (ct, mut shared_secret) = ek.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    let header = b"QZ_VAULT_V1:";
    
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct.as_slice());

    let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
    let cipher = Aes256Gcm::new(&aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    shared_secret.as_mut_slice().zeroize();

    let b64_kyber_ct = general_purpose::STANDARD.encode(ct.as_slice());
    let b64_nonce = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct = general_purpose::STANDARD.encode(aes_ciphertext);

    Ok(format!("QZ_VAULT_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct))
}

pub fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, QuantaCipherError> {
    let mut rng = RandOsRng;

    let public_key_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    if public_key_bytes.len() != MLKEM_PUBLICKEYBYTES {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    let pk_array = ml_kem::array::Array::try_from(public_key_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let ek = <MlKem1024 as KemCore>::EncapsulationKey::from_bytes(&pk_array);

    let (ct, mut shared_secret) = ek.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

    let header = b"QZ_SECURE_V1:";
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct.as_slice());

    let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
    let cipher = Aes256Gcm::new(&aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    shared_secret.as_mut_slice().zeroize();

    let b64_kyber_ct = general_purpose::STANDARD.encode(ct.as_slice());
    let b64_nonce = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct = general_purpose::STANDARD.encode(aes_ciphertext);

    Ok(format!("QZ_SECURE_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct))
}

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

    let sk_array = ml_kem::array::Array::try_from(private_key_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
    let dk = <MlKem1024 as KemCore>::DecapsulationKey::from_bytes(&sk_array);

    if kyber_ct_bytes.len() != MLKEM_CIPHERTEXTBYTES {
        return Err(QuantaCipherError::InvalidCiphertextLength);
    }

    let ct_array = ml_kem::array::Array::try_from(kyber_ct_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;
    
    let mut shared_secret = dk.decapsulate(&ct_array).map_err(|_| QuantaCipherError::DecapsulationFailed)?;

    let header = b"QZ_SECURE_V1:";
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct_array.as_slice());

    let aes_key = derive_aes_key(shared_secret.as_slice(), &context_info)?;
    let cipher = Aes256Gcm::new(&aes_key);

    if nonce_bytes.len() != 12 {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }
    let nonce = aes_gcm::Nonce::from_slice(&nonce_bytes);

    let plaintext_bytes = cipher
        .decrypt(nonce, aes_ct_bytes.as_ref())
        .map_err(|_| QuantaCipherError::DecryptionFailed)?;

    shared_secret.as_mut_slice().zeroize();

    String::from_utf8(plaintext_bytes).map_err(QuantaCipherError::Utf8Error)
}

pub fn get_version() -> String {
    // Format: <semver>-<kem-algorithm>-<standard>
    // Derived from the typed constants above — not a free-floating string.
    format!("3.0.0-{}-{}",
        KEM_ALGORITHM_LABEL.to_lowercase().replace('-', "").replace(' ', "-"),
        KEM_STANDARD_LABEL.to_lowercase().replace(' ', ""))
}

/// Returns the algorithm label exactly as it should appear in receipts,
/// CBOM output, and compliance tooling.
pub fn get_algorithm() -> &'static str {
    KEM_ALGORITHM_LABEL
}

/// Returns the full encryption scheme label for machine-readable fields.
pub fn get_scheme() -> &'static str {
    KEM_SCHEME_LABEL
}
