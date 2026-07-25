<div align="center">

<h1>quantacipher-sdk</h1>

<p><strong>Zero-Trust Post-Quantum Encryption SDK for TypeScript & Node.js</strong><br/>
NIST ML-KEM (Kyber-1024) · AES-256-GCM · WebAssembly · Dual-Mode</p>

[![npm version](https://img.shields.io/npm/v/quantacipher-sdk?color=C4ED5F&style=flat-square)](https://www.npmjs.com/package/quantacipher-sdk)
[![npm downloads](https://img.shields.io/npm/dm/quantacipher-sdk?style=flat-square&color=white)](https://www.npmjs.com/package/quantacipher-sdk)
[![License: MIT](https://img.shields.io/badge/license-MIT-white?style=flat-square)](https://github.com/xaexaex/quantacipher/blob/main/LICENSE)
[![Powered by WASM](https://img.shields.io/badge/powered%20by-WebAssembly-654FF0?style=flat-square)](https://www.npmjs.com/package/quantacipher-wasm)

[Platform](https://www.quantacipher.com) · [API Docs](https://quantachain.gitbook.io/quantacipher) · [GitHub](https://github.com/xaexaex/quantacipher)

</div>

---

## What is this?

`quantacipher-sdk` is the official TypeScript/Node.js SDK for the [QuantaCipher](https://www.quantacipher.com) platform — a zero-trust, API-first post-quantum encryption system.

Under the hood, it runs a **Rust cryptographic engine compiled to WebAssembly** (`quantacipher-wasm`). All encryption and decryption happens **100% locally** inside your application. Plaintext never leaves your runtime. The QuantaCipher API Gateway only ever sees ciphertext.

**This SDK depends on `quantacipher-wasm` and installs it automatically.**

---

## Installation

```bash
npm install quantacipher-sdk
# or
yarn add quantacipher-sdk
# or
pnpm add quantacipher-sdk
```

> **Next.js users:** You may need to polyfill the Node.js `Buffer` global depending on your bundler. See the [API Docs](https://quantachain.gitbook.io/quantacipher) for a complete Next.js setup guide.

---

## Initialization

Get an API key from your [QuantaCipher Dashboard](https://www.quantacipher.com). The API key is used **only** for gateway metadata logging and quota management — it has no mathematical relationship to your cryptographic keys.

```typescript
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({
  apiKey: 'qz_live_your_key_here',
  // gatewayUrl is optional — defaults to https://api.quantacipher.com/v1/ingest
});

console.log('WASM Engine Version:', sdk.getVersion());
console.log('Dual Mode Available:', sdk.isDualModeAvailable());
```

---

## Mode 1 — Vault Mode (Permanent Sealing)

> Seal data forever. No decryption possible. Designed for HIPAA audit logs, compliance records, and tamper-proof timestamps.

**How it works:**
1. An ephemeral Kyber-1024 keypair is generated locally inside the WASM engine
2. Data is encrypted using the ephemeral public key (KEM shared secret → AES-256-GCM)
3. The private key is **immediately and permanently discarded** from memory
4. The `QZ_VAULT_V1:...` ciphertext is returned — undecryptable by anyone, including QuantaCipher

```typescript
// Encrypt locally — private key is gone the moment this returns
const auditLog = JSON.stringify({
  userId:    'U-00987',
  action:    'FUNDS_TRANSFER',
  amount:    50000.00,
  timestamp: new Date().toISOString(),
});

const ciphertext = sdk.encryptVault(auditLog);
// → "QZ_VAULT_V1:BASE64_KYBER_CT:BASE64_NONCE:BASE64_AES_CT"
```

**Encrypt and send to the gateway in one call:**

```typescript
const receipt = await sdk.vaultData(auditLog, { source: 'payment_service', type: 'hipaa_audit' });

console.log(receipt.id);               // "qz_rcpt_1753429812_abc123"
console.log(receipt.bytesSecured);     // 142
console.log(receipt.encryptionScheme); // "Kyber-1024 + AES-256-GCM"
console.log(receipt.timestamp);        // ISO 8601
```

> There is **no `decryptVault`**. This is the guarantee — not a bug.

---

## Mode 2 — Secure Mode (End-to-End Encryption)

> Encrypt data your users need to read back. You hold the keys. QuantaCipher never sees them.

**How it works:**
1. A persistent Kyber-1024 keypair is generated locally — user stores the private key
2. Data is encrypted using the public key — only the holder of the matching private key can decrypt
3. Only ciphertext travels over the network
4. Decryption happens locally — private key never leaves your application

### Step 1 — Generate a Keypair

```typescript
const keys = sdk.generateKeypair();

// keys.publicKey  → base64 Kyber-1024 public key  (safe to share)
// keys.privateKey → base64 Kyber-1024 private key (NEVER share — store securely)
// keys.algorithm  → "Kyber-1024"
// keys.version    → "1.0"

console.log('Store the private key securely. QuantaCipher never has it.');
```

### Step 2 — Encrypt

```typescript
const document = JSON.stringify({
  patientId:  'P-00123',
  diagnosis:  'Confidential Medical Information',
  prescribed: ['...',],
});

const ciphertext = sdk.encryptSecure(document, keys.publicKey);
// → "QZ_SECURE_V1:BASE64_KYBER_CT:BASE64_NONCE:BASE64_AES_CT"
```

### Step 3 — Decrypt (locally)

```typescript
const plaintext = sdk.decryptSecure(ciphertext, keys.privateKey);
const doc = JSON.parse(plaintext);
// doc.diagnosis === "Confidential Medical Information"
```

**Wrong key = immediate rejection:**

```typescript
const wrongKeys = sdk.generateKeypair();
sdk.decryptSecure(ciphertext, wrongKeys.privateKey);
// → throws QuantaCipher Error: Kyber decapsulation failed (wrong key?)
```

### Encrypt + send to gateway:

```typescript
const receipt = await sdk.secureData(document, keys.publicKey, { userId: 'U-001' });
// receipt.id, receipt.bytesSecured, etc.
```

---

## API Reference

### `new QuantaCipher(config)`

| Option | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | ✅ | Your QuantaCipher API key (`qz_live_...` or `qz_test_...`) |
| `gatewayUrl` | `string` | ❌ | Override the gateway URL (defaults to production) |

### Methods

| Method | Description |
|---|---|
| `generateKeypair()` | Generate a Kyber-1024 keypair locally |
| `encryptVault(plaintext)` | Vault Mode encryption (ephemeral key, no decrypt) |
| `encryptSecure(plaintext, publicKey)` | Secure Mode encryption (user keypair) |
| `decryptSecure(ciphertext, privateKey)` | Secure Mode local decryption |
| `vaultData(plaintext, metadata?)` | Vault Mode + send to gateway |
| `secureData(plaintext, publicKey, metadata?)` | Secure Mode + send to gateway |
| `sendToGateway(ciphertext, metadata?)` | Send any ciphertext to gateway for receipt |
| `getVersion()` | Returns WASM engine version string |
| `isDualModeAvailable()` | Returns `true` if full dual-mode WASM is loaded |

---

## Payload Format

All QuantaCipher ciphertexts are structured strings — portable, inspectable, and versionable:

```
QZ_VAULT_V1  : <base64 Kyber-1024 ciphertext> : <base64 AES-GCM nonce> : <base64 AES-GCM ciphertext>
QZ_SECURE_V1 : <base64 Kyber-1024 ciphertext> : <base64 AES-GCM nonce> : <base64 AES-GCM ciphertext>
```

---

## License

MIT — see [LICENSE](https://github.com/xaexaex/quantacipher/blob/main/LICENSE)

---

<div align="center">
Built by <a href="https://quantalabs.cc"><strong>QuantaLabs</strong></a> · <a href="https://www.quantacipher.com">quantacipher.com</a>
</div>
