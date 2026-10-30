// Rendered-pixel contrast: for each visible text element, compare the glyph colour (from a shot with
// text) against every background pixel under its box (from a shot with text hidden). Worst case and p10.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const { PNG } = require("/Users/bermonpainter/Sites/web-unleashed-talk-2026/node_modules/.pnpm/pngjs@5.0.0/node_modules/pngjs");
const OUT = "/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y";
const BASE = "https://2026-advances-in-the-web.vercel.app";
const ids = (process.argv[2] ? process.argv[2].split(",") : readFileSync(`${OUT}/sitemap.txt`, "utf8").trim().split("\n").filter((u) => u.includes("/s/")).map((u) => u.split("/s/")[1]));
const W = Number(process.argv[3] ?? 1920), H = Number(process.argv[4] ?? 1080);

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const collect = () => {
  const out = [];
  const els = [...document.querySelectorAll(".stage__canvas *, .reader-controls *")];
  for (const el of els) {
    if (el.closest(".visually-hidden, iframe, svg, .overlay, script, style")) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.right < 0 || r.bottom < 0 || r.left > innerWidth || r.top > innerHeight) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden") continue;
    // the text's own range rect (tighter than the element for inline-block content)
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      for (const q of range.getClientRects()) { x0 = Math.min(x0, q.left); y0 = Math.min(y0, q.top); x1 = Math.max(x1, q.right); y1 = Math.max(y1, q.bottom); }
    }
    // clip to every scrolling or clipping ancestor
    for (let a = el.parentElement; a; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (o.overflowX !== "visible" || o.overflowY !== "visible") { const q = a.getBoundingClientRect(); x0 = Math.max(x0, q.left); y0 = Math.max(y0, q.top); x1 = Math.min(x1, q.right); y1 = Math.min(y1, q.bottom); }
    }
    if (!(x1 - x0 > 2 && y1 - y0 > 2)) continue;
    const box = { left: x0, top: y0, width: x1 - x0, height: y1 - y0 };
    out.push({ text: el.textContent.replace(/\s+/g, " ").trim().slice(0, 40), cls: String(el.className).slice(0, 40), tag: el.tagName.toLowerCase(), size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), x: Math.max(0, Math.floor(box.left)), y: Math.max(0, Math.floor(box.top)), w: Math.ceil(box.width), h: Math.ceil(box.height), scale: Number(getComputedStyle(document.querySelector(".stage")).getPropertyValue("--stage-scale")) || 1 });
  }
  return out;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const all = [];
for (const id of ids) {
  await page.goto(`${BASE}/s/${id}`);
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2600);
  await page.mouse.move(5, 5);
  await page.mouse.move(8, 8);
  await page.waitForTimeout(350);
  const items = await page.evaluate(collect);
  const vis = PNG.sync.read(await page.screenshot());
  await page.addStyleTag({ content: `*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important;transition:none!important}` });
  await page.mouse.move(5, 5);
  await page.waitForTimeout(120);
  const hid = PNG.sync.read(await page.screenshot());
  if (id === ids[0] || /closing|title|people|d1-intro|d1-used-to/.test(id)) writeFileSync(`${OUT}/contrast-${id}-${W}.png`, PNG.sync.write(vis));
  for (const it of items) {
    let best = null, bestDiff = -1;
    const bgL = [];
    for (let y = it.y; y < Math.min(it.y + it.h, H); y++) for (let x = it.x; x < Math.min(it.x + it.w, W); x++) {
      const i = (y * W + x) * 4;
      const lv = L(vis.data[i], vis.data[i + 1], vis.data[i + 2]);
      const lh = L(hid.data[i], hid.data[i + 1], hid.data[i + 2]);
      bgL.push(lh);
      const d = Math.abs(lv - lh);
      if (d > bestDiff) { bestDiff = d; best = lv; }
    }
    if (best === null || bgL.length === 0) continue;
    // Background: the glyph sits over light or dark bg; the worst bg pixel is the one closest in luminance.
    const rs = bgL.map((b) => ratio(best, b)).sort((a, b) => a - b);
    const min = rs[0], p10 = rs[Math.floor(rs.length * 0.1)], med = rs[Math.floor(rs.length / 2)];
    const px = it.size * it.scale;
    const large = px >= 24 || (px >= 18.66 && it.weight >= 700);
    all.push({ id, ...it, effPx: Math.round(px * 10) / 10, large, min: +min.toFixed(2), p10: +p10.toFixed(2), med: +med.toFixed(2), need: large ? 3 : 4.5 });
  }
  process.stdout.write(".");
}
await browser.close();
writeFileSync(`${OUT}/contrast-${W}.json`, JSON.stringify(all, null, 1));
const fails = all.filter((a) => a.p10 < a.need);
console.log(`\n${all.length} text items, ${fails.length} with p10 below threshold`);
for (const f of fails) console.log(`${f.id.padEnd(18)} ${f.cls.padEnd(28)} "${f.text}" ${f.effPx}px w${f.weight} min ${f.min} p10 ${f.p10} med ${f.med} need ${f.need}`);
