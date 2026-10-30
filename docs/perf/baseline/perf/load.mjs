// First load, cold and warm cache, per URL and network profile. Writes results/load-<profile>.json.
import { writeFileSync, mkdirSync } from "node:fs";
import { launch, netlog, summarize, kind, INIT, P, PROFILES, kb } from "./lib.mjs";

const URLS = ["/", "/s/title", "/s/d1-now", "/s/m2-now", "/s/people-to-follow", "/present?s=d4-now", "/s/d1-intro", "/s/m2-intro"];
const profileName = process.argv[2] ?? "none";
const runs = Number(process.argv[3] ?? 2);
const profile = PROFILES[profileName];

const HOOKS = `
(() => {
  const t = (window.__t = {});
  let seq;
  Object.defineProperty(window, '__stepSeq', { configurable: true, get() { return seq; }, set(v) { if (seq === undefined) t.firstStep = performance.now(); seq = v; } });
  const poll = () => {
    const s = document.getElementById('stage');
    if (s && !t.hydrated && Object.keys(s).some((k) => k.startsWith('__reactFiber') || k.startsWith('__reactProps'))) t.hydrated = performance.now();
    const f = document.querySelector('.page-frame__iframe');
    if (f && !t.frameInserted) t.frameInserted = performance.now();
    if (!t.hydrated || (!t.firstStep && performance.now() < 15000)) requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
})();
`;

async function measure(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await context.addInitScript(INIT);
  await context.addInitScript(HOOKS);
  const out = [];
  const page = await context.newPage();
  const net = await netlog(page);
  if (profile) await net.cdp.send("Network.emulateNetworkConditions", profile);
  for (const phase of ["cold", "warm"]) {
    net.reset();
    const t0 = Date.now();
    await page.goto(P + url, { waitUntil: "load", timeout: 60000 });
    const loadWall = Date.now() - t0;
    await page.waitForTimeout(url.includes("now") || url.includes("used-to") || url.includes("present") ? 6000 : 3500);
    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const fcp = window.__m.fcp;
      const tbt = window.__m.long.filter((l) => l.t >= fcp).reduce((a, l) => a + Math.max(0, l.d - 50), 0);
      const longest = Math.max(0, ...window.__m.long.map((l) => l.d));
      return {
        ttfb: nav.responseStart,
        dcl: nav.domContentLoadedEventEnd,
        load: nav.loadEventEnd,
        fcp,
        lcp: window.__m.lcp,
        lcpEl: window.__m.lcpEl,
        lcpUrl: window.__m.lcpUrl,
        cls: window.__m.cls,
        shifts: window.__m.shifts,
        tbt,
        longTasks: window.__m.long.length,
        longest,
        hydrated: window.__t.hydrated,
        frameInserted: window.__t.frameInserted,
        firstStep: window.__t.firstStep,
        htmlBytes: nav.encodedBodySize,
        htmlTransfer: nav.transferSize,
      };
    });
    const list = net.list();
    const s = summarize(list);
    out.push({ url, phase, loadWall, ...m, net: s, requests: list.map((r) => ({ url: r.url, kind: kind(r), status: r.status, bytes: r.bytes, disk: r.disk, mem: r.memCache, cc: r.cacheControl, vc: r.vercelCache, prio: r.priority, start: r.start, end: r.end })) });
  }
  await context.close();
  return out;
}

const browser = await launch();
const results = [];
for (let i = 0; i < runs; i++) {
  for (const url of URLS) {
    const r = await measure(browser, url);
    results.push(...r.map((x) => ({ run: i, ...x })));
    for (const x of r) console.log(`${profileName} run${i} ${x.phase.padEnd(4)} ${url.padEnd(22)} ttfb=${Math.round(x.ttfb)} fcp=${Math.round(x.fcp)} lcp=${Math.round(x.lcp)} (${x.lcpEl}) cls=${x.cls.toFixed(3)} tbt=${Math.round(x.tbt)} hyd=${Math.round(x.hydrated ?? -1)} step0=${Math.round(x.firstStep ?? -1)} req=${x.net.requests} ${kb(x.net.bytes)}KB 304=${x.net.notModified} cache=${x.net.fromCache} js=${kb(x.net.by.js?.bytes)} css=${kb(x.net.by.css?.bytes)} font=${kb(x.net.by.font?.bytes)} img=${kb(x.net.by.img?.bytes)} doc=${kb(x.net.by.doc?.bytes)}`);
  }
}
await browser.close();
mkdirSync(new URL("./results/", import.meta.url), { recursive: true });
writeFileSync(new URL(`./results/load-${profileName}.json`, import.meta.url), JSON.stringify(results, null, 2));
