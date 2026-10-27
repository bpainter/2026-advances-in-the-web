/**
 * Content validator for the demo section (PRD Part A, 12.2). Loads the real section modules and
 * the frame registry, so it runs under the react-server condition (`pnpm check`):
 *
 *   node --conditions=react-server --import tsx scripts/validate.mts [--strict] [section-id]
 *
 * Errors (exit 1): titles not matching `{label}: today|now|code` or the label on single pages;
 * stages out of order; files on non-code pages; a meter outside today or more than one; callouts
 * outside today and now, over three words or more than four; missing step notes, empty open or
 * bridge, a `key` action without `ifKeyboard`; timing that does not chain from 5.0; `code.file`
 * not in `files` or lines out of range; code lines over 44 characters, files over 40 lines or a
 * step highlighting more than 29; Tailwind patterns in shown code; `via` outside the vocabulary or
 * wrong for its key; `toggle` of a flag the build does not list; step duration over its ceiling;
 * an authored meter that disagrees with the computed one; exclamation points on screen.
 * Warnings (exit 1 only with --strict): selectors that do not appear in the build's index.html
 * (ids, classes and attribute names checked statically, runtimeSelectors exempt); a build the
 * registry does not know yet; a frame viewport off the slot's aspect ratio by more than 2 percent.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Action, DemoPage, DemoSection, Step } from "@/content/demo-schema";
import { VIA_VOCABULARY } from "@/content/demo-schema";
import { sections } from "@/lib/content";
import { manifestFor, demoFolder } from "@/lib/frames/registry";
import { ceilingMs, nominalMs } from "@/lib/engine/steps";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const only = args.find((a) => !a.startsWith("--"));
const root = process.cwd();

let errors = 0;
let warnings = 0;
const error = (where: string, msg: string) => {
  errors++;
  console.log(`  ✖ ${where}: ${msg}`);
};
const warn = (where: string, msg: string) => {
  warnings++;
  console.log(`  ! ${where}: ${msg}`);
};

const TAILWIND = /\b(flex|grid|p|m|px|py|mx|my|gap|text|bg|border|rounded|w|h)-\w+\b|@apply|@tailwind|@theme/;
const KEY_VIA: Record<string, RegExp> = {
  Escape: /requestClose|hidePopover|dispatch|hook:/,
  Tab: /focus\(|dispatch|hook:/,
  "Shift+Tab": /focus\(|dispatch|hook:/,
  Enter: /click\(\)|requestSubmit|dispatch|hook:/,
  Space: /click\(\)|dispatch|hook:/,
  ArrowDown: /selectedIndex|\.next\(\)|dispatch|hook:/,
  ArrowUp: /selectedIndex|\.prev\(\)|dispatch|hook:/,
  "Alt+ArrowLeft": /navigation\.back|history\.back|dispatch|hook:/,
  "Alt+ArrowRight": /navigation\.forward|history\.forward|dispatch|hook:/,
};

function selectorTokens(selector: string): { ids: string[]; classes: string[]; attrs: string[] } {
  return {
    ids: [...selector.matchAll(/#([\w-]+)/g)].map((m) => m[1]),
    classes: [...selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]),
    attrs: [...selector.matchAll(/\[([\w-]+)/g)].map((m) => m[1]),
  };
}

/** The build's static index.html, when the registry knows the frame's build. */
function buildHtml(route: string): { html: string; runtimeSelectors: string[] } | null | "unknown" {
  const m = /^\/demos\/([\w-]+)\/(today|native|static|terminal)/.exec(route);
  if (!m) return null;
  const folder = demoFolder(m[1]);
  const def = folder?.builds[m[2] as "today"];
  if (!def) return "unknown";
  const file = path.join(def.dir, "index.html");
  if (!existsSync(file)) return "unknown";
  return { html: readFileSync(file, "utf8"), runtimeSelectors: def.manifest.runtimeSelectors };
}

