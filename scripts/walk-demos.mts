/**
 * Walks every demo slide in the audience window with nothing but the forward and back keys and
 * asserts that the demo did what the step says (docs/demo-plan.md, E6.2):
 *
 *   - the visible frame echoed `demo:state` for the step's effective state and step id;
 *   - a code step's target was spotlit (`demo:spotlight` count >= 1) and has a visible box;
 *   - `.demo-split[data-phase]` matches the step's phase and switching phase loads no document;
 *   - no frame posted `demo:error`, and the walk back replays the same states in reverse;
 *   - a rapid double-press pass raises no error.
 *
 * Needs the dev server (`pnpm dev`) at DECK_URL (default http://localhost:3000). Run with the
 * react-server condition so the demo modules load outside Next:
 *
 *   pnpm walk [slide-id] [--browser=chromium|webkit|firefox] [--headed]
 */
import { chromium, firefox, webkit, type Browser, type Frame, type Page } from "@playwright/test";
import type { Demo, Slide } from "@/content/schema";
import { slides } from "@/lib/content";
import { resolveLive } from "@/lib/steps";

type LogEntry = { type: string; state?: string; stepId?: string; variant?: string; selector?: string | null; count?: number; message?: string };

const BASE = process.env.DECK_URL ?? "http://localhost:3000";
const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith("--"));
const headed = args.includes("--headed");
const browserName = (args.find((a) => a.startsWith("--browser="))?.slice(10) ?? "chromium") as "chromium" | "webkit" | "firefox";
const STEP_TIMEOUT = 6000;

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

declare global {
  interface Window {
    __demoLog: LogEntry[];
  }
}

async function readLog(page: Page): Promise<LogEntry[]> {
  return page.evaluate(() => window.__demoLog ?? []);
}

/** Waits until an entry after `from` satisfies `pred`; returns the whole log or null on timeout. */
async function waitFor(page: Page, from: number, pred: (e: LogEntry) => boolean, timeout = STEP_TIMEOUT): Promise<LogEntry | null> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const log = await readLog(page);
    const hit = log.slice(from).find(pred);
    if (hit) return hit;
    await page.waitForTimeout(40);
  }
  return null;
}

function frameFor(page: Page, demo: Demo, variant: "native" | "legacy"): Frame | undefined {
  const want = variant === "legacy" ? `/demos/${demo.id}/legacy` : demo.live.kind === "route" && demo.live.src ? demo.live.src : `/demos/${demo.id}`;
  return page.frames().find((f) => {
    const u = new URL(f.url(), BASE);
    return u.pathname === want || (demo.live.kind === "route" && u.pathname.startsWith(`/demos/${demo.id}/`) && variant === "native");
  });
}

