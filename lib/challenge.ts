import { createHmac, timingSafeEqual } from "crypto";

// A tiny, no-dependency "are you human?" check. We avoid third-party captcha
// services (which need account secrets) by signing a simple arithmetic
// challenge with the existing RATE_LIMIT_SALT. Combined with a honeypot field
// and the per-IP rate limit, this stops the bulk of automated spam without any
// extra configuration.

const WORDS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

// Reject submissions faster than this (bots) or older than this (stale token).
const MIN_AGE_MS = 2000;
const MAX_AGE_MS = 60 * 60 * 1000;

function salt(): string {
  return process.env.RATE_LIMIT_SALT || "mipoem";
}

function sign(answer: number, ts: number): string {
  return createHmac("sha256", salt())
    .update(`${answer}.${ts}`)
    .digest("hex")
    .slice(0, 32);
}

export type Challenge = { question: string; token: string };

/** Creates a fresh math challenge and a signed token that encodes its answer. */
export function createChallenge(): Challenge {
  const a = 1 + Math.floor(Math.random() * 8);
  const b = 1 + Math.floor(Math.random() * 8);
  const ts = Date.now();
  const token = `${ts}.${sign(a + b, ts)}`;
  return { question: `What is ${WORDS[a]} plus ${WORDS[b]}?`, token };
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Verifies that `answer` matches the signed `token` and that the token is
 * within the freshness window. Cannot be forged without the salt.
 */
export function verifyChallenge(token: unknown, answer: unknown): boolean {
  if (typeof token !== "string") return false;

  const numericAnswer =
    typeof answer === "number" ? answer : parseInt(String(answer).trim(), 10);
  if (!Number.isFinite(numericAnswer)) return false;

  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const ts = Number(token.slice(0, dot));
  const sig = token.slice(dot + 1);
  if (!Number.isFinite(ts)) return false;

  const age = Date.now() - ts;
  if (age < MIN_AGE_MS || age > MAX_AGE_MS) return false;

  return safeEqual(sig, sign(numericAnswer, ts));
}
