import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'QuantaCipher <noreply@quantacipher.com>';

export async function sendUsageLimitEmail(to: string, plan: string, limit: number) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY missing. Skipping limit email to', to);
        return false;
    }

    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: 'QuantaCipher - API Limit Reached',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
                    <h2 style="color: #111;">API Usage Limit Reached</h2>
                    <p style="color: #444; font-size: 16px; line-height: 24px;">
                        Your QuantaCipher API key has reached its monthly limit of <strong>${limit} requests</strong> on the ${plan} plan.
                    </p>
                    <p style="color: #444; font-size: 16px; line-height: 24px;">
                        To continue securing data with Post-Quantum cryptography, please upgrade your plan in the QuantaCipher dashboard.
                    </p>
                    <p style="margin-top: 32px; color: #666; font-size: 14px;">
                        QuantaCipher • Zero-Trust Security
                    </p>
                </div>
            `,
        });

        if (data.error) {
            console.error('[Email Error] Failed to send usage limit email:', data.error);
            return false;
        }

        console.log(`[Email] Usage limit email sent to ${to}`);
        return true;
    } catch (error) {
        console.error('[Email Error] Critical failure sending email:', error);
        return false;
    }
}
