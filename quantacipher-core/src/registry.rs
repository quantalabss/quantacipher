use crate::error::QuantaCipherError;
use ml_kem::{MlKem768, MlKem1024, KemCore, EncodedSizeUser};
use ml_kem::kem::{Encapsulate, Decapsulate};
use zeroize::{Zeroize, Zeroizing};
use rand::rngs::OsRng as RandOsRng;
use base64::{engine::general_purpose, Engine as _};
use x25519_dalek::{StaticSecret, PublicKey as X25519PublicKey};
use sha3::{Digest, Sha3_256};

/// Canonical KEM algorithm labels
pub mod kem_ids {
    pub const ML_KEM_768: &str = "ml-kem-768";
    pub const ML_KEM_1024: &str = "ml-kem-1024";
    pub const HYBRID_XWING: &str = "hybrid-xwing";
}

/// Domain separation label for X-Wing combiner: `\\.//^\\` (6 bytes: 0x5c, 0x2e, 0x2f, 0x2f, 0x5e, 0x5c)
pub const XWING_LABEL: &[u8; 6] = &[0x5c, 0x2e, 0x2f, 0x2f, 0x5e, 0x5c];

/// Derives the X-Wing hybrid shared secret per draft-connolly-cfrg-xwing-kem:
/// `ss = SHA3-256(ss_M || ss_X || ct_X || pk_X || XWingLabel)`
pub fn xwing_combine_secrets(
    ss_m: &[u8],
    ss_x: &[u8],
    ct_x: &[u8],
    pk_x: &[u8],
) -> Zeroizing<Vec<u8>> {
    let mut hasher = Sha3_256::new();
    hasher.update(ss_m);
    hasher.update(ss_x);
    hasher.update(ct_x);
    hasher.update(pk_x);
    hasher.update(XWING_LABEL);
    let output = hasher.finalize();
    Zeroizing::new(output.to_vec())
}

/// Supported KEM algorithms in QuantaCipher
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum KemAlgorithm {
    MlKem768,
    MlKem1024,
    HybridXWing,
}