async function spotlitVisible(frame: Frame | undefined): Promise<boolean> {
  if (!frame) return false;
  try {
    return await frame.evaluate(() => {
      const el = document.querySelector("[data-spotlight]");
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  } catch {
    return false;
  }
}

async function waitReady(page: Page, count: number) {
  await page.waitForFunction((n) => document.querySelectorAll('.demo[data-status="ready"]').length >= n, count, { timeout: 20000 });
}

/** Asserts one step of `demo` after the key that reached it was pressed; `from` is the log length before the press. */
async function assertStep(page: Page, demo: Demo, i: number, from: number, where: string, opts: { grid: boolean }) {
  const live = resolveLive(demo, i);
  const variant = live.phase === "before" && demo.legacy ? "legacy" : "native";
  const label = `${where} ${live.stepId ?? i} (${live.phase}${live.state ? `=${live.state}` : ""})`;
  if (live.state) {
    const hit = await waitFor(page, from, (e) => e.type === "demo:state" && e.stepId === live.stepId && e.state === live.state && (e.variant ?? "native") === variant);
    if (hit) pass(`${label}: state echoed by the ${variant} frame`);
    else fail(where, `${label}: no demo:state echo from the ${variant} frame (url ${page.url()}, active frame ${await page.evaluate(() => document.activeElement?.closest(".demo")?.getAttribute("data-variant") ?? document.activeElement?.tagName)})`);
  } else {
    fail(where, `${label}: step has no effective state (not clicker-driven)`);
  }
  if (!opts.grid) {
    const phase = await page.getAttribute(".demo-split", "data-phase");
    if (phase === live.phase) pass(`${label}: phase attribute is ${phase}`);
    else fail(where, `${label}: .demo-split[data-phase] is ${phase}, expected ${live.phase}`);
  }
  if (live.target) {
    const hit = await waitFor(page, from, (e) => e.type === "demo:spotlight" && e.selector === live.target && (e.variant ?? "native") === variant);
    if (!hit) fail(where, `${label}: no demo:spotlight echo for ${live.target}`);
    else if ((hit.count ?? 0) < 1) fail(where, `${label}: target ${live.target} matched nothing`);
    else if (await spotlitVisible(frameFor(page, demo, variant))) pass(`${label}: target ${live.target} spotlit and visible`);
    else fail(where, `${label}: target ${live.target} is spotlit but has no visible box`);
  }
  const errors = (await readLog(page)).slice(from).filter((e) => e.type === "demo:error");
  if (process.env.WALK_DEBUG) {
    const after = await page.evaluate(() => ({ step: document.querySelector(".code__step")?.textContent, url: location.search }));
    const writes = (await readLog(page)).slice(from).filter((e) => e.type === "demo:write").map((e) => e.message);
    console.log(`      after ${label}: ${JSON.stringify(after)} writes: ${writes.join(" | ")}`);
  }
  for (const e of errors) fail(where, `${label}: demo:error ${e.message ?? ""}`);
}

async function walkSteps(page: Page, demo: Demo, where: string, opts: { grid: boolean; routeKind: boolean }) {
  const n = demo.steps.length;
  if (n === 0) {
    fail(where, "no steps");
    return;
  }
  let navigations = 0;
  const onNav = (f: Frame) => {
    if (f !== page.mainFrame()) navigations++;
  };
  page.on("framenavigated", onNav);

  // Forward: the first step is already showing; assert it from the start of the log.
  for (let i = 0; i < n; i++) {
    const from = i === 0 ? 0 : (await readLog(page)).length;
    if (i > 0) await page.keyboard.press("ArrowRight");
    if (process.env.WALK_DEBUG) {
      const snap = await page.evaluate(() => ({ step: document.querySelector(".code__step")?.textContent, phase: document.querySelector(".demo-split")?.getAttribute("data-phase"), active: document.activeElement?.closest(".demo")?.getAttribute("data-variant") ?? document.activeElement?.tagName }));
      const tail = (await readLog(page)).slice(from).map((e) => `${e.type.slice(5)}${e.state ? `=${e.state}` : ""}${e.stepId ? `/${e.stepId}` : ""}${e.variant ? `:${e.variant[0]}` : ""}${e.selector !== undefined ? `[${e.selector}=${e.count}]` : ""}${e.message ? `(${e.message})` : ""}`);
      console.log(`      debug i=${i} url=${new URL(page.url()).searchParams.get("step")} ${JSON.stringify(snap)} log: ${tail.join(" ")}`);
    }
    await assertStep(page, demo, i, from, where, opts);
  }
  // Back: the same states in reverse.
  for (let i = n - 2; i >= 0; i--) {
    const from = (await readLog(page)).length;
    await page.keyboard.press("ArrowLeft");
    await assertStep(page, demo, i, from, `${where} back`, opts);
  }
  // Double-press stress: forward and back fast, then settle on step 0.
  const stressFrom = (await readLog(page)).length;
  for (let i = 1; i < n; i++) await page.keyboard.press("ArrowRight", { delay: 10 });
  for (let i = 1; i < n; i++) await page.keyboard.press("ArrowLeft", { delay: 10 });
  await page.waitForTimeout(600);
  const stressErrors = (await readLog(page)).slice(stressFrom).filter((e) => e.type === "demo:error");
  if (stressErrors.length) fail(where, `rapid presses raised ${stressErrors.length} demo:error(s): ${stressErrors[0].message ?? ""}`);
  else pass(`${where}: rapid forward and back raised no errors`);

  page.off("framenavigated", onNav);
  if (!opts.routeKind && navigations > 0) fail(where, `${navigations} frame navigation(s) during the walk; phase switches must not reload`);
  else if (!opts.routeKind) pass(`${where}: no frame reloads during the walk`);
}

/** Fetches a slide's documents once so a dev-server compile never lands inside the timed walk. */
async function warm(slide: Slide) {
  const demos = slide.demo ? [slide.demo] : (slide.demos ?? []);
  const urls = [`${BASE}/present?s=${slide.id}`];
  for (const d of demos) {
    if (!d.code.some((f) => f.lang !== "bash")) continue;
    urls.push(d.live.kind === "route" && d.live.src ? `${BASE}${d.live.src}` : `${BASE}/demos/${d.id}`);
    if (d.legacy) urls.push(`${BASE}/demos/${d.id}/legacy`);
  }
  await Promise.all(urls.map((u) => fetch(u).catch(() => null)));
}

async function walkSlide(page: Page, slide: Slide) {
  const where = `${slide.index} ${slide.id}`;
  console.log(`\n== ${where} (${slide.layout})`);
  await warm(slide);
  await page.goto(`${BASE}/present?s=${slide.id}`);
  if (slide.layout === "terminal") {
    const n = slide.demo?.steps.length ?? 0;
    // The stage's key handler exists once the presenter store has mirrored the URL.
    await page.waitForFunction(() => new URL(location.href).searchParams.has("s"), undefined, { timeout: 10000 });
    for (let i = 1; i < n; i++) await page.keyboard.press("ArrowRight");
    const reached = n <= 1 || (await page.waitForFunction((last) => new URL(location.href).searchParams.get("step") === String(last), n - 1, { timeout: 5000 }).then(() => true, () => false));
    if (reached) pass(`${where}: transcript stepped to ${n}/${n}`);
    else fail(where, `transcript did not reach step ${n}; URL step is ${new URL(page.url()).searchParams.get("step")}`);
    return;
  }
  if (slide.layout === "demo-split" && slide.demo) {
    const demo = slide.demo;
    await waitReady(page, demo.legacy ? 2 : 1);
    await walkSteps(page, demo, where, { grid: false, routeKind: demo.live.kind === "route" });
    return;
  }
  if (slide.layout === "demo-grid" && slide.demos) {
    await waitReady(page, slide.demos.length);
    for (let c = 0; c < slide.demos.length; c++) {
      const demo = slide.demos[c];
      await page.keyboard.press(String(c + 1));
      await page.waitForFunction((i) => document.querySelector(`.demo-grid__cell[data-enlarged="true"] [data-demo-id="${i}"]`) !== null, demo.id, { timeout: 5000 });
      await walkSteps(page, demo, `${where} cell ${c + 1} ${demo.id}`, { grid: true, routeKind: demo.live.kind === "route" });
      await page.keyboard.press("0");
    }
  }
}

async function main() {
  const health = await fetch(`${BASE}/_health`).catch(() => null);
  if (!health?.ok) {
    console.error(`No deck at ${BASE}. Start it with \`pnpm dev\` (or set DECK_URL) and run the walk again.`);
    process.exit(2);
  }
  const launcher = { chromium, webkit, firefox }[browserName];
  const browser: Browser = await launcher.launch({ headless: !headed });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await context.addInitScript(() => {
    window.__demoLog = [];
    window.addEventListener("message", (e) => {
      const d = e.data as LogEntry | null;
      if (d && typeof d.type === "string" && d.type.startsWith("demo:")) window.__demoLog.push(d);
    });
    // Every presenter write also goes out on the channel; record them next to the demo messages.
    if (window === window.top) {
      new BroadcastChannel("deck:dev").addEventListener("message", (e) => {
        const m = e.data as { type: string; state?: { seq: number; stepIndex: number; slideId: string; writer: string } };
        if (m?.type === "state" && m.state) window.__demoLog.push({ type: "demo:write", message: `seq${m.state.seq} step${m.state.stepIndex} ${m.state.slideId}` });
      });
    }
  });
  const page = await context.newPage();
  page.on("pageerror", (err) => fail("page", `uncaught error: ${err.message}`));

  const demoIds = (s: Slide) => (s.demo ? [s.demo.id] : (s.demos ?? []).map((d) => d.id));
  const targets = slides.filter((s) => (s.layout === "demo-split" || s.layout === "demo-grid" || s.layout === "terminal") && (!only || s.id === only || demoIds(s).includes(only)));
  if (targets.length === 0) {
    console.error(only ? `No demo slide with id "${only}"` : "No demo slides");
    process.exit(2);
  }
  for (const slide of targets) {
    try {
      await walkSlide(page, slide);
    } catch (err) {
      fail(`${slide.index} ${slide.id}`, `walk threw: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  await browser.close();
  console.log(`\n${browserName}: ${checks} check(s) passed, ${failures.length} failure(s)`);
  for (const f of failures) console.log(`  ✖ ${f}`);
  process.exit(failures.length ? 1 : 0);
}

void main();
