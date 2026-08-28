use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use crate::sign::algorithms::{falcon512, mldsa44};
use serde_json;

/// The set of algorithm IDs supported by the registry.
///
/// Adding a future algorithm (e.g. finalized FN-DSA or a new KEM/signature pair)
/// means: implement the interface in `algorithms/`, add a variant here, register
/// it in `dispatch()` — no changes required at the public `sign()`/`verify()` call
/// sites.
#[derive(Debug, Clone, PartialEq)]
pub enum AlgorithmId {
    /// Falcon-512 implementing FN-DSA / FIPS 206 draft.
    /// Default algorithm — matches current QuantaChain behavior.
    Falcon512Draft,
    /// ML-DSA-44 implementing FIPS 204 (finalized).
    MlDsa44,
}

impl AlgorithmId {
    /// Returns the canonical string ID embedded in the signature envelope `alg` field.
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Falcon512Draft => alg_ids::FALCON_512_DRAFT,
            Self::MlDsa44 => alg_ids::ML_DSA_44,
        }
    }

    /// Parses a string `alg` field from an envelope into an `AlgorithmId`.
    ///
    /// Returns `Err(MissingAlgorithmId)` if `alg` is empty, and
    /// `Err(UnknownAlgorithm)` if the string is not a registered ID.
    ///
    /// NEVER falls back to a default — a missing or unrecognized `alg` is
    /// always a hard error to prevent algorithm-confusion attacks.
    pub fn from_str(alg: &str) -> Result<Self, QuantaCipherError> {
        if alg.is_empty() {
            return Err(QuantaCipherError::MissingAlgorithmId);
        }
        match alg {
            alg_ids::FALCON_512_DRAFT => Ok(Self::Falcon512Draft),
            alg_ids::ML_DSA_44 => Ok(Self::MlDsa44),
            other => Err(QuantaCipherError::UnknownAlgorithm(other.to_string())),
        }
    }
}

// =============================================================================
// Public registry functions
// =============================================================================

/// Generate a signing keypair for the given algorithm.
///
/// The default algorithm is `Falcon512Draft`, matching current QuantaChain behavior.
pub fn generate_keypair(algorithm: Option<AlgorithmId>) -> Result<SigningKeyPair, QuantaCipherError> {
    let alg = algorithm.unwrap_or(AlgorithmId::Falcon512Draft);
    match alg {
        AlgorithmId::Falcon512Draft => falcon512::generate_keypair(),
        AlgorithmId::MlDsa44 => mldsa44::generate_keypair(),
    }
}

/// Sign `payload` with the given private key and algorithm.
///
/// `algorithm` defaults to `Falcon512Draft` if `None`, matching current
/// QuantaChain behavior. The returned `SignatureEnvelope` embeds the exact
/// algorithm ID so `verify()` can dispatch correctly without any caller-side
/// tracking.
pub fn sign(
    payload: &[u8],
    private_key_b64: &str,
    algorithm: Option<AlgorithmId>,
) -> Result<SignatureEnvelope, QuantaCipherError> {
    let alg = algorithm.unwrap_or(AlgorithmId::Falcon512Draft);
    match alg {
        AlgorithmId::Falcon512Draft => falcon512::sign(payload, private_key_b64),
        AlgorithmId::MlDsa44 => mldsa44::sign(payload, private_key_b64),
    }
}

/// Verify a `SignatureEnvelope` against `payload` and `public_key_b64`.
///
/// The algorithm is read exclusively from `envelope.alg` — the registry
/// dispatches to the matching implementation. The caller's current default
/// algorithm is NEVER assumed. A missing or unrecognized `alg` is a hard error.
///
/// This design is the core crypto-agility guarantee: even if the default
/// algorithm changes in a future version, old signatures remain verifiable
/// as long as the algorithm ID remains registered.
pub fn verify(
    payload: &[u8],
    envelope: &SignatureEnvelope,
    public_key_b64: &str,
) -> Result<bool, QuantaCipherError> {
    // Dispatch is driven by the alg field in the envelope — NEVER by a default.
    let alg = AlgorithmId::from_str(&envelope.alg)?;
    match alg {
        AlgorithmId::Falcon512Draft => falcon512::verify(payload, envelope, public_key_b64),
        AlgorithmId::MlDsa44 => mldsa44::verify(payload, envelope, public_key_b64),
    }
}

/// Serialize a `SignatureEnvelope` to a compact JSON string.
pub fn envelope_to_json(envelope: &SignatureEnvelope) -> Result<String, QuantaCipherError> {
    serde_json::to_string(envelope).map_err(QuantaCipherError::SerializationError)
}

/// Deserialize a JSON string into a `SignatureEnvelope`.
/// Returns `Err(InvalidSignatureFormat)` if the JSON is malformed.
pub fn envelope_from_json(json: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    serde_json::from_str(json).map_err(|_| QuantaCipherError::InvalidSignatureFormat)
}
