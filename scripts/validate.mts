/**
 * Content validator for the demo slides (docs/demo-plan.md, E6.1). Loads the real slide and demo
 * modules, so run it with the react-server condition (`pnpm check`), which turns `server-only`
 * into an empty module:
 *
 *   node --conditions=react-server --import tsx scripts/validate.mts [--strict] [demo-id]
 *
 * Errors (exit 1): a step points at a missing file or lines outside it, a source line is wider
 * than the code panel, a "before" step on a demo without a legacy document, a target whose id,
 * class or attribute never appears in the html it spotlights, a declared state that no step uses,
 * or a step state missing from a declared `liveStates` list.
 * Warnings (exit 0, or 1 with --strict): a frame demo whose first step declares no `liveState`
 * (it is not clicker-driven yet), a step without any effective state, a legacy document on a grid
 * or terminal demo.
 */
import type { CodeFile, CodeStep, Demo, Slide } from "@/content/schema";
import { slides } from "@/lib/content";
import { highlightSet, resolveLive, stepPhase } from "@/lib/steps";

const MAX_COLS = 56;
const args = process.argv.slice(2);
const strict = args.includes("--strict");
const only = args.find((a) => !a.startsWith("--"));

let errors = 0;
let warnings = 0;
const error = (id: string, msg: string) => {
  errors++;
  console.log(`  ✖ ${id}: ${msg}`);
};
const warn = (id: string, msg: string) => {
  warnings++;
  console.log(`  ! ${id}: ${msg}`);
};

/** id, class and attribute names a selector mentions; enough to catch a renamed element. */
function selectorTokens(selector: string): { ids: string[]; classes: string[]; attrs: string[] } {
  return {
    ids: [...selector.matchAll(/#([\w-]+)/g)].map((m) => m[1]),
    classes: [...selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]),
    attrs: [...selector.matchAll(/\[([\w-]+)/g)].map((m) => m[1]),
  };
}

function checkFiles(id: string, files: CodeFile[], label: string) {
  for (const f of files) {
    const lines = f.source.split("\n");
    const wide = lines.map((l, i) => [i + 1, l.length] as const).filter(([, n]) => n > MAX_COLS);
    if (wide.length) error(id, `${label}${f.file}: ${wide.length} line(s) over ${MAX_COLS} cols: ${wide.map(([n, w]) => `${n}(${w})`).join(" ")}`);
  }
}

function checkStep(demo: Demo, i: number, step: CodeStep, kind: "split" | "grid" | "terminal") {
  const id = `${demo.id} ${step.id}`;
  const phase = stepPhase(step);
  const set = phase === "before" ? demo.legacy?.code : demo.code;
  if (phase === "before" && !demo.legacy) error(id, `phase "before" but the demo has no legacy document`);
  const files = set ?? demo.code;
  const file = step.file ?? files[0]?.file;
  const source = files.find((f) => f.file === file);
  if (!source) {
    error(id, `file "${file}" is not in the ${phase === "before" ? "legacy" : "native"} file list`);
  } else {
    const count = source.source.split("\n").length;
    const bad = [...highlightSet(step.highlight)].filter((n) => n < 1 || n > count);
    if (bad.length) error(id, `${file}: lines ${bad.join(",")} outside 1..${count}`);
  }
  if (step.target) {
    const html = files
      .filter((f) => f.lang === "html")
      .map((f) => f.source)
      .join("\n");
    const { ids, classes, attrs } = selectorTokens(step.target);
    for (const t of ids) if (!new RegExp(`id="${t}"`).test(html)) error(id, `target "${step.target}": no element with id "${t}" in the html`);
    for (const t of classes) if (!new RegExp(`class="[^"]*\\b${t}\\b`).test(html)) error(id, `target "${step.target}": no element with class "${t}" in the html`);
    for (const t of attrs) if (!new RegExp(`\\s${t}(=|\\s|>|/)`).test(html)) error(id, `target "${step.target}": attribute "${t}" never appears in the html`);
    if (!ids.length && !classes.length && !attrs.length && !/^[a-z][\w-]*$/i.test(step.target.trim())) warn(id, `target "${step.target}" has nothing the validator can check`);
    if (phase === "after") warn(id, `target on an "after" step; spotlight is meant for code (or before) steps`);
  }
  if (kind !== "terminal") {
    const live = resolveLive(demo, i);
    if (live.state === undefined) warn(id, `no effective state (no liveState on this step or any before it)`);
    if (step.liveState && demo.liveStates && !demo.liveStates.includes(step.liveState)) error(id, `liveState "${step.liveState}" is not in Demo.liveStates`);
  }
}

function checkDemo(slide: Slide, demo: Demo) {
  const kind = slide.layout === "demo-grid" ? "grid" : slide.layout === "terminal" ? "terminal" : "split";
  const id = demo.id;
  console.log(`\n== ${id} (slide ${slide.index}, ${kind})`);
  checkFiles(id, demo.code, "");
  if (demo.legacy) {
    checkFiles(id, demo.legacy.code, "legacy ");
    if (kind !== "split") warn(id, `legacy document on a ${kind} demo; only demo-split slides show the "before" beat`);
  }
  demo.steps.forEach((step, i) => checkStep(demo, i, step, kind));
  if (kind !== "terminal") {
    const first = demo.steps[0];
    if (first && !first.liveState) warn(id, `first step has no liveState: the demo is not clicker-driven yet`);
    if (demo.liveStates) {
      const used = new Set(demo.steps.map((s) => s.liveState).filter(Boolean));
      for (const s of demo.liveStates) if (!used.has(s)) error(id, `liveStates entry "${s}" is used by no step`);
    }
  }
  console.log(`  ${demo.steps.length} step(s): ${demo.steps.map((s, i) => `${s.id}/${stepPhase(s)}${resolveLive(demo, i).state ? `=${resolveLive(demo, i).state}` : ""}`).join(" ")}`);
}

let seen = 0;
for (const slide of slides) {
  for (const demo of slide.demo ? [slide.demo] : (slide.demos ?? [])) {
    if (only && demo.id !== only) continue;
    seen++;
    checkDemo(slide, demo);
  }
}
if (only && seen === 0) error(only, "no demo with that id");

console.log(`\n${seen} demo(s), ${errors} error(s), ${warnings} warning(s)${strict ? " (strict)" : ""}`);
process.exit(errors || (strict && warnings) ? 1 : 0);
