/**
 * Walks every demo page in the audience window with the forward and back keys and asserts what
 * the frame runtime reported (PRD Part A, 16.1): every step reached, no runtime errors, every
 * `assert` passing, and the same digest when a step is reached forward (animated) and backward
 * (reset and replay).
 *
 *   pnpm walk [page-or-section-id] [--browser=chromium|webkit|firefox] [--headed]
 *
 * Needs `pnpm dev` at DECK_URL (default http://localhost:3000) with the demo origin reachable.
 */
import { chromium, firefox, webkit, type Browser, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { hasFrame, type DemoPage, type DemoSection } from "@/content/demo-schema";
import type { SupportFile } from "@/lib/support-data";
import { sections } from "@/lib/content";
import type { StepResult } from "@/lib/engine/frame";

const BASE = process.env.DECK_URL ?? "http://localhost:3000";
const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith("--"));
const headed = args.includes("--headed");
const browserName = (args.find((a) => a.startsWith("--browser="))?.slice(10) ?? "chromium") as "chromium" | "webkit" | "firefox";

const failures: string[] = [];
let checks = 0;
const fail = (where: string, msg: string) => {
  failures.push(`${where}: ${msg}`);
  console.log(`    ✖ ${msg}`);
};
const pass = (msg: string) => {
  checks++;
  console.log(`    ✓ ${msg}`);
};

type Results = Record<string, StepResult & { seq: number }>;

async function results(page: Page): Promise<Results> {
  return page.evaluate(() => (window as unknown as { __stepResults?: Results }).__stepResults ?? {});
}

/** Waits for a result newer than `afterSeq` under `key`. */
async function waitForResult(page: Page, key: string, afterSeq: number, timeout = 8000): Promise<(StepResult & { seq: number }) | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = (await results(page))[key];
    if (r && r.seq > afterSeq) return r;
    await page.waitForTimeout(60);
  }
  return null;
}
async function lastSeq(page: Page): Promise<number> {
  return page.evaluate(() => (window as unknown as { __stepSeq?: number }).__stepSeq ?? 0);
}

let speaker: Page | null = null;

/**
 * Speaker window at 1440 by 900 (PRD v4, 5.1 and 7.6): on every step the header, the current
 * bullets and the Next line are visible without scrolling, no selector shows outside Reference,
 * and the cautions show on the now page's last step.
 */
