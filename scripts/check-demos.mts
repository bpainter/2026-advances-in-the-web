/**
 * Prints every demo step with the source lines it highlights, and flags lines wider than the
 * code panel (56 columns) or steps whose ranges fall outside the file. Usage: npx tsx scripts/check-demos.mts [demo-id]
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";

const MAX_COLS = 56;
const only = process.argv[2];
const root = path.join(process.cwd(), "content", "demos");
let problems = 0;

for (const id of readdirSync(root)) {
  if (only && id !== only) continue;
  const demoTs = path.join(root, id, "demo.ts");
  if (!existsSync(demoTs)) continue;
  // Collapse whitespace so Prettier's multi-line arrays and captions still match the regexes.
  const src = readFileSync(demoTs, "utf8").replace(/\s+/g, " ");
  const files = [...src.matchAll(/file: "([^"]+)",\s*lang: "([^"]+)"/g)].map((m) => ({ file: m[1], lang: m[2] }));
  const sources = Object.fromEntries(files.map((f) => [f.file, readFileSync(path.join(root, id, f.file), "utf8").replace(/\n$/, "").split("\n")]));
  console.log(`\n== ${id}`);
  for (const [file, lines] of Object.entries(sources)) {
    const wide = lines.map((l, i) => [i + 1, l.length] as const).filter(([, n]) => n > MAX_COLS);
    if (wide.length) {
      problems += wide.length;
      console.log(`  ! ${file}: ${wide.length} line(s) over ${MAX_COLS} cols: ${wide.map(([n, w]) => `${n}(${w})`).join(" ")}`);
    }
  }
  const steps = [...src.matchAll(/\{\s*id: "(s\d+)",\s*(?:file: "([^"]+)",\s*)?highlight: (\[[^\]]*\]|\[\[[^\]]*\](?:,\s*\[[^\]]*\])*\]),\s*caption: "([^"]*)"/g)];
  for (const m of steps) {
    const [, sid, file, rawHl, caption] = m;
    const target = file ?? files[0]?.file;
    const lines = sources[target] ?? [];
    const hl = JSON.parse(rawHl) as (number | [number, number])[];
    const nums = hl.flatMap((h) => (Array.isArray(h) ? Array.from({ length: h[1] - h[0] + 1 }, (_, i) => h[0] + i) : [h]));
    const bad = nums.filter((n) => n < 1 || n > lines.length);
    if (bad.length) {
      problems++;
      console.log(`  ! ${sid} ${target}: lines ${bad.join(",")} outside 1..${lines.length}`);
    }
    console.log(`  ${sid} ${target} ${rawHl.replace(/\s+/g, "")} — ${caption.slice(0, 60)}`);
    for (const n of nums.slice(0, 12)) console.log(`      ${String(n).padStart(3)} | ${lines[n - 1] ?? ""}`);
    if (nums.length > 12) console.log(`      … ${nums.length - 12} more`);
  }
}
console.log(problems ? `\n${problems} problem(s)` : "\nno problems");
process.exit(problems ? 1 : 0);
