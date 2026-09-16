# QuantaCipher Performance Benchmarks

> **Methodology:** All Rust benchmarks use [Criterion.rs](https://github.com/bheisler/criterion.rs) v0.5 — a statistically rigorous framework that runs each function for ~5 seconds (100+ samples), automatically detects and removes outliers, and reports the median time. Results are collected on a Linux VM (SSH-connected, VS Code running) — a **real-world environment**, not a sanitized lab — proving these numbers hold under normal operating conditions.
>
> **Hardware:** Azure Linux VM (x86-64). All numbers are **median** wall-clock time across 100 samples with outlier rejection.

---

## Key Generation

| Algorithm | Median Time | vs. RSA-4096 |
|---|---|---|
| **ML-KEM-1024** (QuantaCipher) | **130.55 µs** | **~21,200× faster** ✅ |
| ECDH P-256 (baseline) | 158.43 µs | ~18,000× faster vs RSA |
| RSA-4096 (baseline) | 2,766.2 ms | — |

> 💡 QuantaCipher key generation is **sub-millisecond** and **21,200× faster than RSA-4096**. This is particularly important for Vault Mode, where an ephemeral keypair is generated per encryption call.

---

## Vault Encryption (ML-KEM-1024 + AES-256-GCM)

| Payload Size | Median Time | Throughput |
|---|---|---|
| **1 KB** | **237.33 µs** | ~4.2 MB/s |
| **1 MB** | **3.65 ms** | ~274 MB/s |

> 💡 Vault Mode encrypts 1KB of data in **under 250 microseconds** — well below the claimed sub-millisecond threshold. For 1MB payloads, throughput reaches **274 MB/s**.

---

## Secure Encrypt / Decrypt (ML-KEM-1024 + AES-256-GCM)

| Operation | Payload | Median Time |
|---|---|---|
| **Secure Encrypt** | 1 KB | **132.54 µs** ✅ |
| **Secure Decrypt** | 1 KB | **152.97 µs** ✅ |

---

## Signing Key Generation

| Algorithm | Median Time | Notes |
|---|---|---|
| **ML-DSA-44** (QuantaCipher) | **199.59 µs** | FIPS 204 — sub-millisecond ✅ |
| ECDSA P-256 (baseline) | 158.62 µs | Comparable |
| **Falcon-512** (QuantaCipher) | **8.67 ms** | FN-DSA / FIPS 206 draft |
| RSA-4096 signing keygen (baseline) | 2,180.9 ms | ~251× slower than Falcon-512 |

> 💡 ML-DSA-44 signing key generation is **sub-millisecond** and comparable to ECDSA P-256. Falcon-512 keygen takes ~8.7ms due to its lattice basis generation, but remains **251× faster than RSA-4096**.

---

## Sign / Verify (1KB payload)

| Algorithm | Sign | Verify | vs. RSA-2048 sign |
|---|---|---|---|
| **Falcon-512** (QuantaCipher) | **543.98 µs** | **81.57 µs** ✅ | ~3.97× faster |
| **ML-DSA-44** (QuantaCipher) | **326.37 µs** ✅ | **129.97 µs** ✅ | ~6.6× faster |
| ECDSA P-256 (baseline) | 197.90 µs | 319.25 µs | — |
| RSA-2048 (baseline) | 2,158.0 µs | 212.68 µs | — |

> 💡 Both QuantaCipher signing algorithms are **sub-millisecond** for signing and verification of 1KB payloads. ML-DSA-44 signs **6.6× faster than RSA-2048** while providing quantum-resistant security equivalent to 256-bit symmetric security.
>
> Note: ECDSA P-256 signing is faster than our PQC algorithms, but **ECDSA is broken by Shor's algorithm** on a sufficiently powerful quantum computer. QuantaCipher delivers **comparable performance today** with **future-proof security**.

---

## Summary: Sub-Millisecond Claim Verification ✅

| Claim | Verified? | Best Number |
|---|---|---|
| "Sub-millisecond" key generation | **✅ YES** | 130 µs (ML-KEM-1024) |
| "Sub-millisecond" vault encryption (1KB) | **✅ YES** | 237 µs |
| "Sub-millisecond" secure encrypt (1KB) | **✅ YES** | 132 µs |
| "Sub-millisecond" secure decrypt (1KB) | **✅ YES** | 153 µs |
| "Sub-millisecond" signing (ML-DSA-44) | **✅ YES** | 326 µs |
| "Sub-millisecond" signing (Falcon-512) | **✅ YES** | 544 µs |
| "Sub-millisecond" verification | **✅ YES** | 82 µs (Falcon-512) |

**All claimed sub-millisecond operations are verified on real hardware under real-world conditions.**

---

## Reproduce These Results

```bash
git clone https://github.com/quantalabss/quantacipher.git
cd quantacipher/quantacipher-core
cargo bench
```

Requires: Rust stable toolchain (1.75+). Results will be in `target/criterion/`.

---

## Notes on Methodology

- **Outlier handling:** Criterion automatically classifies and removes high/low outliers using a standard IQR fence before computing the median. Background OS processes (SSH, VS Code, etc.) that cause CPU spikes are detected as "high severe" outliers and excluded.
- **Reported metric:** Median time (not mean) is used throughout. The median is robust against single-iteration noise.
- **Compiler:** All Rust benchmarks compiled with `--release` profile (full `opt-level = 3`, LTO enabled).
- **Classical baselines:** RSA implemented via the [`rsa`](https://crates.io/crates/rsa) crate (pure Rust). ECDSA/ECDH via the [`p256`](https://crates.io/crates/p256) crate (pure Rust). This ensures a fair apples-to-apples comparison without OpenSSL acceleration.
