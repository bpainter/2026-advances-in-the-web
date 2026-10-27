import type { CodeStep, Demo } from "@/content/schema";

/** Normalises `number[] | [number, number][]` to a set of 1-based line numbers. */
export function highlightSet(highlight: CodeStep["highlight"]): Set<number> {
  const out = new Set<number>();
  for (const h of highlight) {
    if (Array.isArray(h)) {
      const [from, to] = h;
      for (let n = Math.min(from, to); n <= Math.max(from, to); n++) out.add(n);
    } else {
      out.add(h);
    }
  }
  return out;
}

export interface ResolvedStep {
  step: CodeStep | undefined;
  file: string;
  lines: Set<number>;
  /** True when this step has no highlight of its own and shows the previous one dimmed. */
  dimmed: boolean;
}

/**
 * The file and lines the code panel shows at `stepIndex`. A step with `highlight: []` is a
 * live-view-only step; the panel keeps the previous highlight, dimmed. (PRD Part 0, canonical schema)
 */
export function resolveStep(demo: Demo, stepIndex: number): ResolvedStep {
  const firstFile = demo.code[0]?.file ?? "";
  const step = demo.steps[stepIndex];
  if (!step) return { step: undefined, file: firstFile, lines: new Set(), dimmed: false };
  if (step.highlight.length > 0) {
    return { step, file: step.file ?? firstFile, lines: highlightSet(step.highlight), dimmed: false };
  }
  for (let i = stepIndex - 1; i >= 0; i--) {
    const prev = demo.steps[i];
    if (prev.highlight.length > 0) {
      return { step, file: prev.file ?? firstFile, lines: highlightSet(prev.highlight), dimmed: true };
    }
  }
  return { step, file: step.file ?? firstFile, lines: new Set(), dimmed: false };
}
