import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/mongodb';
import Monitor from '@/models/Monitor';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Security: Only allow authenticated users to proxy requests
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { url, monitorId } = await req.json();

        if (!url) return NextResponse.json({ error: "URL missing" }, { status: 400 });

        const start = Date.now();
        let status = 'down';
        let latency = 0;
        let errorMsg = '';

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'User-Agent': 'QuantaCipher-Monitor/1.0' },
                signal: AbortSignal.timeout(5000) // 5s timeout
            });

            latency = Date.now() - start;
            status = res.ok ? 'up' : 'down'; // You might consider 400s as 'up' but error, depends on logic. Usually 2xx is UP.
            if (!res.ok) errorMsg = `${res.status} ${res.statusText}`;

        } catch (err: any) {
            latency = Date.now() - start;
            status = 'down';
            errorMsg = err.message || "Connection Failed";
        }

        // If monitorId provided, update DB
        if (monitorId) {
            await dbConnect();
            await Monitor.findByIdAndUpdate(monitorId, {
                status,
                lastLatency: latency,
                lastChecked: new Date()
            });
        }

        return NextResponse.json({ status, latency, error: errorMsg });

    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
