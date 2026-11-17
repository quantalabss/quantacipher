# TEC Meeting Master Preparation Guide
**Meeting with the Deputy Director General (DDG), Telecommunication Engineering Centre (TEC), Department of Telecommunications (DoT)**
**Time:** Tuesday, 17 November 2026 at 11:00 AM IST

---

## 1. Quick Reference & Core Strategy

* **Who is in the Room:**
  * **DDG (Quantum Technologies / Networks):** Chief Decision-Maker. Joint-Secretary rank officer who has executive authority over pilot approvals, testbed access, fee concessions, and formal MoMs.
  * **Director & ADG (QT):** Technical standards leads, review TSTP compliance.
  * **Sh. Dhanesh Goel:** Program / Committee Coordinator.
  * **C-DOT Representatives (e.g., Sh. Rakesh Singh Rawat):** Authors of India's indigenous 5G Core and quantum encryptors (*Q-SETU*).
* **The Goal (Your "LOI"):**
  Government bodies like TEC/DoT do not hand out commercial purchasing contracts in a first meeting. Instead, your goal is to leave with **an official agreement in the Minutes of Meeting (MoM)** stating:
  > *"QuantaCipher was reviewed and recommended for onboarding into a TEC / C-DOT Telecom Testbed Sandbox Trial to benchmark under carrier network conditions."*
  This official government MoM serves as your **Pilot LOI** for Samgnya, investors, and grants.

---

## 2. 30-Second Opening Pitch (Memorize This)

> *"Good morning, DDG Sir and respected officers. Thank you for your time.
> 
> I am Kishore, founder of QuantaLabs, a DPIIT-recognized deep-tech startup from Coimbatore. We built **QuantaCipher**: an indigenous software cryptographic SDK, CBOM scanner, and crypto-agility framework implementing NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA). 
> 
> We have successfully validated all **220 NIST ACVP test vectors**, our core engine is audited, and we generate keys strictly using OS-level hardware entropy. 
> 
> Most importantly, we studied **TEC 910018:2025** closely. Not only do we support Hybrid KEM (X-Wing), but we also implemented the exact **non-separable hybrid signature scheme from Section 3.4 and Figure 3 of your report**, combining ML-DSA-65 with ECDSA P-256. 
> 
> We are here today to seek TEC’s guidance on the L1/L2A certification pathway and to request participation in a telecom testbed pilot to validate QuantaCipher under carrier network conditions."*

---

## 3. Mapping QuantaCipher to TEC 910018:2025 (The 5-Minute Story)

| Requirement in TEC 910018:2025 | QuantaCipher Implementation | Evidence / Standard |
| :--- | :--- | :--- |
| **Crypto-Agility (Sec 4.1.1, 4.2, 4.3.4)**<br>Switch algorithms rapidly without code refactoring. | Dynamic algorithm registry with authenticated header binding, minimum security level enforcement, and in-place re-wrapping. | Bound header `alg` ID, strict policy checks, zero downtime re-wrap. |
| **Hybrid KEM (Sec 3.4, 4.3.8)**<br>Mitigate *Harvest-Now-Decrypt-Later* attacks. | **Hybrid X-Wing** combining Classical X25519 with Post-Quantum ML-KEM-768. | draft-connolly-cfrg-xwing-kem, dual-layer defense. |
| **Recommended Primitives (Sec 3.3, Table 3.3)**<br>AES-256, FIPS 203, FIPS 204, SHA-256. | AES-256-GCM, ML-KEM-768/1024, ML-DSA-44/65/87, SHA-256/SHA3. | NIST FIPS 203/204 finalized standards, 220 ACVP tests passed. |
| **Cryptographic Bill of Materials (Sec 4.1.4, 4.2.4)**<br>Automated discovery of crypto assets. | **QuantaCipher Insight**: CycloneDX 1.6 CBOM generator and quantum risk scoring engine. | Automated AST code scan, PDF/JSON CBOM export. |
| **Non-Separable Hybrid Signatures (Sec 3.4, Fig 3)**<br>Unforgeable dual signature resisting downgrade. | **Hybrid ML-DSA-65 + ECDSA P-256**: Sign1 = ML-DSA-65($M$), Sign2 = ECDSA-P256($\text{Sign1} \parallel \text{SHA256}(M)$). | TEC 910018 Figure 3 compliance, 3,373-byte composite envelope. |
| **Telecom Use Cases (Annexure-I)**<br>OSS/BSS, Data in Transit, VNF Integrity. | Layer-7 envelope encryption for REST/HTTP2 APIs, Vault Mode for records, digital signing for VNF packages. | 3GPP Rel 18/19 alignment, sub-millisecond latency. |

---

## 4. Demystifying the Telecom Numbers & Technical Jargon

