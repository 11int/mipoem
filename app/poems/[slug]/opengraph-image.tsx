import { ImageResponse } from "next/og";
import { getPoemBySlug } from "@/lib/poems";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const alt = "A poem on mipoem";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const poem = await getPoemBySlug(slug);

  const title = poem?.title ?? "mipoem";
  const author = poem?.author ?? "";
  const excerpt = poem
    ? poem.raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join("\n")
    : "a quiet place for poems";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f6f2ea",
          color: "#2b2622",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#6b6258",
              whiteSpace: "pre-wrap",
              maxWidth: "900px",
            }}
          >
            {excerpt}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #e2d9c8",
            paddingTop: "28px",
            fontSize: 28,
          }}
        >
          <span style={{ color: "#6b6258" }}>{author && `by ${author}`}</span>
          <span style={{ color: "#b14b3b", fontWeight: 700 }}>mipoem</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
