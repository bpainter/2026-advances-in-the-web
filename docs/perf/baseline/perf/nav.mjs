// Slide-to-slide navigation timing on the live site, reader (/s/) and audience (/present).
// Usage: node nav.mjs <reader|audience> <prefetch|noprefetch|nowarm> <none|venue> [dwellMs]
import { writeFileSync, mkdirSync } from "node:fs";
import { launch, P, D, PROFILES, kind } from "./lib.mjs";

const [mode = "reader", variant = "prefetch", profileName = "none", dwellArg = "3000"] = process.argv.slice(2);
const DWELL = Number(dwellArg);
const profile = PROFILES[profileName];

// Each walk starts on a fresh context (cold HTTP cache), then a second pass in the same context (warm).
const WALKS = [
  ["what-we-cover", 8], // what-we-cover -> d1-intro -> d1-used-to -> d1-now -> d2-intro -> d2-used-to -> d2-now -> d3-intro -> d3-used-to
  ["m1-now", 4], // m1-now -> m2-intro -> m2-used-to -> m2-now -> m3-intro
  ["what-changed", 2], // what-changed -> people-to-follow -> closing
];

const ORDER = "title the-mandate three-reactions two-perspectives keep-humanity open-web what-we-cover d1-intro d1-used-to d1-now d2-intro d2-used-to d2-now d3-intro d3-used-to d3-now d4-intro d4-used-to d4-now d5-intro d5-used-to d5-now d6-intro d6-used-to d6-now m1-intro m1-used-to m1-now m2-intro m2-used-to m2-now m3-intro m3-used-to m3-now m4-intro m4-used-to m4-now m5-intro m5-used-to m5-now f2-intro f2-used-to f2-now f3-intro f3-used-to f3-now f4-single what-changed people-to-follow closing".split(" ");
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
      const t = performance.now();
      const rec = { t, bg: s.dataset.background, title: document.querySelector('.stage__slide h1, .stage__slide [aria-label]')?.textContent?.slice(0, 40) };
      w.__swaps.push(rec);
      requestAnimationFrame(() => requestAnimationFrame((p) => { rec.paint = performance.now(); }));
    }
    const f = document.querySelector('.page-frame__iframe');
    if (f && !f.__seen) { f.__seen = true; w.__frames = w.__frames || []; w.__frames.push(performance.now()); }
  };
  new MutationObserver(check).observe(document, { subtree: true, childList: true });
})();
`;

function slideUrl(id) {
  return mode === "reader" ? `${P}/s/${id}` : `${P}/present?s=${id}`;
}

async function walk(browser, start, presses) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await context.addInitScript(HOOKS);
  const page = await context.newPage();
  if (profile) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", profile);
  }
  const reqLog = [];
  page.on("request", (r) => {
    const h = r.headers();
    reqLog.push({ at: Date.now(), url: r.url(), rsc: Boolean(h["rsc"]) || /_rsc=/.test(r.url()), prefetch: h["next-router-prefetch"] ?? null, seg: h["next-router-segment-prefetch"] ?? null, kind: kind({ url: r.url(), type: r.resourceType() === "document" ? "Document" : "" }) });
  });
  if (variant === "noprefetch" || variant === "noall") {
    // Router prefetches: every RSC request except the navigation to the slide the current press targets.
    await page.route(/_rsc=/, (route) => {
      const h = route.request().headers();
      const u = new URL(route.request().url());
      const id = u.pathname.startsWith("/s/") ? u.pathname.slice(3) : u.searchParams.get("s");
      if (h["next-router-prefetch"] || h["next-router-segment-prefetch"] || !globalThis.__allow || id !== globalThis.__allow) return route.abort();
      return route.continue();
    });
  }
  if (variant === "nowarm" || variant === "noall") {
    await page.route(`${D}/**`, async (route) => {
      try {
        const fe = await route.request().frame().frameElement();
        const warm = await fe.evaluate((el) => el.classList.contains("frame-warm"));
        if (warm) return route.abort();
      } catch {}
      return route.continue();
    });
  }
  if (variant === "nowarm2" || variant === "control") {
    // Same cheap, synchronous interception in both: on an intro slide no page frame mounts, so any
    // demo-origin document requested there is FrameWarm's. nowarm2 aborts it; control lets it through.
    await page.route(`${D}/**`, (route) => {
      if (variant === "nowarm2" && globalThis.__onIntro && route.request().resourceType() === "document") return route.abort();
      return route.continue();
    });
  }
  const results = [];
  for (const pass of ["cold", "warm"]) {
    globalThis.__pressPending = true;
    await page.goto(slideUrl(start), { waitUntil: "load" });
    globalThis.__pressPending = false;
    await page.waitForTimeout(DWELL + 1500);
    for (let i = 0; i < presses; i++) {
      const before = await page.evaluate(() => ({ swaps: window.__swaps.length, steps: window.__steps.length, url: location.pathname + location.search }));
      const wall = Date.now();
      globalThis.__pressPending = true;
      const curId = before.url.startsWith("/s/") ? before.url.slice(3).split("?")[0] : new URLSearchParams(before.url.split("?")[1]).get("s");
      globalThis.__allow = ORDER[ORDER.indexOf(curId) + 1];
      globalThis.__onIntro = false;
      const t0 = await page.evaluate(() => performance.now());
      await page.keyboard.press("Shift+ArrowRight");
      // Wait for the swap, then up to 8 s for a frame's first step.
      let r = null;
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        r = await page.evaluate(({ n, k }) => {
          const swap = window.__swaps[n] ?? null;
          let bgEnd = null;
          if (swap?.bg) {
            const e = performance.getEntriesByName(new URL(swap.bg, location.href).href).pop();
            if (e) bgEnd = e.responseEnd;
          }
          const img = document.querySelector('.stage__slide .intro__image');
          if (img && img.complete && img.naturalWidth && !img.__done) img.__done = performance.now();
          return { swap, step: window.__steps[k] ?? null, frame: document.querySelector('.page-frame__iframe') !== null, url: location.pathname + location.search, bgEnd, img: Boolean(img), imgDone: img?.__done ?? null };
        }, { n: before.swaps, k: before.steps });
        if (r.swap?.paint && (!r.frame || r.step) && (r.bgEnd !== null) && (!r.img || r.imgDone)) break;
        if (r.swap?.paint && Date.now() - wall > 5000) break;
        await page.waitForTimeout(25);
      }
      globalThis.__pressPending = false;
      globalThis.__allow = null;
      globalThis.__onIntro = /intro$/.test(r.url ?? "");
      const swapMs = r.swap ? r.swap.t - t0 : null;
      const paintMs = r.swap?.paint ? r.swap.paint - t0 : null;
      const stepMs = r.step ? r.step - t0 : null;
      const window_ = swapMs ?? 3000;
      const during = reqLog.filter((q) => q.at >= wall && q.at <= wall + window_ + 5);
      const rec = {
        mode,
        variant,
        profile: profileName,
        pass,
        from: before.url,
        to: r.url,
        bg: r.swap?.bg,
        swapMs: swapMs && Math.round(swapMs),
        paintMs: paintMs && Math.round(paintMs),
        frameStep0Ms: stepMs && Math.round(stepMs),
        bgReadyMs: r.bgEnd === null ? null : Math.max(0, Math.round(r.bgEnd - t0)),
        introImgReadyMs: r.img ? (r.imgDone === null ? null : Math.max(0, Math.round(r.imgDone - t0))) : undefined,
        reqsBeforeSwap: during.length,
        rscBeforeSwap: during.filter((q) => q.rsc).map((q) => q.url.replace(P, "")),
        // Was the new background already fetched by this window before the press?
        bgPrefetched: r.swap?.bg ? reqLog.some((q) => q.at < wall && q.url === P + r.swap.bg) : null,
      };
      results.push(rec);
      console.log(`${mode} ${variant} ${profileName} ${pass} ${rec.from.padEnd(26)} -> ${String(rec.to).padEnd(26)} swap=${rec.swapMs} paint=${rec.paintMs} step0=${rec.frameStep0Ms ?? "-"} bg=${rec.bgReadyMs} img=${rec.introImgReadyMs ?? "-"} rscOnPress=${rec.rscBeforeSwap.length} bgPrefetched=${rec.bgPrefetched} ${rec.rscBeforeSwap.join(" ")}`);
      await page.waitForTimeout(DWELL);
    }
  }
  await context.close();
  return results;
}

const browser = await launch();
const all = [];
for (const [start, presses] of WALKS) all.push(...(await walk(browser, start, presses)));
await browser.close();
mkdirSync(new URL("./results/", import.meta.url), { recursive: true });
writeFileSync(new URL(`./results/nav-${mode}-${variant}-${profileName}-${DWELL}.json`, import.meta.url), JSON.stringify(all, null, 2));
