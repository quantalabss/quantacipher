# Security & Trust Model

## What this SDK is

`quantacipher-sdk` is an open-source JavaScript/TypeScript SDK that wraps the
QuantaCipher WASM engine. It handles keypair generation, encryption, decryption,
and gateway transport. All cryptographic operations run locally in the browser or
Node.js process — no plaintext or private key material ever leaves your device.

---

## Trust boundary

QuantaCipher is a **split-trust architecture**:

| Layer | Status | What you can verify |
|---|---|---|
| This SDK (`quantacipher-sdk`) | Open source | Full source on npm / GitHub |
| WASM engine (`quantacipher-wasm`) | Open source | Full source on npm; artifact attested (see below) |
| Core engine + gateway | Proprietary, patent-pending | Interface (key sizes, algorithm labels, SLSA attestation) |

The core cryptographic engine and gateway service are proprietary and
patent-pending. This is intentional and consistent with the product's commercial
licensing model. The trust model for the closed layer is:

> You verify the **interface**, not the implementation source.
> The WASM binary is the interface — and it is independently verifiable.

---

## Verifying the WASM artifact (build provenance)

Every release of `quantacipher-wasm` is built in GitHub Actions and signed with a
[SLSA Level 2 provenance attestation](https://slsa.dev) via
[Sigstore](https://sigstore.dev). The attestation is stored on the public
[Rekor](https://rekor.sigstore.dev) transparency log, regardless of whether the
source repository is public.

**To verify any downloaded WASM binary:**

```bash
# Install GitHub CLI if you haven't already
# https://cli.github.com

gh attestation verify \
  node_modules/quantacipher-wasm/quantacipher_wasm_bg.wasm \
  --repo quantalabss/quantacipher
```

A successful verification confirms:
- The binary was built by the official GitHub Actions workflow
- It was not modified after build
- The build timestamp and workflow run are recorded on a public, append-only log

---

## Algorithm

The SDK uses:

- **KEM:** ML-KEM-1024 (FIPS 203) — NIST-standardized post-quantum key encapsulation
- **Symmetric cipher:** AES-256-GCM with a fresh 96-bit random nonce per operation
- **KDF:** HKDF-SHA-256 to derive the AES key from the KEM shared secret
- **RNG:** OS entropy (`OsRng`) in native; `WebCrypto.getRandomValues` in WASM

Key sizes you can independently verify:

| Value | Expected size |
|---|---|
| Public key (base64-decoded) | **1568 bytes** |
| Secret key (base64-decoded) | **3168 bytes** |
| KEM ciphertext (base64-decoded) | **1568 bytes** |

These sizes uniquely identify ML-KEM-1024 (FIPS 203) and are distinct from
the pre-standard Kyber-768 or Kyber-1024 sizes.

---

## Reporting vulnerabilities

Please report security issues privately to **security@quantalabs.in** rather than
opening a public issue. We aim to acknowledge reports within 48 hours and provide
a fix timeline within 7 days for confirmed vulnerabilities.

Do not include exploit code in initial reports.
