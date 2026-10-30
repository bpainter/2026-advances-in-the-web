/**
 * Contrast unit test (PRD v4, 6.4; v5, 1.5). Composites each text token over each surface it may
 * sit on, over the wash, over every palette color and over both extremes (darkest and brightest
 * pixel) of the background zone under it, from content/.generated/backgrounds.json (pnpm
 * backgrounds). Fails below 4.5:1 for text and 7:1 for code. Token values are read from
 * styles/glass-tokens.css, so the test follows the theme.
 *
 *   pnpm test:contrast
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { CODE_COLORS } from "@/lib/highlight-colors";
import { BACKGROUNDS, type BackgroundId } from "@/content/backgrounds";

type RGBA = [number, number, number, number];
const css = readFileSync(path.join(process.cwd(), "styles", "glass-tokens.css"), "utf8");
const tokenBlock = css.slice(css.indexOf(":root {"), css.indexOf(':root[data-build="today"]'));

function parse(value: string): RGBA {
  const v = value.trim();
  let m = /^#([0-9a-f]{6})$/i.exec(v);
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
  m = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.]+))?\s*\)$/.exec(v);
  if (m) return [+m[1], +m[2], +m[3], m[4] ? +m[4] : 1];
  throw new Error(`cannot parse color "${value}"`);
}
function token(name: string): RGBA {
  const m = new RegExp(`${name}:\\s*([^;]+);`).exec(tokenBlock);
  if (!m) throw new Error(`token ${name} not found`);
  const v = m[1].trim();
  const ref = /^var\((--[\w-]+)\)$/.exec(v);
  return ref ? token(ref[1]) : parse(v);
}
/** Paints `top` (with its alpha) over an opaque `bottom`. */
function over(top: RGBA, bottom: RGBA): RGBA {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
}
const stack = (...layers: RGBA[]) => layers.reduceRight((acc, l) => over(l, acc));
function luminance([r, g, b]: RGBA): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a: RGBA, b: RGBA): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const PALETTE: Record<string, RGBA> = {
  navy: token("--navy"),
  "slalom blue": token("--slalom-blue"),
  cyan: token("--cyan"),
  purple: token("--purple"),
  chartreuse: token("--chartreuse"),
  coral: token("--coral"),
  white: token("--white"),
};
const WASH_FRAME: RGBA = [255, 255, 255, 0.4];
const WASH_TODAY: RGBA = [240, 238, 250, 0.55];
/** The chrome wash is 0.78 over the eyebrow and title band (y 0 to 168) and 0.45 below it. */
const WASH_CHROME_TOP: RGBA = [255, 255, 255, 0.78];
const WASH_CHROME: RGBA = [255, 255, 255, 0.45];

type Stats = Record<BackgroundId, { zones: { name: string; darkest: [number, number, number]; brightest: [number, number, number] }[] }>;
const statsFile = path.join(process.cwd(), "content", ".generated", "backgrounds.json");
if (!existsSync(statsFile)) {
  console.log("✖ content/.generated/backgrounds.json is missing; run pnpm backgrounds");
  process.exit(1);
}
const stats = JSON.parse(readFileSync(statsFile, "utf8")) as Stats;
/** Both extremes of one zone of one background, as bases to composite over. */
function zoneBases(id: BackgroundId, zone: string): Record<string, RGBA> {
  const z = stats[id]?.zones.find((x) => x.name === zone);
  if (!z) throw new Error(`no stats for ${id} ${zone}; run pnpm backgrounds`);
  return { [`darkest ${id} pixel`]: [...z.darkest, 1], [`brightest ${id} pixel`]: [...z.brightest, 1] };
}
const SECTION_IDS = (Object.keys(BACKGROUNDS) as BackgroundId[]).filter((id) => /^[dfm]\d$/.test(id));
/** Frames show the section image under the wash: palette colors plus the frame slot's extremes. */
const FRAME_BASES: Record<string, RGBA> = { ...PALETTE, ...Object.assign({}, ...SECTION_IDS.map((id) => zoneBases(id, "frame slot"))) };

let failed = 0;
let checks = 0;

function expect(label: string, fg: RGBA, layers: RGBA[], min: number, bases: Record<string, RGBA> = PALETTE) {
  let worst = Infinity;
  let at = "";
  for (const [name, base] of Object.entries(bases)) {
    const bg = stack(...layers, base);
    const r = ratio(fg[3] < 1 ? over(fg, bg) : fg, bg);
    if (r < worst) {
      worst = r;
      at = name;
    }
  }
  checks++;
  const ok = worst >= min;
  if (!ok) failed++;
  console.log(`${ok ? "✓" : "✖"} ${label}: ${worst.toFixed(2)}:1 at worst (over ${at}); needs ${min}:1`);
}

