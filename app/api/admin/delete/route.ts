import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminConfigured, isValidSession } from "@/lib/admin";
import { isValidSlug } from "@/lib/poems";
import {
  deleteFiles,
  isGitHubConfigured,
} from "@/lib/github";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  }
  if (!isValidSession(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let slug = "";
  try {
    const body = await req.json();
    slug = typeof body?.slug === "string" ? body.slug : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid poem." }, { status: 400 });
  }

  const relPath = `poems/${slug}.md`;

  try {
    if (isGitHubConfigured()) {
      await deleteFiles([relPath], `chore: remove poem ${slug}`);
    } else {
      // Dev fallback: remove from the local filesystem.
      const full = path.join(process.cwd(), "poems", `${slug}.md`);
      if (path.dirname(full) !== path.join(process.cwd(), "poems")) {
        throw new Error("Invalid path.");
      }
      if (fs.existsSync(full)) fs.unlinkSync(full);
    }
  } catch (err) {
    console.error("Admin delete failed:", err);
    return NextResponse.json({ error: "Could not delete poem." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, pending: isGitHubConfigured() });
}
