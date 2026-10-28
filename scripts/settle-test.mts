/**
 * Unit test for the spotlight gate (PRD v5, 3.4): a fake clock and scripted rect streams.
 *
 *   pnpm test:settle
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { FADE_IN_MS, FADE_OUT_MS, MAX_HOLD_MS, SETTLE_MS, SpotlightGate } from "@/lib/engine/settle";
import type { Rect } from "@/lib/engine/protocol";

let t = 0;
const clock = () => t;
let failures = 0;
let passes = 0;
function check(name: string, ok: boolean, detail = "") {
  if (ok) passes++;
  else {
    failures++;
    console.log(`  ✖ ${name}${detail ? `: ${detail}` : ""}`);
  }
}
const box = (x: number, w = 100, r = 8): Rect => ({ x, y: 10, w, h: 40, radii: [r, r, r, r] });
function gate() {
  t = 0;
  const g = new SpotlightGate<string>(clock);
  g.setReady(true);
  return g;
}
/** Advances the clock, evaluating every 4 ms like a timer would. Returns the first time shown. */
function run(g: SpotlightGate<string>, until: number): number | null {
  let first: number | null = null;
  while (t < until) {
    t += 4;
    if (g.view().shown && first === null) first = t;
  }
  return first;
}

console.log("settle gate");

// Constants as the PRD fixes them.
check("constants", SETTLE_MS === 120 && FADE_OUT_MS === 100 && FADE_IN_MS === 160 && MAX_HOLD_MS === 2000);

// A single move: hidden at once, shown 120 ms after the last change, at the latest geometry.
{
  const g = gate();
  g.update("a", [box(0)], false);
  const first = run(g, 200);
  check("initial settle shows after 120 ms", first !== null && first >= SETTLE_MS && first <= SETTLE_MS + 8, String(first));
  t = 1000;
  g.update("b", [box(10)], false);
  const v = g.view();
  check("a move hides at once", !v.shown);
  check("a hidden box keeps its last geometry", v.payload === "a");
  const shownAt = run(g, 1200);
  check("shown 120 ms after the move", shownAt !== null && shownAt - 1000 >= SETTLE_MS && shownAt - 1000 <= SETTLE_MS + 8, String(shownAt));
  check("shown at the latest geometry", g.view().payload === "b");
}

// Changes under EPSILON do not count.
{
  const g = gate();
  g.update("a", [box(0)], false);
  run(g, 200);
  g.update("a2", [box(0.3)], false);
  check("a 0.3 px change is not movement", g.view().shown);
}

// Repeated moves inside 120 ms keep the boxes hidden until 120 ms after the last one.
{
  const g = gate();
  g.update("a", [box(0)], false);
  run(g, 200);
  for (let i = 1; i <= 10; i++) {
    t = 200 + i * 50;
    g.update(`m${i}`, [box(i * 5)], false);
    check(`repeated move ${i} stays hidden`, !g.view().shown);
  }
  const last = t;
  const shownAt = run(g, last + 300);
  check("shown 120 ms after the last repeated move", shownAt !== null && shownAt - last >= SETTLE_MS && shownAt - last <= SETTLE_MS + 8, `${shownAt} vs ${last}`);
}

// A count change is movement.
{
  const g = gate();
  g.update("a", [box(0)], false);
  run(g, 200);
  g.update("b", [box(0), box(200)], false);
  check("a new rect hides", !g.view().shown);
}

// `animating` holds the state even with unchanged rects.
{
  const g = gate();
  g.update("a", [box(0)], false);
  run(g, 200);
  g.update("a", [box(0)], true);
  check("animating hides", !g.view().shown);
  const during = run(g, 800);
  check("animating holds the boxes hidden", during === null, String(during));
  g.update("a", [box(0)], false);
  const end = t;
  const shownAt = run(g, end + 300);
  check("shown 120 ms after animating ends", shownAt !== null && shownAt - end >= SETTLE_MS && shownAt - end <= SETTLE_MS + 8, String(shownAt && shownAt - end));
}

// A fade-in cancelled by movement: hidden again at once, shown after the next settle.
{
  const g = gate();
  g.update("a", [box(0)], false);
  const first = run(g, 200)!;
  t = first + 40; // inside the 160 ms fade-in
  g.update("b", [box(30)], false);
  check("movement during a fade-in hides", !g.view().shown);
  const again = run(g, t + 300);
  check("shown after the next settle", again !== null && g.view().payload === "b");
}

// The fail-safe: rects that never settle show at the latest geometry after 2000 ms, once.
{
  const g = gate();
  let forcedAt: number | null = null;
  let forcedCount = 0;
  let i = 0;
  while (t < 3000) {
    t += 4;
    if (t % 40 === 0) g.update(`x${++i}`, [box(i)], false);
    const v = g.view();
    if (v.forced) {
      forcedCount++;
      forcedAt = t;
    }
  }
  check("forced after 2000 ms", forcedAt !== null && forcedAt >= MAX_HOLD_MS && forcedAt <= MAX_HOLD_MS + 8, String(forcedAt));
  check("forced once", forcedCount === 1, String(forcedCount));
  check("a forced box follows the latest geometry", g.view().shown && g.view().payload === `x${i}`);
}

// A new step waits for step-done, then shows at the first settle after it.
{
  const g = gate();
  g.update("a", [box(0)], false);
  run(g, 200);
  g.reset();
  g.setReady(false);
  check("a new step hides the previous boxes", !g.view().shown);
  g.update("s1", [box(50)], false);
  const during = run(g, 1500);
  check("no boxes before step-done", during === null, String(during));
  g.setReady(true);
  check("quiet rects show at step-done", g.view().shown && g.view().payload === "s1");
  // Moving at step-done: the boxes wait for the settle after it.
  g.reset();
  g.setReady(false);
  t = 2000;
  g.update("s2", [box(80)], false);
  t = 2050;
  g.setReady(true);
  g.update("s2b", [box(90)], false);
  const end = t;
  const shownAt = run(g, end + 300);
  check("moving at step-done waits for the settle", shownAt !== null && shownAt - end >= SETTLE_MS, String(shownAt && shownAt - end));
  check("no fail-safe while a step plays", (() => {
    const h = gate();
    h.setReady(false);
    let forced = false;
    for (let k = 0; k < 900; k++) {
      t += 4;
      h.update(`p${k}`, [box(k)], false);
      if (h.view().forced) forced = true;
    }
    return !forced;
  })());
}

// A viewport resize message is movement before any rect changes.
{
  const g = gate();
  g.update("a", [box(0)], false);
  run(g, 200);
  g.disturb();
  check("resize-viewport hides", !g.view().shown);
  const shownAt = run(g, 500);
  check("shown 120 ms after the resize message", shownAt !== null && shownAt - 200 >= SETTLE_MS, String(shownAt));
}

// Reduced motion: the gate is the same (the settle window still applies); the CSS drops the
// transition so opacity jumps between 0 and 1.
{
  const css = readFileSync(path.join(process.cwd(), "styles", "components", "page.css"), "utf8");
  const reduced = /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.overlay__spotlight,\s*\.overlay__focus,\s*\.overlay__callout\s*\{\s*transition: none;/.test(css);
  check("reduced motion drops the opacity transition", reduced);
  check("only opacity transitions", !/\.overlay__spotlight[^{]*\{[^}]*transition:[^;}]*(left|top|width|height|transform)/.test(css));
}

console.log(failures ? `settle: ${passes} passed, ${failures} failed` : `settle: ${passes} passed`);
if (failures) process.exit(1);
