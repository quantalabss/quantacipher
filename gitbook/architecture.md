# Architecture & Zero-Trust Mechanics

QuantaCipher operates using a hybrid architecture that maximizes security while maintaining high developer velocity. The platform's architecture is uniquely zero-trust by design, ensuring that your enterprise data is cryptographically sealed before it ever reaches a network interface.

## 1. The Core Cryptographic Engine

At its foundational core is `quantacipher-core`, a high-performance pure Rust implementation of the NIST ML-KEM (Kyber-1024) standard. 

Rather than acting purely as an asymmetric algorithm, QuantaCipher leverages a KEM/DEM (Key Encapsulation Mechanism / Data Encapsulation Mechanism) hybrid architecture:
1. **KEM (Kyber-1024):** Used to securely establish a cryptographic shared secret.
2. **DEM (AES-256-GCM):** The shared secret is immediately used as the symmetric key for an AES-256-GCM cipher, which encrypts the actual data payload. 

By compiling this Rust core to WebAssembly for JavaScript and providing native bindings for Python via PyO3, the entire KEM/DEM encryption process executes **100% locally**. Plaintext never leaves the client runtime.

## 2. Operational Modes

QuantaCipher supports two distinct operational modes, allowing you to tailor the cryptographic lifecycle to your specific compliance and business requirements.

### Vault Mode (Permanent Sealing)
Designed for immutable data, healthcare records, and non-repudiable audit logs.
1. An ephemeral Kyber-1024 keypair is generated locally in milliseconds.
2. The data is encapsulated and encrypted using the ephemeral public key.
3. The private key is **instantly and permanently discarded** from memory.
4. The sealed ciphertext is generated. No party, not even the original sender, can ever decrypt the payload once sealed.

### Secure Mode (End-to-End Encryption)
Designed for confidential enterprise data exchange where local recovery is required.
1. A persistent Keypair is generated locally and stored securely by the user.
2. Data is encrypted locally using the Public Key.
3. Only the ciphertext is transmitted over the network or stored in your database.
4. The data can be decrypted locally at any time by supplying the original Private Key to the QuantaCipher engine.

## 3. The API Gateway & Compliance

Only the resulting ciphertext ever reaches the QuantaCipher API Gateway, unlocking enterprise-ready infrastructure out of the box without compromising the Zero-Trust mandate.

When your SDK transmits ciphertext to the Gateway, the following enterprise features are activated:
- **Cryptographic Receipts:** The Gateway validates the binary format and issues an immutable audit trail for every payload, tracking exact timestamps, byte counts, and encryption schemes to support **HIPAA and SOC2 compliance**.
- **Environment Isolation:** Teams can safely build with dedicated Test and Live API key environments.
- **Telemetry & Quotas:** Built-in usage analytics, automated rate limiting, and proactive quota alerts prevent API abuse without the Gateway ever having the ability to inspect the underlying data.
- **Advanced Dashboard:** Access turnkey audit log exports and compliance reports directly from the web interface.
