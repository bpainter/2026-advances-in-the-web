import type { Action } from "@/content/demo-schema";

/** PRD Part A, 5.3. Rectangles are frame CSS pixels. */
export type Rect = { x: number; y: number; w: number; h: number };
export type Flags = Record<string, boolean>;
export type RunMode = "animated" | "instant";
export type Cursor = { step: number; action: number };

export interface Pace {
  glideMs: number;
  rippleMs: number;
  charMs: number;
  resizeMs: number;
  revealMs: number;
}
export const DEFAULT_PACE: Pace = { glideMs: 420, rippleMs: 260, charMs: 45, resizeMs: 700, revealMs: 250 };

export interface AssertResult {
  stepId: string;
  index: number;
  target: string;
  expect: string;
  pass: boolean;
  actual: string;
}

export type ErrorCode = "selector-not-found" | "via-unsupported" | "hook-missing" | "assert-failed" | "exception" | "timeout" | "flag-unknown";

export type Cue =
  | { kind: "cursor"; to: Rect; ms: number }
  | { kind: "ripple"; at: Rect }
  | { kind: "keycap"; label: string; ms: number }
  | { kind: "caption"; text: string; ms: number };

export type ToRuntime =
  | { v: 1; type: "init"; frameId: string; mirror: boolean; handsOn: boolean; reducedMotion: boolean; pace: Pace; flags: Flags; sideEffects: string[] }
  | { v: 1; type: "run-step"; frameId: string; runId: number; stepId: string; actions: Action[]; mode: RunMode; startAt: number }
  | { v: 1; type: "replay-to"; frameId: string; runId: number; steps: { stepId: string; actions: Action[] }[]; from: Cursor }
  | { v: 1; type: "finish"; frameId: string; runId: number }
  | { v: 1; type: "reset"; frameId: string }
  | { v: 1; type: "set-flag"; frameId: string; flag: string; on: boolean }
  | { v: 1; type: "set-mode"; frameId: string; handsOn: boolean }
  | { v: 1; type: "set-live"; frameId: string; on: boolean }
  | { v: 1; type: "watch"; frameId: string; selectors: string[]; live: boolean };

export type FromRuntime =
  | { v: 1; type: "ready"; frameId: string | null; build: string; url: string; title: string; supports: Record<string, boolean>; hooks: string[]; flags: Flags }
  | { v: 1; type: "rects"; frameId: string; seq: number; viewport: { w: number; h: number }; rects: Record<string, Rect[]>; focus: Rect | null; focusVisibleNative: boolean }
  | { v: 1; type: "cue"; frameId: string; runId: number; index: number; cue: Cue }
  | { v: 1; type: "unloading"; frameId: string; runId: number; cursor: Cursor }
  | { v: 1; type: "step-done"; frameId: string; runId: number; stepId: string; asserts: AssertResult[]; digest: string; ms: number; finished: boolean }
  | { v: 1; type: "error"; frameId: string; runId?: number; code: ErrorCode; message: string; action?: number; selector?: string }
  | { v: 1; type: "key"; frameId: string; key: string; shift: boolean; alt: boolean; meta: boolean; ctrl: boolean }
  | { v: 1; type: "resize-viewport"; frameId: string; inlineSize: string; ms: number };

const FROM_TYPES = new Set(["ready", "rects", "cue", "unloading", "step-done", "error", "key", "resize-viewport"]);

/** Strict enough for a trusted-origin message: version, a known type, and a string or null frame id. */
export function parseFromRuntime(data: unknown): FromRuntime | null {
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (d.v !== 1 || typeof d.type !== "string" || !FROM_TYPES.has(d.type)) return null;
  if (!(typeof d.frameId === "string" || d.frameId === null)) return null;
  return d as unknown as FromRuntime;
}
