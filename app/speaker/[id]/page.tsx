import type { Metadata } from "next";
import { bySlideId, neighbours, slides, deck, sections } from "@/lib/content";
import { SlidePage } from "@/components/stage/SlidePage";
import { slideMetadata } from "@/lib/seo";
import { speakerWindowTitle } from "@/lib/presenter/titles";
import { RenderedSlide } from "@/components/presenter/RenderedSlide";
import { SpeakerView } from "@/components/presenter/SpeakerView";

/**
 * The speaker window, prerendered once per slide (docs/PRD-perf.md, P1-PRERENDER), as the audience
 * window is. The address stays `/speaker?s=<id>`: next.config.ts rewrites it here before the
 * filesystem routes, and bare `/speaker` to the first slide. `step`, `glass` and `rehearse` are
 * read on the client from `window.location` (`rehearse` by `SpeakerShell`). An unknown id renders
 * on demand as the first slide, as `?s=` always has.
 */
interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return slides.map((s) => ({ id: s.id }));
}

/**
 * Not indexed (PRD r7, 10.1). A shared link still unfurls as the slide, with a canonical to its
 * `/s/<id>` page, and no JSON-LD. The title is the window's only one (a11y L4 and L7); the App
 * Router updates `document.title` on each move.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const slide = bySlideId(id) ?? slides[0];
  return { ...slideMetadata(slide), title: speakerWindowTitle(slide, slides.length, deck.title), robots: { index: false, follow: true } };
}

/**
 * Speaker window: current and next previews and notes (PRD 5.2). The provider, the controls and
 * the timer live in the layout, so they outlast this page across slide moves.
 */
export default async function SpeakerPage({ params }: Props) {
  const { id } = await params;
  const slide = bySlideId(id) ?? slides[0];
  const { next } = neighbours(slide.id);
  return (
    <>
      <RenderedSlide id={slide.id} />
      <SpeakerView
        slide={slide}
        next={next}
        total={slides.length}
        sectionPosition={slide.demoSection ? { n: sections.findIndex((s) => s.id === slide.demoSection!.id) + 1, of: sections.length } : undefined}
        current={<SlidePage slide={slide} mode="speaker-preview" embedded />}
        nextPreview={next ? <SlidePage slide={next} mode="speaker-preview" embedded passive /> : null}
      />
    </>
  );
}
