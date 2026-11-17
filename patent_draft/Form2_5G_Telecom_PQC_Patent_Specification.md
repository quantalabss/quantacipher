# FORM 2
THE PATENTS ACT, 1970 (39 of 1970)
&
THE PATENTS RULES, 2003

**PROVISIONAL SPECIFICATION**
[See section 10 and rule 13]

---

> **PORTAL FILING GUIDE — Values to enter on Form 1 (IPO e-filing portal)**
>
> | Field | Value |
> |---|---|
> | Jurisdiction | Chennai Patent Office |
> | Type of Application | Ordinary Application |
> | **Type of Specification** | **Provisional** |
> | Title of the Invention | **METHOD AND SYSTEM FOR 5G SUBSCRIBER IDENTITY CONCEALMENT (PQ-IES), QUANTUM-RESILIENT SERVICE-BASED ARCHITECTURE (SBA) TOKEN AUTHENTICATION, AND QUANTUM-SAFE ROAMING INTERCONNECT (SEPP PRINS) IN TELECOMMUNICATION NETWORKS** |
> | Applicant Name | **QUANTALABS PRIVATE LIMITED** |
> | Category of Applicant | Startup (DPIIT Certificate No. **DIPP273930**) |
> | Bundled Forms | Form 28 (Startup Concession), Form 1, Form 2 |
> | Official Email for Correspondence | **`contact@quantalabs.cc`** |
> | Description — No. of pages | **14** |
> | Claims — No. of pages | **5** |
> | Claims — No. of Claims | **16** |
> | Abstract — No. of pages | **1** |
> | Drawings — No. of pages | **4** |

---

### 1. TITLE OF THE INVENTION
**METHOD AND SYSTEM FOR 5G SUBSCRIBER IDENTITY CONCEALMENT (PQ-IES), QUANTUM-RESILIENT SERVICE-BASED ARCHITECTURE (SBA) TOKEN AUTHENTICATION, AND QUANTUM-SAFE ROAMING INTERCONNECT (SEPP PRINS) IN TELECOMMUNICATION NETWORKS**

---

### 2. APPLICANT(S)
- **Name:** QUANTALABS PRIVATE LIMITED
- **Nationality:** Indian Company incorporated under the Companies Act, 2013
- **Address:** 1st Floor, Smartspaces, 57-A, KS Ramasamy St, Kuppakonanpudur, Coimbatore North, Coimbatore – 641038, Tamil Nadu, India
- **Startup Recognition:** DPIIT Recognized Startup (DIPP273930)

---

### 3. PREAMBLE TO THE DESCRIPTION
"The following specification describes the invention."

---

### 4. DESCRIPTION

#### 4.1 Field of the Invention
The present invention relates generally to mobile telecommunications security, cryptographic key encapsulation mechanisms, and access control architectures. More specifically, the present invention relates to a computer-implemented method, telecommunications apparatus, and zero-trust cryptographic engine for:
1. Protecting mobile subscriber privacy over radio access interfaces through quantum-safe Post-Quantum Integrated Encryption Schemes (PQ-IES Profiles C and D) conforming to 3GPP TS 33.501, 3GPP TS 23.003, and Telecommunication Engineering Centre (TEC) Standard 910028:2025; and
2. Enforcing quantum-resilient access control and mutual service authorization across 5G Core Service-Based Architecture (SBA) microservices via post-quantum and non-separable hybrid JSON Web Tokens (PQ-JWT) issued by a Network Repository Function (NRF).

---

#### 4.2 Background of the Invention and Prior Art Deficiencies
In fifth-generation (5G) and emerging sixth-generation (6G) cellular networks, subscriber privacy and core network integrity are critical pillars of national communications infrastructure. Two major vulnerability vectors threaten contemporary 5G networks in the impending quantum era:

