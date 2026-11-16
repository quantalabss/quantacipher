# Python SDK

The QuantaCipher Python SDK provides native Rust bindings to execute NIST-standardized ML-KEM-1024 cryptography at blazing speeds directly within your Python environments.

Built using **PyO3**, the Python library acts as a lightweight wrapper over the `quantacipher-core` Rust engine. This ensures enterprise-grade performance, memory safety, and Zero-Trust execution without the overhead of traditional Python cryptography implementations.

---

## Detailed SDK Guides

* [Installation & Native Core Setup](python-sdk/overview.md) — Pre-compiled wheels, verification, framework support.
* [Mode 1: Vault Mode (Python)](python-sdk/vault-mode.md) — Ephemeral key generation, zeroization, custom logging handler.
* [Mode 2: Secure Mode (Python)](python-sdk/secure-mode.md) — Persistent keypairs, encryption, FastAPI middleware.
* [Complete Python API Reference](python-sdk/api-reference.md) — Full function signatures and exceptions.

---

## Installation

```bash
pip install quantacipher
```

---

## 30-Second Example

```python
import quantacipher

# Check Rust engine version
print("Engine Version:", quantacipher.get_version())

# 1. Vault Mode: Irreversibly seal compliance events
sealed_event = quantacipher.vault_encrypt('{"action": "ADMIN_OVERRIDE"}')
print("Sealed:", sealed_event[:60] + "...")

# 2. Secure Mode: End-to-end encryption
keys = quantacipher.generate_keypair()
ciphertext = quantacipher.secure_encrypt("Confidential patient diagnosis", keys["publicKey"])
plaintext = quantacipher.secure_decrypt(ciphertext, keys["privateKey"])

print("Decrypted:", plaintext)
```
