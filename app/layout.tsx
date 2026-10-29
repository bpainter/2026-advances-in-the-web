import type { Metadata } from "next";
import type { ReactNode } from "react";
import { deck } from "@/content/deck";
import { SiteAnalytics } from "@/components/presenter/SiteAnalytics";
import "@/styles/app.css";

export const metadata: Metadata = {
  title: deck.title,
  description: `${deck.event}. ${deck.speaker.name}, ${deck.speaker.title}, ${deck.speaker.org}.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA">
      <body>
        {children}
        {/* Vercel sets VERCEL=1 for its builds and functions; dev, walks and captures never load the script. */}
        {process.env.VERCEL ? <SiteAnalytics /> : null}
      </body>
    </html>
  );
}
