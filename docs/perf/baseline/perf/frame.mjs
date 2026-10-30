// Frame document cost: a step Back (fresh document + instant replay) and the requests one mount makes.
import { writeFileSync } from "node:fs";
import { launch, netlog, summarize, P, D, PROFILES, kb } from "./lib.mjs";

const profileName = process.argv[2] ?? "none";
const PAGES = ["d1-now", "d4-now", "m2-now", "d5-used-to"];
const HOOK = `(() => { const w = window; w.__steps = []; let seq; Object.defineProperty(w, '__stepSeq', { configurable: true, get() { return seq; }, set(v) { seq = v; w.__steps.push(performance.now()); } }); })();`;

const b = await launch();
const out = [];
for (const id of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  await ctx.addInitScript(HOOK);
  const page = await ctx.newPage();
  const net = await netlog(page);
  if (PROFILES[profileName]) await net.cdp.send("Network.emulateNetworkConditions", PROFILES[profileName]);
  await page.goto(`${P}/present?s=${id}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__steps.length > 0, null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  const waitStep = async (n) => page.waitForFunction((n) => window.__steps.length > n, n, { timeout: 20000 });
  // Two forward steps (animated in the live document), then Back: a fresh document replays s0..s1.
  for (let i = 0; i < 2; i++) {
    const n = await page.evaluate(() => window.__steps.length);
    await page.keyboard.press("ArrowRight");
    await waitStep(n);
    await page.waitForTimeout(800);
  }
  for (const label of ["back-1", "back-2"]) {
    net.reset();
    const n = await page.evaluate(() => window.__steps.length);
    const t0 = await page.evaluate(() => performance.now());
    await page.keyboard.press("ArrowLeft");
    await waitStep(n);
    const t1 = await page.evaluate((n) => window.__steps[n], n);
    await page.waitForTimeout(800);
    const list = net.list().filter((r) => r.url.startsWith(D));
    const s = summarize(list);
    const rec = { id, profile: profileName, label, replayMs: Math.round(t1 - t0), demoRequests: s.requests, notModified: s.notModified, bytes: s.bytes, docs: list.filter((r) => r.type === "Document").map((r) => `${r.status} ${r.url.replace(D, "")}`), statuses: list.map((r) => `${r.status}${r.disk || r.memCache ? "(cache)" : ""} ${r.cacheControl ?? ""} ${r.url.replace(D, "")}`) };
    out.push(rec);
    console.log(`${profileName} ${id} ${label}: replay=${rec.replayMs}ms demoReqs=${rec.demoRequests} 304=${rec.notModified} ${kb(rec.bytes)}KB`);
  }
  await ctx.close();
}
await b.close();
writeFileSync(new URL(`./results/frame-${profileName}.json`, import.meta.url), JSON.stringify(out, null, 2));
