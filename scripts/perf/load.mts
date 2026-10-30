/**
 * `pnpm perf load`: first load, cold then warm, per URL (docs/PRD-perf.md 9.2). TTFB, FCP, LCP,
 * CLS, blocking time, hydration, the frame's first step, requests, bytes and 304s.
 * Ported from docs/perf/baseline/perf/load.mjs.
 *
 *   pnpm perf load [--origin=<presenter>] [--profile=none|venue|poor] [--runs=2] [--only=<path>]
 */
import { INIT, applyProfile, kb, kind, launch, median, netlog, origins, parseArgs, percentile, profileOf, round, summarize, table, writeResult } from "./lib.mts";

const URLS = ["/", "/s/title", "/s/d1-intro", "/s/d1-now", "/s/m2-intro", "/s/m2-now", "/s/people-to-follow", "/present?s=d4-now"];

/** Hydration and the first step-done, read by polling (a string, so tsx adds no helpers). */
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

const READ = `(() => {
  const nav = performance.getEntriesByType('navigation')[0];
  const m = window.__m;
  const fcp = m.fcp;
  const tbt = m.long.filter((l) => l.t >= fcp).reduce((a, l) => a + Math.max(0, l.d - 50), 0);
  return { ttfb: nav.responseStart, dcl: nav.domContentLoadedEventEnd, load: nav.loadEventEnd, fcp, lcp: m.lcp, lcpEl: m.lcpEl, lcpUrl: m.lcpUrl, cls: m.cls, tbt, longTasks: m.long.length, hydrated: window.__t.hydrated ?? null, firstStep: window.__t.firstStep ?? null, htmlBytes: nav.encodedBodySize };
})()`;

interface Row {
  run: number;
  url: string;
  phase: "cold" | "warm";
  ttfb: number;
  fcp: number;
  lcp: number;
  lcpEl: string | null;
  cls: number;
  tbt: number;
  hydrated: number | null;
  firstStep: number | null;
  requests: number;
  kb: number;
  notModified: number;
  fromCache: number;
}

export async function run(argv: string[]): Promise<void> {
  const { opt } = parseArgs(argv);
  const { P, D } = origins(opt);
  const profile = profileOf(opt);
  const runs = Number(opt("runs") ?? 2);
  const urls = opt("only") ? [opt("only")!] : URLS;
  const browser = await launch();
  const rows: Row[] = [];
  const raw: unknown[] = [];
  for (let i = 0; i < runs; i++) {
    for (const url of urls) {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
      await context.addInitScript(INIT);
      await context.addInitScript(HOOKS);
      const page = await context.newPage();
      const net = await netlog(page);
      await applyProfile(net.cdp, profile);
      for (const phase of ["cold", "warm"] as const) {
        net.reset();
        await page.goto(P + url, { waitUntil: "load", timeout: 60000 });
        await page.waitForTimeout(/now|used-to|present/.test(url) ? 6000 : 3500);
        const m = (await page.evaluate(READ)) as Omit<Row, "run" | "url" | "phase" | "requests" | "kb" | "notModified" | "fromCache">;
        const list = net.list();
        const s = summarize(list, P, D);
        const row: Row = { run: i, url, phase, ...m, requests: s.requests, kb: kb(s.bytes), notModified: s.notModified, fromCache: s.fromCache };
        rows.push(row);
        raw.push({ ...row, net: s, requests: list.map((r) => ({ url: r.url, kind: kind(r), status: r.status, bytes: r.bytes, disk: r.disk, mem: r.memCache, cc: r.cacheControl, vc: r.vercelCache, prio: r.priority })) });
        console.log(`${profile} run${i} ${phase.padEnd(4)} ${url.padEnd(22)} ttfb=${round(m.ttfb)} fcp=${round(m.fcp)} lcp=${round(m.lcp)} cls=${m.cls.toFixed(3)} tbt=${round(m.tbt)} hyd=${round(m.hydrated) ?? "-"} step0=${round(m.firstStep) ?? "-"} req=${s.requests} ${kb(s.bytes)}KB 304=${s.notModified}`);
      }
      await context.close();
    }
  }
  await browser.close();
  const out = writeResult(`load-${profile}`, { task: "load", origin: P, demo: D, profile, runs, rows: raw });
  const med = (url: string, phase: string, f: (r: Row) => number | null) => round(median(rows.filter((r) => r.url === url && r.phase === phase).map(f)));
  console.log(
    "\n" +
      table(
        ["URL", "Cache", "TTFB", "FCP", "LCP", "LCP p90", "CLS", "TBT", "Hydrated", "Frame s0", "Requests", "KB", "304s"],
        urls.flatMap((url) =>
          (["cold", "warm"] as const).map((phase) => {
            const sel = rows.filter((r) => r.url === url && r.phase === phase);
            return [url, phase, med(url, phase, (r) => r.ttfb), med(url, phase, (r) => r.fcp), med(url, phase, (r) => r.lcp), round(percentile(sel.map((r) => r.lcp), 0.9)), Math.max(...sel.map((r) => r.cls)).toFixed(3), med(url, phase, (r) => r.tbt), med(url, phase, (r) => r.hydrated), med(url, phase, (r) => r.firstStep), med(url, phase, (r) => r.requests), med(url, phase, (r) => r.kb), med(url, phase, (r) => r.notModified)];
          }),
        ),
      ),
  );
  console.log(`\nwrote ${out}`);
}