##### Vector 1: Vulnerability of Over-The-Air Subscriber Identity Concealment
In legacy 2G/3G/4G systems, mobile devices transmitted their permanent International Mobile Subscriber Identity (IMSI) in cleartext over the radio air interface during initial network attachment, allowing adversaries deploying "IMSI Catchers" (Stingrays) to track citizen movements, intercept calls, and surveil high-profile defense personnel.

To mitigate IMSI catching, the 3rd Generation Partnership Project (3GPP) introduced the Subscription Concealed Identifier (SUCI) in 3GPP TS 33.501 Annex C. The User Equipment (UE) or Universal Subscriber Identity Module (USIM) conceals the Subscription Permanent Identifier (SUPI) using the Elliptic Curve Integrated Encryption Scheme (ECIES). Standard 3GPP specifications define two cryptographic profiles:
- **Profile A:** Employs Curve25519 (X25519 key agreement) alongside AES-128-CTR and HMAC-SHA256.
- **Profile B:** Employs NIST P-256 (secp256r1 key agreement) alongside AES-128-CTR and HMAC-SHA256.

**Deficiency of the Prior Art:**
Both Profile A and Profile B rely entirely on classical elliptic-curve discrete logarithm mathematics. State-sponsored foreign adversaries are actively executing **"Harvest Now, Decrypt Later" (HNDL)** interception, capturing encrypted 5G over-the-air radio signaling transmissions. When a cryptanalytically relevant quantum computer (CRQC) running Shor's algorithm emerges, the discrete logarithms of Curve25519 and P-256 will be resolved in polynomial time ($O(n^3)$). Consequently, all historical SUCI captures can be retroactively decrypted, permanently exposing the identities, geographic movements, and association graphs of government officials, diplomats, and defense personnel.

##### Vector 2: Vulnerability of 5G Service-Based Architecture (SBA) Inter-NF Authorization
In the 5G Core network, physical point-to-point interfaces have been replaced by a Service-Based Architecture (SBA) wherein cloud-native Network Functions (NFs)—such as the Access and Mobility Management Function (AMF), Session Management Function (SMF), Unified Data Management (UDM), and Authentication Server Function (AUSF)—communicate via RESTful HTTP/2 APIs.

Per 3GPP TS 33.501 Section 6.3.1, inter-NF service requests are authorized using OAuth 2.0 Access Tokens formatted as JSON Web Tokens (JWT). The Network Repository Function (NRF) issues these tokens, signing them with classical digital signature algorithms, typically ECDSA P-256 (`ES256`) or RSA-2048 (`RS256`).

**Deficiency of the Prior Art:**
Because classical digital signatures are solvable via Shor's algorithm, a quantum-equipped adversary can synthesize valid NRF signature keys, forge arbitrary OAuth 2.0 access tokens, and masquerade as any legitimate Core Network Function. Such an adversary can:
1. Intercept subscriber session keys from the AUSF;
2. Manipulate subscriber subscription profiles and lawful interception flags in the UDM;
3. Spin up unauthorized rogue network slices in the SMF, compromising entire telecommunication backbones.

##### Technical Challenges Unsolved by General-Purpose Cryptography
While standard bodies such as NIST have finalized post-quantum primitives (e.g., FIPS 203 ML-KEM and FIPS 204 ML-DSA), naively transplanting these primitives into 5G telecom architectures fails due to strict telecommunication domain constraints:
1. **Payload and Signaling Budget Constraints:** Classical ECDH public keys take 32 bytes; lattice-based ML-KEM-768 ciphertexts require 1,088 bytes. Without optimized encapsulation and framing, standard 5G Non-Access Stratum (NAS) signaling packets exceed Maximum Transmission Unit (MTU) thresholds and trigger radio interface fragmentation.
2. **Strict Baseband Latency Deadlines:** Registration timers in 5G basebands require SUCI calculation within tight milliseconds. Inefficient software implementations cause call attachment timeouts and signaling congestion.
3. **Brownfield Migration and Dual-Defense Requirements:** Telecom carriers cannot instantaneously deprecate classical hardware. Carriers mandate non-separable hybrid schemes that preserve classical FIPS compliance while introducing post-quantum resilience, as outlined in TEC Standard 910018:2025.

