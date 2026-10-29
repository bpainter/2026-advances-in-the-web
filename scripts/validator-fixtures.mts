/**
 * One broken fixture per validator rule (PRD v4, M0 acceptance). A small valid section passes with
 * no errors; each mutation below breaks exactly one rule, and the test fails unless the validator
 * reports that rule.
 *
 *   pnpm test:validator
 */
import type { DemoSection, IntroPage, WalkPage } from "@/content/demo-schema";
import { validate, type ValidateContext } from "@/lib/validate/rules";
import { computeSupport } from "@/lib/support-data";
import { installedWebFeatures } from "@/lib/web-features";
import { lintTheme } from "@/lib/validate/theme";
import { slideCopyIssues, validateV5, type V5Context } from "@/lib/validate/v5";
import type { Background } from "@/content/backgrounds";
import { validateWrappers, type WrappedBuild } from "@/lib/validate/wrappers";

const wf = installedWebFeatures();
const FIXTURE_JS = Array.from({ length: 60 }, (_, i) => `const line${i + 1} = ${i + 1};`).join("\n");

function base(): DemoSection {
  return {
    id: "x1-fixture",
    order: 1,
    label: "Fixture row",
    background: "d1",
    feature: "Dialog element",
    scenario: "A row opens a dialog.",
    support: { kind: "web-features", id: "dialog", alsoUses: ["popover"] },
    citations: [],
    cautions: ["Check permission on the server."],
    pages: [
      {
        id: "x1-intro",
        stage: "intro",
        intro: "This is the fixture. It has one row.",
        description: "The dialog element asks the user to confirm.",
        visual: { src: "/intro/x1.png", alt: "A dialog over a row.", capture: { pageId: "x1-now", stepId: "s1" } },
        steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
        timing: { minutes: 0.25 },
      },
      {
        id: "x1-used-to",
        stage: "used-to",
        eyebrow: "Dialog element",
        title: "How we used to do it",
        intro: "This is the old row. The code lights up as it plays.",
        frame: { build: "today", route: "/x/today", viewport: { width: 640, height: 628 } },
        files: [{ file: "app.js", lang: "js", source: "", excerptOf: { path: "fixture.js", ranges: [[1, 10], [20, 30]] } }],
        steps: [
          { id: "s0", label: "The old row", actions: [], code: { file: "app.js", lines: [] }, bullets: [] },
          { id: "s1", label: "Open the box", actions: [{ type: "click", target: "#open" }], code: { file: "app.js", lines: [[1, 4]] }, bullets: ["The button opens the box."] },
          {
            id: "s2",
            label: "Count the code",
            key: true,
            actions: [{ type: "click", target: "#close" }],
            code: { file: "app.js", lines: [[13, 16]] },
            meter: { label: "JavaScript", value: "10 lines", source: "fixture" },
            bullets: ["The box closes.", "That took ten lines."],
          },
        ],
        timing: { minutes: 0.5 },
      },
      {
        id: "x1-now",
        stage: "now",
        eyebrow: "Dialog element",
        title: "How we do it now",
        intro: "This is the same row. The box is a dialog.",
        frame: { build: "native", route: "/x/native", viewport: { width: 640, height: 628 } },
        files: [{ file: "index.html", lang: "html", source: "<button>\n  Open\n</button>\n<dialog></dialog>" }],
        steps: [
          { id: "s0", label: "Same row", actions: [], code: { file: "index.html", lines: [] }, bullets: [] },
          {
            id: "s1",
            label: "Open the dialog",
            key: true,
            actions: [{ type: "click", target: "#open" }],
            code: { file: "index.html", lines: [[1, 3]] },
            callouts: [{ target: "dialog", text: "Page is inert", side: "top" }],
            bullets: ["The button opens the dialog.", "The page behind waits."],
          },
          { id: "s2", label: "Styles off", actions: [{ type: "toggle", flag: "enhance-css", on: false }], code: { file: "index.html", lines: [], off: false }, proof: "Styles off.", bullets: ["The styles are off."] },
        ],
        timing: { minutes: 1.75 },
      },
    ],
  };
}

