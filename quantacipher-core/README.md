# QuantaCipher 🔐

Zero-Trust Post-Quantum Cryptography (PQC) SDK for the Enterprise. 
Built on top of the NIST-standardized Kyber algorithm to protect your infrastructure against "Store Now, Decrypt Later" quantum attacks.

## Ecosystem

- **`quantacipher-core`**: The underlying pure Rust cryptographic implementation.
- **`quantacipher-sdk`**: The Node.js / TypeScript SDK.
- **`quantacipher`**: The native Python bindings.

## Features
- **Quantum-Resistant**: Uses FIPS-standardized Kyber key encapsulation.
- **Zero-Trust**: Keys are generated and retained client-side; only encrypted payloads touch the network.
- **Cross-Platform**: Compile once in Rust, use flawlessly in JS/TS and Python.

## Quickstart

### Python
```bash
pip install quantacipher
```
```python
import quantacipher

keys = quantacipher.generate_keypair()
ciphertext = quantacipher.secure_encrypt("Top Secret Data", keys["publicKey"])
plaintext = quantacipher.secure_decrypt(ciphertext, keys["privateKey"])
```

### JS/TS (Node.js)
```bash
npm install quantacipher-sdk
```
```typescript
import { QuantaCipher } from 'quantacipher-sdk';

const sdk = new QuantaCipher({ apiKey: 'your_api_key' });
const keys = sdk.generateKeypair();
const ciphertext = sdk.encryptSecure("Top Secret Data", keys.publicKey);
const plaintext = sdk.decryptSecure(ciphertext, keys.privateKey);
```

## Commercial & Enterprise Use
QuantaCipher SDKs are open-source and free to use. To manage API keys, audit logs, and scale your cryptography, check out our [Enterprise SaaS Platform](https://quantacipher.com).
