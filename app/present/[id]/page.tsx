import type { Metadata } from "next";
import { bySlideId, slides, deck } from "@/lib/content";
import { SlidePage } from "@/components/stage/SlidePage";
import { slideMetadata } from "@/lib/seo";
import { RenderedSlide } from "@/components/presenter/RenderedSlide";
import { speakerSlideName } from "@/lib/presenter/titles";

/**
 * The audience window, prerendered once per slide (docs/PRD-perf.md, P1-PRERENDER), so every open,
 * reload and neighbour prefetch is a CDN hit. The address stays `/present?s=<id>`: next.config.ts
 * rewrites it here before the filesystem routes, and bare `/present` to the first slide. Every
 * other parameter (`step`, `glass`, `capture`, `fade`, `rehearse`) is read on the client from
 * `window.location`, so one prerendered page serves them all. An unknown id renders on demand as
 * the first slide, as `?s=` always has.
 */
interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return slides.map((s) => ({ id: s.id }));
}

/**
 * Not indexed (PRD r7, 10.1). A shared link still unfurls as the slide, with a canonical to its
 * `/s/<id>` page, and no JSON-LD. The title names the slide (a11y L7), and the App Router updates
 * `document.title` on each move.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const slide = bySlideId(id) ?? slides[0];
  // The slide's distinct name (the 13 "What we used to do" pages carry their feature), as the
  // speaker window names it; the title slide's name is the deck's, so it is not repeated.
  const name = speakerSlideName(slide);
  const title = name === deck.title ? `Audience · ${deck.title}` : `Audience · ${name} · ${deck.title}`;
  return { ...slideMetadata(slide), title, robots: { index: false, follow: true } };
}

/**
 * Audience window: the stage only, following the shared presenter state (PRD 5.3). The provider and
 * `AudienceView` live in the layout, so they outlast this page across slide moves.
 */
export default async function PresentPage({ params }: Props) {
  const { id } = await params;
  const slide = bySlideId(id) ?? slides[0];
  return (
    <>
      <RenderedSlide id={slide.id} />
      <SlidePage slide={slide} mode="audience" />
    </>
  );
}
