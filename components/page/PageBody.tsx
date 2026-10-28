"use client";

import { useCallback } from "react";
import type { FramePage } from "@/content/demo-schema";
import type { Mode } from "@/lib/mode";
import type { RenderedFile } from "@/lib/highlight";

export type PanelFile = RenderedFile & { elisions: number[] };
import type { StepResult } from "@/lib/engine/frame";
import { useStage } from "@/lib/stage-context";
import { PageFrame } from "./PageFrame";
import { PageCodePanel } from "./PageCodePanel";

interface Props {
  page: FramePage;
  files: PanelFile[];
  sandbox: string;
  sideEffects: string[];
  mode: Mode;
  slot: { width: number; height: number };
  /** Computed meter values by step id (scripts/meters.mts). */
  meters: Record<string, string | null>;
  /** Poster path per step id, null when the file is not in public/. */
  posters: Record<string, string | null>;
  /** The section's background id (PRD v5, 4.2). */
  background?: string;
}

/** The body of a demo page: frame (live or poster on the speaker's preview), meter, and the code panel. */
export function PageBody({ page, files, sandbox, sideEffects, mode, slot, meters, posters, background }: Props) {
  const { stepIndex, setDemoStatus, setStepResult } = useStage();
  const step = page.steps[stepIndex];
  // The meter shows from its step to the end of the page (used-to: the last step; now: the
  // JavaScript step, CX 4), at the top right of the title row.
  const meterStep = page.steps
    .slice(0, stepIndex + 1)
    .reverse()
    .find((s) => s.meter);
  const meter = meterStep?.meter;
  const onStatus = useCallback((s: "loading" | "ready" | "error") => setDemoStatus(page.id, s === "ready" ? "ready" : s === "error" ? "error" : "loading"), [page.id, setDemoStatus]);
  const onStepResult = useCallback((stepId: string, result: StepResult) => setStepResult(page.id, stepId, result), [page.id, setStepResult]);

  const preview = mode === "speaker-preview";
  const poster = step ? posters[step.id] : null;

  return (
    <div className="page__body">
      <div className="page__frame">
        {!page.frame ? null : preview ? (
          <div className="page__poster" data-has-poster={Boolean(poster)}>
            {/* A static poster, served from public/; next/image adds nothing for a preview. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {poster ? <img className="page__poster-image" src={poster} alt="" /> : null}
            <p className="page__poster-label">{step ? step.label : page.title}</p>
          </div>
        ) : (
          <PageFrame page={page} sandbox={sandbox} sideEffects={sideEffects} mode={mode} slot={slot} onStatus={onStatus} onStepResult={onStepResult} background={background} />
        )}
      </div>
      {page.steps.length > 1 ? (
        <div className="page__steps" aria-hidden="true">
          <span>
            Step {stepIndex + 1} of {page.steps.length}
          </span>
          <span className="page__steps-bar">
            {page.steps.map((s, i) => (
              <span key={s.id} className="page__steps-seg" data-state={i < stepIndex ? "done" : i === stepIndex ? "current" : "future"} />
            ))}
          </span>
        </div>
      ) : null}
      {meter && meterStep ? (
        <p className="page__meter" aria-live="polite">
          <span className="page__meter-label">{meter.label}</span>
          <span className="page__meter-value">{meters[meterStep.id] ?? meter.value}</span>
        </p>
      ) : null}
      {files.length > 0 ? (
        <section className="page__code" aria-label="Code">
          <PageCodePanel files={files} code={step?.code} mode={mode} />
        </section>
      ) : null}
    </div>
  );
}
