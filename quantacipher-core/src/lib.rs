pub mod error;
pub mod envelope;
pub mod registry;
pub mod profile;
pub mod policy;
pub mod sign;
pub mod rewrap;

use base64::{engine::general_purpose, Engine as _};
pub use error::QuantaCipherError;
pub use registry::KemAlgorithm;
pub use profile::{SecurityProfile, profile_ids};
pub use policy::SecurityPolicy;
pub use envelope::{seal_vault_v2, seal_secure_v2, open_secure, open_secure_with_policy, open_secure_raw_with_policy};
pub use rewrap::{
    rewrap_secure, rewrap_secure_with_policy, rewrap_secure_for_alg, rewrap_secure_report,
    rewrap_vault, rewrap_vault_for_profile, RewrapReport,
};

/// The default algorithm implemented by this crate.
pub const KEM_ALGORITHM_LABEL: &str = "ML-KEM-1024";
pub const KEM_STANDARD_LABEL: &str  = "FIPS 203";
pub const KEM_SCHEME_LABEL: &str    = "ML-KEM-1024 (FIPS 203) + AES-256-GCM";

/// Generate an ML-KEM keypair using the default algorithm (ML-KEM-1024).
/// Returns (base64_public_key, base64_private_key).
pub fn generate_keypair() -> Result<(String, String), QuantaCipherError> {
    generate_keypair_for_alg(KemAlgorithm::MlKem1024)
}

/// Generate an ML-KEM keypair for a specific KEM algorithm (ML-KEM-768 or ML-KEM-1024).
pub fn generate_keypair_for_alg(alg: KemAlgorithm) -> Result<(String, String), QuantaCipherError> {
    alg.generate_keypair()
}

/// Generate an ML-KEM keypair according to a specified SecurityProfile.
pub fn generate_keypair_for_profile(profile: SecurityProfile) -> Result<(String, String), QuantaCipherError> {
    profile.generate_keypair()
}

/// Vault Mode encryption using the default algorithm (ML-KEM-1024).
/// Generates an ephemeral keypair, encapsulates, encrypts under AES-256-GCM with AAD,
/// and deterministically destroys the private key.
/// Returns an authenticated `QZ_VAULT_V2:ml-kem-1024:...` ciphertext.
pub fn vault_encrypt(plaintext: &str) -> Result<String, QuantaCipherError> {
    vault_encrypt_for_alg(plaintext, KemAlgorithm::MlKem1024)
}

/// Vault Mode encryption with a specific KEM algorithm.
pub fn vault_encrypt_for_alg(plaintext: &str, alg: KemAlgorithm) -> Result<String, QuantaCipherError> {
    seal_vault_v2(plaintext.as_bytes(), alg)
}

/// Vault Mode encryption with a specific SecurityProfile.
pub fn vault_encrypt_for_profile(plaintext: &str, profile: SecurityProfile) -> Result<String, QuantaCipherError> {
    profile.vault_encrypt(plaintext)
}

/// Secure Mode encryption with caller's public key.
/// Automatically detects the KEM algorithm based on the public key length
/// (1184 bytes -> ML-KEM-768, 1568 bytes -> ML-KEM-1024).
/// Produces a versioned V2 ciphertext with the header authenticated as AAD.
pub fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, QuantaCipherError> {
    let pk_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    let alg = KemAlgorithm::from_public_key_len(pk_bytes.len())?;
    seal_secure_v2(plaintext.as_bytes(), &pk_bytes, alg)
}

/// Secure Mode encryption with explicit KEM algorithm.
pub fn secure_encrypt_for_alg(
    plaintext: &str,
    public_key_b64: &str,
    alg: KemAlgorithm,
) -> Result<String, QuantaCipherError> {
    let pk_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    seal_secure_v2(plaintext.as_bytes(), &pk_bytes, alg)
}

/// Decrypts a secure mode payload locally using the user's private key with default policy.
/// Supports both versioned V2 envelopes (with AAD verification) and legacy V1 payloads.
pub fn secure_decrypt(ciphertext_payload: &str, private_key_b64: &str) -> Result<String, QuantaCipherError> {
    open_secure(ciphertext_payload, private_key_b64)
}

/// Decrypts a secure mode payload enforcing a minimum SecurityPolicy (downgrade prevention).
pub fn secure_decrypt_with_policy(
    ciphertext_payload: &str,
    private_key_b64: &str,
    policy: &SecurityPolicy,
) -> Result<String, QuantaCipherError> {
    open_secure_with_policy(ciphertext_payload, private_key_b64, policy)
}

pub fn get_version() -> String {
    format!("3.0.0-{}-{}",
        KEM_ALGORITHM_LABEL.to_lowercase().replace('-', "").replace(' ', "-"),
        KEM_STANDARD_LABEL.to_lowercase().replace(' ', ""))
}

pub fn get_algorithm() -> &'static str {
    KEM_ALGORITHM_LABEL
}

pub fn get_scheme() -> &'static str {
    KEM_SCHEME_LABEL
}
