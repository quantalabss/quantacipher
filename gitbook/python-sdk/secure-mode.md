# Python: Secure Mode (End-to-End Encryption)

**Secure Mode** enables Python backends and microservices to implement true end-to-end post-quantum encryption where private keys are retained locally for on-demand decryption.

---

## 1. Key Generation: `generate_keypair()`

Generate a new ML-KEM-1024 keypair:

```python
import quantacipher

keys = quantacipher.generate_keypair()

public_key = keys["publicKey"]   # Base64 string
private_key = keys["privateKey"] # Base64 string (SECRET)

print(f"Generated Public Key: {public_key[:40]}...")
```

---

## 2. Encryption: `secure_encrypt()`

Encrypt any UTF-8 string with the recipient's public key:

```python
import json
import quantacipher

classified_payload = json.dumps({
    "telecom_node": "5G_UPF_EDGE_01",
    "tunnel_endpoint_id": "0x44F9A",
    "subscriber_auth_vector": "e8a9...b4c2"
})

ciphertext = quantacipher.secure_encrypt(classified_payload, public_key)
print("Encrypted Ciphertext:")
print(ciphertext[:90] + "...")
```

---

## 3. Decryption: `secure_decrypt()`

Decrypt using the corresponding private key:

```python
try:
    recovered_plaintext = quantacipher.secure_decrypt(ciphertext, private_key)
    data = json.loads(recovered_plaintext)
    print("Decrypted Telecom Node:", data["telecom_node"])
except ValueError as e:
    print(f"Decryption failed: {e}")
```

---

## 4. FastAPI Integration Example

Below is a complete FastAPI microservice demonstrating incoming post-quantum encrypted payloads and local decryption:

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import quantacipher
import os

app = FastAPI(title="PQC Telecom Ingestion Service")

# Load persistent ML-KEM-1024 private key from environment or secrets manager
SERVER_PRIVATE_KEY = os.environ.get("SERVER_MLKEM_PRIVATE_KEY")

class EncryptedRequest(BaseModel):
    ciphertext: str

@app.post("/api/v1/telecom-signaling")
async def ingest_signaling_packet(body: EncryptedRequest):
    if not body.ciphertext.startswith(("QZ_SECURE_V1:", "QZ_SECURE_V2:")):
        raise HTTPException(status_code=400, detail="Invalid post-quantum ciphertext envelope")
    
    try:
        # Decrypt locally inside Rust runtime
        plaintext = quantacipher.secure_decrypt(body.ciphertext, SERVER_PRIVATE_KEY)
        return {"status": "SUCCESS", "bytes_processed": len(plaintext)}
    except Exception as e:
        raise HTTPException(status_code=403, detail="Decryption failed: Unauthorized key or corrupt ciphertext")
```
