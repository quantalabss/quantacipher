import { QuantaCipher, QuantaCipherSign, SecurityProfile } from './src/index';

async function runProfileTests() {
    console.log("=== QuantaCipher JS/TS SDK Profile Tests ===");

    // 1. Default Profile is High (Level 5)
    const sdkDefault = new QuantaCipher({ apiKey: 'test_key' });
    if (sdkDefault.getProfile() !== SecurityProfile.HIGH) {
        throw new Error(`Default profile must be 'high', got '${sdkDefault.getProfile()}'`);
    }

    const defaultKeys = sdkDefault.generateKeypair();
    console.log("[+] Default Keypair Alg:", defaultKeys.algorithm);
    if (!defaultKeys.algorithm.includes('1024') && !defaultKeys.algorithm.includes('ML-KEM-1024')) {
        throw new Error(`Default keypair must be ML-KEM-1024, got ${defaultKeys.algorithm}`);
    }

    // 2. Standard Profile (Level 3)
    const sdkStandard = new QuantaCipher({ apiKey: 'test_key', profile: SecurityProfile.STANDARD });
    if (sdkStandard.getProfile() !== SecurityProfile.STANDARD) {
        throw new Error(`Profile must be 'standard', got '${sdkStandard.getProfile()}'`);
    }

    const stdKeys = sdkStandard.generateKeypair();
    console.log("[+] Standard Keypair Alg:", stdKeys.algorithm, "Profile:", stdKeys.profile);
    if (!stdKeys.algorithm.includes('768')) {
        throw new Error(`Standard keypair must be ML-KEM-768, got ${stdKeys.algorithm}`);
    }

    // Vault Encrypt with Standard Profile
    const stdVault = sdkStandard.encryptVault("Standard Profile Vault Secret");
    console.log("[+] Standard Vault Ciphertext Prefix:", stdVault.substring(0, 24));
    if (!stdVault.startsWith('QZ_VAULT_V2:ml-kem-768:')) {
        throw new Error(`Standard vault ciphertext must start with 'QZ_VAULT_V2:ml-kem-768:', got ${stdVault.substring(0, 30)}`);
    }

    // Vault Encrypt with High Profile
    const highVault = sdkDefault.encryptVault("High Profile Vault Secret");
    console.log("[+] High Vault Ciphertext Prefix:", highVault.substring(0, 25));
    if (!highVault.startsWith('QZ_VAULT_V2:ml-kem-1024:')) {
        throw new Error(`High vault ciphertext must start with 'QZ_VAULT_V2:ml-kem-1024:', got ${highVault.substring(0, 30)}`);
    }

    // 3. Secure Mode Roundtrip with Standard Profile
    const stdMsg = "Confidential standard profile transmission";
    const stdEncrypted = sdkStandard.encryptSecure(stdMsg, stdKeys.publicKey);
    if (!stdEncrypted.startsWith('QZ_SECURE_V2:ml-kem-768:')) {
        throw new Error(`Standard secure ciphertext must start with 'QZ_SECURE_V2:ml-kem-768:'`);
    }
    const stdDecrypted = sdkStandard.decryptSecure(stdEncrypted, stdKeys.privateKey);
    if (stdDecrypted !== stdMsg) {
        throw new Error(`Standard decryption mismatch!`);
    }
    console.log("[+] Standard Secure Mode Roundtrip: SUCCESS");

    // 4. Secure Mode Roundtrip with High Profile
    const highMsg = "Top secret high profile transmission";
    const highEncrypted = sdkDefault.encryptSecure(highMsg, defaultKeys.publicKey);
    if (!highEncrypted.startsWith('QZ_SECURE_V2:ml-kem-1024:')) {
        throw new Error(`High secure ciphertext must start with 'QZ_SECURE_V2:ml-kem-1024:'`);
    }
    const highDecrypted = sdkDefault.decryptSecure(highEncrypted, defaultKeys.privateKey);
    if (highDecrypted !== highMsg) {
        throw new Error(`High decryption mismatch!`);
    }
    console.log("[+] High Secure Mode Roundtrip: SUCCESS");

    // 5. Sign Module Profile Tests
    const signer = new QuantaCipherSign();
    const signPayload = "Financial Audit Record 2026-Q4";

    // Standard Profile -> ML-DSA-65
    const stdSignKey = signer.generateSigningKeyPair(SecurityProfile.STANDARD);
    console.log("[+] Standard Sign Alg:", stdSignKey.algorithm);
    if (stdSignKey.algorithm !== 'ml-dsa-65') {
        throw new Error(`Standard signing algorithm must be 'ml-dsa-65', got ${stdSignKey.algorithm}`);
    }
    const stdSig = signer.signPayload(signPayload, stdSignKey.private_key, { algorithm: 'ml-dsa-65' });
    if (!signer.verifySignature(signPayload, stdSig, stdSignKey.public_key)) {
        throw new Error("Standard signature verification failed!");
    }
    console.log("[+] Standard Signature Verify: SUCCESS");

    // High Profile -> ML-DSA-87
    const highSignKey = signer.generateSigningKeyPair(SecurityProfile.HIGH);
    console.log("[+] High Sign Alg:", highSignKey.algorithm);
    if (highSignKey.algorithm !== 'ml-dsa-87') {
        throw new Error(`High signing algorithm must be 'ml-dsa-87', got ${highSignKey.algorithm}`);
    }
    const highSig = signer.signPayload(signPayload, highSignKey.private_key, { algorithm: 'ml-dsa-87' });
    if (!signer.verifySignature(signPayload, highSig, highSignKey.public_key)) {
        throw new Error("High signature verification failed!");
    }
    console.log("[+] High Signature Verify: SUCCESS");

    console.log("\n[✔] All QuantaCipher JS/TS SDK Profile Tests Passed!");
}

runProfileTests().catch(err => {
    console.error("[✖] Test failed:", err);
    throw err;
});
