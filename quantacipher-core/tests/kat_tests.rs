//! Official NIST ACVP Known Answer Tests (KAT) for ML-KEM (FIPS 203) and ML-DSA (FIPS 204).
//!
//! Sources: usnistgov/ACVP-Server
//! - gen-val/json-files/ML-KEM-encapDecap-FIPS203/internalProjection.json
//! - gen-val/json-files/ML-KEM-keyGen-FIPS203/internalProjection.json
//! - gen-val/json-files/ML-DSA-keyGen-FIPS204/internalProjection.json
//! - gen-val/json-files/ML-DSA-sigVer-FIPS204/internalProjection.json
//!
//! Covers every test case in each designated NIST ACVP test group:
//! - FIPS 203 ML-KEM-768 Decapsulation (all 25 test cases in ACVP Test Group 2: tcId 26–50)
//! - FIPS 203 ML-KEM-1024 Decapsulation (all 25 test cases in ACVP Test Group 3: tcId 51–75)
//! - FIPS 203 ML-KEM-768 Key Generation (all 25 test cases in ACVP KeyGen Test Group 2)
//! - FIPS 203 ML-KEM-1024 Key Generation (all 25 test cases in ACVP KeyGen Test Group 3)
//! - FIPS 204 ML-DSA-44 Key Generation & Sign/Verify (all 25 test cases in ACVP KeyGen Test Group 1)
//! - FIPS 204 ML-DSA-65 Key Generation & Sign/Verify (all 25 test cases in ACVP KeyGen Test Group 2)
//! - FIPS 204 ML-DSA-87 Key Generation & Sign/Verify (all 25 test cases in ACVP KeyGen Test Group 3)
//! - FIPS 204 ML-DSA-44 Signature Verification (all 15 test cases in ACVP SigVer Test Group 1: positive & negative)
//! - FIPS 204 ML-DSA-65 Signature Verification (all 15 test cases in ACVP SigVer Test Group 3: positive & negative)
//! - FIPS 204 ML-DSA-87 Signature Verification (all 15 test cases in ACVP SigVer Test Group 5: positive & negative)
//! Total: 220 official NIST ACVP test cases executed.

use quantacipher_core::KemAlgorithm;
use ml_kem::{MlKem768, MlKem1024, KemCore, EncodedSizeUser};
use ml_dsa::{
    MlDsa44, MlDsa65, MlDsa87,
    SigningKey, Keypair, Signer, Verifier,
    EncodedVerifyingKey, VerifyingKey, Signature,
};
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
struct KemKeygenTestCase {
    #[serde(rename = "tcId")]
    tc_id: u32,
    d: String,
    z: String,
    ek: String,
    dk: String,
}

#[derive(Deserialize)]
struct DsaKeygenTestCase {
    #[serde(rename = "tcId")]
    tc_id: u32,
    seed: String,
    pk: String,
}

