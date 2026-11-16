use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use crate::sign::algorithms::{falcon512, mldsa44, mldsa65, mldsa87, hybrid_mldsa65_p256};
use serde_json;

/// The set of algorithm IDs supported by the signing registry.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum AlgorithmId {
    /// Falcon-512 implementing FN-DSA / FIPS 206 draft.
    Falcon512Draft,
    /// ML-DSA-44 implementing FIPS 204 (finalized, NIST Level 2).
    MlDsa44,
    /// ML-DSA-65 implementing FIPS 204 (finalized, NIST Level 3).
    MlDsa65,
    /// ML-DSA-87 implementing FIPS 204 (finalized, NIST Level 5).
    MlDsa87,
    /// Non-separable hybrid signature: FIPS 204 ML-DSA-65 + Classical ECDSA P-256 (TEC 910018:2025 Figure 3).
    HybridMlDsa65P256,
}

impl AlgorithmId {
    /// Returns the canonical string ID embedded in the signature envelope `alg` field.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Falcon512Draft => alg_ids::FALCON_512_DRAFT,
            Self::MlDsa44 => alg_ids::ML_DSA_44,
            Self::MlDsa65 => alg_ids::ML_DSA_65,
            Self::MlDsa87 => alg_ids::ML_DSA_87,
            Self::HybridMlDsa65P256 => alg_ids::HYBRID_ML_DSA_65_P256,
        }
    }

    /// Parses a string `alg` field from an envelope into an `AlgorithmId`.
    pub fn from_str(alg: &str) -> Result<Self, QuantaCipherError> {
        let trimmed = alg.trim();
        if trimmed.is_empty() {
            return Err(QuantaCipherError::MissingAlgorithmId);
        }
        match trimmed {
            alg_ids::FALCON_512_DRAFT => Ok(Self::Falcon512Draft),
            alg_ids::ML_DSA_44 => Ok(Self::MlDsa44),
            alg_ids::ML_DSA_65 => Ok(Self::MlDsa65),
            alg_ids::ML_DSA_87 => Ok(Self::MlDsa87),
            alg_ids::HYBRID_ML_DSA_65_P256 | "hybrid-sign" | "composite-mldsa65-p256" => {
                Ok(Self::HybridMlDsa65P256)
            }
            other => Err(QuantaCipherError::UnknownAlgorithm(other.to_string())),
        }
    }

    /// Returns the NIST security level (1, 2, 3, or 5).
    pub fn nist_level(&self) -> u8 {
        match self {
            Self::Falcon512Draft => 1,
            Self::MlDsa44 => 2,
            Self::MlDsa65 => 3,
            Self::MlDsa87 => 5,
            Self::HybridMlDsa65P256 => 3, // Bound by post-quantum component ML-DSA-65 (NIST Level 3) + Classical P-256
        }
    }
}

// =============================================================================
// Public registry functions
// =============================================================================

/// Generate a signing keypair for the given algorithm.
/// Default algorithm is `Falcon512Draft`, matching current QuantaChain behavior.
pub fn generate_keypair(algorithm: Option<AlgorithmId>) -> Result<SigningKeyPair, QuantaCipherError> {
    let alg = algorithm.unwrap_or(AlgorithmId::Falcon512Draft);
    match alg {
        AlgorithmId::Falcon512Draft => falcon512::generate_keypair(),
        AlgorithmId::MlDsa44 => mldsa44::generate_keypair(),
        AlgorithmId::MlDsa65 => mldsa65::generate_keypair(),
        AlgorithmId::MlDsa87 => mldsa87::generate_keypair(),
        AlgorithmId::HybridMlDsa65P256 => hybrid_mldsa65_p256::generate_keypair(),
    }
}

/// Sign `payload` with the given private key and algorithm.
/// `algorithm` defaults to `Falcon512Draft` if `None`.
pub fn sign(
    payload: &[u8],
    private_key_b64: &str,
    algorithm: Option<AlgorithmId>,
) -> Result<SignatureEnvelope, QuantaCipherError> {
    let alg = algorithm.unwrap_or(AlgorithmId::Falcon512Draft);
    match alg {
        AlgorithmId::Falcon512Draft => falcon512::sign(payload, private_key_b64),
        AlgorithmId::MlDsa44 => mldsa44::sign(payload, private_key_b64),
        AlgorithmId::MlDsa65 => mldsa65::sign(payload, private_key_b64),
        AlgorithmId::MlDsa87 => mldsa87::sign(payload, private_key_b64),
        AlgorithmId::HybridMlDsa65P256 => hybrid_mldsa65_p256::sign(payload, private_key_b64),
    }
}

/// Verify a `SignatureEnvelope` against `payload` and `public_key_b64` using default policy.
pub fn verify(
    payload: &[u8],
    envelope: &SignatureEnvelope,
    public_key_b64: &str,
) -> Result<bool, QuantaCipherError> {
    verify_with_policy(payload, envelope, public_key_b64, &crate::policy::SecurityPolicy::default())
}

/// Verify a `SignatureEnvelope` against `payload` and `public_key_b64` enforcing a SecurityPolicy.
pub fn verify_with_policy(
    payload: &[u8],
    envelope: &SignatureEnvelope,
    public_key_b64: &str,
    policy: &crate::policy::SecurityPolicy,
) -> Result<bool, QuantaCipherError> {
    if policy.reject_legacy && envelope.ver < 2 {
        return Err(QuantaCipherError::LegacyPayloadRejected);
    }
    let alg = AlgorithmId::from_str(&envelope.alg)?;
    policy.check_level(alg.nist_level())?;
    match alg {
        AlgorithmId::Falcon512Draft => falcon512::verify(payload, envelope, public_key_b64),
        AlgorithmId::MlDsa44 => mldsa44::verify(payload, envelope, public_key_b64),
        AlgorithmId::MlDsa65 => mldsa65::verify(payload, envelope, public_key_b64),
        AlgorithmId::MlDsa87 => mldsa87::verify(payload, envelope, public_key_b64),
        AlgorithmId::HybridMlDsa65P256 => hybrid_mldsa65_p256::verify(payload, envelope, public_key_b64),
    }
}

/// Serialize a `SignatureEnvelope` to a compact JSON string.
pub fn envelope_to_json(envelope: &SignatureEnvelope) -> Result<String, QuantaCipherError> {
    serde_json::to_string(envelope).map_err(QuantaCipherError::SerializationError)
}

/// Deserialize a JSON string into a `SignatureEnvelope`.
pub fn envelope_from_json(json: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    serde_json::from_str(json).map_err(|_| QuantaCipherError::InvalidSignatureFormat)
}
