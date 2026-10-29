/**
 * The presenter and the demo frames run on different origins so neither can read the other
 * (PRD Part A, 8.1): offline they are one `next` process answering on `localhost:3000` (presenter)
 * and `127.0.0.1:3000` (demo); deployed they are two domains of one Vercel project
 * (docs/deploy.md). Framework frames resolve `/framework/` and `/framework-today/` route prefixes
 * to their own apps. These are NEXT_PUBLIC_ values, inlined at build time.
 */
export const PRESENTER_ORIGIN = process.env.NEXT_PUBLIC_PRESENTER_ORIGIN ?? "http://localhost:3000";
export const DEMO_ORIGIN = process.env.NEXT_PUBLIC_DEMO_ORIGIN ?? "http://127.0.0.1:3000";
/**
 * The F2 apps default to their local ports only while the presenter itself is local. A deployed
 * presenter without NEXT_PUBLIC_FRAMEWORK_ORIGIN and NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN never
 * points a visitor's browser at localhost: the origin is empty and the F2 pages show their
 * captured posters instead of a live frame (`frameLive`). An empty value turns a frame off anywhere.
 */
const LOCAL_PRESENTER = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(PRESENTER_ORIGIN);
export const FRAMEWORK_ORIGIN = process.env.NEXT_PUBLIC_FRAMEWORK_ORIGIN ?? (LOCAL_PRESENTER ? "http://localhost:3106" : "");
export const FRAMEWORK_TODAY_ORIGIN = process.env.NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN ?? (LOCAL_PRESENTER ? "http://localhost:3107" : "");

/** Absolute URL of a `Frame.route` on the origin that serves it. */
export function frameUrl(route: string): { origin: string; url: string } {
  if (route.startsWith("/framework-today/")) return { origin: FRAMEWORK_TODAY_ORIGIN, url: `${FRAMEWORK_TODAY_ORIGIN}${route.slice("/framework-today".length)}` };
  if (route.startsWith("/framework/")) return { origin: FRAMEWORK_ORIGIN, url: `${FRAMEWORK_ORIGIN}${route.slice("/framework".length)}` };
  return { origin: DEMO_ORIGIN, url: `${DEMO_ORIGIN}${route}` };
}

/** False when the route's origin is not configured (an F2 app that is not deployed). */
export function frameLive(route: string): boolean {
  return frameUrl(route).origin !== "";
}

/**
 * The query of a frame document: `?flags=` and, on demo-origin frames, `bg=<section background>`
 * (PRD v5, 4.2). Framework frames get no `bg`: their apps write their own data-section-bg.
 */
export function frameQuery(route: string, flags: Record<string, boolean> | undefined, bg?: string): string {
  const parts: string[] = [];
  const q = flagsQuery(flags);
  if (q) parts.push(`flags=${q}`);
  if (bg && !route.startsWith("/framework")) parts.push(`bg=${encodeURIComponent(bg)}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** Flags as the `?flags=` query the frame routes read (`enhance-css:0,enhance-js:1`). */
export function flagsQuery(flags: Record<string, boolean> | undefined): string {
  const entries = Object.entries(flags ?? {});
  return entries.length ? entries.map(([k, v]) => `${k}:${v ? 1 : 0}`).join(",") : "";
}

export function parseFlags(query: string | null): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const pair of (query ?? "").split(",")) {
    const [k, v] = pair.split(":");
    if (k) out[k] = v !== "0";
  }
  return out;
}

/** Adds `glass: false` when the presenter window runs with ?glass=off (components/presenter/GlassMode.tsx). */
export function glassFlags(flags: Record<string, boolean>): Record<string, boolean> {
  if (typeof document === "undefined") return flags;
  const out = { ...flags };
  if (document.documentElement.dataset.glass === "off") out.glass = false;
  if (document.documentElement.dataset.capture === "1") out.capture = true;
  return out;
}
