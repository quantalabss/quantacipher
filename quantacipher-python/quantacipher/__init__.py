import time
import requests
import _quantacipher_core

def generate_keypair():
    """Generates a Kyber-1024 keypair (raw core function)"""
    return _quantacipher_core.generate_keypair()

def vault_encrypt(plaintext: str) -> str:
    """Encrypts in vault mode (raw core function)"""
    return _quantacipher_core.vault_encrypt(plaintext)

def secure_encrypt(plaintext: str, public_key_b64: str) -> str:
    """Encrypts in secure mode (raw core function)"""
    return _quantacipher_core.secure_encrypt(plaintext, public_key_b64)

def secure_decrypt(ciphertext_payload: str, private_key_b64: str) -> str:
    """Decrypts secure mode payload (raw core function)"""
    return _quantacipher_core.secure_decrypt(ciphertext_payload, private_key_b64)

def get_version() -> str:
    return _quantacipher_core.get_version()

class QuantaCipher:
    """
    QuantaCipher SDK Client
    Provides zero-trust encryption and automatic Gateway integration.
    """
    def __init__(self, api_key: str, gateway_url: str = 'http://localhost:4000/api/v1/ingest'):
        self.api_key = api_key
        self.gateway_url = gateway_url

    def generate_keypair(self) -> dict:
        """
        Generates a Kyber-1024 keypair locally.
        The private key NEVER leaves this call.
        """
        return _quantacipher_core.generate_keypair()

    def encrypt_vault(self, plaintext: str) -> str:
        """
        VAULT MODE: Encrypts data using an ephemeral Kyber-1024 keypair locally.
        """
        print(f"[QuantaCipher SDK v{get_version()}] VAULT MODE: Sealing with ephemeral Kyber-1024...")
        return _quantacipher_core.vault_encrypt(plaintext)

    def vault_data(self, plaintext: str, metadata: dict = None) -> dict:
        """
        Encrypts in VAULT MODE and sends to the gateway.
        One-liner for permanent zero-trust sealing.
        """
        ciphertext = self.encrypt_vault(plaintext)
        return self.send_to_gateway(ciphertext, metadata)

    def encrypt_secure(self, plaintext: str, public_key_b64: str) -> str:
        """
        SECURE MODE: Encrypts data using the caller's Kyber public key locally.
        """
        print("[QuantaCipher SDK] SECURE MODE: Encrypting with user public key (Kyber-1024)...")
        return _quantacipher_core.secure_encrypt(plaintext, public_key_b64)

    def decrypt_secure(self, ciphertext_payload: str, private_key_b64: str) -> str:
        """
        SECURE MODE: Decrypts locally using the user's PRIVATE key.
        """
        print("[QuantaCipher SDK] SECURE MODE: Decrypting locally with user private key...")
        return _quantacipher_core.secure_decrypt(ciphertext_payload, private_key_b64)

    def secure_data(self, plaintext: str, public_key_b64: str, metadata: dict = None) -> dict:
        """
        Encrypts in SECURE MODE and sends to the gateway.
        Only the user (who holds private_key) can decrypt later.
        """
        ciphertext = self.encrypt_secure(plaintext, public_key_b64)
        return self.send_to_gateway(ciphertext, metadata)

    def send_to_gateway(self, ciphertext: str, metadata: dict = None) -> dict:
        """
        Transmits the Kyber ciphertext to the Gateway to issue a cryptographic receipt.
        """
        if metadata is None:
            metadata = {}
        
        print(f"[QuantaCipher SDK] Tunneling to Gateway → {self.gateway_url}")
        headers = {
            'x-api-key': self.api_key,
            'Content-Type': 'application/json'
        }
        payload = {
            'ciphertext': ciphertext,
            'metadata': metadata,
            'timestamp': int(time.time() * 1000)
        }
        
        try:
            response = requests.post(self.gateway_url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get('receipt')
        except requests.exceptions.HTTPError as e:
            error_msg = f"HTTP {response.status_code}"
            try:
                err_data = response.json()
                error_msg = err_data.get('error', err_data.get('message', error_msg))
            except Exception:
                pass
            raise Exception(f"QuantaCipher Gateway Error: {error_msg}")
        except Exception as e:
            raise Exception(f"QuantaCipher Network Error: {str(e)}")
