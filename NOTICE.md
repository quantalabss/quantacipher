# NOTICE — QuantaCipher Component Licensing

This repository is a monorepo containing both **open-source** and **proprietary** components.

## Open-Source Components (MIT License)

The following packages are open-source and licensed under the MIT License (see [LICENSE](./LICENSE)):

| Package | Registry | Purpose |
|---|---|---|
| `quantacipher-core` | [crates.io](https://crates.io/crates/quantacipher-core) | Pure Rust cryptographic engine |
| `quantacipher-wasm` | [npm](https://www.npmjs.com/package/quantacipher-wasm) | WebAssembly bindings for JavaScript |
| `quantacipher-sdk` | [npm](https://www.npmjs.com/package/quantacipher-sdk) | TypeScript/Node.js developer SDK |
| `quantacipher` (Python) | [PyPI](https://pypi.org/project/quantacipher) | Python developer SDK |

## Proprietary Components (All Rights Reserved)

The following components are **proprietary software** owned by QuantaLabs Private Limited:

| Component | Description |
|---|---|
| `quantacipher-gateway` | The QuantaCipher API Gateway server |
| `quantacipher-web` | The QuantaCipher SaaS platform and dashboard |

Unauthorized copying, distribution, modification, deployment, or use of the
proprietary components is strictly prohibited without explicit written permission
from QuantaLabs Private Limited.

## Third-Party Licenses

QuantaCipher open-source components depend on the following third-party libraries:

- **pqc_kyber** (MIT) — Kyber-1024 post-quantum KEM implementation
- **aes-gcm** (MIT / Apache-2.0) — AES-256-GCM symmetric encryption
- **wasm-bindgen** (MIT / Apache-2.0) — Rust-to-WebAssembly bindings
- **pyo3** (MIT) — Rust-to-Python bindings
- **base64** (MIT / Apache-2.0) — Base64 encoding/decoding

## Contact

QuantaLabs Private Limited  
https://quantalabs.cc  
legal@quantalabs.cc
