import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "mipoem — a quiet place for poems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          backgroundColor: "#f6f2ea",
          color: "#2b2622",
        }}
      >
        <div style={{ fontSize: 120, fontWeight: 700, color: "#b14b3b" }}>
          mipoem
        </div>
        <div style={{ fontSize: 36, color: "#6b6258" }}>
          a quiet place for poems
        </div>
      </div>
    ),
    { ...size }
  );
}
