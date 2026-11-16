# Cryptographic Algorithms & Standards

QuantaCipher supports the complete suite of post-quantum cryptographic primitives officially standardized by the United States National Institute of Standards and Technology (**NIST**) in August 2024, along with modern hybrid schemes.

---

## 1. Key Encapsulation Mechanisms (KEM)

KEM algorithms are used to securely establish shared symmetric keys between communicating parties over an untrusted channel.

### NIST FIPS 203: ML-KEM (Module-Lattice KEM)
Derived from the CRYSTALS-Kyber submission, ML-KEM is based on the computational hardness of the Module Learning With Errors (**M-LWE**) problem over structured polynomial rings.

QuantaCipher supports two standard parameter sets:

#### 1. ML-KEM-768 (NIST Security Category 3)
* **Security Equivalence:** Comparable to AES-192 / Classical 3072-bit RSA.
* **Target Profile:** High-throughput, latency-critical applications (e.g., 5G Edge user-plane signaling, real-time microservices).
* **Public Key Size:** 1,184 bytes
* **Ciphertext Size:** 1,088 bytes
* **Encapsulation Speed:** ~98 µs (Rust/WASM benchmark)

#### 2. ML-KEM-1024 (NIST Security Category 5)
* **Security Equivalence:** Comparable to AES-256 (highest NIST assurance level).
* **Target Profile:** National security systems, carrier interconnects (5G SEPP), financial settlement systems, and long-term classified data.
* **Public Key Size:** 1,568 bytes
* **Ciphertext Size:** 1,568 bytes
* **Encapsulation Speed:** ~132 µs (Rust/WASM benchmark)

---

## 2. Hybrid KEM: Hybrid X-Wing

For organizations operating in transitional environments or subject to legacy compliance mandates, QuantaCipher implements **Hybrid X-Wing** (combining classical **X25519** with post-quantum **ML-KEM-768**):

```
       [Sender]                                              [Receiver]
          │                                                      │
          ├── 1. Generate Ephemeral X25519 Keypair ──────────────┤
          ├── 2. Generate Ephemeral ML-KEM-768 Secret ───────────┤
          │                                                      │
          ▼                                                      ▼
  [Classic Shared Secret]                                [Classic Shared Secret]
  [Quantum Shared Secret]                                [Quantum Shared Secret]
          │                                                      │
          └─────────────► Combined HKDF-SHA256 ◄─────────────────┘
                                 │
                                 ▼
                     [Final Symmetric Key K_DEM]
```

### Why Use Hybrid X-Wing?
* **Dual-Layer Defense:** An attacker must simultaneously break **both** the discrete logarithm problem over Curve25519 AND the M-LWE lattice problem to compromise the ciphertext.
* **Zero Trust in Novel Math:** If unexpected mathematical cryptanalysis is published against lattice problems in the future, the classical X25519 layer continues to guarantee classical defense.
* **Regulatory Compliance:** Recommended by European (BSI) and French (ANSSI) cybersecurity agencies during the 2024–2030 transition window.

---

## 3. Digital Signature Algorithms (DSA)

Post-quantum signatures provide cryptographic proof of authenticity and non-repudiation that cannot be forged by a quantum computer running Shor's algorithm.

### NIST FIPS 204: ML-DSA (Module-Lattice DSA)
Derived from CRYSTALS-Dilithium, ML-DSA is built upon the hardness of Module Short Integer Solution (**M-SIS**) and M-LWE problems:

* **ML-DSA-44 (Category 2):** Compact public key (1,312 B), signature size (2,420 B). Best for web applications and JWT payloads.
* **ML-DSA-65 (Category 3):** Balanced security (Category 3), public key (1,952 B), signature size (3,293 B).
* **ML-DSA-87 (Category 5):** Maximum security level (equivalent to AES-256), public key (2,592 B), signature size (4,595 B).

### NIST FIPS 206 (Draft): FN-DSA (Falcon)
Based on the Fast-Fourier lattice problem over NTRU lattices:
* **Falcon-512:** Produces extremely compact signatures (~666 bytes), significantly smaller than Dilithium. Ideal for bandwidth-constrained telecom signaling and embedded environments.

### TEC 910018:2025 (Figure 3): Hybrid Composite Signature
Per the Indian Telecommunication Engineering Centre (TEC) Technical Report on PQC Migration (**TEC 910018:2025 Section 3.4 & Figure 3**), QuantaCipher implements non-separable dual signatures:
* **Post-Quantum Layer (Sign1):** FIPS 204 ML-DSA-65 over message payload $M$.
* **Classical Layer (Sign2):** Classical ECDSA P-256 over $[\text{Sign1} \parallel \text{SHA-256}(M)]$.
* **Security Properties:**
  * **Unforgeability:** An attacker must simultaneously break both the discrete logarithm problem over NIST P-256 AND the lattice problem over ML-DSA-65.
  * **Non-Separability:** The classical signature binds directly to the PQC signature, preventing downgrade attacks.
  * **Backward Compatibility:** Legacy verifiers can validate Sign2 using standard ECDSA.

---

## 4. Primitives Comparison Table

| Primitive | Standard | Role | Security Level | Public Key | Ciphertext / Sig |
|---|---|---|---|---|---|
| **ML-KEM-768** | NIST FIPS 203 | Key Encapsulation | NIST Level 3 | 1,184 bytes | 1,088 bytes |
| **ML-KEM-1024** | NIST FIPS 203 | Key Encapsulation | NIST Level 5 | 1,568 bytes | 1,568 bytes |
| **Hybrid X-Wing**| IETF Draft | Hybrid KEM | Level 3 + Classic | 1,216 bytes | 1,120 bytes |
| **ML-DSA-44** | NIST FIPS 204 | Digital Signature | NIST Level 2 | 1,312 bytes | 2,420 bytes |
| **ML-DSA-65** | NIST FIPS 204 | Digital Signature | NIST Level 3 | 1,952 bytes | 3,293 bytes |
| **Falcon-512** | FIPS 206 Draft | Digital Signature | NIST Level 1 | 897 bytes | 666 bytes |
| **Hybrid DSA** | TEC 910018 Fig 3 | Non-Separable Composite | Level 3 + Classic | 1,985 bytes | 3,373 bytes |

