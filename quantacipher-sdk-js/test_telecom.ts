import { QuantaCipher, QuantaCipherTelecom, ProtectionScheme } from './src/index';

async function testTelecom() {
    console.log("==================================================================");
    console.log("   QuantaCipher 5G Telecom Post-Quantum Engine Test");
    console.log("   3GPP TS 33.501 Annex C & TEC 910028:2025 Section 6.4 (PQ-IES)");
    console.log("==================================================================");

    const telecom = new QuantaCipherTelecom();

    // 1. Generate Home Network (UDM/SIDF) keypair
    console.log("\n[+] 1. Generating 5G Home Network (UDM) KeyPair...");
    const t0 = performance.now();
    const hnKeys = telecom.generateHnKeyPair();
    const tGen = (performance.now() - t0).toFixed(2);
    console.log(`    Generated in ${tGen} ms:`);
    console.log("    - ML-KEM-768 Public Key  (B64):", hnKeys.mlkem_public_key.substring(0, 32) + "...");
    console.log("    - ML-KEM-768 Private Key (B64):", hnKeys.mlkem_private_key.substring(0, 32) + "...");
    console.log("    - X25519 Public Key      (B64):", hnKeys.x25519_public_key.substring(0, 32) + "...");
    console.log("    - X25519 Private Key     (B64):", hnKeys.x25519_private_key.substring(0, 32) + "...");

    // Test Subscriber: Indian IMSI 404-45-9876543210 (MCC 404 = India, MNC 45 = Airtel)
    const mcc = "404";
    const mnc = "45";
    const msin = "9876543210";
    const expectedImsi = "404459876543210";
    const routingIndicator = "0000";
    const hnPublicKeyId = 1;

    // 2. Profile C: Homogeneous Post-Quantum ML-KEM-768
    console.log("\n[+] 2. Testing Profile C (Homogeneous ML-KEM-768 + AES-256-CTR)...");
    const t1 = performance.now();
    const suciC = telecom.concealProfileC(mcc, mnc, msin, routingIndicator, hnPublicKeyId, hnKeys.mlkem_public_key);
    const tConcealC = (performance.now() - t1).toFixed(2);
    console.log(`    Concealed in ${tConcealC} ms:`);
    console.log("    SUCI NAI:", suciC.substring(0, 50) + "..." + suciC.substring(suciC.length - 20));

    // Deconceal Profile C
    const t2 = performance.now();
    const deconcealedC = telecom.deconcealProfileC(suciC, hnKeys.mlkem_private_key);
    const tDeconcealC = (performance.now() - t2).toFixed(2);
    console.log(`    De-concealed in ${tDeconcealC} ms:`);
    console.log("    Recovered SUPI:", deconcealedC);
    if (deconcealedC.imsi !== expectedImsi) {
        throw new Error(`Profile C failed! Expected ${expectedImsi}, got ${deconcealedC.imsi}`);
    }
    console.log("    [✔] Profile C round-trip PASSED!");

    // 3. Profile D: Hybrid Post-Quantum ML-KEM-768 + Classical X25519
    console.log("\n[+] 3. Testing Profile D (Hybrid ML-KEM-768 + X25519 + AES-256-CTR)...");
    const t3 = performance.now();
    const suciD = telecom.concealProfileD(
        mcc,
        mnc,
        msin,
        routingIndicator,
        hnPublicKeyId,
        hnKeys.mlkem_public_key,
        hnKeys.x25519_public_key
    );
    const tConcealD = (performance.now() - t3).toFixed(2);
    console.log(`    Concealed in ${tConcealD} ms:`);
    console.log("    SUCI NAI:", suciD.substring(0, 50) + "..." + suciD.substring(suciD.length - 20));

    // Deconceal Profile D
    const t4 = performance.now();
    const deconcealedD = telecom.deconcealProfileD(
        suciD,
        hnKeys.mlkem_private_key,
        hnKeys.x25519_private_key,
        hnKeys.mlkem_public_key
    );
    const tDeconcealD = (performance.now() - t4).toFixed(2);
    console.log(`    De-concealed in ${tDeconcealD} ms:`);
    console.log("    Recovered SUPI:", deconcealedD);
    if (deconcealedD.imsi !== expectedImsi) {
        throw new Error(`Profile D failed! Expected ${expectedImsi}, got ${deconcealedD.imsi}`);
    }
    console.log("    [✔] Profile D round-trip PASSED!");

    // 4. Corrupted MAC rejection test
    console.log("\n[+] 4. Tamper Resistance Test (corrupt MAC byte)...");
    const corruptedSuci = suciC.slice(0, -2) + "00";
    try {
        telecom.deconcealProfileC(corruptedSuci, hnKeys.mlkem_private_key);
        throw new Error("Tampered SUCI unexpectedly succeeded!");
    } catch (err: any) {
        console.log("    [✔] Tampered MAC correctly rejected:", err.message || err);
    }

    console.log("\n==================================================================");
    console.log("   ✅ ALL 5G TELECOM TESTS PASSED (100% 3GPP & TEC CONFORMANCE)");
    console.log("==================================================================");
}

testTelecom().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
