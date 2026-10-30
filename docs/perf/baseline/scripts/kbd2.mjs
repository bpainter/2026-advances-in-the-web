// Behavioural keyboard checks: frame trap and exits, hands-on, Space on buttons, dialogs, shortcuts, announcements.
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

// 1. Frame trap: Tab in, then Tab, Shift+Tab, Escape.
await load("/s/d1-used-to");
await page.keyboard.press("Tab");
say("1 after Tab:", await active());
for (const k of ["Tab", "Tab", "Shift+Tab", "Escape", "Tab"]) { await page.keyboard.press(k); await page.waitForTimeout(150); say(`  ${k} ->`, await active(), page.url().replace(BASE, "")); }
await page.screenshot({ path: `${OUT}/trap-d1-used-to.png` });
// h for hands-on inside the frame, then Tab x12
await page.keyboard.press("h"); await page.waitForTimeout(600);
say("  h ->", await active(), await page.evaluate(() => document.querySelector(".stage")?.dataset.handsOn));
const seq = [];
for (let i = 0; i < 14; i++) { await page.keyboard.press("Tab"); await page.waitForTimeout(120); const inner = await Promise.all(page.frames().filter((f) => f !== page.mainFrame()).map((f) => f.evaluate(() => (document.hasFocus() ? `${document.activeElement?.tagName.toLowerCase()}#${document.activeElement?.id}` : null)).catch(() => null))); seq.push(`${await active()} [${inner.filter(Boolean).join(",")}]`); }
say("  hands-on tabs:", seq.join("\n     "));

// 2. Space on a focused pill button (Previous) — does it activate, or advance the deck?
await load("/s/three-reactions");
await page.locator(".reader-controls__button[aria-label=Previous]").focus();
await page.keyboard.press("Space"); await page.waitForTimeout(1500);
say("2 Space on Previous from /s/three-reactions ->", page.url().replace(BASE, ""));
await load("/s/three-reactions");
await page.locator(".reader-controls__button[aria-label='Keyboard help']").focus();
await page.keyboard.press("Space"); await page.waitForTimeout(1500);
say("  Space on Keyboard help ->", page.url().replace(BASE, ""), "help open:", await page.evaluate(() => document.querySelector("dialog.keyboard-help")?.open));
await load("/s/three-reactions");
await page.locator(".reader-controls__button[aria-label='Keyboard help']").focus();
await page.keyboard.press("Enter"); await page.waitForTimeout(500);
say("  Enter on Keyboard help -> help open:", await page.evaluate(() => document.querySelector("dialog.keyboard-help")?.open), "focus:", await active());
await page.screenshot({ path: `${OUT}/help-open.png` });
await page.keyboard.press("Tab"); say("  Tab in help ->", await active());
await page.keyboard.press("Tab"); say("  Tab in help ->", await active());
await page.keyboard.press("ArrowRight"); await page.waitForTimeout(1200); say("  ArrowRight with help open ->", page.url().replace(BASE, ""), await page.evaluate(() => document.querySelector("dialog.keyboard-help")?.open));
await page.keyboard.press("Escape"); await page.waitForTimeout(400); say("  Escape -> focus:", await active());

// 3. Drawer: open via keyboard, focus, Tab wrap, Escape return
await load("/s/three-reactions");
await page.locator(".nav-drawer-trigger").focus();
await page.keyboard.press("Enter"); await page.waitForTimeout(500);
say("3 drawer open:", await page.evaluate(() => document.getElementById("deck-nav")?.open), "focus:", await active());
await page.screenshot({ path: `${OUT}/drawer-open.png` });
await page.keyboard.press("Shift+Tab"); say("  Shift+Tab ->", await active());
await page.keyboard.press("Shift+Tab"); say("  Shift+Tab ->", await active());
await page.keyboard.press("ArrowDown"); say("  ArrowDown ->", await active());
await page.keyboard.press("Escape"); await page.waitForTimeout(400); say("  Escape -> focus:", await active());
await page.keyboard.press("Enter"); await page.waitForTimeout(500);
for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
say("  6 tabs into drawer ->", await active());
await page.keyboard.press("Enter"); await page.waitForTimeout(1800);
say("  Enter on link ->", page.url().replace(BASE, ""), "focus:", await active(), "title:", await page.title());

// 4. Single-key shortcuts in reader mode
await load("/s/d1-used-to");
await page.locator("#stage").focus();
const popup = page.waitForEvent("popup", { timeout: 2500 }).catch(() => null);
await page.keyboard.press("s");
const p = await popup; say("4 's' in reader mode opened popup:", p ? p.url() : "none"); if (p) await p.close();
const popup2 = page.waitForEvent("popup", { timeout: 2500 }).catch(() => null);
await page.keyboard.press("o"); const p2 = await popup2; say("  'o' opened popup:", p2 ? p2.url() : "none"); if (p2) await p2.close();
await page.keyboard.press("d"); await page.waitForTimeout(300); say("  'd' rehearsal overlay shown:", await page.locator(".stage__rehearsal").count());
await page.screenshot({ path: `${OUT}/shortcut-d-rehearsal.png` });
await page.keyboard.press("h"); await page.waitForTimeout(300); say("  'h' hands-on:", await page.evaluate(() => document.querySelector(".stage")?.dataset.handsOn));

// 5. Announcements and titles on navigation
await load("/s/three-reactions");
await page.evaluate(() => { window.__ann = document.querySelector(".stage__announcer"); window.__log = []; new MutationObserver((m) => m.forEach((r) => window.__log.push(`${r.target.nodeType === 1 ? r.target.className || r.target.tagName : r.target.parentElement?.className}: ${(r.target.textContent || "").slice(0, 60)}`))).observe(document.body, { subtree: true, childList: true, characterData: true }); });
const ra = await page.evaluate(() => { const a = document.querySelector("next-route-announcer"); return a ? (a.shadowRoot?.innerHTML ?? "light") : "none"; });
say("5 next-route-announcer:", ra.slice(0, 200));
await page.locator("#stage").focus();
await page.keyboard.press("ArrowRight"); await page.waitForTimeout(1500);
say("  after ArrowRight:", page.url().replace(BASE, ""), "title:", await page.title());
say("  same announcer node:", await page.evaluate(() => window.__ann === document.querySelector(".stage__announcer") && window.__ann.isConnected), "text:", await page.evaluate(() => document.querySelector(".stage__announcer")?.textContent));
say("  route announcer text:", await page.evaluate(() => document.querySelector("next-route-announcer")?.shadowRoot?.textContent ?? document.querySelector("#__next-route-announcer__")?.textContent ?? "n/a"));
say("  focus after nav:", await active());
// step change on a demo page: any announcement?
await load("/s/d1-used-to");
await page.evaluate(() => { window.__log = []; new MutationObserver((m) => m.forEach((r) => { const t = r.target.nodeType === 1 ? r.target : r.target.parentElement; if (t.closest("[aria-live]")) window.__log.push(`${t.closest("[aria-live]").className}: ${t.closest("[aria-live]").textContent.slice(0, 60)}`); })).observe(document.body, { subtree: true, childList: true, characterData: true }); });
await page.locator("#stage").focus();
await page.keyboard.press("ArrowRight"); await page.waitForTimeout(2500);
say("  step change url:", page.url().replace(BASE, ""), "live-region mutations:", JSON.stringify(await page.evaluate(() => window.__log)));
await browser.close();
