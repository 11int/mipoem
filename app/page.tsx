import Link from "next/link";
import { getAllPoems } from "@/lib/poems";
import PoemCard from "@/components/PoemCard";
import SiteHeader from "@/components/SiteHeader";
import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const poems = getAllPoems();

  const totalPages = Math.max(1, Math.ceil(poems.length / PAGE_SIZE));
  const requested = Number((await searchParams)?.page);
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), totalPages)
    : 1;
  const start = (page - 1) * PAGE_SIZE;
  const visible = poems.slice(start, start + PAGE_SIZE);

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
          <>
            <section className="masonry">
              {visible.map((poem) => (
                <PoemCard key={poem.slug} poem={poem} />
              ))}
            </section>
            <Pagination current={page} total={totalPages} />
          </>
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
