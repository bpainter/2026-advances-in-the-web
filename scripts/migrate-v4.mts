/**
 * One-off migration of content/sections from schema v3 to v4 (docs/PRD-demos-v4.md, 7.2). Run it
 * once, commit the result and delete this script:
 *
 *   node --conditions=react-server --import tsx scripts/migrate-v4.mts
 *
 * - today pages become used-to pages (viewport 640 by 628, callouts dropped, meter on the last step);
 * - now and code pages merge into one now page (code steps first, then the now page's proof steps;
 *   steps over the cap are kept and labeled `TODO cut:`);
 * - `open` becomes `intro`, each step's `notes` is split into one bullet per sentence, all marked
 *   `TODO rewrite:`;
 * - intro pages are created with a `TODO` description and visual;
 * - D6 is created as a skeleton from F1's select teaser steps (filled in by M6).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";

const root = process.cwd();
const SECTIONS = path.join(root, "content", "sections");

type V3Section = any;
type V3Page = any;
type V3Step = any;

const ids = [
  "d1-order-actions",
  "d2-product-card",
  "d3-support-form",
  "d4-dashboard-navigation",
  "d5-rich-content",
  "f1-still-in-motion",
  "f2-caching",
  "f3-package-trust",
  "f4-vite-8-locally",
  "f5-what-you-can-delete",
];

const v3: Record<string, V3Section> = {};
for (const id of ids) v3[id] = (await import(path.join(SECTIONS, `${id}.ts`))).section;

/** Feature names and support sources (PRD 2.1, 2.4). */
const META: Record<string, { feature?: string; support?: unknown }> = {
  "d1-order-actions": { feature: "Dialog element", support: { kind: "web-features", id: "dialog", alsoUses: ["popover", "invoker-commands"] } },
  "d2-product-card": { feature: "Container queries", support: { kind: "web-features", id: "container-queries", alsoUses: ["scope"] } },
  "d3-support-form": { feature: "Field sizing", support: { kind: "web-features", id: "field-sizing" } },
  "d4-dashboard-navigation": { feature: "Navigation API", support: { kind: "web-features", id: "navigation" } },
  "d5-rich-content": { feature: "Trusted Types", support: { kind: "web-features", id: "trusted-types" } },
  "d6-variant-picker": { feature: "Customizable select", support: { kind: "web-features", id: "customizable-select", fallback: { missing: ["firefox"], text: "a normal select" } } },
  "f2-caching": {
    feature: "Cache Components",
    support: { kind: "tooling", packages: [{ name: "Next.js", npm: "next", version: "16", logo: "/logos/nextjs.svg" }] },
  },
  "f3-package-trust": {
    feature: "Package trust",
    support: {
      kind: "tooling",
      packages: [
        { name: "pnpm", npm: "pnpm", version: "12.11", logo: "/logos/pnpm.svg" },
        { name: "npm", npm: "npm", version: "11.15", logo: "/logos/npm.svg" },
      ],
    },
  },
};

/** Minutes per page (PRD 7.4). */
const MINUTES: Record<string, number[]> = {
  "d1-order-actions": [0.25, 0.5, 2.25],
  "d2-product-card": [0.25, 0.5, 1.75],
  "d3-support-form": [0.25, 0.5, 1.75],
  "d4-dashboard-navigation": [0.25, 0.5, 2.25],
  "d5-rich-content": [0.25, 0.5, 2.0],
  "d6-variant-picker": [0.25, 0.5, 1.5],
  "f1-still-in-motion": [1.0],
  "f2-caching": [0.25, 0.75, 2.25],
  "f3-package-trust": [0.25, 0.5, 2.25],
  "f4-vite-8-locally": [0.5],
  "f5-what-you-can-delete": [0.75],
};
const CUT: Record<string, number> = { "f5-what-you-can-delete": 1, "f4-vite-8-locally": 2, "f1-still-in-motion": 4 };
const ORDER = ["d1-order-actions", "d2-product-card", "d3-support-form", "d4-dashboard-navigation", "d5-rich-content", "d6-variant-picker", "f1-still-in-motion", "f2-caching", "f3-package-trust", "f4-vite-8-locally", "f5-what-you-can-delete"];

