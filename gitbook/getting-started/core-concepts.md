# Core Cryptographic Concepts

To effectively deploy and integrate QuantaCipher into enterprise applications, it is helpful to understand the underlying cryptographic architecture, framing standards, and operational models.

---

## 1. KEM / DEM Hybrid Architecture

Traditional asymmetric algorithms like RSA allowed direct encryption of small plaintext blocks using the public key. Modern lattice-based post-quantum algorithms standardized in **NIST FIPS 203** work differently: they operate exclusively as **Key Encapsulation Mechanisms (KEMs)**.

To encrypt arbitrary-length enterprise payloads with maximum speed and security, QuantaCipher employs a standardized **KEM / DEM (Data Encapsulation Mechanism)** hybrid scheme:

```
                  ┌──────────────────────────────────────────────┐
                  │                 SENDER                       │
                  └──────────────────────────────────────────────┘
                                          │
       1. Encapsulate Secret              │ 2. Encrypt Plaintext Payload
       (ML-KEM-1024 Public Key)           │ (Plaintext Data)
                  │                       │
                  ▼                       ▼
          [Shared Secret SS]     [AES-256-GCM Cipher]
                  │                       │
                  └───────────┬───────────┘
                              ▼
                 [QuantaCipher Envelope]
                 (KEM Ciphertext + Nonce + AES Ciphertext)
                              │
                              ▼ (Network Transit / Zero-Trust Gateway)
                              │
                  ┌──────────────────────────────────────────────┐
                  │                RECEIVER                      │
                  └──────────────────────────────────────────────┘
                              │
       3. Decapsulate Secret  │ 4. Authenticated Decryption
       (ML-KEM-1024 Priv Key) │ (AES-GCM Auth Tag Checked)
                  │                       │
                  ▼                       ▼
          [Shared Secret SS] ────────────► [Recovered Plaintext]
```

### Step-by-Step Breakdown:
1. **Key Encapsulation (KEM):** The sender runs `crypto_kem_enc()` with the recipient's ML-KEM-1024 public key. This outputs:
   - A 32-byte high-entropy **Shared Secret ($SS$)**
   - A 1,568-byte **KEM Ciphertext ($C_{KEM}$)**
2. **Key Derivation & Nonce:** The shared secret is passed into a HKDF-SHA256 derivation function. A cryptographically secure 12-byte initialization vector (nonce) is generated from OS entropy.
3. **Data Encapsulation (DEM):** The plaintext payload is encrypted using **AES-256-GCM** (Galois/Counter Mode). This provides both confidentiality and authenticated integrity (preventing ciphertext tampering).
4. **Decapsulation:** The recipient uses their private key with `crypto_kem_dec()` to decapsulate the exact same shared secret from $C_{KEM}$, then decrypts the AES payload and validates the GCM authentication tag.

---

## 2. The Three Operational Modes

QuantaCipher provides three dedicated operational modes tailored to different enterprise compliance, storage, and communication requirements:

```
┌─────────────────┬───────────────────────────────┬────────────────────────────┐
│ Mode            │ Lifecycle / Key Retention     │ Primary Use Cases          │
├─────────────────┼───────────────────────────────┼────────────────────────────┤
│ 1. Vault Mode   │ Ephemeral key generated,      │ Immutable audit logs,      │
│                 │ encrypted, private key        │ compliance evidence,       │
│                 │ INSTANTLY DESTROYED           │ non-repudiation timestamps │
├─────────────────┼───────────────────────────────┼────────────────────────────┤
│ 2. Secure Mode  │ Persistent keypair generated; │ End-to-end user messaging, │
│                 │ recipient retains private     │ confidential databases,    │
│                 │ key for local decryption      │ 5G core signaling trunks   │
├─────────────────┼───────────────────────────────┼────────────────────────────┤
│ 3. Signing Mode │ Post-quantum private key signs│ JWTs, API requests, code   │
│                 │ document envelope; public     │ signing, software supply   │
│                 │ key verifies signature        │ chain integrity (FIPS 204) │
└─────────────────┴───────────────────────────────┴────────────────────────────┘
```

### Deep Dive: Vault Mode (Permanent Sealing)
Vault Mode is a unique cryptographic guarantee invented for non-repudiable audit logging:
* When `sdk.encryptVault(data)` is invoked, an ML-KEM keypair is generated in volatile memory.
* The data is encrypted against this ephemeral public key.
* The private key is **overwritten with zeroes and dropped from memory** before the function even returns.
* **Result:** The ciphertext is mathematically sealed. No party—neither the sender, nor QuantaCipher, nor an adversary with a future quantum computer—can ever decrypt it. It serves as an unalterable, tamper-proof proof of occurrence.

---

## 3. Envelope Wire Formats

QuantaCipher ciphertexts are serialized into structured, human-readable, self-describing string envelopes. This ensures portability across HTTP headers, JSON documents, message queues (Kafka, RabbitMQ), and databases.

### Envelope Structure:

```
[PREFIX] : [ALGORITHM_TAG] : [BASE64_KEM_CT] : [BASE64_NONCE] : [BASE64_AES_CT]
```

### Supported Envelopes:

* `QZ_VAULT_V2:ml-kem-1024:<kem_ct>:<nonce>:<aes_ct>` — Modern Vault Mode envelope with explicit algorithm tagging.
* `QZ_SECURE_V2:ml-kem-1024:<kem_ct>:<nonce>:<aes_ct>` — Modern Secure Mode envelope with explicit algorithm tagging.
* `QZ_SECURE_V2:hybrid-xwing:<kem_ct>:<nonce>:<aes_ct>` — Hybrid X-Wing (X25519 + ML-KEM-768) dual-defense envelope.
* `QZ_VAULT_V1:<kem_ct>:<nonce>:<aes_ct>` — Legacy v1 Vault envelope (implicitly ML-KEM-1024).
* `QZ_SECURE_V1:<kem_ct>:<nonce>:<aes_ct>` — Legacy v1 Secure envelope (implicitly ML-KEM-1024).

---

## 4. Memory Zeroization & Side-Channel Defense

In production environments, residual key bytes lingering in uninitialized memory blocks, heap allocations, or crash core dumps represent a severe vulnerability.

QuantaCipher's underlying Rust core strictly enforces memory zeroization:
* Private key materials, KEM shared secrets, and intermediate derivation buffers are wrapped in `Zeroizing<T>` types.
* When a buffer drops out of scope, the memory is explicitly overwritten with zeroes using compiler-fence operations to prevent optimization dead-code stripping.
* Constant-time arithmetic is enforced across polynomial multiplications in ML-KEM and ML-DSA to prevent cache-timing side-channel attacks.

---

## 5. Crypto-Agility & Post-Quantum Transition

**Crypto-Agility** is the architectural property that allows a system to switch cryptographic algorithms, key lengths, and signature formats without requiring breaking code changes or database migrations.

QuantaCipher achieves crypto-agility through:
1. **Self-Describing Signature Envelopes:** Digital signatures carry an authenticated `alg` identifier (`ml-dsa-44`, `ml-dsa-65`, `falcon-512`). The verification runtime inspects the envelope and routes to the matching mathematical verifier automatically.
2. **Algorithm Negotiation:** The Gateway and SDK support dynamic negotiation between Level 3 (`ML-KEM-768`), Level 5 (`ML-KEM-1024`), and Hybrid X-Wing (`X25519 + ML-KEM-768`).
3. **Automated Discovery (CBOM):** QuantaCipher Insight generates CycloneDX 1.6 Cryptographic Bills of Materials to continuously inventory where legacy RSA or ECC keys remain across your codebase.
