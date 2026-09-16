use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use quantacipher_core::{
    vault_encrypt, secure_encrypt, secure_decrypt, generate_keypair,
    sign::{
        registry::{AlgorithmId, generate_keypair as sign_keygen, sign, verify},
    },
};

// Classical baselines
use rsa::pkcs1v15::{SigningKey, VerifyingKey};
use rsa::RsaPrivateKey;
use rsa::sha2::Sha256;
use rsa::signature::{Keypair, RandomizedSigner};
use p256::{
    ecdsa::{SigningKey as EcdsaSigningKey, VerifyingKey as EcdsaVerifyingKey, Signature},
    ecdsa::signature::{Signer as EcdsaSigner, Verifier as EcdsaVerifier},
};

const PAYLOAD_1KB: &[u8]  = &[0x41u8; 1024];
const PAYLOAD_1MB: &[u8]  = &[0x41u8; 1024 * 1024];

// ─────────────────────────────────────────────────────────────────────────────
// Benchmarks: Key Generation
// ─────────────────────────────────────────────────────────────────────────────

fn bench_keygen(c: &mut Criterion) {
    let mut group = c.benchmark_group("key_generation");

    // ML-KEM-1024 (QuantaCipher)
    group.bench_function("ML-KEM-1024 (QuantaCipher)", |b| {
        b.iter(|| black_box(generate_keypair().unwrap()))
    });

    // RSA-4096 baseline
    let mut rng = rand::thread_rng();
    group.bench_function("RSA-4096 (baseline)", |b| {
        b.iter(|| black_box(RsaPrivateKey::new(&mut rng, 4096).unwrap()))
    });

    // P-256 (ECDH) baseline
    group.bench_function("ECDH P-256 (baseline)", |b| {
        b.iter(|| black_box(EcdsaSigningKey::random(&mut rng)))
    });

    group.finish();
}

// ─────────────────────────────────────────────────────────────────────────────
// Benchmarks: Signing Key Generation
// ─────────────────────────────────────────────────────────────────────────────

fn bench_sign_keygen(c: &mut Criterion) {
    let mut group = c.benchmark_group("signing_key_generation");

    group.bench_function("Falcon-512 (QuantaCipher)", |b| {
        b.iter(|| black_box(sign_keygen(Some(AlgorithmId::Falcon512Draft)).unwrap()))
    });

    group.bench_function("ML-DSA-44 (QuantaCipher)", |b| {
        b.iter(|| black_box(sign_keygen(Some(AlgorithmId::MlDsa44)).unwrap()))
    });

    let mut rng = rand::thread_rng();
    group.bench_function("ECDSA P-256 (baseline)", |b| {
        b.iter(|| black_box(EcdsaSigningKey::random(&mut rng)))
    });

    group.bench_function("RSA-4096 signing keygen (baseline)", |b| {
        b.iter(|| black_box(SigningKey::<Sha256>::new(RsaPrivateKey::new(&mut rng, 4096).unwrap())))
    });

    group.finish();
}

// ─────────────────────────────────────────────────────────────────────────────
// Benchmarks: Vault Encryption (1KB, 1MB)
// ─────────────────────────────────────────────────────────────────────────────

fn bench_vault_encrypt(c: &mut Criterion) {
    let mut group = c.benchmark_group("vault_encryption");

    for (label, payload) in [("1KB", PAYLOAD_1KB), ("1MB", PAYLOAD_1MB)] {
        let plaintext = std::str::from_utf8(payload).unwrap_or("A");

        group.bench_with_input(
            BenchmarkId::new("ML-KEM-1024_vault (QuantaCipher)", label),
            label,
            |b, _| b.iter(|| black_box(vault_encrypt(black_box(plaintext)).unwrap())),
        );
    }

    group.finish();
}

// ─────────────────────────────────────────────────────────────────────────────
// Benchmarks: Secure Encrypt/Decrypt (1KB)
// ─────────────────────────────────────────────────────────────────────────────

fn bench_secure_encrypt_decrypt(c: &mut Criterion) {
    let mut group = c.benchmark_group("secure_encrypt_decrypt");
    let plaintext = std::str::from_utf8(PAYLOAD_1KB).unwrap_or("A");

    // QuantaCipher secure encrypt
    let (pub_key, _priv_key) = generate_keypair().unwrap();
    group.bench_function("ML-KEM-1024 encrypt 1KB (QuantaCipher)", |b| {
        b.iter(|| black_box(secure_encrypt(black_box(plaintext), black_box(&pub_key)).unwrap()))
    });

    // QuantaCipher secure decrypt
    let (pub_key2, priv_key2) = generate_keypair().unwrap();
    let ciphertext = secure_encrypt(plaintext, &pub_key2).unwrap();
    group.bench_function("ML-KEM-1024 decrypt 1KB (QuantaCipher)", |b| {
        b.iter(|| black_box(secure_decrypt(black_box(&ciphertext), black_box(&priv_key2)).unwrap()))
    });

    group.finish();
}

