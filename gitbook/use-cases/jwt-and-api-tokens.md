# Post-Quantum JWT & API Auth Agility

JSON Web Tokens (JWT) and OAuth bearer tokens form the foundation of cloud identity, API authentication, and microservice authorization. Today, virtually all enterprise JWTs are signed with classical algorithms:
* **`RS256`** (RSA PKCS#1 v1.5 with SHA-256)
* **`ES256`** (ECDSA over NIST P-256 with SHA-256)

When quantum computers break RSA and elliptic curves, adversaries can forge arbitrary JWTs, spoof admin identities, and bypass enterprise authentication controls.

This guide demonstrates how to upgrade API token authentication to **NIST FIPS 204 (ML-DSA)** using QuantaCipher.

---

## 1. Architectural Migration: From `RS256` to `ML-DSA-44`

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LEGACY JWT (VULNERABLE)                         │
│                                                                        │
│   eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM...[BROKEN RSA] │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (Drop-In Upgrade)
┌────────────────────────────────────────────────────────────────────────┐
│                   QUANACIPHER POST-QUANTUM TOKEN                       │
│                                                                        │
│   [Header: alg="ML-DSA-44"] . [Claims Payload] . [FIPS 204 Signature]  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Implementation: Generating a Post-Quantum JWT

```typescript
import { QuantaCipherSign, AlgorithmId } from '@quantalabss/quantacipher-sdk';

const signer = new QuantaCipherSign();

// Generate auth service signing keypair (ML-DSA-44)
const authKeypair = signer.generateSigningKeyPair(AlgorithmId.ML_DSA_44);

interface UserClaims {
  sub: string;
  name: string;
  role: string;
  exp: number;
}

export function createQuantumJwt(claims: UserClaims): string {
  const header = { alg: "ML-DSA-44", typ: "JWT" };
  
  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  
  const signingInput = `${b64Header}.${b64Payload}`;
  
  // Sign using QuantaCipher Post-Quantum Core
  const envelope = signer.signPayload(signingInput, authKeypair.private_key);
  
  // Return standard compact JWT string format
  return `${signingInput}.${envelope.sig}`;
}
```

---

## 3. Implementation: Verifying the Token in API Middleware

In your downstream API gateway or Express/Next.js middleware:

```typescript
export function verifyQuantumJwt(token: string, publicKeyB64: string): UserClaims {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  
  const [b64Header, b64Payload, sig] = parts;
  const signingInput = `${b64Header}.${b64Payload}`;
  
  const envelope = {
    alg: "ml-dsa-44",
    sig: sig,
    ver: 1,
  };
  
  // Verify signature mathematically using public key
  const isValid = signer.verifySignature(signingInput, envelope, publicKeyB64);
  
  if (!isValid) {
    throw new Error("Unauthorized: Invalid post-quantum signature");
  }
  
  const payloadJson = Buffer.from(b64Payload, "base64url").toString("utf-8");
  const claims: UserClaims = JSON.parse(payloadJson);
  
  if (Date.now() / 1000 > claims.exp) {
    throw new Error("Token expired");
  }
  
  return claims;
}
```

---

## 4. Key Advantages:
1. **Zero Algorithm Confusion:** The verification engine strictly matches the algorithm declared in the header against NIST FIPS 204 parameters.
2. **Deterministic Verification:** No dynamic runtime keys are downloaded from unverified JWKS endpoints without cryptographic pinning.
3. **Future-Proof Non-Repudiation:** Tokens signed today cannot be forged retroactively by a future quantum adversary.
