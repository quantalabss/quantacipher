# JavaScript / TypeScript API Reference

This document provides complete reference specifications for all classes, methods, interfaces, and data types exported by `@quantalabss/quantacipher-sdk`.

---

## 1. Class: `QuantaCipher`

The primary client class for post-quantum encryption, key encapsulation, and Gateway receipt management.

### Constructor

```typescript
new QuantaCipher(config: QuantaCipherConfig)
```

#### `QuantaCipherConfig` Interface

| Field | Type | Required | Description |
|---|---|---|---|
| `apiKey` | `string` | Yes | Your QuantaCipher API Key (`qz_live_...` or `qz_test_...`). |
| `gatewayUrl` | `string` | No | Custom Gateway endpoint. Defaults to `https://api.quantacipher.com/v1/ingest`. |

---

### Methods

#### `generateKeypair(): Keypair`
Generates a new ML-KEM-1024 (NIST FIPS 203) keypair in volatile memory.

* **Returns:** `Keypair`
  * `publicKey` (`string`): Base64-encoded public key (1,568 bytes raw).
  * `privateKey` (`string`): Base64-encoded private key (3,168 bytes raw).
  * `algorithm` (`string`): `"ML-KEM-1024"`.
  * `version` (`string`): `"1.0"`.

---

#### `encryptVault(plaintext: string): string`
Executes Vault Mode encryption. Generates an ephemeral keypair, encrypts the plaintext using AES-256-GCM, and immediately zeroizes the private key.

* **Parameters:**
  * `plaintext` (`string`): The UTF-8 string to permanently seal.
* **Returns:** `string` — Ciphertext formatted as `QZ_VAULT_V1:<kem_ct>:<nonce>:<aes_ct>`.

---

#### `encryptSecure(plaintext: string, publicKeyB64: string): string`
Executes Secure Mode encryption for a designated recipient.

* **Parameters:**
  * `plaintext` (`string`): The UTF-8 string to encrypt.
  * `publicKeyB64` (`string`): The recipient's base64-encoded ML-KEM-1024 public key.
* **Returns:** `string` — Ciphertext formatted as `QZ_SECURE_V1:<kem_ct>:<nonce>:<aes_ct>`.

---

#### `decryptSecure(ciphertext: string, privateKeyB64: string): string`
Decrypts a Secure Mode ciphertext locally using the matching private key.

* **Parameters:**
  * `ciphertext` (`string`): The `QZ_SECURE_...` envelope string.
  * `privateKeyB64` (`string`): The recipient's base64-encoded private key.
* **Returns:** `string` — The original plaintext UTF-8 string.
* **Throws:** `Error` if private key does not match or if ciphertext has been tampered with.

---

#### `vaultData(plaintext: string, metadata?: Record<string, any>): Promise<Receipt>`
Convenience wrapper that runs `encryptVault(plaintext)` and immediately posts the ciphertext to the Gateway to receive a Sigstore Rekor receipt.

* **Parameters:**
  * `plaintext` (`string`): Data to seal.
  * `metadata` (`object`, optional): Contextual metadata tags for your audit dashboard.
* **Returns:** `Promise<Receipt>`

---

#### `secureData(plaintext: string, publicKeyB64: string, metadata?: Record<string, any>): Promise<Receipt>`
Convenience wrapper that runs `encryptSecure(plaintext, publicKeyB64)` and posts the ciphertext to the Gateway.

* **Parameters:**
  * `plaintext` (`string`): Data to encrypt.
  * `publicKeyB64` (`string`): Recipient public key.
  * `metadata` (`object`, optional): Contextual metadata tags.
* **Returns:** `Promise<Receipt>`

---

#### `getVersion(): string`
Returns the version of the underlying Rust/WASM cryptographic core.

---

#### `isDualModeAvailable(): boolean`
Returns `true` if the WebAssembly module has loaded both KEM and DSA signing engines successfully.

---

## 2. Class: `QuantaCipherSign`

Provides post-quantum digital signature generation and verification.

### Methods

#### `generateSigningKeyPair(algorithm?: AlgorithmId): SigningKeypair`
Generates a post-quantum digital signature keypair.

* **Parameters:**
  * `algorithm` (`AlgorithmId`, optional): Desired signature algorithm. Defaults to `AlgorithmId.FALCON_512`.
* **Returns:** `SigningKeypair`
  * `public_key` (`string`): Base64-encoded public verification key.
  * `private_key` (`string`): Base64-encoded private signing key.
  * `algorithm` (`string`): Standardized algorithm identifier.

---

#### `signPayload(payload: string | Uint8Array, privateKeyB64: string, options?: object): SignatureEnvelope`
Generates a digital signature over an arbitrary-length payload.

* **Parameters:**
  * `payload` (`string | Uint8Array`): Data to sign.
  * `privateKeyB64` (`string`): Signer's private key.
* **Returns:** `SignatureEnvelope`
  * `alg` (`string`): Algorithm name (e.g. `"ml-dsa-44"`).
  * `sig` (`string`): Base64 signature bytes.
  * `ver` (`number`): Envelope format version (`1`).

---

#### `verifySignature(payload: string | Uint8Array, signature: SignatureEnvelope, publicKeyB64: string): boolean`
Verifies a post-quantum signature envelope against the original payload and signer's public key.

* **Parameters:**
  * `payload` (`string | Uint8Array`): Original payload.
  * `signature` (`SignatureEnvelope`): Signature envelope object.
  * `publicKeyB64` (`string`): Signer's public key.
* **Returns:** `boolean` — `true` if signature is valid; `false` otherwise.

---

#### `envelopeToJson(envelope: SignatureEnvelope): string`
Serializes a signature envelope to a canonical JSON string.

---

#### `envelopeFromJson(jsonString: string): SignatureEnvelope`
Deserializes and validates a signature envelope from a JSON string.
