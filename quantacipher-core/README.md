<div align="center">

<h1>quantacipher-core</h1>

<p><strong>Pure Rust cryptographic engine for Zero-Trust Post-Quantum Encryption</strong><br/>
NIST ML-KEM-1024 (FIPS 203) · FN-DSA / ML-DSA · AES-256-GCM · KEM/DEM Hybrid · Dual-Mode</p>

[![Crates.io](https://img.shields.io/crates/v/quantacipher-core?color=C4ED5F&style=flat-square)](https://crates.io/crates/quantacipher-core)
[![Crates.io Downloads](https://img.shields.io/crates/d/quantacipher-core?style=flat-square&color=white)](https://crates.io/crates/quantacipher-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-white?style=flat-square)](https://github.com/quantalabss/quantacipher/blob/main/LICENSE)
[![Rust](https://img.shields.io/badge/rust-2021%20edition-orange?style=flat-square)](https://www.rust-lang.org/)

[Platform](https://www.quantacipher.com) · [API Docs](https://quantachain.gitbook.io/quantacipher) · [GitHub](https://github.com/quantalabss/quantacipher)

</div>

---

## What is this?

`quantacipher-core` is the pure Rust cryptographic engine underlying the [QuantaCipher](https://www.quantacipher.com) platform. It implements a **KEM/DEM (Key Encapsulation Mechanism / Data Encapsulation Mechanism) hybrid scheme**:

- **KEM layer:** ML-KEM-1024 (FIPS 203) — establishes a post-quantum shared secret
- **DEM layer:** AES-256-GCM — encrypts actual data using the shared secret as the symmetric key

This library is the single source of truth for cryptographic logic. It is compiled to:
- **WebAssembly** via `wasm-bindgen` → [`@quantalabss/quantacipher-wasm`](https://www.npmjs.com/package/@quantalabss/quantacipher-wasm) on npm
- **Native Python extension** via `pyo3` + `maturin` → [`quantacipher`](https://pypi.org/project/quantacipher) on PyPI

> **Most users should use the platform SDKs, not this crate directly.** This crate is intended for Rust applications or projects that need to embed the crypto engine as a native dependency.

---

## Installation

```toml
[dependencies]
quantacipher-core = "0.1"
```

---

## Usage

```rust
use quantacipher_core::{generate_keypair, vault_encrypt, secure_encrypt, secure_decrypt};

fn main() -> Result<(), Box<dyn std::error::Error>> {

    // ── VAULT MODE: Permanent sealing ─────────────────────────────
    // Ephemeral keypair generated and discarded inside this call.
    // The resulting ciphertext cannot be decrypted by anyone.
    let sealed = vault_encrypt("Sensitive audit log entry")?;
    // → "QZ_VAULT_V1:..."
    println!("Sealed: {}", &sealed[..60]);

    // ── SECURE MODE: End-to-end encryption ────────────────────────
    let (public_key, private_key) = generate_keypair()?;

    let ciphertext = secure_encrypt("Confidential enterprise data", &public_key)?;
    // → "QZ_SECURE_V1:..."

    let plaintext = secure_decrypt(&ciphertext, &private_key)?;
    assert_eq!(plaintext, "Confidential enterprise data");
    println!("Round-trip successful");

    Ok(())
}
```

---

## API

### `generate_keypair() -> Result<(String, String), QuantaCipherError>`

Generates an ML-KEM-1024 keypair. Returns `(public_key_b64, private_key_b64)` — both base64-encoded.
Key sizes: public key 1568 B, secret key 3168 B.

### `vault_encrypt(plaintext: &str) -> Result<String, QuantaCipherError>`

Encrypts data in **Vault Mode**. Generates an ephemeral keypair internally, encrypts the data, then deterministically drops the private key. Returns a `QZ_VAULT_V1:...` payload. No decryption is ever possible.

### `secure_encrypt(plaintext: &str, public_key_b64: &str) -> Result<String, QuantaCipherError>`

Encrypts data in **Secure Mode** using the caller-provided public key. Returns a `QZ_SECURE_V1:...` payload decryptable only by the holder of the matching private key.

### `secure_decrypt(ciphertext: &str, private_key_b64: &str) -> Result<String, QuantaCipherError>`

Decrypts a `QZ_SECURE_V1:...` payload using the private key. All decryption happens locally.

---

## Cryptographic Details

| Property | Value |
|---|---|
| KEM Algorithm | ML-KEM-1024 (NIST FIPS 203) |
| Symmetric Cipher | AES-256-GCM |
| Shared Secret Size | 32 bytes |
| Public Key Size | 1568 bytes |
| Private Key Size | 3168 bytes |
| KEM Ciphertext Size | 1568 bytes |
| Key Encoding | Base64 (standard) |
| Signing (v2) | FN-DSA / Falcon-512 (default) · ML-DSA-44 (FIPS 204) |

---

## Payload Format

```
QZ_VAULT_V1  : <base64 ML-KEM-1024 CT> : <base64 12-byte AES nonce> : <base64 AES-256-GCM CT>
QZ_SECURE_V1 : <base64 ML-KEM-1024 CT> : <base64 12-byte AES nonce> : <base64 AES-256-GCM CT>
```

Payloads are runtime-agnostic — a payload created by this Rust crate can be sent to and validated by `quantacipher-wasm` (JS), `quantacipher` (Python), or the QuantaCipher Gateway interchangeably.

---

## Dependencies

```toml
ml-kem    = "=0.2.3"  # ML-KEM-1024 KEM (FIPS 203)
aes-gcm   = "0.10"    # AES-256-GCM AEAD
base64    = "0.22"    # Payload encoding
rand      = "0.8"     # OS RNG
zeroize   = "1"       # Secure key material wiping
falcon    = "..."     # FN-DSA / Falcon-512 signing
ml-dsa    = "0.1.1"  # ML-DSA-44 signing (FIPS 204)
```

---

## License

MIT — see [LICENSE](https://github.com/quantalabss/quantacipher/blob/main/LICENSE)

---

<div align="center">
Built by <a href="https://quantalabs.cc"><strong>QuantaLabs</strong></a> · <a href="https://www.quantacipher.com">quantacipher.com</a>
</div>
