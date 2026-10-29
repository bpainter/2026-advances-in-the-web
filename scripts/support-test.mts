/**
 * The PRD v4 section 3.2 table is the fixture: support.json and the live computation must both
 * give these versions and dates, and D6 must read as the PRD's worked sentence.
 *
 *   pnpm test:support
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { sections } from "@/content/sections";
import { computeSupport, webFeaturesEntry, type SupportFile, type WebFeaturesData } from "@/lib/support-data";
import { installedWebFeatures } from "@/lib/web-features";

const TABLE: [string, string, (string | null)[], string | null][] = [
  ["d1-order-actions", "dialog", ["37", "79", "98", "15.4"], "2022-03-14"],
  ["d2-product-card", "container-queries", ["105", "105", "110", "16"], "2023-02-14"],
  ["d3-support-form", "field-sizing", ["123", "123", "152", "26.2"], "2026-06-16"],
  ["d4-dashboard-navigation", "navigation", ["102", "102", "147", "26.2"], "2026-01-13"],
  ["d5-rich-content", "trusted-types", ["83", "83", "148", "26"], "2026-02-24"],
  ["d6-variant-picker", "customizable-select", ["135", "135", null, "27"], null],
  // compatKeys (still-in-motion-demos.md 3.2): the highest version across anchor-name, position-area
  // and position-try-fallbacks, and their latest Baseline low date.
  ["m1-shop-the-look", "anchor-positioning", ["129", "129", "147", "26"], "2026-01-13"],
];
const ALSO: Record<string, string> = {
  "d1-order-actions": "This demo also uses Popover (January 2025) and Invoker commands (December 2025).",
  "d2-product-card": "This demo also uses @scope (March 2026).",
};
const D6 = "It has been available in Chrome, Edge and Safari since September 2026. Firefox shows a normal select.";

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
// compatKeys on a fixed fixture, apart from the installed data: the highest version per browser
// across the keys, a browser missing from any key is "Not yet", and the since sentence uses the
// latest low date; the whole-feature status (Safari only) is ignored.
const FIXTURE: WebFeaturesData = {
  browsers: {
    chrome: { name: "Chrome", releases: [{ version: "125", date: "2024-05-14" }, { version: "129", date: "2024-09-17" }] },
    edge: { name: "Edge", releases: [{ version: "125", date: "2024-05-17" }, { version: "129", date: "2024-09-19" }] },
    firefox: { name: "Firefox", releases: [{ version: "147", date: "2026-01-13" }] },
    safari: { name: "Safari", releases: [{ version: "26", date: "2025-09-15" }, { version: "26.2", date: "2025-12-12" }] },
  },
  features: {
    demo: {
      name: "Demo feature",
      status: {
        baseline: false,
        support: { safari: "27" },
        by_compat_key: {
          "css.a": { baseline: "low", baseline_low_date: "2025-09-15", support: { chrome: "125", edge: "125", firefox: "147", safari: "26.2" } },
          "css.b": { baseline: "low", baseline_low_date: "2026-01-13", support: { chrome: "129", edge: "129", firefox: "147", safari: "26" } },
          "css.c": { baseline: false, support: { chrome: "129", edge: "129", safari: "26" } },
        },
      },
    },
  },
};
const ab = webFeaturesEntry(FIXTURE, { kind: "web-features", id: "demo", compatKeys: ["css.a", "css.b"] });
check(JSON.stringify(ab.tiles.map((t) => t.version)) === JSON.stringify(["129", "129", "147", "26.2"]), `compatKeys: highest version per browser (got ${ab.tiles.map((t) => t.version).join(", ")})`);
check(ab.since === "It has been available in all four browsers since January 2026.", `compatKeys: since uses the latest low date ("${ab.since}")`);
const abc = webFeaturesEntry(FIXTURE, { kind: "web-features", id: "demo", compatKeys: ["css.a", "css.b", "css.c"], fallback: { missing: ["firefox"], text: "a fallback" } });
check(abc.tiles[2].version === null && abc.baseline === false, "compatKeys: a browser missing from one key is Not yet, and the set is not Baseline");
check(file.version === wf.version, `support.json is from web-features ${wf.version}`);
console.log(`\n${failed ? `${failed} failed` : "all passed"}`);
process.exit(failed ? 1 : 0);
