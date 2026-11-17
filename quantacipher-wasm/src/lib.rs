use wasm_bindgen::prelude::*;
use quantacipher_core::{
    generate_keypair as core_generate_keypair,
    generate_keypair_for_alg as core_generate_keypair_for_alg,
    generate_keypair_for_profile as core_generate_keypair_for_profile,
    vault_encrypt as core_vault_encrypt,
    vault_encrypt_for_alg as core_vault_encrypt_for_alg,
    vault_encrypt_for_profile as core_vault_encrypt_for_profile,
    secure_encrypt as core_secure_encrypt,
    secure_decrypt as core_secure_decrypt,
    secure_decrypt_with_policy as core_secure_decrypt_with_policy,
    get_version as core_get_version,
    get_algorithm as core_get_algorithm,
    get_scheme as core_get_scheme,
    rewrap_secure as core_rewrap_secure,
    rewrap_secure_with_policy as core_rewrap_secure_with_policy,
    rewrap_secure_report as core_rewrap_secure_report,
    rewrap_vault as core_rewrap_vault,
    rewrap_vault_for_profile as core_rewrap_vault_for_profile,
    KemAlgorithm,
    SecurityProfile,
    SecurityPolicy,
    KEM_ALGORITHM_LABEL,
};
use quantacipher_core::sign::registry::{self, AlgorithmId};
use base64::{engine::general_purpose, Engine as _};


// ============================================================
// MODE 1: VAULT MODE — Encrypt Only (Zero-Trust)
// ============================================================