const todo = (s: string) => (s ? `TODO rewrite: ${s}` : "TODO rewrite");
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.?!:])\s+(?=[A-Z"'(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
const bulletsOf = (notes: string | undefined) => sentences(notes ?? "").map(todo);

function walkStep(step: V3Step, i: number, opts: { keepCallouts: boolean; codeFallback: boolean }) {
  const out: any = { id: `s${i}`, label: step.label, actions: step.actions };
  if (step.code) out.code = step.code;
  else if (opts.codeFallback) out.code = { file: "TODO", lines: [] };
  if (step.spotlight) out.spotlight = step.spotlight;
  if (opts.keepCallouts && step.callouts?.length) out.callouts = step.callouts.slice(0, 2);
  out.bullets = bulletsOf(step.notes);
  if (step.ifKeyboard) out.ifKeyboard = todo(step.ifKeyboard);
  if (step.proof) out.proof = step.proof;
  if (step.poster) out.poster = step.poster;
  return out;
}

function capSteps(steps: any[], cap: number) {
  steps.forEach((s, i) => {
    if (i > cap) s.label = `TODO cut: ${s.label}`;
  });
  return steps;
}

function frameOf(frame: any, viewport: { width: number; height: number }, extra?: any) {
  const out: any = { ...frame, viewport };
  if (extra?.hooks) out.hooks = [...new Set([...(frame.hooks ?? []), ...extra.hooks])];
  if (extra?.flags) out.flags = { ...extra.flags, ...(frame.flags ?? {}) };
  if (out.flags && Object.keys(out.flags).length === 0) delete out.flags;
  return out;
}

function introPage(prefix: string, sectionId: string, minutes: number) {
  return {
    id: `${prefix}-intro`,
    stage: "intro",
    intro: "TODO rewrite",
    description: "TODO description",
    visual: { src: `/intro/${sectionId}.png`, alt: "TODO alt", capture: { pageId: `${prefix}-now`, stepId: "s1" } },
    steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
    timing: { minutes },
  };
}

function usedToPage(prefix: string, feature: string, today: V3Page, minutes: number) {
  const steps = today.steps.map((s: V3Step, i: number) => walkStep(s, i, { keepCallouts: false, codeFallback: true }));
  const meterStep = today.steps.find((s: V3Step) => s.meter);
  if (meterStep) {
    for (const s of steps) delete s.meter;
    steps[steps.length - 1].meter = meterStep.meter;
  }
  return {
    id: `${prefix}-used-to`,
    stage: "used-to",
    eyebrow: feature,
    title: "How we used to do it",
    intro: todo(today.notes.open),
    frame: frameOf(today.frame, { width: 640, height: 628 }),
    files: [],
    steps: capSteps(steps, 3),
    timing: { minutes },
  };
}

function nowPage(prefix: string, feature: string, now: V3Page, code: V3Page, minutes: number) {
  const codeSteps = code.steps.map((s: V3Step) => walkStep(s, 0, { keepCallouts: true, codeFallback: true }));
  const proofSteps = now.steps.filter((s: V3Step) => s.proof).map((s: V3Step) => walkStep(s, 0, { keepCallouts: true, codeFallback: true }));
  const steps = [...codeSteps, ...proofSteps].map((s, i) => ({ ...s, id: `s${i}` }));
  return {
    id: `${prefix}-now`,
    stage: "now",
    eyebrow: feature,
    title: "How we do it now",
    intro: todo(now.notes.open),
    frame: frameOf(code.frame, { width: 640, height: 628 }, { hooks: now.frame?.hooks, flags: now.frame?.flags }),
    files: code.files ?? [],
    steps: capSteps(steps, 6),
    timing: { minutes },
  };
}

function singlePage(page: V3Page, label: string, minutes: number, cut?: number) {
  const out: any = {
    id: page.id,
    stage: "single",
    title: label,
    intro: todo(page.notes.open),
    frame: frameOf(page.frame, { width: 1304, height: 628 }),
  };
  if (page.files) out.files = page.files;
  out.steps = capSteps(page.steps.map((s: V3Step, i: number) => walkStep(s, i, { keepCallouts: false, codeFallback: false })), 5);
  out.timing = { minutes };
  if (cut) out.cutPriority = cut;
  return out;
}

function migrate(id: string): any {
  const s = v3[id];
  const meta = META[id] ?? {};
  const minutes = MINUTES[id];
  const prefix = id.split("-")[0];
  const base: any = { id, order: ORDER.indexOf(id) + 1, label: s.label };
  if (meta.feature) base.feature = meta.feature;
  base.scenario = todo(s.scenario);
  if (meta.support) base.support = meta.support;
  let pages: any[];
  if (s.pages.length === 1) {
    pages = [singlePage(s.pages[0], s.label, minutes[0], CUT[id])];
  } else {
    const [today, now, code] = s.pages;
    pages = [introPage(prefix, id, minutes[0]), usedToPage(prefix, meta.feature!, today, minutes[1]), nowPage(prefix, meta.feature!, now, code, minutes[2])];
  }
  return { ...base, pages, citations: s.citations, cautions: s.cautions.map(todo) };
}

/** D6 skeleton from F1's select teaser (PRD 2.2); M6 builds it out. */
function d6(): any {
  const f1 = v3["f1-still-in-motion"].pages[0];
  const teaser = f1.steps.filter((s: V3Step) => /select|Opt in|Firefox/i.test(s.label));
  const meta = META["d6-variant-picker"];
  const steps = [{ id: "s0", label: "Plain select", actions: [], code: { file: "TODO", lines: [] }, bullets: [] }, ...teaser.map((s: V3Step, i: number) => ({ ...walkStep(s, i + 1, { keepCallouts: true, codeFallback: true }), code: { file: "TODO", lines: [] } }))];
  return {
    id: "d6-variant-picker",
    order: 6,
    label: "Variant picker",
    feature: meta.feature,
    scenario: "TODO rewrite: A product editor in the portal. The Color field is a select with a swatch beside each name.",
    support: meta.support,
    pages: [
      introPage("d6", "d6-variant-picker", 0.25),
      {
        id: "d6-used-to",
        stage: "used-to",
        eyebrow: meta.feature,
        title: "How we used to do it",
        intro: "TODO rewrite",
        frame: { build: "today", route: "/demos/11-customizable-select/today", viewport: { width: 640, height: 628 }, hooks: ["reset"] },
        files: [],
        steps: [{ id: "s0", label: "Hand-rolled combobox", actions: [], code: { file: "TODO", lines: [] }, bullets: [] }],
        timing: { minutes: 0.5 },
      },
      {
        id: "d6-now",
        stage: "now",
        eyebrow: meta.feature,
        title: "How we do it now",
        intro: "TODO rewrite",
        frame: { build: "native", route: "/demos/11-customizable-select/native", viewport: { width: 640, height: 628 }, flags: { "enhance-css": true }, hooks: ["reset"] },
        files: [],
        steps,
        timing: { minutes: 1.5 },
      },
    ],
    citations: v3["f1-still-in-motion"].citations.filter((c: any) => /select|WebKit|picker|webstatus\.dev\/features\/customizable/i.test(c.text + c.url)),
    cautions: [
      "TODO rewrite: Keep text in every option.",
      "TODO rewrite: The syntax is still moving. Safari 27.2 added ::field-content.",
      "TODO rewrite: Test the Firefox fallback inside real forms.",
    ],
  };
}

// ---------------------------------------------------------------- write

const FILE_MARK = "__SECTION_FILE__";
function markFiles(sectionId: string, value: any): any {
  if (Array.isArray(value)) return value.map((v) => markFiles(sectionId, v));
  if (value && typeof value === "object") {
    if (typeof value.file === "string" && typeof value.source === "string" && value.lang) {
      const abs = path.join(SECTIONS, sectionId, "files", value.file);
      if (existsSync(abs) && readFileSync(abs, "utf8").replace(/\n$/, "") === value.source) return { ...value, source: `${FILE_MARK}${sectionId}|${value.file}` };
    }
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, markFiles(sectionId, v)]));
  }
  return value;
}

