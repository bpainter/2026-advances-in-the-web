import type { Metadata } from "next";
import { bySlideId, slides, deck } from "@/lib/content";
import { PresenterProvider } from "@/lib/presenter/context";
import { SlidePage } from "@/components/stage/SlidePage";
import { slideMetadata } from "@/lib/seo";
import { RenderedSlide } from "@/components/presenter/RenderedSlide";
import { AudienceView } from "@/components/presenter/AudienceView";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ s?: string; step?: string }>;
}

/**
 * Not indexed (PRD r7, 10.1). A shared link still unfurls as the slide in `?s=`, with a canonical
 * to its `/s/<id>` page, and no JSON-LD.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { s } = await searchParams;
  const slide = (s && bySlideId(s)) || slides[0];
  return { ...slideMetadata(slide), title: `Audience · ${deck.title}`, robots: { index: false, follow: true } };
}

/** Audience window: the stage only, following the shared presenter state (PRD 5.3). */
export default async function PresentPage({ searchParams }: Props) {
  const { s } = await searchParams;
  const slide = (s && bySlideId(s)) || slides[0];
  return (
    <PresenterProvider mode="audience" initialSlideId={slide.id}>
      <RenderedSlide id={slide.id} />
      <AudienceView>
        <SlidePage slide={slide} mode="audience" />
      </AudienceView>
    </PresenterProvider>
  );
}
