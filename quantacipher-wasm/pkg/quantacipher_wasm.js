/* @ts-self-types="./quantacipher_wasm.d.ts" */
import * as wasm from "./quantacipher_wasm_bg.wasm";
import { __wbg_set_wasm } from "./quantacipher_wasm_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    encrypt_local_kyber, generate_keypair, get_wasm_version, secure_decrypt, secure_encrypt, vault_encrypt
} from "./quantacipher_wasm_bg.js";
