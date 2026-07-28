# JavaScript / TypeScript SDK

The QuantaCipher JS/TS SDK allows you to seamlessly integrate NIST-standardized Kyber-1024 cryptography directly into your Node.js, Next.js, and Browser applications. 

Under the hood, it utilizes a highly-optimized WebAssembly (WASM) binary compiled directly from our Rust core. Through **Zero-Config Injection**, the WASM binary is natively embedded into the JavaScript bundle, ensuring immediate cross-platform compatibility without complex build pipelines or C++ bindings.

## Installation

Install the main SDK (which automatically depends on the WASM core) via npm, yarn, or pnpm:

```bash
npm install quantacipher-sdk
```

*(Note for Next.js 15+ users: Ensure `experiments.asyncWebAssembly: true` is enabled in your `next.config.ts`. The SDK is fully ES Modules (ESM) compliant and seamlessly executes in both the browser and Node.js).*

## Initialization

You will need an API Key from your QuantaCipher Dashboard. This key is used *only* for Gateway metadata logging and quota management—it has absolutely no mathematical relationship to your cryptographic keys.

```typescript
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({ apiKey: 'your_api_key_here' });

// Verify the Zero-Trust WASM Engine has loaded successfully
console.log("SDK Version:", sdk.getVersion());
```

---

## Mode 1: Vault Mode (Permanent Sealing)

Vault Mode generates an ephemeral post-quantum keypair locally, encrypts the payload, and permanently destroys the private key in milliseconds. This produces an immutable `QZ_VAULT_V1` ciphertext designed for permanent audit logs and non-repudiable storage.

```typescript
const sensitiveLog = JSON.stringify({
    userId: "user_987",
    action: "FUNDS_TRANSFER",
    amount: 50000.00
});

// The private key is mathematically obliterated after this function returns
const vaultCiphertext = sdk.encryptVault(sensitiveLog);

console.log("Sealed Ciphertext:", vaultCiphertext);
```

---

## Mode 2: Secure Mode (End-to-End Encryption)

Secure Mode utilizes persistent keypairs, allowing you to establish true end-to-end post-quantum encryption where the client retains the ability to decrypt the data later.

### Key Generation

Keys are generated 100% locally in your application's memory. The private key never leaves the runtime environment.

```typescript
const keys = sdk.generateKeypair();

console.log("Public Key (Kyber-1024):", keys.publicKey);
console.log("Private Key (Secret):", keys.privateKey);
```

### Encrypting Data

To encrypt data, pass the plaintext string and the recipient's public key. The WASM engine handles the KEM shared-secret encapsulation and AES-GCM data encryption.

```typescript
const message = "Highly Confidential Enterprise Data";
const ciphertext = sdk.encryptSecure(message, keys.publicKey);

console.log("Quantum-Safe Ciphertext:", ciphertext);
```

### Decrypting Data

To recover the original payload locally, provide the ciphertext and your private key. The WASM core handles decapsulation and decryption instantly.

```typescript
const plaintext = sdk.decryptSecure(ciphertext, keys.privateKey);

console.log("Recovered Plaintext:", plaintext);
```
