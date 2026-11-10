use crate::error::QuantaCipherError;
use crate::registry::KemAlgorithm;
use crate::profile::SecurityProfile;
use crate::policy::SecurityPolicy;
use crate::envelope::{open_secure_raw_with_policy, seal_secure_v2, seal_vault_v2};
use base64::{engine::general_purpose, Engine as _};
use zeroize::Zeroize;
use serde::{Deserialize, Serialize};

/// Detailed migration and re-wrapping report.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RewrapReport {
    /// The newly wrapped V2 ciphertext string.
    pub new_ciphertext: String,
    /// Canonical algorithm ID of the original source payload.
    pub source_algorithm: String,
    /// Canonical algorithm ID of the target wrapper payload.
    pub target_algorithm: String,
    /// NIST security level of the original payload.
    pub source_nist_level: u8,
    /// NIST security level of the newly wrapped payload.
    pub target_nist_level: u8,
    /// True if the source payload was an unauthenticated legacy V1 envelope.
    pub was_legacy: bool,
}

/// Re-wraps an existing secure ciphertext payload to a target public key using default permissive policy.
///
/// Decapsulates the payload entirely in local memory, zeroizes intermediate plaintext,
/// and encapsulates under the target public key without cleartext ever leaking or touching network.
pub fn rewrap_secure(
    ciphertext: &str,
    current_sk_b64: &str,
    target_pk_b64: &str,
) -> Result<String, QuantaCipherError> {
    rewrap_secure_with_policy(
        ciphertext,
        current_sk_b64,
        target_pk_b64,
        &SecurityPolicy::permissive(),
    )
}

/// Re-wraps an existing secure ciphertext payload to a target public key, enforcing a SecurityPolicy.
///
/// Ensures both incoming ciphertext and target public key meet policy requirements
/// (e.g. preventing downgrade and rejecting legacy if policy.reject_legacy is true).
pub fn rewrap_secure_with_policy(
    ciphertext: &str,
    current_sk_b64: &str,
    target_pk_b64: &str,
    policy: &SecurityPolicy,
) -> Result<String, QuantaCipherError> {
    let report = rewrap_secure_report(ciphertext, current_sk_b64, target_pk_b64, policy)?;
    Ok(report.new_ciphertext)
}

/// Re-wraps an existing secure ciphertext with an explicit target algorithm and policy.
pub fn rewrap_secure_for_alg(
    ciphertext: &str,
    current_sk_b64: &str,
    target_pk_b64: &str,
    target_alg: KemAlgorithm,
    policy: &SecurityPolicy,
) -> Result<String, QuantaCipherError> {
    let target_pk_bytes = general_purpose::STANDARD
        .decode(target_pk_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    if target_pk_bytes.len() != target_alg.public_key_len() {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    policy.check_level(target_alg.nist_level())?;

    let (mut plaintext_bytes, _source_alg, _was_legacy) =
        open_secure_raw_with_policy(ciphertext, current_sk_b64, policy)?;

    let new_ciphertext = seal_secure_v2(plaintext_bytes.as_slice(), &target_pk_bytes, target_alg)?;
    plaintext_bytes.zeroize();

    Ok(new_ciphertext)
}

/// Re-wraps an existing secure ciphertext and generates a comprehensive migration report.
pub fn rewrap_secure_report(
    ciphertext: &str,
    current_sk_b64: &str,
    target_pk_b64: &str,
    policy: &SecurityPolicy,
) -> Result<RewrapReport, QuantaCipherError> {
    let target_pk_bytes = general_purpose::STANDARD
        .decode(target_pk_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    let target_alg = KemAlgorithm::from_public_key_len(target_pk_bytes.len())?;
    policy.check_level(target_alg.nist_level())?;

    let (mut plaintext_bytes, source_alg, was_legacy) =
        open_secure_raw_with_policy(ciphertext, current_sk_b64, policy)?;

    let new_ciphertext = seal_secure_v2(plaintext_bytes.as_slice(), &target_pk_bytes, target_alg)?;
    plaintext_bytes.zeroize();

    Ok(RewrapReport {
        new_ciphertext,
        source_algorithm: source_alg.as_str().to_string(),
        target_algorithm: target_alg.as_str().to_string(),
        source_nist_level: source_alg.nist_level(),
        target_nist_level: target_alg.nist_level(),
        was_legacy,
    })
}

/// Re-wraps a Vault Mode ciphertext into a new versioned Vault envelope (super-encryption / archive migration).
///
/// Encrypts the existing sealed ciphertext string under the target algorithm with a fresh ephemeral
/// keypair that is immediately and deterministically destroyed.
pub fn rewrap_vault(
    ciphertext: &str,
    target_alg: KemAlgorithm,
) -> Result<String, QuantaCipherError> {
    seal_vault_v2(ciphertext.as_bytes(), target_alg)
}

/// Re-wraps a Vault Mode ciphertext according to a specified SecurityProfile.
pub fn rewrap_vault_for_profile(
    ciphertext: &str,
    target_profile: SecurityProfile,
) -> Result<String, QuantaCipherError> {
    seal_vault_v2(ciphertext.as_bytes(), target_profile.kem_algorithm())
}
