# Python SDK

The QuantaCipher Python SDK provides native Rust bindings to execute NIST-standardized Kyber-1024 cryptography at blazing speeds in your Python environments.

## Installation

Install the SDK via pip:

```bash
pip install quantacipher
```

## Verification

You can import the module and verify the native bindings are working correctly by fetching the version.

```python
import quantacipher

print("Version:", quantacipher.get_version())
```

## Key Generation

Generate a post-quantum keypair. This operation runs locally in Rust.

```python
keys = quantacipher.generate_keypair()

print("PublicKey:", keys["publicKey"])
print("PrivateKey:", keys["privateKey"])
```

## Encrypting Data

Secure your plaintext payloads by encrypting them with the generated public key.

```python
message = "Zero Trust Enterprise Data"
ciphertext = quantacipher.secure_encrypt(message, keys["publicKey"])

print("Ciphertext:", ciphertext)
```

## Decrypting Data

Decrypt the sealed payload using your private key.

```python
plaintext = quantacipher.secure_decrypt(ciphertext, keys["privateKey"])

print("Decrypted:", plaintext)
```
