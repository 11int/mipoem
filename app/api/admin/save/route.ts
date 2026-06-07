import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminConfigured, isValidSession } from "@/lib/admin";
import {
  buildEditedPoemFile,
  getPoemBySlug,
  isValidSlug,
  writePoemFileLocally,
} from "@/lib/poems";
import { commitFiles, isGitHubConfigured } from "@/lib/github";

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
  let title = "";
  let author = "";
  let poem = "";
  try {
    const body = await req.json();
    slug = typeof body?.slug === "string" ? body.slug : "";
    title = typeof body?.title === "string" ? body.title : "";
    author = typeof body?.author === "string" ? body.author : "";
    poem = typeof body?.poem === "string" ? body.poem : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid poem." }, { status: 400 });
  }

  // Preserve the existing date/tags from the current file.
  const existing = await getPoemBySlug(slug);
  if (!existing) {
    return NextResponse.json({ error: "Poem not found." }, { status: 404 });
  }

  let built;
  try {
    built = buildEditedPoemFile({
      slug,
      title,
      author,
      poem,
      date: existing.date,
      tags: existing.tags,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid poem.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (isGitHubConfigured()) {
      await commitFiles(
        [{ path: built.relPath, content: built.fileContents }],
        `edit: ${built.title}`
      );
    } else {
      writePoemFileLocally(built);
    }
  } catch (err) {
    console.error("Admin save failed:", err);
    return NextResponse.json({ error: "Could not save poem." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, pending: isGitHubConfigured() });
}
