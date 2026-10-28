/**
 * Axe in every frame with blur off (PRD v4, 6.4; spec 12 step 7): loads each distinct frame
 * document on the demo origin with the `glass:0` flag (solid surfaces), runs axe-core for WCAG 2.2
 * A and AA, and lists violations. The contrast unit test covers the blurred surfaces.
 *
 *   pnpm axe [section-id]
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

const seen = new Set<string>();
const targets: { where: string; url: string }[] = [];
for (const s of sections) {
  if (only && s.id !== only) continue;
  for (const p of s.pages) {
    if (!hasFrame(p) || p.frame.route.startsWith("/framework")) continue;
    const route = p.frame.route.endsWith("/") ? `${p.frame.route}index.html` : p.frame.route.includes(".") ? p.frame.route : `${p.frame.route}/index.html`;
    const url = `${frameUrl(route).url}?flags=${flagsQuery({ ...(p.frame.flags ?? {}), glass: false })}`;
    if (seen.has(url)) continue;
    seen.add(url);
    targets.push({ where: p.id, url });
  }
}

const browser = await chromium.launch();
const context = await browser.newContext({ bypassCSP: true, viewport: { width: 640, height: 628 } });
const page = await context.newPage();
let violations = 0;
for (const t of targets) {
  await page.goto(t.url);
  await page.waitForTimeout(500);
  await page.evaluate(axeSource);
  const result = (await page.evaluate(`axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })`)) as { violations: { id: string; impact: string; help: string; nodes: { target: string[] }[] }[] };
  if (result.violations.length === 0) console.log(`✓ ${t.where}: no violations`);
  for (const v of result.violations) {
    violations++;
    console.log(`✖ ${t.where}: ${v.id} (${v.impact}) ${v.help}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 4).join(", ")}`);
  }
}
await browser.close();
console.log(`\n${targets.length} frame(s), ${violations} violation(s)`);
process.exit(violations ? 1 : 0);
