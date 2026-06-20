/* tslint:disable */
/* eslint-disable */

export function encrypt_local_kyber(plaintext: string): string;

export function generate_keypair(): string;

export function get_wasm_version(): string;

export function secure_decrypt(ciphertext_payload: string, private_key_b64: string): string;

export function secure_encrypt(plaintext: string, public_key_b64: string): string;

export function vault_encrypt(plaintext: string): string;
