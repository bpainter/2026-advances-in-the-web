// Estimates AVIF / WebP savings for intro stills, backgrounds and posters (outputs to ./img-out, not public/).
import { createRequire } from "node:module";
import { readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
const require = createRequire("/Users/bermonpainter/Sites/web-unleashed-talk-2026/package.json");
const sharp = require("/Users/bermonpainter/Sites/web-unleashed-talk-2026/node_modules/.pnpm/sharp@0.35.5_@types+node@26.6.5/node_modules/sharp");

const ROOT = "/Users/bermonpainter/Sites/web-unleashed-talk-2026/public";
const OUT = new URL("./img-out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

async function psnr(origBuf, encBuf, width) {
  const a = await sharp(origBuf).resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(encBuf).resize({ width: a.info.width, height: a.info.height, fit: "fill" }).removeAlpha().raw().toBuffer();
  let se = 0;
  for (let i = 0; i < a.data.length; i++) {
    const d = a.data[i] - b[i];
    se += d * d;
  }
  const mse = se / a.data.length;
  return mse === 0 ? 99 : 10 * Math.log10((255 * 255) / mse);
}

const rows = [];
async function variants(group, file, widths, opts) {
  const abs = path.join(ROOT, file);
  const orig = statSync(abs).size;
  const meta = await sharp(abs).metadata();
  for (const w of widths) {
    const width = Math.min(w, meta.width);
    const base = sharp(abs).resize({ width });
    const avif = await base.clone().avif({ quality: opts.avifQ, effort: 4 }).toBuffer();
    const webp = await base.clone().webp({ quality: opts.webpQ, effort: 4 }).toBuffer();
    const jpg = await base.clone().jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    const row = {
      group,
      file,
      origW: meta.width,
      origBytes: orig,
      width,
      avif: avif.length,
      webp: webp.length,
      mozjpeg: jpg.length,
      psnrAvif: Math.round((await psnr(abs, avif, width)) * 10) / 10,
      psnrWebp: Math.round((await psnr(abs, webp, width)) * 10) / 10,
    };
    rows.push(row);
    if (file.includes("m2-trail") || file.includes("d1.jpg")) {
      writeFileSync(path.join(OUT, `${path.basename(file)}.${width}.avif`), avif);
      writeFileSync(path.join(OUT, `${path.basename(file)}.${width}.webp`), webp);
    }
    console.log(`${group} ${file} ${meta.width}->${width} orig=${(orig / 1024) | 0}K avif=${(avif.length / 1024) | 0}K webp=${(webp.length / 1024) | 0}K mozjpeg=${(jpg.length / 1024) | 0}K psnr avif=${row.psnrAvif} webp=${row.psnrWebp}`);
  }
}

for (const f of readdirSync(path.join(ROOT, "intro")).filter((f) => f.endsWith(".png"))) await variants("intro", `intro/${f}`, [9999, 1056], { avifQ: 60, webpQ: 82 });
for (const f of readdirSync(path.join(ROOT, "backgrounds/v5")).filter((f) => f.endsWith(".jpg"))) await variants("bg", `backgrounds/v5/${f}`, [1920, 1440], { avifQ: 55, webpQ: 78 });
for (const d of ["d1-now", "m2-now", "d4-used-to"]) for (const f of readdirSync(path.join(ROOT, "posters", d)).filter((f) => f.endsWith(".jpg")).slice(0, 2)) await variants("poster", `posters/${d}/${f}`, [9999], { avifQ: 55, webpQ: 78 });

writeFileSync(new URL("./results/images.json", import.meta.url), JSON.stringify(rows, null, 2));
const sum = (g, k) => rows.filter((r) => r.group === g.group && r.width === g.width).reduce((a, r) => a + r[k], 0);
const groups = [...new Set(rows.map((r) => `${r.group}|${r.width === r.origW ? "full" : r.width}`))];
for (const g of groups) {
  const [group, w] = g.split("|");
  const sel = rows.filter((r) => r.group === group && (w === "full" ? r.width === r.origW : String(r.width) === w));
  const t = (k) => Math.round(sel.reduce((a, r) => a + r[k], 0) / 1024);
  console.log(`TOTAL ${group} ${w}: n=${sel.length} orig=${t("origBytes")}K avif=${t("avif")}K webp=${t("webp")}K mozjpeg=${t("mozjpeg")}K minPSNR avif=${Math.min(...sel.map((r) => r.psnrAvif))} webp=${Math.min(...sel.map((r) => r.psnrWebp))}`);
}
