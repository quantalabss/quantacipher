use super::*;
use super::types::{ProtectionScheme, Suci, Supi};
use ml_kem::{MlKem768, KemCore, EncodedSizeUser};
use x25519_dalek::{PublicKey as X25519PublicKey, StaticSecret};

const TEST_MCC: &str = "404"; // India
const TEST_MNC: &str = "45";  // Sample Operator
const TEST_MSIN: &str = "9876543210";
const TEST_ROUTING_INDICATOR: &str = "0000";
const TEST_KEY_ID: u8 = 1;

#[test]
fn test_ansi_x963_kdf_deterministic() {
    let z = b"shared_secret_32_bytes_input!!!!";
    let shared_info = b"ephemeral_pubkey_info";
    let key1 = ansi_x963_kdf(z, shared_info, 80);
    let key2 = ansi_x963_kdf(z, shared_info, 80);
    assert_eq!(key1, key2);
    assert_eq!(key1.len(), 80);
}

#[test]
fn test_supi_imsi_conversion() {
    let supi = Supi::new("404", "45", "9876543210");
    assert_eq!(supi.to_imsi(), "404459876543210");

    let parsed = Supi::from_imsi("404459876543210").unwrap();
    assert_eq!(parsed.mcc, "404");
    assert_eq!(parsed.mnc, "45");
    assert_eq!(parsed.msin, "9876543210");
}

#[test]
fn test_suci_nai_string_roundtrip() {
    let suci = Suci {
        supi_type: 0,
        mcc: "404".into(),
        mnc: "45".into(),
        routing_indicator: "0000".into(),
        protection_scheme: ProtectionScheme::ProfileC,
        hn_public_key_id: 1,
        scheme_output: vec![0xDE, 0xAD, 0xBE, 0xEF],
    };

    let nai = suci.to_nai_string();
    assert_eq!(nai, "suci-0-404-45-0000-3-1-deadbeef");

    let parsed = Suci::from_nai_string(&nai).unwrap();
    assert_eq!(parsed, suci);

    // Also test colon format compatibility
    let colon_nai = "suci:0:404:45:0000:3:1:deadbeef";
    let parsed_colon = Suci::from_nai_string(colon_nai).unwrap();
    assert_eq!(parsed_colon, suci);

    // Also test full 3GPP NAI realm format
    let full_nai = "suci-0-404-45-0000-3-1-deadbeef@nai.5gc.mnc045.mcc404.3gppnetwork.org";
    let parsed_full = Suci::from_nai_string(full_nai).unwrap();
    assert_eq!(parsed_full, suci);
}

#[test]
fn test_profile_c_homogeneous_pqc_roundtrip() {
    // 1. Generate Home Network (UDM) ML-KEM-768 keypair
    let mut rng = rand::rngs::OsRng;
    let (dk, ek) = MlKem768::generate(&mut rng);
    let ek_bytes = ek.as_bytes();
    let dk_bytes = dk.as_bytes();

    let supi = Supi::new(TEST_MCC, TEST_MNC, TEST_MSIN);

    // 2. UE side: Conceal SUPI to SUCI using Profile C (TEC 910028:2025 Section 6.4.1)
    let suci = conceal_profile_c(&supi, TEST_ROUTING_INDICATOR, TEST_KEY_ID, ek_bytes.as_slice())
        .expect("Profile C concealment should succeed");

    assert_eq!(suci.protection_scheme, ProtectionScheme::ProfileC);
    assert_eq!(suci.mcc, TEST_MCC);
    assert_eq!(suci.mnc, TEST_MNC);

    // 3. UDM side: De-conceal SUCI to SUPI
    let deconcealed = deconceal_profile_c(&suci, dk_bytes.as_slice())
        .expect("Profile C de-concealment should succeed");

    assert_eq!(deconcealed.mcc, supi.mcc);
    assert_eq!(deconcealed.mnc, supi.mnc);
    assert_eq!(deconcealed.msin, supi.msin);
    assert_eq!(deconcealed.to_imsi(), supi.to_imsi());
}

