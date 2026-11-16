# QuantaCipher Insight: CBOM & Risk Discovery

**QuantaCipher Insight** is an automated cryptographic discovery and posture management engine. It analyzes software repositories, dependencies, and infrastructure configurations to detect vulnerable classical algorithms (RSA, ECC, Diffie-Hellman, SHA-1) and generates compliant **CycloneDX 1.6 Cryptographic Bills of Materials (CBOMs)**.

---

## 1. Why Cryptographic Asset Discovery is Essential

Before an organization can migrate to post-quantum standards, it must answer three critical compliance questions:
1. **Where are classical algorithms embedded** across thousands of microservices and configuration files?
2. **Which secrets protect long-lived data** vulnerable to Harvest-Now, Decrypt-Later (HNDL)?
3. **What is our migration priority** to meet government deadlines (e.g. CNSA 2.0, 3GPP Rel 18)?

Manual spreadsheet inventories fail in microservice architectures. QuantaCipher Insight replaces manual audits with continuous, automated Abstract Syntax Tree (AST) scanning.

---

## 2. CycloneDX 1.6 CBOM Standard

In 2024, the CycloneDX standard introduced native specification support for **Cryptographic Assets** (`cbom`). QuantaCipher Insight exports formal, machine-readable CycloneDX 1.6 CBOM documents detailing:

* **Cryptographic Assets:** Symmetric ciphers, asymmetric keypairs, signature schemes, and hash functions.
* **Algorithm Properties:** Key length, mode of operation (CBC, GCM), padding schemes, and classical security strength (in bits).
* **Quantum Security Classification:**
  * `VULNERABLE`: Classical algorithms broken by Shor's algorithm (RSA, ECDH, ECDSA, DSA).
  * `TRANSITIONAL`: Classical algorithms with quantum resistance margins (AES-256, SHA-384, SHA-512) or hybrid schemes.
  * `SAFE`: Standardized post-quantum algorithms (ML-KEM-1024, ML-DSA-65).
* **Code Traceability:** Exact repository source file path, line numbers, and AST node locations.

---

## 3. Running a Scan via API

You can trigger automated repository scans programmatically via the QuantaCipher Insight API:

### Request: `POST /api/insight/scan`

```bash
curl -X POST https://api.quantacipher.com/api/insight/scan \
  -H "Authorization: Bearer qz_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/acme-corp/payments-gateway"
  }'
```

### Response Payload:

```json
{
  "scanId": "scan_882910_cbom",
  "scannedAt": "2026-11-16T04:57:00.000Z",
  "summary": {
    "totalAssets": 14,
    "vulnerableAssets": 3,
    "transitionalAssets": 8,
    "safeAssets": 3,
    "postQuantumReadinessPercent": 21.4
  },
  "criticalFindings": [
    {
      "file": "src/auth/jwt_signing.ts",
      "line": 42,
      "detectedAlgorithm": "RSA-2048",
      "risk": "VULNERABLE",
      "hndlRisk": "CRITICAL",
      "recommendedTarget": "ML-DSA-65 (NIST FIPS 204)"
    },
    {
      "file": "services/vault/crypto_session.rs",
      "line": 118,
      "detectedAlgorithm": "ECDH-P256",
      "risk": "VULNERABLE",
      "hndlRisk": "CRITICAL",
      "recommendedTarget": "ML-KEM-1024 (NIST FIPS 203)"
    }
  ],
  "cbomUrl": "https://api.quantacipher.com/api/insight/cbom/scan_882910.json",
  "pdfReportUrl": "https://api.quantacipher.com/api/insight/reports/scan_882910.pdf"
}
```

---

## 4. Executive PDF Reports

QuantaCipher Insight automatically synthesizes technical AST scan results into board-ready, audit-compliant **Executive Cryptographic Risk Reports**:

* **Executive Summary & Risk Score:** 0–100 Cryptographic Agility Rating.
* **Harvest-Now, Decrypt-Later Risk Heatmap:** Quantifying high-exposure data stores.
* **Prioritized Remediation Roadmap:** Exact drop-in replacement recommendations for developers.
* **Regulatory Compliance Matrix:** Readiness tracking against NIST FIPS 203/204, HIPAA Security Rule, and CNSA 2.0.
