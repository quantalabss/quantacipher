use quantacipher_core::{
    generate_keypair_for_alg, secure_encrypt,
    secure_decrypt_with_policy,
    KemAlgorithm, SecurityPolicy, QuantaCipherError,
    sign::registry as sign_registry,
    sign::types::SignatureEnvelope,
};
use base64::{engine::general_purpose, Engine as _};

#[test]
fn test_downgrade_kem_ciphertext_rejected_when_level5_required() {
    // Recipient generates Level 3 (ML-KEM-768) keypair
    let (pk768, sk768) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let message = "Downgrade Attempt Target Data";

    // Encrypted in ML-KEM-768 (Level 3)
    let ct_level3 = secure_encrypt(message, &pk768).unwrap();
    assert!(ct_level3.starts_with("QZ_SECURE_V2:ml-kem-768:"));

    // Recipient with Policy High (min_level: 5) MUST reject the Level 3 ciphertext
    let high_policy = SecurityPolicy::high();
    let res = secure_decrypt_with_policy(&ct_level3, &sk768, &high_policy);

    match res {
        Err(QuantaCipherError::SecurityLevelBelowMinimum { actual, minimum }) => {
            assert_eq!(actual, 3);
            assert_eq!(minimum, 5);
        }
        other => panic!("Expected SecurityLevelBelowMinimum, got {:?}", other),
    }

    // However, with Standard Policy (min_level: 3), decryption succeeds!
    let std_policy = SecurityPolicy::standard();
    let decrypted = secure_decrypt_with_policy(&ct_level3, &sk768, &std_policy)
        .expect("Decryption must succeed when actual level meets policy");
    assert_eq!(decrypted, message);
}

#[test]
fn test_downgrade_tampered_header_alg_fails_aad() {
    let (pk1024, sk1024) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();
    let message = "Sensitive Financial Transfer Instructions";
    let ct_level5 = secure_encrypt(message, &pk1024).unwrap();

    // Attacker modifies the envelope header from ml-kem-1024 to ml-kem-768
    let tampered_ct = ct_level5.replace("QZ_SECURE_V2:ml-kem-1024:", "QZ_SECURE_V2:ml-kem-768:");

    // Even under permissive policy, decryption MUST fail because the header is bound in AES-GCM AAD
    let res = secure_decrypt_with_policy(&tampered_ct, &sk1024, &SecurityPolicy::permissive());
    assert!(res.is_err(), "Tampered header must trigger AAD authentication failure");
}

#[test]
fn test_strict_policy_rejects_legacy_v1_payloads() {
    // Generate legacy V1 payload using ML-KEM-1024
    use ml_kem::{MlKem1024, KemCore, EncodedSizeUser};
    use ml_kem::kem::Encapsulate;
    use aes_gcm::{Aes256Gcm, Key, aead::{Aead, KeyInit}};
    use hkdf::Hkdf;
    use sha2::Sha256;
    use zeroize::Zeroize;

    let mut rng = rand::rngs::OsRng;
    let (dk, ek) = MlKem1024::generate(&mut rng);
    let sk_b64 = general_purpose::STANDARD.encode(dk.as_bytes().as_slice());

    let (ct, mut ss) = ek.encapsulate(&mut rng).unwrap();
    let header = b"QZ_SECURE_V1:";
    let mut context_info = Vec::new();
    context_info.extend_from_slice(header);
    context_info.extend_from_slice(ct.as_slice());

    let hkdf = Hkdf::<Sha256>::new(None, ss.as_slice());
    let mut okm = [0u8; 32];
    hkdf.expand(&context_info, &mut okm).unwrap();
    let key = Key::<Aes256Gcm>::from_slice(&okm).clone();
    okm.zeroize();
    ss.as_mut_slice().zeroize();

    let cipher = Aes256Gcm::new(&key);
    let nonce = aes_gcm::Nonce::from_slice(&[4u8; 12]);
    let message = "Archived Vault Record from 2024";
    let aes_ct = cipher.encrypt(nonce, message.as_bytes()).unwrap();

    let legacy_v1_payload = format!(
        "QZ_SECURE_V1:{}:{}:{}",
        general_purpose::STANDARD.encode(ct.as_slice()),
        general_purpose::STANDARD.encode(nonce.as_slice()),
        general_purpose::STANDARD.encode(&aes_ct),
    );

    // Standard high policy allows legacy payloads (level 5)
    let ok = secure_decrypt_with_policy(&legacy_v1_payload, &sk_b64, &SecurityPolicy::high());
    assert_eq!(ok.unwrap(), message);

    // Strict high policy explicitly rejects legacy unversioned payloads!
    let strict_policy = SecurityPolicy::strict_high();
    let res = secure_decrypt_with_policy(&legacy_v1_payload, &sk_b64, &strict_policy);
    assert!(matches!(res, Err(QuantaCipherError::LegacyPayloadRejected)));
}

