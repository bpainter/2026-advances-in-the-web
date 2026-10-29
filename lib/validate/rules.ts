import type { Action, DemoCodeFile, DemoPage, DemoSection, Step } from "@/content/demo-schema";
import { SPLITS, VIA_VOCABULARY, hasFrame } from "@/content/demo-schema";
import { elisionLines, excerptLayout, lineSet } from "@/lib/excerpt";
import { computeSupport, type SupportFile, type WebFeaturesData } from "@/lib/support-data";
import { ceilingMs, nominalMs } from "@/lib/engine/steps";

/**
 * The demo content rules (docs/PRD-demos-v4.md 7.5, with the caps of docs/design/demo-flow-cx.md
 * the speaker adopted). Pure: everything outside the sections comes in through `ValidateContext`,
 * so scripts/validator-fixtures.mts can break one rule at a time.
 */

export type Level = "error" | "warning";
export interface Issue {
  rule: string;
  where: string;
  message: string;
  level: Level;
}

export interface BuildInfo {
  html: string;
  runtimeSelectors: string[];
  flags: Record<string, true | undefined>;
}

export interface ValidateContext {
  /** Expected minutes per page by section id (PRD 7.4 as adopted); omit to skip the table. */
  timing?: Record<string, number[]>;
  /** The demo section starts here on the talk clock. */
  start: number;
  /** The last page must end by this time. */
  lastPageBy: number;
  webFeatures?: { data: WebFeaturesData; version: string };
  /** content/.generated/support.json, or null when missing. */
  support?: SupportFile | null;
  /** Computed meters by `meter.source`. */
  meters: Record<string, string>;
  /** Does a file exist under public/ (path starting with "/")? */
  publicFile: (p: string) => boolean;
  /** Reads a repo file (excerpt fidelity); null when missing. */
  repoFile: (p: string) => string | null;
  /** The registered build behind a frame route; "unknown" when not registered; null for other origins. */
  build: (route: string) => BuildInfo | "unknown" | null;
}

// --------------------------------------------------------------- limits

export const LIMITS = {
  stepCap: { intro: 0, "used-to": 3, now: 5, single: 5 } as Record<DemoPage["stage"], number>,
  bullets: { intro: [0, 0], "used-to": [1, 2], now: [1, 3], single: [1, 3] } as Record<DemoPage["stage"], [number, number]>,
  s0Bullets: 3,
  proofs: 2,
  bulletWords: 25,
  sentenceWords: 20,
  sentenceWarnWords: 15,
  introWords: 50,
  introSentences: [2, 3] as [number, number],
  descriptionWords: 20,
  wordsPerMinute: 130,
  /** CX 2: words per step (bullets). */
  stepWords: { "used-to": 20, usedToMeter: 30, now: 40, single: 40 } as Record<string, number>,
  /** CX 2: words per now page, intro plus bullets. */
  nowPageWords: 220,
  highlight: 12,
  highlightSpan: 20,
  columns: 44,
  fileLines: 40,
  tabs: { "used-to": 4, now: 3 } as Record<string, number>,
  callouts: { now: 1, words: 3 },
  cautions: { count: 3, words: 20 },
  viewport: { walk: { width: 640, height: 628 }, single: { width: 1304, height: 628 } },
};

export const BANNED = [
  "seamless",
  "seamlessly",
  "leverage",
  "robust",
  "powerful",
  "magic",
  "simply",
  "just",
  "easily",
  "unlock",
  "game changer",
  "under the hood",
  "out of the box",
  // CX 3, avoid list
  "basically",
  "actually",
  "obviously",
  "of course",
  "as you can see",
  "for free",
  "plumbing",
];

