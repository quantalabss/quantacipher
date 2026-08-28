import axios from 'axios';
import * as wasm from '@quantalabss/quantacipher-wasm';
// Import the compiled Rust WASM — post-quantum cryptography engine
// Dual-mode enabled natively via bundler target

export interface QuantaCipherConfig {
    apiKey: string;
    gatewayUrl?: string;
}

export interface QuantaCipherKeypair {
    publicKey: string;   // base64 ML-KEM-1024 (FIPS 203) public key
    privateKey: string;  // base64 ML-KEM-1024 private key — NEVER share this
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
//  SIGN MODULE (v2.0) — Types
// ============================================================

/**
 * Canonical algorithm IDs for the signing registry.
 * Use these instead of raw strings to avoid typos.
 */
export const AlgorithmId = {
    /** Falcon-512 / FN-DSA implementing FIPS 206 draft. Default. */
    FALCON_512_DRAFT: 'falcon-512-fips206-draft',
    /** ML-DSA-44 implementing FIPS 204 (finalized). */
    ML_DSA_44: 'ml-dsa-44',
} as const;

export type AlgorithmId = typeof AlgorithmId[keyof typeof AlgorithmId];

/**
 * A self-describing signature envelope.
 * Every signature embeds the algorithm ID so `verify()` can dispatch
 * correctly without the caller having to track which algorithm was used.
 *
 * Wire format:
 * ```json
 * { "alg": "falcon-512-fips206-draft", "sig": "<base64>", "ver": 1 }
 * ```
 */
export interface SignatureEnvelope {
    /** Versioned algorithm ID. Never assume the caller's current default. */
    alg: AlgorithmId;
    /** Base64-encoded raw signature bytes. */
    sig: string;
    /** Envelope format version (currently always 1). */
    ver: 1;
}

/** A signing keypair returned by generateSigningKeyPair(). */
export interface SigningKeyPair {
    /** Base64-encoded public key. Share freely. */
    public_key: string;
    /** Base64-encoded private key. NEVER share or store insecurely. */
    private_key: string;
    /** The algorithm ID this keypair is valid for. */
    algorithm: AlgorithmId;
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

    constructor(config: QuantaCipherConfig) {
        this.apiKey = config.apiKey;
        this.gatewayUrl = config.gatewayUrl || 'https://quantacipher.com/api/v1/ingest';
        
        if (!this.gatewayUrl.startsWith('https://') && !this.gatewayUrl.startsWith('http://localhost') && !this.gatewayUrl.startsWith('http://127.0.0.1')) {
            throw new Error("Gateway URL must be HTTPS in production environments.");
        }
    }

    // ----------------------------------------------------------
    // KEYPAIR MANAGEMENT (requires rebuilt WASM)
    // ----------------------------------------------------------

    /**
     * Generates an ML-KEM-1024 (FIPS 203) keypair inside the WASM engine (locally).
     * The private key NEVER leaves this call — you must save it yourself.
     * QuantaCipher never sees or stores the private key.
     */
    public generateKeypair(): QuantaCipherKeypair {
        const raw = wasm.generate_keypair();
        return JSON.parse(raw) as QuantaCipherKeypair;
    }

    // ----------------------------------------------------------
    // MODE 1: VAULT MODE (ENCRYPT ONLY — ZERO TRUST)
    // ----------------------------------------------------------