#[test]
fn test_profile_c_corrupted_mac_fails() {
    let mut rng = rand::rngs::OsRng;
    let (dk, ek) = MlKem768::generate(&mut rng);
    let supi = Supi::new(TEST_MCC, TEST_MNC, TEST_MSIN);

    let mut suci = conceal_profile_c(&supi, TEST_ROUTING_INDICATOR, TEST_KEY_ID, ek.as_bytes().as_slice()).unwrap();

    // Corrupt the MAC tag (last byte of scheme output)
    let last = suci.scheme_output.len() - 1;
    suci.scheme_output[last] ^= 0xFF;

    let result = deconceal_profile_c(&suci, dk.as_bytes().as_slice());
    assert!(result.is_err(), "Corrupted MAC tag must be rejected");
}

#[test]
fn test_profile_d_hybrid_pqc_roundtrip() {
    let mut rng = rand::rngs::OsRng;

    // 1. Generate Home Network (UDM) Dual Keypairs
    let (dk_mlkem, ek_mlkem) = MlKem768::generate(&mut rng);
    let hn_x25519_sk = StaticSecret::random_from_rng(&mut rng);
    let hn_x25519_pk = X25519PublicKey::from(&hn_x25519_sk);

    let supi = Supi::new(TEST_MCC, TEST_MNC, TEST_MSIN);

    // 2. UE side: Conceal SUPI to SUCI using Profile D (TEC 910028:2025 Section 6.4.2)
    let suci = conceal_profile_d(
        &supi,
        TEST_ROUTING_INDICATOR,
        TEST_KEY_ID,
        ek_mlkem.as_bytes().as_slice(),
        hn_x25519_pk.as_bytes(),
    ).expect("Profile D hybrid concealment should succeed");

    assert_eq!(suci.protection_scheme, ProtectionScheme::ProfileD);
    assert!(suci.protection_scheme.is_post_quantum());

    // 3. UDM side: De-conceal SUCI to SUPI
    let deconcealed = deconceal_profile_d(
        &suci,
        dk_mlkem.as_bytes().as_slice(),
        hn_x25519_sk.as_bytes(),
        ek_mlkem.as_bytes().as_slice(),
    ).expect("Profile D hybrid de-concealment should succeed");

    assert_eq!(deconcealed.mcc, supi.mcc);
    assert_eq!(deconcealed.mnc, supi.mnc);
    assert_eq!(deconcealed.msin, supi.msin);
    assert_eq!(deconcealed.to_imsi(), supi.to_imsi());
}

#[test]
fn test_profile_d_corrupted_classical_fails() {
    let mut rng = rand::rngs::OsRng;
    let (dk_mlkem, ek_mlkem) = MlKem768::generate(&mut rng);
    let hn_x25519_sk = StaticSecret::random_from_rng(&mut rng);
    let hn_x25519_pk = X25519PublicKey::from(&hn_x25519_sk);

    let supi = Supi::new(TEST_MCC, TEST_MNC, TEST_MSIN);

    let mut suci = conceal_profile_d(
        &supi,
        TEST_ROUTING_INDICATOR,
        TEST_KEY_ID,
        ek_mlkem.as_bytes().as_slice(),
        hn_x25519_pk.as_bytes(),
    ).unwrap();

    // Corrupt the ephemeral classical X25519 public key (first 32 bytes)
    suci.scheme_output[0] ^= 0xFF;

    let result = deconceal_profile_d(
        &suci,
        dk_mlkem.as_bytes().as_slice(),
        hn_x25519_sk.as_bytes(),
        ek_mlkem.as_bytes().as_slice(),
    );
    assert!(result.is_err(), "Tampered ephemeral classical key must fail verification");
}

#[test]
fn test_sba_token_mldsa65_roundtrip() {
    use crate::sign::registry::{generate_keypair, AlgorithmId};
    use crate::telecom::sba_token::{issue_sba_token, verify_sba_token, SbaTokenClaims};

    // 1. Generate NRF signing keypair using FIPS 204 ML-DSA-65
    let nrf_kp = generate_keypair(Some(AlgorithmId::MlDsa65)).unwrap();

    let now = 1794913200; // Reference timestamp
    let claims = SbaTokenClaims {
        iss: "nrf-01.5gc.mnc045.mcc404.3gppnetwork.org".to_string(),
        sub: "amf-01.5gc.mnc045.mcc404.3gppnetwork.org".to_string(),
        aud: "udm".to_string(),
        scope: "nudm-sdm".to_string(),
        iat: now,
        exp: now + 3600, // 1 hour validity
        plmn_mcc: Some("404".to_string()),
        plmn_mnc: Some("45".to_string()),
    };

    // 2. NRF issues PQ-JWT Access Token
    let token = issue_sba_token(&claims, &nrf_kp.private_key, AlgorithmId::MlDsa65).unwrap();
    assert_eq!(token.split('.').count(), 3, "JWT must consist of 3 dot-separated segments");

    // 3. Producer NF (UDM) verifies the token
    let verified = verify_sba_token(&token, &nrf_kp.public_key, "udm", now + 120).unwrap();
    assert_eq!(verified.iss, claims.iss);
    assert_eq!(verified.sub, claims.sub);
    assert_eq!(verified.aud, "udm");
    assert_eq!(verified.scope, "nudm-sdm");
}