Therefore, an urgent and unfulfilled need exists in telecommunications engineering for an optimized, standardized, and quantum-safe 5G identity concealment engine and service-based architecture token gateway that operates within strict telecommunications signaling budgets without requiring architectural modifications to existing radio access network (gNodeB) infrastructure.

---

#### 4.3 Objects of the Invention
1. It is a primary object of the present invention to provide a quantum-resilient 5G Subscriber Identity Concealment system (PQ-IES) that protects subscriber privacy against Harvest-Now-Decrypt-Later quantum eavesdropping.
2. It is another object of the present invention to implement **Profile C** (Homogeneous Lattice-Based ML-KEM-768) and **Profile D** (Hybrid ML-KEM-768 + X25519) within standard 3GPP TS 23.003 Network Access Identifier (NAI) wire representations.
3. It is another object of the present invention to eliminate gNodeB radio equipment modifications by encapsulating post-quantum SUCI payloads within opaque standard NAS signaling containers.
4. It is another object of the present invention to provide a 5G SBA Post-Quantum Token Gateway wherein the NRF issues OAuth 2.0 PQ-JWT tokens signed with FIPS 204 ML-DSA-65 or non-separable Hybrid ML-DSA-65 + ECDSA P-256 per TEC 910018:2025 Figure 3.
5. It is yet another object of the present invention to execute client-side SUCI identity concealment within sub-3 millisecond processing windows on resource-constrained mobile basebands and USIM applets, with automatic volatile memory zeroization upon execution.

---

#### 4.4 Summary of the Invention
The present invention provides a comprehensive method, telecommunications system, and software engine for securing 5G and next-generation mobile networks against quantum computational attacks.

According to a first aspect of the present invention, a computer-implemented method for 5G Subscriber Identity Concealment (PQ-IES) comprises:
1. Parsing a 15-digit Subscription Permanent Identifier (SUPI) into Mobile Country Code (MCC), Mobile Network Code (MNC), and Mobile Subscription Identification Number (MSIN);
2. Retrieving a Home Network Public Key Identifier (`hn_public_key_id`) and corresponding Home Network public key material provisioned in a secure storage module of a User Equipment (UE) or USIM;
3. Selecting a Protection Scheme between:
   - **Profile C (Homogeneous Post-Quantum):** Generating an ephemeral key encapsulation using Module-Lattice Key Encapsulation Mechanism (ML-KEM-768, FIPS 203) against the Home Network ML-KEM public key, yielding a 1,088-byte ciphertext (`ct1`) and a 32-byte shared secret (`ss`);
   - **Profile D (Hybrid Post-Quantum):** Generating a classical ephemeral X25519 keypair and an ephemeral ML-KEM-768 encapsulation, deriving a concatenated dual shared secret ($ss = ss_{\text{classical}} \parallel ss_{\text{pq}}$) bound to the ephemeral public keys;
4. Executing an ANSI X9.63 Key Derivation Function (KDF) with SHA-256 over the shared secret to derive an 80-byte key sequence, partitioned into a 32-byte AES-256 encryption key ($K_{\text{enc}}$), a 16-byte initial counter ($IV$), and a 32-byte MAC integrity key ($K_{\text{mac}}$);
5. Encrypting the subscriber MSIN using AES-256-CTR with big-endian 128-bit counter increments to generate a ciphertext payload (`ct2`);
6. Computing an 8-octet (64-bit) truncated HMAC-SHA256 authentication tag over `ct2`;
7. Concatenating the ephemeral key material, `ct2`, and the truncated MAC tag into an opaque scheme output, formatted into a 3GPP TS 23.003 standard SUCI string:
   $$\text{suci-0-}\langle\text{MCC}\rangle\text{-}\langle\text{MNC}\rangle\text{-}\langle\text{RoutingIndicator}\rangle\text{-}\langle\text{SchemeID}\rangle\text{-}\langle\text{KeyID}\rangle\text{-}\langle\text{HexSchemeOutput}\rangle$$
