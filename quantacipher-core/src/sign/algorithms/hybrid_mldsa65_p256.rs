use crate::error::QuantaCipherError;
use crate::sign::types::{SignatureEnvelope, SigningKeyPair, alg_ids};
use base64::{engine::general_purpose, Engine as _};
use zeroize::Zeroizing;
use sha2::{Digest, Sha256};
use ml_dsa::{
    MlDsa65, Generate, Keypair, Signer as MlSigner, Verifier as MlVerifier,
    SigningKey as MlSigningKey, VerifyingKey as MlVerifyingKey, Signature as MlSignature,
    EncodedVerifyingKey,
    signature::SignatureEncoding,
};
use p256::ecdsa::{
    SigningKey as EcdsaSigningKey, VerifyingKey as EcdsaVerifyingKey,
    Signature as EcdsaSignature,
    signature::{Signer as _, Verifier as _},
};

/// Size constants for Hybrid ML-DSA-65 + ECDSA P-256:
pub const MLDSA65_VK_LEN: usize = 1952;
pub const MLDSA65_SEED_LEN: usize = 32;
pub const MLDSA65_SIG_LEN: usize = 3309;

pub const P256_PK_LEN: usize = 33; // SEC1 compressed
pub const P256_SK_LEN: usize = 32;
pub const P256_SIG_LEN: usize = 64; // IEEE P1363 (r || s)

pub const COMBINED_PUBLIC_KEY_LEN: usize = MLDSA65_VK_LEN + P256_PK_LEN; // 1985
pub const COMBINED_PRIVATE_KEY_LEN: usize = MLDSA65_SEED_LEN + P256_SK_LEN; // 64
pub const COMBINED_SIG_LEN: usize = MLDSA65_SIG_LEN + P256_SIG_LEN; // 3373

/// Generate a Hybrid signing keypair combining FIPS 204 ML-DSA-65 and ECDSA P-256
/// in alignment with TEC 910018:2025 Figure 3.
pub fn generate_keypair() -> Result<SigningKeyPair, QuantaCipherError> {
    // 1. Post-quantum ML-DSA-65 keypair
    let mldsa_sk = MlSigningKey::<MlDsa65>::generate();
    let mldsa_vk = mldsa_sk.verifying_key();
    let mldsa_seed = mldsa_sk.to_seed();
    let mldsa_vk_encoded: EncodedVerifyingKey<MlDsa65> = mldsa_vk.encode();

    // 2. Classical ECDSA P-256 keypair
    let mut rng = rand::rngs::OsRng;
    let ecdsa_sk = EcdsaSigningKey::random(&mut rng);
    let ecdsa_vk = EcdsaVerifyingKey::from(&ecdsa_sk);
    let ecdsa_vk_point = ecdsa_vk.to_encoded_point(true); // compressed 33 bytes
    let ecdsa_sk_bytes = ecdsa_sk.to_bytes(); // 32 bytes

    // 3. Combine Public Keys (1952 + 33 = 1985 bytes)
    let mut combined_pk = Vec::with_capacity(COMBINED_PUBLIC_KEY_LEN);
    combined_pk.extend_from_slice(mldsa_vk_encoded.as_slice());
    combined_pk.extend_from_slice(ecdsa_vk_point.as_bytes());

    // 4. Combine Private Keys (32 + 32 = 64 bytes)
    let mut combined_sk = Vec::with_capacity(COMBINED_PRIVATE_KEY_LEN);
    combined_sk.extend_from_slice(mldsa_seed.as_slice());
    combined_sk.extend_from_slice(&ecdsa_sk_bytes);

    Ok(SigningKeyPair {
        public_key: general_purpose::STANDARD.encode(&combined_pk),
        private_key: general_purpose::STANDARD.encode(&combined_sk),
        algorithm: alg_ids::HYBRID_ML_DSA_65_P256.to_string(),
    })
}

