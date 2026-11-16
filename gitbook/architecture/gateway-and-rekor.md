# API Gateway & Sigstore Rekor Ledger

The QuantaCipher API Gateway provides enterprise orchestration, quota management, and cryptographic non-repudiation while maintaining strict zero-trust isolation from plaintext data.

---

## 1. Gateway Role & Responsibilities

The API Gateway sits at the edge of the QuantaCipher cloud infrastructure:

```
[Your Client Application]
         │
         │  1. Ingest Request: { ciphertext: "QZ_VAULT_V2:..." }
         ▼
[QuantaCipher Edge Gateway]
         │
         ├── 2. Authenticate API Key (Bearer Token)
         ├── 3. Validate Envelope Framing (No Plaintext)
         ├── 4. Generate SHA-256 Receipt Digest
         ├── 5. POST to Sigstore Rekor Transparency Log
         │       └── Merkle Tree Root & Leaf Index Generated
         ▼
  [Client Receives Cryptographic Receipt]
  {
    "id": "qz_rcpt_1753429812_abc123",
    "bytesSecured": 256,
    "encryptionScheme": "ML-KEM-1024 (FIPS 203) + AES-256-GCM",
    "rekorLogId": "c09268f7734891b2...",
    "rekorIndex": 481093,
    "timestamp": "2026-11-16T04:55:00.000Z"
  }
```

### What the Gateway Does:
* **Payload Verification:** Enforces that every submitted payload begins with a recognized post-quantum envelope header (`QZ_VAULT_V2:`, `QZ_SECURE_V2:`, `QZ_TRUE_PQC_KEM:`). Unencrypted raw text is rejected with HTTP 400.
* **Metadata Quotas:** Tracks encrypted byte counts and invocation counts against customer tiers.
* **Immutable Anchoring:** Anchors every receipt to the public Sigstore Rekor ledger.

### What the Gateway NEVER Does:
* Never sees, decrypts, or stores plaintext data.
* Never generates, stores, or escrows client encryption keys.
* Never retains raw ciphertext content in persistent databases (only SHA-256 metadata digests are logged for audit compliance).

---

## 2. Sigstore Rekor Immutable Ledger

Traditional compliance logs stored in relational databases or NoSQL data stores (e.g. MongoDB, PostgreSQL) are inherently mutable: database administrators can modify records, delete timestamps, or alter audit histories.

To provide true non-repudiation for enterprise audits (**HIPAA**, **SOC 2**, **CERT-In**, **CNSA 2.0**), QuantaCipher anchors every transaction to **Sigstore Rekor**, a public, tamper-evident, append-only Merkle tree ledger.

### How Anchoring Works:
1. When a ciphertext arrives at the Gateway, a canonical receipt payload is generated containing:
   * Client ID & timestamp
   * Ciphertext SHA-256 fingerprint
   * Algorithm suite used
2. The Gateway computes the SHA-256 digest of this receipt and constructs a `hashedrekord` entry.
3. The entry is submitted to `https://rekor.sigstore.dev/api/v1/log/entries`.
4. Rekor appends the entry to its distributed Merkle Tree and returns a globally unique UUID and log index.

---

## 3. Independent Audit Verification

Any third-party auditor, enterprise compliance officer, or customer security team can independently verify that a QuantaCipher transaction occurred at an exact point in time **without needing access to QuantaCipher's servers**:

### Using the Official `rekor-cli`:

```bash
# Retrieve and verify the entry directly from the public Sigstore ledger
rekor-cli get --log-index 481093
```

### Verification Output:
```json
{
  "LogIndex": 481093,
  "IntegratedTime": 1794749800,
  "Body": {
    "HashedRekordObj": {
      "data": {
        "hash": {
          "algorithm": "sha256",
          "value": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
        }
      }
    }
  }
}
```

Because the Merkle tree is cryptographically chained and signed by transparency log witnesses, it is impossible for either the customer or QuantaCipher to backdate, modify, or erase audit evidence.
