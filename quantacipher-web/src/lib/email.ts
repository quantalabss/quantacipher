import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAlertEmail(to: string, monitorName: string, endpoint: string, errorMessage?: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email not sent.");
    return;
  }

  const subject = `[QuantaCipher Alert] ${monitorName} is DOWN`;

  const html = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #d93025;">🚨 Monitor Alert: System Down</h2>
        <p>Your monitor <strong>${monitorName}</strong> is currently unreachable.</p>
        <p><strong>Endpoint:</strong> ${endpoint}</p>
        <p><strong>Error:</strong> ${errorMessage || 'Connection failed'}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <a href="https://quantacipher.com/dashboard" style="background-color: #d93025; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px;">View Dashboard</a>
      </div>
    `;

  try {
    const data = await resend.emails.send({
      from: 'QuantaCipher Alerts <alerts@quantacipher.com>',
      to: to,
      subject: subject,
      html: html,
    });
    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
