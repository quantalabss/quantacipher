export default {
    async scheduled(event, env, ctx) {
        console.log("Cron trigger fired!");

        const VERCEL_API_URL = "https://rpcwatch.vercel.app/api/cron/check-all";
        const CRON_SECRET = env.CRON_SECRET; // Set this in Cloudflare dashboard

        // Function to run the check
        const runCheck = async () => {
            try {
                const response = await fetch(VERCEL_API_URL, {
                    headers: {
                        "Authorization": `Bearer ${CRON_SECRET}`,
                    },
                });
                console.log(`Check Status: ${response.status}`);
            } catch (err) {
                console.error("Check Failed:", err);
            }
        };

        // LOGIC: To achieve ~10s intervals using a 1-minute generic cron:
        // We run the check immediately, then wait 10s and run again, repeat.
        // Cloudflare workers have plenty of CPU time (10ms) but long wall-clock time (30s on free)
        // On Free plan, 30s limit might be tight for 6 checks, so we'll do 3 checks (every 20s) safely.
        // Or just run once per minute for safety on free tier.

        // For this MVP, let's just run it ONCE securely.
        // Use `ctx.waitUntil` to ensure it finishes.
        ctx.waitUntil(runCheck());
    },
};
