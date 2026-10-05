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

// Base URL for links in emails. A localhost value is ignored in production so a
// copied .env never sends users to their own machine; on Vercel we fall back to
// the project's production domain, then the deployment URL.
function getAppUrl() {
  const isLocal = (url: string) => /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(url);
  const configured = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL)?.trim();
  if (configured && !(process.env.NODE_ENV === "production" && isLocal(configured))) {
    return configured.replace(/\/+$/, "");
  }
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) return `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return (configured || "http://localhost:3000").replace(/\/+$/, "");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
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

  const loginUrl = `${getAppUrl()}/login`;

  await transporter.sendMail({
    from: `"Youth Leadership Program" <${getSenderAddress()}>`,
    to,
    subject: "Your Youth Leadership Program account",
    text: [
      `Hello ${name},`,
      `Your ${role} account has been created. Use these credentials to sign in:`,
      `Email: ${to}`,
      `Temporary password: ${password}`,
      `Log in: ${loginUrl}`,
      "Please change your password after your first sign-in and do not share these credentials.",
    ].join("\n\n"),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #333;">
        <h2 style="color:#E8622C; margin-bottom: 8px;">Welcome to Youth Leadership Program</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>Your ${escapeHtml(role)} account has been created. Use these credentials to sign in:</p>
        <div style="background:#f8fafc; border:1px solid #e5e7eb; padding:16px; margin:20px 0;">
          <p style="margin:6px 0;"><strong>Email:</strong> ${escapeHtml(to)}</p>
          <p style="margin:6px 0;"><strong>Temporary password:</strong> ${escapeHtml(password)}</p>
        </div>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
          <tr>
            <td style="border-radius:6px; background:#E8622C;">
              <a href="${loginUrl}" target="_blank" rel="noopener"
                style="display:inline-block; padding:12px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:6px;">
                Log in to YLPMS
              </a>
            </td>
          </tr>
        </table>
        <p style="font-size:12px; color:#888;">
          If the button doesn't work, copy this link into your browser:<br />
          <a href="${loginUrl}" style="color:#E8622C;">${loginUrl}</a>
        </p>
        <p>Please change your password after your first sign-in and do not share these credentials.</p>
      </div>
    `,
  });
}