async function write(section: any) {
  const marked = markFiles(section.id, section);
  let body = JSON.stringify(marked, null, 2);
  body = body.replace(new RegExp(`"${FILE_MARK}([^|"]+)\\|([^"]+)"`, "g"), (_m, id: string, file: string) => `sectionFile(${JSON.stringify(id)}, ${JSON.stringify(file)})`);
  body = body.replace(/^(\s*)"([A-Za-z_$][\w$]*)":/gm, "$1$2:");
  const usesFile = body.includes("sectionFile(");
  const src = [
    'import type { DemoSection } from "@/content/demo-schema";',
    usesFile ? 'import { sectionFile } from "@/lib/demo-files";' : "",
    "",
    `/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./${section.id}/files/. */`,
    `export const section: DemoSection = ${body};`,
    "",
  ]
    .filter((l, i) => l !== "" || i !== 1)
    .join("\n");
  const pretty = await format(src, { parser: "typescript", printWidth: 100 });
  writeFileSync(path.join(SECTIONS, `${section.id}.ts`), pretty);
  console.log(`wrote ${section.id}.ts (${section.pages.map((p: any) => `${p.id}:${p.steps.length}`).join(" ")})`);
}

const migrated = ids.map(migrate);
migrated.splice(5, 0, d6());
for (const s of migrated) await write(s);

writeFileSync(
  path.join(SECTIONS, "index.ts"),
  await format(
    [
      'import type { DemoSection } from "@/content/demo-schema";',
      ...ORDER.map((id, i) => `import { section as s${i + 1} } from "./${id}";`),
      "",
      "/** Every page's `timing.cumulative`, computed from the authored minutes: the demo section starts at 5.0 (PRD 7.4). */",
      "export const DEMO_SECTION_START = 5.0;",
      "function withCumulative(list: DemoSection[]): DemoSection[] {",
      "  let t = DEMO_SECTION_START;",
      "  for (const s of list) for (const p of s.pages) { t = Math.round((t + p.timing.minutes) * 100) / 100; p.timing.cumulative = t; }",
      "  return list;",
      "}",
      "",
      "/** The demo section in talk order (PRD v4, 2.1 and 7.4). */",
      `export const sections: DemoSection[] = withCumulative([${ORDER.map((_, i) => `s${i + 1}`).join(", ")}]);`,
      "",
    ].join("\n"),
    { parser: "typescript", printWidth: 100 },
  ),
);
console.log("wrote index.ts");
