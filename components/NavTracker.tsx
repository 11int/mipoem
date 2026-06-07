"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Marks history entries that were reached by navigating *within* the site.
 * A fresh document load (someone opening a shared poem link directly, or
 * arriving from Google) leaves its first entry unmarked, so components like
 * BackLink know that going "back" would leave mipoem and can send the visitor
 * to the listing instead.
 */
export default function NavTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      // The entry the document loaded on — its previous entry (if any) is
      // external, so leave it unmarked.
      isFirst.current = false;
      return;
    }
    try {
      const state = window.history.state ?? {};
      if (!state.mipoemInApp) {
        window.history.replaceState({ ...state, mipoemInApp: true }, "");
      }
    } catch {
      /* history may be unavailable in some embedded contexts */
    }
  }, [pathname]);

  return null;
}
