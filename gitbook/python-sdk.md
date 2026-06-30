# Python SDK

The QuantaCipher Python SDK provides native Rust bindings to execute NIST-standardized Kyber-1024 cryptography at blazing speeds directly within your Python environments.

Built using **PyO3**, the Python library acts as a lightweight wrapper over the `quantacipher-core` Rust engine. This ensures enterprise-grade performance, memory safety, and Zero-Trust execution without the overhead of traditional Python cryptography implementations.

## Installation

Install the SDK via pip. Pre-compiled wheels are provided for major operating systems and architectures.

```bash
pip install quantacipher
```

## Initialization & Verification

You can import the module and verify the native Rust bindings are hooked correctly by checking the core version.

```python
import quantacipher

print("Rust Core Version:", quantacipher.get_version())
```

---

## Mode 1: Vault Mode (Permanent Sealing)

Vault Mode is designed for high-throughput immutable logging (e.g., audit trails, compliance records). An ephemeral Kyber-1024 keypair is generated entirely in memory (in Rust), the payload is encrypted, and the private key is permanently destroyed before the function even returns to Python.

```python
import json

sensitive_log = json.dumps({
    "userId": "user_987",
    "action": "FUNDS_TRANSFER",
    "amount": 50000.00
})

# The private key is mathematically obliterated after this executes
vault_ciphertext = quantacipher.vault_encrypt(sensitive_log)

print("Sealed Ciphertext:", vault_ciphertext)
```

---

## Mode 2: Secure Mode (End-to-End Encryption)

Secure Mode utilizes persistent keypairs, allowing you to establish true end-to-end post-quantum encryption where your backend or clients retain the ability to decrypt the data.

### Key Generation

Generate a post-quantum keypair locally. This operation executes in the native Rust runtime.

```python
keys = quantacipher.generate_keypair()

print("Public Key (Kyber-1024):", keys["publicKey"])
print("Private Key (Secret):", keys["privateKey"])
```

### Encrypting Data

Secure your plaintext payloads by encrypting them with the generated public key. The Rust core securely encapsulates the shared secret and encrypts the data using AES-256-GCM.

```python
message = "Highly Confidential Enterprise Data"
ciphertext = quantacipher.secure_encrypt(message, keys["publicKey"])

print("Quantum-Safe Ciphertext:", ciphertext)
```

### Decrypting Data

Decrypt the sealed payload securely by supplying the ciphertext and your private key.

```python
plaintext = quantacipher.secure_decrypt(ciphertext, keys["privateKey"])

print("Recovered Plaintext:", plaintext)
```
