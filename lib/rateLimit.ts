import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const storeFile = path.join(dataDir, "rate-limits.json");

// Limits: keep it simple but spam-resistant.
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_PER_HOUR = 3;
const MAX_PER_DAY = 10;

type Store = Record<string, number[]>;

function readStore(): Store {
  try {
    const raw = fs.readFileSync(storeFile, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(storeFile, JSON.stringify(store), "utf8");
}

export type RateResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

/**
 * Records a hit for the given key (IP) and returns whether it is allowed.
 * Uses two sliding windows: per-hour and per-day.
 */
export function checkRateLimit(key: string): RateResult {
  const now = Date.now();
  const store = readStore();

  // Drop timestamps older than a day for this key, and prune empty keys.
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
  store[key] = recent;

  // Opportunistically prune other stale keys to keep the file small.
  for (const k of Object.keys(store)) {
    store[k] = store[k].filter((t) => now - t < DAY);
    if (store[k].length === 0) delete store[k];
  }

  writeStore(store);
  return { allowed: true };
}