// ─────────────────────────────────────────────────────────────────────────────
// Benchmarks: Sign + Verify (1KB payload)
// ─────────────────────────────────────────────────────────────────────────────

fn bench_sign_verify(c: &mut Criterion) {
    let mut group = c.benchmark_group("sign_verify");

    // ── Falcon-512 ────────────────────────────────────────────────────────────
    let falcon_kp = sign_keygen(Some(AlgorithmId::Falcon512Draft)).unwrap();
    group.bench_function("Falcon-512 sign 1KB (QuantaCipher)", |b| {
        b.iter(|| {
            black_box(sign(
                black_box(PAYLOAD_1KB),
                black_box(&falcon_kp.private_key),
                Some(AlgorithmId::Falcon512Draft),
            ).unwrap())
        })
    });

    let falcon_sig = sign(PAYLOAD_1KB, &falcon_kp.private_key, Some(AlgorithmId::Falcon512Draft)).unwrap();
    group.bench_function("Falcon-512 verify 1KB (QuantaCipher)", |b| {
        b.iter(|| {
            black_box(verify(
                black_box(PAYLOAD_1KB),
                black_box(&falcon_sig),
                black_box(&falcon_kp.public_key),
            ).unwrap())
        })
    });

    // ── ML-DSA-44 ─────────────────────────────────────────────────────────────
    let mldsa_kp = sign_keygen(Some(AlgorithmId::MlDsa44)).unwrap();
    group.bench_function("ML-DSA-44 sign 1KB (QuantaCipher)", |b| {
        b.iter(|| {
            black_box(sign(
                black_box(PAYLOAD_1KB),
                black_box(&mldsa_kp.private_key),
                Some(AlgorithmId::MlDsa44),
            ).unwrap())
        })
    });

    let mldsa_sig = sign(PAYLOAD_1KB, &mldsa_kp.private_key, Some(AlgorithmId::MlDsa44)).unwrap();
    group.bench_function("ML-DSA-44 verify 1KB (QuantaCipher)", |b| {
        b.iter(|| {
            black_box(verify(
                black_box(PAYLOAD_1KB),
                black_box(&mldsa_sig),
                black_box(&mldsa_kp.public_key),
            ).unwrap())
        })
    });

    // ── ECDSA P-256 (baseline) ─────────────────────────────────────────────────
    let mut rng = rand::thread_rng();
    let ecdsa_sk = EcdsaSigningKey::random(&mut rng);
    let ecdsa_vk = EcdsaVerifyingKey::from(&ecdsa_sk);

    group.bench_function("ECDSA P-256 sign 1KB (baseline)", |b| {
        b.iter(|| {
            let sig: Signature = ecdsa_sk.sign(black_box(PAYLOAD_1KB));
            black_box(sig)
        })
    });

    let ecdsa_sig: Signature = ecdsa_sk.sign(PAYLOAD_1KB);
    group.bench_function("ECDSA P-256 verify 1KB (baseline)", |b| {
        b.iter(|| {
            black_box(ecdsa_vk.verify(black_box(PAYLOAD_1KB), black_box(&ecdsa_sig)).unwrap())
        })
    });

    // ── RSA-4096 PKCS1v15 (baseline) ──────────────────────────────────────────
    let rsa_sk = RsaPrivateKey::new(&mut rng, 2048).unwrap(); // use 2048 to avoid extremely long bench setup
    let rsa_signing_key = SigningKey::<Sha256>::new(rsa_sk);
    let rsa_verifying_key: VerifyingKey<Sha256> = rsa_signing_key.verifying_key();

    group.bench_function("RSA-2048 sign 1KB (baseline)", |b| {
        b.iter(|| {
            black_box(rsa_signing_key.sign_with_rng(&mut rng, black_box(PAYLOAD_1KB)))
        })
    });

    let rsa_sig = rsa_signing_key.sign_with_rng(&mut rng, PAYLOAD_1KB);
    group.bench_function("RSA-2048 verify 1KB (baseline)", |b| {
        b.iter(|| {
            black_box(rsa_verifying_key.verify(black_box(PAYLOAD_1KB), black_box(&rsa_sig)).unwrap())
        })
    });

    group.finish();
}

criterion_group!(
    benches,
    bench_keygen,
    bench_sign_keygen,
    bench_vault_encrypt,
    bench_secure_encrypt_decrypt,
    bench_sign_verify
);
criterion_main!(benches);