const V3_FIELDS = ["notes", "open", "bridge", "tier", "summary", "detail"];
/** Tailwind in shown code: utility class names inside class attributes (HTML), or Tailwind at-rules (CSS). Standard property names such as border-radius never match. */
const TAILWIND_CLASS = /class="[^"]*\b(flex|grid|p|m|px|py|mx|my|gap|text|bg|border|rounded|w|h)-[\w./[\]-]+/;
const TAILWIND_AT = /@apply\b|@tailwind\b|@theme\b/;
const looksTailwind = (lang: string, source: string) => (lang === "html" ? TAILWIND_CLASS.test(source) : false) || TAILWIND_AT.test(source);
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
const TITLES = { "used-to": "What we used to do", now: "What we can do today" } as const;

// --------------------------------------------------------------- text helpers

export const isTodo = (s: string | undefined) => Boolean(s && /\bTODO\b/.test(s));
export function words(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}
/** Sentences end at ".", "?" or "!" followed by space (decimals and file names like "app.js" stay whole). */
export function sentences(s: string): string[] {
  return s
    .split(/(?<=[.?!])\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

// --------------------------------------------------------------- validate

export function validate(sections: DemoSection[], ctx: ValidateContext): Issue[] {
  const issues: Issue[] = [];
  const add = (rule: string, where: string, message: string, level: Level = "error") => issues.push({ rule, where, message, level });

  /** Writing rules (PRD 5.2) on one piece of copy. TODO text is reported once and not checked further. */
  function copy(where: string, field: string, text: string | undefined, opts: { label?: boolean; sentenceCheck?: boolean } = {}) {
    if (text === undefined) return;
    if (isTodo(text)) {
      add("todo", where, `${field} still has a TODO: "${text.slice(0, 70)}${text.length > 70 ? "…" : ""}"`);
      return;
    }
    if (/[–—]/.test(text)) add("dash", where, `${field} has an en or em dash`);
    if (text.includes("!")) add("exclaim", where, `${field} has an exclamation point`);
    const lower = ` ${text.toLowerCase().replace(/[^a-z' ]+/g, " ")} `;
    for (const w of BANNED) if (lower.includes(` ${w} `)) add("banned", where, `${field} uses "${w}"`);
    if (opts.label) {
      if (/^[a-z]/.test(text) && !/^(pnpm|npm|popover|dialog|select)\b/.test(text)) add("case", where, `${field} "${text}" should start with a capital (sentence case)`);
      if (/, not /.test(text)) add("x-not-y", where, `${field} "${text}" uses "X, not Y"; never in a label`);
    }
    if (opts.sentenceCheck !== false) {
      for (const s of sentences(text)) {
        const n = words(s);
        if (n > LIMITS.sentenceWords) add("sentence", where, `${field}: a sentence of ${n} words (at most ${LIMITS.sentenceWords}): "${s.slice(0, 60)}…"`);
        else if (n > LIMITS.sentenceWarnWords) add("sentence", where, `${field}: a sentence of ${n} words (aim for ${LIMITS.sentenceWarnWords}): "${s.slice(0, 60)}…"`, "warning");
      }
    }
  }

  /** v3 field names anywhere in the content object (actions excluded). */
  function v3Fields(where: string, value: unknown, trail: string) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => v3Fields(where, v, `${trail}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(value)) {
      if (k === "actions" || k === "citations" || k === "source" || k === "excerptOf") continue;
      if (V3_FIELDS.includes(k)) add("v3-field", where, `v3 field "${trail}.${k}" is not part of schema v4`);
      v3Fields(where, v, `${trail}.${k}`);
    }
  }

  let clock = ctx.start;
  let lastEnd = ctx.start;

  // Support data: recompute and compare with the generated file.
  let expectedSupport: SupportFile | null = null;
  if (ctx.webFeatures) {
    try {
      expectedSupport = computeSupport(sections, ctx.webFeatures.data, ctx.webFeatures.version, ctx.support?.toolDates ?? {});
    } catch (e) {
      add("support", "support", (e as Error).message);
    }
    if (ctx.support === null) add("support", "support.json", "content/.generated/support.json is missing; run pnpm support");
    else if (ctx.support) {
      if (ctx.support.version !== ctx.webFeatures.version) add("support", "support.json", `generated from web-features ${ctx.support.version}, but ${ctx.webFeatures.version} is installed; run pnpm support`);
      else if (expectedSupport && JSON.stringify(ctx.support.sections) !== JSON.stringify(expectedSupport.sections)) {
        const stale = Object.keys(expectedSupport.sections).filter((id) => JSON.stringify(ctx.support!.sections[id]) !== JSON.stringify(expectedSupport!.sections[id]));
        add("support", "support.json", `out of date for ${stale.join(", ") || "removed sections"}; run pnpm support`);
      }
    }
  }

  for (const section of sections) {
    const sw = section.id;
    v3Fields(sw, section, section.id);
    copy(sw, "label", section.label, { label: true });
    copy(sw, "feature", section.feature, { label: true });
    copy(sw, "scenario", section.scenario);
    if (section.cautions.length > LIMITS.cautions.count) add("cautions", sw, `${section.cautions.length} cautions; at most ${LIMITS.cautions.count}`);
    section.cautions.forEach((c, i) => {
      copy(sw, `caution ${i + 1}`, c);
      if (!isTodo(c) && words(c) > LIMITS.cautions.words) add("cautions", sw, `caution ${i + 1} has ${words(c)} words; at most ${LIMITS.cautions.words}`);
    });

    const stages = section.pages.map((p) => p.stage).join(",");
    if (stages !== "intro,used-to,now" && stages !== "single") add("page-order", sw, `pages are ${stages}; expected intro,used-to,now or one single page`);
    const hasIntro = section.pages.some((p) => p.stage === "intro");
    if (hasIntro && !section.feature) add("intro", sw, "a section with an intro page needs a feature");
    if (hasIntro && !section.support) add("intro", sw, "a section with an intro page needs support");

    const expected = ctx.timing?.[section.id];
    if (ctx.timing && !expected) add("timing", sw, "section is not in the timing table");
    if (expected && expected.length !== section.pages.length) add("timing", sw, `${section.pages.length} pages but the timing table has ${expected.length}`);

    section.pages.forEach((page, pi) => {
      const where = page.id;
      if (expected && expected[pi] !== undefined && Math.abs(expected[pi] - page.timing.minutes) > 0.001) add("timing", where, `${page.timing.minutes} minutes; the timing table says ${expected[pi]}`);
      clock = Math.round((clock + page.timing.minutes) * 100) / 100;
      lastEnd = clock;
      checkPage(section, page);
    });
  }
  if (ctx.timing) {
    const missing = Object.keys(ctx.timing).filter((id) => !sections.some((s) => s.id === id));
    for (const id of missing) add("timing", id, "in the timing table but not in the deck");
    if (lastEnd > ctx.lastPageBy + 0.001) add("timing", "timing", `the last page ends at ${lastEnd}; it must end by ${ctx.lastPageBy}`);
  }

  function checkPage(section: DemoSection, page: DemoPage) {
    const where = page.id;
    const stage = page.stage;
    copy(where, "intro", page.intro);
    if (!isTodo(page.intro)) {
      const n = sentences(page.intro).length;
      if (words(page.intro) > LIMITS.introWords) add("budget", where, `intro has ${words(page.intro)} words; at most ${LIMITS.introWords}`);
      if (n < LIMITS.introSentences[0] || n > LIMITS.introSentences[1]) add("intro-sentences", where, `intro has ${n} sentence(s); write ${LIMITS.introSentences[0]} or ${LIMITS.introSentences[1]}`);
    }
    if (page.steps.length === 0) add("step-cap", where, "no steps");
    if (page.steps[0] && page.steps[0].id !== "s0") add("step-cap", where, "the first step must be s0");
    page.steps.forEach((s, i) => {
      if (s.id !== `s${i}`) add("step-cap", `${where} ${s.id}`, `step ids must run s0, s1, ...; expected s${i}`);
    });
    const counted = page.steps.slice(1).filter((s) => !isTodo(s.label)).length;
    if (counted > LIMITS.stepCap[stage]) add("step-cap", where, `${counted} steps after s0; at most ${LIMITS.stepCap[stage]} on ${stage} pages`);
    const proofs = page.steps.filter((s) => s.proof).length;
    if (proofs > LIMITS.proofs) add("proof", where, `${proofs} proof steps; at most ${LIMITS.proofs}`);
    const keys = page.steps.filter((s) => s.key).length;
    if (keys > 1) add("key-step", where, `${keys} key steps; mark exactly one`);
    if (keys === 0 && (stage === "used-to" || stage === "now")) add("key-step", where, "no key step; mark the one point to emphasise with key: true", "warning");

    // Word budget: intro plus every bullet (PRD 1.5) and the CX page cap.
    const allText = [page.intro, ...page.steps.flatMap((s) => s.bullets)];
    if (!allText.some(isTodo) && stage !== "intro") {
      const total = allText.reduce((n, t) => n + words(t), 0);
      const budget = Math.round(LIMITS.wordsPerMinute * page.timing.minutes);
      if (total > budget) add("budget", where, `${total} words of notes; the budget at ${page.timing.minutes} min is ${budget}`);
      if (stage === "now" && total > LIMITS.nowPageWords) add("budget", where, `${total} words of notes; a now page has ${LIMITS.nowPageWords} at most`);
    }
    // "X, not Y" at most once per page.
    const xNotY = allText.filter((t) => !isTodo(t)).join(" ").match(/, not /g)?.length ?? 0;
    if (xNotY > 1) add("x-not-y", where, `"X, not Y" appears ${xNotY} times; at most once per page`);

    if (stage === "intro") {
      copy(where, "description", page.description);
      if (!isTodo(page.description)) {
        if (sentences(page.description).length !== 1) add("intro", where, "description must be one sentence");
        if (words(page.description) > LIMITS.descriptionWords) add("intro", where, `description has ${words(page.description)} words; at most ${LIMITS.descriptionWords}`);
        if (/\d/.test(page.description)) add("intro", where, "description has a number; versions and dates come from the support data", "warning");
        if (/\bBaseline\b/.test(page.description)) add("intro", where, "description says Baseline; the room does not know the term", "warning");
      }
      copy(where, "visual.alt", page.visual.alt);
      if (!isTodo(page.visual.alt) && !ctx.publicFile(page.visual.src)) add("intro", where, `visual ${page.visual.src} does not exist; run pnpm visuals`);
      const target = section.pages.find((p) => p.id === page.visual.capture.pageId);
      if (!target || !target.steps.some((s) => s.id === page.visual.capture.stepId)) add("intro", where, `visual.capture names ${page.visual.capture.pageId} ${page.visual.capture.stepId}, which does not exist`);
      if (section.support?.kind === "web-features" && ctx.webFeatures) {
        for (const id of [section.support.id, ...(section.support.alsoUses ?? [])]) if (!ctx.webFeatures.data.features[id]) add("intro", where, `web-features ${ctx.webFeatures.version} has no feature "${id}"`);
        if ((section.support.alsoUses?.length ?? 0) > 2) add("intro", where, "alsoUses lists more than 2 features");
      }
      if (page.steps.length !== 1) add("step-cap", where, "an intro page has a single step");
      return;
    }

    // Walk and single pages.
    const walk = stage === "used-to" || stage === "now";
    copy(where, "title", page.title, { label: true });
    if (walk) {
      if (page.eyebrow !== section.feature) add("eyebrow", where, `eyebrow "${page.eyebrow}" must equal the feature "${section.feature}"`);
      if (page.title !== TITLES[stage]) add("title", where, `title "${page.title}" must be "${TITLES[stage]}"`);
      if (page.files.length > LIMITS.tabs[stage]) add("files", where, `${page.files.length} files; at most ${LIMITS.tabs[stage]} on ${stage} pages`);
    } else {
      if (page.title !== section.label) add("title", where, `title "${page.title}" must be the section label "${section.label}"`);
      if (page.stage === "single") copy(where, "badge", page.badge?.text, { label: true, sentenceCheck: false });
    }

    // Walk pages: the viewport follows the page's split (SPLITS); 50/50 is LIMITS.viewport.walk.
    const split = walk && "split" in page ? page.split : undefined;
    const vp = walk ? (split ? SPLITS[split].viewport : LIMITS.viewport.walk) : LIMITS.viewport.single;
    const ratio = page.frame.viewport.width / page.frame.viewport.height / (vp.width / vp.height);
    if (Math.abs(ratio - 1) > 0.02 || page.frame.viewport.width !== vp.width) add("viewport", where, `viewport ${page.frame.viewport.width}x${page.frame.viewport.height}; ${stage} pages${split ? ` at ${split}` : ""} use ${vp.width}x${vp.height}`);

    for (const f of page.files ?? []) checkFile(where, f);
    const built = ctx.build(page.frame.route);
    if (built === "unknown") add("build", where, `no build registered for ${page.frame.route} yet`, "warning");

    const meterSteps = page.steps.filter((s) => s.meter);
    if (meterSteps.length > 1) add("meter", where, `${meterSteps.length} meters; one per page`);
    for (const s of meterSteps) {
      if (stage === "used-to" && s !== page.steps[page.steps.length - 1]) add("meter", `${where} ${s.id}`, "the used-to meter goes on the last step");
      if (stage === "single") add("meter", `${where} ${s.id}`, "no meter on single pages");
      const computed = ctx.meters[s.meter!.source];
      if (computed === undefined) add("meter", `${where} ${s.id}`, "meter not computed yet (run pnpm meters)", "warning");
      else if (computed !== s.meter!.value) add("meter", `${where} ${s.id}`, `meter.value "${s.meter!.value}" but the computed value is "${computed}"`);
    }

    page.steps.forEach((step, i) => checkStep(section, page, step, i, built === "unknown" ? null : built));
  }

  function checkFile(where: string, f: DemoCodeFile) {
    const lines = f.source.split("\n");
    if (lines.length > LIMITS.fileLines) add("file-size", where, `${f.file} shows ${lines.length} lines; at most ${LIMITS.fileLines}`);
    lines.forEach((l, i) => {
      if (l.length > LIMITS.columns) add("file-size", where, `${f.file}:${i + 1} is ${l.length} columns; at most ${LIMITS.columns}`);
    });
    if ((f.lang === "html" || f.lang === "css") && looksTailwind(f.lang, f.source)) add("tailwind", where, `${f.file} contains a Tailwind-looking pattern`, "warning");
    if (f.excerptOf) {
      const full = ctx.repoFile(f.excerptOf.path);
      if (full === null) {
        add("excerpt", where, `${f.file}: ${f.excerptOf.path} does not exist`);
        return;
      }
      const src = full.replace(/\n$/, "").split("\n");
      let prev = 0;
      for (const [a, b] of f.excerptOf.ranges) {
        if (a > b || a <= prev || a < 1 || b > src.length) add("excerpt", where, `${f.file}: range [${a}, ${b}] is out of order or outside 1..${src.length}`);
        prev = b;
      }
      const layout = excerptLayout(f.excerptOf.ranges, src.length);
      layout.forEach((l, i) => {
        if (l.kind === "source" && lines[i] !== src[l.line - 1]) add("excerpt", where, `${f.file}: shown line ${i + 1} differs from ${f.excerptOf!.path}:${l.line}`);
      });
      if (layout.length !== lines.length) add("excerpt", where, `${f.file}: ${lines.length} shown lines but the excerpt has ${layout.length}`);
      src.forEach((l, i) => {
        if (l.length > LIMITS.columns) add("excerpt", where, `${f.excerptOf!.path}:${i + 1} is ${l.length} columns; format the build at printWidth 44`, "warning");
      });
    }
  }

  function checkStep(section: DemoSection, page: Exclude<DemoPage, { stage: "intro" }>, step: Step, index: number, built: BuildInfo | null) {
    const where = `${page.id} ${step.id}`;
    const stage = page.stage;
    const walk = stage === "used-to" || stage === "now";
    copy(where, "label", step.label, { label: true });
    if (!isTodo(step.label) && words(step.label) > 5) add("label", where, `label "${step.label}" has ${words(step.label)} words; aim for 2 to 4`, "warning");
    step.bullets.forEach((b, i) => {
      copy(where, `bullet ${i + 1}`, b);
      if (!isTodo(b) && words(b) > LIMITS.bulletWords) add("bullet-length", where, `bullet ${i + 1} has ${words(b)} words; at most ${LIMITS.bulletWords}`);
    });
    copy(where, "ifKeyboard", step.ifKeyboard);
    if (step.proof && /[–—!]/.test(step.proof)) add("dash", where, "proof text has a dash or an exclamation point");
    const todoBullets = step.bullets.some(isTodo);
    if (!todoBullets) {
      const [lo, hi] = index === 0 ? [0, LIMITS.s0Bullets] : LIMITS.bullets[stage];
      const n = step.bullets.length;
      const max = stage === "used-to" && step.meter ? 2 : hi;
      if (n < lo || n > max) add("bullets", where, `${n} bullets; ${index === 0 ? "s0 takes" : `${stage} steps take`} ${lo} to ${max}`);
      const sw = step.bullets.reduce((t, b) => t + words(b), 0);
      const cap = stage === "used-to" ? (step.meter ? LIMITS.stepWords.usedToMeter : LIMITS.stepWords["used-to"]) : LIMITS.stepWords[stage];
      if (cap && index > 0 && sw > cap) add("step-words", where, `${sw} words of bullets; at most ${cap} on a ${stage} step`);
    }
    // CX 2: every step after s0 changes something in the frame.
    if (index > 0 && !step.actions.some((a) => a.type !== "assert" && a.type !== "wait")) add("frame-change", where, "the step changes nothing in the frame; merge it into a neighbour");

    if (step.callouts?.length) {
      if (stage !== "now") add("callouts", where, `no callouts on ${stage} pages`);
      else if (step.callouts.length > LIMITS.callouts.now) add("callouts", where, `${step.callouts.length} callouts; at most ${LIMITS.callouts.now}`);
      for (const c of step.callouts) {
        copy(where, "callout", c.text, { label: true, sentenceCheck: false });
        if (words(c.text) > LIMITS.callouts.words) add("callouts", where, `callout "${c.text}" is over ${LIMITS.callouts.words} words`);
      }
    }

    if (walk && !step.code) add("code", where, "every used-to and now step needs code");
    if (step.code) {
      if (isTodo(step.code.file)) add("todo", where, "code.file is still TODO");
      else {
        const file = page.files?.find((f) => f.file === step.code!.file);
        if (!file) add("code", where, `code.file "${step.code.file}" is not in files`);
        else {
          const count = file.source.split("\n").length;
          const set = lineSet(step.code.lines);
          for (const l of step.code.lines) {
            const [a, b] = Array.isArray(l) ? l : [l, l];
            if (a < 1 || b > count || a > b) add("code", where, `code.lines ${JSON.stringify(l)} outside 1..${count} of ${file.file}`);
          }
          if (set.size > LIMITS.highlight) add("code", where, `highlights ${set.size} lines; at most ${LIMITS.highlight}`);
          // The highlighted range, gaps included, must fit the panel's 21 visible lines with one to
          // spare, so the first and last highlighted lines are on screen together (design review H4).
          if (set.size) {
            const first = Math.min(...set);
            const last = Math.max(...set);
            if (last - first + 1 > LIMITS.highlightSpan) add("code", where, `highlights lines ${first} to ${last} of ${file.file}, a span of ${last - first + 1}; at most ${LIMITS.highlightSpan} so both ends are on screen`);
          }
          if (file.excerptOf) {
            const elided = elisionLines(file.excerptOf.ranges, (ctx.repoFile(file.excerptOf.path) ?? "").replace(/\n$/, "").split("\n").length);
            for (const n of elided) if (set.has(n)) add("code", where, `highlights line ${n} of ${file.file}, an elision line`);
          }
          if (step.code.off && step.code.lines.length) add("code", where, "an off step dims the whole file; leave lines empty");
        }
      }
    }

    // Kept from v3: via vocabulary, flags, keyboard notes, duration, selectors.
    if (step.actions.some((a) => a.type === "key") && !step.ifKeyboard) add("keyboard", where, "a key action should carry ifKeyboard", "warning");
    const nominal = nominalMs(step);
    const ceiling = ceilingMs(step);
    if (nominal > ceiling) add("duration", where, `nominal duration ${nominal}ms is over the ${ceiling}ms ceiling`, "warning");
    const selectors = new Set<string>();
    for (const s of step.spotlight ?? []) selectors.add(s);
    for (const c of step.callouts ?? []) selectors.add(c.target);
    step.actions.forEach((a: Action, i) => {
      if ("target" in a && typeof a.target === "string") selectors.add(a.target);
      if (a.type === "pointer") selectors.add(a.to);
      if (a.type === "key") {
        const known = VIA_VOCABULARY.some((v) => a.via.includes(v.replace(/\(.*$/, ""))) || /hook:|dispatch|requestClose|hidePopover|click\(\)|focus\(|requestSubmit|selectedIndex|navigation\.|history\./.test(a.via);
        if (!known) add("via", where, `action ${i}: via "${a.via}" is outside the vocabulary`);
        const expectedVia = KEY_VIA[a.key];
        if (expectedVia && !expectedVia.test(a.via)) add("via", where, `action ${i}: via "${a.via}" is wrong for ${a.key}`);
        if (/dispatch/.test(a.via) && page.frame.build !== "today") add("via", where, `action ${i}: dispatch(keydown) is for today builds only`);
      }
      if (a.type === "toggle" && built && !built.flags[a.flag]) add("flags", where, `action ${i}: toggle of "${a.flag}", which the build does not list`);
    });
    if (built && hasFrame(page)) for (const s of selectors) checkSelector(where, s, built);
    void section;
  }

  function checkSelector(where: string, selector: string, built: BuildInfo) {
    if (selector === ":viewport" || built.runtimeSelectors.includes(selector)) return;
    const ids = [...selector.matchAll(/#([\w-]+)/g)].map((m) => m[1]);
    const classes = [...selector.matchAll(/\.([\w-]+)/g)].map((m) => m[1]);
    const attrs = [...selector.matchAll(/\[([\w-]+)/g)].map((m) => m[1]);
    for (const t of ids) if (!new RegExp(`id="${t}"`).test(built.html)) add("selector", where, `selector "${selector}": no id "${t}" in the build's index.html`, "warning");
    for (const t of classes) if (!new RegExp(`class="[^"]*\\b${t}\\b`).test(built.html)) add("selector", where, `selector "${selector}": no class "${t}" in the build's index.html`, "warning");
    for (const t of attrs) if (!new RegExp(`\\s${t}(=|\\s|>|/)`).test(built.html)) add("selector", where, `selector "${selector}": attribute "${t}" never appears in the build's index.html`, "warning");
  }

  return issues;
}
