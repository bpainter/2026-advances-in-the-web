import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { slides, neighbours } from "@/lib/content";
import { Stage } from "./Stage";
import { SlideRouter } from "./SlideRouter";

interface Props {
  slide: Slide;
  mode: Mode;
  /** When set, the stage rewrites the URL to this path on mount (used by `/`). */
  canonicalPath?: string;
  /** Render inside a box instead of filling the viewport (speaker previews). */
  embedded?: boolean;
  /** No keyboard, URL or store writes (the speaker's next-slide preview). */
  passive?: boolean;
}

export function SlidePage({ slide, mode, canonicalPath, embedded, passive }: Props) {
  const { prev, next } = neighbours(slide.id);
  return (
    <Stage
      key={slide.id}
      slideId={slide.id}
      slideTitle={slide.title}
      slideIndex={slide.index}
      total={slides.length}
      prevId={prev?.id}
      nextId={next?.id}
      firstId={slides[0].id}
      lastId={slides[slides.length - 1].id}
      slideIds={slides.map((s) => s.id)}
      steps={slide.page?.steps.map((s) => ({ label: s.label })) ?? []}
      frameRoute={slide.page?.frame?.route}
      mode={mode}
      canonicalPath={canonicalPath}
      embedded={embedded}
      passive={passive}
    >
      <SlideRouter slide={slide} total={slides.length} mode={mode} />
    </Stage>
  );
}
