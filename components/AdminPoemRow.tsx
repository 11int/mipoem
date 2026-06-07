"use client";

import { useState } from "react";
import Link from "next/link";

type Status = "idle" | "confirming" | "deleting" | "removed";

export default function AdminPoemRow({
  slug,
  title,
  author,
  date,
  excerpt,
}: {
  slug: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setStatus("deleting");
    setError(null);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        setStatus("removed");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Could not delete.");
      setStatus("confirming");
    } catch {
      setError("Could not delete.");
      setStatus("confirming");
    }
  }

  if (status === "removed") {
    return (
      <li className="admin-item is-removed">
        <div className="admin-item-main">
          <span className="admin-item-title">{title}</span>
          <span className="admin-item-meta">
            Removed · disappears from the live site once the redeploy finishes
            (about a minute).
          </span>
        </div>
      </li>
    );
  }

  return (
    <li className="admin-item">
      <div className="admin-item-main">
        <span className="admin-item-title">{title}</span>
        <span className="admin-item-meta">
          {author}
          {date && ` · ${date}`}
        </span>
        <span className="admin-item-excerpt">{excerpt}</span>
        {error && <span className="admin-error">{error}</span>}
      </div>
      <div className="admin-item-actions">
        {status === "confirming" ? (
          <span className="admin-confirm">
            <button
              type="button"
              className="admin-link admin-link-danger"
              onClick={handleDelete}
            >
              Confirm
            </button>
            <button
              type="button"
              className="admin-link"
              onClick={() => {
                setStatus("idle");
                setError(null);
              }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <>
            <Link href={`/poems/${slug}`} className="admin-link">
              View
            </Link>
            <Link href={`/admin/${slug}/edit`} className="admin-link">
              Edit
            </Link>
            <button
              type="button"
              className="admin-link admin-link-danger"
              onClick={() => setStatus("confirming")}
              disabled={status === "deleting"}
            >
              {status === "deleting" ? "Deleting…" : "Delete"}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