const ink = token("--glass-ink");
const soft = token("--glass-ink-soft");
const link = token("--glass-link");
const pane = token("--glass-pane");
for (const [wash, wn] of [
  [WASH_FRAME, "now frame"],
  [WASH_TODAY, "used-to frame"],
] as const) {
  expect(`ink on the pane (${wn})`, ink, [pane, wash], 4.5, FRAME_BASES);
  for (const s of ["--glass-surface", "--glass-surface-strong", "--glass-surface-field"]) {
    expect(`ink on ${s} in the pane (${wn})`, ink, [token(s), pane, wash], 4.5, FRAME_BASES);
    expect(`ink-soft on ${s} in the pane (${wn})`, soft, [token(s), pane, wash], 4.5, FRAME_BASES);
    expect(`link on ${s} in the pane (${wn})`, link, [token(s), pane, wash], 4.5, FRAME_BASES);
  }
  expect(`ink on --glass-surface-float, no pane (${wn})`, ink, [token("--glass-surface-float"), wash], 4.5, FRAME_BASES);
  expect(`ink-soft on --glass-surface-float, no pane (${wn})`, soft, [token("--glass-surface-float"), wash], 4.5, FRAME_BASES);
}
expect("white on a Slalom Blue button", token("--white"), [token("--slalom-blue")], 4.5);
for (const fill of ["--coral", "--cyan", "--purple", "--chartreuse"]) expect(`navy on ${fill} fill`, ink, [token(fill)], 4.5);

// Slide chrome (walk and single pages): eyebrow, title and meter on the wash over each section's
// title band; code on the code card.
for (const id of SECTION_IDS) {
  const band = zoneBases(id, "walk-page title band");
  expect(`${id}: eyebrow (dark blue) on the chrome wash`, token("--dark-blue"), [WASH_CHROME_TOP], 4.5, band);
  expect(`${id}: title (navy) on the chrome wash`, ink, [WASH_CHROME_TOP], 4.5, band);
  expect(`${id}: step label (ink-soft) on the chrome wash`, soft, [WASH_CHROME_TOP], 4.5, band);
}
const code = token("--chrome-code-surface");
for (const [name, hex] of Object.entries(CODE_COLORS)) expect(`code ${name} on the code card`, parse(hex), [code, WASH_CHROME], 7, FRAME_BASES);
expect("code ink on a highlighted line", parse(CODE_COLORS.ink), [token("--chrome-code-highlight-bg"), code, WASH_CHROME], 7, FRAME_BASES);

// Intro slides (PRD v5, 1.6): the text sits in one dark glass panel (navy 0.72, blurred) over the
// section background; tiles add navy 0.56 on top of the panel.
const strong = token("--glass-dark-surface-strong");
const darkTile = token("--glass-dark-surface");
for (const id of SECTION_IDS) {
  const panel = zoneBases(id, "intro text panel");
  // Title, description and also-uses sit on the panel; ink-soft (browser names) only on tiles.
  for (const t of ["--glass-dark-ink", "--glass-dark-ink-body"]) expect(`${id}: ${t} on the intro text panel`, token(t), [strong], 4.5, panel);
  for (const t of ["--glass-dark-ink", "--glass-dark-ink-body", "--glass-dark-ink-soft"]) expect(`${id}: ${t} on a support tile`, token(t), [darkTile, strong], 4.5, panel);
}

// Opening and closing slides (PRD v5, 1.5; spec 6): text on the field, on light glass cards
// (white 0.72) or on dark glass (navy 0.72), over each zone's extremes.
{
  const lightCard = token("--glass-surface-strong");
  for (const id of (Object.keys(BACKGROUNDS) as BackgroundId[]).filter((x) => !SECTION_IDS.includes(x))) {
    for (const z of BACKGROUNDS[id].textZone) {
      const bases = zoneBases(id, z.name);
      const scrim: RGBA[] = "scrim" in z && z.scrim ? [[...(z.scrim.color === "navy" ? token("--navy").slice(0, 3) : [255, 255, 255]), z.scrim.alpha] as RGBA] : [];
      if (z.on === "field") expect(`${id}: ${z.name} (${z.ink}) on the field${scrim.length ? " under its wash" : ""}`, z.ink === "white" ? token("--white") : ink, scrim, 4.5, bases);
      else if (z.on === "light-card") {
        expect(`${id}: ${z.name} ink on light glass`, ink, [lightCard], 4.5, bases);
        expect(`${id}: ${z.name} ink-soft on light glass`, soft, [lightCard], 4.5, bases);
        expect(`${id}: ${z.name} link on light glass`, link, [lightCard], 4.5, bases);
      } else if (z.on === "dark-panel") {
        expect(`${id}: ${z.name} white on dark glass`, token("--glass-dark-ink"), [strong], 4.5, bases);
        expect(`${id}: ${z.name} body on dark glass`, token("--glass-dark-ink-body"), [strong], 4.5, bases);
        expect(`${id}: ${z.name} cyan on dark glass`, token("--cyan"), [strong], 4.5, bases);
      }
    }
  }
}

