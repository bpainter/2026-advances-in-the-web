import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DemoSection, FramePage } from "@/content/demo-schema";
import { hasFrame } from "@/content/demo-schema";
import { DEMO_FOLDERS, demoFolder } from "@/lib/frames/registry";
import { matchRoute } from "@/lib/frames/routes";
import { WRAPPERS } from "@/lib/frames/wrappers";
import type { ImageManifest } from "@/lib/assets";
import type { Issue } from "./rules";

/**
 * Image pipeline checks (docs/PRD-perf.md, P1-IMG item 10), run by `pnpm check`:
 *
 * - every master under the groups below has an entry in content/.generated/images.json whose
 *   `sourceHash` matches its bytes ("Images changed; run pnpm images"), and no entry outlives its
 *   master;
 * - every `src` in the manifest exists under public/;
 * - content/.generated/public-files.json (scripts/asset-versions.mts) lists exactly the files on
 *   disk, because assetExists() answers from it;
 * - a warning (an error under --strict) when a page's posters were captured from other frame
 *   inputs than the ones on disk now. `pnpm capture` records the inputs per page in
 *   content/.generated/posters.json.
 */

/** Where the masters live and where `pnpm images` writes them (public/opt/<out>/...). */
export const IMAGE_GROUPS = [
  { id: "intro", dir: "intro", match: /\.png$/i, out: "intro" },
  { id: "backgrounds", dir: "backgrounds/v5", match: /\.jpe?g$/i, out: "bg" },
  { id: "posters", dir: "posters", match: /\.(jpe?g|png)$/i, out: "posters" },
  { id: "portraits", dir: "images/design", match: /\.png$/i, out: "design" },
  // Re-encoded in place: same names, format and aspect ratio (guardrail 2.1).
  { id: "demo-assets", dir: "demo-assets", match: /\.webp$/i, out: null },
] as const;

export type ImageGroup = (typeof IMAGE_GROUPS)[number];

export const MANIFEST_FILE = "content/.generated/images.json";
export const POSTERS_FILE = "content/.generated/posters.json";
export const PUBLIC_FILES = "content/.generated/public-files.json";
/** The folders public-files.json lists (scripts/asset-versions.mts). */
const LISTED = ["intro", "posters", "images", "opt"];

export const sha256 = (buf: Buffer | string) => createHash("sha256").update(buf).digest("hex");

/** Files under a directory, recursively, as paths relative to it (dot files skipped). */
export function walkFiles(dir: string, skip: string[] = []): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!e.isFile() || e.name.startsWith(".")) continue;
    const rel = path.relative(dir, path.join(e.parentPath, e.name));
    if (rel.split(path.sep).some((part) => skip.includes(part) || part.startsWith("."))) continue;
    out.push(rel.split(path.sep).join("/"));
  }
  return out.sort();
}

/** Every master path ("/intro/d1-order-actions.png") with its group. */
export function listMasters(root: string): { master: string; group: ImageGroup }[] {
  return IMAGE_GROUPS.flatMap((group) =>
    walkFiles(path.join(root, "public", group.dir))
      .filter((rel) => group.match.test(rel))
      .map((rel) => ({ master: `/${group.dir}/${rel}`, group })),
  );
}

// --- Poster freshness ---------------------------------------------------------------------------

export interface PosterRecord {
  /** posterInputHash() when the page's posters were captured. */
  inputs: string;
  captured: string;
}

const SKIP_DIRS = ["node_modules", ".next", ".next-capture", "public", "recordings", "work"];

/** The build behind a frame route: /demos/<demo>/<build>, a native build's root route, or an F2 app. */
function buildFor(route: string, root: string) {
  const m = /^\/demos\/([\w-]+)\/(today|native|static|terminal)/.exec(route);
  if (m) {
    const folder = demoFolder(m[1]);
    return folder ? { demo: folder.demo, def: folder.builds[m[2] as "today"] } : null;
  }
  if (route.startsWith("/framework-today/")) return { demo: "06-framework-cache-today", dir: path.join(root, "demos", "06-framework-cache-today") };
  if (route.startsWith("/framework/")) return { demo: "06-framework-cache", dir: path.join(root, "demos", "06-framework-cache") };
  const pathname = route.split("?")[0];
  for (const f of Object.values(DEMO_FOLDERS)) {
    if (f.builds.native && f.routes && matchRoute(f.routes, "GET", pathname)) return { demo: f.demo, def: f.builds.native };
  }
  return null;
}

/**
 * The files a page's frame paints from, hashed: the build's directory and its extra hooks, the
 * demo folder's build and render modules, the section's shown files, the wrapper's markup and
 * CSS, the portal CSS, the theme source, the fixtures the demo reads (and the demo photos when they
 * name them), and the page's frame and step actions. Notes and bullets are not inputs.
 */