function context(sections: DemoSection[]): ValidateContext {
  // The excerpt's source is generated as the loader would.
  for (const s of sections)
    for (const p of s.pages)
      if (p.stage !== "intro")
        for (const f of p.files ?? [])
          if (f.excerptOf) {
            const lines = FIXTURE_JS.split("\n");
            const shown: string[] = [];
            let next = 1;
            for (const [a, b] of f.excerptOf.ranges) {
              if (a > next) shown.push(`// ... ${a - next} more lines`);
              shown.push(...lines.slice(a - 1, b));
              next = b + 1;
            }
            if (next <= lines.length) shown.push(`// ... ${lines.length - next + 1} more lines`);
            if (!f.source) f.source = shown.join("\n");
          }
  return {
    timing: { "x1-fixture": [0.25, 0.5, 1.75] },
    start: 0,
    lastPageBy: 10,
    webFeatures: wf,
    support: computeSupport(sections, wf.data, wf.version, {}),
    meters: { fixture: "10 lines" },
    publicFile: () => true,
    repoFile: (p) => (p === "fixture.js" ? FIXTURE_JS : null),
    build: () => null,
  };
}

type Mut = (s: DemoSection) => void;
const intro = (s: DemoSection) => s.pages[0] as IntroPage;
const usedTo = (s: DemoSection) => s.pages[1] as WalkPage;
const now = (s: DemoSection) => s.pages[2] as WalkPage;
const addStep = (p: WalkPage, n: number) => {
  for (let i = 0; i < n; i++) p.steps.push({ id: `s${p.steps.length}`, label: "Click again", actions: [{ type: "click", target: "#open" }], code: { file: p.files[0].file, lines: [1] }, bullets: ["The button opens it."] });
};

const CASES: [string, Mut][] = [
  ["v3-field", (s) => Object.assign(now(s).steps[1], { notes: "old" })],
  ["v3-field", (s) => Object.assign(s, { support: { ...s.support, tier: "baseline-newly" } })],
  ["page-order", (s) => s.pages.reverse()],
  ["todo", (s) => (now(s).steps[1].bullets[0] = "TODO rewrite: old text.")],
  ["step-cap", (s) => addStep(now(s), 4)],
  ["step-cap", (s) => addStep(usedTo(s), 2)],
  ["proof", (s) => now(s).steps.forEach((st) => (st.proof = "Proof."))],
  ["key-step", (s) => (now(s).steps[2].key = true)],
  ["bullets", (s) => (now(s).steps[1].bullets = [])],
  ["bullets", (s) => (usedTo(s).steps[1].bullets = ["One.", "Two.", "Three."])],
  ["budget", (s) => (intro(s).intro = Array.from({ length: 6 }, () => "This sentence has nine words in it, all told.").join(" "))],
  ["budget", (s) => (usedTo(s).steps[2].bullets = Array.from({ length: 2 }, () => "Ten words sit in this bullet for the budget test now.")) && (usedTo(s).intro = Array.from({ length: 3 }, () => "Here we have a sentence of exactly fifteen words in it for the test.").join(" "))],
  ["step-words", (s) => (now(s).steps[1].bullets = Array.from({ length: 3 }, () => "Fourteen words here make up one bullet of this long step on the page."))],
  ["dash", (s) => (now(s).steps[1].bullets[0] = "The button — the blue one — opens it.")],
  ["exclaim", (s) => (now(s).steps[1].bullets[0] = "The button opens the dialog!")],
  ["sentence", (s) => (now(s).steps[1].bullets[0] = "This one sentence keeps going on and on with many more words than anyone in the room could ever follow on the stage.")],
  ["bullet-length", (s) => (now(s).steps[1].bullets[0] = "The button opens it. Then the page waits for you. Then the dialog asks a question. Then you answer it and it closes again right away.")],
  ["banned", (s) => (now(s).steps[1].bullets[0] = "The button just opens the dialog.")],
  ["x-not-y", (s) => (now(s).steps[1].bullets = ["The browser does it, not us.", "The page waits, not the dialog."])],
  ["x-not-y", (s) => (now(s).steps[1].label = "Browser, not script")],
  ["case", (s) => (now(s).steps[1].label = "open the dialog")],
  ["intro-sentences", (s) => (now(s).intro = "One sentence only.")],
  ["code", (s) => delete now(s).steps[1].code],
  ["code", (s) => (now(s).steps[1].code = { file: "index.html", lines: [[1, 9]] })],
  ["code", (s) => (usedTo(s).steps[1].code = { file: "app.js", lines: [[1, 13]] })],
  ["code", (s) => (usedTo(s).steps[1].code = { file: "app.js", lines: [11] })],
  ["code", (s) => (now(s).steps[1].code = { file: "missing.html", lines: [1] })],
  ["code", (s) => (usedTo(s).steps[1].code = { file: "app.js", lines: [2, 23] })],
  ["file-size", (s) => (now(s).files[0].source = "<p>" + "x".repeat(50) + "</p>")],
  ["file-size", (s) => (now(s).files[0].source = Array.from({ length: 41 }, () => "<p></p>").join("\n"))],
  ["files", (s) => now(s).files.push({ file: "a.css", lang: "css", source: "a{}" }, { file: "b.css", lang: "css", source: "b{}" }, { file: "c.css", lang: "css", source: "c{}" })],
  ["excerpt", (s) => (usedTo(s).files[0].source = usedTo(s).files[0].source.replace("const line2 = 2;", "const line2 = 3;"))],
  ["excerpt", (s) => (usedTo(s).files[0].excerptOf!.ranges = [[20, 30], [1, 10]])],
  ["intro", (s) => (intro(s).description = "It confirms. It also closes.")],
  ["intro", (s) => (s.support = { kind: "web-features", id: "no-such-feature" })],
  ["intro", (s) => (intro(s).visual.capture.stepId = "s9")],
  ["eyebrow", (s) => (now(s).eyebrow = "Dialogs")],
  ["title", (s) => (usedTo(s).title = "How we do it now")],
  ["callouts", (s) => (usedTo(s).steps[1].callouts = [{ target: "#open", text: "Open", side: "top" }])],
  ["callouts", (s) => (now(s).steps[1].callouts!.push({ target: "#open", text: "Two", side: "left" }))],
  ["callouts", (s) => (now(s).steps[1].callouts![0].text = "Four words are here")],
  ["meter", (s) => (usedTo(s).steps[1].meter = usedTo(s).steps[2].meter) && delete usedTo(s).steps[2].meter],
  ["meter", (s) => (usedTo(s).steps[2].meter = { label: "JavaScript", value: "12 lines", source: "fixture" })],
  ["viewport", (s) => (now(s).frame.viewport = { width: 1280, height: 720 })],
  // A 60/40 page keeps the 50/50 viewport: it must be 768 by 628.
  ["viewport", (s) => (now(s).split = "60/40")],
  ["timing", (s) => (now(s).timing.minutes = 2)],
  ["timing", (s) => (now(s).timing.minutes = 20) && (s.id = "x1-fixture")],
  ["frame-change", (s) => (now(s).steps[2].actions = [{ type: "wait", ms: 100 }])],
  ["cautions", (s) => (s.cautions = ["One.", "Two.", "Three.", "Four."])],
  ["cautions", (s) => (s.cautions = ["This caution runs on for many more words than the rule allows so that it is plainly too long to say."])],
  ["via", (s) => now(s).steps[1].actions.push({ type: "key", key: "Escape", via: "magic" })],
  ["support", (s) => (s.support = { kind: "web-features", id: "customizable-select" })],
];

