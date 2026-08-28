<div align="center">

<h1>quantacipher</h1>

<p><strong>Zero-Trust Post-Quantum Encryption SDK for Python</strong><br/>
NIST ML-KEM (Kyber-1024) · AES-256-GCM · Native Rust Extension · Dual-Mode</p>

[![PyPI version](https://img.shields.io/pypi/v/quantacipher?color=C4ED5F&style=flat-square)](https://pypi.org/project/quantacipher)
[![PyPI downloads](https://img.shields.io/pypi/dm/quantacipher?style=flat-square&color=white)](https://pypi.org/project/quantacipher)
[![Python Versions](https://img.shields.io/pypi/pyversions/quantacipher?style=flat-square&color=white)](https://pypi.org/project/quantacipher)
[![License: MIT](https://img.shields.io/badge/license-MIT-white?style=flat-square)](https://github.com/quantalabss/quantacipher/blob/main/LICENSE)
[![Built with PyO3](https://img.shields.io/badge/built%20with-PyO3%20%2B%20Rust-orange?style=flat-square)](https://pyo3.rs)

[Platform](https://www.quantacipher.com) · [API Docs](https://quantachain.gitbook.io/quantacipher) · [GitHub](https://github.com/quantalabss/quantacipher)

</div>

---

## What is this?

`quantacipher` is the official Python SDK for the [QuantaCipher](https://www.quantacipher.com) platform — a zero-trust, API-first post-quantum encryption system.

Under the hood, it runs a **Rust cryptographic engine compiled to a native Python extension** via [PyO3](https://pyo3.rs). All encryption and decryption happens **100% locally** inside your Python process. Plaintext never leaves your runtime. The QuantaCipher API Gateway only ever sees ciphertext.

No external crypto dependencies. No C++ build steps. Pure native performance.

---

## Installation

```bash
pip install quantacipher
```

Requires Python 3.8+. Pre-built wheels are available for Linux, macOS, and Windows.

---

## Initialization

Get an API key from your [QuantaCipher Dashboard](https://www.quantacipher.com).

```python
from quantacipher import QuantaCipher

sdk = QuantaCipher(
    api_key="qz_live_your_key_here",
    # gateway_url is optional — defaults to https://api.quantacipher.com/v1/ingest
)
```

---

## Mode 1 — Vault Mode (Permanent Sealing)

> Seal data forever. No decryption possible. Designed for HIPAA audit logs, compliance records, and tamper-proof audit trails.

**How it works:**
1. An ephemeral Kyber-1024 keypair is generated locally inside the Rust engine
2. Data is encrypted using the ephemeral public key (KEM shared secret → AES-256-GCM)
3. The private key is **immediately and permanently discarded** from memory
4. The `QZ_VAULT_V1:...` ciphertext is returned — undecryptable by anyone, including QuantaCipher

```python
import json

audit_log = json.dumps({
    "user_id":   "U-00987",
    "action":    "FUNDS_TRANSFER",
    "amount":    50000.00,
    "timestamp": "2026-07-25T10:30:00Z",
})

# Encrypt locally — private key is gone the moment this returns
ciphertext = sdk.encrypt_vault(audit_log)
# → "QZ_VAULT_V1:BASE64_KYBER_CT:BASE64_NONCE:BASE64_AES_CT"

print(ciphertext[:60], "...")
```

**Encrypt and send to the gateway in one call:**

```python
receipt = sdk.vault_data(audit_log, metadata={"source": "payment_service", "type": "hipaa"})

print(receipt["id"])               # "qz_rcpt_1753429812_abc123"
print(receipt["bytesSecured"])     # 156
print(receipt["encryptionScheme"]) # "Kyber-1024 + AES-256-GCM"
print(receipt["timestamp"])        # ISO 8601
```

> There is **no `decrypt_vault`**. This is the guarantee — not a bug.

---

## Mode 2 — Secure Mode (End-to-End Encryption)

> Encrypt data your users need to read back. You hold the keys. QuantaCipher never sees them.

**How it works:**
1. A persistent Kyber-1024 keypair is generated locally — you store the private key
2. Data is encrypted using the public key — only the holder of the matching private key can decrypt
3. Only ciphertext travels over the network
4. Decryption happens locally — private key never leaves your application

### Step 1 — Generate a Keypair

```python
keys = sdk.generate_keypair()

# keys["publicKey"]  → base64 Kyber-1024 public key  (safe to share)
# keys["privateKey"] → base64 Kyber-1024 private key (NEVER share — store securely)
# keys["algorithm"]  → "Kyber-1024"
# keys["version"]    → "1.0"

print("Store the private key securely. QuantaCipher never has it.")
```

### Step 2 — Encrypt

```python
document = json.dumps({
    "patient_id":  "P-00123",
    "diagnosis":   "Confidential Medical Information",
})

ciphertext = sdk.encrypt_secure(document, keys["publicKey"])
# → "QZ_SECURE_V1:BASE64_KYBER_CT:BASE64_NONCE:BASE64_AES_CT"
```

### Step 3 — Decrypt (locally)

```python
plaintext = sdk.decrypt_secure(ciphertext, keys["privateKey"])
doc = json.loads(plaintext)
# doc["diagnosis"] == "Confidential Medical Information"
```

**Wrong key = immediate rejection:**

```python
wrong_keys = sdk.generate_keypair()
try:
    sdk.decrypt_secure(ciphertext, wrong_keys["privateKey"])
except Exception as e:
    print(e)  # QuantaCipher Error: Kyber decapsulation failed (wrong key?)
```

### Encrypt + send to gateway:

```python
receipt = sdk.secure_data(document, keys["publicKey"], metadata={"user_id": "U-001"})
# receipt["id"], receipt["bytesSecured"], etc.
```

---

## Low-Level API (without class)

For simple use cases, you can call the core functions directly without instantiating the class:

```python
from quantacipher import generate_keypair, vault_encrypt, secure_encrypt, secure_decrypt

keys = generate_keypair()
ct   = secure_encrypt("Hello, quantum world!", keys["publicKey"])
pt   = secure_decrypt(ct, keys["privateKey"])
# pt == "Hello, quantum world!"
```

---

## API Reference

### `QuantaCipher(api_key, gateway_url=None)`

### Instance Methods

| Method | Description |
|---|---|
| `generate_keypair()` | Generate a Kyber-1024 keypair locally → `dict` |
| `encrypt_vault(plaintext)` | Vault Mode encryption (ephemeral key, no decrypt) → `str` |
| `encrypt_secure(plaintext, public_key_b64)` | Secure Mode encryption → `str` |
| `decrypt_secure(ciphertext, private_key_b64)` | Secure Mode local decryption → `str` |
| `vault_data(plaintext, metadata=None)` | Vault Mode + send to gateway → `dict` (receipt) |
| `secure_data(plaintext, public_key_b64, metadata=None)` | Secure Mode + send to gateway → `dict` (receipt) |
| `send_to_gateway(ciphertext, metadata=None)` | Send any ciphertext for a receipt → `dict` |

---

## Payload Format

All QuantaCipher ciphertexts are portable string tokens — versionable and cross-runtime compatible:

```
QZ_VAULT_V1  : <base64 Kyber-1024 CT> : <base64 AES-GCM nonce> : <base64 AES-GCM CT>
QZ_SECURE_V1 : <base64 Kyber-1024 CT> : <base64 AES-GCM nonce> : <base64 AES-GCM CT>
```

A ciphertext encrypted by the Python SDK can be sent to a JS application or the gateway interchangeably — the format is runtime-agnostic.

---

## License

MIT — see [LICENSE](https://github.com/quantalabss/quantacipher/blob/main/LICENSE)

---

<div align="center">
Built by <a href="https://quantalabs.cc"><strong>QuantaLabs</strong></a> · <a href="https://www.quantacipher.com">quantacipher.com</a>
</div>
