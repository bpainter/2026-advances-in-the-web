"use client";

import { useEffect, useRef, useState } from "react";
import type { Mode } from "@/lib/mode";
import type { RenderedFile } from "@/lib/highlight";

interface Props {
  files: RenderedFile[];
  /** The step's highlighted file and lines (numbers and inclusive ranges). */
  code?: { file: string; lines: (number | [number, number])[] };
  mode: Mode;
}

const TAB_LABEL: Record<string, string> = { html: "HTML", css: "CSS", js: "JS", ts: "TS", tsx: "TSX" };

function lineSet(lines: (number | [number, number])[]): Set<number> {
  const out = new Set<number>();
  for (const l of lines) {
    if (Array.isArray(l)) for (let n = l[0]; n <= l[1]; n++) out.add(n);
    else out.add(l);
  }
  return out;
}

/**
 * Code panel for code pages (PRD Part A, 2.3): tabs by language or file name, 44-character lines
 * that never wrap, no line numbers, the highlighted band dims the rest and scrolls into view.
 */
export function PageCodePanel({ files, code, mode }: Props) {
  const stepFile = code?.file ?? files[0]?.file;
  const [override, setOverride] = useState<{ step: string | undefined; file: string } | null>(null);
  const key = `${code?.file}:${JSON.stringify(code?.lines ?? [])}`;
  const activeFile = override?.step === key ? override.file : stepFile;
  const file = files.find((f) => f.file === activeFile) ?? files[0];
  const highlighted = code && file?.file === code.file ? lineSet(code.lines) : new Set<number>();
  const preRef = useRef<HTMLPreElement>(null);
  const interactive = mode !== "audience";

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const first = pre.querySelector<HTMLElement>('.code__line[data-highlighted="true"]');
    if (!first) return;
    const preRect = pre.getBoundingClientRect();
    const scale = pre.offsetWidth ? preRect.width / pre.offsetWidth : 1;
    const lineTop = (first.getBoundingClientRect().top - preRect.top) / scale + pre.scrollTop;
    const target = lineTop - pre.clientHeight / 2 + first.offsetHeight / 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    pre.scrollTo({ top: Math.max(target, 0), behavior: reduced ? "auto" : "smooth" });
  }, [activeFile, key]);

  return (
    <div className="code code--page" data-has-highlight={highlighted.size > 0}>
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
            {TAB_LABEL[f.lang] ?? f.file}
          </button>
        ))}
      </div>
      <pre className="code__pre code__pre--plain" ref={preRef} tabIndex={interactive ? 0 : -1}>
        <code className="code__code" data-lang={file?.lang}>
          {file?.lines.map((node, i) => (
            <span className="code__line" data-line={i + 1} data-highlighted={highlighted.has(i + 1)} key={i}>
              {node}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
