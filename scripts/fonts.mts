/**
 * `pnpm fonts` (docs/PRD-perf.md, P1-FONTS): subsets each master in public/fonts/ to a Latin WOFF2
 * under public/fonts/v2/ (lib/fonts.ts), with subset-font (HarfBuzz, pinned in package.json).
 *
 *   pnpm fonts            write the subsets that are missing, then check every one
 *   pnpm fonts --check    check only
 *
 * The subset keeps the ranges in lib/validate/fonts.ts plus every character the deck's text uses
 * (slides, notes, components, stylesheets, frame shell files, demos and fixtures). The script fails
 * when a subset misses a character its master has. The folder is write-once: the files are
 * immutable for a year once deployed, so a file that would change is refused, and the fix is a new
 * folder version in lib/fonts.ts.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import subsetFont from "subset-font";
import { FONT_DIR, FONT_FACES, subsetPath } from "@/lib/fonts";
import { fontCodePoints, fontIssues, requiredCodePoints, scanCharacters, uncovered } from "@/lib/validate/fonts";

const root = process.cwd();
const checkOnly = process.argv.includes("--check");
const scanned = scanCharacters(root);
const text = String.fromCodePoint(...[...requiredCodePoints(scanned.keys())].sort((a, b) => a - b));
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex").slice(0, 12);
/**
 * OpenType features kept: the ones browsers turn on by default, plus tnum for
 * `font-variant-numeric: tabular-nums` (the pill's and the slides' numbers). Stylistic sets,
 * alternates, fractions and superiors are never asked for, and dropping them takes about a fifth
 * off each file. Hinting stays.
 */
const FEATURES = ["kern", "mark", "mkmk", "ccmp", "locl", "liga", "clig", "calt", "rlig", "tnum"];

let failed = false;
for (const face of FONT_FACES) {
  const master = readFileSync(path.join(root, "public", "fonts", face.master));
  const out = path.join(root, "public", subsetPath(face.master));
  const masterKb = (master.length / 1024).toFixed(1);
  if (!checkOnly) {
    const bytes = Buffer.from(await subsetFont(master, text, { targetFormat: "woff2", keepFeatures: FEATURES }));
    if (existsSync(out)) {
      const old = readFileSync(out);
      if (!old.equals(bytes)) {
        // Immutable once deployed (next.config.ts): a changed file needs a new folder.
        console.error(`✖ ${path.relative(root, out)} exists with other bytes (${sha(old)}, new ${sha(bytes)}). Bump FONT_DIR in lib/fonts.ts (${FONT_DIR}) and run pnpm fonts again.`);
        failed = true;
        continue;
      }
      console.log(`  ${path.relative(root, out)}: unchanged, ${(bytes.length / 1024).toFixed(1)} KB (master ${masterKb} KB)`);
    } else {
      mkdirSync(path.dirname(out), { recursive: true });
      writeFileSync(out, bytes);
      console.log(`  wrote ${path.relative(root, out)}: ${(bytes.length / 1024).toFixed(1)} KB, ${fontCodePoints(bytes).size} characters (master ${masterKb} KB)`);
    }
  }
  const missing = uncovered(master, scanned);
  if (missing.length) console.log(`  · ${face.master} has no glyph for ${missing.length} character(s) the deck uses; the browser falls back for them, as with the master:\n      ${missing.join("\n      ")}`);
}

const issues = fontIssues(root);
for (const i of issues) console.error(`✖ ${i.where}: ${i.message}`);
if (issues.length || failed) process.exit(1);
console.log(`fonts: ${FONT_FACES.length} subsets under public${FONT_DIR} keep every character the deck uses (${scanned.size} distinct characters scanned)`);
