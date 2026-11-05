use quantacipher_core::{
    generate_keypair, generate_keypair_for_alg,
    vault_encrypt, vault_encrypt_for_alg,
    secure_encrypt, secure_decrypt,
    KemAlgorithm,
};
use ml_kem::EncodedSizeUser;
use base64::{engine::general_purpose, Engine as _};

#[test]
fn test_default_keypair_is_mlkem1024() {
    let (pk, sk) = generate_keypair().expect("Default keygen should succeed");
    let pk_bytes = general_purpose::STANDARD.decode(&pk).unwrap();
    let sk_bytes = general_purpose::STANDARD.decode(&sk).unwrap();

    assert_eq!(pk_bytes.len(), 1568, "Default public key must be ML-KEM-1024 (1568 bytes)");
    assert_eq!(sk_bytes.len(), 3168, "Default private key must be ML-KEM-1024 (3168 bytes)");
}

#[test]
fn test_mlkem768_keypair_generation() {
    let (pk, sk) = generate_keypair_for_alg(KemAlgorithm::MlKem768).expect("ML-KEM-768 keygen should succeed");
    let pk_bytes = general_purpose::STANDARD.decode(&pk).unwrap();
    let sk_bytes = general_purpose::STANDARD.decode(&sk).unwrap();

    assert_eq!(pk_bytes.len(), 1184, "ML-KEM-768 public key must be 1184 bytes");
    assert_eq!(sk_bytes.len(), 2400, "ML-KEM-768 private key must be 2400 bytes");
}

#[test]
fn test_vault_encrypt_v2_envelope_format() {
    let plaintext = "Top Secret Zero-Trust Vault Data";
    let ciphertext = vault_encrypt(plaintext).expect("Vault encrypt should succeed");

    assert!(ciphertext.starts_with("QZ_VAULT_V2:ml-kem-1024:"), "Default vault encrypt must produce QZ_VAULT_V2:ml-kem-1024: prefix");
    let parts: Vec<&str> = ciphertext.split(':').collect();
    assert_eq!(parts.len(), 5, "V2 envelope must have exactly 5 colon-separated parts");
    assert_eq!(parts[0], "QZ_VAULT_V2");
    assert_eq!(parts[1], "ml-kem-1024");
}

#[test]
fn test_vault_encrypt_mlkem768() {
    let plaintext = "ML-KEM-768 Vault Sealed Data";
    let ciphertext = vault_encrypt_for_alg(plaintext, KemAlgorithm::MlKem768).expect("Vault encrypt ML-KEM-768 should succeed");

    assert!(ciphertext.starts_with("QZ_VAULT_V2:ml-kem-768:"));
    let parts: Vec<&str> = ciphertext.split(':').collect();
    assert_eq!(parts.len(), 5);
    assert_eq!(parts[1], "ml-kem-768");
}

#[test]
fn test_secure_encrypt_decrypt_mlkem1024_roundtrip() {
    let (pk, sk) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();
    let message = "Confidential Patient Medical Record 2026";

    let ciphertext = secure_encrypt(message, &pk).expect("Secure encrypt ML-KEM-1024 should succeed");
    assert!(ciphertext.starts_with("QZ_SECURE_V2:ml-kem-1024:"), "Must use V2 envelope with ml-kem-1024 tag");

    let decrypted = secure_decrypt(&ciphertext, &sk).expect("Secure decrypt ML-KEM-1024 should succeed");
    assert_eq!(decrypted, message, "Decrypted text must match original plaintext");
}

#[test]
fn test_secure_encrypt_decrypt_mlkem768_roundtrip() {
    let (pk, sk) = generate_keypair_for_alg(KemAlgorithm::MlKem768).unwrap();
    let message = "Financial Transaction Batch #89218";

    // secure_encrypt automatically detects ML-KEM-768 from the 1184-byte public key!
    let ciphertext = secure_encrypt(message, &pk).expect("Secure encrypt ML-KEM-768 should succeed");
    assert!(ciphertext.starts_with("QZ_SECURE_V2:ml-kem-768:"), "Must automatically detect and tag ml-kem-768");

    let decrypted = secure_decrypt(&ciphertext, &sk).expect("Secure decrypt ML-KEM-768 should succeed");
    assert_eq!(decrypted, message, "Decrypted text must match original plaintext");
}

#[test]
fn test_v2_envelope_aad_tamper_rejection() {
    let (pk, sk) = generate_keypair_for_alg(KemAlgorithm::MlKem1024).unwrap();
    let message = "High Security Communications Payload";
    let ciphertext = secure_encrypt(message, &pk).unwrap();

    // Attack vector 1: Tamper with algorithm ID in header (e.g. downgrade to ml-kem-768)
    let tampered_alg = ciphertext.replace("QZ_SECURE_V2:ml-kem-1024:", "QZ_SECURE_V2:ml-kem-768:");
    let res1 = secure_decrypt(&tampered_alg, &sk);
    assert!(res1.is_err(), "Tampering with algorithm ID must fail decryption (AAD mismatch)");

    // Attack vector 2: Tamper with mode prefix (e.g. change SECURE to VAULT)
    let tampered_mode = ciphertext.replace("QZ_SECURE_V2:", "QZ_VAULT_V2:");
    let res2 = secure_decrypt(&tampered_mode, &sk);
    assert!(res2.is_err(), "Tampering with mode prefix must fail decryption");

    // Attack vector 3: Strip header to legacy format (trying to bypass AAD)
    let parts: Vec<&str> = ciphertext.splitn(5, ':').collect();
    let stripped_legacy = format!("QZ_SECURE_V1:{}:{}:{}", parts[2], parts[3], parts[4]);
    let res3 = secure_decrypt(&stripped_legacy, &sk);
    assert!(res3.is_err(), "Stripping V2 header to V1 format must fail decryption (key context mismatch)");
}

#[test]
fn test_backward_compatibility_decrypt_legacy_v1() {
    // Generate an ML-KEM-1024 keypair
    use ml_kem::{MlKem1024, KemCore};
    use ml_kem::kem::Encapsulate;
    use aes_gcm::{Aes256Gcm, Key, aead::{Aead, KeyInit}};
    use hkdf::Hkdf;
    use sha2::Sha256;
    use zeroize::Zeroize;

    let mut rng = rand::rngs::OsRng;
    let (dk, ek) = MlKem1024::generate(&mut rng);
    let sk_b64 = general_purpose::STANDARD.encode(dk.as_bytes().as_slice());

    // Encrypt in exact legacy V1 format (header b"QZ_SECURE_V1:", no AAD on AES-GCM)
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
    let nonce = aes_gcm::Nonce::from_slice(&[7u8; 12]);
    let secret_message = "Legacy V1 Encrypted Data from 2025 Archive";
    let aes_ct = cipher.encrypt(nonce, secret_message.as_bytes()).unwrap();

    let legacy_payload = format!(
        "QZ_SECURE_V1:{}:{}:{}",
        general_purpose::STANDARD.encode(ct.as_slice()),
        general_purpose::STANDARD.encode(nonce.as_slice()),
        general_purpose::STANDARD.encode(&aes_ct),
    );

    // Now test that modern secure_decrypt() decrypts this legacy V1 ciphertext perfectly!
    let decrypted = secure_decrypt(&legacy_payload, &sk_b64)
        .expect("Legacy V1 ciphertext MUST decrypt seamlessly without error");
    assert_eq!(decrypted, secret_message);
}
