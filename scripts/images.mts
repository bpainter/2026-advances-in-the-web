/**
 * The image pipeline (docs/PRD-perf.md, P1-IMG; decision D2):
 *
 *   pnpm images [--only=<glob>] [--force]
 *
 * Reads the masters where they are (lib/validate/assets.ts, IMAGE_GROUPS) and writes
 * public/opt/<group>/<stem>-<w>.<hash8>.<ext>, where hash8 is the first 8 hex of the SHA-256 of
 * the output bytes, plus content/.generated/images.json keyed by master path. Outputs and manifest
 * are committed, like public/og/*: a Vercel build never encodes. A master whose bytes and recipe
 * match its entry is skipped, so a run after one new capture touches one file. Hashed names are
 * write-once: an existing file with that name must hold the same bytes. Files under public/opt that
 * no entry names are deleted at the end; then `pnpm theme:sync` rewrites the frames'
 * backgrounds.css and scripts/asset-versions.mts the build-time file list.
 *
 * public/demo-assets/** is the exception (guardrail 2.1): shown code names those files, so they
 * are re-encoded in place, same name, same format (WebP), same aspect ratio, at twice their largest
 * shown size in stage px. A file whose ratio has no smaller integer size keeps its size and only
 * drops quality. Their entries record the file as it is now, so a re-run leaves them alone.
 *
 * `--only` takes globs on the master path, comma separated, `*` within a path segment and `**`
 * across them: `--only=/posters/m2-now/**,/intro/m2-trail-photos.png`.
 * Runs under the react-server condition (the poster helpers load the frame registry).
 */
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ImageEntry, ImageManifest, ImageVariant } from "@/lib/assets";
import { MANIFEST_FILE, listMasters, sha256, walkFiles, type ImageGroup } from "@/lib/validate/assets";

// --- Settings -----------------------------------------------------------------------------------

/**
 * Quality per group (D2). Stills, posters and portraits: AVIF q70 4:4:4, text stays sharp. Backgrounds
 * keep their baked grain at q70 4:4:4 (q55 4:2:0 only after the projector check). The WebP fallback
 * (stills and portraits) is q85.
 */
const AVIF = { quality: 70, chromaSubsampling: "4:4:4", effort: 4 } as const;
const WEBP = { quality: 85, effort: 4, smartSubsample: true } as const;
/** Demo photos stay WebP; they show at a fraction of their size inside the frame. */
const DEMO_WEBP = { quality: 80, effort: 6, smartSubsample: true } as const;

/**
 * Per-file overrides, by master path: `{ avif: 80 }` for a photographic still that bands.
 *
 * Backgrounds with a faint baked grain lose it at q70: the grain's energy (luma minus a 1.5 px blur)
 * fell to 51 to 54% on d6, f2 and o2 and 72 to 88% on f3, d2, title, o4 and d4. Each gets the lowest
 * quality that keeps 90% or more (o2 needs q90 for its 0.7 sd grain). The other 16 keep 91 to 108% at q70.
 */
const OVERRIDES: Record<string, { avif?: number; webp?: number }> = {
  "/backgrounds/v5/o2.jpg": { avif: 90 },
  "/backgrounds/v5/f2.jpg": { avif: 85 },
  "/backgrounds/v5/d6.jpg": { avif: 80 },
  "/backgrounds/v5/f3.jpg": { avif: 80 },
  "/backgrounds/v5/d2.jpg": { avif: 75 },
  "/backgrounds/v5/d4.jpg": { avif: 75 },
  "/backgrounds/v5/o4.jpg": { avif: 75 },
  "/backgrounds/v5/title.jpg": { avif: 75 },
};

/**
 * The pixels an intro still fills on the canvas: styles/components/intro.css gives the image 832 by
 * 816 at most with a 1 px border, so 830 by 814 inside it. The 1x file is exactly that size, so the
 * projector draws it one to one, never resampled by a fraction of a pixel.
 */
const INTRO_BOX = { w: 830, h: 814 };
/** Slide 3's portraits show at 512 canvas px (GlassSlide.tsx); 1024 serves DPR 2. */
const PORTRAIT_WIDTHS = [512, 1024];

/**
 * Demo photos: the smallest width each one needs, twice its largest shown width in stage px
 * (measured over every step of M1, M2 and M5 at 1920 by 1080; the frame scale is 1.372). An
 * object-fit: cover box counts the covered width. M2's wall shows every trail photo at 151.4 px;
 * M1's used-to cards crop photo-03, 06 and 07 into 230.6 by 115.3. The look photo shows at
 * 883.8 px, so it keeps its size. The catalog photos are 15 to 38 KB already and stay as they are.
 */
const DEMO_MIN_WIDTH: Record<string, number> = {
  ...Object.fromEntries(Array.from({ length: 18 }, (_, i) => [`/demo-assets/trail/photo-${String(i + 1).padStart(2, "0")}.webp`, 303])),
  "/demo-assets/trail/photo-03.webp": 462,
  "/demo-assets/trail/photo-06.webp": 462,
  "/demo-assets/trail/photo-07.webp": 462,
  "/demo-assets/look/hiker-ridge.webp": 1768,
};

