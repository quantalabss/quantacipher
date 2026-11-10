//! Official NIST ACVP Known Answer Tests (KAT) for ML-KEM (FIPS 203).
//!
//! Source: usnistgov/ACVP-Server
//! - gen-val/json-files/ML-KEM-encapDecap-FIPS203/internalProjection.json
//! - gen-val/json-files/ML-KEM-keyGen-FIPS203/internalProjection.json
//!
//! Covers every test case in each designated NIST ACVP test group:
//! - FIPS 203 ML-KEM-768 Decapsulation (all 25 test cases in ACVP Test Group 2: tcId 26–50)
//! - FIPS 203 ML-KEM-1024 Decapsulation (all 25 test cases in ACVP Test Group 3: tcId 51–75)
//! - FIPS 203 ML-KEM-768 Key Generation (all 25 test cases in ACVP KeyGen Test Group 2)
//! - FIPS 203 ML-KEM-1024 Key Generation (all 25 test cases in ACVP KeyGen Test Group 3)

use quantacipher_core::KemAlgorithm;
use ml_kem::{MlKem768, MlKem1024, KemCore, EncodedSizeUser};
use rand::{RngCore, CryptoRng};
use serde::Deserialize;

#[derive(Deserialize)]
struct DecapTestCase {
    #[serde(rename = "tcId")]
    tc_id: u32,
    dk: String,
    c: String,
    k: String,
}

#[derive(Deserialize)]
struct KeygenTestCase {
    #[serde(rename = "tcId")]
    tc_id: u32,
    d: String,
    z: String,
    ek: String,
    dk: String,
}

/// Mock RNG to supply deterministic entropy (d || z) for ACVP KeyGen tests.
struct SeedRng {
    bytes: Vec<u8>,
    pos: usize,
}

impl SeedRng {
    fn from_d_and_z(d_hex: &str, z_hex: &str) -> Self {
        let mut bytes = hex::decode(d_hex).expect("Valid d hex");
        bytes.extend_from_slice(&hex::decode(z_hex).expect("Valid z hex"));
        Self { bytes, pos: 0 }
    }
}

impl RngCore for SeedRng {
    fn next_u32(&mut self) -> u32 {
        let mut b = [0u8; 4];
        self.fill_bytes(&mut b);
        u32::from_le_bytes(b)
    }
    fn next_u64(&mut self) -> u64 {
        let mut b = [0u8; 8];
        self.fill_bytes(&mut b);
        u64::from_le_bytes(b)
    }
    fn fill_bytes(&mut self, dest: &mut [u8]) {
        let remaining = self.bytes.len().saturating_sub(self.pos);
        let to_copy = dest.len().min(remaining);
        dest[..to_copy].copy_from_slice(&self.bytes[self.pos..self.pos + to_copy]);
        self.pos += to_copy;
    }
    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand::Error> {
        self.fill_bytes(dest);
        Ok(())
    }
}

impl CryptoRng for SeedRng {}

#[test]
fn test_nist_acvp_mlkem768_all_25_decapsulations() {
    let raw = include_str!("data/mlkem768_acvp_decap.json");
    let cases: Vec<DecapTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 cases in ACVP Group 2");

    for tc in cases {
        let dk_bytes = hex::decode(&tc.dk).expect("Valid dk hex");
        let c_bytes = hex::decode(&tc.c).expect("Valid c hex");

        assert_eq!(dk_bytes.len(), KemAlgorithm::MlKem768.private_key_len());
        assert_eq!(c_bytes.len(), KemAlgorithm::MlKem768.ciphertext_len());

        let shared_secret = KemAlgorithm::MlKem768
            .decapsulate(&dk_bytes, &c_bytes)
            .unwrap_or_else(|e| panic!("Decapsulation failed on tcId {}: {:?}", tc.tc_id, e));

        let shared_secret_hex = hex::encode(shared_secret.as_slice());
        assert_eq!(shared_secret_hex, tc.k.to_lowercase(), "Mismatch on tcId {}", tc.tc_id);
    }
}

