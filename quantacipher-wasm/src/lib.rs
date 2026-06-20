use wasm_bindgen::prelude::*;
use quantacipher_core::{
    generate_keypair as core_generate_keypair,
    vault_encrypt as core_vault_encrypt,
    secure_encrypt as core_secure_encrypt,
    secure_decrypt as core_secure_decrypt,
    get_version as core_get_version,
};

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
        r#"{{"publicKey":"{}","privateKey":"{}","algorithm":"Kyber-1024","version":"1.0"}}"#,
        public,
        private
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
