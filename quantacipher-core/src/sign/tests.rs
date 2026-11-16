use crate::sign::registry::{self, AlgorithmId};
use crate::sign::types::{alg_ids, SignatureEnvelope};
use crate::error::QuantaCipherError;
use ml_dsa::{Generate, Keypair};

const TEST_PAYLOAD: &[u8] = b"QuantaCipher sign module test payload v2.0";

// =============================================================================
// 1. Round-trip: ML-DSA-44 (V2 authenticated envelope)
// =============================================================================

#[test]
fn test_mldsa44_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44))
        .expect("ML-DSA-44 keygen should succeed");

    assert_eq!(kp.algorithm, alg_ids::ML_DSA_44);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44))
        .expect("ML-DSA-44 sign should succeed");

    assert_eq!(envelope.alg, alg_ids::ML_DSA_44);
    assert_eq!(envelope.ver, 2);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("ML-DSA-44 verify should not error");
    assert!(valid, "ML-DSA-44 round-trip verification must pass");
}

// =============================================================================
// 2. Round-trip: ML-DSA-65 (V2 authenticated envelope)
// =============================================================================

#[test]
fn test_mldsa65_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa65))
        .expect("ML-DSA-65 keygen should succeed");

    assert_eq!(kp.algorithm, alg_ids::ML_DSA_65);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa65))
        .expect("ML-DSA-65 sign should succeed");

    assert_eq!(envelope.alg, alg_ids::ML_DSA_65);
    assert_eq!(envelope.ver, 2);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("ML-DSA-65 verify should not error");
    assert!(valid, "ML-DSA-65 round-trip verification must pass");
}

// =============================================================================
// 3. Round-trip: ML-DSA-87 (V2 authenticated envelope)
// =============================================================================

#[test]
fn test_mldsa87_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa87))
        .expect("ML-DSA-87 keygen should succeed");

    assert_eq!(kp.algorithm, alg_ids::ML_DSA_87);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa87))
        .expect("ML-DSA-87 sign should succeed");

    assert_eq!(envelope.alg, alg_ids::ML_DSA_87);
    assert_eq!(envelope.ver, 2);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("ML-DSA-87 verify should not error");
    assert!(valid, "ML-DSA-87 round-trip verification must pass");
}

// =============================================================================
// 4. Round-trip: Falcon-512 draft (V2 authenticated envelope)
// =============================================================================

#[test]
fn test_falcon512_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::Falcon512Draft))
        .expect("Falcon-512 keygen should succeed");

    assert_eq!(kp.algorithm, alg_ids::FALCON_512_DRAFT);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::Falcon512Draft))
        .expect("Falcon-512 sign should succeed");

    assert_eq!(envelope.alg, alg_ids::FALCON_512_DRAFT);
    assert_eq!(envelope.ver, 2);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("Falcon-512 verify should not error");
    assert!(valid, "Falcon-512 round-trip verification must pass");
}

// =============================================================================
// 5. Default algorithm is Falcon-512
// =============================================================================

#[test]
fn test_default_algorithm_is_falcon512() {
    let kp = registry::generate_keypair(None)
        .expect("Default keygen should succeed");
    assert_eq!(kp.algorithm, alg_ids::FALCON_512_DRAFT);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, None)
        .expect("Default sign should succeed");
    assert_eq!(envelope.alg, alg_ids::FALCON_512_DRAFT);
    assert_eq!(envelope.ver, 2);
}

// =============================================================================
// 6. Backward compatibility: Legacy V1 signatures verify correctly
// =============================================================================

