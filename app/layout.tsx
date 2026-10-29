import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteAnalytics } from "@/components/presenter/SiteAnalytics";
import { baseMetadata } from "@/lib/seo";
import "@/styles/app.css";

/** The talk's card with no canonical: pages set their own in full (lib/seo.ts, PRD r7 10.1). */
export const metadata: Metadata = baseMetadata();

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
