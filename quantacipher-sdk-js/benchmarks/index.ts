/**
 * QuantaCipher Node.js SDK Benchmark Suite
 * Uses `mitata` for statistically-robust timing with outlier rejection.
 *
 * Compares:
 *   - ML-KEM-1024 encryption (Vault + Secure Mode) via WASM
 *   - Falcon-512 / ML-DSA signing via WASM
 * vs. classical baselines using Node.js native `node:crypto`
 *
 * Run: npm run bench
 */

import { run, bench, group, baseline } from 'mitata';
import { generateKeyPairSync, createSign, createVerify } from 'node:crypto';
import * as wasm from '@quantalabss/quantacipher-wasm';

const PAYLOAD_1KB = 'A'.repeat(1024);
const PAYLOAD_1MB = 'A'.repeat(1024 * 1024);

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
        wasm.generate_signing_keypair(undefined);
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

group('Vault Encryption', () => {
    baseline('ML-KEM-1024 vault encrypt 1KB (QuantaCipher)', () => {
        wasm.vault_encrypt(PAYLOAD_1KB);
    });

    bench('ML-KEM-1024 vault encrypt 1MB (QuantaCipher)', () => {
        wasm.vault_encrypt(PAYLOAD_1MB);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Secure Encrypt / Decrypt
// ─────────────────────────────────────────────────────────────────────────────

const kp = JSON.parse(wasm.generate_keypair() as unknown as string) as { publicKey: string; privateKey: string };
const qcPubKey = kp.publicKey;
const qcPrivKey = kp.privateKey;
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
// Sign / Verify
// ─────────────────────────────────────────────────────────────────────────────

const falconKp = JSON.parse(wasm.generate_signing_keypair(undefined) as unknown as string) as { public_key: string; private_key: string };
const falconSig = wasm.sign_payload(PAYLOAD_1KB, falconKp.private_key, undefined);

group('Sign / Verify 1KB', () => {
    baseline('Falcon-512 sign 1KB (QuantaCipher)', () => {
        wasm.sign_payload(PAYLOAD_1KB, falconKp.private_key, undefined);
    });

    bench('Falcon-512 verify 1KB (QuantaCipher)', () => {
        wasm.verify_signature(PAYLOAD_1KB, falconSig, falconKp.public_key);
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

    // RSA-2048 baseline
    const { privateKey: rsaPriv, publicKey: rsaPub } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        publicKeyEncoding: { type: 'spki', format: 'pem' },
    });
    const rsaSig = (() => {
        const s = createSign('SHA256');
        s.update(PAYLOAD_1KB);
        return s.sign(rsaPriv);
    })();

    bench('RSA-2048 sign 1KB (baseline)', () => {
        const s = createSign('SHA256');
        s.update(PAYLOAD_1KB);
        s.sign(rsaPriv);
    });

    bench('RSA-2048 verify 1KB (baseline)', () => {
        const v = createVerify('SHA256');
        v.update(PAYLOAD_1KB);
        v.verify(rsaPub, rsaSig);
    });
});

await run({
    avg: true,
    json: false,
    colors: true,
    min_max: true,
    percentiles: true,
});
