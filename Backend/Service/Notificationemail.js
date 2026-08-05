import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to, subject, html) {
  return await resend.emails.send({
    from: "noreply@emsarj.net", // use your verified domain
    to,
    subject,
    html,
  });
}
