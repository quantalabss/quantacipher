# QuantaCipher 5G Telecom Post-Quantum Security Suite

> **3GPP Release 18/19 & TEC 910028:2025 / TEC 910018:2025 Standardized Indigenous Telecom Security**

The QuantaCipher 5G Telecom Suite delivers end-to-end post-quantum cryptographic protection for mobile telecommunications infrastructure. Designed in alignment with the Telecommunication Engineering Centre (TEC) of the Department of Telecommunications (DoT), Government of India, and 3GPP specifications, the suite resolves Harvest-Now-Decrypt-Later (HNDL) vulnerabilities across subscriber over-the-air signaling, internal Service-Based Architecture (SBA) microservices, international roaming interconnects (SEPP/N32), and telecom supply-chain cryptographic inventory.

---

## 4-Product Portfolio Overview

```
                          ┌────────────────────────────────────────────────────────┐
                          │     QuantaCipher 5G Telecom Post-Quantum Suite         │
                          └──────────────────────────┬─────────────────────────────┘
                                                     │
       ┌──────────────────────┬──────────────────────┴──────────────────────┬──────────────────────┐
       ▼                      ▼                                             ▼                      ▼
┌──────────────┐       ┌──────────────┐                              ┌──────────────┐       ┌──────────────┐
│  QC-PQ-SUCI  │       │  QC-PQ-SBA   │                              │  QC-PQ-SEPP  │       │  QC-PQ-CBOM  │
│  Subscriber  │       │  SBA Token   │                              │  N32 Roaming │       │ Telecom-CBOM │
│  Concealment │       │   Gateway    │                              │  Interconnect│       │ & MTCTE Audit│
└──────┬───────┘       └──────┬───────┘                              └──────┬───────┘       └──────┬───────┘
       │                      │                                             │                      │
  3GPP TS 33.501         3GPP TS 33.501 §6.3.1                          3GPP TS 33.501 §5.9.3    TEC 910018:2025 §5
  Annex C & TEC          RFC 7515 PQ-JWT                                Annex H PRINS JWE       CycloneDX 1.6 CBOM
  Profiles C & D         ML-DSA-65 & Hybrid                             Hybrid X-Wing           Automated MTCTE Pass
```

---

## Product 1: QC-PQ-SUCI (5G Subscriber Identity Concealment)

### Standard Conformance
- **3GPP TS 33.501 Annex C** (Subscription Concealed Identifier - SUCI)
- **3GPP TS 23.003 §2.2B** (Standard Network Access Identifier NAI format)
- **TEC 910028:2025 §6.4** (Indian National Post-Quantum Migration Standard for 5G Core)

### Architecture & Profiles
Protects the Permanent Identifier (SUPI/IMSI) against rogue IMSI-catchers and quantum eavesdroppers over the wireless air interface:
- **Profile C (Protection Scheme 3 - Pure PQC):** Homogeneous Module Lattice KEM (FIPS 203 ML-KEM-768) + AES-256-CTR + HMAC-SHA256. NIST Security Level 3.
- **Profile D (Protection Scheme 4 - Hybrid Migration):** Dual-defense key agreement combining ML-KEM-768 with classical ECDH Curve25519 (X25519) via HKDF-Extract/Expand.

### Wire Format
Conforms precisely to standard 3GPP NAI representation:
```text
suci-0-<MCC>-<MNC>-<RoutingIndicator>-<ProtectionScheme>-<HomeNetworkPublicKeyId>-<EncryptedOutput>@ims.mnc<MNC>.mcc<MCC>.3gppnetwork.org
```

### Performance Benchmarks
- Client baseband concealment: **2.75 ms** (Profile C) / **1.65 ms** (Profile D)
- Zero radio access network (gNodeB) modifications required.

---

## Product 2: QC-PQ-SBA (5G SBA PQ-Token Gateway)

### Standard Conformance
- **3GPP TS 33.501 §6.3.1** (Network Function Service Authorization via OAuth 2.0)
- **RFC 7515 / RFC 7519** (Compact JSON Web Signature and JWT)
- **TEC 910018:2025 §5.2** (Non-separable dual signature hybrid tokens)

### Problem Solved
In standard 5G Core, Service-Based Architecture (SBA) microservices (AMF, AUSF, UDM, SMF, PCF) authenticate via OAuth2 access tokens signed with classical RSA-2048 or ECDSA P-256. A quantum adversary decrypting or forging NRF tokens can compromise entire core network routing.

### Technical Solution
The QuantaCipher SBA PQ-Token Gateway issues compact, quantum-resilient access tokens signed with:
- **ML-DSA-65 (FIPS 204):** Pure lattice digital signature algorithm (`alg: "ML-DSA-65"`).
- **Hybrid ML-DSA-65 + ECDSA P-256:** Non-separable concatenated signature ensuring backwards compatibility with classical verification engines while guaranteeing post-quantum immutability.