impl KemAlgorithm {
    pub fn id(&self) -> &'static str {
        match self {
            Self::MlKem768 => kem_ids::ML_KEM_768,
            Self::MlKem1024 => kem_ids::ML_KEM_1024,
            Self::HybridXWing => kem_ids::HYBRID_XWING,
        }
    }

    pub fn as_str(&self) -> &'static str {
        self.id()
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            Self::MlKem768 => "ML-KEM-768",
            Self::MlKem1024 => "ML-KEM-1024",
            Self::HybridXWing => "Hybrid X-Wing (X25519 + ML-KEM-768)",
        }
    }

    pub fn scheme_label(&self) -> &'static str {
        match self {
            Self::MlKem768 => "ML-KEM-768 (FIPS 203) + AES-256-GCM",
            Self::MlKem1024 => "ML-KEM-1024 (FIPS 203) + AES-256-GCM",
            Self::HybridXWing => "Hybrid X-Wing (X25519 + ML-KEM-768) + AES-256-GCM",
        }
    }

    pub fn nist_level(&self) -> u8 {
        match self {
            Self::MlKem768 => 3,
            Self::MlKem1024 => 5,
            Self::HybridXWing => 3, // Bound by post-quantum component ML-KEM-768 (NIST Level 3) + Classical X25519
        }
    }

    pub fn from_id(id: &str) -> Result<Self, QuantaCipherError> {
        match id.to_lowercase().trim() {
            kem_ids::ML_KEM_768 | "mlkem768" => Ok(Self::MlKem768),
            kem_ids::ML_KEM_1024 | "mlkem1024" => Ok(Self::MlKem1024),
            kem_ids::HYBRID_XWING | "xwing" | "hybrid" | "x-wing" => Ok(Self::HybridXWing),
            other => Err(QuantaCipherError::UnknownAlgorithm(other.to_string())),
        }
    }

    pub const fn public_key_len(&self) -> usize {
        match self {
            Self::MlKem768 => 1184,
            Self::MlKem1024 => 1568,
            Self::HybridXWing => 1216, // 1184 (ML-KEM-768 ek) + 32 (X25519 pk)
        }
    }

    pub const fn secret_key_len(&self) -> usize {
        match self {
            Self::MlKem768 => 2400,
            Self::MlKem1024 => 3168,
            Self::HybridXWing => 2432, // 2400 (ML-KEM-768 dk) + 32 (X25519 sk)
        }
    }

    pub const fn private_key_len(&self) -> usize {
        self.secret_key_len()
    }

    pub const fn ciphertext_len(&self) -> usize {
        match self {
            Self::MlKem768 => 1088,
            Self::MlKem1024 => 1568,
            Self::HybridXWing => 1120, // 1088 (ML-KEM-768 ct) + 32 (X25519 ephemeral pk)
        }
    }

    pub fn from_public_key_len(len: usize) -> Result<Self, QuantaCipherError> {
        match len {
            1184 => Ok(Self::MlKem768),
            1216 => Ok(Self::HybridXWing),
            1568 => Ok(Self::MlKem1024),
            _ => Err(QuantaCipherError::InvalidPublicKeyLength),
        }
    }

    pub fn from_secret_key_len(len: usize) -> Result<Self, QuantaCipherError> {
        match len {
            2400 => Ok(Self::MlKem768),
            2432 => Ok(Self::HybridXWing),
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
            Self::HybridXWing => {
                let (dk_m, ek_m) = MlKem768::generate(&mut rng);
                let sk_x = StaticSecret::random_from_rng(&mut rng);
                let pk_x = X25519PublicKey::from(&sk_x);

                let mut pk_bytes = Vec::with_capacity(1216);
                pk_bytes.extend_from_slice(ek_m.as_bytes().as_slice());
                pk_bytes.extend_from_slice(pk_x.as_bytes());

                let mut sk_bytes = Zeroizing::new(Vec::with_capacity(2432));
                sk_bytes.extend_from_slice(dk_m.as_bytes().as_slice());
                sk_bytes.extend_from_slice(&sk_x.to_bytes());

                let b64_pub = general_purpose::STANDARD.encode(&pk_bytes);
                let b64_priv = general_purpose::STANDARD.encode(sk_bytes.as_slice());
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
            Self::HybridXWing => {
                let (_dk_m, ek_m) = MlKem768::generate(&mut rng);
                let sk_x = StaticSecret::random_from_rng(&mut rng);
                let pk_x = X25519PublicKey::from(&sk_x);

                let (ct_m, mut ss_m) = ek_m.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

                let sk_e_x = StaticSecret::random_from_rng(&mut rng);
                let ct_x = X25519PublicKey::from(&sk_e_x);
                let ss_x = sk_e_x.diffie_hellman(&pk_x);

                let ss = xwing_combine_secrets(
                    ss_m.as_slice(),
                    ss_x.as_bytes(),
                    ct_x.as_bytes(),
                    pk_x.as_bytes(),
                );

                ss_m.as_mut_slice().zeroize();

                let mut ct = Vec::with_capacity(1120);
                ct.extend_from_slice(ct_m.as_slice());
                ct.extend_from_slice(ct_x.as_bytes());

                Ok((ct, ss))
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
            Self::HybridXWing => {
                let pk_m_bytes = &pk_bytes[..1184];
                let pk_x_bytes: [u8; 32] = pk_bytes[1184..1216]
                    .try_into()
                    .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
                let pk_x = X25519PublicKey::from(pk_x_bytes);

                let pk_array = ml_kem::array::Array::try_from(pk_m_bytes)
                    .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
                let ek_m = <MlKem768 as KemCore>::EncapsulationKey::from_bytes(&pk_array);
                let (ct_m, mut ss_m) = ek_m.encapsulate(&mut rng).map_err(|_| QuantaCipherError::EncapsulationFailed)?;

                let sk_e_x = StaticSecret::random_from_rng(&mut rng);
                let ct_x = X25519PublicKey::from(&sk_e_x);
                let ss_x = sk_e_x.diffie_hellman(&pk_x);

                let ss = xwing_combine_secrets(
                    ss_m.as_slice(),
                    ss_x.as_bytes(),
                    ct_x.as_bytes(),
                    pk_x.as_bytes(),
                );

                ss_m.as_mut_slice().zeroize();

                let mut ct = Vec::with_capacity(1120);
                ct.extend_from_slice(ct_m.as_slice());
                ct.extend_from_slice(ct_x.as_bytes());

                Ok((ct, ss))
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
            Self::HybridXWing => {
                let sk_m_bytes = &sk_bytes[..2400];
                let sk_x_bytes: [u8; 32] = sk_bytes[2400..2432]
                    .try_into()
                    .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
                let sk_x = StaticSecret::from(sk_x_bytes);
                let pk_x = X25519PublicKey::from(&sk_x);

                let ct_m_bytes = &ct_bytes[..1088];
                let ct_x_bytes: [u8; 32] = ct_bytes[1088..1120]
                    .try_into()
                    .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;
                let ct_x = X25519PublicKey::from(ct_x_bytes);

                let sk_array = ml_kem::array::Array::try_from(sk_m_bytes)
                    .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
                let dk_m = <MlKem768 as KemCore>::DecapsulationKey::from_bytes(&sk_array);
                let ct_array = ml_kem::array::Array::try_from(ct_m_bytes)
                    .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;
                let mut ss_m = dk_m.decapsulate(&ct_array).map_err(|_| QuantaCipherError::DecapsulationFailed)?;

                let ss_x = sk_x.diffie_hellman(&ct_x);

                let ss = xwing_combine_secrets(
                    ss_m.as_slice(),
                    ss_x.as_bytes(),
                    ct_x.as_bytes(),
                    pk_x.as_bytes(),
                );

                ss_m.as_mut_slice().zeroize();

                Ok(ss)
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
