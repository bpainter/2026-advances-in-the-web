"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/content/demo-schema";
import type { Mode } from "@/lib/mode";
import { lineSet } from "@/lib/excerpt";
import type { PanelFile } from "./PageBody";

interface Props {
  files: PanelFile[];
  /** The step's highlighted file and lines; `off` dims the whole file and marks its tab. */
  code?: Step["code"];
  mode: Mode;
}

/**
 * Code panel of walk pages (PRD v4, 1.4 and 7.1 item 5): file-name tabs, 24 px code at 44 columns
 * that never wraps, no line numbers. The highlighted band dims the rest and scrolls into view.
 * Elision lines of excerpts are dimmed and italic and never highlighted. On an enhancement-off step
 * (`code.off`) the file is dimmed and its tab carries an "Off" chip.
 */
export function PageCodePanel({ files, code, mode }: Props) {
  const stepFile = code?.file ?? files[0]?.file;
  const [override, setOverride] = useState<{ step: string | undefined; file: string } | null>(null);
  const key = `${code?.file}:${JSON.stringify(code?.lines ?? [])}:${code?.off ? 1 : 0}`;
  const activeFile = override?.step === key ? override.file : stepFile;
  const file = files.find((f) => f.file === activeFile) ?? files[0];
  const elided = new Set(file?.elisions ?? []);
  const highlighted = code && !code.off && file?.file === code.file ? new Set([...lineSet(code.lines)].filter((n) => !elided.has(n))) : new Set<number>();
  const off = Boolean(code?.off && file?.file === code.file);
  const preRef = useRef<HTMLPreElement>(null);
  const interactive = mode !== "audience";

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const first = pre.querySelector<HTMLElement>('.code__line[data-highlighted="true"]');
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!first) {
      pre.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const all = pre.querySelectorAll<HTMLElement>('.code__line[data-highlighted="true"]');
    const last = all[all.length - 1];
    const preRect = pre.getBoundingClientRect();
    const scale = pre.offsetWidth ? preRect.width / pre.offsetWidth : 1;
    const top = (first.getBoundingClientRect().top - preRect.top) / scale + pre.scrollTop;
    const bottom = (last.getBoundingClientRect().bottom - preRect.top) / scale + pre.scrollTop;
    // Center the highlighted range; when it is taller than the panel, show its start.
    const span = bottom - top;
    const target = span < pre.clientHeight ? top - (pre.clientHeight - span) / 2 : top - 16;
    pre.scrollTo({ top: Math.max(target, 0), behavior: reduced ? "auto" : "smooth" });
  }, [activeFile, key]);

  return (
    <div className="code code--page chrome-card" data-has-highlight={highlighted.size > 0} data-off={off}>
      <div className="code__tabs" role="tablist" aria-label="Files">
        {files.map((f) => (
          <button
            key={f.file}
            type="button"
            role="tab"
            className="code__tab"
            aria-selected={f.file === file?.file}
            tabIndex={interactive && f.file === file?.file ? 0 : -1}
            onClick={interactive ? () => setOverride({ step: key, file: f.file }) : undefined}
          >
            {f.file}
            {code?.off && code.file === f.file ? <span className="code__off-chip">Off</span> : null}
          </button>
        ))}
      </div>
      <pre className="code__pre code__pre--plain" ref={preRef} tabIndex={interactive ? 0 : -1}>
        <code className="code__code" data-lang={file?.lang}>
          {file?.lines.map((node, i) => (
            <span className="code__line" data-line={i + 1} data-highlighted={highlighted.has(i + 1)} data-elision={elided.has(i + 1) || undefined} key={i}>
              {node}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
