"use client";

import { useEffect, useRef, useState } from "react";
import type { Demo, DemoView, SupportLabel as SupportLabelData } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import type { RenderedFile } from "@/lib/highlight";
import { resolveLive } from "@/lib/steps";
import { useStage } from "@/lib/stage-context";
import { DemoFrame } from "./DemoFrame";
import { CodePanel } from "./CodePanel";

const VIEW_LABEL: Record<DemoView, string> = { live: "1 · Live only", split: "2 · Split 60/40", code: "3 · Code only", half: "4 · Split 50/50" };

interface Props {
  demo: Demo;
  support?: SupportLabelData;
  files: RenderedFile[];
  /** Rendered `demo.legacy.code`, shown by the code panel during "before" steps. */
  legacyFiles?: RenderedFile[];
  slideTitle: string;
  mode: Mode;
}

/**
 * The body of a demo slide in one of four views; 1 to 4 switch between them. When the demo has a
 * legacy document both frames stay mounted and the step's phase decides which one shows, so the
 * before-to-after switch never reloads (docs/demo-plan.md, E3.2). `support` is kept for the speaker view.
 */
export function DemoSplitBody({ demo, files, legacyFiles, slideTitle, mode }: Props) {
  const { stepIndex, view } = useStage();
  const live = resolveLive(demo, stepIndex);
  const hasLegacy = Boolean(demo.legacy && legacyFiles);
  const before = hasLegacy && live.phase === "before";
  const [toast, setToast] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setToast(true);
    const t = window.setTimeout(() => setToast(false), 1200);
    return () => window.clearTimeout(t);
  }, [view]);

  // Spotlight only next to code: the live-only view is the "look at the product" view (plan decision D3).
  const target = view === "live" ? null : live.target;

  return (
    <div className="demo-split" data-view={view} data-phase={live.phase}>
      <div className="demo-split__live" data-stacked={hasLegacy}>
        <DemoFrame demo={demo} slideTitle={slideTitle} liveState={live.state} stepId={live.stepId} target={before ? null : target} mode={mode} visible={!before} />
        {hasLegacy ? (
          <DemoFrame demo={demo} slideTitle={slideTitle} liveState={live.state} stepId={live.stepId} target={before ? target : null} mode={mode} variant="legacy" visible={before} />
        ) : null}
      </div>
      <section className="demo-split__code" aria-label="Code">
        <CodePanel demo={demo} files={files} legacyFiles={legacyFiles} stepIndex={stepIndex} mode={mode} />
      </section>
      <p className="demo-split__view-label" data-visible={toast} aria-hidden="true">
        {VIEW_LABEL[view]}
      </p>
    </div>
  );
}