    /**
     * VAULT MODE: Encrypts data using an ephemeral ML-KEM-1024 (FIPS 203) keypair.
     * Private key is generated and immediately discarded.
     * Result: permanently sealed — no one can decrypt it.
     */
    public encryptVault(plaintext: string): string {
        console.log(`[QuantaCipher SDK v${wasm.get_wasm_version()}] VAULT MODE: Sealing with ephemeral ML-KEM-1024 (FIPS 203)...`);
        return wasm.vault_encrypt(plaintext);
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
     * SECURE MODE: Encrypts data using the caller's ML-KEM-1024 (FIPS 203) public key.
     * Only the holder of the matching private key can decrypt this.
     * Requires WASM rebuild.
     */
    public encryptSecure(plaintext: string, publicKeyB64: string): string {
        console.log(`[QuantaCipher SDK] SECURE MODE: Encrypting with user public key (ML-KEM-1024, FIPS 203)...`);
        return wasm.secure_encrypt(plaintext, publicKeyB64);
    }

    /**
     * SECURE MODE: Decrypts a QZ_SECURE_V1:... payload using the user's PRIVATE key.
     * Runs entirely locally — private key never leaves the user's machine.
     */
    public decryptSecure(ciphertextPayload: string, privateKeyB64: string): string {
        console.log(`[QuantaCipher SDK] SECURE MODE: Decrypting locally with user private key...`);
        return wasm.secure_decrypt(ciphertextPayload, privateKeyB64);
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
                { headers: { 'x-api-key': this.apiKey, 'Content-Type': 'application/json' }, timeout: 10000 }
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

    public getVersion(): string { return wasm.get_wasm_version(); }
    public isDualModeAvailable(): boolean { return true; }

    /** @deprecated Use vaultData() instead */
    public async secureDataLegacy(plaintext: string, metadata: any = {}): Promise<QuantaCipherReceipt> {
        return this.vaultData(plaintext, metadata);
    }

    /** @deprecated Use encryptVault() instead */
    public async encryptLocal(plaintext: string): Promise<string> {
        return wasm.vault_encrypt(plaintext).replace('QZ_VAULT_V1:', 'QZ_TRUE_PQC_KEM:');
    }
}

// ============================================================
//  QuantaCipherSign — Signing Module (v2.0)
//
//  Crypto-agile signing with two algorithms:
//  - AlgorithmId.FALCON_512_DRAFT  (default, matches QuantaChain behavior)
//  - AlgorithmId.ML_DSA_44         (FIPS 204 finalized, lower-risk alternative)
//
//  USAGE:
//    const signer = new QuantaCipherSign();
//    const kp = signer.generateSigningKeyPair();     // uses default Falcon-512
//    const sig = signer.signPayload(data, kp.private_key);
//    const ok  = signer.verifySignature(data, sig, kp.public_key);
//
//  The SignatureEnvelope self-describes its algorithm, so verifySignature()
//  never needs to know which algorithm was used at sign time.
// ============================================================

export class QuantaCipherSign {

    // ----------------------------------------------------------
    // INTERNAL HELPERS
    // ----------------------------------------------------------

    /**
     * Converts a Uint8Array to a base64 string without spreading the entire
     * array into function arguments (which crashes on payloads > ~64 KB in V8).
     * Processes in 8 KB chunks to stay well within the call-stack argument limit.
     */
    private static uint8ToBase64(bytes: Uint8Array): string {
        let binary = '';
        const CHUNK = 8192;
        for (let i = 0; i < bytes.length; i += CHUNK) {
            binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
        }
        return btoa(binary);
    }

    // ----------------------------------------------------------
    // KEY GENERATION
    // ----------------------------------------------------------

    /**
     * Generate a signing keypair.
     * @param algorithm - Algorithm to use (defaults to Falcon-512 draft).
     * @returns SigningKeyPair with public_key, private_key, and algorithm.
     */
    public generateSigningKeyPair(
        algorithm?: AlgorithmId
    ): SigningKeyPair {
        const raw = wasm.generate_signing_keypair(algorithm ?? null);
        return JSON.parse(raw) as SigningKeyPair;
    }

    // ----------------------------------------------------------
    // SIGNING
    // ----------------------------------------------------------

    /**
     * Sign a payload.
     *
     * @param payload - The data to sign. Accepts string (UTF-8 encoded) or Uint8Array.
     * @param privateKeyB64 - Base64-encoded private signing key from generateSigningKeyPair().
     * @param options.algorithm - Algorithm to use (defaults to Falcon-512 draft).
     * @returns A self-describing SignatureEnvelope containing the alg ID.
     */
    public signPayload(
        payload: string | Uint8Array,
        privateKeyB64: string,
        options?: { algorithm?: AlgorithmId }
    ): SignatureEnvelope {
        const payloadBytes = typeof payload === 'string'
            ? new TextEncoder().encode(payload)
            : payload;
        const payloadB64 = QuantaCipherSign.uint8ToBase64(payloadBytes);
        const raw = wasm.sign_payload(payloadB64, privateKeyB64, options?.algorithm ?? null);
        return JSON.parse(raw) as SignatureEnvelope;
    }

    // ----------------------------------------------------------
    // VERIFICATION
    // ----------------------------------------------------------

    /**
     * Verify a signature.
     *
     * The algorithm is read from the SignatureEnvelope.alg field — the caller
     * does NOT need to specify which algorithm was used at sign time.
     * A missing or unknown alg field throws rather than silently falling back.
     *
     * @param payload - The original data that was signed.
     * @param signature - The SignatureEnvelope returned by signPayload().
     * @param publicKeyB64 - Base64-encoded public signing key.
     * @returns true if the signature is valid, false if not.
     * @throws if signature.alg is missing or not a registered algorithm ID.
     */
    public verifySignature(
        payload: string | Uint8Array,
        signature: SignatureEnvelope,
        publicKeyB64: string
    ): boolean {
        const payloadBytes = typeof payload === 'string'
            ? new TextEncoder().encode(payload)
            : payload;
        const payloadB64 = QuantaCipherSign.uint8ToBase64(payloadBytes);
        const signatureJson = JSON.stringify(signature);
        return wasm.verify_signature(payloadB64, signatureJson, publicKeyB64);
    }

    // ----------------------------------------------------------
    // UTILITIES
    // ----------------------------------------------------------

    /**
     * Serialize a SignatureEnvelope to a compact JSON string for storage or transport.
     */
    public envelopeToJson(envelope: SignatureEnvelope): string {
        return JSON.stringify(envelope);
    }

    /**
     * Deserialize a JSON string back into a SignatureEnvelope.
     * Throws if the JSON is malformed or missing required fields.
     */
    public envelopeFromJson(json: string): SignatureEnvelope {
        const parsed = JSON.parse(json);
        if (!parsed.alg || !parsed.sig || parsed.ver === undefined) {
            throw new Error('QuantaCipher: Invalid SignatureEnvelope — missing alg, sig, or ver field');
        }
        return parsed as SignatureEnvelope;
    }
}
