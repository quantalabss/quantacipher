# Production Best Practices & Security Checklist

Follow this checklist when deploying QuantaCipher into production enterprise and telecom environments.

---

## 1. Security Checklist

* [ ] **API Keys in Environment Variables:** Ensure `qz_live_...` keys are injected via Kubernetes Secrets, AWS Secrets Manager, or HashiCorp Vault. Never commit them to Git.
* [ ] **Separate Test and Live Keys:** Use `qz_test_...` in staging/CI and `qz_live_...` in production.
* [ ] **Private Key Custody (Secure Mode):** Store persistent ML-KEM-1024 private keys in encrypted storage. QuantaCipher does not escrow or back up your private keys.
* [ ] **Handling Vault Mode Correctly:** Remember that Vault Mode is irreversible. Never use Vault Mode for payloads that your application needs to decrypt later.
* [ ] **Signature Envelope Validation:** Always use `signer.envelopeFromJson()` to deserialize envelopes. It enforces strict schema validation and rejects unknown fields.

---

## 2. Large Payload Optimization (> 64 KB)

QuantaCipher uses authenticated AES-256-GCM for bulk data payload encryption. While AES-256-GCM is hardware-accelerated on modern x86/ARM processors via AES-NI instructions, large payloads (> 100 MB) should be handled mindfully:

```typescript
// Best Practice: Stream or chunk large files
import { createReadStream } from 'fs';

// For multi-megabyte database dumps or video files, encrypt chunks or
// use hybrid envelope framing.
```

---

## 3. High-Throughput Microservices & Concurrency

* **Stateless Client:** The `QuantaCipher` and `QuantaCipherSign` client instances are completely stateless and thread-safe. You can instantiate a single global singleton and share it across all incoming HTTP requests.
* **WASM Re-use:** The WebAssembly binary initializes once per process. Subsequent key generations and encryptions execute in sub-millisecond memory loops without re-instantiating the WASM module.

```typescript
// lib/quantacipher.ts - Recommended Singleton Pattern
import { QuantaCipher, QuantaCipherSign } from '@quantalabss/quantacipher-sdk';

export const qc = new QuantaCipher({
  apiKey: process.env.QUANACIPHER_API_KEY!,
});

export const qcSigner = new QuantaCipherSign();
```

---

## 4. Key Rotation Policies

* **Public Keys:** ML-KEM-1024 public keys can be published in your public directory or transmitted over HTTP headers without risk.
* **Rotation Cadence:** Rotate persistent user keypairs every 90 to 180 days in accordance with organizational cryptographic compliance standards.
* **Archival:** Keep old public/private key pairs archived in your secure key vault if historical ciphertexts in your database still need to be decrypted.
