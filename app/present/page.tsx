import type { Metadata } from "next";
import { bySlideId, slides } from "@/lib/content";
import { PresenterProvider } from "@/lib/presenter/context";
import { SlidePage } from "@/components/stage/SlidePage";
import { RenderedSlide } from "@/components/presenter/RenderedSlide";
import { AudienceView } from "@/components/presenter/AudienceView";

export const metadata: Metadata = { title: "Audience · 2026 advances in the web", robots: { index: false } };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ s?: string; step?: string }>;
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