// --- Setup --------------------------------------------------------------------------------------

const root = process.cwd();
const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyArg = args.find((a) => a.startsWith("--only="))?.slice("--only=".length);
/** `--only` globs, comma separated: `*` within a segment, `**` across segments. */
const globRe = (g: string) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replace(/\u0000/g, ".*").replace(/\?/g, ".")}$`);
const onlyRes = onlyArg ? onlyArg.split(",").filter(Boolean).map(globRe) : null;
const only = onlyRes ? { test: (m: string) => onlyRes.some((re) => re.test(m)) } : null;

/** The part of sharp's API this script uses. */
interface SharpImage {
  resize(o: { width: number; height: number; fit: "fill"; kernel: "lanczos3" }): SharpImage;
  avif(o: { quality: number; chromaSubsampling: string; effort: number }): SharpImage;
  webp(o: { quality: number; effort: number; smartSubsample: boolean }): SharpImage;
  clone(): SharpImage;
  toBuffer(): Promise<Buffer>;
  metadata(): Promise<{ width?: number; height?: number }>;
}
// sharp comes with Next (an optional dependency), not as a dependency of the app, so neither it
// nor its types resolve from here: load it through Next's own require.
const requireApp = createRequire(path.join(root, "package.json"));
const sharp = createRequire(requireApp.resolve("next/package.json"))("sharp") as (input: string | Buffer) => SharpImage;

const manifestPath = path.join(root, MANIFEST_FILE);
const old: ImageManifest = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, "utf8")) as ImageManifest) : {};
const next: ImageManifest = {};

const recipeOf = (master: string, group: ImageGroup): string => {
  const o = OVERRIDES[master] ?? {};
  const avif = `avif q${o.avif ?? AVIF.quality} ${AVIF.chromaSubsampling} e${AVIF.effort}`;
  const webp = `webp q${o.webp ?? WEBP.quality}`;
  switch (group.id) {
    case "intro":
      return `intro ${INTRO_BOX.w}x${INTRO_BOX.h} 0.5x 1x 2x; ${avif}; ${webp}`;
    case "backgrounds":
      return `bg 1x; ${avif}`;
    case "posters":
      return `poster 1x; ${avif}`;
    case "portraits":
      return `portrait ${PORTRAIT_WIDTHS.join(" ")}; ${avif}; ${webp}`;
    case "demo-assets":
      return `in place, min width ${DEMO_MIN_WIDTH[master] ?? "none"}; webp q${DEMO_WEBP.quality}`;
  }
};

/** Writes a hashed output, refusing to change the bytes of an existing name (write-once). */
function writeOut(dir: string, stem: string, w: number, ext: "avif" | "webp", buf: Buffer): string {
  const name = `${stem}-${w}.${sha256(buf).slice(0, 8)}.${ext}`;
  const abs = path.join(root, "public", dir, name);
  if (existsSync(abs)) {
    if (sha256(readFileSync(abs)) !== sha256(buf)) throw new Error(`public/${dir}/${name} exists with other bytes; hashed files are write-once`);
  } else {
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, buf);
  }
  return `/${dir}/${name}`;
}

/** Encodes one master at the given output sizes. */
async function encode(master: string, group: ImageGroup, sizes: { w: number; h: number }[], formats: ("avif" | "webp")[]) {
  const abs = path.join(root, "public", master);
  const rel = path.relative(group.dir, master.slice(1));
  const dir = path.posix.join("opt", group.out!, path.posix.dirname(rel.split(path.sep).join("/"))).replace(/\/\.$/, "");
  const stem = path.basename(rel, path.extname(rel));
  const o = OVERRIDES[master] ?? {};
  const out: { avif: ImageVariant[]; webp: ImageVariant[] } = { avif: [], webp: [] };
  for (const s of sizes) {
    const base = sharp(abs).resize({ width: s.w, height: s.h, fit: "fill", kernel: "lanczos3" });
    if (formats.includes("avif")) out.avif.push({ w: s.w, h: s.h, src: writeOut(dir, stem, s.w, "avif", await base.clone().avif({ ...AVIF, quality: o.avif ?? AVIF.quality }).toBuffer()) });
    if (formats.includes("webp")) out.webp.push({ w: s.w, h: s.h, src: writeOut(dir, stem, s.w, "webp", await base.clone().webp({ ...WEBP, quality: o.webp ?? WEBP.quality }).toBuffer()) });
  }
  return out;
}

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

// --- Run ----------------------------------------------------------------------------------------

let encoded = 0;
let skipped = 0;
const masters = listMasters(root);
for (const { master, group } of masters) {
  const abs = path.join(root, "public", master);
  const buf = readFileSync(abs);
  const sourceHash = sha256(buf);
  const recipe = recipeOf(master, group);
  const prev = old[master];
  const fresh = prev && prev.sourceHash === sourceHash && prev.recipe === recipe && [...prev.avif, ...prev.webp].every((v) => existsSync(path.join(root, "public", v.src)));
  // --force never re-encodes a demo photo again: it has no master, so that would only lose quality.
  if ((fresh && (!force || group.id === "demo-assets")) || (only && !only.test(master))) {
    if (prev) next[master] = prev;
    skipped++;
    continue;
  }
  const meta = await sharp(buf).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  let entry: ImageEntry;
  if (group.id === "demo-assets") {
    // Same name, format and exact ratio: the smallest integer size on the ratio's lattice that is
    // at least the minimum width, or the same size at the demo quality.
    const min = DEMO_MIN_WIDTH[master];
    if (min === undefined) {
      next[master] = { w: W, h: H, sourceHash, recipe, inPlace: true, avif: [], webp: [] };
      skipped++;
      continue;
    }
    const g = gcd(W, H);
    const k = Math.ceil(min / (W / g));
    const size = k * (W / g) < W ? { w: k * (W / g), h: k * (H / g) } : { w: W, h: H };
    const outBuf = await sharp(buf).resize({ width: size.w, height: size.h, fit: "fill", kernel: "lanczos3" }).webp(DEMO_WEBP).toBuffer();
    // Worth a generation of loss only when it saves a fifth or more.
    const keep = outBuf.length > buf.length * 0.8;
    if (!keep) writeFileSync(abs, outBuf);
    const now = keep ? buf : outBuf;
    const m2 = await sharp(now).metadata();
    if (m2.width! * H !== m2.height! * W) throw new Error(`${master}: ratio changed (${W}x${H} to ${m2.width}x${m2.height})`);
    console.log(`  ${master}: ${W}x${H} ${(buf.length / 1024).toFixed(0)} KB -> ${m2.width}x${m2.height} ${(now.length / 1024).toFixed(0)} KB`);
    next[master] = { w: m2.width!, h: m2.height!, sourceHash: sha256(now), recipe, inPlace: true, avif: [], webp: [] };
    encoded++;
    continue;
  }
  if (group.id === "intro") {
    // The still keeps its frame's aspect inside the box (intro.css); outputs match it at 1x, so
    // the projector (DPR 1) draws the 1x file one to one, and at 0.5x and 2x.
    const scale = Math.min(INTRO_BOX.w / W, INTRO_BOX.h / H);
    const display = { w: Math.round(W * scale), h: Math.round(H * scale) };
    const sizes = [0.5, 1, 2]
      .map((f) => Math.min(W, Math.round(display.w * f)))
      .filter((w, i, a) => a.indexOf(w) === i)
      .map((w) => ({ w, h: Math.round((w * H) / W) }));
    entry = { w: W, h: H, sourceHash, recipe, display, ...(await encode(master, group, sizes, ["avif", "webp"])) };
  } else if (group.id === "portraits") {
    const sizes = PORTRAIT_WIDTHS.filter((w) => w <= W).map((w) => ({ w, h: Math.round((w * H) / W) }));
    entry = { w: W, h: H, sourceHash, recipe, ...(await encode(master, group, sizes, ["avif", "webp"])) };
  } else {
    // Backgrounds (1920 by 1080, the grain one to one with stage px) and posters: AVIF at the master's size.
    entry = { w: W, h: H, sourceHash, recipe, ...(await encode(master, group, [{ w: W, h: H }], ["avif"])) };
  }
  next[master] = entry;
  encoded++;
  const bytes = [...entry.avif, ...entry.webp].map((v) => `${v.src.split(".").pop()} ${v.w} ${(readFileSync(path.join(root, "public", v.src)).length / 1024).toFixed(0)} KB`).join(", ");
  console.log(`  ${master} (${(buf.length / 1024).toFixed(0)} KB): ${bytes}`);
}

// Sorted keys, so the manifest diff shows only what changed.
const sorted = Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
mkdirSync(path.dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(sorted, null, 1)}\n`);

// Delete what no entry names any more (an older encode of a re-captured master).
const named = new Set(Object.values(next).flatMap((e) => [...e.avif, ...e.webp].map((v) => v.src)));
let pruned = 0;
for (const rel of walkFiles(path.join(root, "public", "opt"))) {
  if (!named.has(`/opt/${rel}`)) {
    rmSync(path.join(root, "public", "opt", rel));
    pruned++;
  }
}
console.log(`images: ${encoded} encoded, ${skipped} unchanged, ${pruned} old file(s) removed; ${Object.keys(next).length} entries in ${MANIFEST_FILE}`);

// The frames' backgrounds.css names the background AVIFs (pnpm theme:sync), and assetExists()
// answers from the build-time file list (scripts/asset-versions.mts): keep both in step.
execFileSync(process.execPath, ["--import", "tsx", "scripts/theme.mts", "sync"], { cwd: root, stdio: "inherit" });
if (existsSync(path.join(root, "scripts", "asset-versions.mts"))) execFileSync(process.execPath, ["--import", "tsx", "scripts/asset-versions.mts"], { cwd: root, stdio: "inherit" });

