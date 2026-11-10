use quantacipher_core::{
    generate_keypair_for_alg, generate_keypair_for_profile,
    secure_encrypt_for_alg, secure_decrypt,
    rewrap_secure, rewrap_secure_with_policy, rewrap_secure_report,
    rewrap_vault, rewrap_vault_for_profile,
    KemAlgorithm, SecurityProfile, SecurityPolicy, QuantaCipherError,
};
use base64::{engine::general_purpose, Engine as _};
use aes_gcm::KeyInit;

#[test]
fn test_rewrap_legacy_v1_to_mlkem1024() {
    let (old_pk, old_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();
    let (new_pk, new_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();

    let secret = "Patient medical history record — HIPAA compliance migration";

    // Simulate legacy V1 ciphertext format: QZ_SECURE_V1:{kem_ct}:{nonce}:{aes_ct}
    // We can generate one using the legacy format logic:
    let (ct, ss) = KemAlgorithm::MlKem1024.encapsulate(&general_purpose::STANDARD.decode(&old_pk).unwrap()).unwrap();
    let header = b"QZ_SECURE_V1:";
    let mut ctx = Vec::new();
    ctx.extend_from_slice(header);
    ctx.extend_from_slice(&ct);
    let aes_key = quantacipher_core::envelope::derive_aes_key(&ss, &ctx).unwrap();
    let cipher = aes_gcm::Aes256Gcm::new(&aes_key);
    let nonce_bytes = [7u8; 12];
    let nonce = aes_gcm::Nonce::from_slice(&nonce_bytes);
    use aes_gcm::aead::Aead;
    let aes_ct = cipher.encrypt(nonce, secret.as_bytes()).unwrap();

    let legacy_v1_ct = format!(
        "QZ_SECURE_V1:{}:{}:{}",
        general_purpose::STANDARD.encode(&ct),
        general_purpose::STANDARD.encode(nonce_bytes),
        general_purpose::STANDARD.encode(&aes_ct)
    );
    assert!(legacy_v1_ct.starts_with("QZ_SECURE_V1:"));

    // Re-wrap to new Level 5 public key
    let upgraded_ct = rewrap_secure(&legacy_v1_ct, &old_sk, &new_pk)
        .expect("Re-wrapping legacy V1 ciphertext must succeed");

    assert!(upgraded_ct.starts_with("QZ_SECURE_V2:ml-kem-1024:"));

    // Decrypt with new private key
    let decrypted = secure_decrypt(&upgraded_ct, &new_sk).expect("Decryption under new key must succeed");
    assert_eq!(decrypted, secret);

    // Old private key must no longer be able to decrypt the upgraded ciphertext
    assert!(secure_decrypt(&upgraded_ct, &old_sk).is_err());
}

#[test]
fn test_rewrap_level3_to_hybrid_xwing() {
    let (std_pk, std_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let (hybrid_pk, hybrid_sk) = generate_keypair_for_profile(SecurityProfile::Hybrid).unwrap();

    let secret = "Top-secret financial transaction migrating from Level 3 to Hybrid X-Wing";

    // Create Level 3 ciphertext
    let level3_ct = secure_encrypt_for_alg(secret, &std_pk, KemAlgorithm::MlKem768).unwrap();
    assert!(level3_ct.starts_with("QZ_SECURE_V2:ml-kem-768:"));

    // Re-wrap from Level 3 to Hybrid X-Wing
    let report = rewrap_secure_report(&level3_ct, &std_sk, &hybrid_pk, &SecurityPolicy::permissive())
        .expect("Re-wrapping to Hybrid X-Wing must succeed");

    assert_eq!(report.source_algorithm, "ml-kem-768");
    assert_eq!(report.target_algorithm, "hybrid-xwing");
    assert_eq!(report.source_nist_level, 3);
    assert_eq!(report.target_nist_level, 3);
    assert!(!report.was_legacy);
    assert!(report.new_ciphertext.starts_with("QZ_SECURE_V2:hybrid-xwing:"));

    // Decrypt using hybrid private key
    let decrypted = secure_decrypt(&report.new_ciphertext, &hybrid_sk).unwrap();
    assert_eq!(decrypted, secret);
}

#[test]
fn test_rewrap_level3_to_level5() {
    let (std_pk, std_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let (high_pk, high_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();

    let secret = "Classified intelligence brief upgrading to NIST Level 5";
    let level3_ct = secure_encrypt_for_alg(secret, &std_pk, KemAlgorithm::MlKem768).unwrap();

    // Re-wrap to Level 5
    let level5_ct = rewrap_secure(&level3_ct, &std_sk, &high_pk)
        .expect("Re-wrapping from Level 3 to Level 5 must succeed");

    assert!(level5_ct.starts_with("QZ_SECURE_V2:ml-kem-1024:"));

    let decrypted = secure_decrypt(&level5_ct, &high_sk).unwrap();
    assert_eq!(decrypted, secret);
}

#[test]
fn test_rewrap_policy_enforcement() {
    let (std_pk, std_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let (high_pk, high_sk) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();

    let secret = "Policy downgrade protection during rewrap";
    let level3_ct = secure_encrypt_for_alg(secret, &std_pk, KemAlgorithm::MlKem768).unwrap();
    let level5_ct = secure_encrypt_for_alg(secret, &high_pk, KemAlgorithm::MlKem1024).unwrap();

    // Policy requires Level 5
    let strict_policy = SecurityPolicy::new(5, true);

    // 1. Attempting to re-wrap to a Level 3 target is REJECTED by policy
    let err = rewrap_secure_with_policy(&level5_ct, &high_sk, &std_pk, &strict_policy)
        .expect_err("Rewrapping to Level 3 when Level 5 is required must fail");
    match err {
        QuantaCipherError::SecurityLevelBelowMinimum { actual, minimum } => {
            assert_eq!(actual, 3);
            assert_eq!(minimum, 5);
        }
        other => panic!("Expected SecurityLevelBelowMinimum, got: {:?}", other),
    }

    // 2. Upgrading from Level 3 to Level 5 with policy permissive on source but enforcing Level 5 target succeeds
    let upgraded = rewrap_secure_with_policy(&level3_ct, &std_sk, &high_pk, &SecurityPolicy::permissive())
        .expect("Upgrading to Level 5 must succeed");
    assert!(upgraded.starts_with("QZ_SECURE_V2:ml-kem-1024:"));
}

#[test]
fn test_rewrap_vault() {
    let payload = "Permanent audit log record";
    let original_vault = quantacipher_core::vault_encrypt(payload).unwrap();
    assert!(original_vault.starts_with("QZ_VAULT_V2:ml-kem-1024:"));

    // Super-encrypt / re-wrap vault record inside Hybrid X-Wing envelope
    let rewrapped_vault = rewrap_vault(&original_vault, KemAlgorithm::HybridXWing)
        .expect("Vault rewrap must succeed");

    assert!(rewrapped_vault.starts_with("QZ_VAULT_V2:hybrid-xwing:"));

    // Profile-based vault rewrap
    let profile_rewrapped = rewrap_vault_for_profile(&original_vault, SecurityProfile::Standard)
        .expect("Profile vault rewrap must succeed");

    assert!(profile_rewrapped.starts_with("QZ_VAULT_V2:ml-kem-768:"));
}
