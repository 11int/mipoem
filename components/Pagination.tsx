import Link from "next/link";

// Server-rendered page navigation. Keeps the home page light by linking to
// ?page=N rather than ever rendering every poem at once.
function pageHref(page: number): string {
  return page <= 1 ? "/" : `/?page=${page}`;
}

/** A compact window of page numbers around the current page. */
function pageWindow(current: number, total: number): number[] {
  const span = 1; // pages on each side of the current one
  const pages: number[] = [];
  const start = Math.max(1, current - span);
  const end = Math.min(total, current + span);
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

export default function Pagination({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  if (total <= 1) return null;

  const window = pageWindow(current, total);
  const showFirst = window[0] > 1;
  const showLast = window[window.length - 1] < total;

  return (
    <nav className="pagination" aria-label="Pages">
      {current > 1 ? (
        <Link className="page-link page-arrow" href={pageHref(current - 1)} rel="prev">
          &larr; Prev
        </Link>
      ) : (
        <span className="page-link page-arrow is-disabled" aria-hidden="true">
          &larr; Prev
        </span>
      )}

      {showFirst && (
        <>
          <Link className="page-link" href={pageHref(1)}>
            1
          </Link>
          {window[0] > 2 && <span className="page-gap">…</span>}
        </>
      )}

      {window.map((p) =>
        p === current ? (
          <span key={p} className="page-link is-current" aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} className="page-link" href={pageHref(p)}>
            {p}
          </Link>
        )
      )}

      {showLast && (
        <>
          {window[window.length - 1] < total - 1 && (
            <span className="page-gap">…</span>
          )}
          <Link className="page-link" href={pageHref(total)}>
            {total}
          </Link>
        </>
      )}

      {current < total ? (
        <Link className="page-link page-arrow" href={pageHref(current + 1)} rel="next">
          Next &rarr;
        </Link>
      ) : (
        <span className="page-link page-arrow is-disabled" aria-hidden="true">
          Next &rarr;
        </span>
      )}
    </nav>
  );
}
