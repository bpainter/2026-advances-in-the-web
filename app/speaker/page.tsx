import type { Metadata } from "next";
import { bySlideId, neighbours, slides, deck } from "@/lib/content";
import { PresenterProvider } from "@/lib/presenter/context";
import { SlidePage } from "@/components/stage/SlidePage";
import { RenderedSlide } from "@/components/presenter/RenderedSlide";
import { SpeakerView } from "@/components/presenter/SpeakerView";

export const metadata: Metadata = { title: "Speaker · 2026 advances in the web", robots: { index: false } };
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ s?: string; step?: string; rehearse?: string }>;
}

/** Speaker window: current and next previews, notes, timer, demo health, controls (PRD 5.2). */
export default async function SpeakerPage({ searchParams }: Props) {
  const { s, rehearse } = await searchParams;
  const slide = (s && bySlideId(s)) || slides[0];
  const { next } = neighbours(slide.id);
  return (
    <PresenterProvider mode="speaker" initialSlideId={slide.id}>
      <RenderedSlide id={slide.id} />
      <SpeakerView
        slide={slide}
        next={next}
        total={slides.length}
        targetMinutes={deck.targetMinutes}
        lastCumulative={slides[slides.length - 1].timing.cumulative}
        rehearse={rehearse === "1"}
        current={<SlidePage slide={slide} mode="speaker-preview" embedded />}
        nextPreview={next ? <SlidePage slide={next} mode="speaker-preview" embedded passive /> : null}
      />
    </PresenterProvider>
  );
}
