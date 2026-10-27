import type { Metadata } from "next";
import type { ReactNode } from "react";
import { deck } from "@/content/deck";
import "@/styles/app.css";

export const metadata: Metadata = {
  title: deck.title,
  description: `${deck.event}. ${deck.speaker.name}, ${deck.speaker.title}, ${deck.speaker.org}.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-CA">
      <body>{children}</body>
    </html>
  );
}
