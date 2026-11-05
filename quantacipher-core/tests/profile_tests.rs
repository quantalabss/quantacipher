use quantacipher_core::{
    generate_keypair_for_profile, vault_encrypt_for_profile,
    SecurityProfile, QuantaCipherError,
    sign::registry as sign_registry,
};
use base64::{engine::general_purpose, Engine as _};

#[test]
fn test_default_profile_is_high() {
    let default_prof = SecurityProfile::default();
    assert_eq!(default_prof, SecurityProfile::High);
    assert_eq!(default_prof.nist_level(), 5);
    assert_eq!(default_prof.kem_algorithm().as_str(), "ml-kem-1024");
    assert_eq!(default_prof.sign_algorithm().as_str(), "ml-dsa-87");
}

#[test]
fn test_standard_profile_specifications() {
    let standard = SecurityProfile::Standard;
    assert_eq!(standard.nist_level(), 3);
    assert_eq!(standard.kem_algorithm().as_str(), "ml-kem-768");
    assert_eq!(standard.sign_algorithm().as_str(), "ml-dsa-65");
    assert_eq!(standard.symmetric_algorithm(), "AES-256-GCM");
}

#[test]
fn test_profile_string_parsing() {
    assert_eq!(SecurityProfile::from_name("standard").unwrap(), SecurityProfile::Standard);
    assert_eq!(SecurityProfile::from_name("STANDARD").unwrap(), SecurityProfile::Standard);
    assert_eq!(SecurityProfile::from_name("level3").unwrap(), SecurityProfile::Standard);
    assert_eq!(SecurityProfile::from_name("nist3").unwrap(), SecurityProfile::Standard);

    assert_eq!(SecurityProfile::from_name("high").unwrap(), SecurityProfile::High);
    assert_eq!(SecurityProfile::from_name("HIGH").unwrap(), SecurityProfile::High);
    assert_eq!(SecurityProfile::from_name("level5").unwrap(), SecurityProfile::High);
    assert_eq!(SecurityProfile::from_name("nist5").unwrap(), SecurityProfile::High);

    assert_eq!(SecurityProfile::from_name("hybrid").unwrap(), SecurityProfile::Hybrid);
    assert_eq!(SecurityProfile::from_name("composite").unwrap(), SecurityProfile::Hybrid);

    assert!(matches!(
        SecurityProfile::from_name("quantum-x"),
        Err(QuantaCipherError::InvalidSecurityProfile(_))
    ));
}

#[test]
fn test_profile_keygen_key_lengths() {
    // Standard Profile -> ML-KEM-768 (1184 / 2400)
    let (std_pk, std_sk) = generate_keypair_for_profile(SecurityProfile::Standard).unwrap();
    let std_pk_bytes = general_purpose::STANDARD.decode(&std_pk).unwrap();
    let std_sk_bytes = general_purpose::STANDARD.decode(&std_sk).unwrap();
    assert_eq!(std_pk_bytes.len(), 1184, "Standard profile public key must be 1184 bytes");
    assert_eq!(std_sk_bytes.len(), 2400, "Standard profile private key must be 2400 bytes");

    // High Profile -> ML-KEM-1024 (1568 / 3168)
    let (high_pk, high_sk) = generate_keypair_for_profile(SecurityProfile::High).unwrap();
    let high_pk_bytes = general_purpose::STANDARD.decode(&high_pk).unwrap();
    let high_sk_bytes = general_purpose::STANDARD.decode(&high_sk).unwrap();
    assert_eq!(high_pk_bytes.len(), 1568, "High profile public key must be 1568 bytes");
    assert_eq!(high_sk_bytes.len(), 3168, "High profile private key must be 3168 bytes");
}

#[test]
fn test_profile_vault_encrypt_prefixes() {
    let payload = "Confidential Patient Vitals: BP 120/80";

    let ct_std = vault_encrypt_for_profile(payload, SecurityProfile::Standard).unwrap();
    assert!(ct_std.starts_with("QZ_VAULT_V2:ml-kem-768:"));

    let ct_high = vault_encrypt_for_profile(payload, SecurityProfile::High).unwrap();
    assert!(ct_high.starts_with("QZ_VAULT_V2:ml-kem-1024:"));
}

#[test]
fn test_profile_signing_roundtrip() {
    let payload = b"Cryptographic Ledger Entry #4902";

    // Standard profile uses ML-DSA-65
    let std_prof = SecurityProfile::Standard;
    let std_kp = std_prof.generate_signing_keypair().unwrap();
    assert_eq!(std_kp.algorithm, "ml-dsa-65");

    let std_sig = std_prof.sign_payload(payload, &std_kp.private_key).unwrap();
    assert_eq!(std_sig.alg, "ml-dsa-65");
    assert!(sign_registry::verify(payload, &std_sig, &std_kp.public_key).unwrap());

    // High profile uses ML-DSA-87
    let high_prof = SecurityProfile::High;
    let high_kp = high_prof.generate_signing_keypair().unwrap();
    assert_eq!(high_kp.algorithm, "ml-dsa-87");

    let high_sig = high_prof.sign_payload(payload, &high_kp.private_key).unwrap();
    assert_eq!(high_sig.alg, "ml-dsa-87");
    assert!(sign_registry::verify(payload, &high_sig, &high_kp.public_key).unwrap());
}

#[test]
fn test_profile_json_serde() {
    let high_json = serde_json::to_string(&SecurityProfile::High).unwrap();
    assert_eq!(high_json, "\"high\"");
    let high_parsed: SecurityProfile = serde_json::from_str(&high_json).unwrap();
    assert_eq!(high_parsed, SecurityProfile::High);

    let std_json = serde_json::to_string(&SecurityProfile::Standard).unwrap();
    assert_eq!(std_json, "\"standard\"");
    let std_parsed: SecurityProfile = serde_json::from_str(&std_json).unwrap();
    assert_eq!(std_parsed, SecurityProfile::Standard);
}
