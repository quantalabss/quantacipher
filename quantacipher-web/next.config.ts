import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    turbopack: {},

    // Allow Next.js to handle WASM files (if SDK ever runs server-side)
    webpack(config, { isServer }) {
        // Enable WebAssembly experiments
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            layers: true,
        };

        // Handle .wasm files
        config.module.rules.push({
            test: /\.wasm$/,
            type: "webassembly/async",
        });

        return config;
    },

    // Security headers for production
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-XSS-Protection", value: "1; mode=block" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com", 
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: https:",
                            "connect-src 'self' https://api.quantacipher.com https://api.razorpay.com wss://*.razorpay.com https://*.razorpay.com",
                            "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
