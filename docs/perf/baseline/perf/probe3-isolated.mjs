// Is a clicker press lost shortly after landing on an intro slide? Records where focus is.
import { P, PROFILES } from "./lib.mjs";
import { chromium } from "/Users/bermonpainter/Sites/web-unleashed-talk-2026/node_modules/@playwright/test/index.mjs";
const launch = () => chromium.launch({ headless: process.env.HEADED ? false : true });
const profile = process.argv[2] ?? "venue";
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
if (PROFILES[profile]) { const cdp = await ctx.newCDPSession(page); await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", PROFILES[profile]); }
await page.goto(P + "/present?s=d2-now", { waitUntil: "load" });
await page.waitForTimeout(4000);
const focus = () => page.evaluate(() => { const a = document.activeElement; return a ? `${a.tagName}.${a.className}` : "none"; });
for (const delay of [150, 500, 800, 1000, 1300]) {
  await page.goto(P + "/present?s=d2-now", { waitUntil: "load" });
  await page.waitForTimeout(3500);
  console.log("on d2-now, focus:", await focus());
  await page.keyboard.press("Shift+ArrowRight");
  await page.waitForFunction(() => location.search.includes("d3-intro") && document.querySelector('.intro'), null, { timeout: 10000 });
  const samples = [];
  const start = Date.now();
  while (Date.now() - start < delay) { samples.push(`${Date.now() - start}:${await focus()}`); await page.waitForTimeout(100); }
  const f = await focus();
  await page.keyboard.press("Shift+ArrowRight");
  await page.waitForTimeout(2500);
  const url = await page.evaluate(() => location.search);
  console.log(`${profile} press ${delay}ms after landing on d3-intro: focus at press=${f} -> ${url.includes("d3-used-to") ? "ADVANCED" : "LOST " + url}  [${samples.filter((s, i) => i === 0 || s.split(":")[1] !== samples[i - 1].split(":")[1]).join(", ")}]`);
}
await b.close();
