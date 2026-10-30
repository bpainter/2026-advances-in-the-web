/**
 * `pnpm perf nav`: slide to slide, key to new canvas painted, background ready, intro still ready
 * and the frame's first step, in reader mode or the audience window, cold then warm
 * (docs/PRD-perf.md 9.2). Ported from docs/perf/baseline/perf/nav.mjs and summarize-nav.mjs.
 *
 *   pnpm perf nav [--mode=reader|audience] [--variant=prefetch|noprefetch|nowarm|control]
 *                 [--profile=none|venue|poor] [--dwell=3000] [--origin=<presenter>]
 *
 * `noprefetch` aborts every router prefetch, so each press fetches its slide. `nowarm` aborts the
 * FrameWarm document on intro slides; `control` runs the same interception without aborting.
 */
import type { Page, Route } from "@playwright/test";
import { applyProfile, kind, launch, median, origins, parseArgs, percentile, profileOf, slideIds, table, writeResult } from "./lib.mts";

/** Three stretches of the deck: start slide and number of presses. */
const WALKS: [string, number][] = [
  ["what-we-cover", 8],
  ["m1-now", 4],
  ["what-changed", 2],
];

const HOOKS = `
(() => {
  const w = window;
  w.__swaps = [];
  w.__steps = [];
  let seq;
  Object.defineProperty(w, '__stepSeq', { configurable: true, get() { return seq; }, set(v) { seq = v; w.__steps.push(performance.now()); } });
  let last = null;
  const check = () => {
    const s = document.getElementById('stage');
    if (s && s !== last) {
      last = s;
      const rec = { t: performance.now(), bg: s.dataset.background };
      w.__swaps.push(rec);
      requestAnimationFrame(() => requestAnimationFrame(() => { rec.paint = performance.now(); }));
    }
  };
  new MutationObserver(check).observe(document, { subtree: true, childList: true });
})();
`;

const PROBE = `(({ n, k }) => {
  const swap = window.__swaps[n] ?? null;
  // The file the stage paints: --slide-bg-image is image-set(AVIF, JPEG) since P1-IMG, so the
  // first URL in it with a resource entry, else the plain URL in data-background.
  let bgEnd = null;
  if (swap && swap.bg) {
    const layer = document.querySelector('#stage .stage__bg');
    const urls = layer ? [...getComputedStyle(layer).backgroundImage.matchAll(/url\\("?([^")]+)"?\\)/g)].map((m) => m[1]) : [];
    for (const u of [...urls, swap.bg]) {
      const e = performance.getEntriesByName(new URL(u, location.href).href).pop();
      if (e) { bgEnd = e.responseEnd; break; }
    }
  }
  const img = document.querySelector('.stage__slide .intro__image, .stage__slide .intro img');
  if (img && img.complete && img.naturalWidth && !img.__done) img.__done = performance.now();
  return { swap, step: window.__steps[k] ?? null, frame: document.querySelector('.page-frame__iframe') !== null, url: location.pathname + location.search, bgEnd, img: Boolean(img), imgDone: img ? img.__done ?? null : null };
})`;

interface Rec {
  mode: string;
  variant: string;
  profile: string;
  pass: "cold" | "warm";
  from: string;
  to: string;
  swapMs: number | null;
  paintMs: number | null;
  frameStep0Ms: number | null;
  bgReadyMs: number | null;
  introImgReadyMs: number | null | undefined;
  rscOnPress: string[];
}

interface Probe {
  swap: { t: number; bg?: string; paint?: number } | null;
  step: number | null;
  frame: boolean;
  url: string;
  bgEnd: number | null;
  img: boolean;
  imgDone: number | null;
}

