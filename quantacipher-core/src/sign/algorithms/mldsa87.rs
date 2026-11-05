use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use base64::{engine::general_purpose, Engine as _};
use zeroize::Zeroizing;
use ml_dsa::{
    MlDsa87, Generate, Keypair, Signer, Verifier,
    SigningKey, VerifyingKey, Signature,
    EncodedVerifyingKey,
    signature::SignatureEncoding,
};

/// Generate an ML-DSA-87 signing keypair (FIPS 204).
pub fn generate_keypair() -> Result<SigningKeyPair, QuantaCipherError> {
    let sk = SigningKey::<MlDsa87>::generate();
    let vk = sk.verifying_key();

    let sk_seed = sk.to_seed();
    let vk_encoded: EncodedVerifyingKey<MlDsa87> = vk.encode();

    Ok(SigningKeyPair {
        public_key: general_purpose::STANDARD.encode(vk_encoded.as_slice()),
        private_key: general_purpose::STANDARD.encode(sk_seed.as_slice()),
        algorithm: alg_ids::ML_DSA_87.to_string(),
    })
}

/// Sign `payload` with an ML-DSA-87 private key (stored as a 32-byte seed).
/// Produces an authenticated V2 SignatureEnvelope binding `alg` and `ver` into the signature.
pub fn sign(payload: &[u8], private_key_b64: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    let sk_seed_bytes = Zeroizing::new(
        general_purpose::STANDARD
            .decode(private_key_b64)
            .map_err(QuantaCipherError::DecodeError)?
    );

    if sk_seed_bytes.len() != 32 {
        return Err(QuantaCipherError::InvalidPrivateKeyLength);
    }

    let seed: &ml_dsa::Seed = sk_seed_bytes.as_slice()
        .try_into()
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
    let sk = SigningKey::<MlDsa87>::from_seed(seed);

    // V2 envelope authenticates header by binding it into the signed message
    let mut bound_msg = format!("QC_SIG_V2:{}:", alg_ids::ML_DSA_87).into_bytes();
    bound_msg.extend_from_slice(payload);

    let sig: Signature<MlDsa87> = sk.sign(&bound_msg);
    let encoded = sig.to_bytes();

    Ok(SignatureEnvelope {
        alg: alg_ids::ML_DSA_87.to_string(),
        sig: general_purpose::STANDARD.encode(encoded.as_slice()),
        ver: 2,
    })
}

/// Verify an ML-DSA-87 signature against `payload`.
/// Handles both V2 bound envelopes and V1 legacy envelopes.
pub fn verify(
    payload: &[u8],
    envelope: &SignatureEnvelope,
    public_key_b64: &str,
) -> Result<bool, QuantaCipherError> {
    let vk_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    let sig_bytes = general_purpose::STANDARD
        .decode(&envelope.sig)
        .map_err(QuantaCipherError::DecodeError)?;

    let enc_vk: EncodedVerifyingKey<MlDsa87> = vk_bytes.as_slice()
        .try_into()
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let vk = VerifyingKey::<MlDsa87>::decode(&enc_vk);

    let sig = Signature::<MlDsa87>::try_from(sig_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;

    let bound_msg = if envelope.ver >= 2 {
        let mut m = format!("QC_SIG_V2:{}:", envelope.alg).into_bytes();
        m.extend_from_slice(payload);
        m
    } else {
        payload.to_vec()
    };

    Ok(vk.verify(&bound_msg, &sig).is_ok())
}
