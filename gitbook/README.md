# QuantaCipher Documentation

Welcome to the QuantaCipher developer documentation. 

QuantaCipher is an Enterprise-grade Zero-Trust Post-Quantum Cryptography (PQC) platform. We provide an easy-to-use SDK built on top of the NIST-standardized Kyber algorithm to protect your infrastructure against "Store Now, Decrypt Later" quantum attacks.

## Why Post-Quantum Cryptography?

NIST finalized the post-quantum standards in 2024. Standard cryptographic algorithms like RSA and ECC will be broken by cryptographically relevant quantum computers (CRQCs). If your encrypted data is captured today, it can be decrypted tomorrow when quantum hardware matures.

QuantaCipher allows you to upgrade your encryption to Kyber-1024 with just two lines of code, completely future-proofing your data.

## Zero-Trust by Design

QuantaCipher is built on a fundamental Zero-Trust architecture:
- **Local Execution**: All cryptographic operations happen securely inside your local runtime (using our native WebAssembly or Rust binaries).
- **Zero Plaintext Transmission**: Your plaintext data **never** leaves your server. Only mathematically impenetrable ciphertext is transmitted over the network.
- **Client-Side Key Generation**: You hold the private keys.

## Next Steps

- Learn about our [Architecture](./architecture.md)
- Integrate the [JavaScript/TypeScript SDK](./javascript-sdk.md)
- Integrate the [Python SDK](./python-sdk.md)