#[test]
fn test_legacy_v1_signature_verification() {
    use base64::{engine::general_purpose, Engine as _};
    use ml_dsa::{MlDsa44, SigningKey, Signer, signature::SignatureEncoding};

    // Generate raw key and produce raw v1 signature (signing TEST_PAYLOAD directly without QC_SIG_V2 prefix)
    let sk = SigningKey::<MlDsa44>::generate();
    let vk = sk.verifying_key();
    let sig = sk.sign(TEST_PAYLOAD);

    let v1_envelope = SignatureEnvelope {
        alg: alg_ids::ML_DSA_44.to_string(),
        sig: general_purpose::STANDARD.encode(sig.to_bytes().as_slice()),
        ver: 1, // Legacy format version 1
    };

    let pk_b64 = general_purpose::STANDARD.encode(vk.encode().as_slice());
    let valid = registry::verify(TEST_PAYLOAD, &v1_envelope, &pk_b64)
        .expect("Legacy v1 verification should succeed");
    assert!(valid, "Legacy V1 signature must verify correctly");
}

// =============================================================================
// 7. V2 envelope header authentication: Tampering with alg in envelope fails verify
// =============================================================================

#[test]
fn test_v2_envelope_tampered_alg_fails() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let mut envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    // Tamper with envelope.alg (attempting an algorithm substitution attack)
    envelope.alg = alg_ids::ML_DSA_65.to_string();

    let result = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key);
    assert!(
        matches!(result, Ok(false) | Err(_)),
        "Tampered algorithm ID in V2 envelope must fail verification"
    );
}

// =============================================================================
// 8. Cross-algorithm verification fails
// =============================================================================

#[test]
fn test_cross_algo_falcon_sig_vs_mldsa_key_fails() {
    let falcon_kp = registry::generate_keypair(Some(AlgorithmId::Falcon512Draft)).unwrap();
    let mldsa_kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();

    let falcon_envelope = registry::sign(TEST_PAYLOAD, &falcon_kp.private_key, Some(AlgorithmId::Falcon512Draft)).unwrap();
    let result = registry::verify(TEST_PAYLOAD, &falcon_envelope, &mldsa_kp.public_key);
    assert!(
        matches!(result, Ok(false) | Err(_)),
        "Falcon sig must not verify with ML-DSA public key"
    );
}

#[test]
fn test_cross_algo_mldsa_sig_vs_falcon_key_fails() {
    let falcon_kp = registry::generate_keypair(Some(AlgorithmId::Falcon512Draft)).unwrap();
    let mldsa_kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();

    let mldsa_envelope = registry::sign(TEST_PAYLOAD, &mldsa_kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();
    let result = registry::verify(TEST_PAYLOAD, &mldsa_envelope, &falcon_kp.public_key);
    assert!(
        matches!(result, Ok(false) | Err(_)),
        "ML-DSA sig must not verify with Falcon public key"
    );
}

// =============================================================================
// 9. Tampered payload fails verification
// =============================================================================

#[test]
fn test_tampered_payload_fails() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    let tampered = b"tampered payload data";
    let result = registry::verify(tampered, &envelope, &kp.public_key)
        .expect("verify call should not error on tampered payload");
    assert!(!result, "Tampered payload must fail verification");
}

// =============================================================================
// 10. Missing `alg` field fails closed
// =============================================================================

#[test]
fn test_missing_alg_fails_closed() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let real_envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    let envelope_missing_alg = SignatureEnvelope {
        alg: String::new(),
        sig: real_envelope.sig.clone(),
        ver: 2,
    };

    let result = registry::verify(TEST_PAYLOAD, &envelope_missing_alg, &kp.public_key);
    assert!(
        matches!(result, Err(QuantaCipherError::MissingAlgorithmId)),
        "Explicitly empty alg field must return MissingAlgorithmId error"
    );
}

// =============================================================================
// 11. Unknown `alg` fails with UnknownAlgorithm
// =============================================================================

#[test]
fn test_unknown_alg_fails() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let real_envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    let envelope_unknown_alg = SignatureEnvelope {
        alg: "rsa-2048-classical".to_string(),
        sig: real_envelope.sig.clone(),
        ver: 2,
    };

    let result = registry::verify(TEST_PAYLOAD, &envelope_unknown_alg, &kp.public_key);
    assert!(
        matches!(result, Err(QuantaCipherError::UnknownAlgorithm(_))),
        "Unknown alg must return UnknownAlgorithm error"
    );
}

