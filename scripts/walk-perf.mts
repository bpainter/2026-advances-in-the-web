/**
 * Stage checks of docs/PRD-perf.md, section 3 (WS-1). Run through the walk's dispatcher:
 *
 *   pnpm walk focus [intro prefix] [--origin=<presenter>] [--holds=0,1500,3000] [--serial]
 *       P0-1: on every intro slide that warms the next frame, a press at 0.3, 0.6, 0.9, 1.25, 2.5
 *       and 4 s after arrival advances, with the warm document held back by 0, 1.5 and 3 s (216
 *       presses on 12 intros), and `document.activeElement` is never the warming frame.
 *   pnpm walk underlay [page or section] [--origin=<presenter>] [--profile=venue|poor] [--no-reader]
 *       P0-2: key to frame content visible (poster or live document), forward and Back arrivals,
 *       audience and reader windows; no "Loading demo…" on a page that has a poster; and the swap
 *       diff between the poster and the live document for every s0 and last-step poster.
 *   pnpm walk keys [--origin=<presenter>]
 *       P0-3 and P0-4: Tab out of frames in reader mode, Space on controls in the reader and
 *       speaker windows, reader letter scoping, the help dialog, and the audience key matrix from
 *       the stage and from inside a frame.
 *
 * `--origin` defaults to DECK_URL or http://localhost:3000 (`pnpm dev`). `focus` and `underlay` also
 * run against production (PRD-perf 9.3). Evaluated code is passed as strings, so tsx does not wrap
 * helpers in its __name() calls.
 */
import { chromium, firefox, webkit, type Browser, type BrowserContext, type Page, type Request } from "@playwright/test";
import { createRequire } from "node:module";
import { hasFrame, type DemoPage } from "@/content/demo-schema";
import { sections, slides } from "@/lib/content";
import { firstPoster } from "@/lib/assets";

/** Posters PageBody keeps out of the underlay (their swap diff is over 2%); keep in step with components/page/PageBody.tsx. */
const UNDERLAY_EXCLUDED = new Set(["m4-now:s0"]);

type Report = { fail: (where: string, msg: string) => void; pass: (msg: string) => void };

/** sharp from Next's install (PRD-perf P1-IMG uses the same), for the swap diff. */
type Sharp = (input: Buffer) => { raw: () => { toBuffer: (o: { resolveWithObject: true }) => Promise<{ data: Buffer; info: { width: number; height: number; channels: number } }> } };
function loadSharp(): Sharp {
  const req = createRequire(createRequire(import.meta.url).resolve("next/package.json"));
  return req("sharp") as Sharp;
}

const PROFILES: Record<string, { offline: boolean; latency: number; downloadThroughput: number; uploadThroughput: number }> = {
  venue: { offline: false, latency: 60, downloadThroughput: (20 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 },
  poor: { offline: false, latency: 150, downloadThroughput: (5 * 1024 * 1024) / 8, uploadThroughput: (1 * 1024 * 1024) / 8 },
};

const ids = slides.map((s) => s.id);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, Math.max(0, ms)));
const pct = (xs: number[], p: number) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
};
const describeActive = `(() => { const a = document.activeElement; if (!a) return "none"; if (a === document.body) return "body"; return a.tagName.toLowerCase() + (a.id ? "#" + a.id : "") + (typeof a.className === "string" && a.className ? "." + a.className.trim().split(/\\s+/).join(".") : ""); })()`;

