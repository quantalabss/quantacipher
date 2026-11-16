# Mode 1: Vault Mode (Permanent Sealing)

**Vault Mode** is a specialized cryptographic pattern designed for permanent, non-repudiable audit logging, compliance evidence sealing, and forensic records.

In Vault Mode, the private key is generated ephemerally, used once to encapsulate the symmetric key, and **immediately obliterated from memory**.

> **The Irreversible Guarantee:** Once data is sealed with Vault Mode, it is mathematically impossible for anyone—including your team, QuantaCipher, or an adversary with a future quantum computer—to decrypt it. There is deliberately **no `decryptVault()` method**.

---

## 1. How Vault Mode Works

```
[Plaintext Audit Record]
        │
        ├── 1. Generate Ephemeral ML-KEM-1024 Keypair in Memory
        ├── 2. Encapsulate 256-bit Shared Secret (KEM)
        ├── 3. Encrypt Plaintext with Authenticated AES-256-GCM (DEM)
        ├── 4. ZEROIZE & DESTROY Ephemeral Private Key
        │
        ▼
[Sealed Ciphertext: QZ_VAULT_V1:...]
```

---

## 2. Local Sealing: `encryptVault()`

Use `encryptVault()` when you want to seal data locally and store the resulting ciphertext in your own database (PostgreSQL, MongoDB, S3) without making a network call to the Gateway:

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

const qc = new QuantaCipher({ apiKey: process.env.QUANACIPHER_API_KEY! });

const sensitiveAction = JSON.stringify({
  action: 'AUTHORIZE_SWIFT_TRANSFER',
  initiator: 'user_internal_9981',
  amountUsd: 500000.00,
  targetIban: 'GB82WEST12345698765432',
  timestamp: new Date().toISOString(),
});

// Seal payload locally — private key is destroyed before the function returns
const sealedCiphertext = qc.encryptVault(sensitiveAction);

console.log('Sealed Ciphertext:');
console.log(sealedCiphertext);
// Output: QZ_VAULT_V1:A4f...:9e2...:c8a...
```

---

## 3. Sealing with Gateway Receipt: `vaultData()`

Use `vaultData()` to encrypt the payload locally **AND** submit the resulting ciphertext to the QuantaCipher Gateway to receive a cryptographically anchored receipt:

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

const qc = new QuantaCipher({ apiKey: process.env.QUANACIPHER_API_KEY! });

async function recordComplianceEvent() {
  const compliancePayload = JSON.stringify({
    patientId: 'patient_77312',
    action: 'DISCLOSE_GENOMIC_PROFILE',
    requestingEntity: 'State Public Health Agency',
    statute: 'HIPAA_SEC_164.512',
    timestamp: new Date().toISOString(),
  });

  // Encrypts locally, sends ONLY ciphertext to Gateway, returns verified receipt
  const receipt = await qc.vaultData(compliancePayload, {
    service: 'electronic-health-records',
    classification: 'HIPAA_AUDIT',
  });

  console.log('Receipt ID:', receipt.id);
  console.log('Bytes Secured:', receipt.bytesSecured);
  console.log('Encryption Scheme:', receipt.encryptionScheme);
  console.log('Sigstore Rekor Log ID:', receipt.rekorLogId);
  console.log('Sigstore Rekor Log Index:', receipt.rekorIndex);
  console.log('Timestamp:', receipt.timestamp);
}

recordComplianceEvent();
```

---

## 4. Real-World Use Cases for Vault Mode

1. **Financial Transaction Logging:** Proving that a wire transfer or stock trade authorization was executed at an exact timestamp without exposing customer account numbers.
2. **HIPAA & GDPR Event Trails:** Documenting who accessed sensitive patient records to satisfy regulatory audits.
3. **Law Enforcement Evidence Sealing:** Guaranteeing that captured surveillance metadata or sensor readings were captured untampered.
4. **Internal Admin Audit Logs:** Sealing privileged root access, credential revocations, and configuration changes against rogue database administrators.
