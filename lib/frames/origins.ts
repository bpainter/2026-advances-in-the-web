/**
 * The presenter and the demo frames run on different origins so neither can read the other
 * (PRD Part A, 8.1): offline they are one `next` process answering on `localhost:3000` (presenter)
 * and `127.0.0.1:3000` (demo). Framework frames resolve `/framework/` and `/framework-today/`
 * route prefixes to their own apps.
 */
export const PRESENTER_ORIGIN = process.env.NEXT_PUBLIC_PRESENTER_ORIGIN ?? "http://localhost:3000";
export const DEMO_ORIGIN = process.env.NEXT_PUBLIC_DEMO_ORIGIN ?? "http://127.0.0.1:3000";
export const FRAMEWORK_ORIGIN = process.env.NEXT_PUBLIC_FRAMEWORK_ORIGIN ?? "http://localhost:3106";
export const FRAMEWORK_TODAY_ORIGIN = process.env.NEXT_PUBLIC_FRAMEWORK_TODAY_ORIGIN ?? "http://localhost:3107";

/** Absolute URL of a `Frame.route` on the origin that serves it. */
export function frameUrl(route: string): { origin: string; url: string } {
  if (route.startsWith("/framework-today/")) return { origin: FRAMEWORK_TODAY_ORIGIN, url: `${FRAMEWORK_TODAY_ORIGIN}${route.slice("/framework-today".length)}` };
  if (route.startsWith("/framework/")) return { origin: FRAMEWORK_ORIGIN, url: `${FRAMEWORK_ORIGIN}${route.slice("/framework".length)}` };
  return { origin: DEMO_ORIGIN, url: `${DEMO_ORIGIN}${route}` };
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
