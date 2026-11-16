# Troubleshooting & Common Pitfalls

This guide covers common integration pitfalls, bundler errors, and runtime exceptions encountered when working with QuantaCipher.

---

## 1. Bundler & Runtime Issues

### Issue A: Next.js: `Module parse failed: The experimental feature "asyncWebAssembly" is not enabled`
**Cause:** Next.js Webpack does not enable asynchronous WebAssembly by default.  
**Fix:** Update `next.config.ts` (or `next.config.js`):

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
```

---

### Issue B: Browser: `ReferenceError: Buffer is not defined`
**Cause:** In modern client-side bundlers (Vite, pure browser Webpack 5), Node.js core globals like `Buffer` are omitted.  
**Fix:** Install the `buffer` package and polyfill the global:

```bash
npm install buffer
```

In your application entry point (`index.ts` / `main.tsx`):

```typescript
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}
```

---

### Issue C: Next.js 15+ Server Components vs Client Components
**Cause:** Calling SDK functions that interact with the browser window in Server Components.  
**Fix:** The SDK is isomorphic and functions on both Server and Client. However, if you are reading user-provided files or handling interactive UI state in Next.js, add `"use client";` at the top of your component file.

---

## 2. Cryptographic Errors

### Error: `QuantaCipher Error: ML-KEM decapsulation failed (wrong key?)`
* **Cause 1:** The private key provided to `decryptSecure()` was not generated as part of the same keypair as the public key used during `encryptSecure()`.
* **Cause 2:** The private key string was truncated or corrupted during database retrieval or base64 decoding.
* **Fix:** Verify key matching and ensure your database column uses `TEXT` or `VARCHAR(8192)` to avoid truncating 4,000+ character base64 keys.

---

### Error: `QuantaCipher Error: AES-GCM tag verification failed`
* **Cause:** The ciphertext, initialization vector (nonce), or authentication tag in the envelope was modified in transit.
* **Fix:** Check that no intermediary proxy or serialization logic altered the envelope string.

---

## 3. Gateway HTTP Errors

### HTTP 400: `Invalid payload format`
* **Cause:** Raw plaintext was posted directly to the Gateway instead of being encrypted first via the SDK.
* **Fix:** The Gateway strictly enforces Zero-Trust. You must run `qc.encryptVault(data)` or `qc.encryptSecure(data, pubKey)` locally before submitting the resulting `QZ_...` envelope string to `/api/v1/ingest`.

---

### HTTP 401: `Unauthorized`
* **Cause:** The `Authorization: Bearer <key>` header was missing, expired, or revoked.
* **Fix:** Verify your API key in the [QuantaCipher Dashboard](https://www.quantacipher.com/dashboard).

---

### HTTP 429: `Quota Exceeded`
* **Cause:** Your monthly secured payload bandwidth or request limit has been reached.
* **Fix:** Upgrade your subscription tier or contact support to request an emergency quota increase.
