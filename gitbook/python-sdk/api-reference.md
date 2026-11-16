# Python API Reference

Complete reference for all functions, arguments, and return types provided by the `quantacipher` Python module.

---

## Functions

### `quantacipher.get_version() -> str`
Returns the version string of the underlying Rust cryptographic core.

* **Returns:** `str` (e.g. `"2.0.6"`)

---

### `quantacipher.generate_keypair() -> dict[str, str]`
Generates a persistent NIST FIPS 203 (ML-KEM-1024) keypair.

* **Returns:** `dict` with keys:
  * `"publicKey"` (`str`): Base64-encoded ML-KEM-1024 public key (~2,092 base64 chars).
  * `"privateKey"` (`str`): Base64-encoded ML-KEM-1024 private key (~4,228 base64 chars).

---

### `quantacipher.vault_encrypt(plaintext: str) -> str`
Executes Vault Mode permanent sealing. Generates an ephemeral ML-KEM keypair in memory, encapsulates a shared secret, encrypts with AES-256-GCM, and immediately zeroizes the private key.

* **Parameters:**
  * `plaintext` (`str`): The UTF-8 string to permanently seal.
* **Returns:** `str` — Ciphertext envelope (`"QZ_VAULT_V1:..."`).
* **Raises:** `ValueError` if plaintext cannot be encoded.

---

### `quantacipher.secure_encrypt(plaintext: str, public_key_b64: str) -> str`
Encrypts data for a specific recipient using their base64-encoded ML-KEM-1024 public key.

* **Parameters:**
  * `plaintext` (`str`): The UTF-8 string to encrypt.
  * `public_key_b64` (`str`): Base64 string representing the recipient's public key.
* **Returns:** `str` — Ciphertext envelope (`"QZ_SECURE_V1:..."`).
* **Raises:** `ValueError` if public key length or format is invalid.

---

### `quantacipher.secure_decrypt(ciphertext: str, private_key_b64: str) -> str`
Decrypts a Secure Mode ciphertext locally using the matching base64 private key.

* **Parameters:**
  * `ciphertext` (`str`): The `QZ_SECURE_...` formatted ciphertext string.
  * `private_key_b64` (`str`): Base64 string representing the recipient's private key.
* **Returns:** `str` — The recovered plaintext string.
* **Raises:**
  * `ValueError` if the ciphertext prefix is invalid, if the base64 decoding fails, or if decapsulation fails (wrong private key).
  * `RuntimeError` if GCM authentication tag verification fails (tampered payload).
