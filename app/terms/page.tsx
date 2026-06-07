import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — mipoem",
  description: "The terms for using mipoem and sharing poems.",
};

export default function TermsPage() {
  return (
    <main className="legal-page">
      <Link href="/" className="back-link">
        &larr; back to all poems
      </Link>

      <h1 className="legal-title">Terms of Service</h1>
      <p className="legal-updated">Last updated: June 7, 2026</p>

      <p>
        mipoem is a small, quiet place for sharing poems. By using the site or
        submitting a poem, you agree to these terms. If you don&apos;t agree,
        please don&apos;t use the site.
      </p>

      <h2>Submitting poems</h2>
      <p>
        When you submit a poem you confirm that you wrote it, or that you have
        the right to share it, and that sharing it here doesn&apos;t infringe
        anyone else&apos;s rights. Submissions are <strong>public</strong> — your
        poem, the name you provide, and the date are visible to everyone and are
        stored in a public repository.
      </p>
      <p>
        You keep ownership of your work. By submitting, you grant mipoem a
        non-exclusive, royalty-free licence to store, display, and distribute it
        on the site.
      </p>

      <h2>Acceptable use</h2>
      <p>Please don&apos;t submit content that:</p>
      <ul>
        <li>is hateful, harassing, threatening, or violent;</li>
        <li>is sexually explicit involving minors, or otherwise illegal;</li>
        <li>infringes copyright or other rights;</li>
        <li>contains spam, advertising, malware, or personal data about others;</li>
        <li>attempts to disrupt or abuse the service.</li>
      </ul>

      <h2>Moderation &amp; removal</h2>
      <p>
        There is no guarantee of review before publication. We may remove any
        submission at any time, for any reason, without notice — including
        content that breaks these terms.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided “as is,” without warranties of any kind. We
        don&apos;t guarantee it will be available, error-free, or that submitted
        poems will be preserved.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, mipoem and its maintainers are not liable
        for any damages arising from your use of the site or content submitted by
        others.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may change. Continued use after a change means you accept the
        updated terms.
      </p>

      <p className="legal-footnote">
        See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </main>
  );
}
