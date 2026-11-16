# JavaScript / TypeScript SDK

The QuantaCipher JS/TS SDK allows you to seamlessly integrate NIST-standardized ML-KEM-1024 (FIPS 203) and ML-DSA (FIPS 204) cryptography directly into your Node.js, Next.js, and browser applications.

Under the hood, it utilizes a highly-optimized WebAssembly (WASM) binary compiled directly from our Rust core. Through **Zero-Config Injection**, the WASM binary is natively embedded into the JavaScript bundle, ensuring immediate cross-platform compatibility without complex build pipelines or C++ bindings.

---

## Detailed SDK Guides

* [Installation & Bundler Configuration](javascript-sdk/overview.md) — Next.js, Vite, Webpack, Node.js.
* [Mode 1: Vault Mode (Permanent Sealing)](javascript-sdk/vault-mode.md) — Ephemeral key generation, zeroization, irreversible sealing.
* [Mode 2: Secure Mode (End-to-End Encryption)](javascript-sdk/secure-mode.md) — Persistent keypairs, encryption, and local decryption.
* [Mode 3: Signing Module](javascript-sdk/signing-module.md) — Digital signatures with ML-DSA and Falcon-512.
* [Complete API Reference](javascript-sdk/api-reference.md) — Full specifications for all classes, methods, and options.

---

## Installation

```bash
npm install @quantalabss/quantacipher-sdk
```

*(Note for Next.js 14/15/16 users: Ensure `experiments.asyncWebAssembly: true` is enabled in `next.config.ts`. See the [Bundler Setup Guide](javascript-sdk/overview.md)).*

---

## Initialization

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

const sdk = new QuantaCipher({ apiKey: 'your_api_key_here' });

// Verify the Zero-Trust WASM Engine has loaded successfully
console.log("SDK Version:", sdk.getVersion());
```

---

## 30-Second Example

```typescript
// 1. Vault Mode: Irreversibly seal audit logs
const auditLog = JSON.stringify({ action: "LOGIN_SUCCESS", userId: "usr_441" });
const sealedLog = sdk.encryptVault(auditLog);

// 2. Secure Mode: End-to-end encrypted messaging
const keys = sdk.generateKeypair();
const ciphertext = sdk.encryptSecure("Secret carrier config", keys.publicKey);
const plaintext = sdk.decryptSecure(ciphertext, keys.privateKey);

console.log("Decrypted:", plaintext);
```
