use crate::error::QuantaCipherError;
use serde::{Deserialize, Serialize};

/// Policy governing minimum cryptographic security levels to prevent downgrade attacks.
///
/// NIST Security Levels:
/// - Level 1: ~AES-128 equivalent (Falcon-512 draft)
/// - Level 2: ~SHA-256 / collision resistance (ML-DSA-44)
/// - Level 3: ~AES-192 equivalent (ML-KEM-768, ML-DSA-65) - Standard Profile
/// - Level 5: ~AES-256 equivalent (ML-KEM-1024, ML-DSA-87) - High Profile (Default)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct SecurityPolicy {
    /// Minimum acceptable NIST security level (1, 2, 3, or 5). Defaults to 1 (permissive).
    pub min_level: u8,
    /// When true, rejects legacy unversioned envelopes (e.g. QZ_SECURE_V1 or sig ver 1).
    pub reject_legacy: bool,
}

impl Default for SecurityPolicy {
    fn default() -> Self {
        Self {
            min_level: 1,
            reject_legacy: false,
        }
    }
}

impl SecurityPolicy {
    /// Creates a custom policy with specified minimum level and legacy rejection flag.
    pub fn new(min_level: u8, reject_legacy: bool) -> Self {
        Self {
            min_level,
            reject_legacy,
        }
    }

    /// Permissive policy (accepts Level 1+, legacy allowed) - matches legacy default behavior.
    pub fn permissive() -> Self {
        Self::default()
    }

    /// Standard policy: requires minimum Level 3 (ML-KEM-768 / ML-DSA-65).
    pub fn standard() -> Self {
        Self {
            min_level: 3,
            reject_legacy: false,
        }
    }

    /// High security policy: requires minimum Level 5 (ML-KEM-1024 / ML-DSA-87).
    /// Rejects any attempt to downgrade to Level 3, Level 2, or Level 1 algorithms.
    pub fn high() -> Self {
        Self {
            min_level: 5,
            reject_legacy: false,
        }
    }

    /// Strict high security policy: requires Level 5 AND rejects legacy unversioned formats.
    pub fn strict_high() -> Self {
        Self {
            min_level: 5,
            reject_legacy: true,
        }
    }

    /// Validates whether the given actual level meets this policy.
    pub fn check_level(&self, actual_level: u8) -> Result<(), QuantaCipherError> {
        if actual_level < self.min_level {
            Err(QuantaCipherError::SecurityLevelBelowMinimum {
                actual: actual_level,
                minimum: self.min_level,
            })
        } else {
            Ok(())
        }
    }
}
