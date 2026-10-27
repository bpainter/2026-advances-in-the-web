"use client";

import { useEffect, useRef, useState } from "react";
import type { Demo } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import type { RenderedFile } from "@/lib/highlight";
import { resolveStep } from "@/lib/steps";

interface Props {
  demo: Demo;
  files: RenderedFile[];
  /** Rendered `demo.legacy.code`; shown instead of `files` during "before" steps. */
  legacyFiles?: RenderedFile[];
  stepIndex: number;
  mode: Mode;
}

/** Stepped code panel: file tabs, numbered lines, highlighted ranges, caption (PRD 7.4). */
export function CodePanel({ demo, files: nativeFiles, legacyFiles, stepIndex, mode }: Props) {
  const resolved = resolveStep(demo, stepIndex);
  const files = resolved.phase === "before" && legacyFiles ? legacyFiles : nativeFiles;
  // The step decides the tab; a reader may override it until the step changes.
  const [override, setOverride] = useState<{ step: number; file: string } | null>(null);
  const activeFile = override?.step === stepIndex ? override.file : resolved.file;
  const setActiveFile = (file: string) => setOverride({ step: stepIndex, file });
  const preRef = useRef<HTMLPreElement>(null);
  const stepCount = demo.steps.length;

  // Scroll the first highlighted line to the vertical centre of the panel.
  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const first = pre.querySelector<HTMLElement>('.code__line[data-highlighted="true"]');
    if (!first) return;
    // Measure inside the panel. offsetTop would be relative to the scaled stage canvas, and client
    // rects are scaled by --stage-scale, so divide the rect delta by the rendered/layout ratio.
    const preRect = pre.getBoundingClientRect();
    const scale = pre.offsetWidth ? preRect.width / pre.offsetWidth : 1;
    const lineTop = (first.getBoundingClientRect().top - preRect.top) / scale + pre.scrollTop;
    const target = lineTop - pre.clientHeight / 2 + first.offsetHeight / 2;
    pre.scrollTo({ top: Math.max(target, 0), behavior: "auto" });
  }, [activeFile, stepIndex]);

  const file = files.find((f) => f.file === activeFile) ?? files[0];
  const showingStepFile = file?.file === resolved.file;
  const hasHighlight = showingStepFile && resolved.lines.size > 0;
  const tabsInteractive = mode !== "audience";

  return (
    <section className="code" aria-label={`Code: ${file?.file ?? ""}`} data-step={resolved.step?.id} data-phase={resolved.phase} data-has-highlight={hasHighlight} data-dimmed={resolved.dimmed}>
      {files.length > 1 ? (
        <div className="code__tabs" role="tablist" aria-label="Files">
          {files.map((f) => (
            <button
              key={f.file}
              type="button"
              role="tab"
              className="code__tab"
              aria-selected={f.file === file?.file}
              tabIndex={tabsInteractive && f.file === file?.file ? 0 : -1}
              onClick={tabsInteractive ? () => setActiveFile(f.file) : undefined}
              onKeyDown={
                tabsInteractive
                  ? (e) => {
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                      e.preventDefault();
                      e.stopPropagation();
                      const i = files.findIndex((x) => x.file === file?.file);
                      const next = files[(i + (e.key === "ArrowRight" ? 1 : files.length - 1)) % files.length];
                      setActiveFile(next.file);
                    }
                  : undefined
              }
            >
              {f.file}
            </button>
          ))}
        </div>
      ) : null}
      <pre className="code__pre" ref={preRef} tabIndex={tabsInteractive ? 0 : -1}>
        <code className="code__code" data-lang={file?.lang}>
          {file?.lines.map((node, i) => (
            <span className="code__line" data-line={i + 1} data-highlighted={hasHighlight && resolved.lines.has(i + 1)} key={i}>
              {node}
            </span>
          ))}
        </code>
      </pre>
      {stepCount > 0 ? (
        <p className="code__caption">
          <span>{resolved.step?.caption}</span>
          <span className="code__step">
            {legacyFiles ? <span className="code__phase">{resolved.phase === "before" ? "Today" : "Native"}</span> : null}
            {stepIndex + 1} / {stepCount}
          </span>
        </p>
      ) : null}
    </section>
  );
}
