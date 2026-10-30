import "server-only";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import manifestJson from "@/content/.generated/images.json";
import { BACKGROUNDS, type BackgroundId } from "@/content/backgrounds";

/**
 * Every image URL the app renders comes from here (docs/PRD-perf.md, P1-IMG). `pnpm images`
 * (scripts/images.mts) encodes the masters under public/ into content-hashed files under
 * public/opt/ and writes content/.generated/images.json, keyed by master path. Pages never link a
 * master once it has an entry: when a master has none (a capture that has not been through
 * `pnpm images` yet), the functions below fall back to the master, so nothing goes blank, and
 * `pnpm check` says "Images changed; run pnpm images".
 */

export interface ImageVariant {
  w: number;
  h: number;
  src: string;
}

export interface ImageEntry {
  /** The master's size. */
  w: number;
  h: number;
  /** SHA-256 of the master's bytes when it was encoded. */
  sourceHash: string;
  /** The encode settings, so a change in scripts/images.mts re-encodes. */
  recipe: string;
  /** Intro stills: the box the still fills on the 1920 by 1080 canvas (at most 832 by 816). */
  display?: { w: number; h: number };
  /** public/demo-assets: re-encoded in place, so the entry records the file as it is now. */
  inPlace?: boolean;
  avif: ImageVariant[];
  webp: ImageVariant[];
}

export type ImageManifest = Record<string, ImageEntry>;

const MANIFEST = manifestJson as unknown as ImageManifest;

/** The manifest entry of a master path such as "/intro/d1-order-actions.png". */
export function imageEntry(master: string): ImageEntry | undefined {
  return Object.prototype.hasOwnProperty.call(MANIFEST, master) ? MANIFEST[master] : undefined;
}

// --- Which files exist ---------------------------------------------------------------------------

const LIST_FILE = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", ".generated", "public-files.json");
let listed: { mtime: number; files: Set<string> } | null = null;

/** content/.generated/public-files.json (scripts/asset-versions.mts), re-read when it changes in development. */
function publicFiles(): Set<string> | null {
  if (listed && process.env.NODE_ENV === "production") return listed.files;
  try {
    const mtime = statSync(LIST_FILE).mtimeMs;
    if (!listed || listed.mtime !== mtime) listed = { mtime, files: new Set(JSON.parse(readFileSync(LIST_FILE, "utf8")) as string[]) };
    return listed.files;
  } catch {
    return null;
  }
}

/**
 * Whether a file under public/intro, public/posters, public/images or public/opt exists, from the
 * build-time list (written in prebuild and predev), so the page functions need not carry the
 * images (P1-FUNC). In development a path the list does not have (a capture since `pnpm dev`
 * started) is checked on disk; production answers from the list alone.
 */
export function assetExists(publicPath: string | null | undefined): publicPath is string {
  if (!publicPath || !publicPath.startsWith("/")) return false;
  const files = publicFiles();
  if (files?.has(publicPath)) return true;
  // Production never touches public/ on disk: the functions do not carry it (next.config.ts).
  if (process.env.NODE_ENV === "production") return false;
  return existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), "public", publicPath));
}

// --- Intro stills -------------------------------------------------------------------------------

export interface IntroImage {
  /** The <img> fallback: the WebP at the display width, else the master. */
  src: string;
  /** The display box on the canvas, so the slot is reserved before the still loads (no CLS). */
  width: number | undefined;
  height: number | undefined;
  avifSrcSet: string;
  webpSrcSet: string;
  /** Matches the display width, so a DPR 1 projector picks the 1x file and draws it 1:1. */
  sizes: string;
  /** The file a 1920 by 1080, DPR 1 window picks from the srcset: what the stage decodes ahead. */
  decodeUrl: string;
}

const srcSet = (v: ImageVariant[]) => v.map((x) => `${x.src} ${x.w}w`).join(", ");
/** The variant at a width, else the smallest one wider, else the widest. */
const at = (v: ImageVariant[], w: number) => v.find((x) => x.w === w) ?? v.find((x) => x.w > w) ?? v[v.length - 1];

/** An intro still (`IntroPage.visual.src`), or null when the master is missing. */
export function introImage(master: string): IntroImage | null {
  const e = imageEntry(master);
  if (!e || !e.avif.length) {
    if (!assetExists(master)) return null;
    return { src: master, width: undefined, height: undefined, avifSrcSet: "", webpSrcSet: "", sizes: "", decodeUrl: master };
  }
  const d = e.display ?? { w: e.w, h: e.h };
  const avif1x = at(e.avif, d.w);
  const webp1x = e.webp.length ? at(e.webp, d.w) : null;
  return {
    src: webp1x?.src ?? avif1x.src,
    width: d.w,
    height: d.h,
    avifSrcSet: srcSet(e.avif),
    webpSrcSet: srcSet(e.webp),
    // The stage canvas is 1920 wide and scales with the window (stage.css).
    sizes: `(min-width: 1920px) ${d.w}px, ${+((d.w / 1920) * 100).toFixed(2)}vw`,
    decodeUrl: avif1x.src,
  };
}

// --- Posters ------------------------------------------------------------------------------------

/** The AVIF of a master poster path (public/posters/**), else the master. */
export function posterSrc(master: string): string {
  return imageEntry(master)?.avif[0]?.src ?? master;
}

/** The first candidate poster that exists (authored, captured, frame), as `posterSrc`, or null. */
export function firstPoster(...candidates: (string | null | undefined)[]): string | null {
  const found = candidates.find((c) => assetExists(c));
  return found ? posterSrc(found) : null;
}

// --- Backgrounds --------------------------------------------------------------------------------

export interface BackgroundImage {
  /** The JPEG master under /backgrounds/v5/, the plain URL. */
  url: string;
  /** The AVIF every stage and reader browser decodes, at 1920 by 1080 like the master. */
  decodeUrl: string;
  /** `image-set(AVIF, JPEG)` for `--slide-bg-image` and `--glass-frame-image`. */
  css: string;
}

export function backgroundImage(id: BackgroundId): BackgroundImage {
  const url = `/backgrounds/v5/${BACKGROUNDS[id].file}`;
  const avif = imageEntry(url)?.avif[0]?.src;
  return {
    url,
    decodeUrl: avif ?? url,
    css: avif ? `image-set(url("${avif}") type("image/avif"), url("${url}") type("image/jpeg"))` : `url("${url}")`,
  };
}

// --- Pictures (slide 3's portraits) -------------------------------------------------------------

export interface PictureSources {
  /** <source> elements, in order. */
  sources: { type: string; srcSet: string }[];
  /** The <img>: the WebP 1x (else the master) and its srcset. */
  src: string;
  srcSet: string | undefined;
  sizes: string | undefined;
}

/** A <picture> for a master shown at `displayWidth` canvas px (512 for the portraits). */
export function pictureSources(master: string, displayWidth = 512): PictureSources {
  const e = imageEntry(master);
  if (!e || !e.avif.length) return { sources: [], src: master, srcSet: undefined, sizes: undefined };
  const sizes = `(min-width: 1920px) ${displayWidth}px, ${+((displayWidth / 1920) * 100).toFixed(2)}vw`;
  return {
    sources: [{ type: "image/avif", srcSet: srcSet(e.avif) }],
    src: e.webp.length ? at(e.webp, displayWidth).src : at(e.avif, displayWidth).src,
    srcSet: e.webp.length ? srcSet(e.webp) : undefined,
    sizes,
  };
}