### Benchmark 1: `132 µs Encrypt / 152 µs Decrypt on 1 KB Payloads`
* **What `µs` means:** Microseconds = 1 millionth of a second. $132\ \mu\text{s} = 0.132\ \text{milliseconds}$.
* **Why 1 KB?** In 5G Core networks (e.g., 3GPP Service-Based Architecture - SBA), control-plane messages between network functions (AMF, AUSF, UDM) are REST API JSON payloads, typically between **500 bytes and 2 KB**.
* **Telecom Standard:** 5G control-plane latency budgets allow **5 to 10 milliseconds** for authentication transactions. Adding $0.13\ \text{ms}$ consumes **less than 2% of the budget**. It introduces virtually zero perceptible lag!

### Benchmark 2: `274 MB/s on 1 MB Payloads`
* **What it means:** 274 Megabytes per second = approx **2.2 Gigabits per second (Gbps)** throughput per single CPU core.
* **Why telecom cares:** Telcos process massive data streams: Call Detail Records (CDRs), subscriber billing dumps, and database backups. 274 MB/s means a single background worker process can encrypt gigabit streams in real time without bottlenecking network links.

### Benchmark 3: Library Benchmark vs. Carrier Load Testing
* **Library benchmark (what you have today):** Algorithmic execution speed running in RAM on a single CPU core.
* **Carrier load testing (what the testbed provides):** Stress-testing under 100,000 concurrent subscriber sessions, high packet rates, and network jitter across carrier routers.
* **Your winning script:**
  > *"Sir, our single-core library benchmarks show 132 microseconds on 1 KB payloads, proving that the mathematical overhead of ML-KEM and AES-256 is negligible. However, as an agile startup, we do not own carrier-grade multi-10Gbps traffic generators. **That is precisely why we are here: to request a trial in the TEC or C-DOT telecom sandbox to validate QuantaCipher under real carrier traffic.**"*

---

## 5. How to Handle the 3 Known Gaps

| Gap | Reality | Your Exact Script |
| :--- | :--- | :--- |
| **1. Hybrid Signatures** | **CLOSED TODAY!** We implemented TEC Figure 3. | *"We read Section 3.4 and Figure 3 of TEC 910018:2025. We have already implemented the non-separable composite signature combining ML-DSA-65 and ECDSA P-256. It is fully unit tested and verified in our core engine."* |
| **2. FIPS 140-3 Hardware Validation** | QuantaCipher is software; FIPS 140-3 applies to physical hardware modules (HSMs). | *"QuantaCipher is an agile software cryptographic SDK, not a hardware appliance. Under the DST/NQM Roadmap, software crypto is evaluated under **TEC Level 1 (Functional Compliance via ACVP)** and **TEC Level 2A (Software Assurance via CERT-In labs)**. That is the exact tier we are pursuing."* |
| **3. Telecom Protocol Layer (IPSec / 5G SEPP)** | IPSec is Layer 3 (network packets). QuantaCipher is Layer 7 (application data). | *"Network tunnels (like IPSec) only protect the perimeter. Once traffic passes the edge router, data is in cleartext across internal cloud microservices, OSS/BSS databases, and subscriber stores. QuantaCipher operates at **Layer 7**, encrypting the application payload itself. Even if the network tunnel is decrypted, the subscriber data remains completely quantum-safe."* |

---

## 6. Verified Technical Facts (Code Ground Truth)

* **Randomness & CSPRNG:**
  * Native Rust: Kernel syscall `getrandom(2)` via `rand::rngs::OsRng` drawing hardware entropy from `/dev/urandom`.
  * WASM: Browser W3C `crypto.getRandomValues` via `getrandom(js)`.
  * *Never seeded from user-space or pseudo-random static seeds.*
* **Client-Side Key Isolation:**
  * Keys are generated strictly on the client application / edge host.
  * Private keys **never** leave the client host or touch the network.
  * In Vault Mode, the gateway only indexes authenticated ciphertext headers; it never possesses the private decryption key.
* **Memory Zeroization:**
  * Ephemeral secrets, KEM shared secrets, and private keys implement `zeroize::ZeroizeOnDrop` to ensure memory buffers in RAM are cryptographically zeroed out upon exiting scope.

---

## 7. The 4 "Clever Asks" (To Secure the Pilot & LOI)

### Clever Ask 1: TSTP (Test Schedule & Procedure) Contribution
> *"Sir, we noticed that while TEC 910018 outlines the migration roadmap, the formal **TSTP (Test Schedule and Test Procedure)** for certifying software crypto-agility and PQC libraries is still under formulation. Since QuantaCipher has built an automated harness running all **220 NIST ACVP test vectors** for FIPS 203 and 204, **could we submit our test harness and vector validation suite to TEC as a reference input for developing the national PQC TSTP?**"*

