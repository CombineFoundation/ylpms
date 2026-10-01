import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPassword = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
const smtpAuthMethod = process.env.SMTP_AUTH_METHOD?.trim() || "PLAIN";
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== "false",
  },
  auth: {
    user: smtpUser,
    pass: smtpPassword,
    method: smtpAuthMethod,
  },
});

function getSenderAddress() {
  return process.env.SMTP_FROM?.trim() || smtpUser;
}

export async function sendOtpEmail(to: string, code: string) {
  await transporter.sendMail({
    from: `"Youth Leadership Program" <${getSenderAddress()}>`,
    to,
    subject: "Your password reset code",
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 420px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#E8622C; margin-bottom: 4px;">Youth Leadership Program</h2>
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

export async function sendUserCredentialsEmail(
  to: string,
  name: string,
  password: string,
  role: string
) {
  if (!process.env.SMTP_HOST || !smtpUser || !smtpPassword) {
    throw new Error("Email service is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD.");
  }

  try {
    await transporter.verify();
  } catch (error) {
    if (error && typeof error === "object" && "responseCode" in error && error.responseCode === 535) {
      throw new Error(
        `SMTP rejected ${smtpUser}. Check the mailbox password and SMTP_AUTH_METHOD (${smtpAuthMethod}).`
      );
    }
    throw error;
  }

  await transporter.sendMail({
    from: `"Youth Leadership Program" <${getSenderAddress()}>`,
    to,
    subject: "Your Youth Leadership Program account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #333;">
        <h2 style="color:#E8622C; margin-bottom: 8px;">Welcome to Youth Leadership Program</h2>
        <p>Hello ${name},</p>
        <p>Your ${role} account has been created. Use these credentials to sign in:</p>
        <div style="background:#f8fafc; border:1px solid #e5e7eb; padding:16px; margin:20px 0;">
          <p style="margin:6px 0;"><strong>Email:</strong> ${to}</p>
          <p style="margin:6px 0;"><strong>Temporary password:</strong> ${password}</p>
        </div>
        <p>Please change your password after your first sign-in and do not share these credentials.</p>
      </div>
    `,
  });
}