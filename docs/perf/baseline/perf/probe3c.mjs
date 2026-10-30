// Is a clicker press lost shortly after landing on an intro slide? Records where focus is.
import { launch, P, PROFILES } from "./lib.mjs";
const profile = process.argv[2] ?? "venue";
const [FROM, INTRO, NEXT] = (process.argv[3] ?? "d2-now,d3-intro,d3-used-to").split(",");
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
if (PROFILES[profile]) { const cdp = await ctx.newCDPSession(page); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", PROFILES[profile]); }
await page.goto(P + `/present?s=${FROM}`, { waitUntil: "load" });
await page.waitForTimeout(4000);
// Slow warm-up: the demo origin's documents answer 1500 ms late once we are on the intro slide.
await page.route(/demos\.vercel\.app\/.*index\.html/, async (route) => { if (globalThis.__slow) await new Promise((r) => setTimeout(r, 1500)); return route.continue(); });
const focus = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}.${a.className}` : "none"; });
for (const delay of [2500, 4000]) {
  await page.goto(P + `/present?s=${FROM}`, { waitUntil: "load" });
  await page.waitForTimeout(3500);
  console.log("on d2-now, focus:", await focus());
  await page.keyboard.press("Shift+ArrowRight");
  globalThis.__slow = true;
  await page.waitForFunction((intro) => location.search.includes(intro) && document.querySelector('.intro'), INTRO, { timeout: 10000 });
  const samples = [];
  const start = Date.now();
  while (Date.now() - start < delay) { samples.push(`${Date.now() - start}:${await focus()}`); await page.waitForTimeout(100); }
  const f = await focus();
  await page.keyboard.press("Shift+ArrowRight");
  globalThis.__slow = false;
  await page.waitForTimeout(2500);
  const url = await page.evaluate(() => location.search);
  console.log(`${profile} press ${delay}ms after landing on ${INTRO}: focus at press=${f} -> ${url.includes(NEXT) ? "ADVANCED" : "LOST " + url}  [${samples.filter((s, i) => i === 0 || s.split(":")[1] !== samples[i - 1].split(":")[1]).join(", ")}]`);
}
await b.close();
