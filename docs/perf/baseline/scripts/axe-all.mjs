// Axe + semantics survey of every reader page on the live site, in three states.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const OUT = "/private/tmp/claude-501/-Users-bermonpainter-Sites-web-unleashed-talk-2026/6b2d6583-dfb5-4ace-8751-a1f9a529508e/scratchpad/a11y";
const urls = readFileSync(`${OUT}/sitemap.txt`, "utf8").trim().split("\n");
const BASE = "https://2026-advances-in-the-web.vercel.app";
const extra = [`${BASE}/present?s=title`, `${BASE}/present?s=d1-used-to`, `${BASE}/speaker?s=title`, `${BASE}/speaker?s=d1-used-to`];
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const survey = () => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6,[role=heading]")].map((h) => ({ tag: h.tagName, text: h.textContent.trim().slice(0, 60), inDialog: !!h.closest("dialog") }));
  return {
    title: document.title,
    lang: document.documentElement.lang,
    h1: hs.filter((h) => h.tag === "H1").length,
    headings: hs,
    landmarks: [...document.querySelectorAll("main,[role=main],nav,[role=navigation],header,footer,aside,section[aria-label],article[aria-label],[role=region]")].map((e) => `${e.tagName.toLowerCase()}${e.getAttribute("role") ? "[role=" + e.getAttribute("role") + "]" : ""}${e.getAttribute("aria-label") ? '"' + e.getAttribute("aria-label") + '"' : ""}`),
    imgs: [...document.querySelectorAll("img")].map((i) => ({ src: i.getAttribute("src"), alt: i.getAttribute("alt"), hidden: !!i.closest("[aria-hidden=true]") })),
    iframes: [...document.querySelectorAll("iframe")].map((f) => ({ title: f.title, tabIndex: f.tabIndex, cls: f.className, hidden: f.getAttribute("aria-hidden"), inert: f.inert, visible: f.dataset.visible })),
    links: [...document.querySelectorAll("a[href]")].filter((a) => !a.closest("dialog")).map((a) => ({ text: a.textContent.replace(/\s+/g, " ").trim(), target: a.target, tabIndex: a.tabIndex })),
    live: [...document.querySelectorAll("[aria-live]")].map((e) => ({ cls: e.className, live: e.getAttribute("aria-live"), text: e.textContent.trim().slice(0, 80) })),
    skip: !!document.querySelector('a[href^="#"]'),
    viewportMeta: document.querySelector('meta[name=viewport]')?.content ?? null,
    description: document.querySelector('meta[name=description]')?.content ?? null,
  };
};

async function runAxe(page) {
  await page.evaluate(axeSource);
  return page.evaluate(
    (tags) => axe.run(document, { iframes: false, runOnly: { type: "tag", values: tags }, rules: { region: { enabled: true } } }).then((r) => ({ violations: r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary?.slice(0, 300) })) })), incomplete: r.incomplete.map((v) => ({ id: v.id, n: v.nodes.length, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })) })),
    TAGS,
  );
}

const browser = await chromium.launch();
const results = [];
const all = [...urls, ...extra];
let idx = 0;
async function worker() {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await ctx.newPage();
  while (idx < all.length) {
    const url = all[idx++];
    const r = { url };
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1200);
      r.survey = await page.evaluate(survey);
      r.closed = await runAxe(page);
      const trigger = page.locator(".nav-drawer-trigger").first();
      if (await trigger.count()) {
        await trigger.click({ force: true });
        await page.waitForTimeout(500);
        r.drawer = await runAxe(page);
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
      if (!url.includes("/present")) {
        await page.locator("#stage").focus().catch(() => {});
        await page.keyboard.press("Shift+?");
        await page.waitForTimeout(400);
        r.helpOpen = await page.evaluate(() => document.querySelector("dialog.keyboard-help")?.open ?? false);
        r.help = await runAxe(page);
        await page.keyboard.press("Escape");
      }
    } catch (e) {
      r.error = String(e);
    }
    results.push(r);
    process.stdout.write(".");
  }
  await ctx.close();
}
await Promise.all([worker(), worker(), worker(), worker()]);
await browser.close();
writeFileSync(`${OUT}/axe-all.json`, JSON.stringify(results, null, 1));
console.log("\ndone", results.length);
