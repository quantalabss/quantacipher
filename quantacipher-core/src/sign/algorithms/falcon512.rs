use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use base64::{engine::general_purpose, Engine as _};
use zeroize::Zeroizing;
// NOTE: The crate name on crates.io is `falcon-rs` but the Rust module name is `falcon`
use falcon::prelude::{FnDsaKeyPair, FnDsaSignature, DomainSeparation};

/// FN-DSA-512 logn parameter (9 = 2^9 = 512, NIST Level I). Must be u32 per API.
const LOGN_512: u32 = 9;

/// Generate a Falcon-512 signing keypair.
///
/// NOTE: This implements FN-DSA per the FIPS 206 *draft* (not yet finalized).
/// Output is tagged `alg: "falcon-512-fips206-draft"`. When FIPS 206 is
/// finalized, a new ID "falcon-512-fips206-final" will be registered; this
/// draft ID must remain registered so existing signatures stay verifiable.
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
///
/// # AUDIT NOTE — Constant-Time Gaussian Sampling
/// Falcon's signing algorithm uses a floating-point Gaussian sampler
/// (FalconTree / fast Fourier sampling). The reference implementation
/// (which `falcon-rs` is based on) does NOT guarantee constant-time behavior
/// on all platforms for this step — this is the known hard-to-implement-safely
/// part of FN-DSA documented in the spec.
///
/// This call site MUST be prioritized in the QuantaKrypto security audit
/// before any public release that claims side-channel resistance for Falcon-512.
///
/// AUDIT: constant-time — Falcon Gaussian sampler, see falcon-rs internals
pub fn sign(payload: &[u8], private_key_b64: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    // Zeroizing ensures raw private key bytes are wiped from heap when this
    // scope exits — prevents key material from lingering in memory after signing.
    let sk_bytes = Zeroizing::new(
        general_purpose::STANDARD
            .decode(private_key_b64)
            .map_err(QuantaCipherError::DecodeError)?
    );

    // Restore keypair from private key (derives public key internally)
    let kp = FnDsaKeyPair::from_private_key(&sk_bytes)
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;

    // AUDIT: constant-time — Falcon Gaussian sampler starts here
    let sig = kp.sign(payload, &DomainSeparation::None)
        .map_err(|_| QuantaCipherError::SigningFailed)?;
    // AUDIT: constant-time — Falcon Gaussian sampler ends here

    Ok(SignatureEnvelope {
        alg: alg_ids::FALCON_512_DRAFT.to_string(),
        sig: general_purpose::STANDARD.encode(sig.to_bytes()),
        ver: 1,
    })
}

/// Verify a Falcon-512 signature.
/// The `envelope.alg` must already be `"falcon-512-fips206-draft"` — the
/// registry ensures this function is only called for that exact algorithm ID.
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

    // FnDsaSignature::verify returns Ok(()) on success, Err on failure
    Ok(FnDsaSignature::verify(
        &sig_bytes,
        &pk_bytes,
        payload,
        &DomainSeparation::None,
    ).is_ok())
}