#[test]
fn test_sba_token_hybrid_mldsa65_p256_roundtrip() {
    use crate::sign::registry::{generate_keypair, AlgorithmId};
    use crate::telecom::sba_token::{issue_sba_token, verify_sba_token, SbaTokenClaims};

    // 1. Generate NRF signing keypair using Hybrid ML-DSA-65 + ECDSA P-256 (TEC 910018:2025 Figure 3)
    let nrf_kp = generate_keypair(Some(AlgorithmId::HybridMlDsa65P256)).unwrap();

    let now = 1794913200;
    let claims = SbaTokenClaims {
        iss: "nrf-01.5gc.mnc045.mcc404.3gppnetwork.org".to_string(),
        sub: "amf-01.5gc.mnc045.mcc404.3gppnetwork.org".to_string(),
        aud: "ausf".to_string(),
        scope: "nausf-auth".to_string(),
        iat: now,
        exp: now + 1800,
        plmn_mcc: Some("404".to_string()),
        plmn_mnc: Some("45".to_string()),
    };

    // 2. Issue Hybrid Token
    let token = issue_sba_token(&claims, &nrf_kp.private_key, AlgorithmId::HybridMlDsa65P256).unwrap();

    // 3. Producer NF (AUSF) verifies the token
    let verified = verify_sba_token(&token, &nrf_kp.public_key, "ausf", now + 60).unwrap();
    assert_eq!(verified.aud, "ausf");
    assert_eq!(verified.scope, "nausf-auth");
}

#[test]
fn test_sba_token_expired_fails() {
    use crate::sign::registry::{generate_keypair, AlgorithmId};
    use crate::telecom::sba_token::{issue_sba_token, verify_sba_token, SbaTokenClaims};

    let nrf_kp = generate_keypair(Some(AlgorithmId::MlDsa65)).unwrap();
    let now = 1794913200;
    let claims = SbaTokenClaims {
        iss: "nrf-01".to_string(),
        sub: "amf-01".to_string(),
        aud: "udm".to_string(),
        scope: "nudm-sdm".to_string(),
        iat: now - 3600,
        exp: now - 10, // Expired 10 seconds ago
        plmn_mcc: None,
        plmn_mnc: None,
    };

    let token = issue_sba_token(&claims, &nrf_kp.private_key, AlgorithmId::MlDsa65).unwrap();
    let res = verify_sba_token(&token, &nrf_kp.public_key, "udm", now);
    assert!(res.is_err(), "Expired token must be rejected");
}

#[test]
fn test_sba_token_audience_mismatch_fails() {
    use crate::sign::registry::{generate_keypair, AlgorithmId};
    use crate::telecom::sba_token::{issue_sba_token, verify_sba_token, SbaTokenClaims};

    let nrf_kp = generate_keypair(Some(AlgorithmId::MlDsa65)).unwrap();
    let now = 1794913200;
    let claims = SbaTokenClaims {
        iss: "nrf-01".to_string(),
        sub: "amf-01".to_string(),
        aud: "udm".to_string(), // Issued for UDM
        scope: "nudm-sdm".to_string(),
        iat: now,
        exp: now + 3600,
        plmn_mcc: None,
        plmn_mnc: None,
    };

    let token = issue_sba_token(&claims, &nrf_kp.private_key, AlgorithmId::MlDsa65).unwrap();
    // Presented to AUSF instead of UDM
    let res = verify_sba_token(&token, &nrf_kp.public_key, "ausf", now + 10);
    assert!(res.is_err(), "Audience mismatch must be rejected");
}

