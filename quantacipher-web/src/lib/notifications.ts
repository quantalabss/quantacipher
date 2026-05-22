
export async function sendWebhookAlert(webhookUrl: string, monitorName: string, endpoint: string, errorMessage?: string) {
    if (!webhookUrl) return;

    const status = 'down'; // Webhooks are only sent on failures
    const color = 0xd93025; // Red

    // Detect if Discord or Slack based on URL structure
    const isDiscord = webhookUrl.includes("discord");
    const isSlack = webhookUrl.includes("hooks.slack.com");

    try {
        if (isDiscord) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: "QuantaCipher Monitor",
                    embeds: [{
                        title: `🚨 Monitor DOWN: ${monitorName}`,
                        color: color,
                        description: `**Endpoint:** ${endpoint}\n**Error:** ${errorMessage || 'Unknown'}\n**Time:** ${new Date().toLocaleString()}`,
                        footer: { text: "QuantaCipher Alert System" }
                    }]
                })
            });
        } else if (isSlack) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `*🚨 Monitor DOWN: ${monitorName}*`,
                    attachments: [{
                        color: "#d93025",
                        fields: [
                            { title: "Endpoint", value: endpoint, short: false },
                            { title: "Error", value: errorMessage || 'Unknown', short: false },
                            { title: "Time", value: new Date().toLocaleString(), short: true }
                        ]
                    }]
                })
            });
        }
    } catch (error) {
        console.error("Failed to send webhook alert", error);
    }
}