let failed = 0;
const clean = base();
const baseIssues = validate([clean], context([clean])).filter((i) => i.level === "error");
if (baseIssues.length) {
  failed++;
  console.log("✖ the valid fixture fails:");
  for (const i of baseIssues) console.log(`    [${i.rule}] ${i.where}: ${i.message}`);
} else console.log("✓ the valid fixture passes");

for (const [rule, mutate] of CASES) {
  const s = base();
  const ctx = context([s]);
  mutate(s);
  let issues;
  try {
    issues = validate([s], { ...ctx, support: rule === "support" ? ctx.support : computeSupportSafe(s, ctx) });
  } catch (e) {
    issues = [{ rule: "threw", where: "", message: (e as Error).message, level: "error" as const }];
  }
  const hit = issues.filter((i) => i.rule === rule && i.level === "error");
  if (hit.length) console.log(`✓ ${rule}: ${hit[0].message}`);
  else {
    failed++;
    console.log(`✖ ${rule}: not reported (got ${issues.map((i) => i.rule).join(", ") || "nothing"})`);
  }
}

// Theme lint (PRD v4 6.2, with portal-layout allowed for .portal* and .glass-* classes).
const THEME_CASES: [string, string][] = [
  ["a rule outside both layers", ".x { color: red; }"],
  ["layout in portal-theme", "@layer portal-theme { .x { display: grid; } }"],
  ["z-index in portal-theme", "@layer portal-theme { .x { z-index: 2; } }"],
  ["a transition anywhere", "@layer portal-layout { .portal { transition: opacity 1s; } }"],
  ["field-sizing anywhere", "@layer portal-theme { textarea { field-sizing: content; } }"],
  ["non-paint on a dialog", "@layer portal-theme { dialog { margin: 0; } }"],
  ["anchor positioning", "@layer portal-layout { .glass-menu { position-area: block-end; } }"],
  ["an element selector in portal-layout", "@layer portal-layout { dialog { display: block; } }"],
  ["a container query", "@layer portal-theme { @container (width > 1px) { .x { color: red; } } }"],
  ["@scope", "@layer portal-theme { @scope (.x) { p { color: red; } } }"],
];
const themeClean = lintTheme("@layer portal-theme { dialog { padding: 4px; color: red; } [popover] > button { cursor: pointer; } } @layer portal-layout { .portal__nav { display: grid; } .glass-card::before { position: absolute; } }");
if (themeClean.length) {
  failed++;
  console.log(`✖ theme-lint: the clean fixture fails: ${themeClean.map((i) => i.message).join("; ")}`);
} else console.log("✓ theme-lint: the clean fixture passes");
for (const [name, css] of THEME_CASES) {
  const hit = lintTheme(css);
  if (hit.length) console.log(`✓ theme-lint ${name}: ${hit[0].message}`);
  else {
    failed++;
    console.log(`✖ theme-lint ${name}: not reported`);
  }
}

