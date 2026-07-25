<div align="center">

<h1>QuantaCipher</h1>

<p><strong>The world's first developer-native, API-first post-quantum encryption platform.</strong><br/>
Secure your enterprise data with NIST ML-KEM (Kyber-1024) in two lines of code.</p>

[![npm version](https://img.shields.io/npm/v/quantacipher-sdk?label=quantacipher-sdk&color=C4ED5F&style=flat-square)](https://www.npmjs.com/package/quantacipher-sdk)
[![npm version](https://img.shields.io/npm/v/quantacipher-wasm?label=quantacipher-wasm&color=C4ED5F&style=flat-square)](https://www.npmjs.com/package/quantacipher-wasm)
[![PyPI version](https://img.shields.io/pypi/v/quantacipher?label=quantacipher%20(PyPI)&color=C4ED5F&style=flat-square)](https://pypi.org/project/quantacipher)
[![Crates.io](https://img.shields.io/crates/v/quantacipher-core?label=quantacipher-core&color=C4ED5F&style=flat-square)](https://crates.io/crates/quantacipher-core)
[![License: MIT](https://img.shields.io/badge/license-MIT-white?style=flat-square)](./LICENSE)
[![Built with Rust](https://img.shields.io/badge/built%20with-Rust-orange?style=flat-square)](https://www.rust-lang.org/)

<br/>

[Platform & Demo](https://www.quantacipher.com) · [API Docs](https://quantachain.gitbook.io/quantacipher) · [QuantaLabs](https://quantalabs.cc)

</div>

---

## The Threat: Harvest Now, Decrypt Later

The cybersecurity industry has spent decades hardening systems against classical threats, but a new existential threat class is already in motion. Nation-state adversaries are actively executing **harvest-now, decrypt-later (HNDL)** attacks — systematically collecting encrypted enterprise data today, intending to decrypt it once quantum computers break traditional public-key algorithms like RSA and ECC.

Despite this looming crisis and strict cryptographic timelines mandated by regulators (NIST FIPS 203, India DST PQC Roadmap, EU CNSA 2.0), most encryption tools remain entirely blind to the risk.

## The Solution: Zero-Trust PQC, Developer-Native

QuantaCipher delivers NIST-standard quantum-resistant encryption that any team can deploy **in under 15 minutes**, requiring no cryptography expertise and no infrastructure overhaul.

```typescript
// That's literally it. Your data is now quantum-safe.
const ciphertext = sdk.encryptVault("Top Secret Enterprise Data");
```

---

## Architecture

QuantaCipher is a layered monorepo. Each layer has a single, clear responsibility:

```
┌─────────────────────────────────────────────────────────────────┐
│                   quantacipher-web (SaaS)                        │
│          Dashboard · API Key Management · Compliance Reports      │
├─────────────────────────────────────────────────────────────────┤
│               quantacipher-gateway (API Server)                  │
│    Ciphertext Ingestion · Receipts · Billing · Rate Limiting     │
│              ↑ Only ever sees ciphertext — never plaintext        │
├──────────────────────────┬──────────────────────────────────────┤
│   quantacipher-sdk-js    │      quantacipher (Python SDK)        │
│   TypeScript · Node.js   │      Python 3.8+                      │
├──────────────────────────┼──────────────────────────────────────┤
│   quantacipher-wasm      │      quantacipher-python              │
│   Rust → WebAssembly     │      Rust → PyO3 native extension     │
├──────────────────────────┴──────────────────────────────────────┤
│                  quantacipher-core (Rust)                        │
│     ML-KEM (Kyber-1024) + AES-256-GCM · KEM/DEM Hybrid         │
│              Cryptography executes 100% locally                   │
└─────────────────────────────────────────────────────────────────┘
```

### The Zero-Trust Guarantee

The entire KEM/DEM encryption process executes **100% locally** inside the client runtime — in a WASM sandbox in JavaScript, or as a native Rust extension in Python.

**Plaintext never leaves your machine. The gateway never has your keys.**

Only the resulting ciphertext reaches the QuantaCipher API Gateway, which validates format and issues a cryptographic receipt — without ever being able to read the data.

---

## Dual Operational Modes

### Mode 1 — Vault Mode (Permanent Sealing)
> *For HIPAA audit logs, compliance records, tamper-proof timestamps — data you need to prove existed, but never read back.*

1. An ephemeral Kyber-1024 keypair is generated locally in milliseconds
2. Data is encrypted using the ephemeral public key
3. The private key is **immediately and permanently discarded**
4. The sealed `QZ_VAULT_V1:...` ciphertext is produced — undecryptable by anyone, including you

### Mode 2 — Secure Mode (End-to-End Encryption)
> *For confidential enterprise data exchange where the user needs to decrypt later.*

1. A persistent Kyber-1024 keypair is generated locally — user saves the private key
2. Data is encrypted using the public key
3. Only ciphertext travels over the network
4. The user decrypts locally at any time using their private key

---

## Ecosystem & Packages

| Package | Registry | Language | Description |
|---|---|---|---|
| [`quantacipher-sdk`](https://www.npmjs.com/package/quantacipher-sdk) | npm | TypeScript/Node.js | Developer SDK with full dual-mode API |
| [`quantacipher-wasm`](https://www.npmjs.com/package/quantacipher-wasm) | npm | WASM (Rust→JS) | Compiled WebAssembly engine |
| [`quantacipher`](https://pypi.org/project/quantacipher) | PyPI | Python | Python SDK with native Rust bindings |
| [`quantacipher-core`](https://crates.io/crates/quantacipher-core) | crates.io | Rust | Pure Rust cryptographic engine |

---

## Quickstart

### Node.js / TypeScript

```bash
npm install quantacipher-sdk
```

```typescript
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({ apiKey: 'qz_live_...' });

// ── VAULT MODE: Seal data permanently ────────────────────────────
const auditLog = JSON.stringify({ userId: 'U-001', action: 'FUNDS_TRANSFER', amount: 50000 });
const sealed = sdk.encryptVault(auditLog);
// sealed = "QZ_VAULT_V1:..." — no one can ever decrypt this

// ── SECURE MODE: Encrypt + Decrypt ───────────────────────────────
const keys = sdk.generateKeypair();           // runs locally in WASM
const ciphertext = sdk.encryptSecure("Confidential data", keys.publicKey);
const plaintext  = sdk.decryptSecure(ciphertext, keys.privateKey);
// plaintext === "Confidential data" ✅
```

### Python

```bash
pip install quantacipher
```

```python
from quantacipher import QuantaCipher

sdk = QuantaCipher(api_key="qz_live_...")

# ── VAULT MODE ────────────────────────────────────────────────────
sealed = sdk.encrypt_vault("Sensitive compliance record")
# sealed = "QZ_VAULT_V1:..." — permanently sealed

# ── SECURE MODE ───────────────────────────────────────────────────
keys = sdk.generate_keypair()
ciphertext = sdk.encrypt_secure("Confidential data", keys["publicKey"])
plaintext  = sdk.decrypt_secure(ciphertext, keys["privateKey"])
# plaintext == "Confidential data" ✅
```

---

## Enterprise Features (via API Gateway)

| Feature | Description |
|---|---|
| **Cryptographic Receipts** | Immutable audit trail for every payload — timestamps, byte counts, encryption scheme |
| **HIPAA & SOC2 Alignment** | Receipt-based compliance reporting built into the gateway |
| **Environment Isolation** | Dedicated `qz_test_` and `qz_live_` API key environments |
| **Telemetry & Quotas** | Usage analytics, rate limiting, and proactive quota alerts |
| **Advanced Dashboard** | Turnkey audit log exports and compliance reports at quantacipher.com |

---

## Repository Structure

```
quantacipher/
├── quantacipher-core/      # Rust crypto engine (MIT, public — crates.io)
├── quantacipher-wasm/      # Rust → WASM bindings (MIT, public — npm)
├── quantacipher-python/    # Rust → Python bindings (MIT, public — PyPI)
├── quantacipher-sdk-js/    # TypeScript SDK (MIT, public — npm)
├── quantacipher-gateway/   # API Gateway server (Proprietary)
├── quantacipher-web/       # SaaS platform / dashboard (Proprietary)
├── gitbook/                # Documentation source
├── LICENSE                 # MIT (open-source components only)
└── NOTICE.md               # Full licensing breakdown
```

---

## Links

| | |
|---|---|
| 🌐 **Platform** | https://www.quantacipher.com |
| 📖 **API Docs** | https://quantachain.gitbook.io/quantacipher |
| 🏢 **QuantaLabs** | https://quantalabs.cc |
| 📦 **npm (SDK)** | https://www.npmjs.com/package/quantacipher-sdk |
| 📦 **npm (WASM)** | https://www.npmjs.com/package/quantacipher-wasm |
| 🐍 **PyPI** | https://pypi.org/project/quantacipher |
| 🦀 **crates.io** | https://crates.io/crates/quantacipher-core |

---

## License

The open-source components (`quantacipher-core`, `quantacipher-wasm`, `quantacipher-sdk`, `quantacipher` Python) are licensed under the **MIT License** — see [LICENSE](./LICENSE).

The API Gateway (`quantacipher-gateway`) and SaaS platform (`quantacipher-web`) are **proprietary software** — see [NOTICE.md](./NOTICE.md).

---

<div align="center">
Built by <a href="https://quantalabs.cc"><strong>QuantaLabs</strong></a> — Deep-tech PQC research, production-grade tooling.
</div>
