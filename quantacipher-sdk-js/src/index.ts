import axios from 'axios';
// Import the compiled Rust WASM — post-quantum cryptography engine
// Dual-mode enabled: vault_encrypt, secure_encrypt, secure_decrypt, generate_keypair
import {
    vault_encrypt,
    secure_encrypt,
    secure_decrypt,
    generate_keypair,
    get_wasm_version,
} from 'quantacipher-wasm';

export interface QuantaCipherConfig {
    apiKey: string;
    gatewayUrl?: string;
}

export interface QuantaCipherKeypair {
    publicKey: string;   // base64 Kyber-1024 public key
    privateKey: string;  // base64 Kyber-1024 private key — NEVER share this
    algorithm: string;
    version: string;
}

export interface QuantaCipherReceipt {
    id: string;
    timestamp: string;
    bytesSecured: number;
    encryptionScheme: string;
    anchorStatus: string;
}

// ============================================================
//  QuantaCipher SDK — Dual-Mode Post-Quantum Encryption
//
//  MODE 1 — VAULT MODE (encrypt-only, zero-trust)
//    sdk.vaultData(myData)
//    Data is permanently sealed. Nobody can decrypt it.
//    Use for: compliance records, audit logs, HIPAA write-once storage
//
//  MODE 2 — SECURE MODE (user holds private key, can decrypt)
//    const keys = sdk.generateKeypair()       ← user saves privateKey
//    sdk.secureData(myData, keys.publicKey)   ← encrypt + send
//    sdk.decryptSecure(ciphertext, privateKey) ← decrypt locally
//    Use for: encrypted user data the user needs to read back
//
//  REQUIRES WASM REBUILD for Mode 2:
//    cd /mnt/e/temp/quantacipher-wasm && wasm-pack build --target web --out-dir pkg
// ============================================================

export class QuantaCipher {
    private apiKey: string;
    private gatewayUrl: string;
    // Flag: true once WASM is rebuilt with dual-mode functions
    private readonly dualModeAvailable: boolean;

    constructor(config: QuantaCipherConfig) {
        this.apiKey = config.apiKey;
        this.gatewayUrl = config.gatewayUrl || 'https://api.quantacipher.com/v1/ingest';
        // Check if the rebuilt WASM is loaded
        try {
            // If vault_encrypt exists on the module, dual mode is available
            const mod = require('quantacipher-wasm');
            this.dualModeAvailable = typeof mod.vault_encrypt === 'function';
        } catch {
            this.dualModeAvailable = false;
        }
    }

    // ----------------------------------------------------------
    // KEYPAIR MANAGEMENT (requires rebuilt WASM)
    // ----------------------------------------------------------

    /**
     * Generates a Kyber-1024 keypair inside the WASM engine (locally).
     * The private key NEVER leaves this call — you must save it yourself.
     * QuantaCipher never sees or stores the private key.
     */
    public generateKeypair(): QuantaCipherKeypair {
        this.requireDualMode('generateKeypair');
        const mod = require('quantacipher-wasm');
        const raw = mod.generate_keypair();
        return JSON.parse(raw) as QuantaCipherKeypair;
    }

    // ----------------------------------------------------------
    // MODE 1: VAULT MODE (ENCRYPT ONLY — ZERO TRUST)
    // ----------------------------------------------------------

    /**
     * VAULT MODE: Encrypts data using an ephemeral Kyber-1024 keypair.
     * Private key is generated and immediately discarded.
     * Result: permanently sealed — no one can decrypt it.
     */
    public encryptVault(plaintext: string): string {
        console.log(`[QuantaCipher SDK v${get_wasm_version()}] VAULT MODE: Sealing with ephemeral Kyber-1024...`);
        const mod = require('quantacipher-wasm');
        return mod.vault_encrypt(plaintext);
    }