// PRD v5 deck rules (lib/validate/v5.ts): a clean context passes; each mutation breaks one rule.
function v5Base(): V5Context {
  const bg = (file: string, lead: Background["lead"]): Background => ({ file, tone: "light", lead, hues: [lead], textZone: [] });
  const registry: Record<string, Background> = { title: bg("title.jpg", "navy"), d1: bg("d1.jpg", "cyan"), d2: bg("d2.jpg", "beige") };
  const files: Record<string, { width: number; height: number; bytes: number; sha256: string }> = {
    "title.jpg": { width: 1920, height: 1080, bytes: 400_000, sha256: "a" },
    "d1.jpg": { width: 1920, height: 1080, bytes: 400_000, sha256: "b" },
    "d2.jpg": { width: 1920, height: 1080, bytes: 400_000, sha256: "c" },
  };
  const px = new Uint8Array([1, 2, 3]);
  return {
    slides: [{ id: "title", background: "title" }],
    sections: [
      { id: "d1-x", background: "d1" },
      { id: "d2-x", background: "d2" },
    ],
    registry,
    fileInfo: (f) => files[f] ?? null,
    backgroundsDir: ["v5", "README.md"],
    glassMentions: [],
    stats: { title: { file: "title.jpg", sha256: "a" }, d1: { file: "d1.jpg", sha256: "b" }, d2: { file: "d2.jpg", sha256: "c" } },
    grain: { committed: px, fresh: px },
    qr: { committed: "<svg/>", fresh: "<svg/>" },
  };
}
const V5_CASES: [string, (c: V5Context) => void][] = [
  ["bg-missing", (c) => (c.slides[0].background = undefined)],
  ["bg-unknown", (c) => (c.slides[0].background = "nope")],
  ["bg-unused", (c) => (c.registry.d3 = { ...c.registry.d1, file: "d1.jpg" })],
  ["bg-shared", (c) => (c.sections[1].background = "d1")],
  ["bg-adjacent", (c) => (c.registry.d2 = { ...c.registry.d2, lead: "cyan" })],
  ["bg-file", (c) => (c.fileInfo = (f) => (f === "d2.jpg" ? null : { width: 1920, height: 1080, bytes: 1, sha256: f }))],
  ["bg-size", (c) => (c.fileInfo = (f) => ({ width: 2048, height: 1152, bytes: 1, sha256: f }))],
  ["bg-bytes", (c) => (c.fileInfo = (f) => ({ width: 1920, height: 1080, bytes: 2_000_000, sha256: f }))],
  ["bg-duplicate", (c) => (c.fileInfo = () => ({ width: 1920, height: 1080, bytes: 1, sha256: "same" }))],
  ["bg-stats", (c) => (c.stats = { ...c.stats!, d1: { file: "d1.jpg", sha256: "stale" } })],
  ["bg-leftover", (c) => (c.backgroundsDir = [...c.backgroundsDir, "old-fan.jpg"])],
  ["bg-glass", (c) => (c.glassMentions = ["styles/x.css"])],
  ["grain", (c) => (c.grain = { committed: new Uint8Array([1, 2, 4]), fresh: new Uint8Array([1, 2, 3]) })],
  ["qr", (c) => (c.qr = { committed: "<svg/>", fresh: "<svg></svg>" })],
];
{
  const clean = validateV5(v5Base());
  if (clean.length) {
    failed++;
    console.log(`✖ v5: the clean fixture fails: ${clean.map((i) => `${i.rule} ${i.message}`).join("; ")}`);
  } else console.log("✓ v5: the clean fixture passes");
  for (const [rule, mutate] of V5_CASES) {
    const c = v5Base();
    mutate(c);
    const hit = validateV5(c).filter((i) => i.rule === rule);
    if (hit.length) console.log(`✓ ${rule}: ${hit[0].message}`);
    else {
      failed++;
      console.log(`✖ ${rule}: not reported`);
    }
  }
}

