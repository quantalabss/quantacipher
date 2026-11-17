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