8. Transmitting the SUCI across the 5G air interface to an Access and Mobility Management Function (AMF), which routes the SUCI without radio-access modifications to a Subscription Identifier De-concealing Function (SIDF) within a Unified Data Management (UDM) network function for quantum-safe de-concealment.

According to a second aspect of the present invention, a quantum-resilient Service-Based Architecture (SBA) token gateway comprises:
1. Receiving an OAuth 2.0 access token request at a Network Repository Function (NRF) from a Consumer Network Function (e.g., AMF) specifying an authorized 3GPP service scope and target Producer Network Function (e.g., UDM);
2. Synthesizing a structured token payload comprising standard 3GPP claims (`iss`, `sub`, `aud`, `scope`, `iat`, `exp`, `plmn_id`);
3. Constructing an RFC 7515 JOSE header declaring algorithm identifier `ml-dsa-65` or `hybrid-mldsa65-p256`;
4. Computing a post-quantum digital signature over the base64url-encoded header and claims using the private key of the NRF;
5. Delivering a compact 3-segment PQ-JWT token to the Consumer NF for inclusion in the `Authorization: Bearer` header of inter-NF HTTP/2 service invocations;
6. Validating the PQ-JWT at the Producer NF in constant time, rejecting tokens bearing expired timestamps, audience mismatches, or invalid cryptographic signatures.

---

#### 4.5 Brief Description of the Accompanying Drawings
- **Figure 1:** Illustrates the end-to-end network architecture of the 5G quantum-safe telecommunication system, showing the User Equipment (UE), gNodeB, AMF, UDM (SIDF), and NRF.
- **Figure 2:** Illustrates the cryptographic key encapsulation and encryption workflow for PQ-IES Profile C (Homogeneous ML-KEM-768) and Profile D (Hybrid ML-KEM-768 + X25519).
- **Figure 3:** Illustrates the 3GPP TS 23.003 SUCI wire framing format and byte allocation across ephemeral ciphertext, encrypted MSIN, and truncated MAC tag.
- **Figure 4:** Illustrates the 5G SBA OAuth 2.0 PQ-JWT token issuance and verification sequence flow between AMF, NRF, and UDM.

---

#### 4.6 Detailed Description of the Preferred Embodiments
The present invention will now be described with reference to the accompanying drawings and mathematical formulations.

##### 1. Subscriber Identity Concealment Architecture (PQ-IES)
Referring to **Figure 1**, a mobile subscriber terminal (UE 100) incorporates a secure element (USIM 102) holding the permanent subscriber credential $\text{SUPI} = \text{MCC} \parallel \text{MNC} \parallel \text{MSIN}$. The USIM 102 is pre-provisioned with the Home Network Public Key Identifier ($\text{HN\_KEY\_ID} = 1$) and the Home Network's public keys:
- $PK_{\text{HN, ML-KEM}}$ (1,184 octets, FIPS 203 ML-KEM-768);
- $PK_{\text{HN, X25519}}$ (32 octets, Curve25519).

##### 2. Profile C: Homogeneous Lattice-Based Concealment
In Profile C ($\text{SchemeID} = 3$), the UE executes pure post-quantum identity concealment:
1. The UE encapsulates an ephemeral secret against $PK_{\text{HN, ML-KEM}}$:
   $$(ct_1, ss) \leftarrow \text{ML-KEM-768.Encaps}(PK_{\text{HN, ML-KEM}})$$
   where $ct_1$ is precisely 1,088 octets and $ss$ is 32 octets.
