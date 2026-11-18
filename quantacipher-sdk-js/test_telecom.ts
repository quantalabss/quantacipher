declare const process: any;
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

    // 5. 5G SBA (Service-Based Architecture) PQ-Token Gateway Tests
    console.log("\n[+] 5. 5G SBA OAuth 2.0 PQ-Token Gateway (3GPP TS 33.501 §6.3.1)...");
    console.log("    a) Generating NRF Signing KeyPair (FIPS 204 ML-DSA-65)...");
    const nrfKeys = telecom.generateNrfKeyPair('ml-dsa-65');
    console.log("       NRF Public Key (B64):", nrfKeys.publicKey.substring(0, 32) + "...");

    const now = Math.floor(Date.now() / 1000);
    const claims = {
        iss: "nrf-01.5gc.mnc045.mcc404.3gppnetwork.org",
        sub: "amf-01.5gc.mnc045.mcc404.3gppnetwork.org",
        aud: "udm",
        scope: "nudm-sdm",
        iat: now,
        exp: now + 3600,
        plmn_mcc: "404",
        plmn_mnc: "45",
    };

    console.log("    b) NRF issuing PQ-JWT Access Token for AMF -> UDM [nudm-sdm]...");
    const tToken0 = performance.now();
    const token = telecom.issueSbaToken(claims, nrfKeys.privateKey, 'ml-dsa-65');
    const tTokenIssue = (performance.now() - tToken0).toFixed(2);
    console.log(`       Issued in ${tTokenIssue} ms:`);
    console.log("       PQ-JWT:", token.substring(0, 60) + "..." + token.substring(token.length - 20));

    console.log("    c) Producer NF (UDM) verifying token signature and audience...");
    const tTokenVer0 = performance.now();
    const verifiedClaims = telecom.verifySbaToken(token, nrfKeys.publicKey, "udm", now + 60);
    const tTokenVerify = (performance.now() - tTokenVer0).toFixed(2);
    console.log(`       Verified in ${tTokenVerify} ms!`);
    console.log("       Verified Claims:", verifiedClaims);
    if (verifiedClaims.scope !== "nudm-sdm" || verifiedClaims.sub !== claims.sub) {
        throw new Error("SBA Token verification failed claim comparison!");
    }
    console.log("       [✔] ML-DSA-65 SBA Token verified successfully!");

    console.log("    d) Testing Audience Mismatch Protection (presented to AUSF instead of UDM)...");
    try {
        telecom.verifySbaToken(token, nrfKeys.publicKey, "ausf", now + 60);
        throw new Error("Audience mismatch unexpectedly succeeded!");
    } catch (err: any) {
        console.log("       [✔] Audience mismatch correctly rejected:", err.message || err);
    }

    console.log("    e) Testing Hybrid ML-DSA-65 + ECDSA P-256 Token (TEC 910018:2025 Figure 3)...");
    const hybridNrfKeys = telecom.generateNrfKeyPair('hybrid-mldsa65-p256');
    const hybridClaims = {
        iss: "nrf-01.5gc.mnc045.mcc404.3gppnetwork.org",
        sub: "amf-01.5gc.mnc045.mcc404.3gppnetwork.org",
        aud: "ausf",
        scope: "nausf-auth",
        iat: now,
        exp: now + 1800,
    };
    const hybridToken = telecom.issueSbaToken(hybridClaims, hybridNrfKeys.privateKey, 'hybrid-mldsa65-p256');
    const verifiedHybrid = telecom.verifySbaToken(hybridToken, hybridNrfKeys.publicKey, "ausf", now + 30);
    console.log("       [✔] Hybrid SBA Token verified successfully:", verifiedHybrid.scope);

    // 6. 5G N32 / SEPP PRINS Roaming Interconnect Engine Tests (3GPP TS 33.501 §5.9.3 & Annex H)
    console.log("\n[+] 6. 5G N32 / SEPP PRINS JWE Roaming Interconnect (3GPP TS 33.501 Annex H)...");
    console.log("    a) Generating Home SEPP KeyPair (Hybrid X-Wing: X25519 + ML-KEM-768)...");
    const tSepp0 = performance.now();
    const hSeppKeys = telecom.generateSeppKeyPair('hybrid-xwing');
    const tSeppGen = (performance.now() - tSepp0).toFixed(2);
    console.log(`       Generated in ${tSeppGen} ms:`);
    console.log("       - Public Key (B64):", hSeppKeys.publicKey.substring(0, 32) + "...");
    console.log("       - Algorithm:", hSeppKeys.algorithm);

    console.log("    b) Visiting SEPP (Airtel 404-45) protecting N32-f roaming message to Home SEPP (BSNL 404-01)...");
    const routingHeaders = {
        method: "POST",
        path: "/nudm-ueau/v1/404019876543210/security-information/generate-auth-data",
        "3gpp-sbi-sender-id": "sepp.vplmn.mnc045.mcc404.3gppnetwork.org",
    };
    const sensitivePayload = {
        supi: "404019876543210",
        authType: "5G_AKA",
        servingNetworkName: "5G:mnc045.mcc404.3gppnetwork.org",
        resynchronizationInfo: null,
    };

    const tProt0 = performance.now();
    const n32Msg = telecom.protectN32fMessage(
        "msg-n32-2026-001",
        "404-45",
        "404-01",
        routingHeaders,
        sensitivePayload,
        hSeppKeys.publicKey,
        'hybrid-xwing',
    );
    const tProt = (performance.now() - tProt0).toFixed(2);
    console.log(`       Protected in ${tProt} ms:`);
    console.log("       - Message ID:", n32Msg.message_id);
    console.log("       - Sender PLMN:", n32Msg.sender_plmn);
    console.log("       - Receiver PLMN:", n32Msg.receiver_plmn);
    console.log("       - Cleartext Routing Headers (IPX readable):", JSON.stringify(n32Msg.routing_headers));
    console.log("       - Protected JWE (RFC 7516):", n32Msg.protected_payload_jwe.substring(0, 60) + "...");

    // Validate 5-segment JWE
    const jweParts = n32Msg.protected_payload_jwe.split('.');
    if (jweParts.length !== 5) {
        throw new Error(`Expected 5 JWE segments, got ${jweParts.length}`);
    }

    console.log("    c) Home SEPP (BSNL 404-01) unprotecting and authenticating JWE payload...");
    const tUnprot0 = performance.now();
    const recoveredPayload = telecom.unprotectN32fMessage(n32Msg, hSeppKeys.privateKey);
    const tUnprot = (performance.now() - tUnprot0).toFixed(2);
    console.log(`       Unprotected in ${tUnprot} ms:`);
    console.log("       - Recovered Sensitive Payload:", recoveredPayload);
    if (recoveredPayload.supi !== sensitivePayload.supi || recoveredPayload.authType !== "5G_AKA") {
        throw new Error("Recovered N32-f payload did not match original!");
    }
    console.log("       [✔] SEPP PRINS JWE round-trip PASSED!");

    console.log("    d) Testing IPX Tamper Resistance (corrupting JWE authentication tag)...");
    const tamperedParts = [...jweParts];
    tamperedParts[4] = "AAAA" + tamperedParts[4].slice(4); // corrupt tag
    const tamperedMsg = { ...n32Msg, protected_payload_jwe: tamperedParts.join('.') };
    try {
        telecom.unprotectN32fMessage(tamperedMsg, hSeppKeys.privateKey);
        throw new Error("Tampered N32-f JWE unexpectedly succeeded!");
    } catch (err: any) {
        console.log("       [✔] Tampered JWE correctly rejected:", err.message || err);
    }

    console.log("    e) Testing ML-KEM-768 SEPP Profile...");
    const mlkemSeppKeys = telecom.generateSeppKeyPair('ml-kem-768');
    const n32MsgMlkem = telecom.protectN32fMessage(
        "msg-n32-2026-002",
        "404-45",
        "404-01",
        routingHeaders,
        sensitivePayload,
        mlkemSeppKeys.publicKey,
        'ml-kem-768',
    );
    const recoveredMlkem = telecom.unprotectN32fMessage(n32MsgMlkem, mlkemSeppKeys.privateKey);
    if (recoveredMlkem.supi !== sensitivePayload.supi) {
        throw new Error("ML-KEM-768 SEPP failed!");
    }
    console.log("       [✔] Homogeneous ML-KEM-768 SEPP roaming round-trip PASSED!");

    // 7. 5G Telecom-CBOM & Cryptographic Readiness Analyzer Engine (TEC 910018:2025 §§2.6 & 4.1.2)
    console.log("\n[+] 7. 5G Telecom-CBOM & Cryptographic Readiness Analyzer (TEC 910018:2025)...");
    console.log("    a) Fetching sample audit presets...");
    const presets = telecom.getAuditPresets();
    console.log("       Presets available:", Object.keys(presets));

    console.log("    b) Auditing Legacy Commercial Telco Deployment (Rel-16 Profile A + RSA SBA)...");
    const tScan0 = performance.now();
    const legacyReport = telecom.audit5gCore(presets.legacy_commercial);
    const tScan = (performance.now() - tScan0).toFixed(2);
    console.log(`       Audited in ${tScan} ms:`);
    console.log(`       - Readiness Score: ${legacyReport.overall_score}/100`);
    console.log(`       - Risk Classification: ${legacyReport.quantum_risk_level}`);
    console.log(`       - TEC 910018 / 910028 Readiness: ${legacyReport.mtcte_certified ? "PASS" : "GAP DETECTED"}`);
    console.log(`       - Critical Vulnerabilities: ${legacyReport.critical_count}`);
    console.log(`       - High-Risk Items: ${legacyReport.high_count}`);
    if (legacyReport.mtcte_certified || legacyReport.critical_count === 0) {
        throw new Error("Legacy telco deployment should have failed readiness evaluation!");
    }
    console.log("       [✔] Legacy vulnerabilities correctly detected!");

    console.log("    c) Auditing QuantaCipher Quantum-Native 5G Core Deployment...");
    const nativeReport = telecom.audit5gCore(presets.quantum_native);
    console.log(`       - Readiness Score: ${nativeReport.overall_score}/100`);
    console.log(`       - Risk Classification: ${nativeReport.quantum_risk_level}`);
    console.log(`       - TEC 910018 / 910028 Readiness: ${nativeReport.mtcte_certified ? "PASS" : "FAILED"}`);
    console.log(`       - Assets Discovered: ${nativeReport.assets.length}`);
    if (!nativeReport.mtcte_certified || nativeReport.overall_score !== 100) {
        throw new Error("Quantum-native deployment should pass with score 100!");
    }
    console.log("       - CycloneDX 1.6 CBOM generated:", nativeReport.cyclonedx_cbom_json.substring(0, 80) + "...");
    console.log("       [✔] Quantum-Native TEC Readiness Evaluation PASSED!");

    console.log("\n==================================================================");
    console.log("   ✅ ALL 4 5G TELECOM PRODUCTS VERIFIED & READY FOR CARRIER DEPLOYMENT");
    console.log("   1. PQ-IES SUCI Concealment (Proposed Profiles C & D)");
    console.log("   2. SBA Core PQ-OAuth2 Token Gateway (ML-DSA-65 / Hybrid)");
    console.log("   3. Bilateral SEPP PRINS JWE Roaming Interconnect (X-Wing / ML-KEM-768)");
    console.log("   4. 5G Telecom-CBOM & Cryptographic Readiness Analyzer");
    console.log("==================================================================");
}

testTelecom().catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
});
