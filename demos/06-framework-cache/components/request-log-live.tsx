"use client";

import { useEffect, useState } from "react";
import type { LogKind, LogLine } from "@/lib/log";

/**
 * Rows newest first. Only the latest row of each kind carries `log-row--<kind>`, so the
 * section's selectors (callouts and spotlights) match exactly that row; older rows keep
 * `data-kind` for styling and the digest probe.
 */
export function RequestLogRows({ session, initial }: { session: string; initial: LogLine[] }) {
  const [lines, setLines] = useState<LogLine[]>(initial);

  useEffect(() => {
    // presenter.js is already loading the page again: no stream for a document on its way out.
    if (document.documentElement.hasAttribute("data-unloading")) return;
    const last = initial.length ? initial[initial.length - 1].seq : 0;
    const source = new EventSource(
      `/__demo/log?after=${last}&session=${encodeURIComponent(session)}`,
    );
    source.addEventListener("line", (e) => {
      const line = JSON.parse((e as MessageEvent<string>).data) as LogLine;
      if (line.session !== session) return;
      setLines((prev) => (prev.some((l) => l.seq === line.seq) ? prev : [...prev, line]));
    });
    source.addEventListener("reset", (e) => {
      const data = JSON.parse((e as MessageEvent<string>).data) as { session: string };
      if (data.session === session) setLines([]);
    });
    const onReset = () => setLines([]);
    window.addEventListener("f2:reset", onReset);
    // Closed before the document goes (presenter.js loads the page again), so WebKit does not
    // report the stream the load cancels as a failed request.
    const onLeave = () => source.close();
    window.addEventListener("f2:unloading", onLeave);
    window.addEventListener("pagehide", onLeave);
    return () => {
      source.close();
      window.removeEventListener("f2:reset", onReset);
      window.removeEventListener("f2:unloading", onLeave);
      window.removeEventListener("pagehide", onLeave);
    };
  }, [initial, session]);

  if (!lines.length) return <p className="log-empty">No requests yet.</p>;
  const latest = new Set<LogKind>();
  const rows = lines
    .slice()
    .reverse()
    .map((line) => {
      const first = !latest.has(line.kind);
      latest.add(line.kind);
      return { line, className: first ? `log-row log-row--${line.kind}` : "log-row" };
    });
  return (
    <ol className="log-rows">
      {rows.map(({ line, className }) => (
        <li key={line.seq} className={className} data-kind={line.kind} role="row">
          <span className="log-row__request">
            {line.request === null ? "action" : `#${line.request}`}
          </span>
          <span className="log-row__text">{line.text}</span>
          <span className="log-row__cached" data-cached={line.cached}>
            {line.cached}
          </span>
        </li>
      ))}
    </ol>
  );
}
