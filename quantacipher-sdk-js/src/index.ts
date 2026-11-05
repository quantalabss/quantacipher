import axios from 'axios';
import * as wasm from '@quantalabss/quantacipher-wasm';
// Import the compiled Rust WASM — post-quantum cryptography engine
// Dual-mode enabled natively via bundler target

/**
 * Selectable Security Profiles for QuantaCipher:
 * - STANDARD: NIST Security Level 3 (ML-KEM-768 for KEM, ML-DSA-65 for Sign, AES-256-GCM)
 * - HIGH: NIST Security Level 5 (ML-KEM-1024 for KEM, ML-DSA-87 for Sign, AES-256-GCM) — DEFAULT
 * - HYBRID: NIST Security Level 5 Composite (X-Wing / X25519 + ML-KEM-768 for KEM, ML-DSA-87 for Sign)
 */
export const SecurityProfile = {
    STANDARD: 'standard',
    HIGH: 'high',
    HYBRID: 'hybrid',
} as const;

export type SecurityProfile = typeof SecurityProfile[keyof typeof SecurityProfile];

/**
 * Supported KEM algorithms in QuantaCipher
 */
export const KemAlgorithm = {
    ML_KEM_768: 'ml-kem-768',
    ML_KEM_1024: 'ml-kem-1024',
} as const;

export type KemAlgorithm = typeof KemAlgorithm[keyof typeof KemAlgorithm];

/**
 * Security policy for enforcing minimum cryptographic strength (downgrade prevention).
 */
export interface SecurityPolicy {
    /** Minimum NIST security level required (1, 2, 3, or 5). Defaults to 1. */
    minLevel?: number;
    /** Whether to reject legacy unversioned payloads or signatures (defaults to false). */
    rejectLegacy?: boolean;
}

export interface QuantaCipherConfig {
    apiKey: string;
    gatewayUrl?: string;
    /** Security profile (defaults to SecurityProfile.HIGH) */
    profile?: SecurityProfile;
    /** Security policy for enforcing minimum security levels and preventing downgrade attacks */
    policy?: SecurityPolicy;
}

export interface QuantaCipherKeypair {
    publicKey: string;   // base64 public key
    privateKey: string;  // base64 private key — NEVER share this
    algorithm: string;
    profile?: SecurityProfile;
    nistLevel?: number;
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
    /** Falcon-512 / FN-DSA implementing FIPS 206 draft. Default for legacy. */
    FALCON_512_DRAFT: 'falcon-512-fips206-draft',
    /** ML-DSA-44 implementing FIPS 204 (finalized, NIST Level 2). */
    ML_DSA_44: 'ml-dsa-44',
    /** ML-DSA-65 implementing FIPS 204 (finalized, NIST Level 3). */
    ML_DSA_65: 'ml-dsa-65',
    /** ML-DSA-87 implementing FIPS 204 (finalized, NIST Level 5). */
    ML_DSA_87: 'ml-dsa-87',
} as const;

export type AlgorithmId = typeof AlgorithmId[keyof typeof AlgorithmId];

/**
 * A self-describing signature envelope.
 * Every signature embeds the algorithm ID so `verify()` can dispatch
 * correctly without the caller having to track which algorithm was used.
 *
 * Wire format:
 * ```json
 * { "alg": "ml-dsa-87", "sig": "<base64>", "ver": 2 }
 * ```
 */
export interface SignatureEnvelope {
    /** Versioned algorithm ID. Never assume the caller's current default. */
    alg: AlgorithmId | string;
    /** Base64-encoded raw signature bytes. */
    sig: string;
    /** Envelope format version (1 for legacy raw signatures, 2 for authenticated envelope). */
    ver: number;
}

/** A signing keypair returned by generateSigningKeyPair(). */
export interface SigningKeyPair {
    /** Base64-encoded public key. Share freely. */
    public_key: string;
    /** Base64-encoded private key. NEVER share or store insecurely. */
    private_key: string;
    /** The algorithm ID this keypair is valid for. */
    algorithm: AlgorithmId | string;
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
// ============================================================

export class QuantaCipher {
    private apiKey: string;
    private gatewayUrl: string;
    private profile: SecurityProfile;
    private policy?: SecurityPolicy;

