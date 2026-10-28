/**
 * Content validator for the demo section (docs/PRD-demos-v4.md 7.5, with the caps of
 * docs/design/demo-flow-cx.md). The rules live in lib/validate/rules.ts; this script gathers the
 * context (web-features, support.json, meters, builds, public files, the theme) and prints the
 * result. Loads the real section modules and the frame registry, so it runs under the
 * react-server condition (`pnpm check`):
 *
 *   node --conditions=react-server --import tsx scripts/validate.mts [--strict] [section-id]
 *
 * Errors exit 1; warnings exit 1 only with --strict.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { sections } from "@/lib/content";
import { DEMO_SECTION_START } from "@/content/sections";
import { demoFolder } from "@/lib/frames/registry";
import { validate, type BuildInfo, type Issue } from "@/lib/validate/rules";
import { TIMING_TABLE, LAST_PAGE_BY } from "@/lib/validate/timing";
import { themeIssues } from "@/lib/validate/theme";
import type { SupportFile } from "@/lib/support-data";
import { installedWebFeatures } from "@/lib/web-features";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const only = args.find((a) => !a.startsWith("--"));
const root = process.cwd();

function readJson<T>(file: string): T | null {
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as T) : null;
}

const webFeatures = installedWebFeatures(root);

function build(route: string): BuildInfo | "unknown" | null {
  const m = /^\/demos\/([\w-]+)\/(today|native|static|terminal)/.exec(route);
  if (!m) return null;
  const def = demoFolder(m[1])?.builds[m[2] as "today"];
  if (!def) return "unknown";
  const file = path.join(def.dir, "index.html");
  if (!existsSync(file)) return "unknown";
  return { html: readFileSync(file, "utf8"), runtimeSelectors: def.manifest.runtimeSelectors, flags: def.manifest.flags };
}

const all = validate(sections, {
  timing: only ? undefined : TIMING_TABLE,
  start: DEMO_SECTION_START,
  lastPageBy: LAST_PAGE_BY,
  webFeatures,
  support: readJson<SupportFile>(path.join(root, "content", ".generated", "support.json")),
  meters: readJson<Record<string, string>>(path.join(root, "content", ".generated", "meters.json")) ?? {},
  publicFile: (p) => existsSync(path.join(root, "public", p)),
  repoFile: (p) => (existsSync(path.join(root, p)) ? readFileSync(path.join(root, p), "utf8") : null),
  build,
});
const issues: Issue[] = [...all, ...(only ? [] : themeIssues(root))];

const inScope = (i: Issue) => !only || i.where.startsWith(only.split("-")[0]) || i.where === only;
let errors = 0;
let warnings = 0;
let todos = 0;
const groups = new Map<string, Issue[]>();
for (const i of issues.filter(inScope)) {
  const key = sections.find((s) => i.where.startsWith(s.id) || s.pages.some((p) => i.where.startsWith(p.id)))?.id ?? "deck";
  groups.set(key, [...(groups.get(key) ?? []), i]);
}
for (const s of sections) {
  if (only && s.id !== only) continue;
  console.log(`\n== ${s.id} (${s.label}) ${s.pages.map((p) => `${p.id}(${p.steps.length})`).join(" ")}`);
  for (const i of groups.get(s.id) ?? []) print(i);
}
if (groups.get("deck")?.length) {
  console.log("\n== deck");
  for (const i of groups.get("deck")!) print(i);
}
function print(i: Issue) {
  if (i.level === "error") errors++;
  else warnings++;
  if (i.rule === "todo") todos++;
  console.log(`  ${i.level === "error" ? "✖" : "!"} [${i.rule}] ${i.where}: ${i.message}`);
}
const other = errors - todos;
console.log(`\n${errors} error(s) (${todos} TODO, ${other} other), ${warnings} warning(s)${strict ? " (strict)" : ""}`);
process.exit(errors || (strict && warnings) ? 1 : 0);