// =============================================================================
// 12. JSON round-trip for SignatureEnvelope
// =============================================================================

#[test]
fn test_envelope_json_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    let json = registry::envelope_to_json(&envelope).expect("serialization should succeed");
    assert!(json.contains("\"alg\""));
    assert!(json.contains("\"sig\""));
    assert!(json.contains("\"ver\""));

    let restored = registry::envelope_from_json(&json).expect("deserialization should succeed");
    assert_eq!(restored.alg, envelope.alg);
    assert_eq!(restored.sig, envelope.sig);
    assert_eq!(restored.ver, envelope.ver);

    let valid = registry::verify(TEST_PAYLOAD, &restored, &kp.public_key).unwrap();
    assert!(valid, "Verification must succeed after JSON round-trip");
}

// =============================================================================
// 13. Malformed JSON fails with InvalidSignatureFormat
// =============================================================================

#[test]
fn test_malformed_json_fails() {
    let result = registry::envelope_from_json("{ this is not valid json }");
    assert!(
        matches!(result, Err(QuantaCipherError::InvalidSignatureFormat)),
        "Malformed JSON must return InvalidSignatureFormat"
    );
}

// =============================================================================
// 14. TEC 910018:2025 Figure 3: Hybrid ML-DSA-65 + ECDSA P-256 Tests
// =============================================================================

#[test]
fn test_hybrid_mldsa65_p256_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::HybridMlDsa65P256))
        .expect("Hybrid keygen should succeed");
    assert_eq!(kp.algorithm, alg_ids::HYBRID_ML_DSA_65_P256);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::HybridMlDsa65P256))
        .expect("Hybrid sign should succeed");
    assert_eq!(envelope.alg, alg_ids::HYBRID_ML_DSA_65_P256);
    assert_eq!(envelope.ver, 2);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("Hybrid verify should succeed");
    assert!(valid, "Valid hybrid signature must verify correctly");
}

#[test]
fn test_hybrid_mldsa65_p256_corrupt_payload_fails() {
    let kp = registry::generate_keypair(Some(AlgorithmId::HybridMlDsa65P256)).unwrap();
    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::HybridMlDsa65P256)).unwrap();

    let valid = registry::verify(b"corrupted payload", &envelope, &kp.public_key).unwrap();
    assert!(!valid, "Verification with modified payload must return false");
}

#[test]
fn test_hybrid_mldsa65_p256_tamper_classical_fails() {
    use base64::{engine::general_purpose, Engine as _};
    let kp = registry::generate_keypair(Some(AlgorithmId::HybridMlDsa65P256)).unwrap();
    let mut envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::HybridMlDsa65P256)).unwrap();

    // Tamper with the classical ECDSA signature portion (last 64 bytes)
    let mut sig_bytes = general_purpose::STANDARD.decode(&envelope.sig).unwrap();
    let len = sig_bytes.len();
    sig_bytes[len - 1] ^= 0xFF;
    envelope.sig = general_purpose::STANDARD.encode(&sig_bytes);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key).unwrap();
    assert!(!valid, "Tampering with classical ECDSA component must fail verification (non-separability)");
}

#[test]
fn test_hybrid_mldsa65_p256_tamper_pqc_fails() {
    use base64::{engine::general_purpose, Engine as _};
    let kp = registry::generate_keypair(Some(AlgorithmId::HybridMlDsa65P256)).unwrap();
    let mut envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::HybridMlDsa65P256)).unwrap();

    // Tamper with the ML-DSA-65 signature portion (first 3309 bytes)
    let mut sig_bytes = general_purpose::STANDARD.decode(&envelope.sig).unwrap();
    sig_bytes[0] ^= 0xFF;
    envelope.sig = general_purpose::STANDARD.encode(&sig_bytes);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key).unwrap();
    assert!(!valid, "Tampering with PQC ML-DSA-65 component must fail verification");
}

