import axios from 'axios';
import * as wasm from '@quantalabss/quantacipher-wasm';
// Import the compiled Rust WASM — post-quantum cryptography engine
// Dual-mode enabled natively via bundler target

/**
 * Selectable Security Profiles for QuantaCipher:
 * - STANDARD: NIST Security Level 3 (ML-KEM-768 for KEM, ML-DSA-65 for Sign, AES-256-GCM)
 * - HIGH: NIST Security Level 5 (ML-KEM-1024 for KEM, ML-DSA-87 for Sign, AES-256-GCM) — DEFAULT
 * - HYBRID: NIST Security Level 3 + Classical X25519 (X-Wing / X25519 + ML-KEM-768 for KEM, ML-DSA-87 for Sign)
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
    HYBRID_XWING: 'hybrid-xwing',
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
    /** Hybrid Dual Signature: Classical ECDSA P-256 + Post-Quantum ML-DSA-65 (TEC 910018:2025 Figure 3). */
    HYBRID_MLDSA65_P256: 'hybrid-mldsa65-p256',
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
    public telecom: QuantaCipherTelecom = new QuantaCipherTelecom();

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
    // RE-WRAP UTILITIES (MIGRATION & SUPER-ENCRYPTION)
    // ----------------------------------------------------------

    /**
     * Re-wraps an existing SECURE MODE ciphertext to a new target public key.
     * Decapsulates and encapsulates entirely locally within WASM memory.
     * Intermediate plaintext is deterministically zeroized without ever escaping to heap or network.
     *
     * @param ciphertextPayload The existing ciphertext (V1 legacy or V2 versioned envelope).
     * @param currentPrivateKeyB64 The current private key matching the existing ciphertext.
     * @param targetPublicKeyB64 The new recipient/target public key (e.g. upgraded to Level 5 or Hybrid).
     * @param policy Optional policy governing the re-wrap operation.
     * @returns A new versioned V2 ciphertext encrypted under the target public key.
     */
    public rewrapSecure(
        ciphertextPayload: string,
        currentPrivateKeyB64: string,
        targetPublicKeyB64: string,
        policy?: SecurityPolicy,
    ): string {
        const activePolicy = policy || this.policy;
        if (activePolicy) {
            console.log(`[QuantaCipher SDK] RE-WRAP: Re-wrapping secure ciphertext with policy (minLevel=${activePolicy.minLevel ?? 1})...`);
            return wasm.rewrap_secure_with_policy(
                ciphertextPayload,
                currentPrivateKeyB64,
                targetPublicKeyB64,
                activePolicy.minLevel ?? 1,
                activePolicy.rejectLegacy ?? false,
            );
        }
        console.log(`[QuantaCipher SDK] RE-WRAP: Re-wrapping secure ciphertext to target public key...`);
        return wasm.rewrap_secure(ciphertextPayload, currentPrivateKeyB64, targetPublicKeyB64);
    }

    /**
     * Re-wraps an existing SECURE MODE ciphertext and returns a comprehensive migration report.
     */
    public rewrapSecureReport(
        ciphertextPayload: string,
        currentPrivateKeyB64: string,
        targetPublicKeyB64: string,
        policy?: SecurityPolicy,
    ): {
        newCiphertext: string;
        sourceAlgorithm: string;
        targetAlgorithm: string;
        sourceNistLevel: number;
        targetNistLevel: number;
        wasLegacy: boolean;
    } {
        const activePolicy = policy || this.policy;
        const minLevel = activePolicy?.minLevel ?? 1;
        const rejectLegacy = activePolicy?.rejectLegacy ?? false;

        const rawReport = wasm.rewrap_secure_report(
            ciphertextPayload,
            currentPrivateKeyB64,
            targetPublicKeyB64,
            minLevel,
            rejectLegacy,
        );
        const parsed = JSON.parse(rawReport);
        return {
            newCiphertext: parsed.new_ciphertext,
            sourceAlgorithm: parsed.source_algorithm,
            targetAlgorithm: parsed.target_algorithm,
            sourceNistLevel: parsed.source_nist_level,
            targetNistLevel: parsed.target_nist_level,
            wasLegacy: parsed.was_legacy,
        };
    }

    /**
     * Re-wraps a VAULT MODE ciphertext into a new versioned Vault envelope (super-encryption / archive migration).
     * Encrypts the existing sealed ciphertext under the target algorithm or profile using an ephemeral keypair.
     *
     * @param vaultCiphertext Existing sealed vault ciphertext.
     * @param targetAlgorithmOrProfile Target algorithm (e.g. 'hybrid-xwing') or SecurityProfile. Defaults to active profile.
     */
    public rewrapVault(
        vaultCiphertext: string,
        targetAlgorithmOrProfile?: string | SecurityProfile,
    ): string {
        const target = targetAlgorithmOrProfile || this.profile;
        console.log(`[QuantaCipher SDK] RE-WRAP: Re-wrapping vault ciphertext under '${target}'...`);
        if (target === SecurityProfile.STANDARD || target === SecurityProfile.HIGH || target === SecurityProfile.HYBRID) {
            return wasm.rewrap_vault_for_profile(vaultCiphertext, target);
        }
        return wasm.rewrap_vault(vaultCiphertext, target as string);
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

// ============================================================
//  TELECOM MODULE (3GPP TS 33.501 & TEC 910028:2025)
// ============================================================

/**
 * 3GPP 5G Protection Scheme Identifier per 3GPP TS 33.501 and TEC 910028:2025 Section 6.4.
 */
export const ProtectionScheme = {
    /** Null Scheme (unencrypted plain MSIN) */
    NULL: 0,
    /** Profile A: Classical Curve25519 + AES-128-CTR + HMAC-SHA256 */
    PROFILE_A: 1,
    /** Profile B: Classical secp256r1 + AES-128-CTR + HMAC-SHA256 */
    PROFILE_B: 2,
    /** Profile C: TEC 910028:2025 Homogeneous Post-Quantum ML-KEM-768 + AES-256-CTR + HMAC-SHA256 */
    PROFILE_C: 3,
    /** Profile D: TEC 910028:2025 Hybrid Post-Quantum ML-KEM-768 + X25519 + AES-256-CTR + HMAC-SHA256 */
    PROFILE_D: 4,
} as const;

export type ProtectionScheme = typeof ProtectionScheme[keyof typeof ProtectionScheme];

/**
 * 5G Home Network (UDM) keypair holding both Post-Quantum (ML-KEM-768) and Classical (X25519) keys.
 */
export interface HnKeyPair {
    mlkem_public_key: string;   // base64
    mlkem_private_key: string;  // base64
    x25519_public_key: string;  // base64
    x25519_private_key: string; // base64
}

/**
 * 5G Subscription Permanent Identifier (SUPI) / IMSI components.
 */
export interface Supi {
    mcc: string;  // e.g. "404" for India
    mnc: string;  // e.g. "45" for Airtel, "86" for Jio
    msin: string; // e.g. "9876543210"
    imsi: string; // e.g. "404459876543210"
}

/**
 * 5G Telecom Post-Quantum Security Engine
 * Implements 3GPP TS 33.501 Annex C, TS 23.003 Section 2.2B, and TEC 910028:2025 Section 6.4 (PQ-IES).
 */
export class QuantaCipherTelecom {
    /**
     * Generate 5G Home Network (UDM) keypair containing both ML-KEM-768 and X25519 keys.
     */
    public generateHnKeyPair(): HnKeyPair {
        const raw = wasm.telecom_generate_hn_keypair();
        return JSON.parse(raw) as HnKeyPair;
    }

    /**
     * Conceal a 5G SUPI/IMSI into a SUCI using TEC 910028:2025 Profile C (Homogeneous ML-KEM-768 + AES-256-CTR).
     * @returns 3GPP TS 23.003 standard SUCI string (`suci-0-MCC-MNC-RoutingIndicator-3-KeyId-HexOutput`).
     */
    public concealProfileC(
        mcc: string,
        mnc: string,
        msin: string,
        routingIndicator: string = "0000",
        hnPublicKeyId: number = 1,
        hnMlkemPublicKeyB64: string,
    ): string {
        return wasm.telecom_conceal_profile_c(
            mcc,
            mnc,
            msin,
            routingIndicator,
            hnPublicKeyId,
            hnMlkemPublicKeyB64,
        );
    }

    /**
     * De-conceal a Profile C SUCI back into a SUPI/IMSI at the Home Network UDM / SIDF.
     */
    public deconcealProfileC(
        suciNai: string,
        hnMlkemPrivateKeyB64: string,
    ): Supi {
        const raw = wasm.telecom_deconceal_profile_c(suciNai, hnMlkemPrivateKeyB64);
        return JSON.parse(raw) as Supi;
    }

    /**
     * Conceal a 5G SUPI/IMSI into a SUCI using TEC 910028:2025 Profile D (Hybrid ML-KEM-768 + X25519 + AES-256-CTR).
     * @returns 3GPP TS 23.003 standard SUCI string (`suci-0-MCC-MNC-RoutingIndicator-4-KeyId-HexOutput`).
     */
    public concealProfileD(
        mcc: string,
        mnc: string,
        msin: string,
        routingIndicator: string = "0000",
        hnPublicKeyId: number = 1,
        hnMlkemPublicKeyB64: string,
        hnX25519PublicKeyB64: string,
    ): string {
        return wasm.telecom_conceal_profile_d(
            mcc,
            mnc,
            msin,
            routingIndicator,
            hnPublicKeyId,
            hnMlkemPublicKeyB64,
            hnX25519PublicKeyB64,
        );
    }

    /**
     * De-conceal a Profile D SUCI back into a SUPI/IMSI at the Home Network UDM / SIDF.
     */
    public deconcealProfileD(
        suciNai: string,
        hnMlkemPrivateKeyB64: string,
        hnX25519PrivateKeyB64: string,
        hnMlkemPublicKeyB64: string,
    ): Supi {
        const raw = wasm.telecom_deconceal_profile_d(
            suciNai,
            hnMlkemPrivateKeyB64,
            hnX25519PrivateKeyB64,
            hnMlkemPublicKeyB64,
        );
        return JSON.parse(raw) as Supi;
    }

    // ============================================================
    // 5G SBA (Service-Based Architecture) PQ-Token Gateway
    // 3GPP TS 33.501 §6.3.1 & TEC 910028:2025 §6.3.1
    // ============================================================

    /**
     * Generate NRF Signing Keypair using ML-DSA-65 (default) or Hybrid ML-DSA-65 + ECDSA P-256.
     */
    public generateNrfKeyPair(algorithm: 'ml-dsa-65' | 'hybrid-mldsa65-p256' = 'ml-dsa-65'): {
        publicKey: string;
        privateKey: string;
        algorithm: string;
    } {
        const raw = wasm.telecom_generate_nrf_keypair(algorithm);
        const parsed = JSON.parse(raw);
        return {
            publicKey: parsed.public_key,
            privateKey: parsed.private_key,
            algorithm: parsed.algorithm,
        };
    }

    /**
     * Issue a 5G SBA Post-Quantum OAuth 2.0 Access Token (PQ-JWT).
     * Signed by NRF using FIPS 204 ML-DSA-65 or Hybrid ML-DSA-65 + ECDSA P-256.
     *
     * @returns 3-segment dot-separated standard JWT string: `BASE64URL(Header).BASE64URL(Claims).BASE64URL(Sig)`
     */
    public issueSbaToken(
        claims: SbaTokenClaims,
        nrfPrivateKeyB64: string,
        algorithm: 'ml-dsa-65' | 'hybrid-mldsa65-p256' = 'ml-dsa-65',
    ): string {
        return wasm.telecom_issue_sba_token(
            JSON.stringify(claims),
            nrfPrivateKeyB64,
            algorithm,
        );
    }

    /**
     * Verify a 5G SBA PQ-JWT Access Token at a Producer NF (UDM, AUSF, SMF).
     * Validates cryptographic signature authenticity, token expiration, and audience.
     */
    public verifySbaToken(
        tokenStr: string,
        nrfPublicKeyB64: string,
        expectedAud: string = "",
        currentTimeUnix: number = Math.floor(Date.now() / 1000),
    ): SbaTokenClaims {
        const raw = wasm.telecom_verify_sba_token(
            tokenStr,
            nrfPublicKeyB64,
            expectedAud,
            BigInt(currentTimeUnix),
        );
        return JSON.parse(raw) as SbaTokenClaims;
    }

    // ============================================================
    // 5G N32 / SEPP PRINS JWE Roaming Interconnect Engine
    // 3GPP TS 33.501 §5.9.3 & Annex H
    // ============================================================

    /**
     * Generate SEPP (Security Edge Protection Proxy) Keypair.
     * Supports "hybrid-xwing" (default: X25519 + ML-KEM-768) or "ml-kem-768".
     */
    public generateSeppKeyPair(algorithm: 'hybrid-xwing' | 'ml-kem-768' = 'hybrid-xwing'): SeppKeyPair {
        const raw = wasm.telecom_generate_sepp_keypair(algorithm);
        return JSON.parse(raw) as SeppKeyPair;
    }

    /**
     * Protect an N32-f roaming message from a Visiting SEPP to a Home SEPP using Post-Quantum JWE.
     * Encapsulates a random 256-bit CEK via X-Wing or ML-KEM-768 and encrypts payload with AES-256-GCM.
     */
    public protectN32fMessage(
        messageId: string,
        senderPlmn: string,
        receiverPlmn: string,
        routingHeaders: Record<string, any>,
        sensitivePayload: Record<string, any>,
        receiverSeppPublicKeyB64: string,
        algorithm: 'hybrid-xwing' | 'ml-kem-768' = 'hybrid-xwing',
    ): N32fMessage {
        const raw = wasm.telecom_protect_n32f_message(
            messageId,
            senderPlmn,
            receiverPlmn,
            JSON.stringify(routingHeaders),
            JSON.stringify(sensitivePayload),
            receiverSeppPublicKeyB64,
            algorithm,
        );
        return JSON.parse(raw) as N32fMessage;
    }

    /**
     * Unprotect and authenticate an N32-f roaming message at the receiving SEPP.
     * Decapsulates the CEK using the receiver's private key, verifies the JWE tag, and returns the payload.
     */
    public unprotectN32fMessage<T = Record<string, any>>(
        message: N32fMessage,
        receiverSeppPrivateKeyB64: string,
    ): T {
        const raw = wasm.telecom_unprotect_n32f_message(
            JSON.stringify(message),
            receiverSeppPrivateKeyB64,
        );
        return JSON.parse(raw) as T;
    }
}

/**
 * 3GPP TS 33.501 §6.3.1 OAuth 2.0 Access Token Claims for Service-Based Architecture (SBA).
 */
export interface SbaTokenClaims {
    /** Issuer: NRF FQDN or Instance ID */
    iss: string;
    /** Subject: Consumer NF Instance ID (e.g., AMF) */
    sub: string;
    /** Audience: Target Producer NF Type or Instance ID (e.g., "udm", "ausf", "pcf") */
    aud: string;
    /** Scope: 3GPP Service Name (e.g., "nudm-sdm", "nausf-auth") */
    scope: string;
    /** Expiration time (Unix timestamp in seconds) */
    exp: number;
    /** Issued-at time (Unix timestamp in seconds) */
    iat: number;
    /** Mobile Country Code of Serving PLMN (optional) */
    plmn_mcc?: string;
    /** Mobile Network Code of Serving PLMN (optional) */
    plmn_mnc?: string;
}

/**
 * 3GPP TS 33.501 Annex H N32-f Roaming Interconnect Message.
 * Protects cross-carrier roaming communication traversing intermediate IPX transit networks.
 */
export interface N32fMessage {
    /** Unique 3GPP transaction identifier */
    message_id: string;
    /** Originating Serving Network PLMN ID (e.g. "404-45" for Airtel India) */
    sender_plmn: string;
    /** Destination Home Network PLMN ID (e.g. "404-01" for BSNL India) */
    receiver_plmn: string;
    /** Cleartext routing headers visible to IPX transit carriers (e.g. HTTP method, API path) */
    routing_headers: Record<string, any>;
    /** RFC 7516 Post-Quantum JWE compact serialization: ProtectedHeader.EncryptedKey.IV.Ciphertext.Tag */
    protected_payload_jwe: string;
}

/**
 * Keypair for 5G SEPP Roaming Interconnect.
 */
export interface SeppKeyPair {
    publicKey: string;
    privateKey: string;
    algorithm: string;
}


