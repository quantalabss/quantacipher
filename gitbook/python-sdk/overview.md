# Python SDK Overview

The `quantacipher` Python library brings NIST-standardized post-quantum cryptography to Python environments at native C/Rust execution speeds.

Built using **PyO3**, the library links directly to the `quantacipher-core` Rust engine, eliminating the latency, memory bloat, and security concerns associated with pure-Python cryptographic implementations.

---

## 1. Installation

Pre-compiled binary wheels are published to PyPI for Linux (`x86_64`, `aarch64`), macOS (Apple Silicon `arm64`, Intel `x86_64`), and Windows:

```bash
pip install quantacipher
```

No Rust compiler or C++ build tools are required on systems with pre-built wheels.

---

## 2. Quick Verification

Verify that the native Rust bindings are correctly loaded by querying the engine version:

```python
import quantacipher

print("QuantaCipher Core Version:", quantacipher.get_version())
```

---

## 3. Supported Python Frameworks

The SDK is thread-safe and integrates seamlessly with major Python frameworks:

* **FastAPI & Starlette:** Async endpoints and middleware for post-quantum request encryption.
* **Django & Flask:** Model field encryption and view-level signing.
* **Celery & Kafka:** Message queue payload sealing and non-repudiation.
* **Pandas & PyTorch / HuggingFace:** Securing sensitive AI model weights and patient dataset columns before cloud storage.

---

## 4. Next Steps

* [Mode 1: Vault Mode (Python)](vault-mode.md) — Permanent sealing for audit trails.
* [Mode 2: Secure Mode (Python)](secure-mode.md) — End-to-end encryption with persistent keys.
* [Python API Reference](api-reference.md) — Full function signatures and exceptions.
