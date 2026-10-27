import type { DemoView } from "@/content/schema";

export type DemoHealth = "loading" | "ready" | "error" | "fallback";

/** Shared state of the two presenter windows (PRD Part A, section 5.1), plus the demo view and cell. */
export interface PresenterState {
  seq: number; // monotonic, incremented by whoever writes
  writer: string; // random id of the window that produced this state
  slideId: string;
  stepIndex: number; // 0-based; -1 means "the last step of this slide", resolved by the stage
  cellIndex: number | null; // demo-grid: focused cell, else null
  view: DemoView | null; // demo-split view; null means the slide's default
  liveMode: boolean; // terminal: recording hidden
  blank: boolean;
  startedAt: number | null; // epoch ms when the timer was started
  pausedAt: number | null; // epoch ms when paused, else null
}

export type SyncMessage =
  | { type: "state"; state: PresenterState }
  | { type: "hello"; writer: string }
  | { type: "demo-health"; demoId: string; status: DemoHealth; writer: string };

export const STORAGE_KEY = "deck:state";

export function channelName(): string {
  return `deck:${process.env.NEXT_PUBLIC_BUILD_ID ?? "dev"}`;
}

export function newWriterId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Accept an incoming state only if it is newer; ties go to the lexically greater writer so both windows converge. */
export function isNewer(incoming: PresenterState, current: PresenterState | null): boolean {
  if (!current) return true;
  if (incoming.seq !== current.seq) return incoming.seq > current.seq;
  return incoming.writer > current.writer;
}
