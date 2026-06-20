/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const encrypt_local_kyber: (a: number, b: number) => [number, number, number, number];
export const generate_keypair: () => [number, number, number, number];
export const get_wasm_version: () => [number, number];
export const secure_decrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const secure_encrypt: (a: number, b: number, c: number, d: number) => [number, number, number, number];
export const vault_encrypt: (a: number, b: number) => [number, number, number, number];
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_start: () => void;
