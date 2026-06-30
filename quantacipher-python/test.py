from quantacipher import QuantaCipher
import time

print("=== QuantaCipher Python SDK Test ===")

# 1. Initialize the SDK
sdk = QuantaCipher(api_key="qz_test_demo123")

print("Version:", sdk.generate_keypair()["version"])

# 2. Test Secure Mode (Local Encryption & Decryption)
keys = sdk.generate_keypair()
print("\n[+] Generated Keypair:")
print("    PublicKey:", keys["publicKey"][:30] + "...")
print("    PrivateKey:", keys["privateKey"][:30] + "...")

message = "Zero Trust Enterprise Data"
print("\n[+] Encrypting message in Secure Mode:", message)
ciphertext = sdk.encrypt_secure(message, keys["publicKey"])
print("    Ciphertext:", ciphertext[:40] + "...")

print("\n[+] Decrypting payload locally...")
plaintext = sdk.decrypt_secure(ciphertext, keys["privateKey"])
print("    Decrypted:", plaintext)

assert plaintext == message, "Decryption failed!"

# 3. Test Vault Mode with Gateway
print("\n[+] Testing Vault Mode Gateway Integration...")
try:
    receipt = sdk.vault_data("My highly sensitive compliance data", {"source": "python_test_script"})
    print("    [✔] Gateway Receipt Received!")
    print("    Receipt ID:", receipt["id"])
    print("    Algorithm:", receipt["encryptionScheme"])
except Exception as e:
    print("    [!] Gateway Test Failed (is the Gateway running on port 4000?):", str(e))

print("\n[✔] Python SDK Test Completed!")

