/**
 * `pnpm perf walk`: the whole deck slide by slide (Shift+ArrowRight), cold then warm in the same
 * browser context. Totals bytes, requests and 304s by origin and kind (docs/PRD-perf.md 9.2).
 * Ported from docs/perf/baseline/perf/deckwalk.mjs.
 *
 *   pnpm perf walk [--mode=audience|reader] [--origin=<presenter>] [--profile=none|venue|poor]
 *                  [--dwell=1800] [--offline]
 *
 * `--offline` cuts the network after the warm pass and asks the HTTP cache for every image, font
 * and stylesheet the walk loaded from the presenter origin (P0-5): all should come back.
 */
import { applyProfile, kb, kind, launch, netlog, origins, parseArgs, profileOf, summarize, table, writeResult, type Req } from "./lib.mts";

export async function run(argv: string[]): Promise<void> {
  const { opt, flag } = parseArgs(argv);
  const { P, D } = origins(opt);
  const profile = profileOf(opt);
  const mode = opt("mode") ?? "audience";
  const dwell = Number(opt("dwell") ?? 1800);
  const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  const net = await netlog(page);
  await applyProfile(net.cdp, profile);
  const passes: Record<string, unknown> = {};
  const rows: (string | number)[][] = [];
  let slidesWalked = 0;
  for (const pass of ["cold", "warm"] as const) {
    net.reset();
    await page.goto(mode === "audience" ? `${P}/present?s=title` : `${P}/s/title`, { waitUntil: "load" });
    await page.waitForTimeout(2500);
    // Walk until the last slide: Shift+ArrowRight skips steps; stop when the URL stops changing.
    let last = page.url();
    slidesWalked = 1;
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Shift+ArrowRight");
      await page.waitForTimeout(dwell);
      const url = page.url();
      if (url === last) break;
      last = url;
      slidesWalked++;
    }
    await page.waitForTimeout(2000);
    const list = net.list();
    const s = summarize(list, P, D);
    const byOriginKind: Record<string, { n: number; bytes: number; notModified: number }> = {};
    for (const r of list) {
      const o = D !== P && r.url.startsWith(D) ? "demo" : r.url.startsWith(P) ? "presenter" : "other";
      const k = `${o}:${kind(r)}`;
      byOriginKind[k] ??= { n: 0, bytes: 0, notModified: 0 };
      byOriginKind[k].n++;
      byOriginKind[k].bytes += r.bytes ?? 0;
      if (r.status === 304) byOriginKind[k].notModified++;
    }
    const imgs = list.filter((r: Req) => kind(r) === "img" && !r.disk && !r.memCache);
    const largest = imgs.sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0))[0];
    const revalidated = list.filter((r) => r.status === 304).map((r) => r.url.replace(P, "").replace(D, "[demo]"));
    passes[pass] = { summary: s, byOriginKind, largestImage: largest ? { url: largest.url, bytes: largest.bytes } : null, revalidated, list: list.map((r) => ({ url: r.url, kind: kind(r), status: r.status, bytes: r.bytes, cache: r.disk || r.memCache || false, cc: r.cacheControl, vc: r.vercelCache })) };
    rows.push([pass, s.requests, s.requests - s.fromCache, kb(s.bytes), s.notModified, largest ? `${kb(largest.bytes)} KB ${largest.url.replace(P, "").replace(D, "[demo]")}` : ""]);
    console.log(`${mode} ${pass}: ${slidesWalked} slides, requests ${s.requests}, ${kb(s.bytes)} KB, 304 ${s.notModified}`);
    for (const [k, v] of Object.entries(byOriginKind).sort((a, b) => b[1].bytes - a[1].bytes)) console.log(`  ${k.padEnd(20)} ${v.n} ${kb(v.bytes)}KB 304=${v.notModified}`);
  }
  // P0-5: with the network cut, can a reload still paint what the walk cached? A same-origin
  // document fetches every image, font and theme file the walk loaded from the presenter origin,
  // with the browser's default cache mode: only files the HTTP cache may serve without a round trip
  // come back (must-revalidate files fail offline).
  let offline: { files: number; served: number; failed: string[] } | undefined;
  if (flag("offline")) {
    const files = [...new Set(net.list().filter((r) => r.url.startsWith(P) && r.status === 200 && /^(img|font|css)$/.test(kind(r)) && !r.url.includes("/_next/")).map((r) => r.url))];
    await page.goto(`${P}/_health`, { waitUntil: "load" });
    await ctx.setOffline(true);
    const failed = (await page.evaluate(`Promise.all(${JSON.stringify(files)}.map((u) => fetch(u).then((r) => (r.ok ? null : u), () => u))).then((a) => a.filter(Boolean))`)) as string[];
    await ctx.setOffline(false);
    offline = { files: files.length, served: files.length - failed.length, failed };
    console.log(`\nOffline after the warm walk: ${offline.served} of ${offline.files} presenter images, fonts and stylesheets served from the HTTP cache`);
    for (const f of failed.slice(0, 10)) console.log(`  ✖ ${f.replace(P, "")}`);
  }
  await browser.close();
  const file = writeResult(`walk-${mode}-${profile}`, { task: "walk", origin: P, demo: D, mode, profile, slidesWalked, passes, offline });
  console.log("\n" + table(["Pass", "Requests", "Over the network", "KB", "304s", "Largest image"], rows));
  console.log(`\nwrote ${file}`);
}