2. The UE derives an 80-octet keystream using ANSI X9.63 KDF with SHA-256:
   $$K_{\text{derived}} = \text{KDF}(ss, \text{SharedInfo} = \epsilon, 80)$$
3. The keystream is partitioned into:
   $$K_{\text{enc}} = K_{\text{derived}}[0..32], \quad IV = K_{\text{derived}}[32..48], \quad K_{\text{mac}} = K_{\text{derived}}[48..80]$$
4. The subscriber's MSIN digits are encrypted via AES-256-CTR:
   $$ct_2 = \text{AES-256-CTR}(K_{\text{enc}}, IV, \text{MSIN})$$
5. A 64-bit truncated MAC tag is computed:
   $$\text{MAC} = \text{HMAC-SHA256}(K_{\text{mac}}, ct_2)[0..8]$$
6. The resulting scheme output is:
   $$\text{SchemeOutput} = ct_1 (1,088\text{B}) \parallel ct_2 (L\text{B}) \parallel \text{MAC} (8\text{B})$$

##### 3. Profile D: Hybrid Post-Quantum Concealment
In Profile D ($\text{SchemeID} = 4$), the UE enforces dual-defense hybrid key agreement:
1. The UE generates an ephemeral classical X25519 keypair: $(sk_{\text{eph}}, pk_{\text{eph}})$.
2. Classical Diffie-Hellman yields:
   $$ss_1 = \text{X25519}(sk_{\text{eph}}, PK_{\text{HN, X25519}})$$
3. Ephemeral ML-KEM encapsulation yields:
   $$(ct_1, ss_2) \leftarrow \text{ML-KEM-768.Encaps}(PK_{\text{HN, ML-KEM}})$$
4. The shared secrets are concatenated: $ss = ss_1 \parallel ss_2$ (64 octets).
5. The ANSI X9.63 KDF processes $ss$ with cryptographic domain separation:
   $$\text{SharedInfo} = pk_{\text{eph}} (32\text{B}) \parallel PK_{\text{HN, ML-KEM}} (1,184\text{B})$$
6. Key derivation, AES-256-CTR encryption of MSIN, and HMAC computation proceed identically to Profile C.
7. The scheme output incorporates the ephemeral classical public key:
   $$\text{SchemeOutput} = pk_{\text{eph}} (32\text{B}) \parallel ct_1 (1,088\text{B}) \parallel ct_2 (L\text{B}) \parallel \text{MAC} (8\text{B})$$

##### 4. De-concealment at 5G Core UDM / SIDF
Upon receiving the SUCI from the serving AMF, the UDM's Subscription Identifier De-concealing Function (SIDF):
1. Extracts `hn_public_key_id` to index its private key vault;
2. Decapsulates $ct_1$ using the private key $SK_{\text{HN, ML-KEM}}$ (and computes classical ECDH in Profile D);
3. Derives $(K_{\text{enc}}, IV, K_{\text{mac}})$ via ANSI X9.63 KDF;
4. Re-computes the 8-octet HMAC over $ct_2$. If the MAC fails to match the received tag in constant time, the UDM **fails closed** and terminates registration;
5. Decrypts $ct_2$ via AES-256-CTR, recovering the plaintext MSIN and reconstructing the permanent SUPI.

##### 5. 5G SBA Quantum-Safe OAuth 2.0 Token Gateway
Referring to **Figure 4**, inter-NF microservice calls are protected against quantum forgery:
1. **Token Request:** The AMF transmits an OAuth 2.0 Token Request to the NRF containing `grant_type=client_credentials`, `nfInstanceId=AMF_UUID`, `targetNfType=UDM`, and `scope=nudm-sdm`.
2. **PQ-JWT Generation:** The NRF constructs claims:
   ```json
   {
     "iss": "nrf-01.5gc.mnc045.mcc404.3gppnetwork.org",
     "sub": "amf-01.5gc.mnc045.mcc404.3gppnetwork.org",
     "aud": "udm",
     "scope": "nudm-sdm",
     "iat": 1794913200,
     "exp": 1794916800
   }
   ```
