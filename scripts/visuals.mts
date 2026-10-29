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
import { chromium, type Browser, type Page } from "@playwright/test";
import { sections } from "@/lib/content";

const BASE = process.env.DECK_URL ?? "http://localhost:3000";
/**
 * Only the frame: no overlay (cursor, spotlights) and no dev badge. The frame card's rounded
 * corners are squared for the capture, so the still has frame content to its edges and no dark
 * corner pixels; the intro card rounds it again (review v5 H1).
 */
const CAPTURE_CSS =
  ".overlay, nextjs-portal { display: none !important; } .page-frame, .page-frame__scaled, .page-frame__slot, .page-frame__iframe { border-radius: 0 !important; }";
/** Stills show no focus ring that reads as a spotlight (review v5 L3). */
async function blurFrameFocus(p: import("@playwright/test").Page) {
  const el = await p.$('.page-frame__iframe[data-visible="true"]');
  const f = await el?.contentFrame();
  await f?.evaluate("document.activeElement && document.activeElement !== document.body && document.activeElement.blur()").catch(() => {});
}
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

/** The Grid Lanes switch, GRID_LANES_SWITCH in walk-demos.mts: M2's still and posters show lanes (plan A). */
const GRID_LANES_SWITCH = "--enable-blink-features=CSSGridLanesLayout";
/**
 * Sections captured in the installed Google Chrome (review r6 motion M11). Playwright's Chromium 145
 * has no CustomElementRegistry constructor, so M3's now page would load its iframe fallback, which
 * looks the same at s1. `VISUALS_CHANNEL` picks another channel ("chrome-beta"). Every other
 * section stays in Playwright's Chromium, with the switch.
 */
const CHROME_SECTIONS = new Set(["m3-pricing-app"]);
const CHROME_CHANNEL = process.env.VISUALS_CHANNEL ?? "chrome";
const browser = await chromium.launch({ args: [GRID_LANES_SWITCH] });
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
const page = await context.newPage();
let chrome: Browser | null = null;
const chromePages = new Map<number, Page>();
/** The page to capture a section in: Chrome for CHROME_SECTIONS (launched once), else the default. */
async function pageFor(sectionId: string, scale: number, fallback: Page): Promise<Page> {
  if (!CHROME_SECTIONS.has(sectionId)) return fallback;
  chrome ??= await chromium.launch({ channel: CHROME_CHANNEL, args: [GRID_LANES_SWITCH] });
  let p = chromePages.get(scale);
  if (!p) {
    const ctx = await chrome.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale, reducedMotion: "reduce" });
    p = await ctx.newPage();
    chromePages.set(scale, p);
  }
  return p;
}
/** M3 now: the capture must show the scoped registry, never the iframe fallback (review r6 M11). */
async function featureMissing(p: Page, pageId: string): Promise<string | null> {
  if (pageId !== "m3-now") return null;
  const f = await (await p.$('.page-frame__iframe[data-visible="true"]'))?.contentFrame();
  const ok = await f?.evaluate(`(() => { const app = document.querySelector("#pricing-app"); return Boolean(app && app.shadowRoot && !app.querySelector("iframe")); })()`).catch(() => false);
  return ok ? null : "the pricing app is not in a scoped shadow root (the iframe fallback loaded)";
}
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
  const cap = await pageFor(section.id, 2, page);
  await cap.goto(`${BASE}/present?s=${pageId}&step=${stepIndex}&capture=1`);
  const key = `${pageId}:${stepId}`;
  const ok = await cap
    .waitForFunction((k) => Boolean((window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults?.[k]), key, { timeout: 20000 })
    .then(() => true)
    .catch(() => false);
  if (!ok) {
    console.log(`✖ ${section.id}: no step result for ${key}`);
    failed++;
    continue;
  }
  await cap.waitForTimeout(600);
  const missing = await featureMissing(cap, pageId);
  if (missing) {
    console.log(`✖ ${section.id}: ${key}: ${missing}`);
    failed++;
    continue;
  }
  // Only the frame: no overlay (cursor, spotlights) and no dev-server badge.
  await cap.addStyleTag({ content: CAPTURE_CSS });
  await blurFrameFocus(cap);
  await cap.waitForTimeout(100);
  const out = path.join(process.cwd(), "public", intro.visual.src);
  mkdirSync(path.dirname(out), { recursive: true });
  await cap.locator('.page-frame__iframe[data-visible="true"]').screenshot({ path: out, animations: "disabled" });
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
  await page.addStyleTag({ content: CAPTURE_CSS });
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
      const cap = await pageFor(section.id, 1, shot);
      for (const [i, step] of p.steps.entries()) {
        await cap.goto(`${BASE}/present?s=${p.id}&step=${i}&capture=1`);
        const key = `${p.id}:${step.id}`;
        const ok = await cap
          .waitForFunction((k) => Boolean((window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults?.[k]), key, { timeout: 25000 })
          .then(() => true)
          .catch(() => false);
        if (!ok) {
          console.log(`✖ poster ${key}: no step result`);
          failed++;
          continue;
        }
        await cap.waitForTimeout(500);
        const missing = i > 0 ? await featureMissing(cap, p.id) : null;
        if (missing) {
          console.log(`✖ poster ${key}: ${missing}`);
          failed++;
          continue;
        }
        await cap.addStyleTag({ content: CAPTURE_CSS });
        const out = path.join(process.cwd(), "public", "posters", p.id, `${step.id}.jpg`);
        mkdirSync(path.dirname(out), { recursive: true });
        await cap.locator('.page-frame__iframe[data-visible="true"]').screenshot({ path: out, type: "jpeg", quality: 72 });
      }
      console.log(`✓ posters ${p.id}: ${p.steps.length}`);
    }
  }
  await shotCtx.close();
}
await browser.close();
await chrome?.close();
process.exit(failed ? 1 : 0);
