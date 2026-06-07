import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — mipoem",
  description: "What mipoem collects and how it's used.",
};

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <Link href="/" className="back-link">
        &larr; back to all poems
      </Link>

      <h1 className="legal-title">Privacy Policy</h1>
      <p className="legal-updated">Last updated: June 7, 2026</p>

      <p>
        mipoem tries to collect as little as possible. There are no accounts and
        no advertising. This page explains what is collected and why.
      </p>

      <h2>What you submit</h2>
      <p>
        When you share a poem, the poem text, the name you optionally provide,
        and the submission date are stored and shown publicly. They are saved as
        files in a public repository, so treat anything you submit as permanently
        public. Please don&apos;t include private or sensitive personal
        information.
      </p>

      <h2>Spam prevention</h2>
      <p>
        To limit spam, when you submit a poem your IP address is used to enforce
        a posting rate limit. The IP address is <strong>hashed</strong> (a
        one-way fingerprint) before it is stored — the raw IP is not saved. We
        also use a simple math question and a hidden form field to tell humans
        from bots. No third-party captcha or tracking service is used.
      </p>

      <h2>Cookies &amp; analytics</h2>
      <p>
        mipoem does not set tracking cookies and does not run analytics or
        advertising trackers.
      </p>

      <h2>Hosting &amp; logs</h2>
      <p>
        The site is hosted on Vercel and submissions are stored on GitHub. These
        providers may process technical data (such as IP addresses and request
        logs) as part of operating their infrastructure, under their own privacy
        policies.
      </p>

      <h2>Removing your poem</h2>
      <p>
        Want a poem taken down? Reach out and we&apos;ll remove it. Because
        submissions live in a public repository, copies may persist in version
        history or in caches outside our control.
      </p>

      <h2>Changes</h2>
      <p>
        This policy may be updated over time. The “last updated” date above will
        reflect any changes.
      </p>

      <p className="legal-footnote">
        See also our <Link href="/terms">Terms of Service</Link>.
      </p>
    </main>
  );
}
