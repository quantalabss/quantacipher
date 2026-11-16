# API Keys & Environments

This guide explains how to configure, manage, and rotate QuantaCipher API keys, manage isolated development environments, and enforce zero-trust policies in production.

---

## 1. What is the QuantaCipher API Key?

When initializing the SDK or communicating with the Gateway, an API Key is provided:

```typescript
const qc = new QuantaCipher({ apiKey: 'qz_live_948f2b821a37c9e0...' });
```

### The Zero-Trust Distinction

It is critical to distinguish between **API Keys** and **Cryptographic Keys**:

| Property | API Key (`qz_live_...`) | Post-Quantum Keypair (`ML-KEM / ML-DSA`) |
|---|---|---|
| **Purpose** | Gateway authentication, telemetry, rate limits | Encryption, decryption, signature generation |
| **Location** | Sent in HTTP `Authorization: Bearer` header | Generated & retained 100% inside client memory |
| **Server Visibility** | Verified by QuantaCipher API Gateway | **NEVER** transmitted over the network or stored |
| **Data Recovery** | Has zero ability to decrypt any payload | Required mathematically to decrypt or verify |

---

## 2. Key Types & Environments

QuantaCipher strictly separates development and production traffic through isolated key prefixes:

### 1. Test Keys (`qz_test_...`)
* **Environment:** Local development, CI/CD automated test suites, staging clusters.
* **Telemetry:** Recorded under the Test environment tab in your dashboard.
* **Rekor Anchoring:** Anchored to the Sigstore staging test ledger or mock ledger.
* **Rate Limits:** Relaxed for rapid local test loops.

### 2. Live Keys (`qz_live_...`)
* **Environment:** Production environments, live 5G carrier gateways, production customer data.
* **Telemetry:** Recorded in real-time production analytics and audit exports.
* **Rekor Anchoring:** Anchored directly to the official public Sigstore Rekor transparency ledger for mathematically verifiable compliance.
* **Quotas:** Enforces your subscribed plan bandwidth and request limits.

---

## 3. Best Practices for Managing Keys

### Environment Variables
Never commit API keys into source control repositories. Load keys from environment variables:

#### In Node.js / Next.js:
```bash
# .env.local (add to .gitignore)
QUANACIPHER_API_KEY="qz_live_..."
```

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

export const qc = new QuantaCipher({
  apiKey: process.env.QUANACIPHER_API_KEY!,
});
```

#### In Python:
```bash
# .env
QUANACIPHER_API_KEY="qz_live_..."
```

```python
import os
import quantacipher

API_KEY = os.environ.get("QUANACIPHER_API_KEY")
```

#### In Kubernetes:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: quantacipher-secrets
type: Opaque
data:
  api-key: cXpfbGl2ZV9hYmMxMjM... # base64 encoded
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payment-service
spec:
  template:
    spec:
      containers:
        - name: app
          image: myregistry/payment-service:v2
          env:
            - name: QUANACIPHER_API_KEY
              valueFrom:
                secretKeyRef:
                  name: quantacipher-secrets
                  key: api-key
```

---

## 4. Key Rotation & Revocation

If an API key is accidentally leaked or an employee departs:
1. Log in to the [QuantaCipher Dashboard](https://www.quantacipher.com/dashboard).
2. Navigate to **API Keys**.
3. Click **Create New Key** (generate `qz_live_new...`).
4. Update your production configuration with the new key.
5. In the dashboard, click **Revoke** on the old key. Revocation takes effect across all globally distributed gateway edge nodes in **< 15 seconds**.
6. **No Data Loss:** Revoking an API key does not affect any existing ciphertexts. Because QuantaCipher is zero-trust, all encrypted data remains fully decryptable by your clients holding the corresponding ML-KEM private keys.