#[wasm_bindgen]
pub fn vault_encrypt(plaintext: &str) -> Result<String, JsValue> {
    core_vault_encrypt(plaintext).map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn vault_encrypt_for_alg(plaintext: &str, algorithm: &str) -> Result<String, JsValue> {
    let kem_alg = KemAlgorithm::from_id(algorithm)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    core_vault_encrypt_for_alg(plaintext, kem_alg)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn vault_encrypt_for_profile(plaintext: &str, profile: &str) -> Result<String, JsValue> {
    let p = SecurityProfile::from_name(profile)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    core_vault_encrypt_for_profile(plaintext, p)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

// ============================================================
// MODE 2: SECURE MODE — Generate a Keypair
// ============================================================

#[wasm_bindgen]
pub fn generate_keypair() -> Result<String, JsValue> {
    let (public, private) = core_generate_keypair()
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;

    Ok(format!(
        r#"{{"publicKey":"{}","privateKey":"{}","algorithm":"{}","version":"2.0"}}"#,
        public,
        private,
        KEM_ALGORITHM_LABEL,
    ))
}

#[wasm_bindgen]
pub fn generate_keypair_for_alg(algorithm: &str) -> Result<String, JsValue> {
    let kem_alg = KemAlgorithm::from_id(algorithm)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    let (public, private) = core_generate_keypair_for_alg(kem_alg)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;

    Ok(format!(
        r#"{{"publicKey":"{}","privateKey":"{}","algorithm":"{}","version":"2.0"}}"#,
        public,
        private,
        kem_alg.display_name(),
    ))
}

#[wasm_bindgen]
pub fn generate_keypair_for_profile(profile: &str) -> Result<String, JsValue> {
    let p = SecurityProfile::from_name(profile)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    let (public, private) = core_generate_keypair_for_profile(p)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;

    Ok(format!(
        r#"{{"publicKey":"{}","privateKey":"{}","algorithm":"{}","profile":"{}","nistLevel":{},"version":"2.0"}}"#,
        public,
        private,
        p.kem_algorithm().display_name(),
        p.as_str(),
        p.nist_level(),
    ))
}

#[wasm_bindgen]
pub fn get_profile_info(profile: &str) -> Result<String, JsValue> {
    let p = SecurityProfile::from_name(profile)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    Ok(format!(
        r#"{{"profile":"{}","displayName":"{}","nistLevel":{},"kem":"{}","sign":"{}","symmetric":"{}"}}"#,
        p.as_str(),
        p.display_name(),
        p.nist_level(),
        p.kem_algorithm().as_str(),
        p.sign_algorithm().as_str(),
        p.symmetric_algorithm(),
    ))
}

// ============================================================
// MODE 2: SECURE MODE — Encrypt
// ============================================================

#[wasm_bindgen]
pub fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, JsValue> {
    core_secure_encrypt(plaintext, public_key_b64)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

// ============================================================
// MODE 2: SECURE MODE — Decrypt
// ============================================================

#[wasm_bindgen]
pub fn secure_decrypt(ciphertext_payload: &str, private_key_b64: &str) -> Result<String, JsValue> {
    core_secure_decrypt(ciphertext_payload, private_key_b64)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn secure_decrypt_with_policy(
    ciphertext_payload: &str,
    private_key_b64: &str,
    min_level: u8,
    reject_legacy: bool,
) -> Result<String, JsValue> {
    let policy = SecurityPolicy::new(min_level, reject_legacy);
    core_secure_decrypt_with_policy(ciphertext_payload, private_key_b64, &policy)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

// ============================================================
// MODE 3: RE-WRAP UTILITY (MIGRATION & SUPER-ENCRYPTION)
// ============================================================

#[wasm_bindgen]
pub fn rewrap_secure(
    ciphertext_payload: &str,
    current_private_key_b64: &str,
    target_public_key_b64: &str,
) -> Result<String, JsValue> {
    core_rewrap_secure(ciphertext_payload, current_private_key_b64, target_public_key_b64)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn rewrap_secure_with_policy(
    ciphertext_payload: &str,
    current_private_key_b64: &str,
    target_public_key_b64: &str,
    min_level: u8,
    reject_legacy: bool,
) -> Result<String, JsValue> {
    let policy = SecurityPolicy::new(min_level, reject_legacy);
    core_rewrap_secure_with_policy(
        ciphertext_payload,
        current_private_key_b64,
        target_public_key_b64,
        &policy,
    )
    .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn rewrap_secure_report(
    ciphertext_payload: &str,
    current_private_key_b64: &str,
    target_public_key_b64: &str,
    min_level: u8,
    reject_legacy: bool,
) -> Result<String, JsValue> {
    let policy = SecurityPolicy::new(min_level, reject_legacy);
    let report = core_rewrap_secure_report(
        ciphertext_payload,
        current_private_key_b64,
        target_public_key_b64,
        &policy,
    )
    .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;

    serde_json::to_string(&report)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn rewrap_vault(
    ciphertext: &str,
    target_algorithm: &str,
) -> Result<String, JsValue> {
    let alg = KemAlgorithm::from_id(target_algorithm)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    core_rewrap_vault(ciphertext, alg)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

#[wasm_bindgen]
pub fn rewrap_vault_for_profile(
    ciphertext: &str,
    target_profile: &str,
) -> Result<String, JsValue> {
    let profile = SecurityProfile::from_name(target_profile)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    core_rewrap_vault_for_profile(ciphertext, profile)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))
}

// ============================================================
// BACKWARD COMPATIBILITY
// ============================================================
#[wasm_bindgen]
pub fn encrypt_local_kyber(plaintext: &str) -> Result<String, JsValue> {
    vault_encrypt(plaintext)
}

#[wasm_bindgen]
pub fn get_wasm_version() -> String {
    core_get_version()
}

/// Returns the algorithm label (e.g. "ML-KEM-1024") derived from the core constants.
/// Use this in receipts and CBOM output instead of hardcoding a string.
#[wasm_bindgen]
pub fn get_algorithm() -> String {
    core_get_algorithm().to_string()
}

/// Returns the full scheme label (e.g. "ML-KEM-1024 (FIPS 203) + AES-256-GCM").
#[wasm_bindgen]
pub fn get_scheme() -> String {
    core_get_scheme().to_string()
}

// ============================================================
// SIGN MODULE (v2.0) — crypto-agile signing
// ============================================================

/// Generate a signing keypair.
///
/// `algorithm`: `"falcon-512-fips206-draft"` | `"ml-dsa-44"` | omit for default.
/// Returns a JSON string: `{"public_key":"...","private_key":"...","algorithm":"..."}`
#[wasm_bindgen]
pub fn generate_signing_keypair(algorithm: Option<String>) -> Result<String, JsValue> {
    let alg_id = parse_alg_opt(algorithm)?;
    let kp = registry::generate_keypair(alg_id)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Sign Error: {}", e)))?;
    serde_json::to_string(&kp)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Serialization Error: {}", e)))
}

/// Generate a signing keypair according to a named SecurityProfile ("standard" | "high" | "hybrid").
#[wasm_bindgen]
pub fn generate_signing_keypair_for_profile(profile: &str) -> Result<String, JsValue> {
    let p = SecurityProfile::from_name(profile)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Error: {}", e)))?;
    let kp = p.generate_signing_keypair()
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Sign Error: {}", e)))?;
    serde_json::to_string(&kp)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Serialization Error: {}", e)))
}

/// Sign a payload. `payload_b64` is base64-encoded bytes.
/// Returns the `SignatureEnvelope` as a JSON string.
#[wasm_bindgen]
pub fn sign_payload(
    payload_b64: &str,
    private_key_b64: &str,
    algorithm: Option<String>,
) -> Result<String, JsValue> {
    let payload = decode_b64(payload_b64)?;
    let alg_id = parse_alg_opt(algorithm)?;
    let envelope = registry::sign(&payload, private_key_b64, alg_id)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Sign Error: {}", e)))?;
    registry::envelope_to_json(&envelope)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Serialization Error: {}", e)))
}

/// Verify a signature. `signature_json` is the JSON string from `sign_payload()`.
/// Throws if the envelope `alg` field is missing or unknown — never silently falls back.
#[wasm_bindgen]
pub fn verify_signature(
    payload_b64: &str,
    signature_json: &str,
    public_key_b64: &str,
) -> Result<bool, JsValue> {
    let payload = decode_b64(payload_b64)?;
    let envelope = registry::envelope_from_json(signature_json)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Envelope Error: {}", e)))?;
    registry::verify(&payload, &envelope, public_key_b64)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Verify Error: {}", e)))
}

/// Verify a signature enforcing a minimum SecurityPolicy (downgrade prevention).
#[wasm_bindgen]
pub fn verify_signature_with_policy(
    payload_b64: &str,
    signature_json: &str,
    public_key_b64: &str,
    min_level: u8,
    reject_legacy: bool,
) -> Result<bool, JsValue> {
    let payload = decode_b64(payload_b64)?;
    let envelope = registry::envelope_from_json(signature_json)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Envelope Error: {}", e)))?;
    let policy = SecurityPolicy::new(min_level, reject_legacy);
    registry::verify_with_policy(&payload, &envelope, public_key_b64, &policy)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Verify Error: {}", e)))
}

// ============================================================
// Internal helpers
// ============================================================

fn decode_b64(b64: &str) -> Result<Vec<u8>, JsValue> {
    general_purpose::STANDARD.decode(b64)
        .map_err(|e| JsValue::from_str(&format!("QuantaCipher Base64 Error: {}", e)))
}

fn parse_alg_opt(algorithm: Option<String>) -> Result<Option<AlgorithmId>, JsValue> {
    match algorithm {
        None => Ok(None),
        Some(s) if s.is_empty() => Ok(None),
        Some(s) => AlgorithmId::from_str(&s)
            .map(Some)
            .map_err(|e| JsValue::from_str(&format!("QuantaCipher AlgorithmId Error: {}", e))),
    }
}

// ============================================================
// MODE 4: 5G TELECOM — 3GPP TS 33.501 & TEC 910028:2025
// ============================================================

use quantacipher_core::telecom::{
    types::{Suci, Supi},
    pq_ies::{
        generate_hn_keypair as core_generate_hn_keypair,
        conceal_profile_c as core_conceal_profile_c,
        deconceal_profile_c as core_deconceal_profile_c,
        conceal_profile_d as core_conceal_profile_d,
        deconceal_profile_d as core_deconceal_profile_d,
    },
};

/// Generate 5G Home Network (UDM) keypair for Profile C (ML-KEM-768) and Profile D (Hybrid ML-KEM + X25519).
/// Returns a JSON object with base64 encoded keys.
#[wasm_bindgen]
pub fn telecom_generate_hn_keypair() -> Result<String, JsValue> {
    let keypair = core_generate_hn_keypair()
        .map_err(|e| JsValue::from_str(&format!("Key generation error: {}", e)))?;
    serde_json::to_string(&keypair).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Conceal a 5G SUPI into a SUCI using TEC 910028:2025 Profile C (Homogeneous ML-KEM-768 + AES-256-CTR).
/// Returns standard 3GPP NAI formatted SUCI string (`suci:0:MCC:MNC:RoutingIndicator:3:KeyId:hexOutput`).
#[wasm_bindgen]
pub fn telecom_conceal_profile_c(
    mcc: &str,
    mnc: &str,
    msin: &str,
    routing_indicator: &str,
    hn_public_key_id: u8,
    hn_mlkem_public_key_b64: &str,
) -> Result<String, JsValue> {
    let pk_bytes = decode_b64(hn_mlkem_public_key_b64)?;
    let supi = Supi::new(mcc, mnc, msin);
    let suci = core_conceal_profile_c(&supi, routing_indicator, hn_public_key_id, &pk_bytes)
        .map_err(|e| JsValue::from_str(&format!("5G Conceal Error: {}", e)))?;
    Ok(suci.to_nai_string())
}

/// De-conceal a Profile C SUCI back to SUPI at 5G UDM / SIDF.
/// Returns JSON `{ "mcc": "404", "mnc": "45", "msin": "...", "imsi": "..." }`.
#[wasm_bindgen]
pub fn telecom_deconceal_profile_c(
    suci_nai: &str,
    hn_mlkem_private_key_b64: &str,
) -> Result<String, JsValue> {
    let sk_bytes = decode_b64(hn_mlkem_private_key_b64)?;
    let suci = Suci::from_nai_string(suci_nai)
        .map_err(|e| JsValue::from_str(&format!("Invalid SUCI NAI: {}", e)))?;
    let supi = core_deconceal_profile_c(&suci, &sk_bytes)
        .map_err(|e| JsValue::from_str(&format!("5G De-conceal Error: {}", e)))?;

    let res = serde_json::json!({
        "mcc": supi.mcc,
        "mnc": supi.mnc,
        "msin": supi.msin,
        "imsi": supi.to_imsi(),
    });
    serde_json::to_string(&res).map_err(|e| JsValue::from_str(&e.to_string()))
}

/// Conceal a 5G SUPI into a SUCI using TEC 910028:2025 Profile D (Hybrid ML-KEM-768 + X25519 + AES-256-CTR).
/// Returns standard 3GPP NAI formatted SUCI string (`suci:0:MCC:MNC:RoutingIndicator:4:KeyId:hexOutput`).
#[wasm_bindgen]
pub fn telecom_conceal_profile_d(
    mcc: &str,
    mnc: &str,
    msin: &str,
    routing_indicator: &str,
    hn_public_key_id: u8,
    hn_mlkem_public_key_b64: &str,
    hn_x25519_public_key_b64: &str,
) -> Result<String, JsValue> {
    let pk_mlkem_bytes = decode_b64(hn_mlkem_public_key_b64)?;
    let pk_x25519_bytes = decode_b64(hn_x25519_public_key_b64)?;
    let supi = Supi::new(mcc, mnc, msin);
    let suci = core_conceal_profile_d(
        &supi,
        routing_indicator,
        hn_public_key_id,
        &pk_mlkem_bytes,
        &pk_x25519_bytes,
    ).map_err(|e| JsValue::from_str(&format!("5G Hybrid Conceal Error: {}", e)))?;
    Ok(suci.to_nai_string())
}

/// De-conceal a Profile D SUCI back to SUPI at 5G UDM / SIDF.
/// Returns JSON `{ "mcc": "404", "mnc": "45", "msin": "...", "imsi": "..." }`.
#[wasm_bindgen]
pub fn telecom_deconceal_profile_d(
    suci_nai: &str,
    hn_mlkem_private_key_b64: &str,
    hn_x25519_private_key_b64: &str,
    hn_mlkem_public_key_b64: &str,
) -> Result<String, JsValue> {
    let sk_mlkem_bytes = decode_b64(hn_mlkem_private_key_b64)?;
    let sk_x25519_bytes = decode_b64(hn_x25519_private_key_b64)?;
    let pk_mlkem_bytes = decode_b64(hn_mlkem_public_key_b64)?;

    let suci = Suci::from_nai_string(suci_nai)
        .map_err(|e| JsValue::from_str(&format!("Invalid SUCI NAI: {}", e)))?;
    let supi = core_deconceal_profile_d(
        &suci,
        &sk_mlkem_bytes,
        &sk_x25519_bytes,
        &pk_mlkem_bytes,
    ).map_err(|e| JsValue::from_str(&format!("5G Hybrid De-conceal Error: {}", e)))?;

    let res = serde_json::json!({
        "mcc": supi.mcc,
        "mnc": supi.mnc,
        "msin": supi.msin,
        "imsi": supi.to_imsi(),
    });
    serde_json::to_string(&res).map_err(|e| JsValue::from_str(&e.to_string()))
}

