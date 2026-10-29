/**
 * The shared Open Graph image (PRD r7, 10.2): captures the cover slide from a running server and
 * writes public/og/cover.jpg (1200 by 630, JPEG quality 88) and public/og/cover.json (the hash of
 * the inputs, lib/validate/seo.ts `ogInputs`). Both are committed; Vercel builds have no browser.
 * `pnpm check` fails with "The cover changed; run pnpm og" when an input changes.
 *
 *   pnpm og                       # against `pnpm dev` on http://localhost:3000
 *   DECK_URL=http://localhost:3200 pnpm og
 *
 * At a 1200 by 675 viewport the stage scales the 1920 by 1080 canvas by exactly 0.625. The script
 * waits for fonts and the background decode, hides everything outside the canvas (the reader pill,
 * the menu button, dialogs) and clips x 0, y 22, w 1200, h 630.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { OG_IMAGE_FILE, OG_MAX_BYTES, OG_META_FILE, OG_SIZE, ogHash, ogInputs, type OgMeta } from "@/lib/validate/seo";
import { jpegSize } from "@/lib/validate/v5";

const BASE = (process.env.DECK_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SOURCE = "/s/title?capture=1";
const VIEWPORT = { width: 1200, height: 675 };
const CLIP = { x: 0, y: 22, width: OG_SIZE.width, height: OG_SIZE.height };
/** Everything that is not the canvas, inside it or around it: no chrome reaches the image. */
const HIDE_CHROME = ":where(body *):not(.stage__canvas, .stage__canvas *, :has(.stage__canvas)) { visibility: hidden !important; } nextjs-portal { display: none !important; }";

const root = process.cwd();
const inputs = ogInputs(root);
const hash = ogHash(inputs);

const up = await fetch(`${BASE}/s/title`).then((r) => r.ok).catch(() => false);
if (!up) {
  console.error(`✖ ${BASE}/s/title does not answer. Start pnpm dev, or set DECK_URL.`);
  process.exit(1);
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(`${BASE}${SOURCE}`, { waitUntil: "load" });
  await page.waitForSelector(".stage__canvas[data-background] .sg--title");
  await page.addStyleTag({ content: HIDE_CHROME });
  const background = await page.locator(".stage__canvas").getAttribute("data-background");
  await page.evaluate(async (src) => {
    await document.fonts.ready;
    if (src) {
      const img = new Image();
      img.src = src;
      await img.decode();
    }
    (document.activeElement as HTMLElement | null)?.blur?.();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, background);
  await page.waitForTimeout(300);
  const scale = await page.locator(".stage").evaluate((el) => getComputedStyle(el).getPropertyValue("--stage-scale").trim());
  if (Number(scale) !== 0.625) throw new Error(`the stage scale is ${scale}, not 0.625`);
  const box = await page.locator(".stage__canvas").boundingBox();
  if (!box || Math.abs(box.x) > 0.5 || Math.abs(box.y) > 0.5 || Math.abs(box.width - 1200) > 0.5) throw new Error(`the canvas sits at ${JSON.stringify(box)}, not 0 0 1200 675`);
  const jpeg = await page.screenshot({ type: "jpeg", quality: 88, clip: CLIP });

  const size = jpegSize(jpeg);
  if (!size || size.width !== OG_SIZE.width || size.height !== OG_SIZE.height) throw new Error(`captured ${JSON.stringify(size)}, not ${OG_SIZE.width} by ${OG_SIZE.height}`);
  if (jpeg.length > OG_MAX_BYTES) throw new Error(`the image is ${Math.round(jpeg.length / 1024)} KB, over ${OG_MAX_BYTES / 1024}`);

  mkdirSync(path.join(root, path.dirname(OG_IMAGE_FILE)), { recursive: true });
  writeFileSync(path.join(root, OG_IMAGE_FILE), jpeg);
  const meta: OgMeta = {
    hash,
    width: size.width,
    height: size.height,
    bytes: jpeg.length,
    imageSha256: createHash("sha256").update(jpeg).digest("hex"),
    source: SOURCE,
    inputs,
  };
  writeFileSync(path.join(root, OG_META_FILE), `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`✓ ${OG_IMAGE_FILE} ${size.width}x${size.height} ${Math.round(jpeg.length / 1024)} KB, v=${hash.slice(0, 8)} (from ${BASE}${SOURCE})`);
} finally {
  await browser.close();
}
