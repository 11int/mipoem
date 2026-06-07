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
        made with <span className="heart">&hearts;</span> &middot; mipoem
      </footer>
    </main>
  );
}
