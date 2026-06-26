import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'QuantaCipher <noreply@quantacipher.com>';

export async function sendEmail({
    to,
    subject,
    react
}: {
    to: string;
    subject: string;
    react: React.ReactElement;
}) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Email] RESEND_API_KEY not found. Skipping email to', to);
            return { success: false, error: 'No API key' };
        }

        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            react,
        });

        if (data.error) {
            console.error('[Email Error]', data.error);
            return { success: false, error: data.error };
        }

        return { success: true, id: data.data?.id };
    } catch (error) {
        console.error('[Email Error]', error);
        return { success: false, error };
    }
}