---

## Product 3: QC-PQ-SEPP (5G N32 Roaming Interconnect Engine)

### Standard Conformance
- **3GPP TS 33.501 §5.9.3 & Annex H** (PRINS - PRotocol for N32 Interconnect Security)
- **RFC 7516** (JSON Web Encryption - JWE)
- **IETF draft-connolly-cfrg-xwing-02** (Hybrid ML-KEM-768 + X25519 KEM)

### Architecture
When subscribers roam internationally, inter-PLMN signaling travels between Security Edge Protection Proxies (SEPP) across intermediate IPX (IP eXchange) roaming hubs:
- **Cleartext Headers:** IPX hubs can inspect routing metadata (e.g. source PLMN, destination PLMN, API route) without decryption.
- **Encrypted Payload:** Sensitive subscriber identity, authentication vectors (RAND/AUTN), and slice credentials are encrypted inside an RFC 7516 JWE compact token using **Hybrid X-Wing (ML-KEM-768 + X25519)** and **AES-256-GCM**.

---

## Product 4: QC-PQ-CBOM (5G Telecom-CBOM & MTCTE Compliance Scanner)

### Standard Conformance
- **TEC 910018:2025 §5** (Cryptographic Inventory & Bill of Materials for Indian Telecom Equipment)
- **CycloneDX 1.6** (Standardized Software and Cryptographic Bill of Materials)
- **DoT Mandatory Testing and Certification of Telecom Equipment (MTCTE)**

### Capabilities
- **Automated Discovery:** Ingests telecom network function configurations, TLS cipher suites, and cryptographic keys across 5G Core functions (UDM, AMF, NRF, SEPP).
- **CycloneDX 1.6 CBOM Generation:** Produces machine-readable cryptographic bill of materials documenting key lengths, algorithm OIDs, post-quantum readiness, and implementation certificates.
- **Automated MTCTE Scoring:** Evaluates configurations against TEC 910018 and TEC 910028 security rules:
  - Fails legacy vulnerable ciphers (RSA, classical ECDH, Curve25519 Profile A).
  - Validates NIST Level 3/5 PQC algorithms.
  - Generates official compliance scores (0-100), violation lists, and certification readiness reports.

---

## Usage in JavaScript / TypeScript

```typescript
import { QuantaCipher } from "@quantalabss/quantacipher-sdk";

const client = new QuantaCipher();

// 1. SUCI Identity Concealment (Profile D Hybrid)
const suciResult = await client.telecomConcealSuci({
  supi: "404450123456789", // Airtel India IMSI
  mcc: "404",
  mnc: "45",
  routingIndicator: "0000",
  protectionScheme: 4, // Profile D: Hybrid ML-KEM-768 + X25519
  homeNetworkPublicKeyHex: hnPubKeyHex,
});
console.log("SUCI NAI Wire Payload:", suciResult.suci);

// 2. SBA PQ-Token Gateway
const sbaToken = await client.telecomIssueSbaToken({
  issuerNrf: "nrf-delhi-01.telecom.in",
  targetNf: "udm-core-01",
  subjectNf: "amf-ran-east",
  scope: "nudm-uecm:registration:write",
  validitySeconds: 3600,
  keypair: nrfKeypair,
  useHybrid: true,
});

// 3. SEPP PRINS Roaming Interconnect
const roamingJwe = await client.telecomEncryptSeppN32({
  cleartextHeaders: { sourcePlmn: "404-45", targetPlmn: "310-410" },
  sensitivePayload: JSON.stringify({ imsi: "404450123456789", authVector: "..." }),
  recipientSeppPublicKeyHex: foreignSeppKeyHex,
  algorithm: "XWing",
});

// 4. Telecom-CBOM & MTCTE Compliance Audit
const auditReport = await client.audit5gCore({
  deploymentName: "C-DOT 5G Native Core (TEC Migration Testbed)",
  operator: "Bharat Sanchar Nigam Limited (BSNL)",
  includeCbom: true,
  strictTec910028: true,
});
console.log("MTCTE Compliance Score:", auditReport.overallScore, "/ 100");
console.log("Status:", auditReport.complianceStatus);
```

---

## Commercial Licensing & Enterprise Deployment

QuantaCipher is provided under a **Commercial Source-Available Dual License**. For OEM integrations with telecom network equipment manufacturers (NEMs), carrier deployments, and C-DOT 5G core integration:

- **Official Contact:** `contact@quantalabs.cc`
- **License Terms:** See [LICENSE-COMMERCIAL.md](file:///home/azureuser/dev/quantacipher/LICENSE-COMMERCIAL.md)
- **Patent Portfolio:** Indian Patent Office Form 2 Provisional Specification Claims 1–16 covering PQ-IES Profile C/D, SBA Quantum Gateways, SEPP PRINS JWE Roaming, and Automated Telecom-CBOM Scanners.