export function posterInputHash(root: string, section: DemoSection, page: FramePage): string {
  const h = createHash("sha256");
  const add = (label: string, abs: string) => {
    if (!existsSync(abs)) return;
    h.update(`${label}\0`);
    h.update(readFileSync(abs));
  };
  const addDir = (abs: string) => {
    for (const rel of walkFiles(abs, SKIP_DIRS)) add(path.relative(root, path.join(abs, rel)), path.join(abs, rel));
  };
  h.update(JSON.stringify({ frame: page.frame, steps: page.steps.map((s) => ({ id: s.id, actions: s.actions })) }));
  const build = buildFor(page.frame.route, root);
  const texts: string[] = [];
  if (build) {
    const dir = "def" in build ? build.def?.dir : build.dir;
    if (dir) addDir(dir);
    if ("def" in build && build.def) {
      if (build.def.extraDir) addDir(build.def.extraDir);
      const demoDir = path.join(root, "demos", build.demo);
      for (const f of existsSync(demoDir) ? readdirSync(demoDir).filter((n) => /\.(ts|mts|js|mjs)$/.test(n)) : []) {
        add(`demos/${build.demo}/${f}`, path.join(demoDir, f));
        texts.push(readFileSync(path.join(demoDir, f), "utf8"));
      }
      const man = build.def.manifest;
      for (const href of man.styles ?? []) add(`public${href}`, path.join(root, "public", href));
      const w = man.wrapper ? WRAPPERS[man.wrapper.id] : undefined;
      if (w && man.wrapper) {
        const r = w.render({ build: man.build, demo: build.demo });
        h.update(r.before + r.after);
        for (const href of [...r.styles, ...r.scripts]) add(`public${href}`, path.join(root, "public", href));
        const src = path.join(root, "lib", "frames", "wrappers", `${man.wrapper.id}.ts`);
        if (existsSync(src)) texts.push(readFileSync(src, "utf8"));
      }
    }
  }
  addDir(path.join(root, "content", "sections", section.id));
  add("styles/glass-tokens.css", path.join(root, "styles", "glass-tokens.css"));
  // Fixtures the demo or its wrapper names, and the demo photos when any of them point there.
  const fixtures = [...new Set(texts.flatMap((t) => [...t.matchAll(/fixtures\/([\w-]+\.json)/g)].map((m) => m[1])))].sort();
  let photos = texts.some((t) => t.includes("demo-assets"));
  for (const f of fixtures) {
    const abs = path.join(root, "fixtures", f);
    add(`fixtures/${f}`, abs);
    if (existsSync(abs) && readFileSync(abs, "utf8").includes("/demo-assets/")) photos = true;
  }
  if (photos) addDir(path.join(root, "public", "demo-assets"));
  return h.digest("hex").slice(0, 16);
}

// --- The checks ---------------------------------------------------------------------------------

function readJson<T>(abs: string): T | null {
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as T;
  } catch {
    return null;
  }
}

export function assetIssues(root: string, sections: DemoSection[]): Issue[] {
  const out: Issue[] = [];
  const err = (rule: string, where: string, message: string) => out.push({ rule, where, message, level: "error" });
  const warn = (rule: string, where: string, message: string) => out.push({ rule, where, message, level: "warning" });

  // 1. Masters and the manifest.
  const manifest = readJson<ImageManifest>(path.join(root, MANIFEST_FILE));
  if (!manifest) {
    err("images", MANIFEST_FILE, "is missing; run pnpm images");
    return out;
  }
  const masters = listMasters(root);
  const stale: string[] = [];
  for (const { master } of masters) {
    const e = manifest[master];
    if (!e || e.sourceHash !== sha256(readFileSync(path.join(root, "public", master)))) stale.push(master);
  }
  if (stale.length) err("images", MANIFEST_FILE, `Images changed; run pnpm images (${stale.length}: ${stale.slice(0, 4).join(", ")}${stale.length > 4 ? ", …" : ""})`);
  const known = new Set(masters.map((m) => m.master));
  const orphans = Object.keys(manifest).filter((k) => !known.has(k));
  if (orphans.length) err("images", MANIFEST_FILE, `has entries for missing masters; run pnpm images (${orphans.slice(0, 4).join(", ")})`);

  // 2. Every encoded file exists.
  const missing = Object.values(manifest)
    .flatMap((e) => [...e.avif, ...e.webp])
    .map((v) => v.src)
    .filter((src) => !existsSync(path.join(root, "public", src)));
  if (missing.length) err("images", MANIFEST_FILE, `names ${missing.length} file(s) not under public/; run pnpm images (${missing.slice(0, 3).join(", ")})`);

  // 3. public-files.json matches the disk.
  const listedFiles = readJson<string[]>(path.join(root, PUBLIC_FILES));
  if (!listedFiles) warn("public-files", PUBLIC_FILES, "is missing; pnpm dev and pnpm build write it (pnpm asset-versions)");
  else {
    const disk = LISTED.flatMap((d) => walkFiles(path.join(root, "public", d)).map((rel) => `/${d}/${rel}`)).sort();
    const listedSet = new Set(listedFiles);
    const diskSet = new Set(disk);
    const added = disk.filter((f) => !listedSet.has(f));
    const removed = listedFiles.filter((f) => !diskSet.has(f));
    if (added.length || removed.length) err("public-files", PUBLIC_FILES, `differs from public/ (${added.length} new, ${removed.length} gone); run pnpm asset-versions`);
  }

  // 4. Posters captured from the frame inputs on disk now.
  const records = readJson<Record<string, PosterRecord>>(path.join(root, POSTERS_FILE));
  if (!records) {
    warn("poster-fresh", POSTERS_FILE, "is missing: no capture has recorded its frame inputs yet; the next pnpm capture writes it");
    return out;
  }
  for (const section of sections) {
    for (const page of section.pages) {
      if (!hasFrame(page)) continue;
      const rec = records[page.id];
      if (!rec) warn("poster-fresh", page.id, `posters have no capture record; run pnpm capture ${section.id}`);
      else if (rec.inputs !== posterInputHash(root, section, page)) warn("poster-fresh", page.id, `posters are older than the frame's inputs (captured ${rec.captured.slice(0, 10)}); run pnpm capture ${section.id}`);
    }
  }
  return out;
}