3. **Digital Signature:** The NRF signs the base64url-encoded header and claims using:
   - **Homogeneous:** NIST FIPS 204 ML-DSA-65 (`alg=ml-dsa-65`);
   - **Hybrid:** Non-separable dual signature combining ECDSA P-256 and ML-DSA-65 (`alg=hybrid-mldsa65-p256`) per TEC 910018:2025 Figure 3:
     $$\sigma = \sigma_{\text{ECDSA}}(M) \parallel \sigma_{\text{ML-DSA-65}}(M \parallel \sigma_{\text{ECDSA}})$$
4. **Producer NF Verification:** The UDM intercepts the HTTP/2 request header `Authorization: Bearer <PQ-JWT>`, verifies the signature in under 4 milliseconds via WebAssembly/native execution, validates that `current_time < exp`, and confirms that `aud == "udm"`.

---

### 5. CLAIMS

**WE CLAIM:**

1. A computer-implemented method for quantum-safe subscriber identity concealment (PQ-IES) in a mobile telecommunication network, the method comprising:
   - parsing, by a User Equipment (UE), a Subscription Permanent Identifier (SUPI) into Mobile Country Code (MCC), Mobile Network Code (MNC), and Mobile Subscription Identification Number (MSIN);
   - retrieving a Home Network Public Key Identifier and a post-quantum public key ($PK_{\text{HN, ML-KEM}}$) provisioned in a secure memory element;
   - encapsulating an ephemeral secret against said $PK_{\text{HN, ML-KEM}}$ using Module-Lattice Key Encapsulation Mechanism (ML-KEM-768) to produce a post-quantum ciphertext ($ct_1$) and a shared secret ($ss$);
   - deriving an encryption key ($K_{\text{enc}}$), an initialization counter ($IV$), and an integrity key ($K_{\text{mac}}$) from said shared secret using an ANSI X9.63 Key Derivation Function (KDF) with SHA-256;
   - encrypting said MSIN using AES-256 in counter (CTR) mode with big-endian 128-bit counter increments to generate an encrypted payload ($ct_2$);
   - computing an 8-octet truncated HMAC-SHA256 integrity tag over said encrypted payload ($ct_2$) using said integrity key ($K_{\text{mac}}$);
   - assembling said $ct_1$, $ct_2$, and said truncated integrity tag into an opaque scheme output; and
   - transmitting a 3GPP-formatted Subscription Concealed Identifier (SUCI) string across a radio access interface to a serving core network without modifying radio base station (gNodeB) equipment.

2. The method as claimed in claim 1, wherein said SUCI string is formatted according to 3GPP TS 23.003 Section 2.2B as:
   $$\text{suci-0-}\langle\text{MCC}\rangle\text{-}\langle\text{MNC}\rangle\text{-}\langle\text{RoutingIndicator}\rangle\text{-}\langle\text{ProtectionScheme}\rangle\text{-}\langle\text{KeyID}\rangle\text{-}\langle\text{HexSchemeOutput}\rangle$$
   wherein Protection Scheme identifier `3` designates Homogeneous ML-KEM-768 Profile C.

3. The method as claimed in claim 1, further comprising a Hybrid Protection Scheme (Profile D), wherein:
   - an ephemeral classical elliptic-curve keypair is generated on Curve25519 ($sk_{\text{eph}}, pk_{\text{eph}}$);
   - a classical shared secret ($ss_1$) is computed via Diffie-Hellman agreement against a Home Network classical public key ($PK_{\text{HN, X25519}}$);
   - a post-quantum shared secret ($ss_2$) is encapsulated against said $PK_{\text{HN, ML-KEM}}$;
   - a combined shared secret $ss = ss_1 \parallel ss_2$ is derived through said ANSI X9.63 KDF bound to cryptographic context information comprising $pk_{\text{eph}} \parallel PK_{\text{HN, ML-KEM}}$; and
   - said scheme output incorporates said classical ephemeral public key ($pk_{\text{eph}}$) alongside $ct_1$, $ct_2$, and said integrity tag under Protection Scheme identifier `4`.

