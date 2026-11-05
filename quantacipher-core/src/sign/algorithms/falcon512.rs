use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use base64::{engine::general_purpose, Engine as _};
use zeroize::Zeroizing;
// NOTE: The crate name on crates.io is `falcon-rs` but the Rust module name is `falcon`
use falcon::prelude::{FnDsaKeyPair, FnDsaSignature, DomainSeparation};

/// FN-DSA-512 logn parameter (9 = 2^9 = 512, NIST Level I). Must be u32 per API.
const LOGN_512: u32 = 9;

/// Generate a Falcon-512 signing keypair.
pub fn generate_keypair() -> Result<SigningKeyPair, QuantaCipherError> {
    let kp = FnDsaKeyPair::generate(LOGN_512)
        .map_err(|_| QuantaCipherError::SignKeygenFailed)?;

    Ok(SigningKeyPair {
        public_key: general_purpose::STANDARD.encode(kp.public_key()),
        private_key: general_purpose::STANDARD.encode(kp.private_key()),
        algorithm: alg_ids::FALCON_512_DRAFT.to_string(),
    })
}

/// Sign `payload` with a Falcon-512 private key.
/// Produces an authenticated V2 SignatureEnvelope binding `alg` and `ver` into the signature.
pub fn sign(payload: &[u8], private_key_b64: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    let sk_bytes = Zeroizing::new(
        general_purpose::STANDARD
            .decode(private_key_b64)
            .map_err(QuantaCipherError::DecodeError)?
    );

    let kp = FnDsaKeyPair::from_private_key(&sk_bytes)
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;

    let mut bound_msg = format!("QC_SIG_V2:{}:", alg_ids::FALCON_512_DRAFT).into_bytes();
    bound_msg.extend_from_slice(payload);

    let sig = kp.sign(&bound_msg, &DomainSeparation::None)
        .map_err(|_| QuantaCipherError::SigningFailed)?;

    Ok(SignatureEnvelope {
        alg: alg_ids::FALCON_512_DRAFT.to_string(),
        sig: general_purpose::STANDARD.encode(sig.to_bytes()),
        ver: 2,
    })
}

/// Verify a Falcon-512 signature.
/// Handles both V2 bound envelopes and V1 legacy envelopes.
pub fn verify(
    payload: &[u8],
    envelope: &SignatureEnvelope,
    public_key_b64: &str,
) -> Result<bool, QuantaCipherError> {
    let pk_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    let sig_bytes = general_purpose::STANDARD
        .decode(&envelope.sig)
        .map_err(QuantaCipherError::DecodeError)?;

    let bound_msg = if envelope.ver >= 2 {
        let mut m = format!("QC_SIG_V2:{}:", envelope.alg).into_bytes();
        m.extend_from_slice(payload);
        m
    } else {
        payload.to_vec()
    };

    Ok(FnDsaSignature::verify(
        &sig_bytes,
        &pk_bytes,
        &bound_msg,
        &DomainSeparation::None,
    ).is_ok())
}
