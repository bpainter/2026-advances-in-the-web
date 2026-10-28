/**
 * The PRD v4 section 3.2 table is the fixture: support.json and the live computation must both
 * give these versions and dates, and D6 must read as the PRD's worked sentence.
 *
 *   pnpm test:support
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { sections } from "@/content/sections";
import { computeSupport, type SupportFile } from "@/lib/support-data";
import { installedWebFeatures } from "@/lib/web-features";

const TABLE: [string, string, (string | null)[], string | null][] = [
  ["d1-order-actions", "dialog", ["37", "79", "98", "15.4"], "2022-03-14"],
  ["d2-product-card", "container-queries", ["105", "105", "110", "16"], "2023-02-14"],
  ["d3-support-form", "field-sizing", ["123", "123", "152", "26.2"], "2026-06-16"],
  ["d4-dashboard-navigation", "navigation", ["102", "102", "147", "26.2"], "2026-01-13"],
  ["d5-rich-content", "trusted-types", ["83", "83", "148", "26"], "2026-02-24"],
  ["d6-variant-picker", "customizable-select", ["135", "135", null, "27"], null],
];
const ALSO: Record<string, string> = {
  "d1-order-actions": "This demo also uses Popover (January 2025) and Invoker commands (December 2025).",
  "d2-product-card": "This demo also uses @scope (March 2026).",
};
const D6 = "It works in Chrome, Edge and Safari since September 2026. Firefox shows a normal select.";

const wf = installedWebFeatures();
const file = JSON.parse(readFileSync(path.join(process.cwd(), "content", ".generated", "support.json"), "utf8")) as SupportFile;
const live = computeSupport(sections, wf.data, wf.version, file.toolDates);
let failed = 0;
const check = (ok: boolean, msg: string) => {
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✖"} ${msg}`);
};
for (const source of [file, live]) {
  const label = source === file ? "support.json" : "computed";
  for (const [id, feature, versions, low] of TABLE) {
    const e = source.sections[id];
    check(e?.id === feature, `${label} ${id}: feature ${feature}`);
    check(JSON.stringify(e?.tiles.map((t) => t.version)) === JSON.stringify(versions), `${label} ${id}: versions ${versions.map((v) => v ?? "Not yet").join(", ")} (got ${e?.tiles.map((t) => t.version ?? "Not yet").join(", ")})`);
    check((e?.baselineLowDate ?? null) === low, `${label} ${id}: Baseline low date ${low ?? "none"}`);
    if (ALSO[id]) check(e?.alsoUses === ALSO[id], `${label} ${id}: ${ALSO[id]}`);
  }
  check(source.sections["d6-variant-picker"]?.since === D6, `${label} d6: "${D6}"`);
  check(source.sections["d6-variant-picker"]?.tiles[2].version === null, `${label} d6: Firefox is Not yet`);
}
check(file.version === wf.version, `support.json is from web-features ${wf.version}`);
console.log(`\n${failed ? `${failed} failed` : "all passed"}`);
process.exit(failed ? 1 : 0);
