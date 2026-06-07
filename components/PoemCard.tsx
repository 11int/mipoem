import Link from "next/link";
import type { PoemMeta } from "@/lib/poems";

export default function PoemCard({ poem }: { poem: PoemMeta }) {
  return (
    <Link href={`/poems/${poem.slug}`} className="card">
      <h2 className="card-title">{poem.title}</h2>
      <p className="card-excerpt">{poem.excerpt}</p>

      <div className="card-meta">
        <span className="author">{poem.author}</span>
        {poem.date && <span className="date">{poem.date}</span>}
      </div>
    </Link>
  );
}
