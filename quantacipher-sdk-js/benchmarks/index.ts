/**
 * QuantaCipher Node.js SDK Benchmark Suite
 * Uses `mitata` for statistically-robust timing with outlier rejection.
 *
 * Compares:
 *   - ML-KEM-1024 encryption (Vault + Secure Mode) via WASM
 *   - ML-DSA-44 / Falcon-512 signing via WASM
 * vs. classical baselines using Node.js native `node:crypto`
 *
 * Run: npm run bench
 */

import { run, bench, group, baseline } from 'mitata';
import { generateKeyPairSync, createSign, createVerify, webcrypto } from 'node:crypto';

// Import QuantaCipher SDK
// NOTE: The WASM package must be built first: npm run build (in quantacipher-wasm)
import * as wasm from '@quantalabss/quantacipher-wasm';

const PAYLOAD_1KB = 'A'.repeat(1024);
const PAYLOAD_1MB = 'A'.repeat(1024 * 1024);

await wasm.default(); // Initialize the WASM module

// ─────────────────────────────────────────────────────────────────────────────
// Key Generation
// ─────────────────────────────────────────────────────────────────────────────

group('Key Generation', () => {
    baseline('ML-KEM-1024 keygen (QuantaCipher)', () => {
        wasm.generate_keypair();
    });

    bench('RSA-4096 keygen (baseline)', () => {
        generateKeyPairSync('rsa', { modulusLength: 4096 });
    });

    bench('ECDH P-256 keygen (baseline)', () => {
        generateKeyPairSync('ec', { namedCurve: 'P-256' });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Signing Key Generation
// ─────────────────────────────────────────────────────────────────────────────

group('Signing Key Generation', () => {
    baseline('Falcon-512 sign keygen (QuantaCipher)', () => {
        wasm.sign_generate_keypair(undefined);
    });

    bench('ML-DSA-44 sign keygen (QuantaCipher)', () => {
        wasm.sign_generate_keypair('ml-dsa-44');
    });

    bench('ECDSA P-256 sign keygen (baseline)', () => {
        generateKeyPairSync('ec', { namedCurve: 'P-256' });
    });

    bench('RSA-2048 sign keygen (baseline)', () => {
        generateKeyPairSync('rsa', { modulusLength: 2048 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Vault Encryption
// ─────────────────────────────────────────────────────────────────────────────

group('Vault Encryption 1KB', () => {
    baseline('ML-KEM-1024 vault encrypt 1KB (QuantaCipher)', () => {
        wasm.vault_encrypt(PAYLOAD_1KB);
    });
});

group('Vault Encryption 1MB', () => {
    baseline('ML-KEM-1024 vault encrypt 1MB (QuantaCipher)', () => {
        wasm.vault_encrypt(PAYLOAD_1MB);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Secure Encrypt / Decrypt
// ─────────────────────────────────────────────────────────────────────────────

const { publicKey: qcPubKey, privateKey: qcPrivKey } = wasm.generate_keypair() as {
    publicKey: string;
    privateKey: string;
};

const qcCiphertext = wasm.secure_encrypt(PAYLOAD_1KB, qcPubKey) as string;

group('Secure Encrypt / Decrypt 1KB', () => {
    baseline('ML-KEM-1024 secure encrypt 1KB (QuantaCipher)', () => {
        wasm.secure_encrypt(PAYLOAD_1KB, qcPubKey);
    });

    bench('ML-KEM-1024 secure decrypt 1KB (QuantaCipher)', () => {
        wasm.secure_decrypt(qcCiphertext, qcPrivKey);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Sign / Verify — Falcon-512
// ─────────────────────────────────────────────────────────────────────────────

const falconKp = wasm.sign_generate_keypair(undefined) as { public_key: string; private_key: string };
const falconSig = wasm.sign(new TextEncoder().encode(PAYLOAD_1KB), falconKp.private_key, undefined);
const payload1kbBytes = new TextEncoder().encode(PAYLOAD_1KB);

group('Sign / Verify 1KB', () => {
    baseline('Falcon-512 sign 1KB (QuantaCipher)', () => {
        wasm.sign(payload1kbBytes, falconKp.private_key, undefined);
    });

    bench('Falcon-512 verify 1KB (QuantaCipher)', () => {
        wasm.verify(payload1kbBytes, falconSig, falconKp.public_key);
    });

    // ML-DSA-44
    const mldsaKp = wasm.sign_generate_keypair('ml-dsa-44') as { public_key: string; private_key: string };
    const mldsaSig = wasm.sign(payload1kbBytes, mldsaKp.private_key, 'ml-dsa-44');

    bench('ML-DSA-44 sign 1KB (QuantaCipher)', () => {
        wasm.sign(payload1kbBytes, mldsaKp.private_key, 'ml-dsa-44');
    });

    bench('ML-DSA-44 verify 1KB (QuantaCipher)', () => {
        wasm.verify(payload1kbBytes, mldsaSig, mldsaKp.public_key);
    });

    // ECDSA P-256 baseline
    const { privateKey: ecPriv, publicKey: ecPub } = generateKeyPairSync('ec', {
        namedCurve: 'P-256',
        privateKeyEncoding: { type: 'sec1', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
    });

    const ecSig = (() => {
        const s = createSign('SHA256');
        s.update(PAYLOAD_1KB);
        return s.sign(ecPriv);
    })();

    bench('ECDSA P-256 sign 1KB (baseline)', () => {
        const s = createSign('SHA256');
        s.update(PAYLOAD_1KB);
        s.sign(ecPriv);
    });

    bench('ECDSA P-256 verify 1KB (baseline)', () => {
        const v = createVerify('SHA256');
        v.update(PAYLOAD_1KB);
        v.verify(ecPub, ecSig);
    });
});

await run({
    avg: true,
    json: false,
    colors: true,
    min_max: true,
    percentiles: true,
});