    constructor(config: QuantaCipherConfig) {
        this.apiKey = config.apiKey;
        this.gatewayUrl = config.gatewayUrl || 'https://quantacipher.com/api/v1/ingest';
        this.profile = config.profile || SecurityProfile.HIGH;
        this.policy = config.policy;
        
        if (!this.gatewayUrl.startsWith('https://') && !this.gatewayUrl.startsWith('http://localhost') && !this.gatewayUrl.startsWith('http://127.0.0.1')) {
            throw new Error("Gateway URL must be HTTPS in production environments.");
        }
    }

    /**
     * Gets the current security profile (defaults to 'high').
     */
    public getProfile(): SecurityProfile {
        return this.profile;
    }

    /**
     * Sets the active security profile ('standard', 'high', or 'hybrid').
     */
    public setProfile(profile: SecurityProfile): void {
        this.profile = profile;
    }

    /**
     * Gets the active security policy (if configured).
     */
    public getPolicy(): SecurityPolicy | undefined {
        return this.policy;
    }

    /**
     * Sets the active security policy for downgrade prevention.
     */
    public setPolicy(policy: SecurityPolicy | undefined): void {
        this.policy = policy;
    }

    /**
     * Inspects configuration and primitive details of a security profile.
     */
    public getProfileInfo(profile?: SecurityProfile): {
        profile: string;
        displayName: string;
        nistLevel: number;
        kem: string;
        sign: string;
        symmetric: string;
    } {
        const raw = wasm.get_profile_info(profile || this.profile);
        return JSON.parse(raw);
    }

    // ----------------------------------------------------------
    // KEYPAIR MANAGEMENT
    // ----------------------------------------------------------

    /**
     * Generates a post-quantum KEM keypair locally inside the WASM engine.
     * Uses the active security profile (defaulting to High / ML-KEM-1024),
     * or an explicitly provided profile.
     * The private key NEVER leaves this call — you must save it yourself.
     */
    public generateKeypair(profile?: SecurityProfile): QuantaCipherKeypair {
        const targetProfile = profile || this.profile;
        if (targetProfile === SecurityProfile.HIGH && !profile) {
            // Backward-compatible default path
            const raw = wasm.generate_keypair();
            return JSON.parse(raw) as QuantaCipherKeypair;
        }
        const raw = wasm.generate_keypair_for_profile(targetProfile);
        return JSON.parse(raw) as QuantaCipherKeypair;
    }

    /**
     * Generates a keypair for an explicit KEM algorithm ("ml-kem-768" or "ml-kem-1024").
     */
    public generateKeypairForAlgorithm(algorithm: KemAlgorithm | string): QuantaCipherKeypair {
        const raw = wasm.generate_keypair_for_alg(algorithm);
        return JSON.parse(raw) as QuantaCipherKeypair;
    }

    // ----------------------------------------------------------
    // MODE 1: VAULT MODE (ENCRYPT ONLY — ZERO TRUST)
    // ----------------------------------------------------------

    /**
     * VAULT MODE: Encrypts data using an ephemeral post-quantum keypair.
     * Ephemeral private key is generated and immediately zeroized.
     * Result: permanently sealed — no one can decrypt it.
     */
    public encryptVault(plaintext: string, profile?: SecurityProfile): string {
        const targetProfile = profile || this.profile;
        console.log(`[QuantaCipher SDK v${wasm.get_wasm_version()}] VAULT MODE: Sealing under profile '${targetProfile}'...`);
        return wasm.vault_encrypt_for_profile(plaintext, targetProfile);
    }

    /**
     * Encrypts in VAULT MODE and sends to the gateway.
     * One-liner for permanent zero-trust sealing.
     */
    public async vaultData(
        plaintext: string,
        metadata: any = {},
        profile?: SecurityProfile,
    ): Promise<QuantaCipherReceipt> {
        const ciphertext = this.encryptVault(plaintext, profile);
        return this.sendToGateway(ciphertext, metadata);
    }

    // ----------------------------------------------------------
    // MODE 2: SECURE MODE (ENCRYPT + DECRYPT)
    // ----------------------------------------------------------