#[derive(Deserialize)]
struct DsaSigVerTestCase {
    #[serde(rename = "tcId")]
    tc_id: u32,
    #[serde(rename = "testPassed")]
    test_passed: bool,
    #[allow(dead_code)]
    reason: String,
    context: String,
    message: String,
    pk: String,
    signature: String,
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
    let cases: Vec<KemKeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
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
    let cases: Vec<KemKeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
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
fn test_nist_acvp_mldsa44_all_25_keygens_and_sign_verify() {
    let raw = include_str!("data/mldsa44_acvp_keygen.json");
    let cases: Vec<DsaKeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 keygen cases in ACVP Group 1 for ML-DSA-44");

    let test_msg = b"QuantaCipher NIST ACVP ML-DSA-44 test message verification";

    for tc in cases {
        let seed_bytes = hex::decode(&tc.seed).expect("Valid seed hex");
        let seed_array = seed_bytes.as_slice().try_into().expect("32-byte seed");

        let sk = SigningKey::<MlDsa44>::from_seed(seed_array);
        let vk = sk.verifying_key();

        let pk_encoded = vk.encode();
        let pk_hex = hex::encode(pk_encoded.as_slice());

        assert_eq!(pk_hex.to_uppercase(), tc.pk.to_uppercase(), "Mismatch on ML-DSA-44 tcId {}", tc.tc_id);

        let sig = sk.sign(test_msg);
        assert!(vk.verify(test_msg, &sig).is_ok(), "Verification failed on ML-DSA-44 tcId {}", tc.tc_id);
    }
}

#[test]
fn test_nist_acvp_mldsa65_all_25_keygens_and_sign_verify() {
    let raw = include_str!("data/mldsa65_acvp_keygen.json");
    let cases: Vec<DsaKeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 keygen cases in ACVP Group 2 for ML-DSA-65");

    let test_msg = b"QuantaCipher NIST ACVP ML-DSA-65 test message verification";

    for tc in cases {
        let seed_bytes = hex::decode(&tc.seed).expect("Valid seed hex");
        let seed_array = seed_bytes.as_slice().try_into().expect("32-byte seed");

        let sk = SigningKey::<MlDsa65>::from_seed(seed_array);
        let vk = sk.verifying_key();

        let pk_encoded = vk.encode();
        let pk_hex = hex::encode(pk_encoded.as_slice());

        assert_eq!(pk_hex.to_uppercase(), tc.pk.to_uppercase(), "Mismatch on ML-DSA-65 tcId {}", tc.tc_id);

        let sig = sk.sign(test_msg);
        assert!(vk.verify(test_msg, &sig).is_ok(), "Verification failed on ML-DSA-65 tcId {}", tc.tc_id);
    }
}

#[test]
fn test_nist_acvp_mldsa87_all_25_keygens_and_sign_verify() {
    let raw = include_str!("data/mldsa87_acvp_keygen.json");
    let cases: Vec<DsaKeygenTestCase> = serde_json::from_str(raw).expect("Valid JSON");
    assert_eq!(cases.len(), 25, "Must test all 25 keygen cases in ACVP Group 3 for ML-DSA-87");

    let test_msg = b"QuantaCipher NIST ACVP ML-DSA-87 test message verification";

    for tc in cases {
        let seed_bytes = hex::decode(&tc.seed).expect("Valid seed hex");
        let seed_array = seed_bytes.as_slice().try_into().expect("32-byte seed");

        let sk = SigningKey::<MlDsa87>::from_seed(seed_array);
        let vk = sk.verifying_key();

        let pk_encoded = vk.encode();
        let pk_hex = hex::encode(pk_encoded.as_slice());

        assert_eq!(pk_hex.to_uppercase(), tc.pk.to_uppercase(), "Mismatch on ML-DSA-87 tcId {}", tc.tc_id);

        let sig = sk.sign(test_msg);
        assert!(vk.verify(test_msg, &sig).is_ok(), "Verification failed on ML-DSA-87 tcId {}", tc.tc_id);
    }
}

#[test]
fn test_nist_acvp_mldsa44_all_15_signature_verifications() {
    let raw = include_str!("data/mldsa_acvp_sigver.json");
    let map: std::collections::HashMap<String, Vec<DsaSigVerTestCase>> =
        serde_json::from_str(raw).expect("Valid JSON");

    let cases = &map["ML-DSA-44"];
    assert_eq!(cases.len(), 15, "Must test all 15 sigVer cases in ACVP Group 1 for ML-DSA-44");

    for tc in cases {
        let pk_bytes = hex::decode(&tc.pk).expect("hex pk");
        let msg_bytes = hex::decode(&tc.message).expect("hex msg");
        let ctx_bytes = hex::decode(&tc.context).expect("hex ctx");
        let sig_bytes = hex::decode(&tc.signature).expect("hex sig");

        let enc_vk: EncodedVerifyingKey<MlDsa44> = pk_bytes.as_slice().try_into().expect("pk len");
        let vk = VerifyingKey::<MlDsa44>::decode(&enc_vk);

        let sig_res = Signature::<MlDsa44>::try_from(sig_bytes.as_slice());
        let is_valid = match sig_res {
            Ok(sig) => vk.verify_with_context(&msg_bytes, &ctx_bytes, &sig),
            Err(_) => false,
        };

        assert_eq!(
            is_valid, tc.test_passed,
            "ML-DSA-44 tcId {} expected testPassed={} but got {}",
            tc.tc_id, tc.test_passed, is_valid
        );
    }
}

#[test]
fn test_nist_acvp_mldsa65_all_15_signature_verifications() {
    let raw = include_str!("data/mldsa_acvp_sigver.json");
    let map: std::collections::HashMap<String, Vec<DsaSigVerTestCase>> =
        serde_json::from_str(raw).expect("Valid JSON");

    let cases = &map["ML-DSA-65"];
    assert_eq!(cases.len(), 15, "Must test all 15 sigVer cases in ACVP Group 3 for ML-DSA-65");

    for tc in cases {
        let pk_bytes = hex::decode(&tc.pk).expect("hex pk");
        let msg_bytes = hex::decode(&tc.message).expect("hex msg");
        let ctx_bytes = hex::decode(&tc.context).expect("hex ctx");
        let sig_bytes = hex::decode(&tc.signature).expect("hex sig");

        let enc_vk: EncodedVerifyingKey<MlDsa65> = pk_bytes.as_slice().try_into().expect("pk len");
        let vk = VerifyingKey::<MlDsa65>::decode(&enc_vk);

        let sig_res = Signature::<MlDsa65>::try_from(sig_bytes.as_slice());
        let is_valid = match sig_res {
            Ok(sig) => vk.verify_with_context(&msg_bytes, &ctx_bytes, &sig),
            Err(_) => false,
        };

        assert_eq!(
            is_valid, tc.test_passed,
            "ML-DSA-65 tcId {} expected testPassed={} but got {}",
            tc.tc_id, tc.test_passed, is_valid
        );
    }
}

#[test]
fn test_nist_acvp_mldsa87_all_15_signature_verifications() {
    let raw = include_str!("data/mldsa_acvp_sigver.json");
    let map: std::collections::HashMap<String, Vec<DsaSigVerTestCase>> =
        serde_json::from_str(raw).expect("Valid JSON");

    let cases = &map["ML-DSA-87"];
    assert_eq!(cases.len(), 15, "Must test all 15 sigVer cases in ACVP Group 5 for ML-DSA-87");

    for tc in cases {
        let pk_bytes = hex::decode(&tc.pk).expect("hex pk");
        let msg_bytes = hex::decode(&tc.message).expect("hex msg");
        let ctx_bytes = hex::decode(&tc.context).expect("hex ctx");
        let sig_bytes = hex::decode(&tc.signature).expect("hex sig");

        let enc_vk: EncodedVerifyingKey<MlDsa87> = pk_bytes.as_slice().try_into().expect("pk len");
        let vk = VerifyingKey::<MlDsa87>::decode(&enc_vk);

        let sig_res = Signature::<MlDsa87>::try_from(sig_bytes.as_slice());
        let is_valid = match sig_res {
            Ok(sig) => vk.verify_with_context(&msg_bytes, &ctx_bytes, &sig),
            Err(_) => false,
        };

        assert_eq!(
            is_valid, tc.test_passed,
            "ML-DSA-87 tcId {} expected testPassed={} but got {}",
            tc.tc_id, tc.test_passed, is_valid
        );
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
