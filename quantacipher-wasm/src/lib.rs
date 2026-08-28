use wasm_bindgen::prelude::*;
use quantacipher_core::{
    generate_keypair as core_generate_keypair,
    vault_encrypt as core_vault_encrypt,
    secure_encrypt as core_secure_encrypt,
    secure_decrypt as core_secure_decrypt,
    get_version as core_get_version,
    get_algorithm as core_get_algorithm,
    get_scheme as core_get_scheme,
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
