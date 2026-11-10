import { QuantaCipher, SecurityProfile, KemAlgorithm } from './src/index';

async function runRewrapTests() {
    console.log("=== QuantaCipher JS/TS SDK Re-Wrap Utility Tests ===");

    const sdkStd = new QuantaCipher({ apiKey: 'test_key', profile: SecurityProfile.STANDARD });
    const sdkHigh = new QuantaCipher({ apiKey: 'test_key', profile: SecurityProfile.HIGH });
    const sdkHybrid = new QuantaCipher({ apiKey: 'test_key', profile: SecurityProfile.HYBRID });

    const stdKeys = sdkStd.generateKeypair();
    const highKeys = sdkHigh.generateKeypair();
    const hybridKeys = sdkHybrid.generateKeypair();

    const secretPayload = "Enterprise confidential records scheduled for cryptographic migration";

    // ----------------------------------------------------
    // TEST 1: Re-wrap Level 3 ciphertext to Hybrid X-Wing
    // ----------------------------------------------------
    const level3Ct = sdkStd.encryptSecure(secretPayload, stdKeys.publicKey);
    console.log("[+] Initial Level 3 Ciphertext:", level3Ct.substring(0, 28));
    if (!level3Ct.startsWith('QZ_SECURE_V2:ml-kem-768:')) {
        throw new Error("Initial ciphertext must be Level 3 ML-KEM-768");
    }

    const hybridRewrapped = sdkStd.rewrapSecure(level3Ct, stdKeys.privateKey, hybridKeys.publicKey);
    console.log("[+] Re-wrapped to Hybrid X-Wing:", hybridRewrapped.substring(0, 28));
    if (!hybridRewrapped.startsWith('QZ_SECURE_V2:hybrid-xwing:')) {
        throw new Error("Re-wrapped ciphertext must be Hybrid X-Wing");
    }

    const decryptedHybrid = sdkHybrid.decryptSecure(hybridRewrapped, hybridKeys.privateKey);
    if (decryptedHybrid !== secretPayload) {
        throw new Error("Decrypted hybrid payload mismatch!");
    }
    console.log("[+] Re-wrap to Hybrid X-Wing: SUCCESS");

    // ----------------------------------------------------
    // TEST 2: Re-wrap with Migration Report
    // ----------------------------------------------------
    const report = sdkStd.rewrapSecureReport(level3Ct, stdKeys.privateKey, hybridKeys.publicKey);
    console.log("[+] Re-wrap Migration Report:", report);
    if (
        report.sourceAlgorithm !== 'ml-kem-768' ||
        report.targetAlgorithm !== 'hybrid-xwing' ||
        report.sourceNistLevel !== 3 ||
        report.targetNistLevel !== 3 ||
        report.wasLegacy !== false
    ) {
        throw new Error("Re-wrap migration report contains incorrect metadata!");
    }
    console.log("[+] Re-wrap Migration Report Verification: SUCCESS");

    // ----------------------------------------------------
    // TEST 3: Re-wrap Level 3 to Level 5 (ML-KEM-1024)
    // ----------------------------------------------------
    const level5Rewrapped = sdkStd.rewrapSecure(level3Ct, stdKeys.privateKey, highKeys.publicKey);
    console.log("[+] Re-wrapped to Level 5:", level5Rewrapped.substring(0, 28));
    if (!level5Rewrapped.startsWith('QZ_SECURE_V2:ml-kem-1024:')) {
        throw new Error("Re-wrapped ciphertext must be Level 5 ML-KEM-1024");
    }

    const decryptedLevel5 = sdkHigh.decryptSecure(level5Rewrapped, highKeys.privateKey);
    if (decryptedLevel5 !== secretPayload) {
        throw new Error("Decrypted Level 5 payload mismatch!");
    }
    console.log("[+] Re-wrap Level 3 to Level 5: SUCCESS");

    // ----------------------------------------------------
    // TEST 4: Policy Enforcement During Re-wrap (Downgrade Prevention)
    // ----------------------------------------------------
    const level5Ct = sdkHigh.encryptSecure(secretPayload, highKeys.publicKey);

    let downgradeBlocked = false;
    try {
        // Attempting to re-wrap a Level 5 ciphertext to a Level 3 target when policy requires Level 5
        sdkHigh.rewrapSecure(level5Ct, highKeys.privateKey, stdKeys.publicKey, { minLevel: 5 });
    } catch (err: any) {
        const errStr = String(err.message || err);
        if (errStr.toLowerCase().includes("security level")) {
            downgradeBlocked = true;
        }
    }
    if (!downgradeBlocked) {
        throw new Error("Policy failed to block re-wrap downgrade to Level 3!");
    }
    console.log("[+] Re-wrap Downgrade Policy Enforcement: SUCCESS");

    // ----------------------------------------------------
    // TEST 5: Vault Super-Encryption / Re-wrap
    // ----------------------------------------------------
    const vaultSecret = "Immutable audit log write-once archive";
    const originalVault = sdkStd.encryptVault(vaultSecret);
    console.log("[+] Original Vault Ciphertext:", originalVault.substring(0, 26));

    const rewrappedVault = sdkStd.rewrapVault(originalVault, SecurityProfile.HYBRID);
    console.log("[+] Re-wrapped Vault Ciphertext:", rewrappedVault.substring(0, 26));
    if (!rewrappedVault.startsWith('QZ_VAULT_V2:hybrid-xwing:')) {
        throw new Error("Re-wrapped vault ciphertext must be Hybrid X-Wing");
    }
    console.log("[+] Vault Re-wrap (Super-Encryption): SUCCESS");

    console.log("\n[✔] All QuantaCipher JS/TS SDK Re-Wrap Tests Passed!");
}

runRewrapTests().catch(err => {
    console.error("[✖] Test failed:", err);
    throw err;
});
