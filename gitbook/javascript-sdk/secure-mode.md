# Mode 2: Secure Mode (End-to-End Encryption)

**Secure Mode** provides true end-to-end post-quantum encryption (E2EE) for data that must be decrypted by authorized recipients holding the corresponding private key.

Your application generates persistent post-quantum keypairs locally. Public keys can be shared openly; private keys must be stored securely and never touch QuantaCipher's servers.

---

## 1. Key Generation: `generateKeypair()`

Generate a new NIST FIPS 203 (ML-KEM-1024) keypair entirely inside the local WebAssembly runtime:

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

const qc = new QuantaCipher({ apiKey: process.env.QUANACIPHER_API_KEY! });

const keys = qc.generateKeypair();

console.log('Public Key (ML-KEM-1024):', keys.publicKey);
console.log('Private Key (Secret):', keys.privateKey);
console.log('Algorithm:', keys.algorithm); // "ML-KEM-1024"
console.log('Version:', keys.version);     // "1.0"
```

### Key Properties:
* `keys.publicKey`: Base64-encoded string (~2,092 base64 characters / 1,568 raw bytes). Safe to store in public user directories or send over the network.
* `keys.privateKey`: Base64-encoded string (~4,228 base64 characters / 3,168 raw bytes). Highly confidential. **Never transmit over the network**. Store in a secure key vault or encrypted database field.

---

## 2. Encrypting Data: `encryptSecure()`

Encrypt any UTF-8 plaintext string using the recipient's public key:

```typescript
const secretMessage = JSON.stringify({
  patientSsn: '999-00-1234',
  diagnosis: 'Hypertension Stage 2',
  notes: 'Prescribed Lisinopril 20mg daily',
});

// Encrypts locally using the recipient's ML-KEM-1024 public key
const ciphertext = qc.encryptSecure(secretMessage, keys.publicKey);

console.log('Quantum-Safe Ciphertext:');
console.log(ciphertext);
// Output: QZ_SECURE_V1:A4f...:9e2...:c8a...
```

---

## 3. Decrypting Data: `decryptSecure()`

To recover the original plaintext, the recipient provides the ciphertext and their matching ML-KEM-1024 private key:

```typescript
try {
  // Decrypts locally inside WASM memory
  const decryptedPlaintext = qc.decryptSecure(ciphertext, keys.privateKey);
  const data = JSON.parse(decryptedPlaintext);

  console.log('Successfully Decrypted Patient SSN:', data.patientSsn);
} catch (error) {
  console.error('Decryption failed:', error);
}
```

---

## 4. Encrypting with Gateway Receipt: `secureData()`

If you want to encrypt the payload locally AND simultaneously register the transaction on the QuantaCipher Gateway for an immutable audit receipt:

```typescript
const receipt = await qc.secureData(
  secretMessage,
  keys.publicKey,
  { customerId: 'cust_4401', retentionPolicy: '7_years' }
);

console.log('Receipt ID:', receipt.id);
console.log('Anchored Rekor Index:', receipt.rekorIndex);
```

---

## 5. Error Handling & Edge Cases

### Wrong Key Rejection
If a caller attempts to decrypt with an incorrect private key, decapsulation fails immediately:

```typescript
const unauthorizedKeys = qc.generateKeypair();

try {
  qc.decryptSecure(ciphertext, unauthorizedKeys.privateKey);
} catch (err: any) {
  // Throws: "QuantaCipher Error: ML-KEM decapsulation failed (wrong key?)"
  console.error('Cryptographic verification failed. Unauthorized key.');
}
```

### Tampered Ciphertext Protection
AES-256-GCM includes an authenticated authentication tag. If an attacker modifies even a single bit of the ciphertext or nonce, decryption aborts with an integrity error before returning any plaintext.
