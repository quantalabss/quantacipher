import { QuantaCipher, SecurityProfile, KemAlgorithm } from './src/index';

declare const Buffer: any;

async function runHybridTests() {
    console.log("=== QuantaCipher JS/TS SDK Hybrid Mode Tests ===");

    // 1. Initialize SDK with Hybrid Profile
    const sdkHybrid = new QuantaCipher({
        apiKey: 'test_key',
        profile: SecurityProfile.HYBRID,
    });

    if (sdkHybrid.getProfile() !== SecurityProfile.HYBRID) {
        throw new Error(`Profile must be 'hybrid', got '${sdkHybrid.getProfile()}'`);
    }

    const info = sdkHybrid.getProfileInfo();
    console.log("[+] Hybrid Profile Info:", info);
    if (info.kem !== 'hybrid-xwing' || info.nistLevel !== 5) {
        throw new Error(`Hybrid profile info incorrect: expected kem 'hybrid-xwing', level 5`);
    }

    // 2. Generate Keypair for Hybrid Profile
    const hybridKeys = sdkHybrid.generateKeypair();
    console.log("[+] Hybrid Keypair Alg:", hybridKeys.algorithm, "Profile:", hybridKeys.profile, "NIST Level:", hybridKeys.nistLevel);

    const pkBytes = Buffer.from(hybridKeys.publicKey, 'base64');
    const skBytes = Buffer.from(hybridKeys.privateKey, 'base64');
    console.log(`[+] Public key bytes: ${pkBytes.length} (expected 1216), Private key bytes: ${skBytes.length} (expected 2432)`);

    if (pkBytes.length !== 1216) {
        throw new Error(`Hybrid public key must be 1216 bytes (1184 ML-KEM-768 + 32 X25519), got ${pkBytes.length}`);
    }
    if (skBytes.length !== 2432) {
        throw new Error(`Hybrid private key must be 2432 bytes (2400 ML-KEM-768 + 32 X25519), got ${skBytes.length}`);
    }

    // 3. Vault Encrypt with Hybrid Profile
    const vaultPlaintext = "Top Secret Zero-Trust Archive sealed with Hybrid X-Wing";
    const vaultCiphertext = sdkHybrid.encryptVault(vaultPlaintext);
    console.log("[+] Hybrid Vault Ciphertext Prefix:", vaultCiphertext.substring(0, 26));

    if (!vaultCiphertext.startsWith('QZ_VAULT_V2:hybrid-xwing:')) {
        throw new Error(`Hybrid vault ciphertext must start with 'QZ_VAULT_V2:hybrid-xwing:', got: ${vaultCiphertext.substring(0, 30)}`);
    }

    // 4. Secure Encrypt & Decrypt Roundtrip
    const message = "Post-quantum hybrid encryption with classical fallback";
    const secureCiphertext = sdkHybrid.encryptSecure(message, hybridKeys.publicKey);
    console.log("[+] Hybrid Secure Ciphertext Prefix:", secureCiphertext.substring(0, 27));

    if (!secureCiphertext.startsWith('QZ_SECURE_V2:hybrid-xwing:')) {
        throw new Error(`Hybrid secure ciphertext must start with 'QZ_SECURE_V2:hybrid-xwing:', got: ${secureCiphertext.substring(0, 30)}`);
    }

    const decrypted = sdkHybrid.decryptSecure(secureCiphertext, hybridKeys.privateKey);
    if (decrypted !== message) {
        throw new Error(`Hybrid decryption mismatch: got '${decrypted}', expected '${message}'`);
    }
    console.log("[+] Hybrid Secure Roundtrip: SUCCESS");

    // 5. Tamper Detection (Header algorithm alteration fails AAD verification)
    const tampered = secureCiphertext.replace('QZ_SECURE_V2:hybrid-xwing:', 'QZ_SECURE_V2:ml-kem-1024:');
    let tamperDetected = false;
    try {
        sdkHybrid.decryptSecure(tampered, hybridKeys.privateKey);
    } catch {
        tamperDetected = true;
    }
    if (!tamperDetected) {
        throw new Error("Tampered header algorithm was not rejected!");
    }
    console.log("[+] Hybrid Envelope Tamper Detection: SUCCESS");

    // 6. SecurityPolicy Enforcement (Level 5 requirement accepts Hybrid X-Wing)
    sdkHybrid.setPolicy({ minLevel: 5, rejectLegacy: true });
    const policyDecrypted = sdkHybrid.decryptSecure(secureCiphertext, hybridKeys.privateKey);
    if (policyDecrypted !== message) {
        throw new Error("Policy decryption mismatch!");
    }
    console.log("[+] Hybrid SecurityPolicy Level 5 Compliance: SUCCESS");

    console.log("\n[✔] All QuantaCipher JS/TS SDK Hybrid Mode Tests Passed!");
}

runHybridTests().catch(err => {
    console.error("[✖] Test failed:", err);
    throw err;
});
