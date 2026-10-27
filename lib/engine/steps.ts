import type { Action, DemoPage, Step } from "@/content/demo-schema";
import { PACE } from "@/content/demo-schema";

/** Flags whose toggle reloads the document (PRD Part A, 9). */
export const RELOADING_FLAGS = new Set(["enhance-js", "csp-enforce"]);

export function isReloadingToggle(a: Action): boolean {
  return a.type === "toggle" && RELOADING_FLAGS.has(a.flag);
}

/** Flags in effect after `steps[0..stepIndex]` (toggles accumulate through the page). */
export function flagsAt(page: DemoPage, stepIndex: number): Record<string, boolean> {
  const flags = { ...(page.frame?.flags ?? {}) };
  for (let i = 0; i <= stepIndex && i < page.steps.length; i++) {
    for (const a of page.steps[i].actions) if (a.type === "toggle") flags[a.flag] = a.on;
  }
  return flags;
}

/** Flags before the step's own actions run (the document a step starts in). */
export function flagsBefore(page: DemoPage, stepIndex: number): Record<string, boolean> {
  return flagsAt(page, stepIndex - 1);
}

/** Selectors the overlay and runtime watch during a step. */
export function selectorsFor(step: Step | undefined): string[] {
  if (!step) return [];
  const out = new Set<string>();
  for (const s of step.spotlight ?? []) out.add(s);
  for (const c of step.callouts ?? []) out.add(c.target);
  for (const a of step.actions) {
    if ("target" in a && typeof a.target === "string" && a.target !== ":viewport") out.add(a.target);
    if (a.type === "pointer") out.add(a.to);
  }
  return [...out];
}

/**
 * Splits a step's actions at reloading toggles: each segment after the first starts in a fresh
 * document mounted with the flags accumulated so far (PRD Part A, 9).
 */
export function segments(step: Step, startFlags: Record<string, boolean>): { actions: Action[]; flags: Record<string, boolean>; startAt: number; reload: boolean }[] {
  const out: { actions: Action[]; flags: Record<string, boolean>; startAt: number; reload: boolean }[] = [];
  let flags = { ...startFlags };
  let current: Action[] = [];
  let startAt = 0;
  step.actions.forEach((a, i) => {
    if (a.type === "toggle" && RELOADING_FLAGS.has(a.flag)) {
      out.push({ actions: current, flags: { ...flags }, startAt, reload: out.length > 0 });
      flags = { ...flags, [a.flag]: a.on };
      current = [];
      startAt = i + 1;
      return;
    }
    if (a.type === "toggle") flags[a.flag] = a.on;
    current.push(a);
  });
  out.push({ actions: current, flags: { ...flags }, startAt, reload: out.length > 0 });
  return out;
}

/** Actions of `steps[0..stepIndex]` minus reloading toggles, for a replay into a document mounted with `flagsAt`. */
export function replaySteps(page: DemoPage, stepIndex: number): Step[] {
  return page.steps.slice(0, stepIndex + 1).map((s) => ({ ...s, actions: s.actions.filter((a) => !isReloadingToggle(a)) }));
}

/** Nominal duration of a step's animated playback in ms (Part A, 3.2). */
export function nominalMs(step: Step): number {
  let ms = 0;
  let cursorPlaced = false;
  for (const a of step.actions) {
    switch (a.type) {
      case "pointer":
        ms += PACE.glideMs;
        cursorPlaced = true;
        break;
      case "click":
        ms += (cursorPlaced ? 0 : PACE.glideMs) + PACE.rippleMs;
        cursorPlaced = false;
        break;
      case "key":
        ms += PACE.keyLeadMs;
        break;
      case "type":
        ms += a.text.length * PACE.charMs;
        break;
      case "paste":
        ms += PACE.pasteMs;
        break;
      case "resize":
        ms += PACE.resizeMs;
        break;
      case "reveal":
        ms += PACE.revealMs;
        break;
      case "toggle":
        ms += RELOADING_FLAGS.has(a.flag) ? PACE.reloadMs : 0;
        break;
      case "navigate":
        ms += PACE.navigateBudgetMs;
        break;
      case "hook":
        ms += PACE.hookBudgetMs;
        break;
      case "wait":
        ms += a.ms;
        break;
      default:
        break;
    }
  }
  return ms;
}

export function ceilingMs(step: Step): number {
  return step.actions.some((a) => a.type === "type" || a.type === "paste" || a.type === "terminal") ? 6000 : 2500;
}
