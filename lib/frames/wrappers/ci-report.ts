import "server-only";
import { BASE_CSS, bar, context, day, esc, readJson } from "./common";
import type { WrapperDef } from "./types";

interface Measurements {
  measuredAt?: string;
  machine?: string;
  node?: string;
  existing?: { vite?: string };
  vite8?: { vite?: string };
}

/**
 * F4 `ci-report` (spec 4.11): a benchmark run report. A run card above the shown table names the
 * fixture app, both Vite versions, the machine and the run count, all from
 * fixtures/vite-measurements.json; the bar carries the measured date. No typed numbers, no pass
 * badges, no repository name.
 */
export const ciReport: WrapperDef = {
  id: "ci-report",
  banned: [{ name: "a typed measurement", pattern: /\d+\s?(ms|KB|MB)\b/ }],
  render: () => {
    const ctx = context();
    const m = readJson<Measurements>("fixtures/vite-measurements.json");
    const measured = m.measuredAt ? `Measured ${day(m.measuredAt)}` : "Not measured";
    const cells: [string, string][] = [
      ["App", "Fixture app"],
      ["Before", m.existing?.vite ? `Vite ${m.existing.vite}` : "Not measured"],
      ["After", m.vite8?.vite ? `Vite ${m.vite8.vite}` : "Not measured"],
      ["Machine", [m.machine?.split(",")[0], m.node ? `Node ${m.node}` : ""].filter(Boolean).join(", ") || "Not measured"],
      ["Runs", ctx.benchmarks.runs],
    ];
    const run = cells.map(([k, v]) => `<div class="wrap-run__cell"><span class="wrap-run__key">${esc(k)}</span><span class="wrap-run__value">${esc(v)}</span></div>`).join("");
    const before = [
      '<div class="wrap wrap--report wrap--ci"><div class="wrap-sheet">',
      bar({ name: ctx.store.name, area: ctx.benchmarks.area, end: [`<span class="wrap-bar__meta">${esc(measured)}</span>`] }),
      '<div class="wrap-body wrap-report">',
      `<section class="wrap-card wrap-run" aria-label="Run">${run}</section>`,
    ].join("");
    return { before, after: "</div></div></div>", shownClass: "wrap-shown--bare", styles: [BASE_CSS, "/wrappers/report.css"], scripts: [] };
  },
};
