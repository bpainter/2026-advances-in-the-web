import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { brotliDecompressSync } from "node:zlib";
import { FONT_DIR, FONT_FACES, subsetPath } from "@/lib/fonts";
import type { Issue } from "./rules";

/**
 * Font subset checks (docs/PRD-perf.md, P1-FONTS), shared by `pnpm fonts` (scripts/fonts.mts) and
 * `pnpm check`:
 *
 * - The subset keeps Basic Latin, Latin-1 Supplement, General Punctuation, Arrows, the euro, trade
 *   mark and minus signs, plus every character the deck's text uses. The scan reads slide content
 *   and speaker notes, the components and pages, the stylesheets, the frame shell files and every
 *   demo file and fixture, so nothing a slide, a note or a frame shows falls back to another face.
 * - Every scanned character the master has must be in its subset, or the check fails. Characters
 *   the master itself lacks (box drawing in the terminal recording, the review stars) fall back
 *   today and after, and are only listed by `pnpm fonts`.
 * - styles/fonts.css and styles/glass-tokens.css load only the subsets.
 */

/** Code point ranges every subset keeps, inclusive. */
export const SUBSET_RANGES: [number, number][] = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1 Supplement
  [0x2000, 0x206f], // General Punctuation: curly quotes, dashes, ellipsis, bullet, thin spaces
  [0x2190, 0x21ff], // Arrows
  [0x20ac, 0x20ac], // €
  [0x2122, 0x2122], // ™
  [0x2212, 0x2212], // − minus
];

/** Where the deck's text lives, relative to the repo root. */
export const SCAN_ROOTS = ["content", "components", "app", "lib", "styles", "demos", "fixtures", "public/wrappers", "public/portal", "public/runtime", "public/theme"];
const SCAN_EXT = /\.(tsx?|mts|m?js|json|html|css|md|txt|svg|http|ya?ml)$/i;
/** Build output, installed packages and vendored libraries: nothing the deck writes. */
const SKIP_DIR = new Set(["node_modules", "dist", "vendor", "native-extra", "coverage"]);

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) {
      // content/.generated holds the meters, support data and PRD copy the slides render.
      if (!(e.isDirectory() && e.name === ".generated")) continue;
    }
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIR.has(e.name)) yield* walk(p);
    } else if (SCAN_EXT.test(e.name)) yield p;
  }
}

const ENTITIES: Record<string, number> = { nbsp: 0xa0, copy: 0xa9, middot: 0xb7, times: 0xd7, ndash: 0x2013, mdash: 0x2014, lsquo: 0x2018, rsquo: 0x2019, ldquo: 0x201c, rdquo: 0x201d, bull: 0x2022, hellip: 0x2026, euro: 0x20ac, trade: 0x2122, larr: 0x2190, uarr: 0x2191, rarr: 0x2192, darr: 0x2193, minus: 0x2212 };

/** Characters written as escapes: JS `→` and `\u{2192}`, HTML `&#x2192;`, `&#8594;` and `&rarr;`, CSS `\2192`. */
function escaped(text: string, css: boolean): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/\\u\{([0-9a-f]{1,6})\}|\\u([0-9a-f]{4})|&#x([0-9a-f]{1,6});|&#(\d{1,7});|&([a-z]+);/gi)) {
    const cp = m[1] || m[2] || m[3] ? parseInt(m[1] ?? m[2] ?? m[3], 16) : m[4] ? Number(m[4]) : ENTITIES[m[5]];
    if (cp !== undefined) out.push(cp);
  }
  if (css) for (const m of text.matchAll(/\\([0-9a-f]{1,6})/gi)) out.push(parseInt(m[1], 16));
  return out;
}

/** Every character outside ASCII control codes in the scanned files, written or escaped, with one file that uses it. */
export function scanCharacters(root: string): Map<number, string> {
  const found = new Map<number, string>();
  for (const r of SCAN_ROOTS)
    for (const file of walk(path.join(root, r))) {
      const text = readFileSync(file, "utf8");
      const cps = [...text].map((ch) => ch.codePointAt(0)!).concat(escaped(text, file.endsWith(".css")));
      for (const cp of cps) {
        if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0) || (cp >= 0xd800 && cp <= 0xdfff) || cp > 0x10ffff || found.has(cp)) continue;
        found.set(cp, path.relative(root, file));
      }
    }
  return found;
}

/** The code points a subset must keep: the ranges and the scan. */
export function requiredCodePoints(scanned: Iterable<number>): Set<number> {
  const out = new Set<number>(scanned);
  for (const [a, b] of SUBSET_RANGES) for (let c = a; c <= b; c++) out.add(c);
  return out;
}

// --- Reading a font's character map ---------------------------------------------------------------

/** WOFF2's UIntBase128. */
function base128(buf: Buffer, at: { o: number }): number {
  let v = 0;
  for (let i = 0; i < 5; i++) {
    const b = buf[at.o++];
    v = v * 128 + (b & 0x7f);
    if (!(b & 0x80)) return v;
  }
  throw new Error("bad UIntBase128");
}

