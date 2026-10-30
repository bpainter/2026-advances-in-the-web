/**
 * `pnpm perf headers`: `cache-control`, `x-vercel-cache` and `x-vercel-id` for one URL per header
 * rule, on the origin that loads it (docs/PRD-perf.md 9.2, P0-5, P1-CACHE, P1-FRAMEFILES). Each
 * URL is fetched twice; the second fetch shows whether the CDN kept it. A row whose
 * `cache-control` differs from the rule is marked, and the run exits non-zero.
 *
 *   pnpm perf headers [--origin=<presenter>] [--demo=<demo origin>] [--dev]
 *
 * `--dev` expects `pnpm dev`'s headers (no caching rules) and only reports.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { origins, parseArgs, table, writeResult } from "./lib.mts";

const YEAR = "public, max-age=31536000, immutable";
const HOUR = "public, max-age=3600, stale-while-revalidate=86400";
const PAGE = "public, max-age=0, must-revalidate";
/** What `next start` sends where Vercel sends PAGE: a prerendered page, a public file Next does not cache. */
const START_PAGE = "s-maxage=31536000";
const START_PUBLIC = "public, max-age=0";
const BUILD_FILE = "public, max-age=300, stale-while-revalidate=86400";
const NO_STORE = "no-store";

interface Probe {
  cls: string;
  origin: "presenter" | "demo";
  path: string;
  expect: string | string[] | null;
  headers?: Record<string, string>;
  why: string;
}

/** The first file under public/<dir> (recursive), as a URL path, or null. */
function firstPublic(dir: string, ext = /\.(png|jpe?g|webp|avif|svg|css|js|otf|ttf|woff2)$/): string | null {
  const abs = path.join(process.cwd(), "public", dir);
  if (!existsSync(abs)) return null;
  const stack = [abs];
  while (stack.length) {
    const d = stack.shift()!;
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (ext.test(e.name)) return "/" + path.relative(path.join(process.cwd(), "public"), p).split(path.sep).join("/");
    }
  }
  return null;
}

function versions(): Record<string, string> {
  const f = path.join(process.cwd(), "content", ".generated", "asset-versions.json");
  return existsSync(f) ? (JSON.parse(readFileSync(f, "utf8")) as Record<string, string>) : {};
}

function probes(): Probe[] {
  const v = versions();
  const withV = (p: string) => (v[p] ? `${p}?v=${v[p]}` : null);
  const out: Probe[] = [];
  const add = (cls: string, origin: Probe["origin"], p: string | null, expect: Probe["expect"], why: string, headers?: Record<string, string>) => {
    if (p) out.push({ cls, origin, path: p, expect, why, headers });
  };
  add("Versioned background", "presenter", firstPublic("backgrounds/v5"), YEAR, "folder-versioned (v5)");
  add("Versioned background", "demo", firstPublic("backgrounds/v5"), YEAR, "frames load it on the demo origin");
  add("Content-hashed image", "presenter", firstPublic("opt"), YEAR, "content hash in the name (pnpm images)");
  add("Versioned font", "presenter", firstPublic("fonts/v2"), YEAR, "folder-versioned (v2)");
  for (const dir of ["intro", "posters", "images", "people", "logos", "demo-assets", "qr"]) add(`Unversioned /${dir}`, "presenter", firstPublic(dir), HOUR, "name never changes; an hour, then served stale while it rechecks");
  add("Unversioned /fonts", "presenter", firstPublic("fonts", /\.(otf|ttf|woff2)$/), HOUR, "unversioned masters");
  add("Unversioned /fonts", "demo", firstPublic("fonts", /\.(otf|ttf|woff2)$/), HOUR, "frames load fonts on the demo origin");
  add("Unversioned /theme", "presenter", "/theme/grain.png", HOUR, "the presenter's CSS names grain.png");
  for (const p of ["/theme/portal-glass.css", "/runtime/demo-runtime.js", "/wrappers/base.css", "/portal/01-layered-ui.css"]) {
    add(`Unversioned /${p.split("/")[1]}`, "demo", p, HOUR, "same file without ?v (development, shown links)");
    add(`Versioned /${p.split("/")[1]} (?v=)`, "demo", withV(p), YEAR, "?v=<content hash> written by the frame shell");
  }
  add("Open Graph image", "presenter", "/og/cover.jpg", [PAGE, START_PUBLIC], "unchanged; ?v= on the meta tag busts social caches");
  add("Prerendered HTML", "presenter", "/", [PAGE, START_PAGE], "a deploy shows on the next load");
  add("Prerendered HTML", "presenter", "/s/title", [PAGE, START_PAGE], "a deploy shows on the next load");
  add("RSC payload", "presenter", "/s/title?_rsc", [PAGE, START_PAGE], "same as its page", { RSC: "1" });
  add("Audience window", "presenter", "/present?s=d4-now", [PAGE, START_PAGE], "prerendered per slide behind a rewrite (P1-PRERENDER)");
  add("Audience window RSC", "presenter", "/present?s=d4-now&_rsc", [PAGE, START_PAGE], "client moves and prefetches hit the same prerender", { RSC: "1" });
  add("Speaker window", "presenter", "/speaker?s=d4-now", [PAGE, START_PAGE], "prerendered per slide behind a rewrite (P1-PRERENDER)");
  add("Speaker window RSC", "presenter", "/speaker?s=d4-now&_rsc", [PAGE, START_PAGE], "client moves and prefetches hit the same prerender", { RSC: "1" });
  add("Health", "presenter", "/_health", [PAGE, START_PAGE], "names the build");
  add("Frame document", "demo", "/demos/01-layered-ui/native/index.html?bg=d1", NO_STORE, "depends on flags, host, CSP");
  add("Frame document", "demo", "/orders", NO_STORE, "D4's native list, a composed document");
  add("Frame build file", "demo", "/demos/01-layered-ui/native/app.js", BUILD_FILE, "fixed per deployment; CDN keeps it (Vercel-CDN-Cache-Control)");
  add("Frame build file", "demo", "/app.css", BUILD_FILE, "D4's root-level build file");
  add("Frame build file", "demo", "/demo/log.js", BUILD_FILE, "D4's instrumentation");
  add("Frame build file", "demo", "/demo/console.js", BUILD_FILE, "D5's instrumentation");
  add("Frame build file", "demo", "/vendor/purify.es.mjs", BUILD_FILE, "D5's vendored DOMPurify");
  add("Frame build file", "demo", "/demos/12-anchor-hotspots/native/hiker-ridge.webp", BUILD_FILE, "M1's photo, served beside the document");
  add("Frame state", "demo", "/cms/ridgeline.json", NO_STORE, "D5's CMS response");
  return out;
}

