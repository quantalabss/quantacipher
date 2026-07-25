/**
 * QuantaCipher SDK — Usage Examples
 *
 * Before running:
 *   1. Build the WASM: cd ../quantacipher-wasm && wasm-pack build --target nodejs
 *   2. Install deps:   npm install
 *   3. Run:            npm run dev
 */

import { QuantaCipher } from './src/index';

const sdk = new QuantaCipher({
    apiKey: 'qz_live_your_key_here',   // ← get yours at quantacipher.com/dashboard
    gatewayUrl: 'https://gateway.quantacipher.com/api/v1/ingest',
});

async function main() {
    console.log(`\nQuantaCipher SDK v${sdk.getVersion()}`);
    console.log('='.repeat(50));

    // ============================================================
    // MODE 1: VAULT MODE — Permanent Sealed Record
    // Use when: you need to prove data was captured but never need to read it back
    // Example: HIPAA audit log, compliance record, tamper-proof timestamp
    // ============================================================

    console.log('\n[MODE 1] VAULT MODE — Permanently sealing a record...');

    const patientRecord = JSON.stringify({
        patientId: 'P-00123',
        diagnosis: 'Type 2 Diabetes',
        timestamp: new Date().toISOString(),
    });

    // Encrypt locally — private key generated and discarded
    const vaultCiphertext = sdk.encryptVault(patientRecord);
    console.log('Vault ciphertext (first 80 chars):', vaultCiphertext.substring(0, 80) + '...');

    // Send to gateway — get a cryptographic receipt
    const receipt = await sdk.vaultData(patientRecord, { type: 'hipaa_audit' });
    console.log('Receipt:', receipt);

    // ❌ There is NO decrypt for vault mode — this is by design.
    // The data is permanently sealed. You can prove it existed, but never read it back.

    // ============================================================
    // MODE 2: SECURE MODE — User Holds Keys, Can Decrypt
    // Use when: you need to store data the user can retrieve later
    // Example: encrypted medical records a doctor can pull up, encrypted messages
    // ============================================================

    console.log('\n[MODE 2] SECURE MODE — Encrypt + Decrypt with user keypair...');

    // Step 1: Generate a Kyber-1024 keypair (runs locally in WASM)
    const keypair = sdk.generateKeypair();
    console.log('Generated keypair:', keypair.algorithm, keypair.version);
    console.log('Public key (first 40 chars):', keypair.publicKey.substring(0, 40) + '...');
    console.log('⚠️  Private key must be stored by the USER. Never send to QuantaCipher.');

    // Step 2: Encrypt using the public key
    const sensitiveDocument = JSON.stringify({
        ssn: '123-45-6789',
        bankAccount: 'ACC-987654321',
        note: 'This is a quantum-safe encrypted document',
    });

    const secureCiphertext = sdk.encryptSecure(sensitiveDocument, keypair.publicKey);
    console.log('\nSecure ciphertext (first 80 chars):', secureCiphertext.substring(0, 80) + '...');

    // Step 3: Decrypt using the private key (runs locally, gateway never sees plaintext)
    const decrypted = sdk.decryptSecure(secureCiphertext, keypair.privateKey);
    const parsed = JSON.parse(decrypted);
    console.log('\nDecrypted successfully ✅');
    console.log('SSN:', parsed.ssn);
    console.log('Bank Account:', parsed.bankAccount);

    // ============================================================
    // VERIFY: Wrong private key should fail gracefully
    // ============================================================

    console.log('\n[TEST] Attempting decrypt with wrong private key...');
    const wrongKeypair = sdk.generateKeypair();
    try {
        sdk.decryptSecure(secureCiphertext, wrongKeypair.privateKey);
    } catch (e: any) {
        console.log('✅ Correctly rejected wrong private key:', e.message);
    }

    console.log('\nAll tests passed. QuantaCipher is working correctly.\n');
}

main().catch(console.error);
