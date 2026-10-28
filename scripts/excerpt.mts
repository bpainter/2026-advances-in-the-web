/**
 * Authoring aid for used-to pages (PRD v4, 7.3 step 4): prints an excerpt as the code panel shows
 * it, with shown line numbers (what `code.lines` refers to) and the source line each comes from.
 *
 *   pnpm excerpt demos/01-layered-ui/today/modal.js 93-106 115-121 172-181
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { excerptLayout, elisionText } from "@/lib/excerpt";
import type { DemoCodeLang } from "@/content/demo-schema";

const [file, ...specs] = process.argv.slice(2);
const ranges = specs.map((s) => s.split("-").map(Number) as [number, number]);
const src = readFileSync(path.join(process.cwd(), file), "utf8").replace(/\n$/, "").split("\n");
const ext = path.extname(file).slice(1);
const lang = (ext === "mjs" ? "js" : ext) as DemoCodeLang;
excerptLayout(ranges, src.length).forEach((l, i) => {
  const text = l.kind === "source" ? src[l.line - 1] : elisionText(lang, l.count);
  const flag = text.length > 44 ? "  << over 44" : "";
  console.log(`${String(i + 1).padStart(3)} ${l.kind === "source" ? String(l.line).padStart(4) : "   ~"} | ${text}${flag}`);
});
