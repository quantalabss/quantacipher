# Mode 3: Signing Module (Post-Quantum Signatures)

The `QuantaCipherSign` module provides NIST-standardized digital signatures designed to replace legacy RSA and ECDSA signatures.

Signatures are encapsulated in self-describing, tamper-resistant **Signature Envelopes**. The verification engine reads the algorithm identifier directly from the envelope, eliminating algorithm confusion vulnerabilities.

---

## 1. Supported Signature Algorithms

The module supports the following algorithms via the `AlgorithmId` enum:

```typescript
import { AlgorithmId } from '@quantalabss/quantacipher-sdk';

// Available Algorithms:
// AlgorithmId.ML_DSA_44  ("ml-dsa-44")  - NIST FIPS 204 Level 2 (Recommended for Web/API)
// AlgorithmId.ML_DSA_65  ("ml-dsa-65")  - NIST FIPS 204 Level 3
// AlgorithmId.ML_DSA_87  ("ml-dsa-87")  - NIST FIPS 204 Level 5
// AlgorithmId.FALCON_512 ("falcon-512-fips206-draft") - FIPS 206 Draft (Compact)
```

---

## 2. Generating Signing Keypairs

```typescript
import { QuantaCipherSign, AlgorithmId } from '@quantalabss/quantacipher-sdk';

const signer = new QuantaCipherSign();

// Generate an ML-DSA-44 keypair (NIST FIPS 204)
const keypair = signer.generateSigningKeyPair(AlgorithmId.ML_DSA_44);

console.log('Public Key (ML-DSA):', keypair.public_key);
console.log('Private Key (Secret):', keypair.private_key);
console.log('Algorithm:', keypair.algorithm);
```

---

## 3. Signing Payloads: `signPayload()`

You can sign UTF-8 strings or raw `Uint8Array` binary buffers. The function safely processes arbitrarily large payloads through chunked buffer streaming:

```typescript
const legalContract = JSON.stringify({
  contractId: 'QC-2026-9901',
  parties: ['Acme Telecom Inc.', 'QuantaCipher Corp.'],
  terms: 'Carrier interconnect SLA 99.999%',
  date: '2026-11-16',
});

// Sign using your private key
const envelope = signer.signPayload(legalContract, keypair.private_key);

console.log('Signature Envelope:', envelope);
/*
Output:
{
  "alg": "ml-dsa-44",
  "sig": "E9f...base64_signature_bytes...",
  "ver": 1
}
*/
```

---

## 4. Verifying Signatures: `verifySignature()`

To verify a signature, provide the original payload, the envelope, and the signer's public key:

```typescript
const isValid = signer.verifySignature(legalContract, envelope, keypair.public_key);

console.log('Is Signature Valid?', isValid); // true
```

### Automatic Algorithm Routing:
The caller does not need to specify which algorithm was used. The `verifySignature` function inspects `envelope.alg`, validates that it matches an approved algorithm, and invokes the matching mathematical verifier.

---

## 5. Serialization: JSON Helpers

To transmit signatures over HTTP or store them in database columns:

```typescript
// Convert envelope to compact JSON string
const envelopeJson = signer.envelopeToJson(envelope);

// Reconstruct envelope from JSON with strict schema validation
const restoredEnvelope = signer.envelopeFromJson(envelopeJson);
```

> **Security Rule:** `envelopeFromJson` enforces `deny_unknown_fields`. Any JSON string containing unrecognized or malformed properties is rejected immediately to prevent envelope-tampering exploits.
