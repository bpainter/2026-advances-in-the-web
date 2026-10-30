/**
 * Axe in every frame with blur off (PRD v4, 6.4; spec 12 step 7): loads each distinct frame
 * document on the demo origin with the `glass:0` flag (solid surfaces), runs axe-core for WCAG 2.2
 * A and AA, and lists violations. The contrast unit test covers the blurred surfaces.
 *
 *   pnpm axe [section-id]
 *   pnpm axe --presenter    presenter pages (PRD r7 5.3 and 9.8): /s/title, /s/closing, /s/d1-intro
 *                           with the drawer closed and open, /speaker with it open
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "@playwright/test";
import { hasFrame } from "@/content/demo-schema";
import { sections } from "@/lib/content";
import { flagsQuery, frameUrl } from "@/lib/frames/origins";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
type AxeResult = { violations: { id: string; impact: string; help: string; nodes: { target: string[] }[] }[] };

if (process.argv.includes("--presenter")) {
  const base = process.env.DECK_URL ?? "http://localhost:3000";
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();
  const openDrawer = async () => {
    await page.locator(".nav-drawer-trigger").first().click();
    await page.waitForFunction(`document.querySelector("#deck-nav")?.open === true`, null, { timeout: 5000 });
    // The drawer's entry transition (200 ms) settles before the scan.
    await page.waitForTimeout(400);
  };
  const targets: { where: string; path: string; viewport?: { width: number; height: number }; drawer?: boolean }[] = [
    { where: "/s/title", path: "/s/title" },
    { where: "/s/closing", path: "/s/closing" },
    { where: "/s/d1-intro", path: "/s/d1-intro" },
    { where: "/s/d1-intro, drawer open", path: "/s/d1-intro", drawer: true },
    { where: "/speaker, drawer open", path: "/speaker?s=d1-intro", viewport: { width: 1440, height: 900 }, drawer: true },
    // Speaker view PRD, 12.1: the speaker window with the drawer closed.
    { where: "/speaker", path: "/speaker?s=d1-used-to", viewport: { width: 1440, height: 900 } },
  ];
  let violations = 0;
  for (const t of targets) {
    await page.setViewportSize(t.viewport ?? { width: 1600, height: 900 });
    await page.goto(`${base}${t.path}`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(800);
    if (t.drawer) await openDrawer();
    // The live demo frames are scanned on their own (`pnpm axe`); here only the presenter's page.
    await page.evaluate(axeSource);
    const result = (await page.evaluate(`axe.run({ exclude: [["iframe.page-frame__iframe"]] }, { runOnly: { type: "tag", values: ${JSON.stringify([...TAGS, "best-practice"])} }, rules: { "region": { enabled: true } } })`)) as AxeResult;
    if (result.violations.length === 0) console.log(`✓ ${t.where}: no violations`);
    for (const v of result.violations) {
      violations++;
      console.log(`✖ ${t.where}: ${v.id} (${v.impact}) ${v.help}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(", ")}`);
    }
  }
  await browser.close();
  console.log(`\n${targets.length} presenter page(s), ${violations} violation(s)`);
  process.exit(violations ? 1 : 0);
}

const seen = new Set<string>();
const targets: { where: string; url: string; viewport: { width: number; height: number } }[] = [];
for (const s of sections) {
  if (only && s.id !== only) continue;
  for (const p of s.pages) {
    if (!hasFrame(p) || p.frame.route.startsWith("/framework")) continue;
    const route = p.frame.route.endsWith("/") ? `${p.frame.route}index.html` : p.frame.route.includes(".") ? p.frame.route : `${p.frame.route}/index.html`;
    const url = `${frameUrl(route).url}?flags=${flagsQuery({ ...(p.frame.flags ?? {}), glass: false })}`;
    if (seen.has(url)) continue;
    seen.add(url);
    targets.push({ where: p.id, url, viewport: p.frame.viewport });
    // Multi-page builds (still-in-motion-demos.md 3.3): every other document a step ends on.
    const base = route.replace(/[^/]*$/, "");
    for (const step of p.steps) {
      if (!step.route || step.route === "index.html") continue;
      const routed = `${frameUrl(base + step.route).url}${step.route.includes("?") ? "&" : "?"}flags=${flagsQuery({ ...(p.frame.flags ?? {}), glass: false })}`;
      if (seen.has(routed)) continue;
      seen.add(routed);
      targets.push({ where: `${p.id} ${step.id} (${step.route})`, url: routed, viewport: p.frame.viewport });
    }
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ bypassCSP: true, viewport: { width: 640, height: 628 } });
const page = await context.newPage();
let violations = 0;
for (const t of targets) {
  // Each frame at its authored viewport (640 or 768 by 628 on walk pages, 1304 on single pages).
  await page.setViewportSize(t.viewport);
  await page.goto(t.url);
  await page.waitForTimeout(500);
  await page.evaluate(axeSource);
  const result = (await page.evaluate(`axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(TAGS)} } })`)) as AxeResult;
  if (result.violations.length === 0) console.log(`✓ ${t.where}: no violations`);
  for (const v of result.violations) {
    violations++;
    console.log(`✖ ${t.where}: ${v.id} (${v.impact}) ${v.help}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(", ")}`);
  }
}
await browser.close();
console.log(`\n${targets.length} frame(s), ${violations} violation(s)`);
process.exit(violations ? 1 : 0);
