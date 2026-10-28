/**
 * Measures every background in the registry (PRD v5, 1.5): Chromium decodes each file, and for
 * each text zone this writes the darkest and the brightest pixel (by relative luminance), plus the
 * file's mean color, a 16 by 9 thumbnail of cell means and the file's SHA-256. The contrast test
 * composites text over the zone extremes; the walk compares thumbnails; `pnpm check` compares the
 * hashes with the files, so stale stats fail.
 *
 *   pnpm backgrounds
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import { BACKGROUNDS, BACKGROUND_IDS } from "@/content/backgrounds";

type RGB = [number, number, number];
export interface ZoneStats {
  name: string;
  darkest: RGB;
  brightest: RGB;
}
export interface BackgroundStats {
  file: string;
  sha256: string;
  width: number;
  height: number;
  mean: RGB;
  thumb: RGB[];
  zones: ZoneStats[];
}

const ROOT = process.cwd();
const OUT = path.join(ROOT, "content", ".generated", "backgrounds.json");

const MEASURE = `async ({ src, zones }) => {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const lum = (i) => 0.2126 * lin(data[i]) + 0.7152 * lin(data[i + 1]) + 0.0722 * lin(data[i + 2]);
  const sx = w / 1920, sy = h / 1080;
  const outZones = zones.map((z) => {
    let lo = Infinity, hi = -Infinity, dark = [0, 0, 0], bright = [0, 0, 0];
    const x0 = Math.round(z.x * sx), y0 = Math.round(z.y * sy), x1 = Math.round((z.x + z.w) * sx), y1 = Math.round((z.y + z.h) * sy);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const l = lum(i);
      if (l < lo) { lo = l; dark = [data[i], data[i + 1], data[i + 2]]; }
      if (l > hi) { hi = l; bright = [data[i], data[i + 1], data[i + 2]]; }
    }
    return { name: z.name, darkest: dark, brightest: bright };
  });
  const sum = [0, 0, 0];
  for (let i = 0; i < data.length; i += 4) { sum[0] += data[i]; sum[1] += data[i + 1]; sum[2] += data[i + 2]; }
  const n = data.length / 4;
  const mean = sum.map((v) => Math.round(v / n));
  const thumb = [];
  for (let cy = 0; cy < 9; cy++) for (let cx = 0; cx < 16; cx++) {
    const t = [0, 0, 0]; let k = 0;
    const xa = Math.floor((cx * w) / 16), xb = Math.floor(((cx + 1) * w) / 16), ya = Math.floor((cy * h) / 9), yb = Math.floor(((cy + 1) * h) / 9);
    for (let y = ya; y < yb; y += 2) for (let x = xa; x < xb; x += 2) { const i = (y * w + x) * 4; t[0] += data[i]; t[1] += data[i + 1]; t[2] += data[i + 2]; k++; }
    thumb.push(t.map((v) => Math.round(v / k)));
  }
  return { width: w, height: h, mean, thumb, zones: outZones };
}`;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><title>backgrounds</title>");
  const out: Record<string, BackgroundStats> = {};
  for (const id of BACKGROUND_IDS) {
    const bg = BACKGROUNDS[id];
    const abs = path.join(ROOT, "public", "backgrounds", "v5", bg.file);
    const buf = readFileSync(abs);
    const src = `data:image/jpeg;base64,${buf.toString("base64")}`;
    const r = (await page.evaluate(`(${MEASURE})(${JSON.stringify({ src, zones: bg.textZone })})`)) as Omit<BackgroundStats, "file" | "sha256">;
    out[id] = { file: bg.file, sha256: createHash("sha256").update(buf).digest("hex"), ...r };
    console.log(`${id.padEnd(18)} ${bg.file.padEnd(12)} ${r.width}x${r.height} mean rgb(${r.mean.join(" ")}) ${r.zones.map((z) => `${z.name}: rgb(${z.darkest.join(" ")}) to rgb(${z.brightest.join(" ")})`).join("; ")}`);
  }
  await browser.close();
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`wrote ${path.relative(ROOT, OUT)}`);
}

void main();
