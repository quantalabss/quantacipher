# 5-Minute Quickstart

In this guide, you will install the QuantaCipher SDK, initialize the Zero-Trust cryptographic engine, and execute your first post-quantum encryption operations in under 5 minutes.

---

## 1. Prerequisites

Before starting, make sure you have:
* **Node.js** v18.0.0 or higher (for JavaScript/TypeScript), OR
* **Python** 3.8 to 3.12 (for Python applications)
* A QuantaCipher API Key (Generate one for free in your [QuantaCipher Dashboard](https://www.quantacipher.com/dashboard))

> **Zero-Trust Guarantee:** The API Key is used solely by the API Gateway to track metadata quotas, issue cryptographic receipts, and enforce rate limits. It has **no mathematical relationship** to your encryption keys. Plaintext never leaves your machine.

---

## 2. JavaScript / TypeScript Quickstart

### Step A: Install the SDK

Install the official package from npm:

```bash
npm install @quantalabss/quantacipher-sdk
# or
pnpm add @quantalabss/quantacipher-sdk
# or
yarn add @quantalabss/quantacipher-sdk
```

The SDK automatically bundles and loads the high-performance WebAssembly cryptographic engine (`@quantalabss/quantacipher-wasm`).

### Step B: Initialize and Encrypt (Vault Mode)

Create a file named `quickstart.ts` (or `quickstart.js`):

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

// 1. Initialize the client
const qc = new QuantaCipher({
  apiKey: process.env.QUANACIPHER_API_KEY || 'qz_test_demo_key_123',
});

async function main() {
  console.log(`Core Engine Version: ${qc.getVersion()}`);

  // 2. Vault Mode: Permanently seal sensitive compliance data
  // The ephemeral private key is zeroized and destroyed immediately after encryption.
  const auditEvent = JSON.stringify({
    userId: 'usr_88291',
    event: 'WIRE_TRANSFER_AUTHORIZATION',
    amountUsd: 1250000.00,
    timestamp: new Date().toISOString(),
  });

  console.log("\n--- Mode 1: Vault Mode (Permanent Sealing) ---");
  const vaultCiphertext = qc.encryptVault(auditEvent);
  console.log("Sealed Ciphertext:\n", vaultCiphertext);

  // 3. Secure Mode: End-to-End Encryption with persistent keypair
  console.log("\n--- Mode 2: Secure Mode (End-to-End Encryption) ---");
  const keypair = qc.generateKeypair();
  console.log("Generated ML-KEM-1024 Public Key:", keypair.publicKey.slice(0, 32) + "...");

  const secretPayload = "Carrier signaling packet: MSISDN=14155552671";
  const secureCiphertext = qc.encryptSecure(secretPayload, keypair.publicKey);
  console.log("Encrypted Ciphertext:\n", secureCiphertext.slice(0, 80) + "...");

  // Decrypt locally using private key
  const decrypted = qc.decryptSecure(secureCiphertext, keypair.privateKey);
  console.log("Locally Decrypted Plaintext:\n", decrypted);
}

main().catch(console.error);
```

### Step C: Run the Script

```bash
npx ts-node quickstart.ts
# or run with node (if compiled or using ES modules)
node quickstart.js
```

---

## 3. Python Quickstart

### Step A: Install via pip

```bash
pip install quantacipher
```

### Step B: Run Python Quickstart

Create a file named `quickstart.py`:

```python
import json
import os
import quantacipher

def main():
    print(f"QuantaCipher Rust Core Version: {quantacipher.get_version()}")

    # --- Mode 1: Vault Mode (Permanent Sealing) ---
    compliance_record = json.dumps({
        "patientId": "med_rec_9931",
        "action": "ACCESS_GENOMIC_PROFILE",
        "authorizedBy": "dr_chen@hospital.org"
    })

    # The ephemeral private key is permanently destroyed in Rust memory
    vault_ct = quantacipher.vault_encrypt(compliance_record)
    print("\n[Vault Mode] Permanently Sealed Ciphertext:")
    print(vault_ct[:80] + "...")

    # --- Mode 2: Secure Mode (End-to-End Encryption) ---
    print("\n[Secure Mode] Generating ML-KEM-1024 Keypair...")
    keys = quantacipher.generate_keypair()
    print("Public Key:", keys["publicKey"][:40] + "...")

    message = "Classified telecom trunk configuration: routing_prefix=0x4F8"
    ciphertext = quantacipher.secure_encrypt(message, keys["publicKey"])
    print("Encrypted Ciphertext:")
    print(ciphertext[:80] + "...")

    # Local Decryption
    decrypted = quantacipher.secure_decrypt(ciphertext, keys["privateKey"])
    print("Decrypted Output:")
    print(decrypted)

if __name__ == "__main__":
    main()
```

Run it directly:

```bash
python quickstart.py
```

---

## 4. Mode 3: Post-Quantum Digital Signatures (TypeScript)

To sign payloads with NIST FIPS 204 (ML-DSA) or FN-DSA (Falcon-512):

```typescript
import { QuantaCipherSign, AlgorithmId } from '@quantalabss/quantacipher-sdk';

const signer = new QuantaCipherSign();

// Generate signing keypair
const keypair = signer.generateSigningKeyPair(AlgorithmId.ML_DSA_44);

// Sign any string or binary payload
const document = "Contract Agreement No. 2026-QC-001";
const envelope = signer.signPayload(document, keypair.private_key);

console.log("Signature Envelope:", envelope);
// { alg: "ml-dsa-44", sig: "base64...", ver: 1 }

// Verify signature — algorithm is automatically inferred from envelope
const isValid = signer.verifySignature(document, envelope, keypair.public_key);
console.log("Signature Valid?", isValid); // true
```

---

## 5. What Just Happened?

1. **Zero Plaintext Exposure:** All cryptographic primitives (ML-KEM key generation, encapsulation, AES-256-GCM symmetric encryption, decapsulation, and signing) executed **100% inside your local application runtime**.
2. **NIST Compliance:** You just utilized official NIST FIPS 203 (ML-KEM-1024) and FIPS 204 (ML-DSA) mathematics.
3. **Hardware Agility:** No special HSM, accelerator card, or kernel driver was required.

---

## Next Steps

* [Core Cryptographic Concepts](core-concepts.md) — Dive deeper into KEM/DEM framing, zeroization, and ephemeral keys.
* [JavaScript / TypeScript SDK Guide](../javascript-sdk/overview.md) — Complete configuration, bundler setup, and error handling.
* [QuantaCipher Gateway](../products/encrypt-gateway.md) — Learn how to submit ciphertexts to receive Sigstore Rekor receipts.