    /**
     * Encrypts in VAULT MODE and sends to the gateway.
     * One-liner for permanent zero-trust sealing.
     */
    public async vaultData(plaintext: string, metadata: any = {}): Promise<QuantaCipherReceipt> {
        const ciphertext = this.encryptVault(plaintext);
        return this.sendToGateway(ciphertext, metadata);
    }

    // ----------------------------------------------------------
    // MODE 2: SECURE MODE (ENCRYPT + DECRYPT)
    // ----------------------------------------------------------

    /**
     * SECURE MODE: Encrypts data using the caller's Kyber public key.
     * Only the holder of the matching private key can decrypt this.
     * Requires WASM rebuild.
     */
    public encryptSecure(plaintext: string, publicKeyB64: string): string {
        this.requireDualMode('encryptSecure');
        console.log(`[QuantaCipher SDK] SECURE MODE: Encrypting with user public key (Kyber-1024)...`);
        const mod = require('quantacipher-wasm');
        return mod.secure_encrypt(plaintext, publicKeyB64);
    }

    /**
     * SECURE MODE: Decrypts a QZ_SECURE_V1:... payload using the user's PRIVATE key.
     * Runs entirely locally — private key never leaves the user's machine.
     * Requires WASM rebuild.
     */
    public decryptSecure(ciphertextPayload: string, privateKeyB64: string): string {
        this.requireDualMode('decryptSecure');
        console.log(`[QuantaCipher SDK] SECURE MODE: Decrypting locally with user private key...`);
        const mod = require('quantacipher-wasm');
        return mod.secure_decrypt(ciphertextPayload, privateKeyB64);
    }

    /**
     * Encrypts in SECURE MODE and sends to the gateway.
     * Only the user (who holds privateKey) can decrypt later.
     */
    public async secureData(plaintext: string, publicKeyB64: string, metadata: any = {}): Promise<QuantaCipherReceipt> {
        const ciphertext = this.encryptSecure(plaintext, publicKeyB64);
        return this.sendToGateway(ciphertext, metadata);
    }

    // ----------------------------------------------------------
    // GATEWAY
    // ----------------------------------------------------------

    public async sendToGateway(ciphertext: string, metadata: any = {}): Promise<QuantaCipherReceipt> {
        console.log(`[QuantaCipher SDK] Tunneling to Gateway → ${this.gatewayUrl}`);
        try {
            const response = await axios.post(
                this.gatewayUrl,
                { ciphertext, metadata, timestamp: Date.now() },
                { headers: { 'x-api-key': this.apiKey, 'Content-Type': 'application/json' } }
            );
            return response.data.receipt as QuantaCipherReceipt;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`QuantaCipher Gateway Error: ${error.response.data?.error || error.response.data?.message}`);
            }
            throw new Error(`QuantaCipher Network Error: ${error.message}`);
        }
    }

    // ----------------------------------------------------------
    // UTILITIES
    // ----------------------------------------------------------

    public getVersion(): string { return get_wasm_version(); }
    public isDualModeAvailable(): boolean { return this.dualModeAvailable; }

    private requireDualMode(methodName: string): void {
        if (!this.dualModeAvailable) {
            throw new Error(
                `[QuantaCipher SDK] ${methodName}() requires the dual-mode WASM build.\n` +
                `Rebuild in WSL:\n  cd /mnt/e/temp/quantacipher-wasm\n  wasm-pack build --target web --out-dir pkg\n` +
                `Then reinstall: cd ../quantacipher-sdk-js && npm install`
            );
        }
    }

    /** @deprecated Use vaultData() instead */
    public async secureDataLegacy(plaintext: string, metadata: any = {}): Promise<QuantaCipherReceipt> {
        return this.vaultData(plaintext, metadata);
    }

    /** @deprecated Use encryptVault() instead */
    public async encryptLocal(plaintext: string): Promise<string> {
        const mod = require('quantacipher-wasm');
        return mod.vault_encrypt(plaintext).replace('QZ_VAULT_V1:', 'QZ_TRUE_PQC_KEM:');
    }
}
