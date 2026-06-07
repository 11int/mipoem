"use client";

import { useState } from "react";

export default function SharePoem({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/poems/${slug}`
        : `/poems/${slug}`;

    // Prefer the native share sheet on devices that support it.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${title} — mipoem`, url });
        return;
      } catch {
        // User cancelled or it failed — fall back to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; nothing more we can do gracefully.
    }
  }

  return (
    <button type="button" className="poem-share" onClick={handleShare}>
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
