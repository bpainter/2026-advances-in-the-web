/**
 * Extracts the ten `DemoSection` literals from PRD_Demos.md into content/sections/<id>.ts, with each
 * page's code files written to content/sections/<id>/files/ and loaded lazily from there.
 * Usage: npx tsx scripts/extract-demo-prd.mts [path-to-PRD]
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { execSync } from "node:child_process";

const prdPath = process.argv[2] ?? path.join(process.env.HOME ?? "", "Downloads", "PRD_Demos.md");
const lines = readFileSync(prdPath, "utf8").split("\n");
const outDir = path.join(process.cwd(), "content", "sections");
const tmpDir = path.join(process.cwd(), "content", ".generated", "extract");
mkdirSync(outDir, { recursive: true });
mkdirSync(tmpDir, { recursive: true });

// Each literal starts at `const xN: DemoSection = {` and ends at the next line that is exactly `};`.
const starts = lines.map((l, i) => (/^const [a-z0-9]+: DemoSection = \{$/.test(l) ? i : -1)).filter((i) => i >= 0);
const ids: string[] = [];

for (const start of starts) {
  // The literal ends at the `};` just before the code block's closing fence (file sources may
  // themselves contain a `};` line).
  let fence = start;
  while (lines[fence] !== "```") fence++;
  const end = fence - 1;
  if (lines[end] !== "};") throw new Error(`Unexpected literal end at PRD line ${end + 1}: ${lines[end]}`);
  const varName = /^const ([a-z0-9]+):/.exec(lines[start])![1];
  const body = lines.slice(start, end + 1).join("\n").replace(/^const [a-z0-9]+: DemoSection = /, "const section = ");
  const tmp = path.join(tmpDir, `${varName}.mjs`);
  writeFileSync(tmp, `${body}\nexport default section;\n`);
  const section = (await import(pathToFileURL(tmp).href)).default as {
    id: string;
    pages: { id: string; files?: { file: string; lang: string; source: string }[] }[];
  };
  const id = section.id;
  ids.push(id);
  const filesDir = path.join(outDir, id, "files");
  rmSync(filesDir, { recursive: true, force: true });
  mkdirSync(filesDir, { recursive: true });
  for (const page of section.pages) {
    if (!page.files) continue;
    for (const f of page.files) {
      writeFileSync(path.join(filesDir, f.file), f.source.endsWith("\n") ? f.source : `${f.source}\n`);
      (f as { source: string }).source = `__FILE__${f.file}`;
    }
  }
  let json = JSON.stringify(section, null, 2);
  json = json.replace(/"source": "__FILE__([^"]+)"/g, (_m, file: string) => `"source": sectionFile("${id}", "${file}")`);
  const ts = `import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./${id}/files/. */
export const section: DemoSection = ${json};
`;
  writeFileSync(path.join(outDir, `${id}.ts`), ts);
  console.log(`${id}: ${section.pages.length} page(s)`);
}

const index = `import type { DemoSection } from "@/content/demo-schema";
${ids.map((id, i) => `import { section as s${i + 1} } from "./${id}";`).join("\n")}

/** The demo section in talk order (PRD Part A, section 1). */
export const sections: DemoSection[] = [${ids.map((_, i) => `s${i + 1}`).join(", ")}];
`;
writeFileSync(path.join(outDir, "index.ts"), index);
execSync(`npx prettier --write "content/sections/*.ts"`, { stdio: "inherit" });
console.log(`wrote ${ids.length} sections`);
