/**
 * Talk-day warm-up (docs/PRD-perf.md, P0-6; docs/deploy.md, "Talk day"). Run it from the talk
 * laptop on the venue Wi-Fi. It warms the CDN PoP the room uses and the functions, proves the
 * deployed build, and doubles as a Wi-Fi check. It cannot warm the browser: the checklist's warm
 * walk (Shift+ArrowRight through the deck) does that.
 *
 *   pnpm warmup [--origin=<presenter>] [--demo=<demo origin>] [--expect=<sha>] [--concurrency=6]
 *
 * 1. GET /_health; fail if its build differs from --expect (default `git rev-parse --short HEAD`).
 * 2. GET /, every /s/<id>, /present?s=<first> and /speaker?s=<first>.
 * 3. Every framed page's frame document at its s0 URL, built as PageFrame builds it, and every
 *    script, stylesheet and image that document references.
 * 4. Every image, font and theme file the pages and their stylesheets reference, on the origin
 *    that loads it (backgrounds and fonts on both).
 *
 * Prints count, failures, median and p95 TTFB, bytes and effective Mbit/s per class. Exits
 * non-zero on any 4xx or 5xx, a network error, or a build mismatch.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { frameLive, frameQuery } from "@/lib/frames/origins";
import { flagsAt } from "@/lib/engine/steps";
import { hasFrame } from "@/content/demo-schema";
import { sections, slides } from "@/lib/content";
import { median, origins, parseArgs, percentile, table } from "./perf/lib.mts";

type Cls = "health" | "page" | "frame document" | "frame file" | "image" | "font" | "css" | "script" | "other";

interface Hit {
  cls: Cls;
  url: string;
  status: number | "error";
  ttfb: number;
  total: number;
  bytes: number;
  vercelCache: string | null;
  body?: string;
}

const { opt } = parseArgs(process.argv.slice(2));
const { P, D } = origins(opt);
const concurrency = Number(opt("concurrency") ?? 6);
const expect = opt("expect") ?? (() => {
  try {
    return execSync("git rev-parse --short=7 HEAD", { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
})();

/** Root-relative public files a document or stylesheet names, in markup, CSS or RSC data. */
const ASSET = /(?:\/(?:backgrounds|intro|posters|images|people|logos|fonts|qr|theme|runtime|wrappers|portal|opt|og|demo-assets)\/[\w./%-]+?\.(?:png|jpe?g|webp|avif|svg|gif|otf|ttf|woff2?|css|js)(?:\?v=[0-9a-f]+)?)(?=["')\s\\,&]|$)/g;
/** `src` and `href` values of a frame document (relative files resolve against it). */
const REF = /<(?:script|link|img|source)\b[^>]*?\b(?:src|href)="([^"]+)"/g;

function classify(url: string): Cls {
  const p = new URL(url).pathname;
  if (/\.(png|jpe?g|webp|avif|svg|gif)$/.test(p)) return "image";
  if (/\.(otf|ttf|woff2?)$/.test(p)) return "font";
  if (/\.css$/.test(p)) return "css";
  if (/\.m?js$/.test(p)) return "script";
  return "other";
}

async function get(cls: Cls, url: string, keepBody: boolean): Promise<Hit> {
  const t0 = performance.now();
  try {
    const res = await fetch(url, { headers: { "accept-encoding": "br, gzip" }, redirect: "follow" });
    const ttfb = performance.now() - t0;
    const buf = Buffer.from(await res.arrayBuffer());
    const total = performance.now() - t0;
    const length = Number(res.headers.get("content-length") ?? buf.length);
    return { cls, url, status: res.status, ttfb, total, bytes: length, vercelCache: res.headers.get("x-vercel-cache"), body: keepBody ? buf.toString("utf8") : undefined };
  } catch {
    return { cls, url, status: "error", ttfb: performance.now() - t0, total: performance.now() - t0, bytes: 0, vercelCache: null };
  }
}

/** Runs the jobs with at most `concurrency` in flight. */
async function pool<T>(jobs: (() => Promise<T>)[]): Promise<T[]> {
  const out: T[] = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, jobs.length) }, async () => {
      while (next < jobs.length) {
        const i = next++;
        out[i] = await jobs[i]();
      }
    }),
  );
  return out;
}

const hits: Hit[] = [];
const seen = new Set<string>();
const started = performance.now();

/** Fetches URLs not fetched yet; returns the hits (with bodies for text when asked). */
async function fetchAll(entries: { cls: Cls; url: string; body?: boolean }[]): Promise<Hit[]> {
  const fresh = entries.filter((e) => !seen.has(e.url) && seen.add(e.url));
  const got = await pool(fresh.map((e) => () => get(e.cls, e.url, Boolean(e.body))));
  hits.push(...got);
  return got;
}

/**
 * Public files named in a text body, absolute on `origin`. The RSC data also names files a page
 * only links when they exist (a frame's `poster`), so a name with no file in this checkout's
 * public/ is skipped: run the warm-up from the commit you deployed (the build check says so).
 */
let skipped = 0;
function assetsIn(text: string, origin: string): string[] {
  const names = [...new Set([...text.matchAll(ASSET)].map((m) => m[0].replace(/\\u0026/g, "&")))];
  const present = names.filter((n) => existsSync(path.join(process.cwd(), "public", decodeURIComponent(n.split("?")[0]))));
  skipped += names.length - present.length;
  return present.map((n) => origin + n);
}

