import { getPoemBySlug, getRandomPoems } from "@/lib/poems";
import PoemModal from "@/components/PoemModal";
import PoemView from "@/components/PoemView";

export const dynamic = "force-dynamic";

export default async function PoemModalRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  if (!poem) return null;

  const suggestions = getRandomPoems(3, slug);

  return (
    <PoemModal>
      <PoemView poem={poem} suggestions={suggestions} inModal />
    </PoemModal>
  );
}
