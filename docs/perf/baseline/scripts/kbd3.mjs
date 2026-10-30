import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const OUT = "/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y";
const BASE = "https://2026-advances-in-the-web.vercel.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();
const active = () => page.evaluate(() => { const a = document.activeElement; return `${a?.tagName.toLowerCase()}${a?.id ? "#" + a.id : ""}.${String(a?.className ?? "").split(" ")[0]} "${(a?.getAttribute("aria-label") || a?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40)}"`; });
const load = async (p) => { await page.goto(`${BASE}${p}`); await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(1500); };
const say = (...a) => console.log(...a);

// Next button by Enter: where does focus go?
await load("/s/three-reactions");
await page.locator(".reader-controls__button[aria-label=Next]").focus();
await page.keyboard.press("Enter"); await page.waitForTimeout(1500);
say("Enter on Next ->", page.url().replace(BASE, ""), "focus:", await active());
await page.keyboard.press("Tab"); say("  then Tab ->", await active());

// help open/close on same slide
await load("/s/three-reactions");
await page.locator(".reader-controls__button[aria-label='Keyboard help']").focus();
await page.keyboard.press("Enter"); await page.waitForTimeout(400);
await page.keyboard.press("Escape"); await page.waitForTimeout(400);
say("help Escape -> focus:", await active());
await page.locator(".reader-controls__button[aria-label='Keyboard help']").focus();
await page.keyboard.press("Enter"); await page.waitForTimeout(400);
await page.keyboard.press("Enter"); await page.waitForTimeout(400);
say("help Close via Enter -> focus:", await active(), "open:", await page.evaluate(() => document.querySelector("dialog.keyboard-help")?.open));

// code panel: files, overflow, tab keyboard
for (const id of ["d2-now", "d1-now", "m1-now", "f2-now", "d4-used-to"]) {
  await load(`/s/${id}?step=last`);
  const info = await page.evaluate(() => {
    const pre = document.querySelector(".code__pre");
    const tabs = [...document.querySelectorAll(".code__tab")].map((t) => `${t.textContent}:${t.tabIndex}:${t.getAttribute("aria-selected")}:${t.getAttribute("aria-controls")}`);
    const hl = document.querySelectorAll('.code__line[data-highlighted="true"]');
    const line = hl[0] ?? document.querySelector(".code__line");
    const other = document.querySelector('.code__line[data-highlighted="false"]');
    const cs = (e) => e ? { color: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor, opacity: getComputedStyle(e).opacity, fw: getComputedStyle(e).fontWeight, before: getComputedStyle(e, "::before").content + " " + getComputedStyle(e, "::before").backgroundColor + " " + getComputedStyle(e, "::before").width, border: getComputedStyle(e).borderLeft, shadow: getComputedStyle(e).boxShadow } : null;
    return { pre: pre ? { sw: pre.scrollWidth, cw: pre.clientWidth, sh: pre.scrollHeight, ch: pre.clientHeight } : null, tabs, hlCount: hl.length, hl: cs(line), dim: cs(other), hasSRMarker: !!document.querySelector(".code__line[data-highlighted=true] .visually-hidden, mark, [aria-current]") };
  });
  say(id, JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/code-${id}-last.png` });
}
// Can keyboard reach a non-selected file tab? (d2-now)
await load("/s/d2-now");
await page.keyboard.press("h"); await page.waitForTimeout(500);
const tabsSeq = [];
for (let i = 0; i < 6; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(100); tabsSeq.push(await active()); }
say("d2-now hands-on tab seq:", tabsSeq.join(" | "));
await page.locator(".code__tab").first().focus();
await page.keyboard.press("ArrowRight"); await page.waitForTimeout(1500);
say("ArrowRight on file tab ->", page.url().replace(BASE, ""), await active());
// arrow keys on the focused pre
await load("/s/d2-now");
await page.locator(".code__pre").focus();
const before = await page.evaluate(() => [document.querySelector(".code__pre").scrollLeft, document.querySelector(".code__pre").scrollTop]);
await page.keyboard.press("ArrowDown"); await page.keyboard.press("ArrowDown"); await page.keyboard.press("PageDown"); await page.waitForTimeout(1200);
say("pre ArrowDown/PageDown -> url", page.url().replace(BASE, ""), "scroll before", before, "after", await page.evaluate(() => [document.querySelector(".code__pre")?.scrollLeft, document.querySelector(".code__pre")?.scrollTop]));
await browser.close();
