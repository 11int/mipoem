"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * A "back" link that returns to the previous page (restoring scroll position,
 * Pinterest-style) when the visitor arrived from within the site. If they
 * landed here directly (e.g. opened the link in a new tab), it falls back to
 * a normal navigation to `href` so the link always works.
 */
export default function BackLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // history.length > 1 means there's a prior entry to return to in this tab.
    setCanGoBack(window.history.length > 1);
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Respect modifier clicks (open in new tab, etc.).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    if (canGoBack) {
      e.preventDefault();
      router.back();
    }
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
