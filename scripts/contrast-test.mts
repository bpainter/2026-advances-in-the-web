/**
 * Contrast unit test (PRD v4, 6.4; docs/design/demo-glass-spec.md, 5). Composites each text token
 * over each surface it may sit on, over the wash, over every palette color and the darkest pixel
 * of the portal background, and fails below 4.5:1 for text on glass and 7:1 for code. Token values
 * are read from styles/glass-tokens.css, so the test follows the theme.
 *
 *   pnpm test:contrast
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { CODE_COLORS } from "@/lib/highlight-colors";

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
  "darkest background pixel": [4, 21, 211, 1],
};
const WASH_FRAME: RGBA = [255, 255, 255, 0.4];
const WASH_TODAY: RGBA = [240, 238, 250, 0.55];
/** The chrome wash is 0.78 over the eyebrow and title band (y 0 to 168) and 0.45 below it. */
const WASH_CHROME_TOP: RGBA = [255, 255, 255, 0.78];
const WASH_CHROME: RGBA = [255, 255, 255, 0.45];
const WASH_INTRO = token("--intro-wash");
const INTRO_TEXT_SCRIM: RGBA = [15, 28, 65, 0.45];

let failed = 0;
let checks = 0;
/** Intro slides sit on glass-navy.jpg: its brightest pixel (measured, rgb(195 120 177)) and navy. */
const INTRO_BASES: Record<string, RGBA> = { navy: token("--navy"), "brightest pixel of glass-navy.jpg": [195, 120, 177, 1] };

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
  expect(`ink on the pane (${wn})`, ink, [pane, wash], 4.5);
  for (const s of ["--glass-surface", "--glass-surface-strong", "--glass-surface-field"]) {
    expect(`ink on ${s} in the pane (${wn})`, ink, [token(s), pane, wash], 4.5);
    expect(`ink-soft on ${s} in the pane (${wn})`, soft, [token(s), pane, wash], 4.5);
    expect(`link on ${s} in the pane (${wn})`, link, [token(s), pane, wash], 4.5);
  }
  expect(`ink on --glass-surface-float, no pane (${wn})`, ink, [token("--glass-surface-float"), wash], 4.5);
  expect(`ink-soft on --glass-surface-float, no pane (${wn})`, soft, [token("--glass-surface-float"), wash], 4.5);
}
expect("white on a Slalom Blue button", token("--white"), [token("--slalom-blue")], 4.5);
for (const fill of ["--coral", "--cyan", "--purple", "--chartreuse"]) expect(`navy on ${fill} fill`, ink, [token(fill)], 4.5);

// Slide chrome: eyebrow, title and meter on the wash; code on the code card.
expect("eyebrow (dark blue) on the chrome wash", token("--dark-blue"), [WASH_CHROME_TOP], 4.5);
expect("title (navy) on the chrome wash", ink, [WASH_CHROME_TOP], 4.5);
expect("meter value (dark blue) on the chrome wash", token("--dark-blue"), [WASH_CHROME_TOP], 4.5);
const code = token("--chrome-code-surface");
for (const [name, hex] of Object.entries(CODE_COLORS)) expect(`code ${name} on the code card`, parse(hex), [code, WASH_CHROME], 7);
expect("code ink on a highlighted line", parse(CODE_COLORS.ink), [token("--chrome-code-highlight-bg"), code, WASH_CHROME], 7);

// Intro slide (navy): white, body and soft text on dark tiles over the intro wash.
const dark = token("--glass-dark-surface");
for (const t of ["--glass-dark-ink", "--glass-dark-ink-body", "--glass-dark-ink-soft"]) {
  expect(`${t} on a dark tile`, token(t), [dark, WASH_INTRO], 4.5, INTRO_BASES);
  // The right column carries a navy scrim (styles/components/intro.css) so its text holds 4.5:1
  // over the brightest arc of the background.
  expect(`${t} on the intro text column`, token(t), [INTRO_TEXT_SCRIM, WASH_INTRO], 4.5, INTRO_BASES);
}

console.log(`\n${checks - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
