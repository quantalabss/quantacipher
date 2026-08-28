# NOTICE — QuantaCipher Component Licensing

This repository contains the QuantaCipher open-source cryptographic engines, licensed under the MIT License (see [LICENSE](./LICENSE)):

| Package | Registry | Purpose |
|---|---|---|
| `quantacipher-core` | [crates.io](https://crates.io/crates/quantacipher-core) | Pure Rust cryptographic engine |
| `@quantalabss/quantacipher-wasm` | [npm](https://www.npmjs.com/package/@quantalabss/quantacipher-wasm) | WebAssembly bindings for JavaScript |
| `@quantalabss/quantacipher-sdk` | [npm](https://www.npmjs.com/package/@quantalabss/quantacipher-sdk) | TypeScript/Node.js developer SDK |
| `quantacipher` (Python) | [PyPI](https://pypi.org/project/quantacipher) | Python developer SDK |

## Third-Party Licenses

QuantaCipher open-source components depend on the following third-party libraries:

- **ml-kem** (MIT / Apache-2.0) — ML-KEM-1024 (FIPS 203) post-quantum KEM implementation
- **ml-dsa** (MIT / Apache-2.0) — ML-DSA-44 (FIPS 204) post-quantum signature implementation
- **falcon-rs** (MIT) — FN-DSA (FIPS 206 draft) post-quantum signature implementation
- **aes-gcm** (MIT / Apache-2.0) — AES-256-GCM symmetric encryption
- **wasm-bindgen** (MIT / Apache-2.0) — Rust-to-WebAssembly bindings
- **pyo3** (MIT) — Rust-to-Python bindings
- **base64** (MIT / Apache-2.0) — Base64 encoding/decoding

## Contact

QuantaLabs Private Limited  
https://quantalabs.cc  
legal@quantalabs.cc
