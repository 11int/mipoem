import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getAllPoems } from "@/lib/poems";
import { ADMIN_COOKIE, isAdminConfigured, isValidSession } from "@/lib/admin";
import AdminLogin from "@/components/AdminLogin";
import AdminLogout from "@/components/AdminLogout";
import AdminPoemRow from "@/components/AdminPoemRow";

// Unlisted page: nothing links here and search engines are told to skip it.
// Edit and delete happen in-app via the server-side GitHub token, so no
// github.com URLs are exposed. Access is gated by ADMIN_PASSWORD.
export const metadata: Metadata = {
  title: "Moderation — mipoem",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = isAdminConfigured();
  const store = await cookies();
  const authed = configured && isValidSession(store.get(ADMIN_COOKIE)?.value);

  if (!configured) {
    return (
      <main className="legal-page admin-page">
        <Link href="/" className="back-link">
          &larr; back to all poems
        </Link>
        <h1 className="legal-title">Moderation</h1>
        <p>
          This area is locked. Set an <code>ADMIN_PASSWORD</code> environment
          variable to enable it.
        </p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="legal-page admin-page">
        <Link href="/" className="back-link">
          &larr; back to all poems
        </Link>
        <h1 className="legal-title">Moderation</h1>
        <p className="legal-updated">Enter the password to continue.</p>
        <AdminLogin />
      </main>
    );
  }

  const poems = getAllPoems();

  return (
    <main className="legal-page admin-page">
      <Link href="/" className="back-link">
        &larr; back to all poems
      </Link>

      <div className="admin-head">
        <h1 className="legal-title">Moderation</h1>
        <AdminLogout />
      </div>
      <p className="legal-updated">
        {poems.length} poem{poems.length === 1 ? "" : "s"}
      </p>

      {poems.length === 0 ? (
        <p>No poems yet.</p>
      ) : (
        <ul className="admin-list">
          {poems.map((poem) => (
            <AdminPoemRow
              key={poem.slug}
              slug={poem.slug}
              title={poem.title}
              author={poem.author}
              date={poem.date}
              excerpt={poem.excerpt}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