export async function run(argv: string[]): Promise<void> {
  const { opt } = parseArgs(argv);
  const { P, D } = origins(opt);
  const profile = profileOf(opt);
  const mode = opt("mode") ?? "reader";
  const variant = opt("variant") ?? "prefetch";
  const dwell = Number(opt("dwell") ?? 3000);
  const order = await slideIds();
  const slideUrl = (id: string) => (mode === "reader" ? `${P}/s/${id}` : `${P}/present?s=${id}`);
  const state = { allow: null as string | null, onIntro: false };

  const browser = await launch();
  const all: Rec[] = [];
  for (const [start, presses] of WALKS) {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await context.addInitScript(HOOKS);
    const page: Page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await applyProfile(cdp, profile);
    const reqLog: { at: number; url: string; rsc: boolean; kind: string }[] = [];
    page.on("request", (r) => {
      const h = r.headers();
      reqLog.push({ at: Date.now(), url: r.url(), rsc: Boolean(h["rsc"]) || /_rsc=/.test(r.url()), kind: kind({ url: r.url(), type: r.resourceType() === "document" ? "Document" : "" }) });
    });
    if (variant === "noprefetch") {
      await page.route(/_rsc=/, (route: Route) => {
        const h = route.request().headers();
        const u = new URL(route.request().url());
        const id = u.pathname.startsWith("/s/") ? u.pathname.slice(3) : u.searchParams.get("s");
        if (h["next-router-prefetch"] || h["next-router-segment-prefetch"] || !state.allow || id !== state.allow) return route.abort();
        return route.continue();
      });
    }
    if (variant === "nowarm" || variant === "control") {
      // On an intro slide no page frame mounts, so a demo-origin document requested there is FrameWarm's.
      await page.route(`${D}/**`, (route: Route) => {
        if (variant === "nowarm" && state.onIntro && route.request().resourceType() === "document") return route.abort();
        return route.continue();
      });
    }
    for (const pass of ["cold", "warm"] as const) {
      await page.goto(slideUrl(start), { waitUntil: "load" });
      await page.waitForTimeout(dwell + 1500);
      for (let i = 0; i < presses; i++) {
        const before = (await page.evaluate("({ swaps: window.__swaps.length, steps: window.__steps.length, url: location.pathname + location.search })")) as { swaps: number; steps: number; url: string };
        const wall = Date.now();
        const curId = before.url.startsWith("/s/") ? before.url.slice(3).split("?")[0] : new URLSearchParams(before.url.split("?")[1]).get("s");
        state.allow = order[order.indexOf(curId ?? "") + 1] ?? null;
        state.onIntro = false;
        const t0 = (await page.evaluate("performance.now()")) as number;
        await page.keyboard.press("Shift+ArrowRight");
        let r: Probe | null = null;
        const deadline = Date.now() + 15000;
        while (Date.now() < deadline) {
          r = (await page.evaluate(`${PROBE}(${JSON.stringify({ n: before.swaps, k: before.steps })})`)) as Probe;
          if (r.swap?.paint && (!r.frame || r.step) && r.bgEnd !== null && (!r.img || r.imgDone)) break;
          if (r.swap?.paint && Date.now() - wall > 5000) break;
          await page.waitForTimeout(25);
        }
        state.allow = null;
        state.onIntro = /intro$/.test(r?.url ?? "");
        const swapMs = r?.swap ? r.swap.t - t0 : null;
        const during = reqLog.filter((q) => q.at >= wall && q.at <= wall + (swapMs ?? 3000) + 5);
        const rec: Rec = {
          mode,
          variant,
          profile,
          pass,
          from: before.url,
          to: r?.url ?? "",
          swapMs: swapMs == null ? null : Math.round(swapMs),
          paintMs: r?.swap?.paint ? Math.round(r.swap.paint - t0) : null,
          frameStep0Ms: r?.step ? Math.round(r.step - t0) : null,
          bgReadyMs: r?.bgEnd == null ? null : Math.max(0, Math.round(r.bgEnd - t0)),
          introImgReadyMs: r?.img ? (r.imgDone == null ? null : Math.max(0, Math.round(r.imgDone - t0))) : undefined,
          rscOnPress: during.filter((q) => q.rsc).map((q) => q.url.replace(P, "")),
        };
        all.push(rec);
        console.log(`${mode} ${variant} ${profile} ${pass} ${rec.from.padEnd(26)} -> ${rec.to.padEnd(26)} paint=${rec.paintMs} step0=${rec.frameStep0Ms ?? "-"} bg=${rec.bgReadyMs} img=${rec.introImgReadyMs ?? "-"} rscOnPress=${rec.rscOnPress.length}`);
        await page.waitForTimeout(dwell);
      }
    }
    await context.close();
  }
  await browser.close();
  const out = writeResult(`nav-${mode}-${variant}-${profile}`, { task: "nav", origin: P, demo: D, mode, variant, profile, dwell, rows: all });

  const cls = (r: Rec) => {
    const to = r.to.replace(/.*[=/]/, "");
    if (/intro$/.test(to)) return "to intro";
    if (/used-to$/.test(to)) return "intro to used-to";
    if (/now$/.test(to)) return "used-to to now";
    return "to glass slide";
  };
  const rows: (string | number | null)[][] = [];
  for (const pass of ["cold", "warm"] as const)
    for (const c of ["to intro", "intro to used-to", "used-to to now", "to glass slide"]) {
      const sel = all.filter((r) => r.pass === pass && cls(r) === c && r.swapMs != null);
      if (!sel.length) continue;
      const framed = c.includes("used-to") || c.includes("now");
      rows.push([pass, c, sel.length, `${median(sel.map((r) => r.paintMs))} / ${percentile(sel.map((r) => r.paintMs), 0.9)}`, `${median(sel.map((r) => r.bgReadyMs))} / ${Math.max(...sel.map((r) => r.bgReadyMs ?? 0))}`, c === "to intro" ? `${median(sel.map((r) => r.introImgReadyMs))} / ${Math.max(...sel.map((r) => r.introImgReadyMs ?? 0))}` : "", framed ? `${median(sel.map((r) => r.frameStep0Ms))} / ${percentile(sel.map((r) => r.frameStep0Ms), 0.9)}` : "", sel.reduce((n, r) => n + r.rscOnPress.length, 0)]);
    }
  console.log("\n" + table(["Pass", "Transition", "n", "Paint med / p90", "Background med / max", "Intro still med / max", "Frame s0 med / p90", "RSC on press"], rows));
  const lost = all.filter((r) => r.swapMs == null).length;
  if (lost) console.log(`\n${lost} press(es) did not change the slide`);
  console.log(`\nwrote ${out}`);
}
