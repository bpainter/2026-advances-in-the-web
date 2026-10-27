import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { SlideShell } from "./SlideShell";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

export function StatementSlide({ slide, total, mode }: Props) {
  return (
    <SlideShell slide={slide} total={total} mode={mode} hideTitle>
      <p className="statement">{slide.statement}</p>
    </SlideShell>
  );
}
