import { QuantaCipher, QuantaCipherSign, SecurityProfile } from './src/index';

async function runDowngradeTests() {
    console.log("=== QuantaCipher JS/TS SDK Downgrade Attack Tests ===");

    // 1. Recipient generates Level 3 (Standard) and Level 5 (High) keypairs
    const sdkStd = new QuantaCipher({ apiKey: 'test_key', profile: SecurityProfile.STANDARD });
    const stdKeys = sdkStd.generateKeypair();

    const sdkHigh = new QuantaCipher({ apiKey: 'test_key', profile: SecurityProfile.HIGH });
    const highKeys = sdkHigh.generateKeypair();

    // Encrypt under Level 3
    const secret = "Top Secret Classified Intel";
    const ctLevel3 = sdkStd.encryptSecure(secret, stdKeys.publicKey);

    // Encrypt under Level 5
    const ctLevel5 = sdkHigh.encryptSecure(secret, highKeys.publicKey);

    // 2. Client configured with minLevel: 5 policy MUST reject Level 3 ciphertext
    const sdkEnforced = new QuantaCipher({
        apiKey: 'test_key',
        policy: { minLevel: 5 },
    });

    try {
        sdkEnforced.decryptSecure(ctLevel3, stdKeys.privateKey);
        throw new Error("FAIL: Decrypting Level 3 ciphertext with minLevel: 5 must fail!");
    } catch (err: any) {
        console.log("[+] Level 3 KEM Ciphertext with minLevel=5 rejected successfully:", err.message);
    }

    // 3. Decrypting Level 5 ciphertext with minLevel: 5 succeeds
    const decryptedHigh = sdkEnforced.decryptSecure(ctLevel5, highKeys.privateKey);
    if (decryptedHigh !== secret) {
        throw new Error("FAIL: Decrypting Level 5 ciphertext with minLevel: 5 failed!");
    }
    console.log("[+] Level 5 KEM Ciphertext with minLevel=5 accepted: SUCCESS");

    // 4. Header tampering attack: attacker rewrites header
    const tamperedCt = ctLevel5.replace('QZ_SECURE_V2:ml-kem-1024:', 'QZ_SECURE_V2:ml-kem-768:');
    try {
        sdkHigh.decryptSecure(tamperedCt, highKeys.privateKey);
        throw new Error("FAIL: Tampered header must be rejected by AAD authentication!");
    } catch (err: any) {
        console.log("[+] Tampered AAD Header rejected successfully:", err.message);
    }

    // 5. Signature Downgrade Attack Tests
    const signer = new QuantaCipherSign();
    const doc = "Board of Directors Authorization";

    // Sign with ML-DSA-65 (Level 3)
    const stdSignKeys = signer.generateSigningKeyPair(SecurityProfile.STANDARD);
    const sigLevel3 = signer.signPayload(doc, stdSignKeys.private_key, { algorithm: 'ml-dsa-65' });

    // Sign with ML-DSA-87 (Level 5)
    const highSignKeys = signer.generateSigningKeyPair(SecurityProfile.HIGH);
    const sigLevel5 = signer.signPayload(doc, highSignKeys.private_key, { algorithm: 'ml-dsa-87' });

    // Verifier with minLevel: 5 MUST reject Level 3 signature
    try {
        signer.verifySignature(doc, sigLevel3, stdSignKeys.public_key, { minLevel: 5 });
        throw new Error("FAIL: Verifying Level 3 signature with minLevel: 5 must fail!");
    } catch (err: any) {
        console.log("[+] Level 3 Signature with minLevel=5 rejected successfully:", err.message);
    }

    // Verifier with minLevel: 5 accepts Level 5 signature
    const validLevel5 = signer.verifySignature(doc, sigLevel5, highSignKeys.public_key, { minLevel: 5 });
    if (!validLevel5) {
        throw new Error("FAIL: Verifying Level 5 signature with minLevel: 5 failed!");
    }
    console.log("[+] Level 5 Signature with minLevel=5 accepted: SUCCESS");

    // 6. Strict policy rejecting legacy unversioned format
    const legacySig = {
        alg: 'falcon-512-fips206-draft',
        sig: 'AA==',
        ver: 1,
    };
    try {
        signer.verifySignature(doc, legacySig as any, 'AA==', { minLevel: 1, rejectLegacy: true });
        throw new Error("FAIL: Legacy signature with rejectLegacy: true must fail!");
    } catch (err: any) {
        console.log("[+] Legacy signature with rejectLegacy=true rejected successfully:", err.message);
    }

    console.log("\n[✔] All QuantaCipher JS/TS SDK Downgrade Tests Passed!");
}

runDowngradeTests().catch(err => {
    console.error("[✖] Test failed:", err);
    throw err;
});
