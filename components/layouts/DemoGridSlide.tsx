import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { renderCodeFiles } from "@/lib/highlight";
import { SlideShell } from "./SlideShell";
import { DemoGridBody } from "@/components/demo/DemoGridBody";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** 2x2 of small live demos; keys 1 to 4 enlarge a cell with its code, 0 restores (PRD 7.6). */
export async function DemoGridSlide({ slide, total, mode }: Props) {
  const demos = slide.demos ?? [];
  const files = await Promise.all(demos.map((d) => renderCodeFiles(d.code)));
  const cells = demos.map((demo, i) => ({ demo, files: files[i], label: slide.items?.[i]?.label ?? demo.wow }));
  return (
    <SlideShell slide={slide} total={total} mode={mode} headerExtra={slide.body?.[0] ? <p className="slide__subtitle">{slide.body[0]}</p> : null}>
      <DemoGridBody cells={cells} slideTitle={slide.title} mode={mode} />
    </SlideShell>
  );
}
