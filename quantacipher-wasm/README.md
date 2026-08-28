<div align="center">

<h1>quantacipher-wasm</h1>

<p><strong>WebAssembly cryptographic engine for Zero-Trust Post-Quantum Encryption</strong><br/>
NIST ML-KEM-1024 (FIPS 203) · FN-DSA / ML-DSA Signing · AES-256-GCM · Compiled from Rust</p>

[![npm version](https://img.shields.io/npm/v/@quantalabss/quantacipher-wasm?color=C4ED5F&style=flat-square)](https://www.npmjs.com/package/@quantalabss/quantacipher-wasm)
[![npm downloads](https://img.shields.io/npm/dm/@quantalabss/quantacipher-wasm?style=flat-square&color=white)](https://www.npmjs.com/package/@quantalabss/quantacipher-wasm)
[![License: MIT](https://img.shields.io/badge/license-MIT-white?style=flat-square)](https://github.com/quantalabss/quantacipher/blob/main/LICENSE)
[![Built with wasm-pack](https://img.shields.io/badge/built%20with-wasm--pack-654FF0?style=flat-square)](https://rustwasm.github.io/wasm-pack/)

[Platform](https://www.quantacipher.com) · [API Docs](https://quantachain.gitbook.io/quantacipher) · [GitHub](https://github.com/quantalabss/quantacipher)

</div>

---

## What is this?

`quantacipher-wasm` is the **compiled WebAssembly binary** of the [QuantaCipher](https://www.quantacipher.com) cryptographic engine. It is the Rust [`quantacipher-core`](https://crates.io/crates/quantacipher-core) library compiled to `.wasm` via [`wasm-pack`](https://rustwasm.github.io/wasm-pack/), with auto-generated JavaScript bindings.

> **Most developers should use [`@quantalabss/quantacipher-sdk`](https://www.npmjs.com/package/@quantalabss/quantacipher-sdk)** — the high-level TypeScript SDK that wraps this package and adds the gateway integration, dual-mode abstraction, and receipt handling. Use `@quantalabss/quantacipher-wasm` directly only if you need the raw WASM engine without the SDK layer (e.g., in a browser app with a custom architecture, or a non-Node.js runtime).

`quantacipher-sdk` depends on this package and installs it automatically.

---

## How It Works

This package exposes the entire QuantaCipher cryptographic system as WASM-compiled functions callable from any JavaScript or TypeScript runtime:

```
Rust source (quantacipher-core)
         ↓  wasm-pack build
  quantacipher_wasm.wasm    ← compiled Rust cryptography
  quantacipher_wasm.js      ← auto-generated JS glue
  quantacipher_wasm.d.ts    ← TypeScript type definitions
         ↓  import
  Your JavaScript / TypeScript application
```

All cryptographic operations — key generation, encapsulation, encryption, decryption — execute **100% inside the WASM sandbox**. Plaintext never leaves the local runtime. No network calls are made by this package.

---

## Installation

```bash
npm install quantacipher-wasm
# or
yarn add quantacipher-wasm
```

---

## Usage (Direct WASM API)

```typescript
const wasm = require('quantacipher-wasm');

console.log('Engine version:', wasm.get_wasm_version());

// ── VAULT MODE: Permanent sealing (ephemeral key, no decrypt) ────
const vaultCiphertext = wasm.vault_encrypt('Top secret audit log');
// → "QZ_VAULT_V1:..."  — no one can ever decrypt this

// ── SECURE MODE: Encrypt with a persistent keypair ────────────────
const keypairJson = wasm.generate_keypair();
const { publicKey, privateKey } = JSON.parse(keypairJson);

const secureCiphertext = wasm.secure_encrypt('Confidential data', publicKey);
// → "QZ_SECURE_V1:..."

const plaintext = wasm.secure_decrypt(secureCiphertext, privateKey);
// → "Confidential data" ✅

// Wrong key → throws immediately
// wasm.secure_decrypt(secureCiphertext, wrongPrivateKey)
// → Error: QuantaCipher Error: ML-KEM decapsulation failed (wrong key?)
```

---

## Exported Functions

| Function | Signature | Description |
|---|---|---|
| `vault_encrypt` | `(plaintext: string) => string` | Vault Mode — ephemeral key, permanently sealed |
| `generate_keypair` | `() => string` | Generate ML-KEM-1024 keypair, returns JSON string |
| `secure_encrypt` | `(plaintext: string, public_key_b64: string) => string` | Secure Mode encryption |
| `secure_decrypt` | `(ciphertext: string, private_key_b64: string) => string` | Secure Mode local decryption |
| `get_wasm_version` | `() => string` | Returns engine version string |
| `get_algorithm` | `() => string` | Returns `"ML-KEM-1024"` from core constants |
| `get_scheme` | `() => string` | Returns `"ML-KEM-1024 (FIPS 203) + AES-256-GCM"` |
| `generate_signing_keypair` | `(algorithm?: string) => string` | Generate PQ signing keypair (JSON) |
| `sign_payload` | `(payload_b64, private_key_b64, algorithm?) => string` | Sign bytes, returns `SignatureEnvelope` JSON |
| `verify_signature` | `(payload_b64, signature_json, public_key_b64) => bool` | Verify — alg read from envelope, never assumed |
| `encrypt_local_kyber` | `(plaintext: string) => string` | **Deprecated** — alias for `vault_encrypt` |

---

## Payload Format

All outputs are portable, versionable string tokens cross-compatible with the Python and Rust SDKs:

```
QZ_VAULT_V1  : <base64 ML-KEM-1024 CT> : <base64 12-byte nonce> : <base64 AES-256-GCM CT>
QZ_SECURE_V1 : <base64 ML-KEM-1024 CT> : <base64 12-byte nonce> : <base64 AES-256-GCM CT>
```

A ciphertext encrypted in the browser with this WASM package can be decrypted by the Python SDK, and vice versa — the format is runtime-agnostic.

---

## Cryptographic Specification

| Property | Value |
|---|---|
| KEM Algorithm | ML-KEM-1024 (NIST FIPS 203) |
| Symmetric Cipher | AES-256-GCM |
| Public Key Size | 1568 bytes |
| Private Key Size | 3168 bytes |
| KEM Ciphertext | 1568 bytes |
| AES Nonce | 12 bytes (96-bit, random per encryption) |
| Shared Secret | 32 bytes |
| Key Encoding | Base64 (standard) |
| Signing | FN-DSA / Falcon-512 (default) · ML-DSA-44 (FIPS 204) |

---

## Browser Usage (ESM / Bundlers)

For browser environments with a bundler (Vite, webpack, Next.js), you may need to configure WASM loading. See the [full setup guide](https://quantachain.gitbook.io/quantacipher) for Next.js, Vite, and plain HTML configurations.

---

## Related Packages

| Package | Description |
|---|---|
| [`@quantalabss/quantacipher-sdk`](https://www.npmjs.com/package/@quantalabss/quantacipher-sdk) | High-level TypeScript SDK (recommended for most users) |
| [`quantacipher`](https://pypi.org/project/quantacipher) | Python SDK with native Rust bindings |
| [`quantacipher-core`](https://crates.io/crates/quantacipher-core) | Pure Rust engine (for Rust applications) |

---

## License

MIT — see [LICENSE](https://github.com/quantalabss/quantacipher/blob/main/LICENSE)

---

<div align="center">
Built by <a href="https://quantalabs.cc"><strong>QuantaLabs</strong></a> · <a href="https://www.quantacipher.com">quantacipher.com</a>
</div>
