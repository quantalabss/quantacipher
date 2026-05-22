use wasm_bindgen::prelude::*;
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key,
};
use base64::{engine::general_purpose, Engine as _};
use pqc_kyber::*;

// ============================================================
// MODE 1: VAULT MODE — Encrypt Only (Zero-Trust)
// The private key is generated ephemerally and immediately discarded.
// Nobody can ever decrypt this data. Use for:
//   - Permanent compliance records
//   - Tamper-proof audit logs
//   - HIPAA "write-once" data vaults
//   - Proving data existed at a point in time
// ============================================================

#[wasm_bindgen]
pub fn vault_encrypt(plaintext: &str) -> String {
    let mut rng = OsRng;

    // Generate ephemeral keypair — private key is NEVER exported
    let keys = keypair(&mut rng).expect("Kyber keygen failed");

    // Encapsulate: derives a shared secret from the public key
    let (kyber_ciphertext, shared_secret) = encapsulate(&keys.public, &mut rng)
        .expect("Kyber encapsulation failed");

    // Use shared_secret as AES-256-GCM key (hybrid encryption)
    let aes_key = Key::<Aes256Gcm>::from_slice(&shared_secret);
    let cipher = Aes256Gcm::new(aes_key);
    let nonce = Aes256Gcm::generate_nonce(&mut rng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .expect("AES-GCM encryption failed");

    // Encode everything — private key is NEVER included
    let b64_kyber_ct = general_purpose::STANDARD.encode(kyber_ciphertext);
    let b64_nonce    = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct   = general_purpose::STANDARD.encode(aes_ciphertext);

    // Format: QZ_VAULT_V1:<kyber_ct>:<nonce>:<aes_ct>
    // No private key stored anywhere. Permanently sealed.
    format!("QZ_VAULT_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct)
}

// ============================================================
// MODE 2: SECURE MODE — Generate a Keypair (User Holds Private Key)
// Returns a JSON string with { public_key, private_key } encoded in base64.
// The USER stores their own private key — QuantaCipher NEVER sees it.
// The public key can be shared with the gateway for encryption.
// ============================================================

#[wasm_bindgen]
pub fn generate_keypair() -> String {
    let mut rng = OsRng;
    let keys = keypair(&mut rng).expect("Kyber keygen failed");

    let b64_public  = general_purpose::STANDARD.encode(&keys.public);
    let b64_private = general_purpose::STANDARD.encode(&keys.secret);

    // Return as a simple JSON string — JS will parse this
    format!(
        r#"{{"publicKey":"{}","privateKey":"{}","algorithm":"Kyber-1024","version":"1.0"}}"#,
        b64_public,
        b64_private
    )
}

// ============================================================
// MODE 2: SECURE MODE — Encrypt with a User-Provided Public Key
// The caller passes in their base64-encoded Kyber public key.
// The resulting ciphertext can be decrypted using secure_decrypt()
// with the matching private key.
// ============================================================

#[wasm_bindgen]
pub fn secure_encrypt(plaintext: &str, public_key_b64: &str) -> String {
    let mut rng = OsRng;

    // Decode the user's public key
    let public_key_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .expect("Invalid base64 public key");

    // Build a Kyber public key from raw bytes
    if public_key_bytes.len() != KYBER_PUBLICKEYBYTES {
        return "QZ_ERROR:Invalid public key length".to_string();
    }

    let mut pk = [0u8; KYBER_PUBLICKEYBYTES];
    pk.copy_from_slice(&public_key_bytes);

    // Encapsulate — produces a shared secret + a kyber ciphertext
    // The kyber ciphertext is sent along so the recipient can decapsulate
    let (kyber_ciphertext, shared_secret) = encapsulate(&pk, &mut rng)
        .expect("Kyber encapsulation failed");

    // Hybrid: AES-256-GCM with the derived shared secret
    let aes_key = Key::<Aes256Gcm>::from_slice(&shared_secret);
    let cipher  = Aes256Gcm::new(aes_key);
    let nonce   = Aes256Gcm::generate_nonce(&mut rng);

    let aes_ciphertext = cipher
        .encrypt(&nonce, plaintext.as_bytes())
        .expect("AES-GCM encryption failed");

    let b64_kyber_ct = general_purpose::STANDARD.encode(kyber_ciphertext);
    let b64_nonce    = general_purpose::STANDARD.encode(nonce.as_slice());
    let b64_aes_ct   = general_purpose::STANDARD.encode(aes_ciphertext);

    // Format: QZ_SECURE_V1:<kyber_ct>:<nonce>:<aes_ct>
    format!("QZ_SECURE_V1:{}:{}:{}", b64_kyber_ct, b64_nonce, b64_aes_ct)
}

// ============================================================
// MODE 2: SECURE MODE — Decrypt with the User's Private Key
// Only the person who holds the matching private key can call this.
// QuantaCipher never calls this — it runs locally in the user's JS runtime.
// ============================================================

#[wasm_bindgen]
pub fn secure_decrypt(ciphertext_payload: &str, private_key_b64: &str) -> String {
    // Parse the payload
    if !ciphertext_payload.starts_with("QZ_SECURE_V1:") {
        return "QZ_ERROR:Invalid payload format. Expected QZ_SECURE_V1:...".to_string();
    }

    let parts: Vec<&str> = ciphertext_payload.splitn(4, ':').collect();
    if parts.len() != 4 {
        return "QZ_ERROR:Malformed payload — expected 4 parts".to_string();
    }

    // Decode each part
    let kyber_ct_bytes = match general_purpose::STANDARD.decode(parts[1]) {
        Ok(b) => b,
        Err(_) => return "QZ_ERROR:Failed to decode Kyber ciphertext".to_string(),
    };
    let nonce_bytes = match general_purpose::STANDARD.decode(parts[2]) {
        Ok(b) => b,
        Err(_) => return "QZ_ERROR:Failed to decode nonce".to_string(),
    };
    let aes_ct_bytes = match general_purpose::STANDARD.decode(parts[3]) {
        Ok(b) => b,
        Err(_) => return "QZ_ERROR:Failed to decode AES ciphertext".to_string(),
    };

    // Decode the private key
    let private_key_bytes = match general_purpose::STANDARD.decode(private_key_b64) {
        Ok(b) => b,
        Err(_) => return "QZ_ERROR:Invalid base64 private key".to_string(),
    };

    if private_key_bytes.len() != KYBER_SECRETKEYBYTES {
        return "QZ_ERROR:Invalid private key length".to_string();
    }

    let mut sk = [0u8; KYBER_SECRETKEYBYTES];
    sk.copy_from_slice(&private_key_bytes);

    // Kyber decapsulation: recover the shared secret using the private key
    if kyber_ct_bytes.len() != KYBER_CIPHERTEXTBYTES {
        return "QZ_ERROR:Invalid Kyber ciphertext length".to_string();
    }

    let mut kyber_ct = [0u8; KYBER_CIPHERTEXTBYTES];
    kyber_ct.copy_from_slice(&kyber_ct_bytes);

    let shared_secret = match decapsulate(&kyber_ct, &sk) {
        Ok(ss) => ss,
        Err(_) => return "QZ_ERROR:Kyber decapsulation failed — wrong private key?".to_string(),
    };

    // AES-256-GCM decryption using the recovered shared secret
    let aes_key = Key::<Aes256Gcm>::from_slice(&shared_secret);
    let cipher  = Aes256Gcm::new(aes_key);

    if nonce_bytes.len() != 12 {
        return "QZ_ERROR:Invalid nonce length".to_string();
    }
    let nonce = aes_gcm::Nonce::from_slice(&nonce_bytes);

    match cipher.decrypt(nonce, aes_ct_bytes.as_ref()) {
        Ok(plaintext_bytes) => match String::from_utf8(plaintext_bytes) {
            Ok(s)  => s,
            Err(_) => "QZ_ERROR:Decrypted bytes are not valid UTF-8".to_string(),
        },
        Err(_) => "QZ_ERROR:AES-GCM decryption failed — data tampered or wrong key".to_string(),
    }
}

// ============================================================
// BACKWARD COMPATIBILITY
// Keep the old name working (alias for vault_encrypt)
// ============================================================
#[wasm_bindgen]
pub fn encrypt_local_kyber(plaintext: &str) -> String {
    vault_encrypt(plaintext)
}

#[wasm_bindgen]
pub fn get_wasm_version() -> String {
    "3.0.0-dual-mode-pqc".to_string()
}
