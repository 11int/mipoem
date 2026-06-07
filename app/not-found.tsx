import Link from "next/link";

export default function NotFound() {
  return (
    <main className="poem-page" style={{ textAlign: "center" }}>
      <h1 className="poem-title">Lost the thread</h1>
      <p className="poem-byline">This poem couldn&apos;t be found.</p>
      <Link href="/" className="back-link">
        &larr; back to all poems
      </Link>
    </main>
  );
}
