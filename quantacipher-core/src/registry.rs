use crate::error::QuantaCipherError;
use ml_kem::{MlKem768, MlKem1024, KemCore, EncodedSizeUser};
use ml_kem::kem::{Encapsulate, Decapsulate};
use zeroize::{Zeroize, Zeroizing};
use rand::rngs::OsRng as RandOsRng;
use base64::{engine::general_purpose, Engine as _};

/// Canonical KEM algorithm labels
pub mod kem_ids {
    pub const ML_KEM_768: &str = "ml-kem-768";
    pub const ML_KEM_1024: &str = "ml-kem-1024";
}

/// Supported KEM algorithms in QuantaCipher
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KemAlgorithm {
    MlKem768,
    MlKem1024,
}

impl KemAlgorithm {
    pub fn id(&self) -> &'static str {
        match self {
            Self::MlKem768 => kem_ids::ML_KEM_768,
            Self::MlKem1024 => kem_ids::ML_KEM_1024,
        }
    }

    pub fn as_str(&self) -> &'static str {
        self.id()
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::MlKem768 => "ML-KEM-768",
            Self::MlKem1024 => "ML-KEM-1024",
        }
    }

    pub fn scheme_label(&self) -> &'static str {
        match self {
            Self::MlKem768 => "ML-KEM-768 (FIPS 203) + AES-256-GCM",
            Self::MlKem1024 => "ML-KEM-1024 (FIPS 203) + AES-256-GCM",
        }
    }

    pub fn nist_level(&self) -> u8 {
        match self {
            Self::MlKem768 => 3,
            Self::MlKem1024 => 5,
        }
    }

    pub fn from_id(id: &str) -> Result<Self, QuantaCipherError> {
        match id.to_lowercase().trim() {
            kem_ids::ML_KEM_768 | "mlkem768" => Ok(Self::MlKem768),
            kem_ids::ML_KEM_1024 | "mlkem1024" => Ok(Self::MlKem1024),
            other => Err(QuantaCipherError::UnknownAlgorithm(other.to_string())),
        }
    }

    pub const fn public_key_len(&self) -> usize {
        match self {
            Self::MlKem768 => 1184,
            Self::MlKem1024 => 1568,
        }
    }

    pub const fn secret_key_len(&self) -> usize {
        match self {
            Self::MlKem768 => 2400,
            Self::MlKem1024 => 3168,
        }
    }

    pub const fn private_key_len(&self) -> usize {
        self.secret_key_len()
    }

    pub const fn ciphertext_len(&self) -> usize {
        match self {
            Self::MlKem768 => 1088,
            Self::MlKem1024 => 1568,
        }
    }

    pub fn from_public_key_len(len: usize) -> Result<Self, QuantaCipherError> {
        match len {
            1184 => Ok(Self::MlKem768),
            1568 => Ok(Self::MlKem1024),
            _ => Err(QuantaCipherError::InvalidPublicKeyLength),
        }
    }

    pub fn from_secret_key_len(len: usize) -> Result<Self, QuantaCipherError> {
        match len {
            2400 => Ok(Self::MlKem768),
            3168 => Ok(Self::MlKem1024),
            _ => Err(QuantaCipherError::InvalidPrivateKeyLength),
        }
    }

    /// Generates a keypair for this KEM algorithm.
    /// Returns (base64_public_key, base64_private_key).
    pub fn generate_keypair(&self) -> Result<(String, String), QuantaCipherError> {
        let mut rng = RandOsRng;
        match self {
            Self::MlKem768 => {
                let (dk, ek) = MlKem768::generate(&mut rng);
                let b64_pub = general_purpose::STANDARD.encode(ek.as_bytes().as_slice());
                let b64_priv = general_purpose::STANDARD.encode(dk.as_bytes().as_slice());
                Ok((b64_pub, b64_priv))
            }
            Self::MlKem1024 => {
                let (dk, ek) = MlKem1024::generate(&mut rng);
                let b64_pub = general_purpose::STANDARD.encode(ek.as_bytes().as_slice());
                let b64_priv = general_purpose::STANDARD.encode(dk.as_bytes().as_slice());
                Ok((b64_pub, b64_priv))
            }
        }
    }

    /// Generates an ephemeral keypair and encapsulates against it (Vault Mode).
    /// Private key is immediately and deterministically dropped/zeroized.
    /// Returns (ciphertext_bytes, shared_secret_bytes).
    pub fn encapsulate_ephemeral(&self) -> Result<(Vec<u8>, Zeroizing<Vec<u8>>), QuantaCipherError> {
        let mut rng = RandOsRng;
        match self {
            Self::MlKem768 => {
                let (_dk, ek) = MlKem768::generate(&mut rng);
                let (ct, mut ss) = ek.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;
                let ss_bytes = Zeroizing::new(ss.as_slice().to_vec());
                ss.as_mut_slice().zeroize();
                Ok((ct.as_slice().to_vec(), ss_bytes))
            }
            Self::MlKem1024 => {
                let (_dk, ek) = MlKem1024::generate(&mut rng);
                let (ct, mut ss) = ek.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;
                let ss_bytes = Zeroizing::new(ss.as_slice().to_vec());
                ss.as_mut_slice().zeroize();
                Ok((ct.as_slice().to_vec(), ss_bytes))
            }
        }
    }

    /// Encapsulates against caller's public key (Secure Mode).
    /// Returns (ciphertext_bytes, shared_secret_bytes).
    pub fn encapsulate(&self, pk_bytes: &[u8]) -> Result<(Vec<u8>, Zeroizing<Vec<u8>>), QuantaCipherError> {
        let mut rng = RandOsRng;
        if pk_bytes.len() != self.public_key_len() {
            return Err(QuantaCipherError::InvalidPublicKeyLength);
        }
        match self {
            Self::MlKem768 => {
                let pk_array = ml_kem::array::Array::try_from(pk_bytes)
                    .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
                let ek = <MlKem768 as KemCore>::EncapsulationKey::from_bytes(&pk_array);
                let (ct, mut ss) = ek.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;
                let ss_bytes = Zeroizing::new(ss.as_slice().to_vec());
                ss.as_mut_slice().zeroize();
                Ok((ct.as_slice().to_vec(), ss_bytes))
            }
            Self::MlKem1024 => {
                let pk_array = ml_kem::array::Array::try_from(pk_bytes)
                    .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
                let ek = <MlKem1024 as KemCore>::EncapsulationKey::from_bytes(&pk_array);
                let (ct, mut ss) = ek.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;
                let ss_bytes = Zeroizing::new(ss.as_slice().to_vec());
                ss.as_mut_slice().zeroize();
                Ok((ct.as_slice().to_vec(), ss_bytes))
            }
        }
    }

    /// Decapsulates ciphertext using recipient's private key (Secure Mode).
    /// Returns shared_secret_bytes.
    pub fn decapsulate(&self, sk_bytes: &[u8], ct_bytes: &[u8]) -> Result<Zeroizing<Vec<u8>>, QuantaCipherError> {
        if sk_bytes.len() != self.secret_key_len() {
            return Err(QuantaCipherError::InvalidPrivateKeyLength);
        }
        if ct_bytes.len() != self.ciphertext_len() {
            return Err(QuantaCipherError::InvalidCiphertextLength);
        }
        match self {
            Self::MlKem768 => {
                let sk_array = ml_kem::array::Array::try_from(sk_bytes)
                    .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
                let dk = <MlKem768 as KemCore>::DecapsulationKey::from_bytes(&sk_array);
                let ct_array = ml_kem::array::Array::try_from(ct_bytes)
                    .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;
                let mut ss = dk.decapsulate(&ct_array).map_err(|_| QuantaCipherError::DecapsulationFailed)?;
                let ss_bytes = Zeroizing::new(ss.as_slice().to_vec());
                ss.as_mut_slice().zeroize();
                Ok(ss_bytes)
            }
            Self::MlKem1024 => {
                let sk_array = ml_kem::array::Array::try_from(sk_bytes)
                    .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
                let dk = <MlKem1024 as KemCore>::DecapsulationKey::from_bytes(&sk_array);
                let ct_array = ml_kem::array::Array::try_from(ct_bytes)
                    .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;
                let mut ss = dk.decapsulate(&ct_array).map_err(|_| QuantaCipherError::DecapsulationFailed)?;
                let ss_bytes = Zeroizing::new(ss.as_slice().to_vec());
                ss.as_mut_slice().zeroize();
                Ok(ss_bytes)
            }
        }
    }
}

/// Symmetric Data Encryption Mechanism (DEM)
pub mod aead {
    pub const AES_256_GCM: &str = "aes-256-gcm";
    pub const KEY_BYTES: usize = 32;
    pub const NONCE_BYTES: usize = 12;
    pub const TAG_BYTES: usize = 16;
}
