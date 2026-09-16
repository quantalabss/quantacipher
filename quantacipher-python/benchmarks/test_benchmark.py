"""
QuantaCipher Python SDK Benchmark Suite
Compares:
  - ML-KEM-1024 encryption (Vault Mode, Secure Mode) via PyO3 native bindings
  - Falcon-512 signing via PyO3 native bindings
vs. classical baselines:
  - RSA-4096 (cryptography library)
  - ECDSA / ECDH P-256 (cryptography library)

Run with:
    python3 -m venv .venv && source .venv/bin/activate
    pip install maturin cryptography pytest pytest-benchmark
    maturin develop --release
    pytest benchmarks/test_benchmark.py -v --benchmark-sort=mean
"""

import pytest
import _quantacipher_core as qc

from cryptography.hazmat.primitives.asymmetric.rsa import generate_private_key as rsa_gen
from cryptography.hazmat.primitives.asymmetric.ec import (
    generate_private_key as ec_gen, SECP256R1, ECDSA
)
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend

PAYLOAD_1KB  = "A" * 1024
PAYLOAD_1MB  = "A" * (1024 * 1024)
PAYLOAD_BYTES_1KB = PAYLOAD_1KB.encode()

# =============================================================================
#  Key Generation Benchmarks
# =============================================================================

def test_bench_mlkem1024_keygen(benchmark):
    """ML-KEM-1024 keypair generation (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 keygen"
    benchmark(qc.generate_keypair)


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

def test_bench_falcon512_keygen(benchmark):
    """Falcon-512 signing keypair generation (QuantaCipher)"""
    benchmark.name = "Falcon-512 sign keygen"
    benchmark(qc.generate_signing_keypair, None)


def test_bench_ecdsa_keygen(benchmark):
    """ECDSA P-256 signing keypair generation (baseline)"""
    benchmark.name = "ECDSA P-256 sign keygen"
    benchmark(ec_gen, SECP256R1(), default_backend())


# =============================================================================
#  Vault Encryption Benchmarks
# =============================================================================

def test_bench_vault_encrypt_1kb(benchmark):
    """ML-KEM-1024 Vault Mode encrypt 1KB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 vault encrypt 1KB"
    benchmark(qc.vault_encrypt, PAYLOAD_1KB)


def test_bench_vault_encrypt_1mb(benchmark):
    """ML-KEM-1024 Vault Mode encrypt 1MB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 vault encrypt 1MB"
    benchmark(qc.vault_encrypt, PAYLOAD_1MB)


# =============================================================================
#  Secure Encrypt / Decrypt Benchmarks
# =============================================================================

def test_bench_secure_encrypt_1kb(benchmark):
    """ML-KEM-1024 Secure Mode encrypt 1KB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 secure encrypt 1KB"
    keys = qc.generate_keypair()
    benchmark(qc.secure_encrypt, PAYLOAD_1KB, keys["publicKey"])


def test_bench_secure_decrypt_1kb(benchmark):
    """ML-KEM-1024 Secure Mode decrypt 1KB (QuantaCipher)"""
    benchmark.name = "ML-KEM-1024 secure decrypt 1KB"
    keys = qc.generate_keypair()
    ciphertext = qc.secure_encrypt(PAYLOAD_1KB, keys["publicKey"])
    benchmark(qc.secure_decrypt, ciphertext, keys["privateKey"])


# =============================================================================
#  Sign / Verify Benchmarks
# =============================================================================

def test_bench_falcon512_sign_1kb(benchmark):
    """Falcon-512 sign 1KB (QuantaCipher)"""
    benchmark.name = "Falcon-512 sign 1KB"
    kp = qc.generate_signing_keypair(None)
    benchmark(qc.sign_payload, PAYLOAD_BYTES_1KB, kp["private_key"], None)


def test_bench_falcon512_verify_1kb(benchmark):
    """Falcon-512 verify 1KB (QuantaCipher)"""
    benchmark.name = "Falcon-512 verify 1KB"
    kp = qc.generate_signing_keypair(None)
    sig = qc.sign_payload(PAYLOAD_BYTES_1KB, kp["private_key"], None)
    benchmark(qc.verify_signature, PAYLOAD_BYTES_1KB, sig, kp["public_key"])


def test_bench_ecdsa_sign_1kb(benchmark):
    """ECDSA P-256 sign 1KB (baseline)"""
    benchmark.name = "ECDSA P-256 sign 1KB"
    sk = ec_gen(SECP256R1(), default_backend())
    benchmark(sk.sign, PAYLOAD_BYTES_1KB, ECDSA(hashes.SHA256()))


def test_bench_ecdsa_verify_1kb(benchmark):
    """ECDSA P-256 verify 1KB (baseline)"""
    benchmark.name = "ECDSA P-256 verify 1KB"
    sk = ec_gen(SECP256R1(), default_backend())
    vk = sk.public_key()
    sig = sk.sign(PAYLOAD_BYTES_1KB, ECDSA(hashes.SHA256()))
    benchmark(vk.verify, sig, PAYLOAD_BYTES_1KB, ECDSA(hashes.SHA256()))
