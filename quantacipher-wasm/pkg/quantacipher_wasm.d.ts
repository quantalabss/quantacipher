/* tslint:disable */
/* eslint-disable */

export class Kex {
    free(): void;
    [Symbol.dispose](): void;
    constructor(public_key: Uint8Array);
    ciphertext: Uint8Array;
    sharedSecret: Uint8Array;
}

export class Keys {
    free(): void;
    [Symbol.dispose](): void;
    constructor();
    readonly pubkey: Uint8Array;
    readonly secret: Uint8Array;
}

export class Params {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly ciphertextBytes: number;
    readonly publicKeyBytes: number;
    readonly secretKeyBytes: number;
    readonly sharedSecretBytes: number;
    static readonly ciphertextBytes: number;
    static readonly publicKeyBytes: number;
    static readonly secretKeyBytes: number;
    static readonly sharedSecretBytes: number;
}

export function decapsulate(ct: Uint8Array, sk: Uint8Array): Uint8Array;

export function encapsulate(pk: Uint8Array): Kex;

export function encrypt_local_kyber(plaintext: string): string;

export function generate_keypair(): string;

export function get_wasm_version(): string;

export function keypair(): Keys;

export function secure_decrypt(ciphertext_payload: string, private_key_b64: string): string;

export function secure_encrypt(plaintext: string, public_key_b64: string): string;

export function vault_encrypt(plaintext: string): string;