#[test]
fn test_downgrade_signature_rejected_when_level5_required() {
    let payload = b"Approved Wire Transfer: $10,000,000";

    // Sign with ML-DSA-65 (NIST Level 3)
    let kp_level3 = sign_registry::generate_keypair(Some(sign_registry::AlgorithmId::MlDsa65)).unwrap();
    let sig_level3 = sign_registry::sign(payload, &kp_level3.private_key, Some(sign_registry::AlgorithmId::MlDsa65)).unwrap();

    // Verifier requiring Level 5 (High Policy) MUST reject the Level 3 signature
    let high_policy = SecurityPolicy::high();
    let res = sign_registry::verify_with_policy(payload, &sig_level3, &kp_level3.public_key, &high_policy);

    match res {
        Err(QuantaCipherError::SecurityLevelBelowMinimum { actual, minimum }) => {
            assert_eq!(actual, 3);
            assert_eq!(minimum, 5);
        }
        other => panic!("Expected SecurityLevelBelowMinimum, got {:?}", other),
    }

    // Sign with ML-DSA-87 (NIST Level 5)
    let kp_level5 = sign_registry::generate_keypair(Some(sign_registry::AlgorithmId::MlDsa87)).unwrap();
    let sig_level5 = sign_registry::sign(payload, &kp_level5.private_key, Some(sign_registry::AlgorithmId::MlDsa87)).unwrap();

    // Verifier requiring Level 5 accepts Level 5 signature
    let ok = sign_registry::verify_with_policy(payload, &sig_level5, &kp_level5.public_key, &high_policy);
    assert!(ok.unwrap());
}

#[test]
fn test_downgrade_signature_tampered_alg_fails() {
    let payload = b"Immutable Governance Resolution";

    // Sign with ML-DSA-87 (Level 5)
    let kp = sign_registry::generate_keypair(Some(sign_registry::AlgorithmId::MlDsa87)).unwrap();
    let sig = sign_registry::sign(payload, &kp.private_key, Some(sign_registry::AlgorithmId::MlDsa87)).unwrap();

    // Attacker modifies alg field to ml-dsa-65
    let mut tampered_sig = sig.clone();
    tampered_sig.alg = "ml-dsa-65".to_string();

    // Verification must fail because the envelope is cryptographically bound into the signed message
    let res = sign_registry::verify(payload, &tampered_sig, &kp.public_key);
    assert!(res.is_err() || !res.unwrap(), "Tampered alg in envelope must fail signature verification");
}

#[test]
fn test_strict_policy_rejects_legacy_signatures() {
    let payload = b"Legacy Document from 2025";

    // Create a legacy V1 signature envelope (ver: 1)
    let legacy_envelope = SignatureEnvelope {
        alg: "falcon-512-fips206-draft".to_string(),
        sig: "AA==".to_string(), // dummy signature
        ver: 1,
    };

    let strict_policy = SecurityPolicy::strict_high();
    let res = sign_registry::verify_with_policy(payload, &legacy_envelope, "AA==", &strict_policy);
    assert!(matches!(res, Err(QuantaCipherError::LegacyPayloadRejected)));
}

#[test]
fn test_header_overrides_key_length_and_rejects_mismatch() {
    // 1. Ciphertext header says ml-kem-1024, but caller provides an ml-kem-768 key:
    let (pk1024, _sk1024) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();
    let (_pk768, sk768) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let ct_1024 = secure_encrypt("Secret 1024", &pk1024).unwrap();
    assert!(ct_1024.starts_with("QZ_SECURE_V2:ml-kem-1024:"));

    let res = quantacipher_core::secure_decrypt(&ct_1024, &sk768);
    match res {
        Err(QuantaCipherError::InvalidPrivateKeyLength) => (),
        other => panic!("Expected InvalidPrivateKeyLength when key length doesn't match header alg, got {:?}", other),
    }

    // 2. Ciphertext header says ml-kem-768, but caller provides an ml-kem-1024 key:
    let (pk768, _sk768) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let (_pk1024, sk1024) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();
    let ct_768 = secure_encrypt("Secret 768", &pk768).unwrap();
    assert!(ct_768.starts_with("QZ_SECURE_V2:ml-kem-768:"));

    let res = quantacipher_core::secure_decrypt(&ct_768, &sk1024);
    match res {
        Err(QuantaCipherError::InvalidPrivateKeyLength) => (),
        other => panic!("Expected InvalidPrivateKeyLength when key length doesn't match header alg, got {:?}", other),
    }
}
