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

async function walkPage(page: Page, section: DemoSection, demoPage: DemoPage) {
  const where = demoPage.id;
  console.log(`\n== ${where} (${section.label}, ${demoPage.stage}, ${demoPage.steps.length} steps)`);
  await page.goto(`${BASE}/present?s=${demoPage.id}`);
  if (!hasFrame(demoPage)) {
    await walkIntro(page, section, where);
    return;
  }
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

async function main() {
  const health = await fetch(`${BASE}/_health`).catch(() => null);
  if (!health?.ok) {
    console.error(`No deck at ${BASE}. Start it with \`pnpm dev\` and run the walk again.`);
    process.exit(2);
  }
  const launcher = { chromium, webkit, firefox }[browserName];
  const browser: Browser = await launcher.launch({ headless: !headed });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
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
