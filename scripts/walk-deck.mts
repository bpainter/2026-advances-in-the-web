/**
 * Deck checks for the walk (PRD v5, 4.8): every slide in order on its registry background, decoded
 * before arrival, with the grain layer at the token opacity; every pair of backgrounds distinct;
 * every frame on its section background at the slide's alignment.
 *
 * Evaluated code is passed as strings, so tsx does not wrap helpers in its __name() calls.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Frame, Page } from "@playwright/test";
import { BACKGROUNDS, backgroundUrl, type BackgroundId } from "@/content/backgrounds";
import type { Slide } from "@/content/schema";
import type { Report } from "./walk-spotlight.mts";

type Thumb = [number, number, number][];

/** Mean per-channel difference between two 16 by 9 thumbnails, 0 to 255. */
function thumbDistance(a: Thumb, b: Thumb): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) for (let c = 0; c < 3; c++) sum += Math.abs(a[i][c] - b[i][c]);
  return sum / (a.length * 3);
}

export function checkDistinct(report: Report) {
  const stats = JSON.parse(readFileSync(path.join(process.cwd(), "content", ".generated", "backgrounds.json"), "utf8")) as Record<string, { thumb: Thumb }>;
  const ids = Object.keys(BACKGROUNDS);
  let worst = { d: Infinity, pair: "" };
  const close: string[] = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++) {
      const d = thumbDistance(stats[ids[i]].thumb, stats[ids[j]].thumb);
      if (d < worst.d) worst = { d, pair: `${ids[i]} and ${ids[j]}` };
      if (d < 12) close.push(`${ids[i]} and ${ids[j]} (${d.toFixed(1)})`);
    }
  if (close.length) report.fail("backgrounds", `thumbnails too similar: ${close.join(", ")}`);
  else report.pass(`backgrounds: all ${(ids.length * (ids.length - 1)) / 2} pairs differ by 12 or more per channel (closest ${worst.pair}, ${worst.d.toFixed(1)})`);
}

/** Walks the deck slide by slide with Shift+ArrowRight and checks each slide's background and grain. */
export async function walkDeck(page: Page, base: string, slides: Slide[], report: Report) {
  console.log(`\n== deck (${slides.length} slides)`);
  await page.goto(`${base}/present?s=${slides[0].id}`);
  const tokenOpacity = Number((await page.evaluate(`getComputedStyle(document.documentElement).getPropertyValue("--grain-opacity").trim()`)) as string);
  const problems: string[] = [];
  for (const [i, slide] of slides.entries()) {
    const want = backgroundUrl(slide.background);
    const arrived = await page
      .waitForFunction((w) => document.querySelector(".stage__canvas")?.getAttribute("data-background") === w, want, { timeout: 8000 })
      .then(() => true)
      .catch(() => false);
    if (!arrived) {
      problems.push(`${slide.id}: never showed ${want}`);
    } else {
      const v = (await page.evaluate(`(() => {
        const bg = document.querySelector(".stage__bg");
        const grain = document.querySelector(".stage__grain");
        return {
          image: bg ? getComputedStyle(bg).backgroundImage : "",
          grain: grain ? Number(getComputedStyle(grain).opacity) : null,
          blend: grain ? getComputedStyle(grain).mixBlendMode : null,
          decoded: window.__decodedBackgrounds || [],
        };
      })()`)) as { image: string; grain: number | null; blend: string | null; decoded: string[] };
      if (!v.image.includes(want)) problems.push(`${slide.id}: background is ${v.image.slice(0, 80)}, not ${want}`);
      if (v.grain === null) problems.push(`${slide.id}: no grain layer`);
      else if (Math.abs(v.grain - tokenOpacity) > 0.001 || v.blend !== "overlay") problems.push(`${slide.id}: grain at ${v.grain} ${v.blend}; the token says ${tokenOpacity} overlay`);
      if (i > 0 && !v.decoded.includes(want)) problems.push(`${slide.id}: ${want} was not decoded before arrival`);
    }
    if (i < slides.length - 1) {
      // A frame may take focus while it swaps documents and drop the key; press again until the
      // address names the next slide.
      const nextId = slides[i + 1].id;
      for (let attempt = 0; attempt < 4; attempt++) {
        await page.keyboard.press("Shift+ArrowRight");
        const moved = await page
          .waitForFunction((id) => new URLSearchParams(location.search).get("s") === id, nextId, { timeout: 2500 })
          .then(() => true)
          .catch(() => false);
        if (moved) break;
      }
      await page.waitForTimeout(500);
    }
  }
  if (problems.length) for (const p of problems) report.fail("deck", p);
  else report.pass(`deck: ${slides.length} slides in order, each on its registry background, decoded before arrival, grain at ${tokenOpacity} overlay`);
}

/** A frame on its section background at the slide's alignment (PRD v5, 4.2). */
export async function checkFrameBackground(frame: Frame | null, where: string, background: BackgroundId, report: Report) {
  if (!frame) return report.fail(where, "frame background: no frame");
  const v = (await frame
    .evaluate(`(() => {
      const cs = getComputedStyle(document.body);
      return { bg: document.documentElement.dataset.sectionBg || null, size: cs.backgroundSize, position: cs.backgroundPosition, attachment: cs.backgroundAttachment, image: cs.backgroundImage };
    })()`)
    .catch(() => null)) as { bg: string | null; size: string; position: string; attachment: string; image: string } | null;
  if (!v) return report.fail(where, "frame background: the frame did not answer");
  // Split a computed multi-layer value at top-level commas (layers nest parentheses).
  const layer = (list: string) => {
    const out: string[] = [];
    let depth = 0;
    let cur = "";
    for (const ch of list) {
      if (ch === "(") depth++;
      if (ch === ")") depth--;
      if (ch === "," && depth === 0) {
        out.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  };
  const images = layer(v.image);
  const idx = images.findIndex((x) => x.includes(`/backgrounds/v5/${BACKGROUNDS[background].file}`));
  const nums = (s: string | undefined) => (s ?? "").match(/-?[\d.]+/g)?.map(Number) ?? [];
  const size = nums(layer(v.size)[idx]);
  const pos = nums(layer(v.position)[idx]);
  const near = (a: number[], b: number[]) => a.length === b.length && a.every((n, k) => Math.abs(n - b[k]) <= 0.5);
  const problems: string[] = [];
  if (v.bg !== background) problems.push(`data-section-bg is ${v.bg}, not ${background}`);
  if (idx === -1) problems.push(`body shows no ${BACKGROUNDS[background].file}`);
  else {
    if (!near(size, [1396.36, 785.45])) problems.push(`size ${layer(v.size)[idx]}`);
    if (!near(pos, [-47.27, -128.73])) problems.push(`position ${layer(v.position)[idx]}`);
    if (!layer(v.attachment)[idx]?.includes("fixed")) problems.push(`attachment ${v.attachment}`);
  }
  if (problems.length) report.fail(where, `frame background: ${problems.join("; ")}`);
  else report.pass(`frame on ${BACKGROUNDS[background].file} at 1396.36 by 785.45, offset -47.27 -128.73, fixed`);
}
