/**
 * Captures the intro slides' stills (PRD v4, 1.1 and 7.1 item 11): for every intro page (or the
 * sections named), replays the page and step its `visual.capture` names in the audience window,
 * waits for the step result and saves the frame as a 2x PNG to `visual.src` under public/. The
 * still is captured, never drawn, so it always matches the current design.
 *
 *   pnpm visuals [section-id ...]
 *
 * Needs `pnpm dev`. The overlay (cursor, spotlights) is not part of the capture: only the iframe.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { sections } from "@/lib/content";

const BASE = process.env.DECK_URL ?? "http://localhost:3000";
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
const page = await context.newPage();
let failed = 0;
for (const section of sections) {
  if (only.length && !only.includes(section.id)) continue;
  const intro = section.pages.find((p) => p.stage === "intro");
  if (!intro || intro.stage !== "intro") continue;
  const { pageId, stepId } = intro.visual.capture;
  const target = section.pages.find((p) => p.id === pageId);
  const stepIndex = target?.steps.findIndex((s) => s.id === stepId) ?? -1;
  if (!target || stepIndex < 0) {
    console.log(`✖ ${section.id}: ${pageId} ${stepId} not found`);
    failed++;
    continue;
  }
  await page.goto(`${BASE}/present?s=${pageId}&step=${stepIndex}&capture=1`);
  const key = `${pageId}:${stepId}`;
  const ok = await page
    .waitForFunction((k) => Boolean((window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults?.[k]), key, { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  if (!ok) {
    console.log(`✖ ${section.id}: no step result for ${key}`);
    failed++;
    continue;
  }
  await page.waitForTimeout(600);
  // Only the frame: no overlay (cursor, spotlights) and no dev-server badge.
  await page.addStyleTag({ content: ".overlay, nextjs-portal { display: none !important; }" });
  const out = path.join(process.cwd(), "public", intro.visual.src);
  mkdirSync(path.dirname(out), { recursive: true });
  await page.locator('.page-frame__iframe[data-visible="true"]').screenshot({ path: out, animations: "disabled" });
  console.log(`✓ ${section.id}: ${key} -> public${intro.visual.src}`);
}
await browser.close();
process.exit(failed ? 1 : 0);
