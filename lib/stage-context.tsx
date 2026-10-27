"use client";

import { createContext, useContext } from "react";
import type { DemoView } from "@/content/schema";

export type DemoStatus = "loading" | "ready" | "error" | "fallback";

export interface StageState {
  stepIndex: number;
  stepCount: number;
  view: DemoView;
  /** demo-grid: the enlarged cell, else null. */
  cellIndex: number | null;
  /** terminal: true while the recording is hidden for a live terminal (`l`). */
  liveMode: boolean;
  /** Increments on `r`; DemoFrame remounts its iframe. */
  reloadToken: number;
  /** Increments on Enter; DemoFrame focuses its iframe. */
  focusToken: number;
  /** Set by `x`; cleared by `r`. */
  showFallback: boolean;
  demoStatus: Record<string, DemoStatus>;
  setStepIndex: (n: number) => void;
  setView: (v: DemoView) => void;
  setCellIndex: (n: number | null) => void;
  setDemoStatus: (demoId: string, status: DemoStatus) => void;
  /** Clicker keys forwarded from inside a demo iframe (demo:key). */
  dispatchKey: (key: string, shiftKey: boolean) => void;
  /** Called by DemoFrame on demo:escape to put focus back on the stage. */
  focusStage: () => void;
}

export const StageContext = createContext<StageState | null>(null);

export function useStage(): StageState {
  const ctx = useContext(StageContext);
  if (!ctx) throw new Error("useStage must be used inside <Stage>");
  return ctx;
}
