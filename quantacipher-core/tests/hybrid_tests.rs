use quantacipher_core::{
    generate_keypair_for_alg, generate_keypair_for_profile,
    vault_encrypt_for_alg, secure_encrypt, secure_decrypt, secure_decrypt_with_policy,
    KemAlgorithm, SecurityProfile, SecurityPolicy,
    registry::{xwing_combine_secrets, XWING_LABEL, kem_ids},
};
use base64::{engine::general_purpose, Engine as _};
use sha3::{Digest, Sha3_256};

#[test]
fn test_xwing_combiner_spec_domain_separation() {
    // Verify exact CFRG draft label bytes: \.//^\ (ASCII \./ + /^\)
    assert_eq!(XWING_LABEL, &[0x5c, 0x2e, 0x2f, 0x2f, 0x5e, 0x5c]);

    let ss_m = [0x11u8; 32];
    let ss_x = [0x22u8; 32];
    let ct_x = [0x33u8; 32];
    let pk_x = [0x44u8; 32];

    let combined = xwing_combine_secrets(&ss_m, &ss_x, &ct_x, &pk_x);

    // Direct manual SHA3-256 calculation to verify exact RFC formula
    let mut hasher = Sha3_256::new();
    hasher.update(&ss_m);
    hasher.update(&ss_x);
    hasher.update(&ct_x);
    hasher.update(&pk_x);
    hasher.update(&[0x5c, 0x2e, 0x2f, 0x2f, 0x5e, 0x5c]);
    let expected = hasher.finalize();

    assert_eq!(combined.as_slice(), expected.as_slice());
}

#[test]
fn test_hybrid_xwing_metadata_and_lengths() {
    let alg = KemAlgorithm::HybridXWing;
    assert_eq!(alg.id(), kem_ids::HYBRID_XWING);
    assert_eq!(alg.id(), "hybrid-xwing");
    assert_eq!(alg.nist_level(), 3);
    assert_eq!(alg.public_key_len(), 1216); // 1184 (ML-KEM-768) + 32 (X25519)
    assert_eq!(alg.secret_key_len(), 2432); // 2400 (ML-KEM-768) + 32 (X25519)
    assert_eq!(alg.ciphertext_len(), 1120); // 1088 (ML-KEM-768) + 32 (X25519)

    // Key auto-detection by length
    assert_eq!(KemAlgorithm::from_public_key_len(1216).unwrap(), KemAlgorithm::HybridXWing);
    assert_eq!(KemAlgorithm::from_secret_key_len(2432).unwrap(), KemAlgorithm::HybridXWing);

    // Profile mapping
    let profile = SecurityProfile::Hybrid;
    assert_eq!(profile.kem_algorithm(), KemAlgorithm::HybridXWing);
    assert_eq!(profile.nist_level(), 3);
}

#[test]
fn test_hybrid_xwing_keygen_and_raw_encap_decap() {
    let alg = KemAlgorithm::HybridXWing;
    let (pk_b64, sk_b64) = alg.generate_keypair().expect("Hybrid keygen failed");

    let pk_bytes = general_purpose::STANDARD.decode(&pk_b64).unwrap();
    let sk_bytes = general_purpose::STANDARD.decode(&sk_b64).unwrap();

    assert_eq!(pk_bytes.len(), 1216);
    assert_eq!(sk_bytes.len(), 2432);

    // Encapsulate
    let (ct_bytes, ss_encap) = alg.encapsulate(&pk_bytes).expect("Hybrid encapsulation failed");
    assert_eq!(ct_bytes.len(), 1120);

    // Decapsulate
    let ss_decap = alg.decapsulate(&sk_bytes, &ct_bytes).expect("Hybrid decapsulation failed");

    // Shared secrets must match exactly
    assert_eq!(ss_encap.as_slice(), ss_decap.as_slice());
}

#[test]
fn test_hybrid_xwing_vault_encrypt() {
    let plaintext = "Vault confidential records sealed under Hybrid X-Wing";

    // Direct algorithm vault encryption
    let ct_alg = vault_encrypt_for_alg(plaintext, KemAlgorithm::HybridXWing)
        .expect("Vault encrypt for alg failed");
    assert!(ct_alg.starts_with("QZ_VAULT_V2:hybrid-xwing:"), "Invalid envelope: {}", ct_alg);

    // Profile-based vault encryption
    let ct_prof = SecurityProfile::Hybrid.vault_encrypt(plaintext)
        .expect("Vault encrypt for profile failed");
    assert!(ct_prof.starts_with("QZ_VAULT_V2:hybrid-xwing:"), "Invalid envelope: {}", ct_prof);
}

#[test]
fn test_hybrid_xwing_secure_encrypt_decrypt_roundtrip() {
    // Generate keypair via Profile API
    let (pk_b64, sk_b64) = generate_keypair_for_profile(SecurityProfile::Hybrid)
        .expect("Hybrid keypair generation failed");

    let secret_message = "Hybrid X-Wing post-quantum zero-trust plaintext payload";

    // Auto-detects KemAlgorithm::HybridXWing from 1216-byte public key length!
    let ciphertext = secure_encrypt(secret_message, &pk_b64)
        .expect("Hybrid secure encrypt failed");

    assert!(ciphertext.starts_with("QZ_SECURE_V2:hybrid-xwing:"));

    // Decrypt locally
    let decrypted = secure_decrypt(&ciphertext, &sk_b64)
        .expect("Hybrid secure decrypt failed");

    assert_eq!(decrypted, secret_message);
}

#[test]
fn test_hybrid_xwing_tamper_and_downgrade_protection() {
    let (pk_b64, sk_b64) = generate_keypair_for_alg(KemAlgorithm::HybridXWing).unwrap();
    let message = "Tamper detection test message";
    let ciphertext = secure_encrypt(message, &pk_b64).unwrap();

    // 1. Altering algorithm in envelope header triggers AAD tag verification failure
    let tampered_alg = ciphertext.replace("QZ_SECURE_V2:hybrid-xwing:", "QZ_SECURE_V2:ml-kem-1024:");
    assert!(secure_decrypt(&tampered_alg, &sk_b64).is_err());

    // 2. Corrupting ciphertext body fails
    let mut corrupted = ciphertext.clone();
    let last_char = corrupted.pop().unwrap();
    let replacement = if last_char == 'A' { 'B' } else { 'A' };
    corrupted.push(replacement);
    assert!(secure_decrypt(&corrupted, &sk_b64).is_err());

    // 3. SecurityPolicy enforcement:
    // Level 3 requirement -> Hybrid X-Wing has Level 3 PQ hardness, so it passes!
    let level3_policy = SecurityPolicy::new(3, true);
    let decrypted = secure_decrypt_with_policy(&ciphertext, &sk_b64, &level3_policy)
        .expect("Level 3 policy should accept Hybrid X-Wing");
    assert_eq!(decrypted, message);

    // Level 5 requirement -> Hybrid X-Wing is based on ML-KEM-768 (Level 3), so it must be REJECTED to prevent downgrade!
    let strict_level5_policy = SecurityPolicy::new(5, true);
    let err = secure_decrypt_with_policy(&ciphertext, &sk_b64, &strict_level5_policy)
        .expect_err("Level 5 policy must reject Level 3 Hybrid X-Wing");
    match err {
        quantacipher_core::QuantaCipherError::SecurityLevelBelowMinimum { actual, minimum } => {
            assert_eq!(actual, 3);
            assert_eq!(minimum, 5);
        }
        other => panic!("Expected SecurityLevelBelowMinimum, got: {:?}", other),
    }
}
