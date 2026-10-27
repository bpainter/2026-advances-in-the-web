/**
 * Computes the today builds' meters (PRD Part A, 8.3): for every `meter.source` of the form
 * "… in /demos/<demo>/today/*.js", formats the build's own JavaScript with Prettier at
 * printWidth 80, drops blank and comment-only lines, and writes the count to
 * content/.generated/meters.json keyed by the source string. Usage: pnpm meters
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { format } from "prettier";
import { sections } from "@/content/sections";

const root = process.cwd();
const out: Record<string, string> = {};

async function countLines(dir: string): Promise<number> {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".js"))) {
    const src = readFileSync(path.join(dir, f), "utf8");
    const pretty = await format(src, { parser: "babel", printWidth: 80 });
    let inBlock = false;
    for (const raw of pretty.split("\n")) {
      const line = raw.trim();
      if (inBlock) {
        if (line.includes("*/")) inBlock = false;
        continue;
      }
      if (!line) continue;
      if (line.startsWith("//")) continue;
      if (line.startsWith("/*")) {
        if (!line.includes("*/")) inBlock = true;
        continue;
      }
      n++;
    }
  }
  return n;
}

for (const section of sections) {
  for (const page of section.pages) {
    for (const step of page.steps) {
      if (!step.meter) continue;
      const m = /(\/demos\/[\w-]+\/today)\/\*\.js/.exec(step.meter.source);
      if (!m) {
        out[step.meter.source] = step.meter.value;
        continue;
      }
      const dir = path.join(root, m[1].replace(/^\//, ""));
      if (!existsSync(dir)) {
        console.log(`${section.id} ${page.id} ${step.id}: no build at ${m[1]} yet`);
        continue;
      }
      const n = await countLines(dir);
      out[step.meter.source] = `${n} lines`;
      console.log(`${section.id} ${page.id} ${step.id}: ${n} lines`);
    }
  }
}
mkdirSync(path.join(root, "content", ".generated"), { recursive: true });
writeFileSync(path.join(root, "content", ".generated", "meters.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${Object.keys(out).length} meter(s)`);