#[test]
fn test_sepp_n32_xwing_roundtrip() {
    use crate::registry::KemAlgorithm;
    use crate::telecom::sepp_n32::{protect_n32f_payload, unprotect_n32f_payload};

    // 1. Generate Home SEPP (h-SEPP) X-Wing Keypair
    let (h_sepp_pk, h_sepp_sk) = KemAlgorithm::HybridXWing.generate_keypair().unwrap();

    let routing_headers = serde_json::json!({
        "method": "POST",
        "uri": "/nudm-sdm/v2/404019876543210/amf-3gpp-access-registration",
        "ipx_transit_nodes": ["ipx.airtel.in", "ipx.tata.in", "ipx.bsnl.in"]
    });

    let sensitive_payload = serde_json::json!({
        "supi": "404019876543210",
        "gpsi": "msisdn-919876543210",
        "roaming_country": "IN",
        "current_cell_id": "TAC-045-ENODEB-88912",
        "auth_status": "AUTHENTICATED"
    });

    // 2. Visited SEPP (v-SEPP) seals payload in Post-Quantum JWE
    let msg = protect_n32f_payload(
        "n32f-tx-99018",
        "404-45", // Airtel
        "404-01", // BSNL
        &routing_headers,
        &sensitive_payload,
        &h_sepp_pk,
        KemAlgorithm::HybridXWing,
    ).unwrap();

    // Verify JWE structure: 5 dot-separated segments
    assert_eq!(msg.protected_payload_jwe.split('.').count(), 5);
    assert_eq!(msg.routing_headers["method"], "POST");

    // 3. Home SEPP (h-SEPP) unprotects payload
    let recovered = unprotect_n32f_payload(&msg, &h_sepp_sk).unwrap();
    assert_eq!(recovered["supi"], "404019876543210");
    assert_eq!(recovered["current_cell_id"], "TAC-045-ENODEB-88912");
}

#[test]
fn test_sepp_n32_mlkem768_roundtrip() {
    use crate::registry::KemAlgorithm;
    use crate::telecom::sepp_n32::{protect_n32f_payload, unprotect_n32f_payload};

    let (h_sepp_pk, h_sepp_sk) = KemAlgorithm::MlKem768.generate_keypair().unwrap();

    let routing = serde_json::json!({ "route": "/nausf-auth/v1/ue-authentications" });
    let sensitive = serde_json::json!({ "rand": "0123456789abcdef", "autn": "fedcba9876543210" });

    let msg = protect_n32f_payload(
        "n32f-auth-001",
        "404-86", // Jio
        "404-01", // BSNL
        &routing,
        &sensitive,
        &h_sepp_pk,
        KemAlgorithm::MlKem768,
    ).unwrap();

    let recovered = unprotect_n32f_payload(&msg, &h_sepp_sk).unwrap();
    assert_eq!(recovered["rand"], "0123456789abcdef");
}

#[test]
fn test_sepp_n32_tamper_fails() {
    use crate::registry::KemAlgorithm;
    use crate::telecom::sepp_n32::{protect_n32f_payload, unprotect_n32f_payload};

    let (h_sepp_pk, h_sepp_sk) = KemAlgorithm::HybridXWing.generate_keypair().unwrap();
    let routing = serde_json::json!({ "route": "/test" });
    let sensitive = serde_json::json!({ "secret": "confidential_data" });

    let mut msg = protect_n32f_payload(
        "n32f-tamper-01",
        "404-45",
        "404-01",
        &routing,
        &sensitive,
        &h_sepp_pk,
        KemAlgorithm::HybridXWing,
    ).unwrap();

    // Corrupt JWE tag segment
    let mut parts: Vec<String> = msg.protected_payload_jwe.split('.').map(String::from).collect();
    parts[4] = "AAAA".to_string();
    msg.protected_payload_jwe = parts.join(".");

    let res = unprotect_n32f_payload(&msg, &h_sepp_sk);
    assert!(res.is_err(), "Tampered JWE tag must fail decryption");
}

