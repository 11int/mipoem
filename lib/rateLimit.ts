import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const storeFile = path.join(dataDir, "rate-limits.json");

/** Repo-relative path used when persisting the store to GitHub. */
export const RATE_STORE_PATH = "data/rate-limits.json";

// Limits: keep it simple but spam-resistant.
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_PER_HOUR = 3;
const MAX_PER_DAY = 10;

export type Store = Record<string, number[]>;

export type RateResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
  /** The store to persist when the request is allowed. */
  nextStore?: Store;
};

/**
 * Pure rate-limit evaluation: given the current store and a key, decide if the
 * request is allowed and return the store that should be persisted. No IO, so
 * it works the same whether the store lives on disk (dev) or in GitHub (prod).
 */
export function evaluateRateLimit(
  store: Store,
  key: string,
  now: number = Date.now()
): RateResult {
  const recent = (store[key] ?? []).filter((t) => now - t < DAY);
  const lastHour = recent.filter((t) => now - t < HOUR);

  if (lastHour.length >= MAX_PER_HOUR) {
    const oldest = Math.min(...lastHour);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((HOUR - (now - oldest)) / 1000),
    };
  }

  if (recent.length >= MAX_PER_DAY) {
    const oldest = Math.min(...recent);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((DAY - (now - oldest)) / 1000),
    };
  }

  recent.push(now);
  const next: Store = { ...store, [key]: recent };

  // Prune stale keys so the persisted store stays small.
  for (const k of Object.keys(next)) {
    next[k] = next[k].filter((t) => now - t < DAY);
    if (next[k].length === 0) delete next[k];
  }

  return { allowed: true, nextStore: next };
}

/** Reads the rate-limit store from the local filesystem (dev only). */
export function readStoreLocal(): Store {
  try {
    const raw = fs.readFileSync(storeFile, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

/** Writes the rate-limit store to the local filesystem (dev only). */
export function writeStoreLocal(store: Store): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(storeFile, JSON.stringify(store), "utf8");
}
