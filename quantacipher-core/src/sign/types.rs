use serde::{Deserialize, Serialize};

/// The wire format for a QuantaCipher signature.
/// Every signature self-describes its algorithm so `verify()` can dispatch
/// correctly without the caller having to remember which algorithm was used.
///
/// Wire format (JSON):
/// ```json
/// { "alg": "falcon-512-fips206-draft", "sig": "<base64>", "ver": 1 }
/// ```
///
/// Rules:
/// - `alg` is an explicit, versioned string — never mutated in place.
///   When FIPS 206 finalizes, a new ID will be added ("falcon-512-fips206-final")
///   so old "draft" signatures remain verifiable.
/// - `ver` is the envelope format version, independent of the algorithm version.
/// - A missing or unknown `alg` field MUST be a hard error — never silently
///   fall back to a default algorithm (that would be an algorithm-confusion bug).
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SignatureEnvelope {
    /// Versioned algorithm identifier.
    pub alg: String,
    /// Base64-encoded raw signature bytes.
    pub sig: String,
    /// Envelope format version (currently always 1).
    pub ver: u32,
}

/// A signing keypair returned by `generate_keypair()`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SigningKeyPair {
    /// Base64-encoded public key.
    pub public_key: String,
    /// Base64-encoded private key. NEVER expose this.
    pub private_key: String,
    /// The algorithm ID this keypair is valid for.
    pub algorithm: String,
}

/// The canonical algorithm ID strings used in `SignatureEnvelope.alg`.
pub mod alg_ids {
    /// Falcon-512 implementing the FN-DSA FIPS 206 draft.
    /// When FIPS 206 is finalized, a new ID "falcon-512-fips206-final" will be
    /// added; this ID must remain registered indefinitely for backward
    /// compatibility with signatures already produced under it.
    pub const FALCON_512_DRAFT: &str = "falcon-512-fips206-draft";

    /// ML-DSA-44 implementing the finalized NIST FIPS 204 standard.
    pub const ML_DSA_44: &str = "ml-dsa-44";
}