#[test]
fn test_telecom_audit_legacy_commercial_telco_critical_risk() {
    use crate::telecom::cbom_scanner::{audit_telecom_deployment, TelecomAuditConfig};

    // Legacy commercial telco deployment: Profile A (Curve25519), RSA-2048 SBA, Classical ECDH SEPP, NEA2 AES-128
    let legacy_config = TelecomAuditConfig {
        suci_profile: "profile_a".to_string(),
        sba_token_alg: "rsa_2048".to_string(),
        sepp_roaming_kem: "classical_ecdh".to_string(),
        nas_cipher: "nea2_aes128".to_string(),
        up_cipher: "nea2_aes128".to_string(),
    };

    let report = audit_telecom_deployment(&legacy_config);
    assert!(report.overall_score < 60, "Legacy telco must score below 60, got {}", report.overall_score);
    assert!(!report.mtcte_certified, "Legacy telco cannot be MTCTE PQC certified");
    assert!(report.critical_count >= 1, "Must detect critical vulnerability on Profile A SUCI");
    assert!(report.high_count >= 2, "Must detect high vulnerability on RSA SBA and ECDH SEPP");
    assert!(report.cyclonedx_cbom_json.contains("CycloneDX"), "Must generate CycloneDX 1.6 CBOM");
}

#[test]
fn test_telecom_audit_quantum_native_pass() {
    use crate::telecom::cbom_scanner::{audit_telecom_deployment, TelecomAuditConfig};

    // QuantaCipher Quantum-Native 5G Core: Profile D, Hybrid ML-DSA-65, Hybrid X-Wing SEPP, NEA4 AES-256
    let quantum_config = TelecomAuditConfig {
        suci_profile: "profile_d".to_string(),
        sba_token_alg: "hybrid_mldsa65_p256".to_string(),
        sepp_roaming_kem: "hybrid_xwing".to_string(),
        nas_cipher: "nea4_aes256".to_string(),
        up_cipher: "nea4_aes256".to_string(),
    };

    let report = audit_telecom_deployment(&quantum_config);
    assert_eq!(report.overall_score, 100, "Quantum-native deployment must score 100");
    assert!(report.mtcte_certified, "Must satisfy quantum readiness criteria");
    assert_eq!(report.critical_count, 0, "Must have zero critical vulnerabilities");
    assert_eq!(report.high_count, 0, "Must have zero high vulnerabilities");
    assert_eq!(report.quantum_risk_level, "Quantum-Resilient");
    assert!(report.cyclonedx_cbom_json.contains("ML-KEM-768"));
    assert!(report.cyclonedx_cbom_json.contains("Hybrid ML-DSA-65"));
}

#[test]
fn test_telecom_audit_open5gs_default_core() {
    use crate::telecom::cbom_scanner::{audit_telecom_deployment, TelecomAuditConfig};

    // Open5GS v2.7.x standard configuration:
    // - UDM: Scheme 1 Profile A (Curve25519)
    // - NRF: Classical RS256 OAuth2
    // - SEPP: Classical ECDH JWE / TLS
    // - NAS & UP: NEA2 (AES-128-CTR)
    let open5gs_config = TelecomAuditConfig {
        suci_profile: "profile_a".to_string(),
        sba_token_alg: "rsa_2048".to_string(),
        sepp_roaming_kem: "classical_ecdh".to_string(),
        nas_cipher: "nea2_aes128".to_string(),
        up_cipher: "nea2_aes128".to_string(),
    };

    let report = audit_telecom_deployment(&open5gs_config);
    assert_eq!(report.critical_count, 1, "Open5GS default has critical Profile A quantum vulnerability");
    assert_eq!(report.high_count, 2, "Open5GS default has high vulnerabilities on RSA SBA and ECDH SEPP");
    assert!(report.overall_score < 50, "Open5GS default must score < 50 (got {})", report.overall_score);
    assert_eq!(report.quantum_risk_level, "Critical Quantum Risk");
    assert!(!report.mtcte_certified);
}

#[test]
fn test_telecom_audit_free5gc_default_core() {
    use crate::telecom::cbom_scanner::{audit_telecom_deployment, TelecomAuditConfig};

    // free5GC v3.4.x standard configuration:
    // - UDM: Scheme 1 Profile A (Curve25519)
    // - NRF: Classical RSA
    // - SEPP: Classical ECDH
    // - User Plane: NEA0 (Cleartext default in basic lab setup)
    let free5gc_config = TelecomAuditConfig {
        suci_profile: "profile_a".to_string(),
        sba_token_alg: "rsa_2048".to_string(),
        sepp_roaming_kem: "classical_ecdh".to_string(),
        nas_cipher: "nea2_aes128".to_string(),
        up_cipher: "nea0".to_string(),
    };

    let report = audit_telecom_deployment(&free5gc_config);
    assert!(report.critical_count >= 2, "free5GC with NEA0 UP has at least 2 critical findings");
    assert!(report.overall_score < 40, "free5GC default must score < 40 (got {})", report.overall_score);
    assert!(!report.mtcte_certified);
}

