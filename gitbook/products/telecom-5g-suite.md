# QuantaCipher 5G Telecom Post-Quantum Security Suite

> **3GPP Release 18/19 Aligned & TEC 910028:2025 / TEC 910018:2025 Indigenous Telecom Security**

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
│  Concealment │       │   Gateway    │                              │ (Bilateral)  │       │  & Analyzer  │
└──────┬───────┘       └──────┬───────┘                              └──────┬───────┘       └──────┬───────┘
       │                      │                                             │                      │
  3GPP TS 33.501         3GPP TS 33.501 §6.3.1                          3GPP TS 33.501 §5.9.3    TEC 910018:2025
  Annex C Framework      RFC 7515 PQ-JWT (~4.4 KB)                      Annex H PRINS JWE        §§2.6 & 4.1.2
  Profiles C & D (Prop.) ML-DSA-65 & Hybrid                             Hybrid X-Wing            CycloneDX 1.6 CBOM
```

---

## Product 1: QC-PQ-SUCI (5G Subscriber Identity Concealment)

### Standard Conformance & Proposed Extensions
- **3GPP TS 33.501 Annex C:** Standardizes Protection Profiles A (Curve25519) and B (secp256r1). Unchanged cryptographic primitives (ANSI-X9.63-KDF with SHA-256, 8-octet truncated HMAC-SHA-256 MAC, and 128-bit counter AES encryption) are strictly retained.
- **QuantaCipher Proposed Post-Quantum Profiles:** Conforming to the Annex C framework and TEC 910028:2025 §6.4:
  - **Profile C (Proposed Protection Scheme 3 - Pure PQC):** Homogeneous Module Lattice KEM (FIPS 203 ML-KEM-768) + AES-256-CTR + HMAC-SHA256. NIST Security Level 3.
  - **Profile D (Proposed Protection Scheme 4 - Hybrid Migration):** Dual-defense key agreement combining ML-KEM-768 with classical ECDH Curve25519 (X25519) via HKDF-Extract/Expand.
- **3GPP TS 23.003 §2.2B:** Standard Network Access Identifier (NAI) wire format.

### Threat Model & Threat Boundary Clarification
- **Passive Capture & HNDL Defense:** SUCI conceals the permanent subscriber identity (SUPI/IMSI) so that passive radio eavesdroppers recording over-the-air traffic cannot identify subscribers today or decrypt traffic in the future with a cryptographically relevant quantum computer (CRQC).
- **Active Rogue Base Stations & Network Downgrade:** A concealed identifier alone does not prevent active rogue base stations (`Identity Request` before NAS security activation) or forced downgrade to legacy 2G/3G/4G networks. Mitigation requires carrier network policies: rejecting unauthenticated NAS Identity Requests, disabling legacy fallback, and enforcing gNodeB mutual authentication.

### Wire Format & Hardware Deployment Considerations
- **Wire Representation:**
  ```text
  suci-0-<MCC>-<MNC>-<RoutingIndicator>-<ProtectionScheme>-<HomeNetworkPublicKeyId>-<EncryptedOutput>@ims.mnc<MNC>.mcc<MCC>.3gppnetwork.org
  ```
- **SUCI Payload Size:** An ML-KEM-768 ciphertext is 1,088 bytes, resulting in a wire payload of ~1.2 KB (compared to ~100 bytes for Profile A). 
- **USIM Support:** Legacy SIMs transfer at most 256 bytes per APDU. Supporting 1.2 KB SUCI requires smartcards supporting **ISO/IEC 7816-4 Extended Length APDU**, or execution in the **Mobile Equipment (ME) baseband processor**.

---

## Product 2: QC-PQ-SBA (5G SBA PQ-Token Gateway)

### Standard Conformance
- **3GPP TS 33.501 §6.3.1:** Network Function Service Authorization via OAuth 2.0.
- **RFC 7515 / RFC 7519:** Compact JSON Web Signature and JWT.
- **TEC 910018:2025 §3.4:** Trust management during migration — Hybrid Solution approach.

### Technical Architecture
The QuantaCipher SBA PQ-Token Gateway issues compact, quantum-resilient access tokens between core network functions (AMF, AUSF, UDM, SMF, PCF):
- **ML-DSA-65 (FIPS 204):** Pure lattice digital signature algorithm (`alg: "ML-DSA-65"`).
- **Hybrid ML-DSA-65 + ECDSA P-256:** Non-separable dual signature ensuring dual classical and quantum authentication.

### Payload Size & HTTP/2 Limits
- **PQ-JWT Size:** An ML-DSA-65 signature is 3,309 bytes. Including claims and headers, a compact token is approximately 4.4 KB.
- **HTTP/2 Configuration:** Standard HTTP/2 implementations default `SETTINGS_MAX_HEADER_LIST_SIZE` to 8 KB. Service-mesh sidecars, API gateways (Envoy, Kong), and 5G NRF endpoints must configure header limits to at least 8,192 or 16,384 bytes.
- **Standardization Note:** Standard IETF JOSE algorithm identifiers for ML-DSA are currently pending RFC publication; custom identifiers are used.

---

## Product 3: QC-PQ-SEPP (5G N32 Roaming Interconnect Design)

### Standard Conformance
- **3GPP TS 33.501 §5.9.3 & Annex H:** PRINS (PRotocol for N32 Interconnect Security).
- **RFC 7516:** JSON Web Encryption (JWE).
- **IETF draft-connolly-cfrg-xwing-02:** Hybrid ML-KEM-768 + X25519 KEM.

### Bilateral Interconnect Requirement
N32 roaming traverses intermediate IPX roaming hubs between two independent operators (visiting PLMN and home PLMN). Because both sides must agree on cryptographic suites, **QC-PQ-SEPP cannot be deployed unilaterally**: both the visiting SEPP (v-SEPP) and home SEPP (h-SEPP) must implement and negotiate the post-quantum PRINS extension during the N32-c security handshake. It is presented as a bilateral carrier interconnect design.

- **Cleartext Headers:** IPX hubs inspect routing metadata without decryption.
- **Encrypted Payload:** Sensitive subscriber credentials and authentication vectors are sealed in RFC 7516 JWE using **Hybrid X-Wing** and **AES-256-GCM**.

---

## Product 4: QC-PQ-CBOM (5G Telecom-CBOM & Readiness Analyzer)

### Regulatory Context & Citations
- **TEC 910018:2025:**
  - **Section 2.6:** Risk of Delay: Impact Analysis on telecom infrastructure.
  - **Section 4.1.2:** Quantum-readiness program elements — Cryptographic Inventory.
  - **Section 3.4:** Hybrid migration trust management.
- **TEC 910028:2025 §6.8:** Post-quantum security evaluation criteria.
- **CycloneDX 1.6:** Standardized Cryptographic Bill of Materials (CBOM).
- **MTCTE Scope Clarification:** MTCTE is a statutory testing and certification scheme administered by TEC through designated CABs. QC-PQ-CBOM is an internal operator/NEM analytical auditing tool, not a statutory certification body.

### Open-Source 5G Core Sample Audits (C-DOT Pilot Hooks)
QC-PQ-CBOM was executed against default configurations of popular open-source 5G cores to quantify real-world telecom cryptographic debt:
- **Open5GS v2.7.x:**
  - **Score:** 15 / 100 (Critical Quantum Risk)
  - **Vulnerabilities:** Profile A (Curve25519) SUCI default, classical ECDSA P-256 SBA tokens, unauthenticated SBA endpoints.
  - [Open5GS Sample Report JSON](file:///home/azureuser/dev/quantacipher/reports/open5gs_cbom_report.json)
- **free5GC v3.4.x:**
  - **Score:** 0 / 100 (Critical Quantum Risk)
  - **Vulnerabilities:** Profile A SUCI default, NEA0 (cleartext null cipher) user plane configured, no SBA TLS encryption.
  - [free5GC Sample Report JSON](file:///home/azureuser/dev/quantacipher/reports/free5gc_cbom_report.json)

---

## Usage in JavaScript / TypeScript

```typescript
import { QuantaCipher } from "@quantalabss/quantacipher-sdk";

