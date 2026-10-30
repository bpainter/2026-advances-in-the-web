// Keyboard walk: tab order, focus ring screenshots, frame enter/leave, dialogs.
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const OUT = "/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y";
const BASE = "https://2026-advances-in-the-web.vercel.app";
const slides = (process.argv[2] ?? "the-mandate,people-to-follow,closing,d1-used-to,d2-now,d1-intro").split(",");
const vp = { width: Number(process.argv[3] ?? 1600), height: Number(process.argv[4] ?? 900) };

const describe = () => {
  const a = document.activeElement;
  if (!a) return "null";
  const r = a.getBoundingClientRect();
  const cs = getComputedStyle(a);
  const name = a.getAttribute("aria-label") || a.title || a.textContent.replace(/\s+/g, " ").trim().slice(0, 50);
  return { tag: a.tagName.toLowerCase(), cls: String(a.className).slice(0, 50), name, rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`, pill: getComputedStyle(document.querySelector(".reader-controls") ?? document.body).opacity };
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp });
const page = await ctx.newPage();
const log = {};
for (const id of slides) {
  await page.goto(`${BASE}/s/${id}`);
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const seq = [];
  // Start from the document like a fresh keyboard user.
  await page.evaluate(() => (document.activeElement)?.blur());
  for (let i = 0; i < 22; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(150);
    const d = await page.evaluate(describe);
    // Inside a frame? ask the frame which element is focused.
    if (d.tag === "iframe") {
      const frame = page.frames().find((f) => f !== page.mainFrame() && f.url().includes("demos"));
      let inner = null;
      for (const f of page.frames()) {
        if (f === page.mainFrame()) continue;
        try {
          const v = await f.evaluate(() => (document.hasFocus() && document.activeElement && document.activeElement !== document.body ? `${document.activeElement.tagName.toLowerCase()}#${document.activeElement.id} ${document.activeElement.textContent.trim().slice(0, 30)}` : null));
          if (v) inner = v;
        } catch {}
      }
      d.inner = inner;
      void frame;
    }
    seq.push(d);
    await page.screenshot({ path: `${OUT}/focus-${id}-${vp.width}-${String(i).padStart(2, "0")}.png` });
  }
  log[id] = seq;
}
writeFileSync(`${OUT}/kbd-${vp.width}.json`, JSON.stringify(log, null, 1));
for (const [id, seq] of Object.entries(log)) {
  console.log(`\n== ${id}`);
  seq.forEach((d, i) => console.log(i, typeof d === "string" ? d : `${d.tag}.${d.cls} "${d.name}" ${d.rect} | ${d.outline} | pill ${d.pill}${d.inner ? " | inner " + d.inner : ""}`));
}
await browser.close();
