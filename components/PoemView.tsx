import Link from "next/link";
import type { Poem, PoemMeta } from "@/lib/poems";
import SharePoem from "@/components/SharePoem";

export default function PoemView({
  poem,
  suggestions,
}: {
  poem: Poem;
  suggestions: PoemMeta[];
}) {
  return (
    <div className="poem-layout">
      <article className="poem-article">
        <h1 className="poem-title">{poem.title}</h1>
        <div className="poem-byline-row">
          <p className="poem-byline">
            by {poem.author}
            {poem.date && ` · ${poem.date}`}
          </p>
          <SharePoem slug={poem.slug} title={poem.title} />
        </div>

        <div
          className="poem-body"
          dangerouslySetInnerHTML={{ __html: poem.contentHtml }}
        />
      </article>

      {suggestions.length > 0 && (
        <aside className="suggestions">
          <h3 className="suggestions-title">Keep reading</h3>
          <ul className="suggestions-list">
            {suggestions.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/poems/${s.slug}`}
                  className="suggestion"
                >
                  <span className="suggestion-name">{s.title}</span>
                  <span className="suggestion-excerpt">{s.excerpt}</span>
                  <span className="suggestion-author">{s.author}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
