# NOTICE — QuantaCipher Component Licensing

This repository contains the QuantaCipher cryptographic engines, distributed under a **Dual-Licensing Model**:

1. **Open Source & Evaluation License (MIT / AGPLv3)**: Free for non-commercial evaluation, academic research, and open-source applications. See [LICENSE](./LICENSE).
2. **Commercial Enterprise & Carrier License**: Required for commercial telecom operators (Airtel, Jio, BSNL), network equipment manufacturers (NEMs), and closed-source proprietary 5G Core deployments. See [LICENSE-COMMERCIAL.md](./LICENSE-COMMERCIAL.md).

| Package | Registry | Purpose |
|---|---|---|
| `quantacipher-core` | [crates.io](https://crates.io/crates/quantacipher-core) | Pure Rust cryptographic & 5G telecom engine |
| `@quantalabss/quantacipher-wasm` | [npm](https://www.npmjs.com/package/@quantalabss/quantacipher-wasm) | WebAssembly bindings for JavaScript & 5G Simulator |
| `@quantalabss/quantacipher-sdk` | [npm](https://www.npmjs.com/package/@quantalabss/quantacipher-sdk) | TypeScript/Node.js developer & telecom SDK |
| `quantacipher` (Python) | [PyPI](https://pypi.org/project/quantacipher) | Python developer SDK |

## Third-Party Licenses

QuantaCipher open-source components depend on the following third-party libraries:

- **ml-kem** (MIT / Apache-2.0) — ML-KEM-768/1024 (FIPS 203) post-quantum KEM implementation
- **ml-dsa** (MIT / Apache-2.0) — ML-DSA-44/65/87 (FIPS 204) post-quantum signature implementation
- **falcon-rs** (MIT) — FN-DSA (FIPS 206 draft) post-quantum signature implementation
- **p256** (MIT / Apache-2.0) — Classical ECDSA P-256 for Hybrid Signatures
- **x25519-dalek** (BSD-3-Clause) — Classical Curve25519 for Hybrid KEM (X-Wing) and 5G Profile D
- **aes** (MIT / Apache-2.0) — AES-256-CTR symmetric encryption for 5G PQ-IES
- **hmac** (MIT / Apache-2.0) — HMAC-SHA256 integrity verification
- **aes-gcm** (MIT / Apache-2.0) — AES-256-GCM authenticated encryption
- **wasm-bindgen** (MIT / Apache-2.0) — Rust-to-WebAssembly bindings
- **base64** (MIT / Apache-2.0) — Base64 encoding/decoding

## Contact & Commercial Inquiries

QuantaLabs Private Limited  
Email: **`contact@quantalabs.cc`**  
Website: https://quantalabs.cc  
Address: 1st Floor, Smartspaces, 57-A, KS Ramasamy St, Kuppakonanpudur, Coimbatore North, Coimbatore – 641038, Tamil Nadu, India

