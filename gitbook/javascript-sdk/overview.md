# JavaScript / TypeScript SDK Overview

The `@quantalabss/quantacipher-sdk` package enables developers to execute NIST-standard post-quantum cryptography natively within **Node.js**, **Next.js**, **TypeScript**, and modern browser runtimes.

All cryptographic operations are powered by `@quantalabss/quantacipher-wasm`, a compiled WebAssembly binary built from our constant-time Rust core.

---

## 1. Installation

Install the package via your preferred package manager:

```bash
npm install @quantalabss/quantacipher-sdk
# or
pnpm add @quantalabss/quantacipher-sdk
# or
yarn add @quantalabss/quantacipher-sdk
```

The package includes TypeScript definitions (`.d.ts`) out of the box.

---

## 2. Bundler Configuration & Environment Setup

Because the SDK embeds high-performance WebAssembly, modern bundlers may require a minor configuration flag to permit asynchronous WASM loading.

### A. Next.js (App Router & Pages Router)

In your `next.config.ts` (or `next.config.js`), enable `asyncWebAssembly`:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
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

### B. Vite (React / Vue / Svelte)

In Vite applications, install the `vite-plugin-wasm` plugin or configure assets:

```bash
npm install -D vite-plugin-wasm vite-plugin-top-level-await
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
});
```

### C. Pure Node.js (CommonJS & ESM)

The SDK supports both ES Modules (`import`) and CommonJS (`require`):

```javascript
// Node.js (ESM)
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

// Node.js (CommonJS)
const { QuantaCipher } = require('@quantalabss/quantacipher-sdk');
```

---

## 3. Client Initialization

Instantiate the `QuantaCipher` class with your API key:

```typescript
import { QuantaCipher } from '@quantalabss/quantacipher-sdk';

const qc = new QuantaCipher({
  apiKey: process.env.QUANACIPHER_API_KEY || 'qz_live_your_key_here',
  // gatewayUrl: 'https://api.quantacipher.com/v1/ingest', // Optional override
});
```

### Verification Methods:

```typescript
// Check the underlying WASM engine version
console.log('Engine Version:', qc.getVersion());

// Verify dual-mode (KEM + Sign) support is active
console.log('Dual Mode Ready:', qc.isDualModeAvailable());
```

---

## 4. Next Steps

Explore the individual operational mode guides:
* [Mode 1: Vault Mode](vault-mode.md) — Permanent sealing of compliance & audit logs.
* [Mode 2: Secure Mode](secure-mode.md) — End-to-end encrypted messaging & storage.
* [Mode 3: Signing Module](signing-module.md) — Digital signatures with ML-DSA & Falcon.
* [Complete API Reference](api-reference.md) — Full method signatures, interfaces, and options.
