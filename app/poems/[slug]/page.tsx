import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPoemSlugs,
  getPoemBySlug,
  getRandomPoems,
} from "@/lib/poems";
import PoemView from "@/components/PoemView";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllPoemSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);
  if (!poem) return { title: "Poem not found — mipoem" };
  return {
    title: `${poem.title} — mipoem`,
    description: poem.excerpt,
  };
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  if (!poem) {
    notFound();
  }

  const suggestions = getRandomPoems(3, slug);

  return (
    <main className="poem-page">
      <Link href="/" className="back-link">
        &larr; back to all poems
      </Link>

      <PoemView poem={poem} suggestions={suggestions} />
    </main>
  );
}
