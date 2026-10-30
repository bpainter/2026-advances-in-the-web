import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const { chromium } = require("@playwright/test");
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = "https://2026-advances-in-the-web.vercel.app";
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const load = async (p) => { await page.goto(`${BASE}${p}`); await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(1800); };

// Chrome's computed names for headings
for (const id of ["title", "keep-humanity", "open-web", "d1-used-to", "people-to-follow", "closing"]) {
  await load(`/s/${id}`);
  await cdp.send("Accessibility.enable");
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  const hs = nodes.filter((n) => n.role?.value === "heading" && !n.ignored).map((n) => `h${n.properties?.find((p) => p.name === "level")?.value.value}: "${n.name?.value}"`);
  const regions = nodes.filter((n) => ["main", "navigation", "region", "article", "contentinfo", "complementary", "banner"].includes(n.role?.value) && !n.ignored).map((n) => `${n.role.value}"${n.name?.value ?? ""}"`);
  const people = id === "people-to-follow" ? nodes.filter((n) => n.role?.value === "listitem" && !n.ignored).slice(0, 3).map((n) => n.name?.value) : [];
  console.log(id, hs.join(" | "), "\n   landmarks:", regions.join(", "), people.length ? "\n   people li names: " + JSON.stringify(people) : "");
}

// axe inside demo frames at first and last step
for (const id of ["d1-used-to", "d1-now", "d6-now", "m1-now", "d4-used-to", "f3-now"]) {
  for (const step of ["", "?step=last"]) {
    await load(`/s/${id}${step}`);
    await page.waitForTimeout(1500);
    const frame = page.frames().find((f) => f !== page.mainFrame() && /demos/.test(f.url()) && f.url().includes("index.html"));
    if (!frame) { console.log(id, step, "no frame"); continue; }
    try {
      await frame.evaluate(axeSource);
      const r = await frame.evaluate((tags) => axe.run(document, { runOnly: { type: "tag", values: tags } }).then((r) => r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)), TAGS);
      console.log(`frame ${id}${step || " s0"}:`, r.length ? r.join("; ") : "0 violations", frame.url().replace(/^https:\/\/[^/]+/, "").slice(0, 70));
    } catch (e) { console.log(id, step, "err", String(e).slice(0, 120)); }
  }
}

// speaker page landmarks/headings
await load("/speaker?s=d1-used-to");
await cdp.send("Accessibility.enable");
const { nodes } = await cdp.send("Accessibility.getFullAXTree");
console.log("speaker headings:", nodes.filter((n) => n.role?.value === "heading" && !n.ignored).map((n) => `h${n.properties?.find((p) => p.name === "level")?.value.value}:${n.name?.value}`).join(" | "));
console.log("speaker landmarks:", nodes.filter((n) => ["main", "navigation", "region", "article", "complementary", "banner", "contentinfo"].includes(n.role?.value) && !n.ignored).map((n) => `${n.role.value}"${n.name?.value ?? ""}"`).join(", "));
console.log("speaker inert previews:", await page.evaluate(() => [...document.querySelectorAll(".stage--embedded")].map((s) => `inert=${s.closest("[inert]") ? 1 : 0} ariaHidden=${s.closest("[aria-hidden=true]") ? 1 : 0}`).join(", ")));
console.log("speaker live:", await page.evaluate(() => [...document.querySelectorAll("[aria-live],[role=status],[role=timer]")].map((e) => `${e.className}:${e.getAttribute("aria-live") ?? e.getAttribute("role")}:${e.textContent.trim().slice(0, 40)}`).join(" || ")));
await browser.close();
