/**
 * Captures the intro slides' stills (PRD v4, 1.1 and 7.1 item 11): for every intro page (or the
 * sections named), replays the page and step its `visual.capture` names in the audience window,
 * waits for the step result and saves the frame as a 2x PNG to `visual.src` under public/. The
 * still is captured, never drawn, so it always matches the current design.
 *
 *   pnpm visuals [section-id ...] [--posters]
 *
 * With --posters it also saves one JPEG per step of every walk and single page to
 * public/posters/<page-id>/<step-id>.jpg, the speaker window's previews (design review H7).
 * pnpm capture runs this against production builds, so no dev chrome is in any image.
 *
 * Needs `pnpm dev`. The overlay (cursor, spotlights) is not part of the capture: only the iframe.
 */
import { mkdirSync, readFileSync } from "node:fs";
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
  // D2 (spec 5): a composition of real captures, the card at three widths under their labels.
  if (section.id === "d2-product-card" && target.stage === "now") {
    if (await composeD2(target.id, intro.visual.src)) console.log(`✓ ${section.id}: composition of ${target.id} s2, s0, s1 -> public${intro.visual.src}`);
    else failed++;
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
/** One shelf crop of the D2 now card at a step: the slot and 16 frame px around it, at 2x. */
async function slotCrop(pageId: string, stepIndex: number): Promise<Buffer | null> {
  await page.goto(`${BASE}/present?s=${pageId}&step=${stepIndex}&capture=1`);
  const key = `${pageId}:s${stepIndex}`;
  const ok = await page
    .waitForFunction((k) => Boolean((window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults?.[k]), key, { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  if (!ok) return null;
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: ".overlay, nextjs-portal { display: none !important; }" });
  const iframe = page.locator('.page-frame__iframe[data-visible="true"]');
  const box = await iframe.boundingBox();
  const frame = await (await iframe.elementHandle())?.contentFrame();
  if (!box || !frame) return null;
  const r = (await frame.evaluate(`(() => { const b = document.querySelector(".product-slot").getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height, vw: innerWidth }; })()`)) as { x: number; y: number; w: number; h: number; vw: number };
  const scale = box.width / r.vw;
  const pad = 16;
  return page.screenshot({ clip: { x: box.x + (r.x - pad) * scale, y: box.y + (r.y - pad) * scale, width: (r.w + 2 * pad) * scale, height: (r.h + 2 * pad) * scale } });
}

/** The D2 intro still (spec 5): featured (s2), search results (s0) and recommended (s1). */
async function composeD2(pageId: string, src: string): Promise<boolean> {
  const featured = await slotCrop(pageId, 2);
  const search = await slotCrop(pageId, 0);
  const rail = await slotCrop(pageId, 1);
  if (!featured || !search || !rail) {
    console.log("✖ d2-product-card: a crop has no step result");
    return false;
  }
  const font = (f: string) => readFileSync(path.join(process.cwd(), "public", "fonts", f)).toString("base64");
  const img = (b: Buffer) => `data:image/png;base64,${b.toString("base64")}`;
  const html = `<!doctype html><style>
    @font-face { font-family: Slalom; src: url(data:font/otf;base64,${font("SlalomSans-Bold.otf")}); font-weight: 700; }
    html, body { margin: 0; background: transparent; }
    .c { position: relative; width: 832px; height: 816px; font: 700 20px/28px Slalom, sans-serif; color: #0f1c41; }
    .l { position: absolute; margin: 0; padding: 0 10px; border-radius: 8px; background: rgb(255 255 255 / 0.4); }
    .i { position: absolute; display: block; border-radius: 12px; box-shadow: 0 24px 64px rgb(15 28 65 / 0.24); }
  </style><div class="c">
    <p class="l" style="left:0;top:0">Featured</p><img class="i" style="left:0;top:36px;width:614px" src="${img(featured)}" alt="">
    <p class="l" style="left:0;top:254px">Search results</p><img class="i" style="left:0;top:290px;width:422px" src="${img(search)}" alt="">
    <p class="l" style="left:446px;top:254px">Recommended</p><img class="i" style="left:446px;top:290px;width:288px" src="${img(rail)}" alt="">
  </div>`;
  const compose = await browser.newPage({ viewport: { width: 832, height: 816 }, deviceScaleFactor: 2 });
  await compose.setContent(html);
  await compose.waitForTimeout(300);
  const out = path.join(process.cwd(), "public", src);
  mkdirSync(path.dirname(out), { recursive: true });
  await compose.locator(".c").screenshot({ path: out, omitBackground: true });
  await compose.close();
  return true;
}

if (process.argv.includes("--posters")) {
  const shotCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const shot = await shotCtx.newPage();
  for (const section of sections) {
    if (only.length && !only.includes(section.id)) continue;
    for (const p of section.pages) {
      if (p.stage === "intro") continue;
      for (const [i, step] of p.steps.entries()) {
        await shot.goto(`${BASE}/present?s=${p.id}&step=${i}&capture=1`);
        const key = `${p.id}:${step.id}`;
        const ok = await shot
          .waitForFunction((k) => Boolean((window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults?.[k]), key, { timeout: 25000 })
          .then(() => true)
          .catch(() => false);
        if (!ok) {
          console.log(`✖ poster ${key}: no step result`);
          failed++;
          continue;
        }
        await shot.waitForTimeout(500);
        await shot.addStyleTag({ content: ".overlay, nextjs-portal { display: none !important; }" });
        const out = path.join(process.cwd(), "public", "posters", p.id, `${step.id}.jpg`);
        mkdirSync(path.dirname(out), { recursive: true });
        await shot.locator('.page-frame__iframe[data-visible="true"]').screenshot({ path: out, type: "jpeg", quality: 72 });
      }
      console.log(`✓ posters ${p.id}: ${p.steps.length}`);
    }
  }
  await shotCtx.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
