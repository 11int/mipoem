import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mipoem — a quiet place for poems",
  description:
    "mipoem is a Pinterest-style collection of poems. Browse, read, and breathe.",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Text:ital@0;1&family=Italiana&family=Radley:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="mesh-bg" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="mesh-noise" />
        </div>
        {children}
        {modal}
      </body>
    </html>
  );
}