#[test]
fn test_nist_acvp_mlkem1024_all_25_decapsulations() {
    let raw = include_str!("data/mlkem1024_acvp_decap.json");
    let cases: Vec<DecapTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 cases in ACVP Group 3");

    for tc in cases {
        let dk_bytes = hex::decode(&tc.dk).expect("Valid dk hex");
        let c_bytes = hex::decode(&tc.c).expect("Valid c hex");

        assert_eq!(dk_bytes.len(), KemAlgorithm::MlKem1024.private_key_len());
        assert_eq!(c_bytes.len(), KemAlgorithm::MlKem1024.ciphertext_len());

        let shared_secret = KemAlgorithm::MlKem1024
            .decapsulate(&dk_bytes, &c_bytes)
            .unwrap_or_else(|e| panic!("Decapsulation failed on tcId {}: {:?}", tc.tc_id, e));

        let shared_secret_hex = hex::encode(shared_secret.as_slice());
        assert_eq!(shared_secret_hex, tc.k.to_lowercase(), "Mismatch on tcId {}", tc.tc_id);
    }
}

#[test]
fn test_nist_acvp_mlkem768_all_25_keygens() {
    let raw = include_str!("data/mlkem768_acvp_keygen.json");
    let cases: Vec<KeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 keygen cases in ACVP Group 2");

    for tc in cases {
        let mut rng = SeedRng::from_d_and_z(&tc.d, &tc.z);
        let (dk, ek) = MlKem768::generate(&mut rng);

        let dk_hex = hex::encode(dk.as_bytes());
        let ek_hex = hex::encode(ek.as_bytes());

        assert_eq!(ek_hex.to_uppercase(), tc.ek.to_uppercase(), "EK mismatch on keygen tcId {}", tc.tc_id);
        assert_eq!(dk_hex.to_uppercase(), tc.dk.to_uppercase(), "DK mismatch on keygen tcId {}", tc.tc_id);
    }
}

#[test]
fn test_nist_acvp_mlkem1024_all_25_keygens() {
    let raw = include_str!("data/mlkem1024_acvp_keygen.json");
    let cases: Vec<KeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 keygen cases in ACVP Group 3");

    for tc in cases {
        let mut rng = SeedRng::from_d_and_z(&tc.d, &tc.z);
        let (dk, ek) = MlKem1024::generate(&mut rng);

        let dk_hex = hex::encode(dk.as_bytes());
        let ek_hex = hex::encode(ek.as_bytes());

        assert_eq!(ek_hex.to_uppercase(), tc.ek.to_uppercase(), "EK mismatch on keygen tcId {}", tc.tc_id);
        assert_eq!(dk_hex.to_uppercase(), tc.dk.to_uppercase(), "DK mismatch on keygen tcId {}", tc.tc_id);
    }
}

#[test]
fn test_algorithm_registry_metadata() {
    assert_eq!(KemAlgorithm::MlKem768.as_str(), "ml-kem-768");
    assert_eq!(KemAlgorithm::MlKem1024.as_str(), "ml-kem-1024");
    assert_eq!(KemAlgorithm::MlKem768.public_key_len(), 1184);
    assert_eq!(KemAlgorithm::MlKem1024.public_key_len(), 1568);
    assert_eq!(KemAlgorithm::MlKem768.private_key_len(), 2400);
    assert_eq!(KemAlgorithm::MlKem1024.private_key_len(), 3168);
    assert_eq!(KemAlgorithm::MlKem768.ciphertext_len(), 1088);
    assert_eq!(KemAlgorithm::MlKem1024.ciphertext_len(), 1568);
    assert_eq!(KemAlgorithm::MlKem768.nist_level(), 3);
    assert_eq!(KemAlgorithm::MlKem1024.nist_level(), 5);
}
