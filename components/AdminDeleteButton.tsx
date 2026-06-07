"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDeleteButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Could not delete.");
      setBusy(false);
    } catch {
      setError("Could not delete.");
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <span className="admin-confirm">
        <button
          type="button"
          className="admin-link admin-link-danger"
          onClick={handleDelete}
          disabled={busy}
          title={`Delete “${title}”`}
        >
          {busy ? "Deleting…" : "Confirm"}
        </button>
        <button
          type="button"
          className="admin-link"
          onClick={() => setConfirming(false)}
          disabled={busy}
        >
          Cancel
        </button>
        {error && <span className="admin-error">{error}</span>}
      </span>
    );
  }

  return (
    <button
      type="button"
      className="admin-link admin-link-danger"
      onClick={() => setConfirming(true)}
    >
      Delete
    </button>
  );
}