/** The cmap table of an SFNT (OTF, TTF) or WOFF2 file. */
function cmapTable(buf: Buffer): Buffer {
  const sig = buf.toString("latin1", 0, 4);
  if (sig === "wOF2") {
    const numTables = buf.readUInt16BE(12);
    const compressed = buf.readUInt32BE(20);
    const at = { o: 48 };
    const tables: { tag: number; length: number }[] = [];
    for (let i = 0; i < numTables; i++) {
      const flags = buf[at.o++];
      const tag = flags & 0x3f;
      if (tag === 0x3f) at.o += 4;
      const orig = base128(buf, at);
      const version = (flags >> 6) & 3;
      // glyf (10) and loca (11) are transformed at version 0; every other table at any other version.
      const transformed = tag === 10 || tag === 11 ? version === 0 : version !== 0;
      tables.push({ tag, length: transformed ? base128(buf, at) : orig });
    }
    const data = brotliDecompressSync(buf.subarray(at.o, at.o + compressed));
    let offset = 0;
    for (const t of tables) {
      // Known tag 0 is cmap; tables follow each other in directory order.
      if (t.tag === 0) return data.subarray(offset, offset + t.length);
      offset += t.length;
    }
    throw new Error("no cmap table");
  }
  const numTables = buf.readUInt16BE(4);
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (buf.toString("latin1", rec, rec + 4) === "cmap") {
      const offset = buf.readUInt32BE(rec + 8);
      return buf.subarray(offset, offset + buf.readUInt32BE(rec + 12));
    }
  }
  throw new Error("no cmap table");
}

/** The Unicode code points a font maps to a glyph (cmap formats 4 and 12). */
export function fontCodePoints(buf: Buffer): Set<number> {
  const cmap = cmapTable(buf);
  const out = new Set<number>();
  const n = cmap.readUInt16BE(2);
  for (let i = 0; i < n; i++) {
    const platform = cmap.readUInt16BE(4 + i * 8);
    const encoding = cmap.readUInt16BE(6 + i * 8);
    if (!(platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10)))) continue;
    const sub = cmap.readUInt32BE(8 + i * 8);
    const format = cmap.readUInt16BE(sub);
    if (format === 4) {
      const segs = cmap.readUInt16BE(sub + 6) / 2;
      const ends = sub + 14;
      const starts = ends + segs * 2 + 2;
      const deltas = starts + segs * 2;
      const ranges = deltas + segs * 2;
      for (let s = 0; s < segs; s++) {
        const end = cmap.readUInt16BE(ends + s * 2);
        const start = cmap.readUInt16BE(starts + s * 2);
        const delta = cmap.readInt16BE(deltas + s * 2);
        const rangeOffset = cmap.readUInt16BE(ranges + s * 2);
        for (let c = start; c <= end && c !== 0xffff; c++) {
          let glyph: number;
          if (rangeOffset === 0) glyph = (c + delta) & 0xffff;
          else {
            const g = cmap.readUInt16BE(ranges + s * 2 + rangeOffset + (c - start) * 2);
            glyph = g === 0 ? 0 : (g + delta) & 0xffff;
          }
          if (glyph) out.add(c);
        }
      }
    } else if (format === 12) {
      const groups = cmap.readUInt32BE(sub + 12);
      for (let g = 0; g < groups; g++) {
        const at = sub + 16 + g * 12;
        const start = cmap.readUInt32BE(at);
        const end = cmap.readUInt32BE(at + 4);
        for (let c = start; c <= end; c++) out.add(c);
      }
    }
  }
  return out;
}

const show = (cps: number[]) => cps.map((c) => `${String.fromCodePoint(c)} (U+${c.toString(16).toUpperCase().padStart(4, "0")})`).join(", ");

/** `pnpm check`: every face's subset exists and keeps every character the deck uses that its master has. */
export function fontIssues(root: string): Issue[] {
  const issues: Issue[] = [];
  const err = (where: string, message: string) => issues.push({ rule: "fonts", where, message, level: "error" });
  const required = requiredCodePoints(scanCharacters(root).keys());
  for (const face of FONT_FACES) {
    const master = path.join(root, "public", "fonts", face.master);
    const subset = path.join(root, "public", subsetPath(face.master));
    if (!existsSync(master)) {
      err(`public/fonts/${face.master}`, "Font master missing");
      continue;
    }
    if (!existsSync(subset)) {
      err(`public${subsetPath(face.master)}`, "Font subset missing; run pnpm fonts");
      continue;
    }
    const has = fontCodePoints(readFileSync(master));
    const kept = fontCodePoints(readFileSync(subset));
    const missing = [...required].filter((c) => has.has(c) && !kept.has(c)).sort((a, b) => a - b);
    if (missing.length) err(`public${subsetPath(face.master)}`, `Font subset misses ${missing.length} character(s) the deck uses: ${show(missing.slice(0, 12))}. Bump FONT_DIR in lib/fonts.ts and run pnpm fonts`);
  }
  // The presenter's faces and the frames' copy (public/theme/portal-glass.css) load the subsets only.
  for (const css of ["styles/fonts.css", "styles/glass-tokens.css"]) {
    const text = readFileSync(path.join(root, css), "utf8");
    for (const m of text.matchAll(/url\(\s*["']?(\/fonts\/[^"')]+)["']?\s*\)\s*format\(\s*["']?([\w-]+)/g)) {
      if (!m[1].startsWith(`${FONT_DIR}/`) || m[2] !== "woff2") err(css, `@font-face loads ${m[1]} as ${m[2]}; load the WOFF2 subset under ${FONT_DIR}`);
      else if (!existsSync(path.join(root, "public", m[1]))) err(css, `@font-face loads ${m[1]}, which does not exist`);
    }
  }
  return issues;
}

/** For `pnpm fonts`: characters the deck uses that a master has no glyph for (they fall back). */
export function uncovered(master: Buffer, scanned: Map<number, string>): string[] {
  const has = fontCodePoints(master);
  return [...scanned.entries()].filter(([c]) => c > 0x7e && !has.has(c) && !/\s/u.test(String.fromCodePoint(c))).map(([c, file]) => `${show([c])} in ${file}`);
}
