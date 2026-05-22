import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { url, message } = await req.json();

        if (!url || !message) {
            return NextResponse.json({ error: 'URL and message are required' }, { status: 400 });
        }

        // Validate webhook URL format
        const isDiscord = url.includes('discord.com/api/webhooks');
        const isSlack = url.includes('hooks.slack.com');

        if (!isDiscord && !isSlack) {
            return NextResponse.json({
                error: 'Invalid webhook URL. Must be a Discord or Slack webhook.'
            }, { status: 400 });
        }

        // Test the webhook
        const payload = isDiscord
            ? { content: `✅ Test: ${message}` }
            : { text: `✅ Test: ${message}` };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok || response.status === 204) {
            return NextResponse.json({
                success: true,
                message: 'Webhook test successful!',
                platform: isDiscord ? 'Discord' : 'Slack'
            });
        } else {
            return NextResponse.json({
                error: 'Webhook test failed. Please check the URL.',
                status: response.status
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('Webhook test error:', error);
        return NextResponse.json({
            error: 'Failed to test webhook',
            details: error.message
        }, { status: 500 });
    }
}