// ----- Speaker view (docs/PRD-speaker-view.md, 6.2 and 12.1) -----
// Reads the first `.speaker {` block of styles/components/speaker.css; tokens that alias a glass
// token (`var(--glass-dark-ink)`, `var(--cyan)`) resolve through styles/glass-tokens.css. Text sits
// on the panel (white 0.05), its hover (0.08) or the footer pill (navy 0.85), each over the window
// background, over each glow's peak and over both peaks stacked; and on the solid fallback.
{
  const speakerCss = readFileSync(path.join(process.cwd(), "styles", "components", "speaker.css"), "utf8");
  const start = speakerCss.indexOf(".speaker {");
  const speakerBlock = speakerCss.slice(start, speakerCss.indexOf("}", start));
  const sp = (name: string): RGBA => {
    const m = new RegExp(`${name}:\\s*([^;]+);`).exec(speakerBlock);
    if (!m) throw new Error(`speaker token ${name} not found`);
    const v = m[1].trim();
    const ref = /^var\((--[\w-]+)\)$/.exec(v);
    if (!ref) return parse(v);
    return ref[1].startsWith("--speaker-") ? sp(ref[1]) : token(ref[1]);
  };
  const bg = sp("--speaker-bg");
  const glows = [...(/--speaker-bg-glow:\s*([^;]+);/.exec(speakerBlock)?.[1] ?? "").matchAll(/rgb\(\s*\d+\s+\d+\s+\d+\s*\/\s*[\d.]+\s*\)/g)].map((m) => parse(m[0]));
  if (glows.length < 1) throw new Error("--speaker-bg-glow has no color stops");
  const bases: Record<string, RGBA> = { "the speaker background": bg };
  glows.forEach((g, i) => (bases[`glow ${i + 1} peak`] = over(g, bg)));
  bases["both glow peaks"] = stack(...glows, bg);
  const solid = sp("--speaker-solid");
  const surfaces: [string, RGBA[], Record<string, RGBA>][] = [
    ["the panel", [sp("--speaker-panel")], bases],
    ["the panel hover", [sp("--speaker-panel-strong")], bases],
    ["a References card", [sp("--speaker-card"), sp("--speaker-panel")], bases],
    ["the footer pill", [sp("--speaker-pill")], bases],
    ["the solid fallback", [], { "--speaker-solid": solid }],
  ];
  const texts = ["--speaker-ink", "--speaker-ink-body", "--speaker-ink-soft", "--speaker-link", "--speaker-over"];
  for (const [where, layers, b] of surfaces) for (const t of texts) expect(`speaker: ${t} on ${where}`, sp(t), layers, 4.5, b);
  // Pace text sits on the pill; the button hover (white 0.10) over the pill keeps white legible.
  expect("speaker: --speaker-ink on a footer button hover", sp("--speaker-ink"), [sp("--speaker-hover"), sp("--speaker-pill")], 4.5, bases);
  // Status pill, pressed toggles and the current step button: white on each tint over the panel.
  for (const tint of ["--speaker-tint-cyan", "--speaker-tint-chartreuse", "--speaker-tint-coral", "--speaker-tint-neutral"]) {
    expect(`speaker: white on ${tint} over the panel`, sp("--speaker-ink"), [sp(tint), sp("--speaker-panel")], 4.5, bases);
    expect(`speaker: white on ${tint} over the footer pill`, sp("--speaker-ink"), [sp(tint), sp("--speaker-pill")], 4.5, bases);
  }
  expect("speaker: white on a primary button", sp("--speaker-ink"), [sp("--speaker-primary")], 4.5);
  expect("speaker: white on a primary button hover", sp("--speaker-ink"), [sp("--speaker-primary-hover")], 4.5);
  // Non-text (WCAG 1.4.11): the cyan ring against the panel and pill it lands on.
  expect("speaker: focus ring on the panel", sp("--speaker-focus"), [sp("--speaker-panel")], 3, bases);
  expect("speaker: focus ring on the footer pill", sp("--speaker-focus"), [sp("--speaker-pill")], 3, bases);
  expect("speaker: focus ring on the solid fallback", sp("--speaker-focus"), [], 3, { "--speaker-solid": solid });
}

console.log(`\n${checks - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
