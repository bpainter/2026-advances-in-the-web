import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { loadDesigned } from "@/lib/designed";
import { SlideFooter } from "./SlideShell";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/**
 * A slide designed in Claude Design and exported as a 1920 x 1080 `<section>` (content/designed/).
 * Rendered as-is inside the stage canvas, with the deck's footer laid over the bottom band.
 */
export function DesignedSlide({ slide, mode }: Props) {
  if (!slide.designed) throw new Error(`Slide ${slide.id} has layout designed but no designed.file`);
  const { node, dark } = loadDesigned(slide.designed.file);
  return (
    <article className="slide slide--designed" data-dark={dark} data-mode={mode} aria-label={slide.title}>
      <div className="designed">{node}</div>
      <SlideFooter slide={slide} mode={mode} />
    </article>
  );
}
