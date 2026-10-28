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
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { sections } from "@/lib/content";
import { DEMO_SECTION_START } from "@/content/sections";
import { demoFolder } from "@/lib/frames/registry";
import { validate, type BuildInfo, type Issue } from "@/lib/validate/rules";
import { TIMING_TABLE, LAST_PAGE_BY } from "@/lib/validate/timing";
import { themeIssues } from "@/lib/validate/theme";
import type { SupportFile } from "@/lib/support-data";
import { installedWebFeatures } from "@/lib/web-features";
import { slides } from "@/lib/content";
import { BACKGROUNDS } from "@/content/backgrounds";
import { jpegSize, validateV5 } from "@/lib/validate/v5";
import { decodeGrainPng, grainPixels } from "@/lib/grain";
import { BACKGROUND_BY_DEMO } from "@/lib/frames/compose";
import { DEMO_FOLDERS } from "@/lib/frames/registry";
import { WRAPPERS } from "@/lib/frames/wrappers";
import { validateWrappers, type WrappedBuild } from "@/lib/validate/wrappers";

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
// PRD v5, 4.7: backgrounds, grain and (from M7) the QR code.
function filesUnder(dir: string, exts: RegExp): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".next-capture", ".git", "recordings", "work"].includes(e.name)) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...filesUnder(abs, exts));
    else if (exts.test(e.name)) out.push(abs);
  }
  return out;
}
const SOURCE_DIRS = ["app", "components", "lib", "content", "scripts", "styles", "demos", "public/theme", "public/portal", "public/runtime"];
const glassMentions = SOURCE_DIRS.flatMap((d) => filesUnder(path.join(root, d), /\.(tsx?|mts|css|js|mjs|html|json)$/))
  .filter((f) => !f.includes(`${path.sep}.generated${path.sep}`) && /\bglass-(fan|petal|lavender|navy|blue)\.jpg/.test(readFileSync(f, "utf8")))
  .map((f) => path.relative(root, f));
const bgDir = path.join(root, "public", "backgrounds");
const v5Issues = validateV5({
  slides: slides.filter((s) => s.layout !== "demo-page").map((s) => ({ id: s.id, background: s.background })),
  sections: sections.map((s) => ({ id: s.id, background: s.background })),
  registry: BACKGROUNDS,
  fileInfo: (file) => {
    const abs = path.join(bgDir, "v5", file);
    if (!existsSync(abs)) return null;
    const buf = readFileSync(abs);
    const size = jpegSize(buf);
    return { width: size?.width ?? 0, height: size?.height ?? 0, bytes: statSync(abs).size, sha256: createHash("sha256").update(buf).digest("hex") };
  },
  backgroundsDir: existsSync(bgDir) ? readdirSync(bgDir).filter((n) => !n.startsWith(".")) : [],
  glassMentions,
  stats: readJson(path.join(root, "content", ".generated", "backgrounds.json")),
  // The closing slide (PRD v5, 4.6) lands in M7; its background is registered from M2.
  pending: slides.some((s) => s.id === "closing") ? [] : ["closing"],
  grain: { committed: existsSync(path.join(root, "public", "theme", "grain.png")) ? decodeGrainPng(readFileSync(path.join(root, "public", "theme", "grain.png"))) : null, fresh: grainPixels() },
});
// Frames default to their demo folder's section background (lib/frames/compose.ts): keep it in step.
for (const s of sections) {
  for (const p of s.pages) {
    const m = "frame" in p ? /^\/demos\/([\w-]+)\//.exec(p.frame.route) : null;
    if (m && BACKGROUND_BY_DEMO[m[1]] !== s.background) v5Issues.push({ rule: "bg-frame", where: p.id, message: `frames of ${m[1]} default to "${BACKGROUND_BY_DEMO[m[1]] ?? "none"}"; the section uses "${s.background}" (lib/frames/compose.ts)`, level: "error" });
  }
}
// Wrappers (PRD v5, 2.1 and 4.7): every frame build's wrapper, its CSS, markup and scripts, and no
// shown file using the wrap- prefix. Folders still on the v4 shell are pending until M5.
const PENDING_WRAPPERS = new Set<string>([]);
const publicText = (href: string) => {
  const abs = path.join(root, "public", href);
  return existsSync(abs) ? readFileSync(abs, "utf8") : "";
};
const wrappedBuilds: WrappedBuild[] = Object.values(DEMO_FOLDERS).flatMap((folder) =>
  Object.values(folder.builds).map((def) => {
    const w = def!.manifest.wrapper;
    const where = `${folder.demo}/${def!.manifest.build}`;
    const shownHasMain = existsSync(path.join(def!.dir, "index.html")) && /<main\b/i.test(readFileSync(path.join(def!.dir, "index.html"), "utf8"));
    if (!w) return { where, wrapperId: null, known: false, pending: PENDING_WRAPPERS.has(folder.demo), markup: "", css: [], scripts: [], banned: [], shownHasMain };
    const wdef = WRAPPERS[w.id];
    if (!wdef) return { where, wrapperId: w.id, known: false, markup: "", css: [], scripts: [], banned: [], shownHasMain };
    const r = wdef.render({ build: def!.manifest.build, demo: folder.demo });
    return {
      where,
      wrapperId: w.id,
      known: true,
      markup: r.before + r.after,
      css: r.styles.map((href) => ({ file: `public${href}`, text: publicText(href) })),
      scripts: r.scripts.map((href) => ({ file: `public${href}`, text: publicText(href) })),
      banned: wdef.banned,
      shownHasMain,
    };
  }),
);
// The code panel's files (shown files and excerpts of the today builds), as the panel shows them.
const shownFiles = sections.flatMap((sec) => sec.pages.flatMap((pg) => ("files" in pg && pg.files ? pg.files.map((f) => ({ path: `${pg.id}/${f.file}`, text: f.source })) : [])));
const wrapperIssues = validateWrappers(wrappedBuilds, shownFiles);

const issues: Issue[] = [...all, ...(only ? [] : [...themeIssues(root), ...v5Issues, ...wrapperIssues])];

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
