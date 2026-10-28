/**
 * Writes content/.generated/support.json (PRD v4, 3.1 to 3.4): every intro slide's tiles, the
 * generated "available since" sentence and the "also uses" line, from the installed web-features
 * package. Runs offline. With --tools it also fetches the tool packages' release dates from the
 * npm registry (the only step that needs a network; authoring time only, never on stage); without
 * it, the dates already in support.json are kept.
 *
 *   pnpm support [--tools]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { sections } from "@/content/sections";
import { computeSupport, fullVersion, type SupportFile } from "@/lib/support-data";
import { installedWebFeatures } from "@/lib/web-features";

const root = process.cwd();
const out = path.join(root, "content", ".generated", "support.json");
const previous = existsSync(out) ? (JSON.parse(readFileSync(out, "utf8")) as SupportFile) : null;
let toolDates: Record<string, string> = previous?.toolDates ?? {};

if (process.argv.includes("--tools")) {
  toolDates = {};
  for (const s of sections) {
    if (s.support?.kind !== "tooling") continue;
    for (const p of s.support.packages) {
      const version = fullVersion(p.version);
      const times = JSON.parse(execFileSync("npm", ["view", p.npm, "time", "--json"], { encoding: "utf8" })) as Record<string, string>;
      if (!times[version]) throw new Error(`npm has no ${p.npm}@${version}`);
      toolDates[`${p.npm}@${version}`] = times[version].slice(0, 10);
      console.log(`${p.npm}@${version}: ${toolDates[`${p.npm}@${version}`]}`);
    }
  }
}

const { version, data } = installedWebFeatures(root);
const file = computeSupport(sections, data, version, toolDates);
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(file, null, 2) + "\n");
for (const [id, e] of Object.entries(file.sections)) {
  console.log(`${id}: ${e.tiles.map((t) => `${t.name} ${t.version ?? "Not yet"}`).join(", ")}. ${e.since}${e.alsoUses ? ` ${e.alsoUses}` : ""}`);
}
console.log(`wrote ${path.relative(root, out)} from web-features ${version}`);
