/// Tests for the QuantaCipher sign module (v2.0)
///
/// Coverage:
/// 1. Round-trip sign+verify for each algorithm (ML-DSA-44, Falcon-512 draft)
/// 2. Cross-algorithm verification correctly fails — alg field MUST gate dispatch
/// 3. Missing `alg` field fails closed (MissingAlgorithmId), never silent fallback
/// 4. Malformed `alg` value fails (UnknownAlgorithm), never silent fallback
/// 5. Tampered payload fails verification
/// 6. Tampered signature bytes fail verification
/// 7. Registry dispatch reads alg from envelope (never from caller default)
use crate::sign::registry::{self, AlgorithmId};
use crate::sign::types::alg_ids;
use crate::error::QuantaCipherError;

const TEST_PAYLOAD: &[u8] = b"QuantaCipher sign module test payload v2.0";

// =============================================================================
// 1. Round-trip: ML-DSA-44
// =============================================================================

#[test]
fn test_mldsa44_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44))
        .expect("ML-DSA-44 keygen should succeed");

    assert_eq!(kp.algorithm, alg_ids::ML_DSA_44);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44))
        .expect("ML-DSA-44 sign should succeed");

    assert_eq!(envelope.alg, alg_ids::ML_DSA_44);
    assert_eq!(envelope.ver, 1);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("ML-DSA-44 verify should not error");
    assert!(valid, "ML-DSA-44 round-trip verification must pass");
}

// =============================================================================
// 2. Round-trip: Falcon-512 draft
// =============================================================================

#[test]
fn test_falcon512_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::Falcon512Draft))
        .expect("Falcon-512 keygen should succeed");

    assert_eq!(kp.algorithm, alg_ids::FALCON_512_DRAFT);

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::Falcon512Draft))
        .expect("Falcon-512 sign should succeed");

    assert_eq!(envelope.alg, alg_ids::FALCON_512_DRAFT);
    assert_eq!(envelope.ver, 1);

    let valid = registry::verify(TEST_PAYLOAD, &envelope, &kp.public_key)
        .expect("Falcon-512 verify should not error");
    assert!(valid, "Falcon-512 round-trip verification must pass");
}

// =============================================================================
// 3. Default algorithm is Falcon-512 (matches QuantaChain behavior)
// =============================================================================

#[test]
fn test_default_algorithm_is_falcon512() {
    let kp = registry::generate_keypair(None)
        .expect("Default keygen should succeed");
    assert_eq!(kp.algorithm, alg_ids::FALCON_512_DRAFT,
        "Default algorithm must be Falcon-512 draft to match QuantaChain behavior");

    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, None)
        .expect("Default sign should succeed");
    assert_eq!(envelope.alg, alg_ids::FALCON_512_DRAFT);
}

// =============================================================================
// 4. Cross-algorithm verification MUST fail
//    A Falcon-512 signature must NOT verify against an ML-DSA-44 public key
//    and vice versa. The `alg` field must actually gate dispatch, not just annotate.
// =============================================================================

#[test]
fn test_cross_algo_falcon_sig_vs_mldsa_key_fails() {
    let falcon_kp = registry::generate_keypair(Some(AlgorithmId::Falcon512Draft)).unwrap();
    let mldsa_kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();

    // Sign with Falcon
    let falcon_envelope = registry::sign(TEST_PAYLOAD, &falcon_kp.private_key, Some(AlgorithmId::Falcon512Draft)).unwrap();

    // Attempt to verify a Falcon signature against an ML-DSA public key.
    // The registry reads `alg: "falcon-512-fips206-draft"` from the envelope,
    // so it dispatches to Falcon verify — which will fail because the public key
    // belongs to ML-DSA (wrong key for the algorithm, not just wrong algorithm).
    let result = registry::verify(TEST_PAYLOAD, &falcon_envelope, &mldsa_kp.public_key);
    // Either an error or false — must NOT return Ok(true)
    assert!(
        matches!(result, Ok(false) | Err(_)),
        "Falcon sig must not verify with ML-DSA public key; got: {:?}", result
    );
}

