import { QuantaCipher } from './src/index';

async function test() {
    console.log("=== QuantaCipher JS/TS SDK Test ===");
    
    // We instantiate QuantaCipher with a dummy API key for testing local methods
    const sdk = new QuantaCipher({ apiKey: 'test_key' });
    
    console.log("Version:", sdk.getVersion());

    const keys = sdk.generateKeypair();
    console.log("\n[+] Generated Keypair:");
    console.log("    PublicKey:", keys.publicKey.substring(0, 30) + "...");
    console.log("    PrivateKey:", keys.privateKey.substring(0, 30) + "...");

    const message = "Zero Trust Enterprise Data";
    console.log("\n[+] Encrypting message:", message);
    
    const ciphertext = sdk.encryptSecure(message, keys.publicKey);
    console.log("    Ciphertext:", ciphertext.substring(0, 40) + "...");

    console.log("\n[+] Decrypting payload...");
    const plaintext = sdk.decryptSecure(ciphertext, keys.privateKey);
    console.log("    Decrypted:", plaintext);

    if (plaintext === message) {
        console.log("\n[✔] JS/TS SDK Test Passed successfully!");
    } else {
        throw new Error("\n[✖] Decryption failed!");
    }
}

test();
