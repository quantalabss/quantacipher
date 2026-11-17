use crate::error::QuantaCipherError;
use crate::sign::{
    registry::{sign, verify, AlgorithmId, envelope_to_json, envelope_from_json},
    types::SignatureEnvelope,
};
use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use serde::{Deserialize, Serialize};

/// 3GPP TS 33.501 §6.3.1 OAuth 2.0 Access Token Claims for Service-Based Architecture (SBA).
/// Issued by NRF to authorize Consumer NFs (AMF, SMF) to access Producer NFs (UDM, AUSF, PCF).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SbaTokenClaims {
    /// Issuer: NRF FQDN or Instance ID (e.g., "nrf-01.5gc.mnc045.mcc404.3gppnetwork.org")
    pub iss: String,
    /// Subject: Consumer NF Instance ID (e.g., "amf-01.5gc.mnc045.mcc404.3gppnetwork.org")
    pub sub: String,
    /// Audience: Target Producer NF Type or Instance ID (e.g., "udm", "ausf", "pcf")
    pub aud: String,
    /// Scope: 3GPP Service Name (e.g., "nudm-sdm", "nudm-uecm", "nausf-auth", "nsmf-pdusession")
    pub scope: String,
    /// Expiration time (Unix timestamp in seconds)
    pub exp: u64,
    /// Issued-at time (Unix timestamp in seconds)
    pub iat: u64,
    /// Mobile Country Code of the Serving PLMN (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plmn_mcc: Option<String>,
    /// Mobile Network Code of the Serving PLMN (optional)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub plmn_mnc: Option<String>,
}

/// JOSE Header for Post-Quantum 5G SBA Access Tokens per TEC 910028:2025 §6.3.1.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PqJwtHeader {
    /// Signature algorithm identifier ("ml-dsa-65" or "hybrid-mldsa65-p256")
    pub alg: String,
    /// Type identifier: "JWT"
    pub typ: String,
}

/// Issues a Post-Quantum OAuth 2.0 Access Token (PQ-JWT) for 5G SBA inter-NF communication.
/// Signed by the Network Repository Function (NRF) using ML-DSA-65 or Hybrid ML-DSA-65 + ECDSA P-256.
pub fn issue_sba_token(
    claims: &SbaTokenClaims,
    nrf_private_key_b64: &str,
    algorithm: AlgorithmId,
) -> Result<String, QuantaCipherError> {
    let header = PqJwtHeader {
        alg: algorithm.as_str().to_string(),
        typ: "JWT".to_string(),
    };

    let header_json = serde_json::to_vec(&header).map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let claims_json = serde_json::to_vec(claims).map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;

    let header_b64 = URL_SAFE_NO_PAD.encode(&header_json);
    let claims_b64 = URL_SAFE_NO_PAD.encode(&claims_json);

    // Standard JWT signing input: BASE64URL(Header) . BASE64URL(Claims)
    let signing_input = format!("{}.{}", header_b64, claims_b64);

    // Sign using Post-Quantum / Hybrid Signature Engine
    let envelope = sign(signing_input.as_bytes(), nrf_private_key_b64, Some(algorithm))?;
    let envelope_json = envelope_to_json(&envelope)?;
    let sig_b64 = URL_SAFE_NO_PAD.encode(envelope_json.as_bytes());

    Ok(format!("{}.{}", signing_input, sig_b64))
}

/// Verifies a 5G SBA PQ-JWT Access Token at a Producer Network Function (UDM, AUSF, SMF).
/// Validates signature authenticity, expiration, and audience against the receiving NF.
pub fn verify_sba_token(
    token_str: &str,
    nrf_public_key_b64: &str,
    expected_aud: &str,
    current_time_unix: u64,
) -> Result<SbaTokenClaims, QuantaCipherError> {
    let parts: Vec<&str> = token_str.split('.').collect();
    if parts.len() != 3 {
        return Err(QuantaCipherError::InvalidSignatureFormat);
    }

    let header_b64 = parts[0];
    let claims_b64 = parts[1];
    let sig_b64 = parts[2];

    let signing_input = format!("{}.{}", header_b64, claims_b64);

    // Decode and parse claims
    let claims_bytes = URL_SAFE_NO_PAD
        .decode(claims_b64)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;
    let claims: SbaTokenClaims = serde_json::from_slice(&claims_bytes)
        .map_err(|_| QuantaCipherError::InvalidPayloadFormat)?;

    // 1. Verify Expiration
    if current_time_unix >= claims.exp {
        return Err(QuantaCipherError::DecryptionFailed); // Token Expired
    }

    // 2. Verify Audience (if specified)
    if !expected_aud.is_empty() && claims.aud != expected_aud {
        return Err(QuantaCipherError::InvalidPayloadFormat); // Audience mismatch
    }

    // 3. Decode signature envelope
    let envelope_bytes = URL_SAFE_NO_PAD
        .decode(sig_b64)
        .map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;
    let envelope_str = String::from_utf8(envelope_bytes)
        .map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;
    let envelope: SignatureEnvelope = envelope_from_json(&envelope_str)?;

    // 4. Verify Cryptographic Signature
    let valid = verify(signing_input.as_bytes(), &envelope, nrf_public_key_b64)?;
    if !valid {
        return Err(QuantaCipherError::VerificationFailed);
    }

    Ok(claims)
}