/// Sign `payload` with the combined private key per TEC 910018:2025 Section 3.4 & Figure 3:
/// - Step 1: Sign message M with PQC ML-DSA-65 (Sign1)
/// - Step 2: Compute SHA-256(M) and bind: D = Sign1 || SHA-256(M)
/// - Step 3: Sign D with Classical ECDSA P-256 (Sign2)
/// Both signatures are packaged into a non-separable envelope.
pub fn sign(payload: &[u8], private_key_b64: &str) -> Result<SignatureEnvelope, QuantaCipherError> {
    let sk_bytes = Zeroizing::new(
        general_purpose::STANDARD
            .decode(private_key_b64)
            .map_err(QuantaCipherError::DecodeError)?
    );

    if sk_bytes.len() != COMBINED_PRIVATE_KEY_LEN {
        return Err(QuantaCipherError::InvalidPrivateKeyLength);
    }

    let mldsa_seed_bytes = &sk_bytes[..MLDSA65_SEED_LEN];
    let ecdsa_sk_bytes = &sk_bytes[MLDSA65_SEED_LEN..];

    // Load ML-DSA-65 key
    let seed: &ml_dsa::Seed = mldsa_seed_bytes
        .try_into()
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
    let mldsa_sk = MlSigningKey::<MlDsa65>::from_seed(seed);

    // Sign1: ML-DSA-65 over payload with domain separation prefix
    let mut bound_msg = format!("QC_SIG_V2:{}:", alg_ids::HYBRID_ML_DSA_65_P256).into_bytes();
    bound_msg.extend_from_slice(payload);
    let mldsa_sig: MlSignature<MlDsa65> = mldsa_sk.sign(&bound_msg);
    let mldsa_sig_bytes = mldsa_sig.to_bytes();

    // Sign2: Classical ECDSA P-256 over (Sign1 || SHA-256(payload)) per TEC Fig 3
    let mut hasher = Sha256::new();
    hasher.update(payload);
    let msg_hash = hasher.finalize();

    let mut classical_bound = Vec::with_capacity(MLDSA65_SIG_LEN + 32);
    classical_bound.extend_from_slice(mldsa_sig_bytes.as_slice());
    classical_bound.extend_from_slice(&msg_hash);

    let ecdsa_sk = EcdsaSigningKey::from_bytes(ecdsa_sk_bytes.into())
        .map_err(|_| QuantaCipherError::InvalidPrivateKeyLength)?;
    let ecdsa_sig: EcdsaSignature = ecdsa_sk.sign(&classical_bound);
    let ecdsa_sig_bytes = ecdsa_sig.to_bytes();

    // Package non-separable signature: Sign1 (3309 bytes) || Sign2 (64 bytes)
    let mut combined_sig = Vec::with_capacity(COMBINED_SIG_LEN);
    combined_sig.extend_from_slice(mldsa_sig_bytes.as_slice());
    combined_sig.extend_from_slice(&ecdsa_sig_bytes);

    Ok(SignatureEnvelope {
        alg: alg_ids::HYBRID_ML_DSA_65_P256.to_string(),
        sig: general_purpose::STANDARD.encode(&combined_sig),
        ver: 2,
    })
}

/// Verify a Hybrid signature per TEC 910018:2025 Figure 3.
/// Both Sign2 (Classical ECDSA) and Sign1 (PQC ML-DSA-65) must be valid.
/// Any separation or forgery attempts are immediately rejected.
pub fn verify(
    payload: &[u8],
    envelope: &SignatureEnvelope,
    public_key_b64: &str,
) -> Result<bool, QuantaCipherError> {
    let pk_bytes = general_purpose::STANDARD
        .decode(public_key_b64)
        .map_err(QuantaCipherError::DecodeError)?;

    if pk_bytes.len() != COMBINED_PUBLIC_KEY_LEN {
        return Err(QuantaCipherError::InvalidPublicKeyLength);
    }

    let sig_bytes = general_purpose::STANDARD
        .decode(&envelope.sig)
        .map_err(QuantaCipherError::DecodeError)?;

    if sig_bytes.len() != COMBINED_SIG_LEN {
        return Err(QuantaCipherError::InvalidSignatureFormat);
    }

    let mldsa_vk_bytes = &pk_bytes[..MLDSA65_VK_LEN];
    let ecdsa_pk_bytes = &pk_bytes[MLDSA65_VK_LEN..];

    let mldsa_sig_bytes = &sig_bytes[..MLDSA65_SIG_LEN];
    let ecdsa_sig_bytes = &sig_bytes[MLDSA65_SIG_LEN..];

    // 1. Verify Classical Signature (Sign2) over (Sign1 || SHA-256(payload))
    let mut hasher = Sha256::new();
    hasher.update(payload);
    let msg_hash = hasher.finalize();

    let mut classical_bound = Vec::with_capacity(MLDSA65_SIG_LEN + 32);
    classical_bound.extend_from_slice(mldsa_sig_bytes);
    classical_bound.extend_from_slice(&msg_hash);

    let ecdsa_vk = EcdsaVerifyingKey::from_sec1_bytes(ecdsa_pk_bytes)
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let ecdsa_sig = EcdsaSignature::try_from(ecdsa_sig_bytes)
        .map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;

    if ecdsa_vk.verify(&classical_bound, &ecdsa_sig).is_err() {
        return Ok(false);
    }

    // 2. Verify Post-Quantum Signature (Sign1) over bound message
    let enc_vk: EncodedVerifyingKey<MlDsa65> = mldsa_vk_bytes
        .try_into()
        .map_err(|_| QuantaCipherError::InvalidPublicKeyLength)?;
    let mldsa_vk = MlVerifyingKey::<MlDsa65>::decode(&enc_vk);

    let mldsa_sig = MlSignature::<MlDsa65>::try_from(mldsa_sig_bytes)
        .map_err(|_| QuantaCipherError::InvalidSignatureFormat)?;

    let mut bound_msg = format!("QC_SIG_V2:{}:", alg_ids::HYBRID_ML_DSA_65_P256).into_bytes();
    bound_msg.extend_from_slice(payload);

    let pq_valid = mldsa_vk.verify(&bound_msg, &mldsa_sig).is_ok();
    Ok(pq_valid)
}
