# Architecture & Gateway

QuantaCipher operates using a hybrid architecture that maximizes security while maintaining developer velocity.

## 1. The Core Cryptographic Engine

At the heart of QuantaCipher is `quantacipher-core`, an underlying pure Rust cryptographic implementation of the NIST ML-KEM (Kyber) algorithm.

This core is compiled down to highly optimized native bindings for Python, and lightweight WebAssembly (WASM) for Node.js and the browser. This ensures that the heavy lifting of post-quantum cryptography runs safely and efficiently inside your local environment without requiring any complex C++ dependencies.

## 2. Modes of Operation

QuantaCipher supports two distinct operational modes depending on your specific compliance and security requirements:

### Vault Mode (Permanent Sealing)
Designed for audit logs and immutable data:
1. An ephemeral keypair is generated locally.
2. The data is encapsulated.
3. The private key is instantly and permanently discarded.
4. The sealed ciphertext is sent to the Gateway for storage/verification.

### Secure Mode (User-Held Keys)
Designed for end-to-end encryption:
1. You generate a persistent Keypair locally.
2. Data is encrypted using the Public Key.
3. You can decrypt the data locally at any time using your Private Key.

## 3. The API Gateway

While encryption happens locally, QuantaCipher provides an API Gateway to handle metadata, tracking, and compliance receipts. 

When your SDK encrypts a payload, the impenetrable ciphertext is anchored to our high-availability Node.js edge network. The Gateway:
- Validates the `QZ_VAULT_V1` format.
- Instantly rejects any plaintext submissions to guarantee Zero-Trust.
- Issues verifiable cryptographic receipts for HIPAA and SOC2 compliance.
