/**
 * Build-time file lists (docs/PRD-perf.md, P1-CACHE and P1-FUNC). Runs in `prebuild` and `predev`
 * after `theme:sync`, which writes public/theme.
 *
 * - content/.generated/asset-versions.json: `{ "/theme/portal-glass.css": "<hash8>", … }`, the
 *   first 8 hex of the SHA-256 of every file under public/theme, public/runtime, public/wrappers
 *   and public/portal. The frame shell (lib/frames/compose.ts) adds `?v=<hash8>` to the links it
 *   writes in production, and next.config.ts makes `?v=` URLs immutable.
 * - content/.generated/public-files.json: the sorted URL paths of every file under public/intro,
 *   public/posters, public/images and public/opt. `assetExists()` in lib/assets.ts (WS-3) answers
 *   from it, so the page functions need not carry the images to call existsSync on them.
 *
 * Both files are gitignored and listed in next.config.ts `runtimeSources`, so the functions on
 * Vercel can read them.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "content", ".generated");
const VERSIONED = ["theme", "runtime", "wrappers", "portal"];
const LISTED = ["intro", "posters", "images", "opt"];

function files(dir: string): string[] {
  const abs = path.join(PUBLIC, dir);
  if (!existsSync(abs)) return [];
  const out: string[] = [];
  for (const e of readdirSync(abs, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || e.name.startsWith(".")) continue;
    out.push("/" + path.relative(PUBLIC, path.join(e.parentPath, e.name)).split(path.sep).join("/"));
  }
  return out.sort();
}

const versions: Record<string, string> = {};
for (const url of VERSIONED.flatMap(files)) versions[url] = createHash("sha256").update(readFileSync(path.join(PUBLIC, url))).digest("hex").slice(0, 8);
const listed = LISTED.flatMap(files);

mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, "asset-versions.json"), JSON.stringify(versions, null, 2) + "\n");
writeFileSync(path.join(OUT, "public-files.json"), JSON.stringify(listed, null, 2) + "\n");
console.log(`wrote asset-versions.json (${Object.keys(versions).length} files) and public-files.json (${listed.length} files)`);
