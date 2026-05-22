import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Monitor from '@/models/Monitor';
import MonitorCheck from '@/models/MonitorCheck';
import { sendAlertEmail } from '@/lib/email';
import { sendWebhookAlert } from '@/lib/notifications';

// This secret implementation prevents unauthorized triggering of the cron
// In production, configure Vercel Cron or use an API key in the header
const CRON_SECRET = process.env.CRON_SECRET || "simulate_cron_secret";

export async function GET(req: Request) {
    // Basic authorization check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const startTime = Date.now();

    try {
        const monitors = await Monitor.find({}); // Fetch all monitors

        console.log(`[CRON] Starting check for ${monitors.length} monitors`);

        // OPTIMIZATION: Process monitors in parallel batches
        // This allows checking 500+ monitors within Vercel's timeout
        const BATCH_SIZE = 20; // Check 20 monitors simultaneously
        const batches = [];

        for (let i = 0; i < monitors.length; i += BATCH_SIZE) {
            batches.push(monitors.slice(i, i + BATCH_SIZE));
        }

        let totalChecked = 0;
        let totalUp = 0;
        let totalDown = 0;

        // REFERENCE DATA: Fetch public chain heights for drift detection
        let ethHeight = 0;
        let solHeight = 0;

        try {
            const [ethRes, solRes] = await Promise.allSettled([
                fetch('https://eth.llamarpc.com', {
                    method: 'POST',
                    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
                    headers: { 'Content-Type': 'application/json' }
                }),
                fetch('https://api.mainnet-beta.solana.com', {
                    method: 'POST',
                    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            if (ethRes.status === 'fulfilled' && ethRes.value.ok) {
                const data = await ethRes.value.json();
                ethHeight = parseInt(data.result, 16);
            }
            if (solRes.status === 'fulfilled' && solRes.value.ok) {
                const data = await solRes.value.json();
                solHeight = data.result;
            }
            console.log(`[CRON] Reference Heights - ETH: ${ethHeight}, SOL: ${solHeight}`);
        } catch (e) {
            console.error('Failed to fetch reference heights', e);
        }

        // Process each batch in parallel
        for (const batch of batches) {
            const batchResults = await Promise.allSettled(
                batch.map(async (monitor) => {
                    const start = Date.now();
                    let status: 'up' | 'down' = 'down';
                    let statusCode = 0;
                    let errorMessage = '';

                    try {
                        // Set a strict timeout
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                        let response;

                        if (monitor.type === 'rpc') {
                            // RPC CHECK Logic
                            const isSolana = monitor.chain === 'solana';
                            const payload = isSolana
                                ? { jsonrpc: "2.0", id: 1, method: "getSlot" }
                                : { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] };

                            response = await fetch(monitor.endpoint, {
                                method: 'POST',
                                body: JSON.stringify(payload),
                                headers: { 'Content-Type': 'application/json' },
                                signal: controller.signal
                            });
                        } else {
                            // Standard HTTP HEAD Check
                            response = await fetch(monitor.endpoint, {
                                method: 'HEAD',
                                signal: controller.signal
                            });
                        }

                        clearTimeout(timeoutId);

                        if (response.ok) {
                            status = 'up';
                            statusCode = response.status;

                            // For RPC, also extract block height
                            if (monitor.type === 'rpc') {
                                try {
                                    const data = await response.json();
                                    if (data.result) {
                                        const blockHeight = typeof data.result === 'string'
                                            ? parseInt(data.result, 16)
                                            : data.result;
                                        monitor.lastBlockHeight = blockHeight;

                                        // Calculate Drift
                                        if (monitor.chain === 'solana' && solHeight > 0) {
                                            monitor.blockDrift = Math.max(0, solHeight - blockHeight);
                                        } else if ((!monitor.chain || monitor.chain === 'evm') && ethHeight > 0) {
                                            monitor.blockDrift = Math.max(0, ethHeight - blockHeight);
                                        }
                                    }
                                } catch (e) {
                                    console.error('Failed to parse RPC response', e);
                                }
                            }
                        } else {
                            statusCode = response.status;
                            errorMessage = `HTTP ${response.status}`;
                        }
                    } catch (error: any) {
                        errorMessage = error.message || 'Request failed';
                        if (error.name === 'AbortError') {
                            errorMessage = 'Timeout (>10s)';
                        }
                    }

                    const latency = Date.now() - start;

                    // Update monitor status
                    const previousStatus = monitor.status;
                    monitor.status = status;
                    monitor.lastLatency = latency;
                    monitor.lastChecked = new Date();
                    await monitor.save();

                    // Save check history (async, don't wait)
                    MonitorCheck.create({
                        monitorId: monitor._id,
                        status,
                        latency,
                        statusCode,
                        errorMessage,
                        timestamp: new Date()
                    }).catch(err => console.error('Failed to save check:', err));

                    // Send alert if status changed from up to down
                    if (previousStatus === 'up' && status === 'down') {
                        // Send alerts asynchronously (don't block)
                        if (monitor.alertType === 'email') {
                            sendAlertEmail(
                                monitor.userEmail,
                                monitor.name,
                                monitor.endpoint,
                                errorMessage
                            ).catch(err => console.error('Email alert failed:', err));
                        } else if (monitor.alertType === 'webhook' && monitor.webhookUrl) {
                            sendWebhookAlert(
                                monitor.webhookUrl,
                                monitor.name,
                                monitor.endpoint,
                                errorMessage
                            ).catch(err => console.error('Webhook alert failed:', err));
                        }
                    }

                    return { status, latency, name: monitor.name };
                })
            );

            // Count results
            batchResults.forEach(result => {
                totalChecked++;
                if (result.status === 'fulfilled' && result.value.status === 'up') {
                    totalUp++;
                } else {
                    totalDown++;
                }
            });
        }

        const duration = Date.now() - startTime;

        console.log(`[CRON] Completed ${totalChecked} checks in ${duration}ms`);
        console.log(`[CRON] Up: ${totalUp}, Down: ${totalDown}`);

        return NextResponse.json({
            success: true,
            checked: totalChecked,
            up: totalUp,
            down: totalDown,
            duration: `${duration}ms`,
            avgCheckTime: totalChecked > 0 ? `${Math.round(duration / totalChecked)}ms` : '0ms'
        });

    } catch (error: any) {
        console.error('[CRON] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
