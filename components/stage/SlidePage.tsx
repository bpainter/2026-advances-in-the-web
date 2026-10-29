import { existsSync } from "node:fs";
import path from "node:path";
import { hasFrame } from "@/content/demo-schema";
import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { slides, neighbours } from "@/lib/content";
import { backgroundUrl } from "@/content/backgrounds";
import { navCurrent, navGroups } from "@/lib/nav";
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

const publicFile = (p?: string | null): p is string => Boolean(p && existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", p)));

/**
 * The images a slide shows at a step (PRD r7, 9.2): an intro slide's captured still, or a frame
 * page's poster for that step (the speaker previews; the audience window when a frame is offline).
 * Only files that exist under public/, resolved as DemoPageSlide resolves them.
 */
function slideImages(slide: Slide | undefined, stepIds?: string[]): string[] {
  const page = slide?.page;
  if (!page) return [];
  if (!hasFrame(page)) return publicFile(page.visual.src) ? [page.visual.src] : [];
  const ids = stepIds ?? [page.steps[0]?.id].filter(Boolean);
  return ids.flatMap((id) => {
    const step = page.steps.find((s) => s.id === id);
    const poster = [step?.poster, `/posters/${page.id}/${id}.jpg`, page.frame.poster].find(publicFile);
    return poster ? [poster] : [];
  });
}

const groups = navGroups();

export function SlidePage({ slide, mode, canonicalPath, embedded, passive }: Props) {
  const { prev, next, position } = neighbours(slide.id);
  const afterNext = slides[position + 2];
  // Decoded ahead, through the stage's module cache. The audience window takes the next slide's
  // first image. The speaker window takes what its previews show after the next press: the current
  // page's step posters, and the next two slides' first images.
  const audienceAssets = slideImages(next);
  const speakerAssets = [...new Set([...slideImages(slide, slide.page?.steps.map((s) => s.id)), ...slideImages(next), ...slideImages(afterNext)])];
  return (
    <Stage
      key={slide.id}
      slideId={slide.id}
      slideTitle={slide.title}
      slideIndex={slide.index}
      total={slides.length}
      prevId={prev?.id}
      nextId={next?.id}
      prevHasSteps={(prev?.page?.steps.length ?? 0) > 1}
      firstId={slides[0].id}
      lastId={slides[slides.length - 1].id}
      slideIds={slides.map((s) => s.id)}
      slideSteps={slides.map((s) => s.page?.steps.length ?? 0)}
      background={backgroundUrl(slide.background)}
      neighbourBackgrounds={[prev, next].flatMap((n) => (n ? [backgroundUrl(n.background)] : []))}
      neighbourAssets={mode === "audience" ? audienceAssets : mode === "speaker-preview" && !passive ? speakerAssets : []}
      nav={passive ? null : { groups, currentId: navCurrent(slide.id) }}
      steps={slide.page?.steps.map((s) => ({ label: s.label })) ?? []}
      frameRoute={slide.page && hasFrame(slide.page) ? slide.page.frame.route : undefined}
      mode={mode}
      canonicalPath={canonicalPath}
      embedded={embedded}
      passive={passive}
    >
      <SlideRouter slide={slide} total={slides.length} mode={mode} />
    </Stage>
  );
}
