/**
 * `pnpm perf frame`: step Back replays (a fresh document replays s0..sN) and the demo-origin
 * requests one mount makes, in the audience window (docs/PRD-perf.md 9.2, P1-FRAMEFILES).
 * Ported from docs/perf/baseline/perf/frame.mjs.
 *
 *   pnpm perf frame [--origin=<presenter>] [--profile=none|venue|poor] [--pages=d1-now,d4-now]
 */
import { applyProfile, kb, launch, median, netlog, origins, parseArgs, percentile, profileOf, summarize, table, writeResult } from "./lib.mts";

const PAGES = ["d1-now", "d4-now", "m2-now", "d5-now"];
const HOOK = `(() => { const w = window; w.__steps = []; let seq; Object.defineProperty(w, '__stepSeq', { configurable: true, get() { return seq; }, set(v) { seq = v; w.__steps.push(performance.now()); } }); })();`;

interface Rec {
  id: string;
  label: string;
  replayMs: number;
  demoRequests: number;
  documents: number;
  notModified: number;
  fromCache: number;
  kb: number;
  statuses: string[];
}

export async function run(argv: string[]): Promise<void> {
  const { opt } = parseArgs(argv);
  const { P, D } = origins(opt);
  const profile = profileOf(opt);
  const pages = opt("pages")?.split(",") ?? PAGES;
  const browser = await launch();
  const out: Rec[] = [];
  for (const id of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    await ctx.addInitScript(HOOK);
    const page = await ctx.newPage();
    const net = await netlog(page);
    await applyProfile(net.cdp, profile);
    await page.goto(`${P}/present?s=${id}`, { waitUntil: "load" });
    await page.waitForFunction("window.__steps.length > 0", null, { timeout: 15000 });
    await page.waitForTimeout(1500);
    const count = () => page.evaluate("window.__steps.length") as Promise<number>;
    const waitStep = (n: number) => page.waitForFunction(`window.__steps.length > ${n}`, null, { timeout: 20000 });
    // Two forward steps (animated in the live document), then Back twice: each mounts a fresh document.
    for (let i = 0; i < 2; i++) {
      const n = await count();
      await page.keyboard.press("ArrowRight");
      await waitStep(n);
      await page.waitForTimeout(800);
    }
    for (const label of ["back-1", "back-2"]) {
      net.reset();
      const n = await count();
      const t0 = (await page.evaluate("performance.now()")) as number;
      await page.keyboard.press("ArrowLeft");
      await waitStep(n);
      const t1 = (await page.evaluate(`window.__steps[${n}]`)) as number;
      await page.waitForTimeout(800);
      const list = net.list().filter((r) => r.url.startsWith(D));
      const s = summarize(list, D, D);
      const rec: Rec = {
        id,
        label,
        replayMs: Math.round(t1 - t0),
        demoRequests: s.requests,
        documents: list.filter((r) => r.type === "Document").length,
        notModified: s.notModified,
        fromCache: s.fromCache,
        kb: kb(s.bytes),
        statuses: list.map((r) => `${r.status}${r.disk || r.memCache ? " (cache)" : ""} ${r.vercelCache ?? ""} ${r.cacheControl ?? ""} ${r.url.replace(D, "")}`),
      };
      out.push(rec);
      console.log(`${profile} ${id} ${label}: replay=${rec.replayMs}ms demo requests=${rec.demoRequests} (network ${rec.demoRequests - rec.fromCache}) 304=${rec.notModified} ${rec.kb}KB`);
    }
    await ctx.close();
  }
  await browser.close();
  const file = writeResult(`frame-${profile}`, { task: "frame", origin: P, demo: D, profile, rows: out });
  console.log(
    "\n" +
      table(
        ["Page", "Replay med", "Replay max", "Demo requests", "From cache", "304s", "KB"],
        pages.map((id) => {
          const sel = out.filter((r) => r.id === id);
          return [id, median(sel.map((r) => r.replayMs)), Math.max(...sel.map((r) => r.replayMs)), median(sel.map((r) => r.demoRequests)), median(sel.map((r) => r.fromCache)), median(sel.map((r) => r.notModified)), median(sel.map((r) => r.kb))];
        }),
      ),
  );
  console.log(`\nAll pages: replay median ${median(out.map((r) => r.replayMs))} ms, p90 ${percentile(out.map((r) => r.replayMs), 0.9)} ms (target 300 / 400)`);
  console.log(`\nwrote ${file}`);
}
