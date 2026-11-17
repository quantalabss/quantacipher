//! 5G N32 / SEPP Quantum-Safe Roaming Interconnect Engine (PRINS JWE)
//! Implements 3GPP TS 33.501 §5.9.3 and Annex H (PRotocol for N32 Interconnect Security).
//!
//! Protects inter-PLMN roaming traffic across the N32-f forwarding interface
//! traversing intermediate IPX (IP eXchange) roaming transit providers.
//! Uses post-quantum JWE (RFC 7516) with X-Wing (X25519 + ML-KEM-768) and AES-256-GCM.

use crate::error::QuantaCipherError;
use crate::registry::KemAlgorithm;
use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use zeroize::Zeroizing;

/// Standard RFC 7516 JWE Protected Header for Post-Quantum PRINS Interconnect.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PqJweHeader {
    /// Post-Quantum Key Encapsulation Algorithm ("hybrid-xwing" or "ml-kem-768")
    pub alg: String,
    /// Symmetric Content Encryption Algorithm ("A256GCM")
    pub enc: String,
    /// Key Identifier
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kid: Option<String>,
}

/// 3GPP TS 33.501 Annex H N32-f Message Structure.
/// Non-sensitive routing headers remain readable by intermediate IPX proxies,
/// while sensitive subscriber data is sealed in a Post-Quantum JWE envelope.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct N32fMessage {
    /// Unique 3GPP message transaction identifier
    pub message_id: String,
    /// Originating Serving Network PLMN ID (e.g., "404-45")
    pub sender_plmn: String,
    /// Destination Home Network PLMN ID (e.g., "404-01")
    pub receiver_plmn: String,
    /// Cleartext routing metadata inspected by IPX intermediaries (e.g., HTTP method, API route)
    pub routing_headers: serde_json::Value,
    /// Post-quantum encrypted and integrity-protected payload (RFC 7516 Compact JWE)
    pub protected_payload_jwe: String,
}

