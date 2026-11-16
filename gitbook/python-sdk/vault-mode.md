# Python: Vault Mode (Permanent Sealing)

In Python, `quantacipher.vault_encrypt()` provides an irreversible, zero-trust mechanism to seal sensitive telemetry, compliance logs, and transactional records directly from your backend services.

---

## 1. Basic Usage

```python
import json
import quantacipher

audit_event = json.dumps({
    "event": "PASSWORD_RESET_COMPLETED",
    "target_user_id": "usr_9912",
    "ip_address": "198.51.100.42",
    "performed_by": "admin_sys"
})

# Encrypts payload in Rust memory; destroys ephemeral key immediately
sealed_ciphertext = quantacipher.vault_encrypt(audit_event)

print("Sealed Output:")
print(sealed_ciphertext)
# Output: QZ_VAULT_V1:A4f...:9e2...:c8a...
```

---

## 2. Advanced Example: Custom Python Logging Handler

You can integrate QuantaCipher Vault Mode directly into Python's native `logging` module. Every log record is sealed with post-quantum cryptography before writing to disk or forwarding to Datadog/Splunk:

```python
import logging
import quantacipher

class PostQuantumVaultHandler(logging.Handler):
    """Logs records sealed with NIST ML-KEM-1024 Vault Mode."""
    
    def emit(self, record):
        try:
            log_entry = self.format(record)
            # Seal the log string irreversibly
            sealed = quantacipher.vault_encrypt(log_entry)
            
            # Write sealed ciphertext to your secure log destination
            with open("/var/log/audit_sealed.log", "a") as f:
                f.write(sealed + "\n")
        except Exception:
            self.handleError(record)

# Setup logger
logger = logging.getLogger("secure_audit")
logger.setLevel(logging.INFO)
handler = PostQuantumVaultHandler()
logger.addHandler(handler)

# Usage in your app:
logger.info("Admin user updated SEPP gateway routing table rule #402")
```

Even if an attacker gains root access to `/var/log/audit_sealed.log`, they cannot read the historic log entries because the private keys were mathematically destroyed the microsecond each entry was written.
