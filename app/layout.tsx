import type { Metadata } from "next";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import { SiteAnalytics } from "@/components/presenter/SiteAnalytics";
import { PRELOAD_FONTS } from "@/lib/fonts";
import { baseMetadata } from "@/lib/seo";
import "@/styles/app.css";

/** The talk's card with no canonical: pages set their own in full (lib/seo.ts, PRD r7 10.1). */
export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: ReactNode }) {
  // Regular and Bold start at HTML parse instead of after the stylesheet (docs/PRD-perf.md, P1-FONTS).
  for (const href of PRELOAD_FONTS) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    // The reader's text view sets data-text-view on <html> before hydration (PRD-perf P2-TEXT,
    // components/page/TextViewBoot.tsx); this element only, so the attribute is not a mismatch.
    <html lang="en-CA" suppressHydrationWarning>
      <body>
        {children}
        {/* Vercel sets VERCEL=1 for its builds and functions; dev, walks and captures never load the script. */}
        {process.env.VERCEL ? <SiteAnalytics /> : null}
      </body>
    </html>
  );
}
