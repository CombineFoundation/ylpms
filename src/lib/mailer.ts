import nodemailer from "nodemailer";

// Sends real emails through Gmail SMTP.
//
// Setup (one-time):
//   1. Turn on 2-Step Verification on the Gmail account you want to send from:
//      https://myaccount.google.com/security
//   2. Create an App Password (NOT your normal Gmail password):
//      https://myaccount.google.com/apppasswords
//   3. Add these to a .env.local file in your project root:
//        GMAIL_USER=youraddress@gmail.com
//        GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   (the 16-char app password)
//
// Prefer a transactional email service (Resend, SendGrid, Postmark, SES) for
// production — Gmail SMTP has sending limits and is best for dev/testing.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOtpEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"Youth Leaders Program" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your password reset code",
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#E8622C; margin-bottom: 4px;">Youth Leaders Program</h2>
        <p style="color:#333; font-size: 14px;">
          Use the code below to reset your password. It expires in 5 minutes.
        </p>
        <p style="font-size: 34px; font-weight: 700; letter-spacing: 10px; color: #1B2540; margin: 24px 0;">
          ${code}
        </p>
        <p style="color:#888; font-size: 12px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}