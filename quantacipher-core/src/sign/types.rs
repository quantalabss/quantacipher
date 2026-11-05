use serde::{Deserialize, Serialize};

/// The wire format for a QuantaCipher signature.
/// Every signature self-describes its algorithm so `verify()` can dispatch
/// correctly without the caller having to remember which algorithm was used.
///
/// Wire format (JSON):
/// ```json
/// { "alg": "ml-dsa-65", "sig": "<base64>", "ver": 2 }
/// ```
///
/// Rules:
/// - `alg` is an explicit, versioned string — never mutated in place.
/// - `ver` is the envelope format version (version 2 binds alg and ver into the signature).
/// - Missing headers in legacy deserialization default to legacy Falcon-512 draft and ver: 1.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SignatureEnvelope {
    /// Versioned algorithm identifier.
    #[serde(default = "default_sig_alg")]
    pub alg: String,
    /// Base64-encoded raw signature bytes.
    pub sig: String,
    /// Envelope format version (1 = legacy unauthenticated payload, 2 = authenticated header).
    #[serde(default = "default_sig_ver")]
    pub ver: u32,
}

fn default_sig_alg() -> String {
    alg_ids::FALCON_512_DRAFT.to_string()
}

fn default_sig_ver() -> u32 {
    1
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
    pub const FALCON_512_DRAFT: &str = "falcon-512-fips206-draft";

    /// ML-DSA-44 implementing the finalized NIST FIPS 204 standard.
    pub const ML_DSA_44: &str = "ml-dsa-44";

    /// ML-DSA-65 implementing the finalized NIST FIPS 204 standard.
    pub const ML_DSA_65: &str = "ml-dsa-65";

    /// ML-DSA-87 implementing the finalized NIST FIPS 204 standard.
    pub const ML_DSA_87: &str = "ml-dsa-87";
}