    /**
     * SECURE MODE: Encrypts data using the recipient's public key.
     * Automatically adapts to the recipient's algorithm (ML-KEM-768 or ML-KEM-1024)
     * based on the public key length. Header is cryptographically authenticated as AAD.
     */
    public encryptSecure(plaintext: string, publicKeyB64: string): string {
        console.log(`[QuantaCipher SDK] SECURE MODE: Encrypting with user public key (authenticated V2 envelope)...`);
        return wasm.secure_encrypt(plaintext, publicKeyB64);
    }

    /**
     * SECURE MODE: Decrypts a ciphertext payload using the user's private key.
     * Runs entirely locally — private key never leaves the caller's process.
     * Supports both authenticated V2 envelopes and legacy V1 payloads.
     * Enforces the active or provided SecurityPolicy (downgrade prevention).
     */
    public decryptSecure(
        ciphertextPayload: string,
        privateKeyB64: string,
        policy?: SecurityPolicy,
    ): string {
        const activePolicy = policy || this.policy;
        if (activePolicy) {
            console.log(`[QuantaCipher SDK] SECURE MODE: Decrypting with policy (minLevel=${activePolicy.minLevel ?? 1})...`);
            return wasm.secure_decrypt_with_policy(
                ciphertextPayload,
                privateKeyB64,
                activePolicy.minLevel ?? 1,
                activePolicy.rejectLegacy ?? false,
            );
        }
        console.log(`[QuantaCipher SDK] SECURE MODE: Decrypting locally with user private key...`);
        return wasm.secure_decrypt(ciphertextPayload, privateKeyB64);
    }

    /**
     * Encrypts in SECURE MODE and sends to the gateway.
     * Only the user (holding matching privateKey) can decrypt later.
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
                { ciphertext, timestamp: Date.now() },
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
//  Crypto-agile signing supporting selectable profiles and algorithms:
//  - SecurityProfile.STANDARD (ML-DSA-65, NIST Level 3)
//  - SecurityProfile.HIGH     (ML-DSA-87, NIST Level 5)
//  - Legacy Falcon-512 draft  (AlgorithmId.FALCON_512_DRAFT)
//  - ML-DSA-44                (AlgorithmId.ML_DSA_44)
//
//  Envelope format version 2 cryptographically locks metadata to the signature.
// ============================================================

export class QuantaCipherSign {

    // ----------------------------------------------------------
    // INTERNAL HELPERS
    // ----------------------------------------------------------

    /**
     * Converts a Uint8Array to a base64 string without stack overflow on large buffers.
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
     * Generate a signing keypair according to a SecurityProfile or specific AlgorithmId.
     * @param profileOrAlgorithm - Profile ('standard' | 'high') or specific algorithm (defaults to Falcon-512 draft).
     * @returns SigningKeyPair with public_key, private_key, and algorithm.
     */
    public generateSigningKeyPair(
        profileOrAlgorithm?: SecurityProfile | AlgorithmId | string
    ): SigningKeyPair {
        if (
            profileOrAlgorithm === SecurityProfile.STANDARD ||
            profileOrAlgorithm === SecurityProfile.HIGH ||
            profileOrAlgorithm === SecurityProfile.HYBRID
        ) {
            const raw = wasm.generate_signing_keypair_for_profile(profileOrAlgorithm);
            return JSON.parse(raw) as SigningKeyPair;
        }

        const raw = wasm.generate_signing_keypair(profileOrAlgorithm ?? null);
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
     * @param options.algorithm - Specific algorithm or profile to use.
     * @returns A self-describing SignatureEnvelope containing the alg ID.
     */
    public signPayload(
        payload: string | Uint8Array,
        privateKeyB64: string,
        options?: { algorithm?: AlgorithmId | string }
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
        publicKeyB64: string,
        policy?: SecurityPolicy,
    ): boolean {
        const payloadBytes = typeof payload === 'string'
            ? new TextEncoder().encode(payload)
            : payload;
        const payloadB64 = QuantaCipherSign.uint8ToBase64(payloadBytes);
        const signatureJson = JSON.stringify(signature);
        if (policy) {
            return wasm.verify_signature_with_policy(
                payloadB64,
                signatureJson,
                publicKeyB64,
                policy.minLevel ?? 1,
                policy.rejectLegacy ?? false,
            );
        }
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
