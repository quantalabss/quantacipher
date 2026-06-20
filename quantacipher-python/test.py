import quantacipher

print("=== QuantaCipher Python SDK Test ===")
print("Version:", quantacipher.get_version())

keys = quantacipher.generate_keypair()
print("\n[+] Generated Keypair:")
print("    PublicKey:", keys["publicKey"][:30] + "...")
print("    PrivateKey:", keys["privateKey"][:30] + "...")

message = "Zero Trust Enterprise Data"
print("\n[+] Encrypting message:", message)
ciphertext = quantacipher.secure_encrypt(message, keys["publicKey"])
print("    Ciphertext:", ciphertext[:40] + "...")

print("\n[+] Decrypting payload...")
plaintext = quantacipher.secure_decrypt(ciphertext, keys["privateKey"])
print("    Decrypted:", plaintext)

assert plaintext == message, "Decryption failed!"
print("\n[✔] Python SDK Test Passed successfully!")
