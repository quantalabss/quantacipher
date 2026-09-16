"""
QuantaCipher Python SDK Benchmark Suite
Compares:
  - ML-KEM-1024 encryption (Vault Mode, Secure Mode) via PyO3 native bindings
  - ML-DSA-44 / Falcon-512 signing via PyO3 native bindings
vs. classical baselines:
  - RSA-4096 (cryptography library)
  - ECDH P-256 / ECDSA P-256 (cryptography library)

Run with:
    pip install pytest pytest-benchmark cryptography
    pytest benchmarks/test_benchmark.py -v --benchmark-sort=mean
"""

import pytest

# ── QuantaCipher SDK ──────────────────────────────────────────────────────────
# NOTE: The native extension must be built first: maturin develop --release
try:
    import _quantacipher_core as qc_core
    QUANTACIPHER_AVAILABLE = True
except ImportError:
    QUANTACIPHER_AVAILABLE = False

# ── Classical baseline: cryptography library ──────────────────────────────────
from cryptography.hazmat.primitives.asymmetric import rsa, ec, padding
from cryptography.hazmat.primitives.asymmetric.rsa import generate_private_key as rsa_gen
from cryptography.hazmat.primitives.asymmetric.ec import (
    generate_private_key as ec_gen,
    SECP256R1, ECDH, ECDSA
)
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend

PAYLOAD_1KB  = b"A" * 1024
PAYLOAD_1MB  = b"A" * (1024 * 1024)


# =============================================================================
#  Key Generation Benchmarks
# =============================================================================

@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_mlkem1024_keygen(benchmark):
    """ML-KEM-1024 keypair generation (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 keygen"
    benchmark(qc_core.generate_keypair)


def test_bench_rsa4096_keygen(benchmark):
    """RSA-4096 keypair generation (baseline)"""
    benchmark.name = "RSA-4096 keygen"
    benchmark(rsa_gen, public_exponent=65537, key_size=4096)


def test_bench_p256_keygen(benchmark):
    """ECDH P-256 keypair generation (baseline)"""
    benchmark.name = "ECDH P-256 keygen"
    benchmark(ec_gen, SECP256R1(), default_backend())


# =============================================================================
#  Signing Key Generation Benchmarks
# =============================================================================

@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_falcon512_keygen(benchmark):
    """Falcon-512 signing keypair generation (QuantaCipher)"""
    benchmark.name = "Falcon-512 sign keygen"
    benchmark(qc_core.sign_generate_keypair, None)


@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_mldsa44_keygen(benchmark):
    """ML-DSA-44 signing keypair generation (QuantaCipher)"""
    benchmark.name = "ML-DSA-44 sign keygen"
    benchmark(qc_core.sign_generate_keypair, "ml-dsa-44")


def test_bench_ecdsa_keygen(benchmark):
    """ECDSA P-256 signing keypair generation (baseline)"""
    benchmark.name = "ECDSA P-256 sign keygen"
    benchmark(ec_gen, SECP256R1(), default_backend())


# =============================================================================
#  Vault Encryption Benchmarks
# =============================================================================

@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_vault_encrypt_1kb(benchmark):
    """ML-KEM-1024 Vault Mode encrypt 1KB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 vault encrypt 1KB"
    payload = PAYLOAD_1KB.decode()
    benchmark(qc_core.vault_encrypt, payload)


@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_vault_encrypt_1mb(benchmark):
    """ML-KEM-1024 Vault Mode encrypt 1MB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 vault encrypt 1MB"
    payload = PAYLOAD_1MB.decode()
    benchmark(qc_core.vault_encrypt, payload)


# =============================================================================
#  Secure Encrypt / Decrypt Benchmarks
# =============================================================================

@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_secure_encrypt_1kb(benchmark):
    """ML-KEM-1024 Secure Mode encrypt 1KB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 secure encrypt 1KB"
    keys = qc_core.generate_keypair()
    pub_key = keys["publicKey"]
    payload = PAYLOAD_1KB.decode()
    benchmark(qc_core.secure_encrypt, payload, pub_key)


@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_secure_decrypt_1kb(benchmark):
    """ML-KEM-1024 Secure Mode decrypt 1KB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 secure decrypt 1KB"
    keys = qc_core.generate_keypair()
    payload = PAYLOAD_1KB.decode()
    ciphertext = qc_core.secure_encrypt(payload, keys["publicKey"])
    benchmark(qc_core.secure_decrypt, ciphertext, keys["privateKey"])


# =============================================================================
#  Sign / Verify Benchmarks
# =============================================================================

@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_falcon512_sign_1kb(benchmark):
    """Falcon-512 sign 1KB (QuantaCipher)"""
    benchmark.name = "Falcon-512 sign 1KB"
    kp = qc_core.sign_generate_keypair(None)
    benchmark(qc_core.sign, PAYLOAD_1KB, kp["private_key"], None)


@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_falcon512_verify_1kb(benchmark):
    """Falcon-512 verify 1KB (QuantaCipher)"""
    benchmark.name = "Falcon-512 verify 1KB"
    kp = qc_core.sign_generate_keypair(None)
    sig = qc_core.sign(PAYLOAD_1KB, kp["private_key"], None)
    benchmark(qc_core.verify, PAYLOAD_1KB, sig, kp["public_key"])


@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_mldsa44_sign_1kb(benchmark):
    """ML-DSA-44 sign 1KB (QuantaCipher)"""
    benchmark.name = "ML-DSA-44 sign 1KB"
    kp = qc_core.sign_generate_keypair("ml-dsa-44")
    benchmark(qc_core.sign, PAYLOAD_1KB, kp["private_key"], "ml-dsa-44")


@pytest.mark.skipif(not QUANTACIPHER_AVAILABLE, reason="quantacipher native extension not built")
def test_bench_mldsa44_verify_1kb(benchmark):
    """ML-DSA-44 verify 1KB (QuantaCipher)"""
    benchmark.name = "ML-DSA-44 verify 1KB"
    kp = qc_core.sign_generate_keypair("ml-dsa-44")
    sig = qc_core.sign(PAYLOAD_1KB, kp["private_key"], "ml-dsa-44")
    benchmark(qc_core.verify, PAYLOAD_1KB, sig, kp["public_key"])


def test_bench_ecdsa_sign_1kb(benchmark):
    """ECDSA P-256 sign 1KB (baseline)"""
    benchmark.name = "ECDSA P-256 sign 1KB"
    sk = ec_gen(SECP256R1(), default_backend())
    benchmark(sk.sign, PAYLOAD_1KB, ECDSA(hashes.SHA256()))


def test_bench_ecdsa_verify_1kb(benchmark):
    """ECDSA P-256 verify 1KB (baseline)"""
    benchmark.name = "ECDSA P-256 verify 1KB"
    sk = ec_gen(SECP256R1(), default_backend())
    vk = sk.public_key()
    sig = sk.sign(PAYLOAD_1KB, ECDSA(hashes.SHA256()))
    benchmark(vk.verify, sig, PAYLOAD_1KB, ECDSA(hashes.SHA256()))
