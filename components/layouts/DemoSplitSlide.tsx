import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { renderCodeFiles } from "@/lib/highlight";
import { SlideShell } from "./SlideShell";
import { DemoSplitBody } from "@/components/demo/DemoSplitBody";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** Demo slide: live view and stepped code, in one of three views (PRD Part A, section 7.5). */
export async function DemoSplitSlide({ slide, total, mode }: Props) {
  const demo = slide.demo;
  if (!demo) throw new Error(`Slide ${slide.id} has layout demo-split but no demo`);
  const files = await renderCodeFiles(demo.code);
  const legacyFiles = demo.legacy ? await renderCodeFiles(demo.legacy.code) : undefined;
  const subtitle = slide.body?.[0];
  return (
    <SlideShell slide={slide} total={total} mode={mode} headerExtra={subtitle ? <p className="slide__subtitle">{subtitle}</p> : null}>
      <DemoSplitBody demo={demo} support={slide.support} files={files} legacyFiles={legacyFiles} slideTitle={slide.title} mode={mode} />
    </SlideShell>
  );
}