// Wrapper rules (lib/validate/wrappers.ts): a clean build passes; each mutation breaks one rule.
function wrapBase(): WrappedBuild {
  return {
    where: "x1/native",
    wrapperId: "order-queue",
    known: true,
    markup: '<div class="wrap"><header class="wrap-bar"><span class="wrap-brand">R</span></header>',
    css: [{ file: "w.css", text: "@layer wrapper { .wrap-bar { color: var(--glass-ink); } }" }],
    scripts: [],
    banned: [{ name: "popover", pattern: /popover/i }],
    shownHasMain: true,
  };
}
const WRAP_CASES: [string, (b: WrappedBuild) => void][] = [
  ["wrapper-missing", (b) => (b.wrapperId = null)],
  ["wrapper-unknown", (b) => (b.known = false)],
  ["wrapper-lint", (b) => (b.css = [{ file: "w.css", text: "@layer wrapper { .wrap p { color: #f00; } }" }])],
  ["wrapper-markup", (b) => (b.markup += '<span class="wrap-x" tabindex="0">x</span>')],
  ["wrapper-banned", (b) => (b.markup += '<div class="wrap-menu" popover></div>')],
];
{
  const clean = validateWrappers([wrapBase()], [{ path: "files/index.html", text: "<main></main>" }]);
  if (clean.length) {
    failed++;
    console.log(`✖ wrappers: the clean fixture fails: ${clean.map((i) => `${i.rule} ${i.message}`).join("; ")}`);
  } else console.log("✓ wrappers: the clean fixture passes");
  for (const [rule, mutate] of WRAP_CASES) {
    const b = wrapBase();
    mutate(b);
    const hit = validateWrappers([b], []).filter((i) => i.rule === rule);
    if (hit.length) console.log(`✓ ${rule}: ${hit[0].message}`);
    else {
      failed++;
      console.log(`✖ ${rule}: not reported`);
    }
  }
  const shown = validateWrappers([wrapBase()], [{ path: "files/index.html", text: '<div class="wrap-card"></div>' }]).filter((i) => i.rule === "wrapper-shown");
  if (shown.length) console.log(`✓ wrapper-shown: ${shown[0].message}`);
  else {
    failed++;
    console.log("✖ wrapper-shown: not reported");
  }
}

// Native slides (PRD v5, 4.7): writing rules on slide text and notes, no uppercase or tracking.
const SLIDE_CASES: [string, Parameters<typeof slideCopyIssues>[0], string][] = [
  ["dash", [{ id: "s", glass: { kind: "statement", lines: ["Keep humanity — at the center"] }, speakerNotes: "Pause." }], ""],
  ["sentence", [{ id: "s", glass: { kind: "statement", lines: ["Keep"] }, speakerNotes: Array.from({ length: 22 }, () => "word").join(" ") + "." }], ""],
  ["slide-case", [{ id: "s", glass: { kind: "statement", lines: ["Keep"] }, speakerNotes: "Pause." }], ".sg-eyebrow { text-transform: uppercase; letter-spacing: 0.1em; }"],
];
{
  const clean = slideCopyIssues([{ id: "s", glass: { kind: "statement", lines: ["Keep humanity", "at the center"] }, speakerNotes: "Let it sit for a beat." }], ".sg { letter-spacing: -0.01em; }");
  if (clean.length) {
    failed++;
    console.log(`✖ slides: the clean fixture fails: ${clean.map((i) => i.message).join("; ")}`);
  } else console.log("✓ slides: the clean fixture passes");
  for (const [rule, slidesIn, css] of SLIDE_CASES) {
    const hit = slideCopyIssues(slidesIn, css).filter((i) => i.rule === rule);
    if (hit.length) console.log(`✓ ${rule} (slides): ${hit[0].message}`);
    else {
      failed++;
      console.log(`✖ ${rule} (slides): not reported`);
    }
  }
}

function computeSupportSafe(s: DemoSection, ctx: ValidateContext) {
  try {
    return computeSupport([s], wf.data, wf.version, {});
  } catch {
    return ctx.support;
  }
}

console.log(`\n${CASES.length + THEME_CASES.length + V5_CASES.length + WRAP_CASES.length + SLIDE_CASES.length + 6 - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