const client = new QuantaCipher();

// 1. SUCI Identity Concealment (Proposed Profile D Hybrid)
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

// 3. Bilateral SEPP PRINS Roaming Interconnect
const roamingJwe = await client.telecomEncryptSeppN32({
  cleartextHeaders: { sourcePlmn: "404-45", targetPlmn: "310-410" },
  sensitivePayload: JSON.stringify({ imsi: "404450123456789", authVector: "..." }),
  recipientSeppPublicKeyHex: foreignSeppKeyHex,
  algorithm: "XWing",
});

// 4. Telecom-CBOM & Cryptographic Readiness Audit
const auditReport = await client.audit5gCore({
  deploymentName: "C-DOT 5G Native Core (TEC Migration Testbed)",
  operator: "Bharat Sanchar Nigam Limited (BSNL)",
  includeCbom: true,
  strictTec910028: true,
});
console.log("TEC Readiness Score:", auditReport.overallScore, "/ 100");
console.log("Readiness Pass:", auditReport.complianceStatus);
```

---

## Commercial Licensing & Enterprise Deployment

QuantaCipher is provided under a **Commercial Source-Available Dual License**. For OEM integrations with telecom network equipment manufacturers (NEMs), carrier deployments, and C-DOT 5G core integration:

- **Official Contact:** `contact@quantalabs.cc`
- **License Terms:** See [LICENSE-COMMERCIAL.md](file:///home/azureuser/dev/quantacipher/LICENSE-COMMERCIAL.md)
- **Sample Audit Reports:** [Open5GS CBOM](file:///home/azureuser/dev/quantacipher/reports/open5gs_cbom_report.json) · [free5GC CBOM](file:///home/azureuser/dev/quantacipher/reports/free5gc_cbom_report.json)

