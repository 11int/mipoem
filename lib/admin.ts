import crypto from "crypto";

// Lightweight password gate for the unlisted /admin area. The cookie value is
// an HMAC derived from ADMIN_PASSWORD, so it can't be forged without knowing the
// password and we don't need any extra secret. No password set => admin locked.

export const ADMIN_COOKIE = "admin_session";
const COOKIE_LABEL = "mipoem-admin-v1";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function expectedToken(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return crypto.createHmac("sha256", pw).update(COOKIE_LABEL).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Verifies a submitted password against ADMIN_PASSWORD. */
export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return safeEqual(input, pw);
}

/** The cookie value to set after a successful login. */
export function sessionToken(): string | null {
  return expectedToken();
}

/** True if the cookie value represents a valid logged-in session. */
export function isValidSession(token: string | undefined | null): boolean {
  const expected = expectedToken();
  if (!expected || !token) return false;
  return safeEqual(token, expected);
}