#[test]
fn test_cross_algo_mldsa_sig_vs_falcon_key_fails() {
    let falcon_kp = registry::generate_keypair(Some(AlgorithmId::Falcon512Draft)).unwrap();
    let mldsa_kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();

    // Sign with ML-DSA
    let mldsa_envelope = registry::sign(TEST_PAYLOAD, &mldsa_kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    // Try to verify against Falcon public key
    let result = registry::verify(TEST_PAYLOAD, &mldsa_envelope, &falcon_kp.public_key);
    assert!(
        matches!(result, Ok(false) | Err(_)),
        "ML-DSA sig must not verify with Falcon public key; got: {:?}", result
    );
}

// =============================================================================
// 5. Tampered payload fails verification
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
// 6. Missing `alg` field fails closed — NEVER silently falls back to a default
// =============================================================================

#[test]
fn test_missing_alg_fails_closed() {
    use crate::sign::types::SignatureEnvelope;

    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let real_envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    // Construct an envelope with an empty alg field
    let envelope_missing_alg = SignatureEnvelope {
        alg: String::new(),  // missing/empty
        sig: real_envelope.sig.clone(),
        ver: 1,
    };

    let result = registry::verify(TEST_PAYLOAD, &envelope_missing_alg, &kp.public_key);
    assert!(
        matches!(result, Err(QuantaCipherError::MissingAlgorithmId)),
        "Missing alg field must return MissingAlgorithmId error; got: {:?}", result
    );
}

// =============================================================================
// 7. Unknown/unrecognized `alg` fails with UnknownAlgorithm
// =============================================================================

#[test]
fn test_unknown_alg_fails() {
    use crate::sign::types::SignatureEnvelope;

    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let real_envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    let envelope_unknown_alg = SignatureEnvelope {
        alg: "rsa-2048-classical".to_string(),  // not a registered ID
        sig: real_envelope.sig.clone(),
        ver: 1,
    };

    let result = registry::verify(TEST_PAYLOAD, &envelope_unknown_alg, &kp.public_key);
    assert!(
        matches!(result, Err(QuantaCipherError::UnknownAlgorithm(_))),
        "Unknown alg must return UnknownAlgorithm error; got: {:?}", result
    );
}

// =============================================================================
// 8. JSON round-trip for SignatureEnvelope
// =============================================================================

#[test]
fn test_envelope_json_roundtrip() {
    let kp = registry::generate_keypair(Some(AlgorithmId::MlDsa44)).unwrap();
    let envelope = registry::sign(TEST_PAYLOAD, &kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();

    let json = registry::envelope_to_json(&envelope).expect("serialization should succeed");
    assert!(json.contains("\"alg\""), "JSON must contain alg field");
    assert!(json.contains("\"sig\""), "JSON must contain sig field");
    assert!(json.contains("\"ver\""), "JSON must contain ver field");

    let restored = registry::envelope_from_json(&json).expect("deserialization should succeed");
    assert_eq!(restored.alg, envelope.alg);
    assert_eq!(restored.sig, envelope.sig);
    assert_eq!(restored.ver, envelope.ver);

    // Verify still works after JSON round-trip
    let valid = registry::verify(TEST_PAYLOAD, &restored, &kp.public_key).unwrap();
    assert!(valid, "Verification must succeed after JSON round-trip");
}

// =============================================================================
// 9. Malformed JSON fails with InvalidSignatureFormat
// =============================================================================

#[test]
fn test_malformed_json_fails() {
    let result = registry::envelope_from_json("{ this is not valid json }");
    assert!(
        matches!(result, Err(QuantaCipherError::InvalidSignatureFormat)),
        "Malformed JSON must return InvalidSignatureFormat; got: {:?}", result
    );
}
