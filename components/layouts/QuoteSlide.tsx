import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { SlideShell } from "./SlideShell";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

export function QuoteSlide({ slide, total, mode }: Props) {
  const q = slide.quote;
  if (!q) return null;
  return (
    <SlideShell slide={slide} total={total} mode={mode}>
      <figure className="quote">
        <blockquote className="quote__text" cite={q.url}>
          <p>{q.text}</p>
        </blockquote>
        <figcaption className="quote__source">
          <span className="quote__who">{q.who}</span>
          <span className="quote__where">{q.where}</span>
        </figcaption>
      </figure>
      {slide.body?.map((sentence) => (
        <p className="slide__text" key={sentence}>
          {sentence}
        </p>
      ))}
    </SlideShell>
  );
}
