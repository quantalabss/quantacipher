import { NextResponse } from "next/server";
import { QuantaCipher } from "quantacipher-sdk";

export async function POST(req: Request) {
    try {
        const { plaintext } = await req.json();

        if (!plaintext) {
            return NextResponse.json({ error: "Plaintext is required" }, { status: 400 });
        }

        const API_KEY = process.env.QUANTA_API_KEY || "qz_test_demo123";
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000/api/v1/ingest";

        const sdk = new QuantaCipher({
            apiKey: API_KEY,
            gatewayUrl: GATEWAY_URL
        });

        const start = Date.now();
        
        // Encrypt locally using WASM Kyber-1024
        const ciphertext = sdk.encryptVault(plaintext);
        
        // Send the zero-trust ciphertext to the Gateway
        const receipt = await sdk.sendToGateway(ciphertext, { source: "demo_page" });
        
        const latencyMs = Date.now() - start;

        return NextResponse.json({
            success: true,
            receiptId: receipt.id,
            algorithm: receipt.encryptionScheme,
            ciphertext: ciphertext,
            latencyMs: latencyMs,
        });

    } catch (error: any) {
        console.error("Encryption failed:", error);
        
        if (error.message?.includes("429") || error.message?.includes("Too Many Requests") || error.message?.includes("limit")) {
            return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
        }
        
        return NextResponse.json({ error: error.message || "Failed to connect to encryption service" }, { status: 500 });
    }
}
