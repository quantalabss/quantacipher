# Architecture & Zero-Trust Mechanics

QuantaCipher operates using a hybrid architecture that maximizes security while maintaining high developer velocity. The platform's architecture is uniquely zero-trust by design, ensuring that your enterprise data is cryptographically sealed before it ever reaches a network interface.

---

## Detailed Architecture Chapters

For in-depth architectural specifications and implementation mechanics, explore:

* [Zero-Trust Security Model](architecture/zero-trust-model.md) — How in-client WebAssembly ensures plaintext never reaches the cloud.
* [Cryptographic Algorithms & FIPS Standards](architecture/algorithms.md) — Deep dive into ML-KEM-768/1024, ML-DSA-44/65/87, Hybrid X-Wing, and Falcon-512.
* [API Gateway & Sigstore Rekor Ledger](architecture/gateway-and-rekor.md) — Cryptographic receipt verification and public Merkle tree transparency logs.

---

## 1. The Core Cryptographic Engine

At its foundational core is `quantacipher-core`, a high-performance pure Rust implementation of the NIST ML-KEM-1024 (FIPS 203) and ML-DSA (FIPS 204) standards.

Rather than acting purely as an asymmetric algorithm, QuantaCipher leverages a KEM/DEM (Key Encapsulation Mechanism / Data Encapsulation Mechanism) hybrid architecture:
1. **KEM (ML-KEM-1024 / ML-KEM-768 / Hybrid X-Wing):** Used to securely establish a cryptographic shared secret.
2. **DEM (AES-256-GCM):** The shared secret is immediately used as the symmetric key for an authenticated AES-256-GCM cipher, which encrypts the actual data payload.

By compiling this Rust core to WebAssembly via an **Isomorphic Bundler Target**, the SDK natively and seamlessly loads in both Node.js backends and modern web browsers (e.g. Next.js). The entire KEM/DEM encryption process executes **100% locally**. Plaintext never leaves the client runtime.

---

## 2. Operational Modes

QuantaCipher supports three distinct operational modes, allowing you to tailor the cryptographic lifecycle to your specific compliance and business requirements:

### Mode 1: Vault Mode (Permanent Sealing)
Designed for immutable data, healthcare records, and non-repudiable audit logs.
1. An ephemeral ML-KEM-1024 keypair is generated locally in volatile memory.
2. The data is encapsulated and encrypted using the ephemeral public key.
3. The private key is **instantly and permanently zeroized** from memory.
4. The sealed ciphertext is generated. No party, not even the original sender, can ever decrypt the payload once sealed.

### Mode 2: Secure Mode (End-to-End Encryption)
Designed for confidential enterprise data exchange where local recovery is required.
1. A persistent Keypair is generated locally and stored securely by the user.
2. Data is encrypted locally using the recipient's Public Key.
3. Only the ciphertext is transmitted over the network or stored in your database.
4. The data can be decrypted locally at any time by supplying the original Private Key to the QuantaCipher engine.

### Mode 3: Signing Mode (Post-Quantum Signatures)
Designed for digital signatures, identity assertions, and JWT crypto-agility.
1. Documents and request payloads are signed using NIST FIPS 204 ML-DSA or FIPS 206 Falcon.
2. Signatures are serialized in self-describing `SignatureEnvelope` structures.
3. Verifiers inspect the envelope and mathematically verify authenticity without key confusion.

---

## 3. The API Gateway & Compliance

Only the resulting ciphertext ever reaches the QuantaCipher API Gateway, unlocking enterprise-ready infrastructure out of the box without compromising the Zero-Trust mandate.

When your SDK transmits ciphertext to the Gateway, the following enterprise features are activated:
* **Cryptographic Receipts:** The Gateway validates the binary format and issues an immutable audit trail anchored to Sigstore Rekor for every payload, tracking exact timestamps, byte counts, and encryption schemes to support verifiable **HIPAA readiness** and **CERT-In compliance**.
* **Environment Isolation:** Teams can safely build with dedicated Test and Live API key environments.
* **Telemetry & Quotas:** Built-in usage analytics, automated rate limiting, and proactive quota alerts prevent API abuse without the Gateway ever having the ability to inspect the underlying data.
* **Advanced Dashboard:** Access turnkey audit log exports and compliance reports directly from the web interface.
