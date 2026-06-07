import { NextRequest, NextResponse } from "next/server";
import { createPoem } from "@/lib/poems";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
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

  if (typeof poem !== "string" || poem.trim().length < 2) {
    return NextResponse.json(
      { error: "Please write a poem first." },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    const minutes = Math.ceil((limit.retryAfterSeconds ?? 0) / 60);
    return NextResponse.json(
      {
        error: `You're posting a bit fast. Try again in about ${minutes} minute${
          minutes === 1 ? "" : "s"
        }.`,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 60) } }
    );
  }

  try {
    const created = createPoem({
      author: typeof author === "string" ? author : "",
      title: typeof title === "string" ? title : "",
      poem,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save your poem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