async function get(url: string, headers: Record<string, string> = {}): Promise<{ status: number; h: Headers; ms: number }> {
  const t0 = performance.now();
  const res = await fetch(url, { headers: { "accept-encoding": "br, gzip", ...headers }, redirect: "manual" });
  await res.arrayBuffer();
  return { status: res.status, h: res.headers, ms: Math.round(performance.now() - t0) };
}

export async function run(argv: string[]): Promise<void> {
  const { opt, flag } = parseArgs(argv);
  const { P, D } = origins(opt);
  const dev = flag("dev");
  const rows: (string | number | null)[][] = [];
  const raw: unknown[] = [];
  let bad = 0;
  for (const p of probes()) {
    const base = p.origin === "presenter" ? P : D;
    try {
      await get(base + p.path, p.headers);
      const r = await get(base + p.path, p.headers);
      const cc = r.h.get("cache-control") ?? "";
      const expected = p.expect == null ? null : Array.isArray(p.expect) ? p.expect : [p.expect];
      const ok = dev || !expected || (r.status < 400 && expected.includes(cc));
      if (!ok) bad++;
      const cdn = r.h.get("vercel-cdn-cache-control") ?? r.h.get("cdn-cache-control");
      raw.push({ ...p, url: base + p.path, status: r.status, cacheControl: cc, cdn, vercelCache: r.h.get("x-vercel-cache"), vercelId: r.h.get("x-vercel-id"), age: r.h.get("age"), ms: r.ms, ok });
      rows.push([ok ? "ok" : "✖", p.cls, p.origin, p.path + (p.headers?.RSC ? " (RSC)" : ""), r.status, cc, r.h.get("x-vercel-cache"), r.h.get("x-vercel-id")?.split("::").slice(0, -1).join("::") ?? null, p.why]);
    } catch (e) {
      bad++;
      rows.push(["✖", p.cls, p.origin, p.path, "error", String(e), null, null, p.why]);
    }
  }
  const file = writeResult("headers", { task: "headers", origin: P, demo: D, rows: raw });
  console.log(table(["", "Class", "Origin", "Path", "Status", "cache-control", "x-vercel-cache", "x-vercel-id", "Why"], rows));
  console.log(`\npresenter ${P}, demo ${D}\nwrote ${file}`);
  if (bad && !dev) {
    console.log(`\n${bad} row(s) differ from the rules (docs/deploy.md, "Caching")`);
    process.exitCode = 1;
  }
}
