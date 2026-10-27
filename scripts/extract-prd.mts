/**
 * One-off: pulls the 36 `const slide: Slide = {...}` blocks out of the PRD's Part B,
 * evaluates them, and writes a JSON dump for inspection and generation.
 * Usage: npx tsx scripts/extract-prd.ts <prd.md> <out.json>
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , prdPath, outPath] = process.argv;
const md = readFileSync(prdPath, "utf8");
const partB = md.slice(md.indexOf("\n# Part B"), md.indexOf("\n# Appendix A"));

const blocks: { heading: string; code: string; note: string }[] = [];
const re = /\n## (\d+)\. ([^\n]+)\n([\s\S]*?)```ts\n([\s\S]*?)```([\s\S]*?)(?=\n## \d+\. |$)/g;
let m: RegExpExecArray | null;
while ((m = re.exec(partB))) blocks.push({ heading: `${m[1]}. ${m[2]}`, code: m[4], note: m[5].trim() });

const tmpDir = path.join(process.cwd(), "content", ".generated", "prd");
mkdirSync(tmpDir, { recursive: true });
const slides: unknown[] = [];
const notes: Record<string, string> = {};
for (const [i, b] of blocks.entries()) {
  const file = path.join(tmpDir, `s${String(i + 1).padStart(2, "0")}.mjs`);
  const js = b.code.replace(/^const slide: Slide = /m, "export const slide = ").replace(/;\s*$/, ";");
  writeFileSync(file, js);
  const mod = await import(pathToFileURL(file).href);
  slides.push(mod.slide);
  notes[mod.slide.id] = b.note;
}
writeFileSync(outPath, JSON.stringify({ slides, notes }, null, 2));
console.log(`extracted ${slides.length} slides`);
