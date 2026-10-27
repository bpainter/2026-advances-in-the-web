import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { SlideShell } from "./SlideShell";
import { Terminal } from "@/components/demo/Terminal";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** Recorded terminal transcript replayed step by step (PRD 7.10). */
export function TerminalSlide({ slide, total, mode }: Props) {
  const demo = slide.demo;
  if (!demo) throw new Error(`Slide ${slide.id} has layout terminal but no demo`);
  const transcript = demo.code.find((f) => f.lang === "bash");
  if (!transcript) throw new Error(`Terminal demo ${demo.id} has no bash transcript`);
  return (
    <SlideShell slide={slide} total={total} mode={mode} headerExtra={slide.body?.[0] ? <p className="slide__subtitle">{slide.body[0]}</p> : null}>
      <Terminal demo={demo} lines={transcript.source.split("\n")} />
    </SlideShell>
  );
}
