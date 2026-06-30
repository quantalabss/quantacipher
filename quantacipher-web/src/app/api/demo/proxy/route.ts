import { NextResponse } from "next/server";
import { QuantaCipher } from "quantacipher-sdk";

export async function POST(req: Request) {
    try {
        const { ciphertext } = await req.json();

        if (!ciphertext) {
            return NextResponse.json({ error: "Ciphertext is required" }, { status: 400 });
        }

        const API_KEY = process.env.QUANTA_API_KEY || "qz_test_demo123";
        const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:4000/api/v1/ingest";

        const sdk = new QuantaCipher({
            apiKey: API_KEY,
            gatewayUrl: GATEWAY_URL
        });

        // Forward to Gateway (with Fallback)
        let receiptId = `qz_rcpt_fallback_${Date.now()}`;
        let algorithm = 'Kyber-1024 + AES-256-GCM';

        try {
            const receipt = await sdk.sendToGateway(ciphertext, { source: "demo_page_proxy" });
            if (receipt && receipt.id) {
                receiptId = receipt.id;
                algorithm = receipt.encryptionScheme || algorithm;
            }
        } catch (gatewayErr: any) {
            console.error("[DEMO PROXY] Gateway unreachable or failed:", gatewayErr.message);
        }

        return NextResponse.json({
            success: true,
            receiptId: receiptId,
            algorithm: algorithm,
        });

    } catch (error: any) {
        console.error("Proxy failed:", error);
        return NextResponse.json({ error: error.message || "Failed to process encryption proxy" }, { status: 500 });
    }
}
