# JavaScript / TypeScript SDK

The QuantaCipher JS/TS SDK allows you to easily implement NIST-standardized Kyber-1024 cryptography directly into your Node.js applications. Under the hood, it uses highly-optimized WebAssembly (WASM) to ensure native speeds without complex C++ bindings.

## Installation

Install the package via npm, yarn, or pnpm:

```bash
npm install quantacipher-sdk
```

## Initialization

You will need an API Key from your QuantaCipher Dashboard.

```typescript
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({ apiKey: 'your_api_key' });

// Check version
console.log("SDK Version:", sdk.getVersion());
```

## Key Generation

Keys are generated entirely locally. The private key never leaves your server.

```typescript
const keys = sdk.generateKeypair();

console.log("PublicKey:", keys.publicKey);
console.log("PrivateKey:", keys.privateKey);
```

## Encrypting Data (Secure Mode)

To encrypt data, pass the plaintext string and the destination public key to `encryptSecure`. 

```typescript
const message = "Zero Trust Enterprise Data";
const ciphertext = sdk.encryptSecure(message, keys.publicKey);

console.log("Ciphertext:", ciphertext);
```

## Decrypting Data

To decrypt a payload, provide the impenetrable ciphertext and your private key. The WebAssembly core will handle the Kyber decapsulation and AES-GCM decryption seamlessly.

```typescript
const plaintext = sdk.decryptSecure(ciphertext, keys.privateKey);

console.log("Decrypted:", plaintext);
```
