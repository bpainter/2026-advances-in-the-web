import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { slides, neighbours } from "@/lib/content";
import { stepPhase } from "@/lib/steps";
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
  const demos = slide.demo ? [slide.demo] : (slide.demos ?? []);
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
      stepSets={demos.map((d) => d.steps.map((s) => ({ caption: s.caption, phase: stepPhase(s) })))}
      stepThrough={slide.stepThrough ?? (slide.demo || slide.demos?.length ? "steps-first" : "slide-only")}
      demoIds={demos.map((d) => d.id)}
      kind={slide.layout === "demo-split" ? "split" : slide.layout === "demo-grid" ? "grid" : slide.layout === "terminal" ? "terminal" : "none"}
      defaultView={slide.demoView ?? "split"}
      mode={mode}
      canonicalPath={canonicalPath}
      embedded={embedded}
      passive={passive}
    >
      <SlideRouter slide={slide} total={slides.length} mode={mode} />
    </Stage>
  );
}