4. The method as claimed in claim 1, wherein said ANSI X9.63 KDF generates exactly 80 octets of key material, wherein octets 0 to 31 constitute $K_{\text{enc}}$, octets 32 to 47 constitute $IV$, and octets 48 to 79 constitute $K_{\text{mac}}$.

5. The method as claimed in claim 1, wherein volatile memory holding said shared secret ($ss$), $K_{\text{enc}}$, and $K_{\text{mac}}$ is automatically zeroized upon completion of encryption.

6. The method as claimed in claim 1, wherein de-concealment at a 5G Core Unified Data Management (UDM) Subscription Identifier De-concealing Function (SIDF) comprises:
   - extracting said post-quantum ciphertext ($ct_1$) from said SUCI;
   - decapsulating $ct_1$ using a Home Network ML-KEM-768 private key to recover said shared secret;
   - deriving $K_{\text{enc}}$, $IV$, and $K_{\text{mac}}$ via ANSI X9.63 KDF;
   - verifying said truncated 8-octet HMAC tag over $ct_2$ in constant time, failing closed if verification fails; and
   - decrypting $ct_2$ via AES-256-CTR to reconstruct the permanent subscriber SUPI.

7. A method for quantum-resilient authorization in a 5G Core Service-Based Architecture (SBA), comprising:
   - receiving, at a Network Repository Function (NRF), an access token request from a Consumer Network Function;
   - generating an OAuth 2.0 access token payload comprising standard 3GPP claims including issuer (`iss`), subject (`sub`), audience (`aud`), service scope (`scope`), and expiration (`exp`);
   - constructing a JOSE header specifying a post-quantum signature algorithm;
   - signing a base64url encoding of said header and payload using an NRF post-quantum private key to produce a 3-segment Post-Quantum JSON Web Token (PQ-JWT);
   - transmitting said PQ-JWT to said Consumer Network Function for inclusion in an HTTP/2 authorization header; and
   - verifying said PQ-JWT at a Producer Network Function by checking digital signature validity, audience matching, and token expiration.

8. The method as claimed in claim 7, wherein said post-quantum signature algorithm is NIST FIPS 204 ML-DSA-65.

9. The method as claimed in claim 7, wherein said post-quantum signature algorithm is a non-separable hybrid signature combining classical ECDSA P-256 and post-quantum ML-DSA-65 conforming to TEC Standard 910018:2025 Figure 3, wherein the ML-DSA signature binds the message concatenated with the classical ECDSA signature.

10. The method as claimed in claim 7, wherein said Producer Network Function rejects the token if the audience claim (`aud`) does not match the receiving network function's identifier.

11. A quantum-safe 5G telecommunications system comprising:
    - a User Equipment (UE) comprising a baseband processor configured to conceal a subscriber identity into a 3GPP SUCI using ML-KEM-768 (Profile C) or Hybrid ML-KEM-768 + X25519 (Profile D);
    - a gNodeB radio base station configured to forward said SUCI across an N2 interface without packet fragmentation;
    - an Access and Mobility Management Function (AMF) configured to route said SUCI to a home network;
    - a Unified Data Management (UDM) function comprising a Subscription Identifier De-concealing Function (SIDF) configured to de-conceal said SUCI into a permanent SUPI using an ML-KEM private key; and
    - a Network Repository Function (NRF) configured to issue post-quantum OAuth 2.0 tokens (PQ-JWT) authorizing inter-NF communication between said AMF and said UDM.

