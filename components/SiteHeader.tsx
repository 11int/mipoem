"use client";

import { useEffect, useState } from "react";
import SubmitPoem from "./SubmitPoem";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Let the intro animation settle before enabling the scroll morph so the
  // two motions never fight over the same transforms.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 3400);
    return () => window.clearTimeout(t);
  }, []);

  const cls = [
    "site-header",
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
