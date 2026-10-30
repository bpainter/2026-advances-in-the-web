import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const OUT = "/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y";
const BASE = "https://2026-advances-in-the-web.vercel.app";
const ids = ["d1-intro", "d1-used-to", "m4-now", "m4-used-to", "m5-now", "f3-used-to", "f3-now", "f4-single", "f2-now", "d2-now"];
const browser = await chromium.launch();
const anims = (scope) => scope.evaluate(() => {
  const a = document.getAnimations().filter((x) => x.playState === "running");
  const inf = a.filter((x) => x.effect?.getTiming().iterations === Infinity);
  const vids = [...document.querySelectorAll("video")].map((v) => `video autoplay=${v.autoplay} loop=${v.loop} paused=${v.paused} dur=${Math.round(v.duration)}`);
  return { running: a.length, infinite: inf.map((x) => `${x.animationName ?? x.constructor.name} on ${x.effect?.target?.className ?? x.effect?.target?.tagName}`).slice(0, 5), vids, mq: matchMedia("(prefers-reduced-motion: reduce)").matches };
}).catch((e) => ({ err: String(e).slice(0, 80) }));
for (const rm of ["no-preference", "reduce"]) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 }, reducedMotion: rm });
  const page = await ctx.newPage();
  for (const id of ids) {
    await page.goto(`${BASE}/s/${id}`);
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(6000);
    const main = await anims(page);
    const frames = [];
    for (const f of page.frames()) if (f !== page.mainFrame() && f.url().startsWith("http")) frames.push({ url: f.url().replace(/^https:\/\/[^/]+/, "").slice(0, 60), ...(await anims(f)) });
    // advance one step and sample mid-playback
    await page.locator("#stage").focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    const mid = await anims(page);
    const midFrames = [];
    for (const f of page.frames()) if (f !== page.mainFrame() && f.url().startsWith("http")) midFrames.push(await anims(f));
    console.log(`[${rm}] ${id} main ${JSON.stringify(main)} frames ${JSON.stringify(frames)} | after press main ${mid.running} frames ${midFrames.map((m) => m.running).join(",")}`);
    if (id === "d1-used-to") await page.screenshot({ path: `${OUT}/motion-${rm}-d1-used-to-midstep.png` });
  }
  await ctx.close();
}
await browser.close();
