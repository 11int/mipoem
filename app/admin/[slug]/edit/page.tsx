import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPoemBySlug, isValidSlug } from "@/lib/poems";
import { ADMIN_COOKIE, isAdminConfigured, isValidSession } from "@/lib/admin";
import AdminEditForm from "@/components/AdminEditForm";

export const metadata: Metadata = {
  title: "Edit poem — mipoem",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const configured = isAdminConfigured();
  const store = await cookies();
  const authed = configured && isValidSession(store.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <main className="legal-page admin-page">
        <Link href="/admin" className="back-link">
          &larr; back to moderation
        </Link>
        <h1 className="legal-title">Edit poem</h1>
        <p>You need to sign in first.</p>
      </main>
    );
  }

  if (!isValidSlug(slug)) notFound();
  const poem = await getPoemBySlug(slug);
  if (!poem) notFound();

  return (
    <main className="legal-page admin-page">
      <Link href="/admin" className="back-link">
        &larr; back to moderation
      </Link>
      <h1 className="legal-title">Edit poem</h1>
      <p className="legal-updated">{poem.slug}</p>
      <AdminEditForm
        slug={poem.slug}
        initialTitle={poem.title}
        initialAuthor={poem.author}
        initialBody={poem.raw}
      />
    </main>
  );
}
