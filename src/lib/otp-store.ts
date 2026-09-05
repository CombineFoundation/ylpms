type OtpRecord = {
  code: string;
  expiresAt: number;
  attempts: number;
};

const OTP_TTL_MS = 5 * 60 * 1000; // codes are valid for 5 minutes
const MAX_ATTEMPTS = 5; // lock out after 5 wrong guesses

// NOTE: this is an in-memory store — it works great for local dev and a
// single long-running Node server. It will NOT persist across serverless
// function invocations (e.g. on Vercel) because each request may hit a
// different instance. For production, swap this out for:
//   - Redis / Upstash / Vercel KV, or
//   - a database table (e.g. Postgres) with an expires_at column
// The function signatures below are the only thing you'd need to keep.
const store = new Map<string, OtpRecord>();

export function setOtp(email: string, code: string) {
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

export function verifyOtp(
  email: string,
  code: string
): { valid: boolean; message?: string } {
  const key = email.toLowerCase();
  const record = store.get(key);

  if (!record) {
    return {
      valid: false,
      message: "No verification code found. Please request a new one.",
    };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key);
    return {
      valid: false,
      message: "This code has expired. Please request a new one.",
    };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return {
      valid: false,
      message: "Too many incorrect attempts. Please request a new code.",
    };
  }

  record.attempts += 1;

  if (record.code !== code) {
    return { valid: false, message: "Incorrect code. Please try again." };
  }

  store.delete(key);
  return { valid: true };
}