export async function walkPerf(task: "focus" | "underlay" | "keys", args: string[]): Promise<number> {
  const origin = (args.find((a) => a.startsWith("--origin="))?.slice(9) ?? process.env.DECK_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const browserName = (args.find((a) => a.startsWith("--browser="))?.slice(10) ?? "chromium") as "chromium" | "webkit" | "firefox";
  const filter = args.filter((a) => !a.startsWith("--"))[1];
  const health = await fetch(`${origin}/_health`).catch(() => null);
  if (!health?.ok) {
    console.error(`No deck at ${origin}. Start it with \`pnpm dev\`, or pass --origin=<deployment>.`);
    return 2;
  }
  const failures: string[] = [];
  let checks = 0;
  const report: Report = {
    fail: (where, msg) => {
      failures.push(`${where}: ${msg}`);
      console.log(`    ✖ ${where}: ${msg}`);
    },
    pass: (msg) => {
      checks++;
      console.log(`    ✓ ${msg}`);
    },
  };
  const launcher = { chromium, webkit, firefox }[browserName];
  const chromiumArgs = ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--enable-blink-features=CSSGridLanesLayout"];
  const browser = await launcher.launch({ headless: !args.includes("--headed"), ...(browserName === "chromium" ? { args: chromiumArgs } : {}) });
  console.log(`\n== walk ${task} (${browserName}, ${origin})`);
  try {
    if (task === "focus") await walkFocus(browser, origin, args, filter, report);
    else if (task === "underlay") await walkUnderlay(browser, origin, args, filter, report);
    else await walkKeys(browser, origin, report);
  } finally {
    await browser.close();
  }
  console.log(`\n${browserName} ${task}: ${checks} check(s) passed, ${failures.length} failure(s)`);
  for (const f of failures) console.log(`  ✖ ${f}`);
  return failures.length ? 1 : 0;
}

// ------------------------------------------------------------------------------------ focus

/** Records every 50 ms sample where the warming frame holds the window's focus. */
const WARM_WATCH = `(() => {
  window.__warmFocus = [];
  setInterval(() => {
    const a = document.activeElement;
    if (a && a.matches && a.matches("iframe.frame-warm")) window.__warmFocus.push({ t: Math.round(performance.now()), s: new URLSearchParams(location.search).get("s") });
  }, 50);
})()`;

/** Intro slides whose next page is a live demo-origin frame: the slides that mount FrameWarm. */
function warmedIntros(): { prev: string; intro: string; next: string }[] {
  const out: { prev: string; intro: string; next: string }[] = [];
  for (const s of sections) {
    const intro = s.pages.find((p) => p.stage === "intro");
    if (!intro) continue;
    const next = s.pages[s.pages.indexOf(intro) + 1];
    if (!next || !hasFrame(next) || next.frame.route.startsWith("/framework")) continue;
    out.push({ prev: ids[ids.indexOf(intro.id) - 1], intro: intro.id, next: next.id });
  }
  return out;
}

const onSlide = (id: string) => `new URLSearchParams(location.search).get("s") === ${JSON.stringify(id)} && Boolean(document.querySelector("#stage"))`;

async function isWarmRequest(page: Page, req: Request): Promise<boolean> {
  if (!req.isNavigationRequest() || req.frame() === page.mainFrame()) return false;
  if (/[?&]warm=1(&|$)/.test(req.url())) return true;
  try {
    const el = await req.frame().frameElement();
    return ((await el.getAttribute("class")) ?? "").includes("frame-warm");
  } catch {
    return false;
  }
}

/** page.goto that rides out an aborted navigation (a dev server recompiling, a client navigation in flight). */
async function gotoRetry(page: Page, url: string) {
  for (let i = 0; ; i++) {
    try {
      return await page.goto(url);
    } catch (err) {
      if (i >= 2) throw err;
      await sleep(1000);
    }
  }
}

type Press = { intro: string; hold: number; delay: number; advanced: boolean; focusAtPress: string };

async function focusRun(ctx: BrowserContext, origin: string, intros: ReturnType<typeof warmedIntros>, hold: number, delays: number[], log: (s: string) => void): Promise<{ presses: Press[]; warmSamples: { intro: string; n: number }[]; dwell: { intro: string; advanced: boolean }[] }> {
  const page = await ctx.newPage();
  await page.addInitScript(WARM_WATCH);
  const presenterHost = new URL(origin).host;
  if (hold > 0) {
    await page.route(
      (url) => url.host !== presenterHost,
      async (route, req) => {
        if (await isWarmRequest(page, req)) await sleep(hold);
        await route.continue().catch(() => {});
      },
    );
  }
  const presses: Press[] = [];
  const warmSamples: { intro: string; n: number }[] = [];
  const dwell: { intro: string; advanced: boolean }[] = [];
  const waitOn = (id: string, timeout: number) =>
    page
      .waitForFunction(onSlide(id), null, { timeout, polling: 50 })
      .then(() => true)
      .catch(() => false);
  const warmCount = async () => ((await page.evaluate(`(window.__warmFocus || []).length`).catch(() => 0)) as number);
  const backToPrev = async (prev: string, intro: string) => {
    // Shift+ArrowLeft twice (next page, intro, previous slide); a reload when a press is lost.
    let ok = false;
    if (await page.evaluate(onSlide(intro.replace(/-intro$/, "-used-to")))) {
      await page.keyboard.press("Shift+ArrowLeft");
      if (await waitOn(intro, 3000)) {
        await page.keyboard.press("Shift+ArrowLeft");
        ok = await waitOn(prev, 3000);
      }
    }
    if (!ok) {
      const before = await warmCount();
      if (before) warmSamples.push({ intro, n: before });
      await gotoRetry(page, `${origin}/present?s=${prev}`);
      await waitOn(prev, 15000);
      await sleep(2000);
    }
    await sleep(700);
  };

  for (const { prev, intro, next } of intros) {
    await gotoRetry(page, `${origin}/present?s=${prev}`);
    await waitOn(prev, 15000);
    await sleep(2500);
    const trial = async (delay: number, counted: boolean) => {
      await page.keyboard.press("Shift+ArrowRight");
      if (!(await waitOn(intro, 4000))) {
        // The arrival press is not under test; a cold first load can miss it. Once more.
        const at = (await page.evaluate(`location.search`)) as string;
        log(`    · ${intro} hold ${hold}: no arrival from ${prev} (at ${at}, focus ${await page.evaluate(describeActive)}); pressing again`);
        if (!at.includes(`s=${prev}`)) await gotoRetry(page, `${origin}/present?s=${prev}`);
        await waitOn(prev, 15000);
        await sleep(2500);
        await page.keyboard.press("Shift+ArrowRight");
        if (!(await waitOn(intro, 8000))) return null;
      }
      const arrived = Date.now();
      await sleep(delay - (Date.now() - arrived));
      const focusAtPress = (await page.evaluate(describeActive)) as string;
      await page.keyboard.press("ArrowRight");
      const advanced = await waitOn(next, 3000);
      if (counted) presses.push({ intro, hold, delay, advanced, focusAtPress });
      await backToPrev(prev, intro);
      return advanced;
    };
    for (const delay of delays) await trial(delay, true);
    // A 5 s dwell: the warming frame never takes focus in the first 5 s, and a press then advances.
    const adv = await trial(5000, false);
    dwell.push({ intro, advanced: Boolean(adv) });
    const n = await warmCount();
    if (n) warmSamples.push({ intro, n });
    await page.evaluate(`window.__warmFocus = []`).catch(() => {});
    const lost = presses.filter((p) => p.intro === intro && !p.advanced);
    log(`    · hold ${hold} ms, ${intro}: ${delays.length - lost.length}/${delays.length} advanced${lost.length ? ` (lost at ${lost.map((p) => `${p.delay} ms on ${p.focusAtPress}`).join(", ")})` : ""}`);
  }
  await page.close();
  return { presses, warmSamples, dwell };
}

async function walkFocus(browser: Browser, origin: string, args: string[], filter: string | undefined, report: Report) {
  const holds = (args.find((a) => a.startsWith("--holds="))?.slice(8) ?? "0,1500,3000").split(",").map(Number);
  const delays = (args.find((a) => a.startsWith("--delays="))?.slice(9) ?? "300,600,900,1250,2500,4000").split(",").map(Number);
  const intros = warmedIntros().filter((i) => !filter || i.intro === filter || i.intro.startsWith(`${filter}-`));
  if (!intros.length) return report.fail("focus", `no warmed intro matches ${filter}`);
  console.log(`  ${intros.length} intro slide(s), presses at ${delays.join(", ")} ms, warm document held ${holds.join(", ")} ms`);
  const run = async (hold: number) => {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    try {
      return await focusRun(ctx, origin, intros, hold, delays, (s) => console.log(s));
    } finally {
      await ctx.close();
    }
  };
  const results = args.includes("--serial") ? await holds.reduce<Promise<Awaited<ReturnType<typeof run>>[]>>(async (acc, h) => [...(await acc), await run(h)], Promise.resolve([])) : await Promise.all(holds.map(run));
  const presses = results.flatMap((r) => r.presses);
  const lost = presses.filter((p) => !p.advanced);
  console.log(`\n  presses: ${presses.length}, lost: ${lost.length}`);
  for (const h of holds) {
    const ph = presses.filter((p) => p.hold === h);
    console.log(`    hold ${h} ms: ${ph.filter((p) => !p.advanced).length} lost of ${ph.length}; by delay: ${delays.map((d) => `${d} ms ${ph.filter((p) => p.delay === d && !p.advanced).length}`).join(", ")}`);
  }
  if (lost.length) report.fail("focus", `${lost.length} of ${presses.length} presses lost: ${lost.map((p) => `${p.intro} +${p.delay} ms (hold ${p.hold}, focus ${p.focusAtPress})`).join("; ")}`);
  else report.pass(`focus: all ${presses.length} presses advanced`);
  const warm = new Map<string, number>();
  for (const w of results.flatMap((r) => r.warmSamples)) warm.set(w.intro, (warm.get(w.intro) ?? 0) + w.n);
  if (warm.size) report.fail("focus", `the warming frame held focus on ${warm.size} intro(s): ${[...warm].map(([intro, n]) => `${intro} ${(n * 0.05).toFixed(1)} s`).join(", ")} (50 ms samples, all holds)`);
  else report.pass(`focus: document.activeElement was never iframe.frame-warm (50 ms samples, including a 5 s dwell per intro and hold)`);
  const dwell = results.flatMap((r) => r.dwell);
  const dwellLost = dwell.filter((d) => !d.advanced);
  if (dwellLost.length) report.fail("focus", `a press after the 5 s dwell was lost ${dwellLost.length} of ${dwell.length} times: ${[...new Set(dwellLost.map((d) => d.intro))].join(", ")}`);
  else report.pass("focus: a press after a 5 s dwell advanced on every intro");
}

// ------------------------------------------------------------------------------------ underlay

/** The poster PageBody passes for a step (DemoPageSlide's rule, through lib/assets.ts), or null. */
function posterFor(page: DemoPage & { frame: NonNullable<DemoPage["frame"]> }, stepIndex: number): string | null {
  const step = page.steps[stepIndex];
  return firstPoster(step.poster, `/posters/${page.id}/${step.id}.jpg`, page.frame.poster);
}

/**
 * Installed right before the press (a frame that holds focus swallows the keydown, so the clock
 * starts here, a few ms early): every animation frame for 1.5 s, notes when
 * the new stage's frame slot first shows content (its poster, or a live document that reported
 * ready) and every frame where "Loading demo…" is displayed. The outgoing stage is marked first.
 */
const UNDERLAY_PROBE = (target: string, reader: boolean) => `(() => {
  const old = document.querySelector("#stage");
  if (old) old.dataset.ulOld = "1";
  const st = { t0: performance.now(), stage: -1, visible: -1, kind: null, loading: [], done: false };
  window.__ul = st;
  const onTarget = () => ${reader ? `location.pathname === "/s/${target}"` : `new URLSearchParams(location.search).get("s") === "${target}"`};
  const loop = () => {
    const now = performance.now() - st.t0;
    const stage = document.querySelector("#stage:not([data-ul-old])");
    const pf = onTarget() && stage ? stage.querySelector(".page-frame") : null;
    if (pf && st.stage < 0) st.stage = now;
    if (pf) {
      const status = pf.querySelector(".page-frame__status");
      if (status && getComputedStyle(status).display !== "none" && /Loading demo/.test(status.textContent)) st.loading.push(Math.round(now));
      if (st.visible < 0) {
        const poster = pf.querySelector("img.page-frame__poster");
        const live = pf.dataset.status === "ready" && pf.querySelector('.page-frame__iframe[data-visible="true"]');
        if (live) { st.visible = now; st.kind = "live"; }
        else if (poster && !poster.hidden && poster.complete && poster.naturalWidth > 0 && getComputedStyle(poster).display !== "none") { st.visible = now; st.kind = "poster"; }
      }
    }
    if (now < 1500) requestAnimationFrame(loop);
    else st.done = true;
  };
  requestAnimationFrame(loop);
})()`;

type Arrival = { page: string; window: "audience" | "reader"; dir: "forward" | "back"; ms: number; stage: number; kind: string | null; loading: number[]; poster: boolean; diff: number | null };

async function walkUnderlay(browser: Browser, origin: string, args: string[], filter: string | undefined, report: Report) {
  const sharp = loadSharp();
  const profile = args.find((a) => a.startsWith("--profile="))?.slice(10);
  const windows: ("audience" | "reader")[] = args.includes("--no-reader") ? ["audience"] : ["audience", "reader"];
  const framed = sections.flatMap((s) => s.pages.filter((p) => hasFrame(p) && (!filter || p.id === filter || s.id === filter || s.id.startsWith(`${filter}-`) || p.id.startsWith(`${filter}-`))).map((p) => p as DemoPage & { frame: NonNullable<DemoPage["frame"]> }));
  // The F2 apps run separately (pnpm dev:framework); their pages are skipped when they are not up.
  const f2Up = await fetch("http://localhost:3106/").then((r) => r.ok).catch(() => false);
  const targets = framed.filter((p) => !p.frame.route.startsWith("/framework") || f2Up);
  if (targets.length < framed.length) console.log(`  · skipped ${framed.length - targets.length} F2 page(s): the framework apps are not running`);
  const arrivals: Arrival[] = [];

  for (const win of windows) {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    if (profile && PROFILES[profile]) {
      const cdp = await ctx.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", PROFILES[profile]);
    }
    const url = (id: string) => (win === "audience" ? `${origin}/present?s=${id}` : `${origin}/s/${id}`);
    const here = (id: string) => (win === "audience" ? onSlide(id) : `location.pathname === "/s/${id}" && Boolean(document.querySelector("#stage"))`);
    for (const p of targets) {
      const i = ids.indexOf(p.id);
      const legs: { dir: "forward" | "back"; from: string | undefined; key: string; step: number }[] = [
        { dir: "forward", from: ids[i - 1], key: "Shift+ArrowRight", step: 0 },
        { dir: "back", from: ids[i + 1], key: "ArrowLeft", step: p.steps.length - 1 },
      ];
      for (const leg of legs) {
        if (!leg.from) continue;
        await page.goto(url(leg.from));
        await page.waitForFunction(here(leg.from), null, { timeout: 15000 }).catch(() => null);
        // Arrival settles and the prefetches finish, as on stage (r7 9.2: two seconds).
        await page.waitForTimeout(2500);
        // Reader: keys act from the page, not from a control (the stage takes them).
        if (win === "reader") await page.evaluate(`document.activeElement && document.activeElement !== document.body && !document.activeElement.matches("iframe") && document.activeElement.blur()`);
        await page.evaluate(UNDERLAY_PROBE(p.id, win === "reader"));
        await page.keyboard.press(leg.key);
        await page.waitForFunction(`window.__ul && window.__ul.done`, null, { timeout: 8000 }).catch(() => null);
        const ul = (await page.evaluate(`window.__ul`)) as { stage: number; visible: number; kind: string | null; loading: number[] };
        // PageBody's UNDERLAY_EXCLUDED: no underlay there, so neither the swap diff nor the "Loading demo…" check apply.
        const excluded = UNDERLAY_EXCLUDED.has(`${p.id}:${p.steps[leg.step].id}`);
        const poster = excluded ? null : posterFor(p, leg.step);
        const a: Arrival = { page: p.id, window: win, dir: leg.dir, ms: ul.visible, stage: ul.stage, kind: ul.kind, loading: ul.loading, poster: Boolean(poster), diff: null };
        // The swap diff (audience only, where the stage is at scale 1): the poster as the slot
        // shows it against the live document once the step is done, the overlay hidden in both.
        if (win === "audience" && poster) {
          const step = p.steps[leg.step];
          const key = `${p.id}:${step.id}`;
          const done = await page
            .waitForFunction(`Boolean((window.__stepResults || {})[${JSON.stringify(key)}])`, null, { timeout: 15000 })
            .then(() => true)
            .catch(() => false);
          if (done) {
            await page.waitForTimeout(400);
            a.diff = await swapDiff(page, poster, sharp);
          }
        }
        arrivals.push(a);
        const bits = [`${a.ms < 0 ? "never" : `${Math.round(a.ms)} ms`} (${a.kind ?? "nothing"}; slide in the DOM at ${Math.round(a.stage)} ms)`, a.loading.length ? `"Loading demo…" for ${a.loading.length} frame(s) from ${a.loading[0]} ms` : null, a.diff !== null ? `swap diff ${(a.diff * 100).toFixed(2)}%` : null].filter(Boolean);
        console.log(`    · ${win} ${leg.dir.padEnd(7)} ${p.id} ${p.steps[leg.step].id}: ${bits.join(", ")}`);
      }
    }
    await ctx.close();
  }

  for (const win of windows) {
    const xs = arrivals.filter((a) => a.window === win);
    const ms = xs.map((a) => (a.ms < 0 ? 1500 : a.ms));
    const limit = win === "audience" ? 100 : 250;
    const p50 = pct(ms, 50);
    const p90 = pct(ms, 90);
    const st = xs.map((a) => (a.stage < 0 ? 1500 : a.stage));
    const line = `${win}: key to frame content visible, ${xs.length} arrivals, median ${Math.round(p50)} ms, p90 ${Math.round(p90)} ms (target ≤ ${limit} ms p90; the new slide reached the DOM at median ${Math.round(pct(st, 50))}, p90 ${Math.round(pct(st, 90))} ms)`;
    if (p90 > limit) report.fail("underlay", line);
    else report.pass(line);
    const loading = xs.filter((a) => a.poster && a.loading.length);
    if (loading.length) report.fail("underlay", `${win}: "Loading demo…" showed on ${loading.length} arrival(s) with a poster: ${loading.map((a) => `${a.page} ${a.dir} (${a.loading.length} frames)`).join(", ")}`);
    else report.pass(`${win}: no "Loading demo…" on any page that has a poster`);
  }
  const diffs = arrivals.filter((a) => a.diff !== null);
  const over = diffs.filter((a) => a.diff! > 0.02);
  if (over.length) report.fail("underlay", `swap diff above 2%: ${over.map((a) => `${a.page} ${a.dir === "forward" ? "s0" : "last"} ${(a.diff! * 100).toFixed(2)}%`).join(", ")}`);
  else if (diffs.length) report.pass(`swap diff ≤ 2% on all ${diffs.length} posters (max ${(Math.max(...diffs.map((a) => a.diff!)) * 100).toFixed(2)}%)`);
}

/** Mean absolute difference (0 to 1) between the slot showing the live document and the poster. */
async function swapDiff(page: Page, poster: string, sharp: Sharp): Promise<number | null> {
  const style = await page.addStyleTag({ content: ".overlay, nextjs-portal { visibility: hidden !important; }" });
  try {
    const clip = (await page.evaluate(`(() => { const r = document.querySelector("#stage .page-frame").getBoundingClientRect(); return { x: Math.round(r.x) + 2, y: Math.round(r.y) + 2, width: Math.round(r.width) - 4, height: Math.round(r.height) - 4 }; })()`)) as { x: number; y: number; width: number; height: number };
    const live = await page.screenshot({ clip, animations: "disabled" });
    const ok = (await page.evaluate(`(async () => {
      const pf = document.querySelector("#stage .page-frame");
      const iframe = pf.querySelector('.page-frame__iframe[data-visible="true"]');
      if (!iframe) return false;
      iframe.style.visibility = "hidden";
      const img = document.createElement("img");
      img.className = "page-frame__poster";
      img.dataset.walk = "1";
      img.alt = "";
      img.src = ${JSON.stringify(poster)};
      pf.querySelector(".page-frame__scaled").prepend(img);
      await img.decode().catch(() => {});
      return true;
    })()`)) as boolean;
    if (!ok) return null;
    await page.waitForTimeout(50);
    const still = await page.screenshot({ clip, animations: "disabled" });
    await page.evaluate(`(() => { document.querySelector('img.page-frame__poster[data-walk]')?.remove(); const f = document.querySelector('#stage .page-frame__iframe[data-visible="true"]'); if (f) f.style.visibility = ""; })()`);
    const a = await sharp(live).raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(still).raw().toBuffer({ resolveWithObject: true });
    if (a.info.width !== b.info.width || a.info.height !== b.info.height) return 1;
    // Screenshots may or may not carry alpha: index each by its own channel count, RGB only.
    const ca = a.info.channels;
    const cb = b.info.channels;
    const px = a.info.width * a.info.height;
    let sum = 0;
    for (let i = 0; i < px; i++) for (let c = 0; c < 3; c++) sum += Math.abs(a.data[i * ca + c] - b.data[i * cb + c]);
    return sum / (px * 3) / 255;
  } finally {
    await style.evaluate((el) => el.remove()).catch(() => {});
  }
}

// ------------------------------------------------------------------------------------ keys

const READER_STEP = `(() => { const n = new URLSearchParams(location.search).get("step"); return n === null ? 0 : Number(n); })()`;
/** The step the stage shows, from the aria-hidden indicator ("Step 2 of 4"); 0 on one-step pages. */
const SHOWN_STEP = `(() => { const s = document.querySelector("#stage .page__steps span"); const m = s && /Step (\\d+) of/.exec(s.textContent); return m ? Number(m[1]) - 1 : 0; })()`;
const PREVIEW_STEP = `(() => { const s = document.querySelector(".speaker .page__steps span, .page__steps span"); const m = s && /Step (\\d+) of/.exec(s.textContent); return m ? Number(m[1]) - 1 : 0; })()`;

/** Opens a reader page and waits until its frame has replayed the step the URL names. */
async function openReader(page: Page, origin: string, start: string) {
  await page.goto(`${origin}/s/${start}`);
  const [id, query] = start.split("?");
  const p = sections.flatMap((s) => s.pages).find((x) => x.id === id);
  const raw = new URLSearchParams(query ?? "").get("step");
  const step = p ? p.steps[raw === "last" ? p.steps.length - 1 : Number(raw ?? 0)] : undefined;
  if (step) await page.waitForFunction(`Boolean((window.__stepResults || {})[${JSON.stringify(`${id}:${step.id}`)}])`, null, { timeout: 20000 }).catch(() => null);
  else await page.waitForSelector('.page-frame[data-status="ready"]', { timeout: 20000 }).catch(() => null);
  await page.waitForTimeout(500);
}

async function walkKeys(browser: Browser, origin: string, report: Report) {
  // ----- P0-3: Tab leaves the frame in reader mode -----
  console.log("\n  reader: Tab and Shift+Tab past the frame (P0-3)");
  {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await ctx.newPage();
    for (const start of ["d1-used-to", "d2-now", "d1-now?step=last"]) {
      const where = `keys /s/${start}`;
      await openReader(page, origin, start);
      const inFrame = (await page.evaluate(`document.activeElement?.matches?.("iframe.page-frame__iframe") ?? false`)) as boolean;
      if (start.includes("step=last")) {
        if (!inFrame) report.fail(where, `the last step did not move focus into the frame (focus on ${await page.evaluate(describeActive)}); the forwarded Tab is untested here`);
        else {
          // The pill fades after 2.5 s idle; a Tab the frame forwards wakes it.
          await page.waitForTimeout(3000);
          const idleBefore = (await page.evaluate(`document.querySelector(".stage")?.dataset.idle`)) as string;
          await page.keyboard.press("Tab");
          await page.waitForTimeout(150);
          const idleAfter = (await page.evaluate(`document.querySelector(".stage")?.dataset.idle`)) as string;
          const after = (await page.evaluate(describeActive)) as string;
          if (idleAfter !== "false") report.fail(where, `after a forwarded Tab the pill is idle (data-idle ${idleAfter}, was ${idleBefore})`);
          else report.pass(`${where}: a Tab from inside the frame wakes the pill (data-idle ${idleBefore} to false)`);
          if (after.startsWith("iframe")) report.fail(where, "a Tab from inside the frame left focus in the frame");
          else report.pass(`${where}: a Tab from inside the frame moves past it, to ${after}`);
          // Back into the frame for the Shift+Tab leg.
          await openReader(page, origin, start);
        }
      }
      let reached = -1;
      let trapped = 0;
      // A person's pace: presses 100 ms apart.
      for (let i = 0; i < 30 && reached < 0; i++) {
        await page.waitForTimeout(100);
        await page.keyboard.press("Tab");
        const a = (await page.evaluate(describeActive)) as string;
        if (a.startsWith("iframe")) trapped++;
        if (a.includes("reader-controls__button")) reached = i + 1;
      }
      if (reached < 0) report.fail(where, `30 Tabs never reached the reader pill (focus on ${await page.evaluate(describeActive)}, ${trapped} in the frame)`);
      else report.pass(`${where}: Tab reaches the pill in ${reached} press(es)`);
      // Back from the pill: Shift+Tab reaches the slide's first link or the stage, through the frame.
      if (start.includes("step=last")) {
        await openReader(page, origin, start);
      }
      let back = -1;
      let last = "";
      for (let i = 0; i < 30 && back < 0; i++) {
        await page.waitForTimeout(100);
        await page.keyboard.press("Shift+Tab");
        last = (await page.evaluate(describeActive)) as string;
        const firstLink = (await page.evaluate(`(() => { const l = document.querySelector("#stage a[href]"); return l ? document.activeElement === l : false; })()`)) as boolean;
        if (firstLink || last === "body" || last.startsWith("div#stage")) back = i + 1;
      }
      if (back < 0) report.fail(where, `30 Shift+Tabs never reached the slide's first link or the stage (focus on ${last})`);
      else report.pass(`${where}: Shift+Tab reaches ${last === "body" ? "the start of the page" : last} in ${back} press(es)`);
    }
    // The frame is one tab stop at most: never focusable by Tab unless hands-on is on.
    await page.goto(`${origin}/s/d1-used-to`);
    await page.waitForSelector('.page-frame[data-status="ready"]', { timeout: 20000 }).catch(() => null);
    const tabIndex = (await page.evaluate(`document.querySelector('.page-frame__iframe[data-visible="true"]')?.tabIndex ?? null`)) as number | null;
    if (tabIndex !== -1) report.fail("keys reader", `the frame's tabIndex is ${tabIndex} with hands-on off, wanted -1`);
    else report.pass("keys reader: the frame is out of the tab order with hands-on off");
    await page.focus("#stage");
    await page.keyboard.press("h");
    await page.waitForTimeout(300);
    const on = (await page.evaluate(`({ handsOn: document.querySelector(".stage")?.dataset.handsOn, tabIndex: document.querySelector('.page-frame__iframe[data-visible="true"]')?.tabIndex })`)) as { handsOn: string; tabIndex: number };
    if (on.handsOn !== "true") report.fail("keys reader", "h on the stage did not turn hands-on on");
    else if (on.tabIndex !== 0) report.fail("keys reader", `hands-on is on but the frame's tabIndex is ${on.tabIndex}`);
    else report.pass("keys reader: h on the stage turns hands-on on, and the frame joins the tab order");
    await ctx.close();
  }

  // ----- P0-4: reader Space and Enter on controls, letters, the help dialog -----
  console.log("\n  reader: keys act where they are meant (P0-4)");
  {
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
    const page = await ctx.newPage();
    // Every window.open the deck makes, named windows included (a reused window opens no new page).
    await page.addInitScript(`(() => { const open = window.open; window.__opened = []; window.open = function (...a) { window.__opened.push(String(a[0])); return open.apply(this, a); }; })()`);
    const opened = async () => ((await page.evaluate(`window.__opened || []`)) as string[]);
    await page.goto(`${origin}/s/d1-used-to?step=1`);
    await page.waitForSelector('.page-frame[data-status="ready"]', { timeout: 20000 }).catch(() => null);
    await page.waitForTimeout(600);
    await page.focus('.reader-controls__button[aria-label="Previous"]');
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);
    const s1 = (await page.evaluate(READER_STEP)) as number;
    if (!page.url().includes("/s/d1-used-to") || s1 !== 0) report.fail("keys reader", `Space on Previous went to ${new URL(page.url()).pathname}${new URL(page.url()).search}, wanted step 0 of d1-used-to`);
    else report.pass("keys reader: Space on Previous goes back one step");
    const before = page.url();
    await page.focus('.reader-controls__button[aria-label="Keyboard help"]');
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    const helpOpen = (await page.evaluate(`document.querySelector("dialog.keyboard-help")?.open ?? false`)) as boolean;
    if (!helpOpen || page.url() !== before) report.fail("keys reader", `Space on Keyboard help: help ${helpOpen ? "open" : "closed"}, deck ${page.url() === before ? "still" : "moved"}`);
    else report.pass("keys reader: Space on Keyboard help opens the help, and the deck stays");
    if (helpOpen) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(500);
      const still = (await page.evaluate(`document.querySelector("dialog.keyboard-help")?.open ?? false`)) as boolean;
      if (page.url() !== before || !still) report.fail("keys reader", `ArrowRight with the help open: deck ${page.url() === before ? "still" : "moved"}, help ${still ? "open" : "closed"}`);
      else report.pass("keys reader: ArrowRight with the help open moves nothing");
      await page.focus("dialog.keyboard-help .keyboard-help__close");
      await page.keyboard.press("Space");
      await page.waitForTimeout(400);
      const closed = !((await page.evaluate(`document.querySelector("dialog.keyboard-help")?.open ?? false`)) as boolean);
      if (!closed || page.url() !== before) report.fail("keys reader", `Space on the help's Close: help ${closed ? "closed" : "open"}, deck ${page.url() === before ? "still" : "moved"}`);
      else report.pass("keys reader: Space on Close closes the help, and the deck stays");
    }
    // Letters with focus on a pill button or a slide link do nothing.
    const letterCheck = async (where: string, focusSel: string) => {
      await page.focus(focusSel);
      const url = page.url();
      for (const k of ["s", "o", "d", "h"]) await page.keyboard.press(k);
      await page.waitForTimeout(500);
      const st = (await page.evaluate(`({ handsOn: document.querySelector(".stage")?.dataset.handsOn, rehearsal: Boolean(document.querySelector(".stage__rehearsal")) })`)) as { handsOn: string; rehearsal: boolean };
      const o = await opened();
      const problems = [page.url() !== url && "the deck moved", o.length > 0 && `opened ${o.join(", ")}`, st.handsOn === "true" && "hands-on turned on", st.rehearsal && "the rehearsal overlay showed"].filter(Boolean);
      if (problems.length) report.fail("keys reader", `s, o, d, h on ${where}: ${problems.join(", ")}`);
      else report.pass(`keys reader: s, o, d and h on ${where} do nothing`);
    };
    await letterCheck("the Next button", '.reader-controls__button[aria-label="Next"]');
    const fresh = async (id: string) => {
      await page.goto(`${origin}/s/${id}`);
      await page.waitForSelector("#stage a[href]", { timeout: 15000 }).catch(() => null);
      await page.waitForTimeout(500);
    };
    await fresh("title");
    await letterCheck("a slide link", "#stage a[href]");
    // Presenter-only letters do nothing in reader mode, even from the stage.
    await fresh("title");
    await page.focus("#stage");
    const url = page.url();
    for (const k of ["s", "t", "b", ".", "d", "g"]) await page.keyboard.press(k);
    await page.waitForTimeout(500);
    const st = (await page.evaluate(`({ blank: document.querySelector(".stage")?.dataset.blank, rehearsal: Boolean(document.querySelector(".stage__rehearsal")), goto: Boolean(document.querySelector("dialog[open]")) })`)) as { blank: string; rehearsal: boolean; goto: boolean };
    const o = await opened();
    const problems = [page.url() !== url && "the deck moved", o.length > 0 && `opened ${o.join(", ")}`, st.rehearsal && "the rehearsal overlay showed", st.goto && "a dialog opened"].filter(Boolean);
    if (problems.length) report.fail("keys reader", `s, t, b, ., d, g on the stage: ${problems.join(", ")}`);
    else report.pass("keys reader: the presenter-only keys s, t, b, ., d and g do nothing");
    // Navigation keys still work from a control (not Space): ArrowRight with focus on Next.
    await page.focus('.reader-controls__button[aria-label="Next"]');
    await page.keyboard.press("ArrowRight");
    await page.waitForURL((u) => !u.pathname.endsWith("/s/title"), { timeout: 3000 }).catch(() => null);
    if (page.url().endsWith("/s/title")) report.fail("keys reader", "ArrowRight with focus on Next did not move the deck");
    else report.pass("keys reader: ArrowRight with focus on a pill button still moves the deck");
    await ctx.close();
  }

  // ----- P0-4: speaker window -----
  console.log("\n  speaker: Space presses the focused control (P0-4)");
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const speaker = await ctx.newPage();
    await speaker.goto(`${origin}/speaker?s=d1-used-to`);
    await speaker.waitForSelector(".speaker__controls", { timeout: 20000 }).catch(() => null);
    await speaker.waitForTimeout(800);
    await speaker.evaluate(`document.activeElement && document.activeElement.blur && document.activeElement.blur()`);
    await speaker.keyboard.press("PageDown");
    await speaker.waitForTimeout(400);
    const at1 = (await speaker.evaluate(PREVIEW_STEP)) as number;
    const prev = speaker.locator(".speaker__controls button").filter({ hasText: /^Previous$|Previous/ }).first();
    if (at1 !== 1 || !(await prev.count())) report.fail("keys speaker", `setup: step ${at1 + 1} after PageDown, Previous button ${await prev.count() ? "found" : "missing"}`);
    else {
      await prev.focus();
      await speaker.keyboard.press("Space");
      await speaker.waitForTimeout(500);
      const at = (await speaker.evaluate(PREVIEW_STEP)) as number;
      if (at !== 0) report.fail("keys speaker", `Space on Previous left the deck at step ${at + 1} (from step 2), wanted step 1`);
      else report.pass("keys speaker: Space on Previous goes back");
    }
    const buttons = speaker.locator(".speaker__controls button:not([disabled])");
    const count = await buttons.count();
    let bad: string[] = [];
    for (let i = 0; i < count; i++) {
      const b = buttons.nth(i);
      const name = ((await b.getAttribute("aria-label")) ?? (await b.textContent()) ?? "").trim();
      await b.focus();
      const s0 = (await speaker.evaluate(PREVIEW_STEP)) as number;
      await speaker.keyboard.press("PageDown");
      await speaker.waitForTimeout(350);
      const s1 = (await speaker.evaluate(PREVIEW_STEP)) as number;
      await speaker.keyboard.press("PageUp");
      await speaker.waitForTimeout(350);
      const s2 = (await speaker.evaluate(PREVIEW_STEP)) as number;
      if (s1 !== s0 + 1 || s2 !== s0) bad.push(`${name} (${s0 + 1} to ${s1 + 1} to ${s2 + 1})`);
      // A drawer or dialog a control opened would swallow the next key; close it.
      await speaker.keyboard.press("Escape");
    }
    bad = bad.filter(Boolean);
    if (bad.length) report.fail("keys speaker", `PageDown and PageUp with focus on: ${bad.join(", ")}`);
    else report.pass(`keys speaker: PageDown and PageUp work with focus on each of ${count} controls`);
    await ctx.close();
  }

  // ----- the audience key matrix, from the stage and from inside a frame -----
  console.log("\n  audience: the key matrix (PRD-perf 2.3)");
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    for (const from of ["stage", "frame"] as const) {
      const where = `keys audience (${from})`;
      await page.goto(`${origin}/present?s=d1-used-to`);
      await page.waitForSelector('.page-frame[data-status="ready"]', { timeout: 20000 }).catch(() => null);
      await page.waitForTimeout(1500);
      await page.evaluate(`window.__noReload = 1`);
      const place = async () => {
        if (from === "stage") await page.focus("#stage");
        else await page.evaluate(`document.querySelector('.page-frame__iframe[data-visible="true"]')?.focus()`);
        await page.waitForTimeout(100);
        // A frame keeps focus through steps; check it is where the leg says.
        const a = (await page.evaluate(describeActive)) as string;
        return from === "stage" ? a.startsWith("div#stage") : a.startsWith("iframe") && a.includes("page-frame__iframe");
      };
      if (!(await place())) {
        report.fail(where, `could not put focus on the ${from} (focus on ${await page.evaluate(describeActive)})`);
        continue;
      }
      const problems: string[] = [];
      const step = async () => (await page.evaluate(SHOWN_STEP)) as number;
      const waitStep = async (n: number) => {
        for (let i = 0; i < 40; i++) {
          if ((await step()) === n) return true;
          await page.waitForTimeout(50);
        }
        return false;
      };
      // Let each step finish before the next press, so Next advances instead of finishing it.
      const settle = () => page.waitForTimeout(1600);
      const pairs: [string, number][] = [
        ["ArrowRight", 1],
        ["ArrowLeft", 0],
        ["PageDown", 1],
        ["PageUp", 0],
        ["Space", 1],
        ["ArrowLeft", 0],
      ];
      for (const [key, want] of pairs) {
        await page.keyboard.press(key);
        if (!(await waitStep(want))) problems.push(`${key} left step ${(await step()) + 1}, wanted ${want + 1}`);
        await settle();
        await place();
      }
      for (const key of ["b", "."]) {
        await page.keyboard.press(key);
        await page.waitForTimeout(250);
        const on = (await page.evaluate(`document.querySelector(".stage")?.dataset.blank`)) as string;
        await page.keyboard.press(key);
        await page.waitForTimeout(250);
        const off = (await page.evaluate(`document.querySelector(".stage")?.dataset.blank`)) as string;
        if (on !== "true" || off !== "false") problems.push(`${key} blank ${on} then ${off}`);
        await place();
      }
      await page.keyboard.press("f");
      await page.waitForTimeout(400);
      const fs = (await page.evaluate(`Boolean(document.fullscreenElement)`)) as boolean;
      await page.keyboard.press("f");
      await page.waitForTimeout(400);
      const fsOff = (await page.evaluate(`Boolean(document.fullscreenElement)`)) as boolean;
      if (!fs || fsOff) problems.push(`f fullscreen ${fs} then ${fsOff}`);
      await place();
      const before = await step();
      for (const key of ["F5", "Escape"]) {
        await page.keyboard.press(key);
        await page.waitForTimeout(400);
      }
      const survived = (await page.evaluate(`window.__noReload === 1`).catch(() => false)) as boolean;
      if (!survived) problems.push("F5 reloaded the window");
      if ((await step()) !== before) problems.push("F5 or Escape moved the deck");
      if (from === "frame") {
        // Tab and Escape forwarded from a frame are ignored here: focus stays in the frame.
        await page.keyboard.press("Tab");
        await page.waitForTimeout(200);
        const a = (await page.evaluate(describeActive)) as string;
        if (!a.includes("page-frame__iframe")) problems.push(`Tab moved focus out of the frame to ${a}`);
      }
      if (problems.length) report.fail(where, problems.join("; "));
      else report.pass(`${where}: arrows, PageUp, PageDown, Space, b, ., f, F5 and Escape behave as before`);
    }
    await ctx.close();
  }
}
