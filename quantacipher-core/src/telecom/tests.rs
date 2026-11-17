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

