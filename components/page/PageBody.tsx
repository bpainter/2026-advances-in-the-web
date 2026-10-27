"use client";

import { useCallback } from "react";
import type { DemoPage } from "@/content/demo-schema";
import type { Mode } from "@/lib/mode";
import type { RenderedFile } from "@/lib/highlight";
import type { StepResult } from "@/lib/engine/frame";
import { useStage } from "@/lib/stage-context";
import { PageFrame } from "./PageFrame";
import { PageCodePanel } from "./PageCodePanel";

interface Props {
  page: DemoPage;
  files: RenderedFile[];
  sandbox: string;
  sideEffects: string[];
  mode: Mode;
  slot: { width: number; height: number };
  /** Computed meter values by step id (scripts/meters.mts). */
  meters: Record<string, string | null>;
}

/** The body of a demo page: frame (live or poster on the speaker's preview), meter, and the code panel on code pages. */
export function PageBody({ page, files, sandbox, sideEffects, mode, slot, meters }: Props) {
  const { stepIndex, setDemoStatus, setStepResult } = useStage();
  const step = page.steps[stepIndex];
  const meter = step?.meter;
  const onStatus = useCallback((s: "loading" | "ready" | "error") => setDemoStatus(page.id, s === "ready" ? "ready" : s === "error" ? "error" : "loading"), [page.id, setDemoStatus]);
  const onStepResult = useCallback((stepId: string, result: StepResult) => setStepResult(page.id, stepId, result), [page.id, setStepResult]);

  const preview = mode === "speaker-preview";
  const poster = step?.poster ?? page.frame?.poster;

  return (
    <div className="page__body">
      <div className="page__frame">
        {!page.frame ? null : preview ? (
          <div className="page__poster" data-has-poster={Boolean(poster)}>
            {poster ? <img className="page__poster-image" src={poster} alt="" /> : null}
            <p className="page__poster-label">{step ? step.label : page.title}</p>
          </div>
        ) : (
          <PageFrame page={page} sandbox={sandbox} sideEffects={sideEffects} mode={mode} slot={slot} onStatus={onStatus} onStepResult={onStepResult} />
        )}
        {meter ? (
          <p className="page__meter" aria-live="polite">
            <span className="page__meter-label">{meter.label}</span>
            <span className="page__meter-value">{meters[step.id] ?? meter.value}</span>
          </p>
        ) : null}
      </div>
      {files.length > 0 ? (
        <section className="page__code" aria-label="Code">
          <PageCodePanel files={files} code={step?.code} mode={mode} />
        </section>
      ) : null}
    </div>
  );
}