/** Files a stylesheet loads with url(), resolved against it. */
function cssUrls(css: string, base: string): string[] {
  return [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]).filter((u) => !u.startsWith("data:")).map((u) => new URL(u, base).href);
}

// 1. Health and build.
const [health] = await fetchAll([{ cls: "health", url: `${P}/_health`, body: true }]);
let build: string | null = null;
try {
  build = (JSON.parse(health.body ?? "{}") as { build?: string }).build ?? null;
} catch {
  build = null;
}
const buildOk = !expect || build === expect;

// 2. Pages.
const first = slides[0].id;
const pages = await fetchAll([`${P}/`, ...slides.map((s) => `${P}/s/${s.id}`), `${P}/present?s=${first}`, `${P}/speaker?s=${first}`].map((url) => ({ cls: "page" as const, url, body: true })));

// 3. Frame documents at s0, as PageFrame builds them (glass on, no capture), and their files.
const frameDocs: { cls: Cls; url: string; body: boolean }[] = [];
for (const section of sections)
  for (const page of section.pages) {
    if (!hasFrame(page)) continue;
    const route = page.frame?.route;
    // F2's apps are not deployed (docs/deploy.md); its pages show posters, which step 4 warms.
    if (!route || !frameLive(route) || route.startsWith("/framework")) continue;
    const path = route.endsWith("/") ? `${route}index.html` : route.includes(".") ? route : `${route}/index.html`;
    frameDocs.push({ cls: "frame document", url: `${D}${path}${frameQuery(route, flagsAt(page, 0), section.background)}`, body: true });
  }
const docs = await fetchAll(frameDocs);
const docFiles: { cls: Cls; url: string; body?: boolean }[] = [];
for (const d of docs) {
  if (!d.body) continue;
  for (const m of d.body.matchAll(REF)) {
    const href = m[1];
    if (/^(data:|https?:\/\/(?!127\.0\.0\.1|localhost))/.test(href) && !href.startsWith(D)) continue;
    const url = new URL(href, d.url).href;
    if (!url.startsWith(D)) continue;
    const pathname = new URL(url).pathname;
    const isPublic = /^\/(theme|runtime|wrappers|portal|fonts|backgrounds|demo-assets|opt)\//.test(pathname);
    docFiles.push({ cls: isPublic ? classify(url) : "frame file", url, body: pathname.endsWith(".css") });
  }
}
const files = await fetchAll(docFiles);

// 4. Assets the pages and every stylesheet reference, on the origin that loads them.
const pageAssets = pages.flatMap((p) => (p.body ? assetsIn(p.body, P) : []));
// The app's own chunks and stylesheets (content-hashed, immutable): a cold PoP fetches them once.
const nextStatic = [...new Set(pages.flatMap((p) => [...(p.body ?? "").matchAll(/(?:href|src)="(\/_next\/static\/[^"]+\.(?:css|js))"/g)].map((m) => P + m[1])))];
const assets = await fetchAll([...pageAssets, ...nextStatic].map((url) => ({ cls: classify(url), url, body: url.endsWith(".css") })));
const css = [...files, ...assets].filter((h) => h.cls === "css" && h.body);
await fetchAll(css.flatMap((h) => cssUrls(h.body!, h.url)).map((url) => ({ cls: classify(url), url })));

// Report.
const wall = (performance.now() - started) / 1000;
const failed = hits.filter((h) => h.status === "error" || h.status >= 400);
const classes: Cls[] = ["health", "page", "frame document", "frame file", "css", "script", "font", "image", "other"];
const rows = classes
  .map((cls) => {
    const sel = hits.filter((h) => h.cls === cls);
    if (!sel.length) return null;
    const bytes = sel.reduce((n, h) => n + h.bytes, 0);
    const transfer = sel.reduce((n, h) => n + Math.max(1, h.total - h.ttfb), 0) / 1000;
    const hitsCdn = sel.filter((h) => h.vercelCache === "HIT" || h.vercelCache === "PRERENDER" || h.vercelCache === "STALE").length;
    return [cls, sel.length, sel.filter((h) => h.status === "error" || h.status >= 400).length, Math.round(median(sel.map((h) => h.ttfb)) ?? 0), Math.round(percentile(sel.map((h) => h.ttfb), 0.95) ?? 0), Math.round(bytes / 1024), ((bytes * 8) / 1e6 / transfer).toFixed(1), hitsCdn];
  })
  .filter((r): r is (string | number)[] => r !== null);
console.log(table(["Class", "Count", "Failures", "TTFB median (ms)", "TTFB p95 (ms)", "KB", "Mbit/s", "CDN hits"], rows));
const totalBytes = hits.reduce((n, h) => n + h.bytes, 0);
console.log(`\n${hits.length} requests, ${(totalBytes / 1024 / 1024).toFixed(1)} MB in ${wall.toFixed(1)} s (${((totalBytes * 8) / 1e6 / wall).toFixed(1)} Mbit/s overall), presenter ${P}, demo ${D}`);
if (skipped) console.log(`${skipped} file name(s) in page data with no file in public/ (unlinked candidates) skipped`);
console.log(`Build: ${build ?? "unknown"}${expect ? ` (expected ${expect})` : ""}${buildOk ? "" : "  MISMATCH"}`);
for (const f of failed) console.log(`  ✖ ${f.status} ${f.url}`);
if (failed.length || !buildOk) {
  console.log(`\nWarm-up failed: ${failed.length} failed request(s)${buildOk ? "" : ", wrong build"}.`);
  process.exitCode = 1;
} else console.log("\nWarm-up green.");
