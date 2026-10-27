import type { CodeStep, Demo, StepPhase } from "@/content/schema";

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
  /** Which file set the panel shows: the legacy document during "before" steps. */
  phase: StepPhase;
}

/**
 * The file and lines the code panel shows at `stepIndex`. A step with `highlight: []` is a
 * live-view-only step; the panel keeps the previous highlight of the same phase, dimmed.
 * "before" steps resolve against `demo.legacy.code`. (PRD Part 0, canonical schema; plan E3.3)
 */
export function resolveStep(demo: Demo, stepIndex: number): ResolvedStep {
  const step = demo.steps[stepIndex];
  const phase = step ? stepPhase(step) : "after";
  const set = phase === "before" && demo.legacy ? demo.legacy.code : demo.code;
  const firstFile = set[0]?.file ?? "";
  if (!step) return { step: undefined, file: firstFile, lines: new Set(), dimmed: false, phase };
  if (step.highlight.length > 0) {
    return { step, file: step.file ?? firstFile, lines: highlightSet(step.highlight), dimmed: false, phase };
  }
  for (let i = stepIndex - 1; i >= 0; i--) {
    const prev = demo.steps[i];
    if (stepPhase(prev) !== phase && !(phase !== "before" && stepPhase(prev) !== "before")) continue;
    if (prev.highlight.length > 0) {
      return { step, file: prev.file ?? firstFile, lines: highlightSet(prev.highlight), dimmed: true, phase };
    }
  }
  return { step, file: step.file ?? firstFile, lines: new Set(), dimmed: false, phase };
}

/** The beat a step belongs to; defaults to "code" for highlighted steps and "after" otherwise. */
export function stepPhase(step: CodeStep): StepPhase {
  return step.phase ?? (step.highlight.length > 0 ? "code" : "after");
}

export interface ResolvedLive {
  /** Effective state: the nearest `liveState` declared at or before the step; undefined when none. */
  state: string | undefined;
  phase: StepPhase;
  /** Selector to spotlight in the demo, or null. */
  target: string | null;
  stepId: string | undefined;
}

/**
 * What the live frame should show at `stepIndex`. The effective state makes advance and retreat
 * deterministic: a step that declares nothing inherits the last declared state, so going back
 * replays exactly what going forward showed. (docs/demo-plan.md, E1.2)
 */
export function resolveLive(demo: Demo, stepIndex: number): ResolvedLive {
  const step = demo.steps[stepIndex];
  if (!step) return { state: undefined, phase: "after", target: null, stepId: undefined };
  let state: string | undefined;
  for (let i = stepIndex; i >= 0; i--) {
    const s = demo.steps[i].liveState;
    if (s) {
      state = s;
      break;
    }
  }
  return { state, phase: stepPhase(step), target: step.target ?? null, stepId: step.id };
}
