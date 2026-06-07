"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminEditForm({
  slug,
  initialTitle,
  initialAuthor,
  initialBody,
}: {
  slug: string;
  initialTitle: string;
  initialAuthor: string;
  initialBody: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [poem, setPoem] = useState(initialBody);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, author, poem }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        router.refresh();
        return;
      }
      setError(data?.error || "Could not save.");
    } catch {
      setError("Could not save.");
    } finally {
      setBusy(false);
    }
  }

  if (saved) {
    return (
      <div className="poem-posted">
        <p className="posted-title">Saved.</p>
        <p className="posted-sub">
          Your change is committed. On the live site it appears after the
          redeploy finishes (about a minute).
        </p>
        <Link href="/admin" className="btn-primary">
          Back to moderation
        </Link>
      </div>
    );
  }

  return (
    <form className="poem-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Author
        <input value={author} onChange={(e) => setAuthor(e.target.value)} />
      </label>
      <label>
        Poem
        <textarea
          rows={12}
          value={poem}
          onChange={(e) => setPoem(e.target.value)}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <Link href="/admin" className="btn-ghost">
          Cancel
        </Link>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
