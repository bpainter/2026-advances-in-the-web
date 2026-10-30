import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const OUT = "/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y";
const BASE = "https://2026-advances-in-the-web.vercel.app";
const browser = await chromium.launch();
const configs = [
  { name: "1280x720", viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
  { name: "zoom200-1280x720", viewport: { width: 640, height: 360 }, deviceScaleFactor: 2 },
  { name: "390x844", viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: "844x390", viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  { name: "320x568", viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];
for (const c of configs) {
  const ctx = await browser.newContext(c);
  const page = await ctx.newPage();
  for (const id of ["title", "d1-intro", "d1-used-to", "people-to-follow", "closing"]) {
    await page.goto(`${BASE}/s/${id}`);
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1800);
    if (c.hasTouch) await page.mouse.move(2, 2);
    const m = await page.evaluate(() => {
      const s = Number(getComputedStyle(document.querySelector(".stage")).getPropertyValue("--stage-scale"));
      const px = (sel) => { const e = document.querySelector(sel); return e ? Math.round(parseFloat(getComputedStyle(e).fontSize) * s * 10) / 10 : null; };
      const pill = document.querySelector(".reader-controls")?.getBoundingClientRect();
      const canvas = document.querySelector(".stage__canvas").getBoundingClientRect();
      const links = [...document.querySelectorAll(".stage__canvas a[href]")].map((a) => { const r = a.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; });
      const overlap = pill && !(pill.bottom < canvas.top || pill.top > canvas.bottom);
      return { scale: s.toFixed(3), canvas: [Math.round(canvas.x), Math.round(canvas.y), Math.round(canvas.width), Math.round(canvas.height)], pill: pill ? [Math.round(pill.x), Math.round(pill.y), Math.round(pill.width), Math.round(pill.height)] : null, pillOverCanvas: overlap, h1px: px("h1"), body: px(".sg-body, .sg-card__body, .intro__description, .code__code, .sg-person__role"), footer: px(".sg-pill"), code: px(".code__code"), links, docScroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight] };
    });
    console.log(c.name.padEnd(17), id.padEnd(17), JSON.stringify(m));
    await page.screenshot({ path: `${OUT}/zoom-${c.name}-${id}.png` });
  }
  if (c.name === "390x844") {
    await page.goto(`${BASE}/s/d1-used-to`);
    await page.waitForTimeout(1500);
    await page.locator(".nav-drawer-trigger").tap();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/zoom-390x844-drawer.png` });
    await page.keyboard.press("Escape");
    await page.locator(".reader-controls__button[aria-label='Keyboard help']").tap();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/zoom-390x844-help.png` });
  }
  await ctx.close();
}
await browser.close();
