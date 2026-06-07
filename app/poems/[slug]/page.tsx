import { notFound } from "next/navigation";
import {
  getAllPoemSlugs,
  getPoemBySlug,
  getRandomPoems,
} from "@/lib/poems";
import PoemView from "@/components/PoemView";
import BackLink from "@/components/BackLink";

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
      <BackLink href="/" className="back-link">
        &larr; back to all poems
      </BackLink>

      <PoemView poem={poem} suggestions={suggestions} />
    </main>
  );
}