/// Protects an N32-f roaming message from a Visiting SEPP (v-SEPP) to a Home SEPP (h-SEPP).
/// Encapsulates a random 256-bit Content Encryption Key (CEK) via X-Wing or ML-KEM-768,
/// and encrypts the sensitive JSON payload under AES-256-GCM.
pub fn protect_n32f_payload(
    message_id: &str,
    sender_plmn: &str,
    receiver_plmn: &str,
    routing_headers: &serde_json::Value,
    sensitive_payload: &serde_json::Value,
    receiver_sepp_public_key_b64: &str,
    algorithm: KemAlgorithm,
) -> Result<N32fMessage, QuantaCipherError> {
    // 1. Decode receiver SEPP public key
    let pk_bytes = base64::engine::general_purpose::STANDARD
        .decode(receiver_sepp_public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    // 2. Encapsulate CEK using Post-Quantum KEM
    let (kem_ct, shared_secret) = algorithm.encapsulate(&pk_bytes)?;

    // 3. Construct JWE Protected Header
    let header = PqJweHeader {
        alg: algorithm.id().to_string(),
        enc: "A256GCM".to_string(),
        kid: Some(format!("sepp-{}", receiver_plmn)),
    };
    let header_json = serde_json::to_vec(&header).map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let header_b64 = URL_SAFE_NO_PAD.encode(&header_json);

    // 4. Generate 12-byte (96-bit) random Nonce for AES-256-GCM
    let mut iv = [0u8; 12];
    rand::rngs::OsRng.fill_bytes(&mut iv);

    // 5. Encrypt Sensitive Payload using AES-256-GCM with Header as AAD
    let payload_bytes = serde_json::to_vec(sensitive_payload).map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let cipher = Aes256Gcm::new_from_slice(shared_secret.as_slice())
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;
    let nonce = Nonce::from_slice(&iv);

    let ciphertext_with_tag = cipher
        .encrypt(
            nonce,
            Payload {
                msg: &payload_bytes,
                aad: header_b64.as_bytes(),
            },
        )
        .map_err(|_| QuantaCipherError::EncryptionFailed)?;

    // Split ciphertext and 16-byte GCM authentication tag
    if ciphertext_with_tag.len() < 16 {
        return Err(QuantaCipherError::EncryptionFailed);
    }
    let tag_start = ciphertext_with_tag.len() - 16;
    let ciphertext = &ciphertext_with_tag[..tag_start];
    let tag = &ciphertext_with_tag[tag_start..];

    // 6. Format Compact RFC 7516 JWE:
    // BASE64URL(Header) . BASE64URL(EncryptedKey) . BASE64URL(IV) . BASE64URL(Ciphertext) . BASE64URL(Tag)
    let enc_key_b64 = URL_SAFE_NO_PAD.encode(&kem_ct);
    let iv_b64 = URL_SAFE_NO_PAD.encode(&iv);
    let ciphertext_b64 = URL_SAFE_NO_PAD.encode(ciphertext);
    let tag_b64 = URL_SAFE_NO_PAD.encode(tag);

    let compact_jwe = format!(
        "{}.{}.{}.{}.{}",
        header_b64, enc_key_b64, iv_b64, ciphertext_b64, tag_b64
    );

    Ok(N32fMessage {
        message_id: message_id.to_string(),
        sender_plmn: sender_plmn.to_string(),
        receiver_plmn: receiver_plmn.to_string(),
        routing_headers: routing_headers.clone(),
        protected_payload_jwe: compact_jwe,
    })
}

/// Unprotects an N32-f message at the receiving SEPP (Home or Visited).
/// Decapsulates the CEK using the receiver's private key, authenticates the JWE tag,
/// and recovers the sensitive JSON payload.
pub fn unprotect_n32f_payload(
    message: &N32fMessage,
    receiver_sepp_private_key_b64: &str,
) -> Result<serde_json::Value, QuantaCipherError> {
    let parts: Vec<&str> = message.protected_payload_jwe.split('.').collect();
    if parts.len() != 5 {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }

    let header_b64 = parts[0];
    let enc_key_b64 = parts[1];
    let iv_b64 = parts[2];
    let ciphertext_b64 = parts[3];
    let tag_b64 = parts[4];

    // 1. Decode Header
    let header_bytes = URL_SAFE_NO_PAD
        .decode(header_b64)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let header: PqJweHeader = serde_json::from_slice(&header_bytes)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;

    let alg = KemAlgorithm::from_id(&header.alg)?;

    // 2. Decode Encrypted Key and Decapsulate CEK
    let kem_ct = URL_SAFE_NO_PAD
        .decode(enc_key_b64)
        .map_err(|_| QuantaCipherError::InvalidCiphertextLength)?;

    let sk_bytes = Zeroizing::new(
        base64::engine::general_purpose::STANDARD
            .decode(receiver_sepp_private_key_b64)
            .map_err(QuantaCipherError::DecodeError)?,
    );

    let shared_secret = alg.decapsulate(&sk_bytes, &kem_ct)?;

    // 3. Decode IV, Ciphertext, and Tag
    let iv = URL_SAFE_NO_PAD
        .decode(iv_b64)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let mut ciphertext_with_tag = URL_SAFE_NO_PAD
        .decode(ciphertext_b64)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let tag = URL_SAFE_NO_PAD
        .decode(tag_b64)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;

    if iv.len() != 12 || tag.len() != 16 {
        return Err(QuantaCipherError::InvalidPayloadFormat);
    }
    ciphertext_with_tag.extend_from_slice(&tag);

    // 4. Decrypt and Authenticate via AES-256-GCM with Header as AAD
    let cipher = Aes256Gcm::new_from_slice(shared_secret.as_slice())
        .map_err(|_| QuantaCipherError::DecryptionFailed)?;
    let nonce = Nonce::from_slice(&iv);

    let plaintext_bytes = cipher
        .decrypt(
            nonce,
            Payload {
                msg: &ciphertext_with_tag,
                aad: header_b64.as_bytes(),
            },
        )
        .map_err(|_| QuantaCipherError::DecryptionFailed)?;

    let sensitive_payload: serde_json::Value = serde_json::from_slice(&plaintext_bytes)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;

    Ok(sensitive_payload)
}
