import type { Metadata } from "next";
import { slides } from "@/lib/content";
import { SlidePage } from "@/components/stage/SlidePage";
import { ReadingView } from "@/components/page/ReadingView";
import { TextViewBoot } from "@/components/page/TextViewBoot";
import { jsonLdHtml, siteMetadata, talkJsonLd } from "@/lib/seo";

export const metadata: Metadata = siteMetadata();

/** `/` renders slide 1; the stage rewrites the URL to `/s/[id]` on the client (PRD 3). */
export default function HomePage() {
  const first = slides[0];
  return (
    <>
      {/* The talk graph (PRD r7, 10.3). React does not hoist inline scripts; crawlers read it anywhere. */}
      {/* eslint-disable-next-line react/no-danger -- JSON-LD needs raw JSON; jsonLdHtml builds it from content and escapes "<" (Next's documented pattern). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(talkJsonLd()) }} />
      {/* The reader's text view (PRD-perf P2-TEXT), as on /s/<id>. */}
      <TextViewBoot />
      <ReadingView slide={first} total={slides.length} />
      <SlidePage slide={first} mode="reader" canonicalPath={`/s/${first.id}`} />
    </>
  );
}
