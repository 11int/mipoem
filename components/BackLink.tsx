"use client";

import { useRouter } from "next/navigation";

/**
 * A "back" link that returns to the previous page (restoring scroll position,
 * Pinterest-style) only when the visitor reached this page by navigating
 * within the site. If they landed here directly (a shared link, a search
 * result, or a typed URL), going "back" would leave mipoem entirely, so it
 * navigates to `href` instead — guaranteeing they always end up on the listing.
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

  function arrivedFromWithinSite(): boolean {
    try {
      return window.history.state?.mipoemInApp === true;
    } catch {
      return false;
    }
  }

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Respect modifier clicks (open in new tab, etc.).
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    if (arrivedFromWithinSite()) {
      e.preventDefault();
      router.back();
    }
    // Otherwise let the normal navigation to `href` happen.
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