### Clever Ask 2: C-DOT 5G Core Sandbox Integration
> *"Sir, we noted that C-DOT is a key contributor to your report (Sh. Rakesh Singh Rawat). C-DOT has developed India's indigenous 5G Core and quantum encryptors (Q-SETU). **Could TEC introduce QuantaCipher to C-DOT to pilot Layer-7 PQC encryption on 5G Service-Based Architecture (SBA) REST APIs within the C-DOT testbed?**"*

### Clever Ask 3: ITU-T SG17 (Security) National Contribution
> *"Sir, as TEC represents India at **ITU-T SG17** on quantum security standards, if our implementation of the **TEC Figure 3 Non-Separable Hybrid Signature** is validated in a telecom pilot, **could this case study be submitted as an Indian National Contribution to ITU-T to demonstrate indigenous PQC deployment?**"*

### Clever Ask 4: Startup Concession & Recording the Pilot MoM (Your "LOI")
> *"Sir, as a DPIIT-recognized startup, we are preparing for formal Level 1 and Level 2A certification once the accredited labs open. In the interim, **can we request provisional onboarding into a TEC/C-DOT sandbox trial, and can we document this evaluation agreement in the Minutes of today's Meeting?**"*

---

## 8. Anticipated Difficult Questions & Bullet-Proof Answers

### Q1: "Do you use OpenSSL or validated modules?"
> *"No, sir. QuantaCipher is built in pure, memory-safe Rust using audited RustCrypto primitives. We implement NIST FIPS 203 and FIPS 204 directly, validated against all 220 official NIST ACVP test vectors. We are a pure software library and welcome lab evaluation by TEC-designated CABs."*

### Q2: "Is this technology indigenous?"
> *"Yes, sir. QuantaCipher is 100% Indian-built, India-owned intellectual property, designed and maintained by QuantaLabs in Coimbatore under DPIIT recognition. There is zero foreign cloud dependency."*

### Q3: "What happens if ML-KEM or ML-DSA is broken mathematically in the future?"
> *"That is the core purpose of QuantaCipher’s **Crypto-Agility engine**. First, our Hybrid X-Wing and Hybrid DSA schemes ensure that even if lattice math is weakened, classical cryptography (X25519 and ECDSA P-256) still holds. Second, our algorithm registry allows an enterprise to rotate to a new primitive (e.g., Falcon-512 or future NIST round selections) and re-wrap ciphertexts in-place via authenticated headers without refactoring application code."*

### Q4: "Do you have any paying telecom customers today?"
> *"We do not have a commercial telecom contract in production yet, sir. We have tested our SDKs with developer environments and independent auditors. Our primary goal today is to partner with TEC and C-DOT for our first formal telecom testbed trial."*

---

## 9. 3-Minute Live Demo Script

If given screen-share permission:
1. **Minute 1: Insight CBOM Scan**
   * Run the tool on a sample codebase.
   * Show the detected classical vs. post-quantum algorithms.
   * Highlight the generated CycloneDX 1.6 CBOM with quantum vulnerability scoring.
2. **Minute 2: Hybrid Encryption & Decryption**
   * Show encrypting a 1 KB payload using `Hybrid X-Wing`.
   * Show the authenticated header with `alg: hybrid-xwing` and `ver: 2`.
   * Decrypt and verify matching plaintext.
3. **Minute 3: TEC Figure 3 Non-Separable Hybrid Signature**
   * Generate a dual keypair (`ML-DSA-65` + `ECDSA P-256`).
   * Sign a payload, showing the 3,373-byte composite envelope.
   * Demonstrate tamper rejection: flip 1 bit in the classical signature and show verification fails closed.

---

## 10. Post-Meeting 24-Hour Follow-Up Email Template

Send this to Dhanesh and the DDG within 24 hours of the call:

```text
Subject: Thank You & Agreed Next Steps | QuantaCipher - TEC Discussion (17 Nov 2026)

Respected DDG Sir, Sh. Dhanesh Ji, and Officers,

Thank you for your valuable time and guidance during our discussion today regarding QuantaCipher's post-quantum cryptographic SDK and its alignment with TEC 910018:2025.

As discussed:
1. QuantaCipher has validated all 220 NIST ACVP test vectors and implemented the TEC Figure 3 Non-Separable Hybrid Signature (ML-DSA-65 + ECDSA P-256).
2. We would be honored to contribute our automated ACVP test harness as a reference input for TEC's upcoming PQC Test Schedule and Test Procedure (TSTP).
3. We are eager to participate in the recommended sandbox trial in coordination with C-DOT to benchmark QuantaCipher under carrier network conditions.

Could you please share the formal fee schedule / startup concession guidelines for L1/L2A evaluation and confirm if the agreed sandbox next steps will be documented in the Minutes of Meeting (MoM)?

Respectfully yours,

Kishore
Founder, QuantaLabs (DPIIT Recognized)
Coimbatore, India
https://www.quantacipher.com
```
