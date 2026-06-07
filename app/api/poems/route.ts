import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { buildPoemFile, writePoemFileLocally } from "@/lib/poems";
import {
  evaluateRateLimit,
  readStoreLocal,
  writeStoreLocal,
  RATE_STORE_PATH,
  type Store,
} from "@/lib/rateLimit";
import { commitFiles, getRepoFileText, isGitHubConfigured } from "@/lib/github";
import { verifyChallenge } from "@/lib/challenge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Hash the IP before it becomes a rate-limit key. The store may be committed to
 * a (possibly public) repo, so raw IPs must never be persisted.
 */
function rateLimitKey(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT || "mipoem";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { author, title, poem } = (body ?? {}) as {
    author?: string;
    title?: string;
    poem?: string;
  };

  // Honeypot: a hidden field real users never see. If it's filled, it's a bot.
  const honeypot = (body as { website?: string } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    // Pretend it worked so bots don't learn they were caught.
    return NextResponse.json({ slug: "", title: "", pending: true }, { status: 201 });
  }

  // Human-verification challenge (signed math question, no third-party service).
  const { answer, token } = (body as { answer?: unknown; token?: unknown }) ?? {};
  if (!verifyChallenge(token, answer)) {
    return NextResponse.json(
      { error: "Verification failed. Please try the question again." },
      { status: 400 }
    );
  }

  if (typeof poem !== "string" || poem.trim().length < 2) {
    return NextResponse.json(
      { error: "Please write a poem first." },
      { status: 400 }
    );
  }

  const useGitHub = isGitHubConfigured();
  const key = rateLimitKey(getClientIp(request));

  // Load + evaluate the rate-limit store (GitHub in prod, disk in dev).
  let store: Store;
  try {
    if (useGitHub) {
      const raw = await getRepoFileText(RATE_STORE_PATH);
      store = raw ? (JSON.parse(raw) as Store) : {};
    } else {
      store = readStoreLocal();
    }
  } catch {
    store = {};
  }

  const limit = evaluateRateLimit(store, key);
  if (!limit.allowed) {
    const minutes = Math.ceil((limit.retryAfterSeconds ?? 0) / 60);
    return NextResponse.json(
      {
        error: `You're posting a bit fast. Try again in about ${minutes} minute${
          minutes === 1 ? "" : "s"
        }.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) },
      }
    );
  }

  // Validate + build the markdown file.
  let built;
  try {
    built = buildPoemFile({
      author: typeof author === "string" ? author : "",
      title: typeof title === "string" ? title : "",
      poem,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save your poem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Persist the poem (and updated rate-limit store).
  try {
    if (useGitHub) {
      await commitFiles(
        [
          { path: built.relPath, content: built.fileContents },
          {
            path: RATE_STORE_PATH,
            content: `${JSON.stringify(limit.nextStore)}\n`,
          },
        ],
        `poem: ${built.title}`
      );
    } else {
      writePoemFileLocally(built);
      writeStoreLocal(limit.nextStore!);
    }
  } catch (err) {
    console.error("Failed to save poem:", err);
    return NextResponse.json(
      { error: "Could not save your poem right now. Please try again." },
      { status: 503 }
    );
  }

  // On GitHub the poem goes live after the redeploy, so flag it as pending.
  return NextResponse.json(
    { slug: built.slug, title: built.title, pending: useGitHub },
    { status: 201 }
  );
}

