# Financial Audit Trails & Non-Repudiation

In modern banking, fintech, and cross-border settlement systems, financial institutions are governed by stringent non-repudiation mandates:
* **SOC 2 Type II & SOX Compliance:** Proving that financial transaction ledgers were not tampered with retroactively.
* **ISO 20022 Financial Messaging:** Guaranteeing that payment initiation and settlement instructions are authentic and verifiable.
* **CERT-In Directives:** Mandatory maintenance of verifiable cybersecurity audit logs.

This guide illustrates how to use QuantaCipher's Vault Mode and Sigstore Rekor integration to create tamper-evident, quantum-resistant financial audit trails.

---

## 1. The Vulnerability of Centralized Database Auditing

Traditional audit trails write records to append-only database tables. However:
1. Privileged DBAs or compromised cloud infrastructure credentials can modify rows directly.
2. Backup snapshots can be altered before forensic investigators analyze breaches.
3. Cryptographic hashes computed with classical SHA-1 or MD5 are already broken, while RSA-signed timestamps will fail under quantum cryptanalysis.

---

## 2. QuantaCipher Financial Audit Architecture

```
[Core Banking Settlement Engine]
               │
               ▼
   [ISO 20022 Payment Instruction]
   - Transaction ID: TXN_88192301
   - Amount: $4,500,000.00 USD
   - Debtor / Creditor IBANs
               │
               ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ QuantaCipher Vault Engine                                    │
 │                                                              │
 │ 1. Encrypt with Ephemeral ML-KEM-1024 Keypair                │
 │ 2. Zeroize & Obliterate Ephemeral Private Key                │
 │ 3. Submit Ciphertext Digest to Gateway                       │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                                ▼
 ┌──────────────────────────────────────────────────────────────┐
 │ Public Sigstore Rekor Transparency Ledger                    │
 │                                                              │
 │ - Global Merkle Tree Root Hash Generated                     │
 │ - Immutable Leaf Index Assigned                              │
 │ - Cryptographic Timestamp Anchored by Independent Witnesses  │
 └──────────────────────────────────────────────────────────────┘
```

---

## 3. Code Example: Sealing a High-Value Wire Transfer

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

const qc = new QuantaCipher({ apiKey: process.env.BANKING_API_KEY! });

interface WireTransfer {
  transactionId: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  currency: string;
  clearingSystem: "FEDWIRE" | "CHIPS" | "SWIFT";
}

export async function authorizeAndSealWireTransfer(transfer: WireTransfer) {
  // Construct immutable audit statement
  const auditStatement = JSON.stringify({
    ...transfer,
    systemTimestamp: new Date().toISOString(),
    settlementStatus: "AUTHORIZED_AND_DISPATCHED",
    cryptoVersion: "NIST_FIPS_203_LEVEL_5",
  });

  // Permanently seal the transaction log in Vault Mode
  const receipt = await qc.vaultData(auditStatement, {
    transactionType: "HIGH_VALUE_WIRE",
    clearingNetwork: transfer.clearingSystem,
    referenceId: transfer.transactionId
  });

  console.log(`[SETTLEMENT COMPLETED] TXN: ${transfer.transactionId}`);
  console.log(`Sigstore Rekor Log Index: #${receipt.rekorIndex}`);
  console.log(`Receipt Verification UUID: ${receipt.rekorLogId}`);

  return receipt;
}
```

---

## 4. Verification in Enterprise Audits

During annual SOC 2 or regulatory reviews, compliance teams present the transaction receipt:
* The auditor extracts `receipt.rekorLogId` and queries the public Rekor transparency log.
* The independent Merkle tree proof certifies the exact byte fingerprint and timestamp.
* The auditor confirms that no database administrator—not even QuantaCipher—could have modified or forged the log entry.
