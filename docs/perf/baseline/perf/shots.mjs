import { launch, P } from "./lib.mjs";
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();
await page.goto(P + "/present?s=d1-intro", { waitUntil: "load" });
await page.waitForTimeout(4000);
await page.keyboard.press("Shift+ArrowRight");
const t0 = Date.now();
for (const t of [60, 150, 250, 400, 700]) {
  const wait = t - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  const st = await page.evaluate(() => document.querySelector(".page-frame")?.dataset.status);
  await page.screenshot({ path: `shots/d1-used-to-${t}ms.png`, clip: { x: 64, y: 176, width: 880, height: 864 } });
  console.log(t, Date.now() - t0, st);
}
await b.close();
