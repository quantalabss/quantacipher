use crate::error::QuantaCipherError;
use crate::registry::KemAlgorithm;
use crate::sign::registry::{self, AlgorithmId};
use crate::sign::types::{SignatureEnvelope, SigningKeyPair};
use serde::{Deserialize, Serialize};
use std::fmt;
use std::str::FromStr;

/// Canonical profile name constants
pub mod profile_ids {
    pub const STANDARD: &str = "standard";
    pub const HIGH: &str = "high";
    pub const HYBRID: &str = "hybrid";
}

/// Selectable Security Profile for QuantaCipher.
///
/// Profiles bundle NIST-standardized PQC primitive suites:
/// - `Standard`: NIST Security Level 3 (ML-KEM-768 for KEM, ML-DSA-65 for Sign, AES-256-GCM)
/// - `High` (Default): NIST Security Level 5 (ML-KEM-1024 for KEM, ML-DSA-87 for Sign, AES-256-GCM)
/// - `Hybrid`: NIST Security Level 5 Composite (X-Wing / X25519 + ML-KEM-768 for KEM, ML-DSA-87 for Sign)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SecurityProfile {
    /// NIST Level 3: ML-KEM-768 / ML-DSA-65 / AES-256-GCM
    Standard,
    /// NIST Level 5: ML-KEM-1024 / ML-DSA-87 / AES-256-GCM (Default)
    #[default]
    High,
    /// Composite / Dual-layer: Hybrid post-quantum + classical (prepared for Phase 4)
    Hybrid,
}

impl SecurityProfile {
    pub const ALL: [SecurityProfile; 3] = [
        SecurityProfile::Standard,
        SecurityProfile::High,
        SecurityProfile::Hybrid,
    ];

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Standard => profile_ids::STANDARD,
            Self::High => profile_ids::HIGH,
            Self::Hybrid => profile_ids::HYBRID,
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::Standard => "Standard (NIST Level 3)",
            Self::High => "High (NIST Level 5)",
            Self::Hybrid => "Hybrid (Composite Level 5)",
        }
    }

    pub fn nist_level(&self) -> u8 {
        match self {
            Self::Standard => 3,
            Self::High => 5,
            Self::Hybrid => 5,
        }
    }

    pub fn kem_algorithm(&self) -> KemAlgorithm {
        match self {
            Self::Standard => KemAlgorithm::MlKem768,
            Self::High => KemAlgorithm::MlKem1024,
            Self::Hybrid => KemAlgorithm::HybridXWing,
        }
    }

    pub fn sign_algorithm(&self) -> AlgorithmId {
        match self {
            Self::Standard => AlgorithmId::MlDsa65,
            Self::High => AlgorithmId::MlDsa87,
            Self::Hybrid => AlgorithmId::MlDsa87,
        }
    }

    pub fn symmetric_algorithm(&self) -> &'static str {
        "AES-256-GCM"
    }

    pub fn scheme_description(&self) -> &'static str {
        match self {
            Self::Standard => "ML-KEM-768 + ML-DSA-65 + AES-256-GCM (NIST Level 3)",
            Self::High => "ML-KEM-1024 + ML-DSA-87 + AES-256-GCM (NIST Level 5)",
            Self::Hybrid => "Hybrid X-Wing (X25519 + ML-KEM-768) + ML-DSA-87 + AES-256-GCM",
        }
    }

    pub fn from_name(name: &str) -> Result<Self, QuantaCipherError> {
        match name.to_lowercase().trim() {
            profile_ids::STANDARD | "std" | "level3" | "nist3" | "l3" => Ok(Self::Standard),
            profile_ids::HIGH | "level5" | "nist5" | "l5" => Ok(Self::High),
            profile_ids::HYBRID | "composite" | "xwing" => Ok(Self::Hybrid),
            other => Err(QuantaCipherError::InvalidSecurityProfile(other.to_string())),
        }
    }

    /// Generate a KEM keypair according to this security profile.
    pub fn generate_keypair(&self) -> Result<(String, String), QuantaCipherError> {
        crate::generate_keypair_for_alg(self.kem_algorithm())
    }

    /// Encrypt plaintext in Vault mode according to this security profile.
    pub fn vault_encrypt(&self, plaintext: &str) -> Result<String, QuantaCipherError> {
        crate::vault_encrypt_for_alg(plaintext, self.kem_algorithm())
    }

    /// Generate a signing keypair according to this security profile.
    pub fn generate_signing_keypair(&self) -> Result<SigningKeyPair, QuantaCipherError> {
        registry::generate_keypair(Some(self.sign_algorithm()))
    }

    /// Sign a payload using the signing algorithm prescribed by this profile.
    pub fn sign_payload(&self, payload: &[u8], private_key_b64: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
        registry::sign(payload, private_key_b64, Some(self.sign_algorithm()))
    }
}

impl fmt::Display for SecurityProfile {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl FromStr for SecurityProfile {
    type Err = QuantaCipherError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::from_name(s)
    }
}
