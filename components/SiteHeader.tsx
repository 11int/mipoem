"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import SubmitPoem from "./SubmitPoem";

// useLayoutEffect runs before the browser paints (so we can cancel the intro
// before it's ever visible), but it warns during SSR — fall back to useEffect
// on the server where it's a no-op anyway.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const INTRO_FLAG = "mipoem:introPlayed";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);
  // Freezes transitions for the first frame on return so the header doesn't
  // visibly morph from its big resting state into the compact navbar.
  const [noAnim, setNoAnim] = useState(false);

  useEffect(() => {
    let ticking = false;
    // requestAnimationFrame throttling keeps the morph in sync with the
    // browser's paint cycle, and the hysteresis (turn into nav at 64px,
    // back to header below 24px) stops it flickering on tiny scrolls.
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 64) return true;
        if (prev && y < 24) return false;
        return prev;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Play the entrance animation only on the first visit of the session. On
  // back/forward navigation (or a refresh) the page re-mounts, so skip the
  // intro and show the header in its resting — or already-scrolled — state
  // immediately, Pinterest-style, with no replayed animation.
  useIsoLayoutEffect(() => {
    const alreadyPlayed = sessionStorage.getItem(INTRO_FLAG) === "1";
    if (alreadyPlayed) {
      document.documentElement.classList.add("intro-done");
      setScrolled(window.scrollY > 64);
      setNoAnim(true);
      setReady(true);
      return;
    }
    sessionStorage.setItem(INTRO_FLAG, "1");
    // Let the intro settle before enabling the scroll morph so the two
    // motions never fight over the same transforms.
    const t = window.setTimeout(() => setReady(true), 3400);
    return () => window.clearTimeout(t);
  }, []);

  // Release the one-frame transition freeze so normal scroll morphing resumes.
  useEffect(() => {
    if (!noAnim) return;
    const r = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => setNoAnim(false))
    );
    return () => window.cancelAnimationFrame(r);
  }, [noAnim]);

  const cls = [
    "site-header",
    noAnim ? "no-anim" : "",
    ready ? "is-ready" : "",
    ready && scrolled ? "is-nav" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={cls}>
        <div className="site-header-inner">
          <h1 className="brand">mipoem</h1>
          <p className="tagline">a quiet place for poems</p>
          <div className="header-cta">
            <SubmitPoem />
          </div>
        </div>
        <div className="divider" aria-hidden="true" />
      </header>
      <div className={`header-spacer${ready && scrolled ? " is-nav" : ""}`} />
    </>
  );
}