12. The system as claimed in claim 11, further comprising:
    - a Visiting Security Edge Protection Proxy (v-SEPP) and a Home Security Edge Protection Proxy (h-SEPP) communicating across an N32-f interface per 3GPP TS 33.501 Annex H, configured to protect cross-carrier roaming messages using post-quantum JSON Web Encryption (JWE); and
    - intermediate IP eXchange (IPX) transit proxies configured to inspect cleartext routing headers while sensitive subscriber authentication payloads remain cryptographically sealed within said JWE.

13. A computer-implemented method for quantum-safe roaming interconnect across an N32 interface in a 5G telecommunication network, comprising:
    - receiving an outbound cross-network roaming message at a Visiting Security Edge Protection Proxy (v-SEPP) destined for a Home Security Edge Protection Proxy (h-SEPP);
    - separating cleartext routing headers required for intermediate IP eXchange (IPX) transit from sensitive subscriber authentication payloads;
    - encapsulating a random Content Encryption Key (CEK) against an h-SEPP public key using a post-quantum Key Encapsulation Mechanism (KEM) selected from Hybrid X-Wing (X25519 + ML-KEM-768) and pure ML-KEM-768;
    - encrypting said sensitive subscriber payload using AES-256-GCM under said CEK using an RFC 7516 JWE protected header as Additional Authenticated Data (AAD);
    - serializing a 5-segment Compact JSON Web Encryption (JWE) token comprising base64url-encoded Header, Encrypted Key, IV, Ciphertext, and Authentication Tag; and
    - transmitting said protected N32-f message across intermediate IPX roaming proxies with cleartext routing headers and post-quantum sealed JWE payload.

14. The method as claimed in claim 13, wherein said h-SEPP decapsulates said CEK using an h-SEPP private key, decrypts said payload, verifies said AES-256-GCM authentication tag against said JWE protected header, and fails closed upon detecting bit tampering or tag alteration by an intermediary transit proxy.

15. An application-specific integrated circuit (ASIC), baseband chipset, or core telecommunication server programmed to perform the method of any of claims 1 to 14.

16. A non-transitory computer-readable storage medium storing instructions which, when executed by one or more processors, cause the one or more processors to perform the method of any one of claims 1 to 14.

---

### 6. ABSTRACT
A computer-implemented method, telecommunications system, and cryptographic engine are disclosed for quantum-resilient mobile subscriber privacy protection, core network access control, and roaming interconnect security. A User Equipment (UE) conceals a permanent 5G subscriber identifier (SUPI) into a Subscription Concealed Identifier (SUCI) using Post-Quantum Integrated Encryption Schemes (PQ-IES): Profile C (Homogeneous ML-KEM-768) or Profile D (Hybrid ML-KEM-768 + X25519). An ANSI X9.63 KDF derives an AES-256-CTR encryption key, a 16-byte initial counter, and an HMAC-SHA256 key to produce an encrypted MSIN and an 8-octet truncated MAC tag conforming to 3GPP TS 23.003 and TEC 910028:2025. In the 5G Core, a Network Repository Function (NRF) issues OAuth 2.0 Post-Quantum JSON Web Tokens (PQ-JWT) signed with FIPS 204 ML-DSA-65 or non-separable Hybrid ML-DSA-65 + ECDSA P-256 to authorize inter-NF service requests. Across the N32 roaming interface, Security Edge Protection Proxies (v-SEPP and h-SEPP) encapsulate Content Encryption Keys via Hybrid X-Wing (X25519 + ML-KEM-768) and seal cross-carrier subscriber credentials in RFC 7516 Post-Quantum JWE envelopes, preserving IPX transit routing transparency while completely neutralizing Harvest-Now-Decrypt-Later eavesdropping and quantum token forgery across 5G telecommunication networks.

*(Dated this 17th day of November, 2026)*  
**For QUANTALABS PRIVATE LIMITED**  
*(Applicant / Authorized Signatory)*
