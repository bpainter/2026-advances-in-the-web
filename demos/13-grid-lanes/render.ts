import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/** One customer photo of fixtures/trail-photos.json (still-in-motion-demos.md 3.6). */
export interface TrailPhoto {
  file: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  name: string;
}
export interface TrailPhotos {
  product: string;
  dir: string;
  first: number;
  photos: TrailPhoto[];
}

export const trailPhotos = (): TrailPhotos => JSON.parse(readFileSync(path.join(process.cwd(), "fixtures", "trail-photos.json"), "utf8")) as TrailPhotos;

const esc = (v: string | number) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The placeholder both builds' index.html leave for the server-rendered photos. */
export const WALL_SLOT = "<!-- 12 photos from the server -->";

/**
 * One photo with its quote. `held` (the used-to build only) keeps the source in `data-held-src`
 * until the `loadPhotos` hook releases it, the stand-in for a slow network that lets the room see
 * the stack before the script lays it out (spec 5, used-to). The native build gets real sources
 * and the photo's own width and height, so the browser knows each shape before it loads.
 */
export function figure(p: TrailPhoto, dir: string, opts: { held?: boolean; sized?: boolean } = {}): string {
  // A held photo keeps its shape as a placeholder (review r6 motion M5), so the unplaced stack reads
  // as photos still loading; loadPhotos drops the style with the hold.
  const src = opts.held ? `data-held-src="${esc(dir + p.file)}" style="aspect-ratio: ${p.width} / ${p.height}"` : `src="${esc(dir + p.file)}"`;
  const size = opts.sized ? ` width="${p.width}" height="${p.height}"` : "";
  return `<figure><img ${src} alt="${esc(p.alt)}"${size}><figcaption><q>${esc(p.caption)}</q> <span>${esc(p.name)}</span></figcaption></figure>`;
}

/** The page's first photos in place of the placeholder, indented like the shown markup. */
export function fillWall(html: string, opts: { held?: boolean; sized?: boolean }): string {
  const data = trailPhotos();
  if (!html.includes(WALL_SLOT)) throw new Error(`no ${WALL_SLOT} in the wall template`);
  const items = data.photos.slice(0, data.first).map((p) => figure(p, data.dir, opts));
  return html.replace(WALL_SLOT, items.join("\n    "));
}

/** The `Show more` fragment: up to six photos from `from`, as HTML. */
export function morePhotos(from: number, opts: { sized?: boolean }): string {
  const data = trailPhotos();
  const start = Number.isFinite(from) && from >= 0 ? from : data.first;
  return data.photos
    .slice(start, start + 6)
    .map((p) => figure(p, data.dir, opts))
    .join("\n");
}
