# QuantaCipher: Carrier-Grade Post-Quantum Cryptography

Welcome to the official developer and architecture documentation for **QuantaCipher**, the world's first developer-native, API-first post-quantum encryption and discovery platform.

QuantaCipher enables engineering and security teams to deploy NIST-standardized quantum-resistant encryption, digital signatures, and cryptographic asset discovery in under 15 minutes—without requiring cryptography PhDs or infrastructure overhauls.

---

## Executive Overview

Modern cybersecurity has spent four decades hardening digital infrastructure around classical public-key cryptography—principally **RSA, ECDH, and ECDSA**. In August 2024, the United States National Institute of Standards and Technology (**NIST**) officially standardized post-quantum algorithms:

* **NIST FIPS 203:** Module-Lattice-Based Key-Encapsulation Mechanism (**ML-KEM**, derived from CRYSTALS-Kyber)
* **NIST FIPS 204:** Module-Lattice-Based Digital Signature Algorithm (**ML-DSA**, derived from CRYSTALS-Dilithium)
* **NIST FIPS 205:** Stateless Hash-Based Digital Signature Algorithm (**SLH-DSA**, derived from SPHINCS+)
* **NIST FIPS 206 (Draft):** Fast-Fourier Lattice-Based Digital Signature Algorithm (**FN-DSA**, derived from Falcon)

Global regulatory bodies—including the **NSA (CNSA 2.0 mandate)**, **CISA**, the **European Commission**, **3GPP (Release 18/19 for 5G SEPP)**, and **CERT-In**—have established strict deadlines requiring critical infrastructure and enterprise backends to transition to quantum-resistant schemes.

QuantaCipher provides the software-defined bridge for this transition.

---

## The Threat: Harvest-Now, Decrypt-Later (HNDL)

The most urgent risk facing organizations today is not a future cryptographically relevant quantum computer (CRQC) breaking a live TLS handshake in real-time. The active threat is **Harvest-Now, Decrypt-Later (HNDL)**:

```
[Adversary Intercept] ---> Stored Encrypted Traffic (RSA/ECC) ---> [Offline Vault]
                                                                        |
                                                               (T+ years until CRQC)
                                                                        v
[CRQC Available]     <--- Decrypts Historic Master Secrets  <--- [Mass Exfiltration]
```

1. **Passive Eavesdropping:** Hostile actors, state intelligence services, and cyber syndicates are intercepting and archiving petabytes of encrypted enterprise traffic, intellectual property, medical records, and telecom signaling data today.
2. **Delayed Exploitation:** Once a CRQC reaches operational scale (estimated 2029–2033), all archived classical ciphertexts will be decrypted retrospectively.
3. **Lifespan Horizon:** If your organization handles data that must remain confidential for 7, 10, or 25 years (e.g., healthcare records, defense contracts, financial ledger histories, telecom interconnect keys), **your system is already vulnerable today**.

---

## The QuantaCipher Solution

Where legacy HSM and appliance vendors offer multi-million dollar, proprietary hardware lock-ins with 18-month deployment cycles, QuantaCipher delivers a **pure-software, isomorphic cryptographic core**:

| Capability | Legacy Encryption | QuantaCipher Platform |
|---|---|---|
| **Core Algorithms** | RSA-2048 / ECC P-256 | NIST ML-KEM-768/1024, ML-DSA-44/65/87, Hybrid X-Wing |
| **Execution Environment** | Client plaintext sent to cloud HSM | **100% In-Client Runtime** (Rust compiled to WebAssembly) |
| **Zero-Trust Mandate** | Vendor holds or sees master keys | **Zero Key Escrow:** Plaintext never leaves local memory |
| **Audit Verification** | Mutable centralized database logs | **Sigstore Rekor Merkle Tree** immutable transparency logs |
| **Discovery & Migration** | Manual spreadsheets and audits | **CycloneDX 1.6 CBOM** automated AST repository scanner |
| **Deployment Time** | 6 to 18 months | **< 15 minutes** via npm, pip, or Docker container |

---

## Ecosystem Architecture

QuantaCipher is composed of five interconnected, modular layers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       QUANACIPHER ECOSYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. DISCOVERY & POSTURE   │ QuantaCipher Insight (CycloneDX 1.6 CBOM)   │
│ 2. APPLICATION RUNTIMES  │ TypeScript / JavaScript SDK · Python SDK    │
│ 3. CRYPTOGRAPHIC CORE    │ quantacipher-core (Rust) · WASM Engine      │
│ 4. ZERO-TRUST GATEWAY    │ QuantaCipher Gateway (mTLS, Ingest, Quota)  │
│ 5. IMMUTABLE PROOF       │ Sigstore Rekor Public Cryptographic Ledger  │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **`quantacipher-core` (Rust):** High-assurance, pure-Rust implementation of FIPS 203 ML-KEM, FIPS 204 ML-DSA, and Hybrid X-Wing (X25519 + ML-KEM-768). Memory zeroization via `secrecy` and constant-time math prevents timing side channels.
2. **`quantacipher-wasm` (WebAssembly):** Zero-overhead isomorphic WebAssembly target embedding the compiled Rust engine directly into Node.js, Next.js, and modern browser runtimes.
3. **`@quantalabss/quantacipher-sdk` (NPM):** Developer-friendly client library featuring **Vault Mode** (ephemeral permanent sealing), **Secure Mode** (E2EE), and **Signing Mode**.
4. **`quantacipher` (PyPI):** High-speed C-FFI / PyO3 bindings for Python microservices, data engineering, and AI pipelines.
5. **QuantaCipher Gateway & Rekor Anchor:** High-throughput API gateway that validates cryptographic framing, enforces rate limits, and anchors non-repudiable receipts directly onto Sigstore Rekor.

---

## Official Packages & Resources

* **NPM (TypeScript/Node.js SDK):** [`@quantalabss/quantacipher-sdk`](https://www.npmjs.com/package/@quantalabss/quantacipher-sdk)
* **NPM (WebAssembly Engine):** [`@quantalabss/quantacipher-wasm`](https://www.npmjs.com/package/@quantalabss/quantacipher-wasm)
* **PyPI (Python Native SDK):** [`quantacipher`](https://pypi.org/project/quantacipher)
* **Web Portal & Playground:** [https://www.quantacipher.com](https://www.quantacipher.com)
* **QuantaLabs Research:** [https://quantalabs.cc](https://quantalabs.cc)

---

## Next Steps

Follow the guides below to get started in minutes:

* [5-Minute Quickstart](getting-started/quickstart.md) — Initialize the SDK and seal your first payload.
* [Core Concepts](getting-started/core-concepts.md) — Understand KEM vs DEM, Vault Mode vs Secure Mode.
* [JavaScript / TypeScript SDK](javascript-sdk/overview.md) — Full integration guide for Node.js, Next.js, and browsers.
* [Python SDK](python-sdk/overview.md) — Production setup for Django, FastAPI, and data services.
* [QuantaCipher Insight](products/insight-cbom.md) — Generate automated CBOMs and audit your repositories.
