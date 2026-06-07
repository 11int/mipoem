import Link from "next/link";
import { getAllPoems } from "@/lib/poems";
import PoemCard from "@/components/PoemCard";
import SiteHeader from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function Home() {
  const poems = getAllPoems();

  return (
    <main className="home">
      <SiteHeader />

      <div className="container">
        {poems.length === 0 ? (
          <p style={{ textAlign: "center", fontFamily: "var(--font-body)" }}>
            No poems yet. Add a <code>.md</code> file to the{" "}
            <code>/poems</code> folder.
          </p>
        ) : (
          <section className="masonry">
            {poems.map((poem) => (
              <PoemCard key={poem.slug} poem={poem} />
            ))}
          </section>
        )}
      </div>

      <footer className="site-footer">
        <p>copyright &copy; {new Date().getFullYear()} mipoem.</p>
        <p className="footer-links">
          <Link href="/terms">Terms</Link>
          <span aria-hidden="true"> &middot; </span>
          <Link href="/privacy">Privacy</Link>
        </p>
      </footer>
    </main>
  );
}
