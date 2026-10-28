"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SinglePage } from "@/content/demo-schema";
import type { StepResult } from "@/lib/engine/frame";
import { StageContext, type StageState } from "@/lib/stage-context";
import { PageFrame } from "@/components/page/PageFrame";

interface Props {
  page: SinglePage;
  sandbox: string;
  sideEffects: string[];
}

declare global {
  interface Window {
    __stepResults?: Record<string, StepResult & { seq: number }>;
    __stepSeq?: number;
  }
}

/**
 * A page frame on its own at the walk-page slot size, with arrow keys for steps. The walk reads
 * the overlay boxes against the targets here (scripts/walk-demos.mts, fixture checks).
 */
export function SpotlightFixture({ page, sandbox, sideEffects }: Props) {
  const [stepIndex, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const n = Number.parseInt(new URLSearchParams(window.location.search).get("step") ?? "0", 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, 0), page.steps.length - 1) : 0;
  });
  const [reloadToken] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, page.steps.length - 1));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [page.steps.length]);
  const setStepResult = useCallback((pageId: string, stepId: string, result: StepResult) => {
    window.__stepSeq = (window.__stepSeq ?? 0) + 1;
    window.__stepResults = { ...(window.__stepResults ?? {}), [`${pageId}:${stepId}`]: { ...result, seq: window.__stepSeq } };
  }, []);
  const value = useMemo<StageState>(
    () => ({
      stepIndex,
      stepCount: page.steps.length,
      handsOn: false,
      live: false,
      reloadToken,
      rehearsal: true,
      demoStatus: {},
      stepResults: {},
      setStepIndex: setStep,
      setDemoStatus: () => {},
      setStepResult,
      reportPlaying: () => {},
      registerPlayback: () => {},
      dispatchKey: () => {},
      focusStage: () => {},
    }),
    [stepIndex, page.steps.length, reloadToken, setStepResult],
  );
  const onStepResult = useCallback((stepId: string, result: StepResult) => setStepResult(page.id, stepId, result), [page.id, setStepResult]);
  return (
    <StageContext.Provider value={value}>
      <div className="fixture-stage" style={{ padding: 40 }}>
        <p>
          Step {stepIndex + 1} of {page.steps.length}: {page.steps[stepIndex].label}
        </p>
        <div className="page__frame" style={{ width: 880, height: 864, position: "relative" }}>
          <PageFrame page={page} sandbox={sandbox} sideEffects={sideEffects} mode="audience" slot={{ width: 880, height: 864 }} onStepResult={onStepResult} />
        </div>
      </div>
    </StageContext.Provider>
  );
}
