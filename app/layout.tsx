import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import NavTracker from "@/components/NavTracker";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "mipoem — a quiet place for poems",
  description:
    "mipoem is a Pinterest-style collection of poems. Browse, read, and breathe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
        {/* Runs before first paint: if the intro already played this session,
            mark the document so the entrance animation is skipped with no flash
            on a full page load/refresh. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('mipoem:introPlayed')==='1'){document.documentElement.classList.add('intro-done')}}catch(e){}",
          }}
        />
      </head>
      <body>
        <NavTracker />
        <div className="mesh-bg" aria-hidden="true">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="mesh-noise" />
        </div>
        {children}
      </body>
    </html>
  );
}