#[test]
fn test_3gpp_ts33501_annex_c_unchanged_primitives() {
    // Verifies the unchanged cryptographic primitives defined in 3GPP TS 33.501 Annex C:
    // 1. ANSI X9.63 KDF with SHA-256
    // 2. Truncated 8-octet HMAC-SHA-256 MAC tag
    // 3. 128-bit big-endian AES counter mode encryption
    // 4. 3GPP TS 23.003 §2.2B SUCI NAI wire string serialization

    // Official 3GPP TS 33.501 Annex C.4.1 Profile A Test Vector Keys
    let hn_private_hex = "c53c22208b61860b06c62e5406a7b330c2b577aa5558981510d128247d38bd1d";
    let hn_public_hex = "5a8d38864820197c3394b92613b20b91633cbd897119273bf8e4a6f4eec0a650";

    let hn_sk_bytes = hex::decode(hn_private_hex).unwrap();
    let hn_pk_bytes = hex::decode(hn_public_hex).unwrap();

    let hn_sk = StaticSecret::from(<[u8; 32]>::try_from(hn_sk_bytes.as_slice()).unwrap());
    let hn_pk = X25519PublicKey::from(&hn_sk);
    assert_eq!(hn_pk.as_bytes(), hn_pk_bytes.as_slice(), "Home network keypair must match Annex C.4.1");

    // Perform ECDH key exchange to produce shared secret Z
    let eph_sk = StaticSecret::from([0x42u8; 32]);
    let eph_pk = X25519PublicKey::from(&eph_sk);
    let ss_ue = eph_sk.diffie_hellman(&hn_pk);
    let ss_hn = hn_sk.diffie_hellman(&eph_pk);
    assert_eq!(ss_ue.as_bytes(), ss_hn.as_bytes(), "ECDH shared secret Z must be symmetric");

    // ANSI X9.63 KDF per TS 33.501 Annex C:
    // Derives 80 bytes (K_enc [32B], IV [16B], K_mac [32B])
    let derived_keys = ansi_x963_kdf(ss_ue.as_bytes(), eph_pk.as_bytes(), 80);
    assert_eq!(derived_keys.len(), 80);

    let (k_enc, iv, k_mac) = split_kdf_keys(&derived_keys).unwrap();
    assert_eq!(k_enc.len(), 32);
    assert_eq!(iv.len(), 16);
    assert_eq!(k_mac.len(), 32);

    // Encrypt test MSIN
    let msin = "001002086";
    let ciphertext = aes_256_ctr_crypt(k_enc, iv, msin.as_bytes()).unwrap();
    assert_eq!(ciphertext.len(), msin.len());

    // MAC calculation: truncated to 8 octets
    let mac = compute_mac(k_mac, &ciphertext).unwrap();
    assert_eq!(mac.len(), 8, "MAC tag must be exactly 8 octets per Annex C.3.4");

    // Decrypt and verify
    let decrypted = aes_256_ctr_crypt(k_enc, iv, &ciphertext).unwrap();
    assert_eq!(String::from_utf8(decrypted).unwrap(), msin);

    // Verify SUCI NAI wire format matches 3GPP TS 23.003 §2.2B:
    // suci-0-<MCC>-<MNC>-<Routing>-<Scheme>-<KeyId>-<SchemeOutput>
    let mut scheme_output = Vec::new();
    scheme_output.extend_from_slice(eph_pk.as_bytes());
    scheme_output.extend_from_slice(&ciphertext);
    scheme_output.extend_from_slice(&mac);

    let suci = Suci {
        supi_type: 0,
        mcc: "001".to_string(),
        mnc: "01".to_string(),
        routing_indicator: "0000".to_string(),
        protection_scheme: ProtectionScheme::ProfileA,
        hn_public_key_id: 1,
        scheme_output,
    };

    let nai = suci.to_nai_string();
    assert!(nai.starts_with("suci-0-001-01-0000-1-1-"));
    let parsed = Suci::from_nai_string(&nai).unwrap();
    assert_eq!(parsed.mcc, "001");
    assert_eq!(parsed.mnc, "01");
    assert_eq!(parsed.protection_scheme, ProtectionScheme::ProfileA);
}



