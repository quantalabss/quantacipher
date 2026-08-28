use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use base64::{engine::general_purpose, Engine as _};
use zeroize::Zeroizing;
use ml_dsa::{
    MlDsa44, Generate, Keypair, Signer, Verifier,
    SigningKey, VerifyingKey, Signature,
    EncodedVerifyingKey,
    signature::SignatureEncoding,
};

/// Generate an ML-DSA-44 signing keypair.
pub fn generate_keypair() -> Result<SigningKeyPair, QuantaCipherError> {
    let sk = SigningKey::<MlDsa44>::generate();
    let vk = sk.verifying_key();

    // SigningKey serializes as a 32-byte seed; VerifyingKey via .encode()
    let sk_seed = sk.to_seed();
    let vk_encoded: EncodedVerifyingKey<MlDsa44> = vk.encode();

    Ok(SigningKeyPair {
        public_key: general_purpose::STANDARD.encode(vk_encoded.as_slice()),
        private_key: general_purpose::STANDARD.encode(sk_seed.as_slice()),
        algorithm: alg_ids::ML_DSA_44.to_string(),
    })
}

/// Sign `payload` with an ML-DSA-44 private key (stored as a 32-byte seed).
pub fn sign(payload: &[u8], private_key_b64: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    // Zeroizing ensures the raw seed bytes are securely wiped from heap
    // memory when this scope exits — consistent with how the KEM path
    // handles shared secrets in lib.rs.
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
    let sk = SigningKey::<MlDsa44>::from_seed(seed);

    let sig: Signature<MlDsa44> = sk.sign(payload);
    // to_bytes() returns EncodedSignature<P> = Array<u8, N>; .as_slice() makes it unambiguous
    let encoded = sig.to_bytes();

    Ok(SignatureEnvelope {
        alg: alg_ids::ML_DSA_44.to_string(),
        sig: general_purpose::STANDARD.encode(encoded.as_slice()),
        ver: 1,
    })
}

/// Verify an ML-DSA-44 signature.
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

    // VerifyingKey has no from_bytes — must go through EncodedVerifyingKey then .decode()
    let enc_vk: EncodedVerifyingKey<MlDsa44> = vk_bytes.as_slice()
        .try_into()
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let vk = VerifyingKey::<MlDsa44>::decode(&enc_vk);

    // Signature implements TryFrom<&[u8]>
    let sig = Signature::<MlDsa44>::try_from(sig_bytes.as_slice())
        .map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;

    Ok(vk.verify(payload, &sig).is_ok())
}