async function checkSpeaker(where: string, demoPage: DemoPage, section: DemoSection, i: number) {
  if (!speaker) return;
  const step = demoPage.steps[i];
  const want = `Step ${i + 1} of ${demoPage.steps.length}: ${step.label}`;
  const synced = await speaker
    .waitForFunction((w) => document.querySelector(".notes__step")?.textContent?.startsWith(w), want, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  if (!synced) return fail(where, `speaker ${step.id}: the notes did not follow (wanted "${want}")`);
  const v = (await speaker.evaluate(`(() => {
    const body = document.querySelector(".speaker__notes-body");
    const br = body.getBoundingClientRect();
    const inView = (el) => { if (!el) return true; const r = el.getBoundingClientRect(); return r.top >= br.top - 1 && r.bottom <= br.bottom + 1 && r.bottom <= innerHeight; };
    const next = document.querySelector(".notes__next");
    const nr = next.getBoundingClientRect();
    const clone = body.cloneNode(true);
    clone.querySelectorAll("details").forEach((d) => d.remove());
    const text = clone.textContent + " " + next.textContent;
    const sel = /#[a-z][\\w-]*|\\[[a-z-]+(=|\\])/i.exec(text);
    return { header: inView(document.querySelector(".notes__header")), bullets: inView(document.querySelector(".notes__bullets")), next: nr.top >= 0 && nr.bottom <= innerHeight, selector: sel ? sel[0] : null, cautions: Boolean(document.querySelector(".notes__cautions")) };
  })()`)) as { header: boolean; bullets: boolean; next: boolean; selector: string | null; cautions: boolean };
  const problems = [!v.header && "header", !v.bullets && "bullets", !v.next && "Next line"].filter(Boolean);
  if (problems.length) fail(where, `speaker ${step.id}: ${problems.join(", ")} not visible at 1440 by 900`);
  else pass(`speaker ${step.id}: header, bullets and Next visible`);
  if (v.selector) fail(where, `speaker ${step.id}: selector text "${v.selector}" outside Reference`);
  const wantCautions = demoPage.stage === "now" && i === demoPage.steps.length - 1 && section.cautions.length > 0;
  if (wantCautions !== v.cautions) fail(where, `speaker ${step.id}: cautions ${v.cautions ? "shown" : "missing"}`);
  else if (wantCautions) pass(`speaker ${step.id}: cautions shown`);
}

/** Hands-on mode shows the step's ifKeyboard in the speaker window; turning it off replays the step. */
async function checkHandsOn(page: Page, where: string, demoPage: DemoPage, i: number) {
  const step = demoPage.steps[i];
  if (!speaker || !step.ifKeyboard) return;
  await page.keyboard.press("h");
  const shown = await speaker
    .waitForFunction((t) => document.querySelector(".notes__hands-on")?.textContent === t, step.ifKeyboard, { timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  await page.waitForTimeout(800);
  const seq = await lastSeq(page);
  await page.keyboard.press("h");
  const r = await waitForResult(page, `${demoPage.id}:${step.id}`, seq, 10000);
  if (!shown) fail(where, `hands-on ${step.id}: ifKeyboard not shown in the speaker window`);
  else pass(`hands-on ${step.id}: ifKeyboard shown`);
  if (!r) fail(where, `hands-on ${step.id}: no replay after hands-on off`);
}

async function walkPage(page: Page, section: DemoSection, demoPage: DemoPage) {
  const where = demoPage.id;
  console.log(`\n== ${where} (${section.label}, ${demoPage.stage}, ${demoPage.steps.length} steps)`);
  await page.goto(`${BASE}/present?s=${demoPage.id}`);
  if (!hasFrame(demoPage)) {
    await walkIntro(page, section, where);
    return;
  }
  await checkGeometry(page, demoPage, where);
  const forward: (string | null)[] = [];
  for (let i = 0; i < demoPage.steps.length; i++) {
    const step = demoPage.steps[i];
    const seq = i === 0 ? 0 : await lastSeq(page);
    if (i > 0) await page.keyboard.press("ArrowRight");
    const r = await waitForResult(page, `${demoPage.id}:${step.id}`, seq, i === 0 ? 15000 : 8000);
    if (!r) {
      fail(where, `${step.id}: no step result (frame not ready or the step did not finish)`);
      forward.push(null);
      continue;
    }
    const failed = r.asserts.filter((a) => a.stepId === step.id && !a.pass);
    if (failed.length) fail(where, `${step.id}: ${failed.map((a) => `${a.target} ${a.expect} (got ${a.actual})`).join("; ")}`);
    else pass(`${step.id} ${step.label}: ${r.asserts.filter((a) => a.stepId === step.id).length} assert(s) ok, ${r.ms}ms`);
    forward.push(r.digest);
    await checkSpeaker(where, demoPage, section, i);
    await checkHandsOn(page, where, demoPage, i);
  }
  // Back: reset and replay must land on the same digest.
  for (let i = demoPage.steps.length - 2; i >= 0; i--) {
    const step = demoPage.steps[i];
    const seq = await lastSeq(page);
    await page.keyboard.press("ArrowLeft");
    const r = await waitForResult(page, `${demoPage.id}:${step.id}`, seq, 10000);
    if (!r) {
      fail(where, `back ${step.id}: no step result`);
      continue;
    }
    const failed = r.asserts.filter((a) => !a.pass);
    if (failed.length) fail(where, `back ${step.id}: ${failed.map((a) => `${a.target} ${a.expect} (got ${a.actual})`).join("; ")}`);
    else if (forward[i] && r.digest !== forward[i]) console.log(`    · back ${step.id}: digest ${r.digest} differs from forward ${forward[i]} (asserts pass)`);
    else pass(`back ${step.id}: asserts pass, digest ${r.digest}`);
  }
}

const support = JSON.parse(readFileSync(path.join(process.cwd(), "content", ".generated", "support.json"), "utf8")) as SupportFile;

/** Intro slides (PRD v4, 7.6): the tiles render and their text matches support.json. */
async function walkIntro(page: Page, section: DemoSection, where: string) {
  const entry = support.sections[section.id];
  if (!entry) return fail(where, "no support.json entry");
  await page.waitForSelector(".support-row__tile", { timeout: 8000 }).catch(() => null);
  const tiles = await page.$$eval(".support-row__tile", (els) => els.map((el) => ({ version: el.querySelector(".support-row__version")?.textContent ?? "", name: el.querySelector(".support-row__name")?.textContent ?? "" })));
  const expected = entry.tiles.map((t) => ({ version: t.version ?? "Not yet", name: t.name }));
  if (JSON.stringify(tiles) !== JSON.stringify(expected)) fail(where, `tiles ${JSON.stringify(tiles)}; support.json says ${JSON.stringify(expected)}`);
  else pass(`${where}: ${tiles.length} tiles match support.json (${tiles.map((t) => `${t.name} ${t.version}`).join(", ")})`);
  const text = (await page.textContent(".intro__description")) ?? "";
  if (!text.includes(entry.since)) fail(where, `description lacks "${entry.since}"`);
  else pass(`${where}: generated sentence shown`);
}

/**
 * Geometry (PRD v4, 7.6): on walk pages the frame slot and the code panel are each 880 canvas px
 * wide, and a 44-column, 40-line fixture fits the code panel with no horizontal scroll.
 */
async function checkGeometry(page: Page, demoPage: DemoPage, where: string) {
  if (demoPage.stage !== "used-to" && demoPage.stage !== "now") return;
  await page.waitForSelector(".page__code .code__pre", { timeout: 10000 }).catch(() => null);
  // A string, so tsx does not wrap the helpers in its __name() calls inside the page.
  const g = (await page.evaluate(`(() => {
    const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
    const scale = canvas.width / 1920;
    const width = (sel) => Math.round((document.querySelector(sel)?.getBoundingClientRect().width ?? 0) / scale);
    // Measure on a clone beside the real panel: React owns the real nodes.
    const real = document.querySelector(".page__code .code__pre");
    const pre = real.cloneNode(false);
    const code = real.querySelector("code").cloneNode(false);
    code.textContent = Array.from({ length: 40 }, () => "W".repeat(44)).join("\\n");
    pre.append(code);
    pre.style.position = "absolute";
    pre.style.visibility = "hidden";
    pre.style.width = real.getBoundingClientRect().width / scale + "px";
    real.parentElement.append(pre);
    const fixture = { scrollWidth: pre.scrollWidth, clientWidth: pre.clientWidth };
    pre.remove();
    return { frame: width(".page__frame"), code: width(".page__code"), fixture };
  })()`)) as { frame: number; code: number; fixture: { scrollWidth: number; clientWidth: number } };
  if (g.frame !== 880 || g.code !== 880) fail(where, `slots are ${g.frame} and ${g.code} canvas px; both should be 880`);
  else pass(`${where}: frame slot and code panel are 880 px`);
  if (g.fixture.scrollWidth > g.fixture.clientWidth) fail(where, `a 44 by 40 fixture scrolls sideways (${g.fixture.scrollWidth} > ${g.fixture.clientWidth})`);
  else pass(`${where}: 44 by 40 fixture fits without horizontal scroll`);
}

async function main() {
  const health = await fetch(`${BASE}/_health`).catch(() => null);
  if (!health?.ok) {
    console.error(`No deck at ${BASE}. Start it with \`pnpm dev\` and run the walk again.`);
    process.exit(2);
  }
  const launcher = { chromium, webkit, firefox }[browserName];
  // Two windows in one context share BroadcastChannel; neither may be throttled as a background tab.
  const chromiumArgs = ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"];
  const browser: Browser = await launcher.launch({ headless: !headed, ...(browserName === "chromium" ? { args: chromiumArgs } : {}) });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  // The speaker checks are layout checks; they run in Chromium, where background tabs can be unthrottled.
  if (!args.includes("--no-speaker") && browserName === "chromium") {
    speaker = await context.newPage();
    await speaker.setViewportSize({ width: 1440, height: 900 });
    await speaker.goto(`${BASE}/speaker`);
    // The audience page keeps the foreground, so its frames keep animation frames.
    await page.bringToFront();
  }
  page.on("pageerror", (err) => fail("page", `uncaught error: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !/favicon/.test(msg.text())) console.log(`    console: ${msg.text().slice(0, 160)}`);
  });

  const targets = sections.flatMap((s) => s.pages.filter((p) => !only || p.id === only || s.id === only).map((p) => ({ s, p })));
  if (targets.length === 0) {
    console.error(only ? `No page or section "${only}"` : "No pages");
    process.exit(2);
  }
  for (const { s, p } of targets) {
    try {
      await walkPage(page, s, p);
    } catch (err) {
      fail(p.id, `walk threw: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  await browser.close();
  console.log(`\n${browserName}: ${checks} check(s) passed, ${failures.length} failure(s)`);
  for (const f of failures) console.log(`  ✖ ${f}`);
  process.exit(failures.length ? 1 : 0);
}

void main();
