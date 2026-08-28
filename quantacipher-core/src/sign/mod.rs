pub mod algorithms;
pub mod registry;
pub mod types;

// Re-export the public API surface
pub use types::{SignatureEnvelope, SigningKeyPair, alg_ids};
pub use registry::{AlgorithmId, sign, verify, generate_keypair, envelope_to_json, envelope_from_json};

#[cfg(test)]
mod tests;