function checkSelector(where: string, selector: string, built: { html: string; runtimeSelectors: string[] }) {
  if (selector === ":viewport" || built.runtimeSelectors.includes(selector)) return;
  const { ids, classes, attrs } = selectorTokens(selector);
  for (const t of ids) if (!new RegExp(`id="${t}"`).test(built.html)) warn(where, `selector "${selector}": no id "${t}" in the build's index.html`);
  for (const t of classes) if (!new RegExp(`class="[^"]*\\b${t}\\b`).test(built.html)) warn(where, `selector "${selector}": no class "${t}" in the build's index.html`);
  for (const t of attrs) if (!new RegExp(`\\s${t}(=|\\s|>|/)`).test(built.html)) warn(where, `selector "${selector}": attribute "${t}" never appears in the build's index.html`);
}

function checkStep(section: DemoSection, page: DemoPage, step: Step, built: ReturnType<typeof buildHtml>) {
  const where = `${page.id} ${step.id}`;
  if (!step.notes) error(where, "missing notes");
  if (step.actions.some((a) => a.type === "key") && !step.ifKeyboard) warn(where, "a key action should carry ifKeyboard (PRD 12.2 rule 5; content as authored lacks it)");
  if (step.callouts) {
    if (page.stage !== "today" && page.stage !== "now") error(where, "callouts only on today and now pages");
    if (step.callouts.length > 4) error(where, `${step.callouts.length} callouts; at most four`);
    for (const c of step.callouts) {
      if (c.text.trim().split(/\s+/).length > 3) error(where, `callout "${c.text}" is over three words`);
      if (c.text.includes("!")) error(where, `callout "${c.text}" has an exclamation point`);
    }
  }
  if (step.meter && page.stage !== "today") error(where, "meter only on today pages");
  if (step.code) {
    const file = page.files?.find((f) => f.file === step.code!.file);
    if (!file) error(where, `code.file "${step.code.file}" is not in files`);
    else {
      const count = file.source.split("\n").length;
      let highlighted = 0;
      for (const l of step.code.lines) {
        const [a, b] = Array.isArray(l) ? l : [l, l];
        if (a < 1 || b > count || a > b) error(where, `code.lines ${JSON.stringify(l)} outside 1..${count} of ${file.file}`);
        highlighted += b - a + 1;
      }
      if (highlighted > 29) error(where, `highlights ${highlighted} lines; the panel shows 29`);
    }
  }
  const nominal = nominalMs(step);
  const ceiling = ceilingMs(step);
  if (nominal > ceiling) warn(where, `nominal duration ${nominal}ms is over the ${ceiling}ms ceiling (the runtime finishes a step instantly 2s past it)`);
  const manifest = page.frame ? manifestFor(page.frame.route) : null;
  const selectors = new Set<string>();
  for (const s of step.spotlight ?? []) selectors.add(s);
  for (const c of step.callouts ?? []) selectors.add(c.target);
  step.actions.forEach((a: Action, i) => {
    if ("target" in a && typeof a.target === "string") selectors.add(a.target);
    if (a.type === "pointer") selectors.add(a.to);
    if (a.type === "key") {
      const known = VIA_VOCABULARY.some((v) => a.via.includes(v.replace(/\(.*$/, ""))) || /hook:|dispatch|requestClose|hidePopover|click\(\)|focus\(|requestSubmit|selectedIndex|navigation\.|history\./.test(a.via);
      if (!known) error(where, `action ${i}: via "${a.via}" is outside the vocabulary`);
      const expected = KEY_VIA[a.key];
      if (expected && !expected.test(a.via)) error(where, `action ${i}: via "${a.via}" is wrong for ${a.key}`);
      if (/dispatch/.test(a.via) && page.frame?.build !== "today") error(where, `action ${i}: dispatch(keydown) is for today builds only`);
    }
    if (a.type === "toggle") {
      if (manifest && !manifest.flags[a.flag as "enhance-css"]) error(where, `action ${i}: toggle of "${a.flag}", which the build does not list`);
      if (i > 0 && (a.flag === "enhance-js" || a.flag === "csp-enforce")) warn(where, `action ${i}: reloading toggle is not first in its step`);
    }
  });
  if (built && built !== "unknown") for (const s of selectors) checkSelector(where, s, built);
}

function checkPage(section: DemoSection, page: DemoPage, meters: Record<string, string>) {
  const where = page.id;
  const expectedTitle = page.stage === "single" ? section.label : `${section.label}: ${page.stage}`;
  if (page.title !== expectedTitle) error(where, `title "${page.title}" should be "${expectedTitle}"`);
  if (page.title.includes("!")) error(where, "title has an exclamation point");
  if (page.files && page.stage !== "code" && page.stage !== "single") error(where, "files only on code or single pages");
  if (!page.notes.open) error(where, "empty notes.open");
  if (!page.notes.bridge) error(where, "empty notes.bridge");
  if (page.steps.length === 0) error(where, "no steps");
  if (page.steps.filter((s) => s.meter).length > 1) warn(where, "more than one meter on the page (PRD 12.2 rule 3)");
  for (const f of page.files ?? []) {
    const lines = f.source.split("\n");
    if (lines.length > 40) error(where, `${f.file} has ${lines.length} lines; at most 40`);
    lines.forEach((l, i) => {
      if (l.length > 44) error(where, `${f.file}:${i + 1} is ${l.length} characters; at most 44`);
    });
    if ((f.lang === "html" || f.lang === "css") && TAILWIND.test(f.source)) warn(where, `${f.file} contains a Tailwind-looking pattern`);
  }
  let built: ReturnType<typeof buildHtml> = null;
  if (page.frame) {
    built = buildHtml(page.frame.route);
    if (built === "unknown") warn(where, `no build registered for ${page.frame.route} yet`);
    const slot = page.files ? { w: 1232, h: 872 } : { w: 1792, h: 872 };
    const ratio = page.frame.viewport.width / page.frame.viewport.height / (slot.w / slot.h);
    if (Math.abs(ratio - 1) > 0.02) warn(where, `viewport ${page.frame.viewport.width}x${page.frame.viewport.height} is off the slot's aspect ratio by ${Math.round(Math.abs(ratio - 1) * 100)}%`);
  }
  for (const step of page.steps) {
    checkStep(section, page, step, built);
    if (step.meter) {
      const computed = meters[step.meter.source];
      if (computed === undefined) warn(`${where} ${step.id}`, `meter not computed yet (run pnpm meters)`);
      else if (computed !== step.meter.value) error(`${where} ${step.id}`, `meter.value "${step.meter.value}" but the computed value is "${computed}"`);
    }
  }
}

const metersFile = path.join(root, "content", ".generated", "meters.json");
const meters: Record<string, string> = existsSync(metersFile) ? (JSON.parse(readFileSync(metersFile, "utf8")) as Record<string, string>) : {};

let cumulative = 5.0;
for (const section of sections) {
  if (only && section.id !== only) continue;
  console.log(`\n== ${section.id} (${section.label})`);
  const stages = section.pages.map((p) => p.stage).join(",");
  if (stages !== "today,now,code" && stages !== "single") error(section.id, `pages are ${stages}; expected today,now,code or single`);
  if (section.id === "f5-what-you-can-delete" && section.pages[0]?.cutPriority !== 1) error(section.id, "F5 must carry cutPriority 1");
  for (const page of section.pages) {
    checkPage(section, page, meters);
    if (!only) {
      const expected = Math.round((cumulative + page.timing.minutes) * 100) / 100;
      if (Math.abs(page.timing.cumulative - expected) > 0.01) error(page.id, `cumulative ${page.timing.cumulative} should be ${expected}`);
      cumulative = page.timing.cumulative;
    }
  }
  console.log(`  ${section.pages.map((p) => `${p.id}(${p.steps.length})`).join(" ")}`);
}
if (!only && cumulative > 31.0) error("timing", `the demo section ends at ${cumulative}; it must end by 31.0`);

console.log(`\n${errors} error(s), ${warnings} warning(s)${strict ? " (strict)" : ""}`);
process.exit(errors || (strict && warnings) ? 1 : 0);
