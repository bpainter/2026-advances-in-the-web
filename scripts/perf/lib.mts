/**
 * Shared helpers for `pnpm perf` (docs/PRD-perf.md, 9.2). Ported from the 29 October 2026 review
 * scripts (docs/perf/baseline/perf/lib.mjs). Measurements only: nothing here changes the app.
 */
import { chromium, type Browser, type CDPSession, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export const PRODUCTION_PRESENTER = "https://2026-advances-in-the-web.vercel.app";
export const PRODUCTION_DEMO = "https://2026-advances-in-the-web-demos.vercel.app";

/** `--name=value` options and bare words from argv. */
export function parseArgs(argv: string[]): { words: string[]; opt: (name: string) => string | undefined; flag: (name: string) => boolean } {
  const words = argv.filter((a) => !a.startsWith("--"));
  const opt = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const flag = (name: string) => argv.includes(`--${name}`);
  return { words, opt, flag };
}

/**
 * The two origins under test. `--origin` is the presenter (default production). The demo origin
 * is `--demo`, else the production demo domain for production, else the same port on 127.0.0.1
 * for a local presenter (docs/deploy.md, "Checking a build locally").
 */
export function origins(opt: (name: string) => string | undefined): { P: string; D: string } {
  const P = (opt("origin") ?? PRODUCTION_PRESENTER).replace(/\/$/, "");
  const given = opt("demo");
  if (given) return { P, D: given.replace(/\/$/, "") };
  if (P === PRODUCTION_PRESENTER) return { P, D: PRODUCTION_DEMO };
  const u = new URL(P);
  if (u.hostname === "localhost") return { P, D: `${u.protocol}//127.0.0.1${u.port ? `:${u.port}` : ""}` };
  return { P, D: P };
}

/** CDP network conditions. `venue` is a hotel or venue Wi-Fi guess; `poor` a bad day on it. */
export const PROFILES = {
  none: null,
  venue: { offline: false, latency: 60, downloadThroughput: (20 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 },
  poor: { offline: false, latency: 150, downloadThroughput: (5 * 1024 * 1024) / 8, uploadThroughput: (1 * 1024 * 1024) / 8 },
} as const;
export type ProfileName = keyof typeof PROFILES;

export function profileOf(opt: (name: string) => string | undefined): ProfileName {
  const p = (opt("profile") ?? "none") as ProfileName;
  if (!(p in PROFILES)) throw new Error(`Unknown --profile=${p}; use none, venue or poor`);
  return p;
}

/**
 * Site isolation off, so the page's CDP session sees the cross-origin demo frames' traffic too
 * and the network profile applies to them. Grid Lanes on, as in the talk's Chrome profile.
 */
export function launch(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    args: ["--disable-site-isolation-trials", "--disable-features=IsolateOrigins,site-per-process", "--enable-blink-features=CSSGridLanesLayout"],
  });
}

export async function applyProfile(cdp: CDPSession, name: ProfileName): Promise<void> {
  const p = PROFILES[name];
  if (p) await cdp.send("Network.emulateNetworkConditions", p);
}

/** Web vitals observers, installed before any page script (a string, so tsx adds no helpers). */
export const INIT = `
(() => {
  const m = (window.__m = { lcp: 0, lcpEl: null, lcpUrl: null, cls: 0, shifts: [], long: [], fcp: 0 });
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { m.lcp = e.startTime; m.lcpEl = e.element ? (e.element.className || e.element.tagName) + '' : null; m.lcpUrl = e.url || null; m.lcpSize = e.size; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { m.cls += e.value; m.shifts.push({ v: e.value, t: e.startTime, src: (e.sources||[]).map(s => s.node ? (s.node.className || s.node.nodeName) + '' : '?') }); } } }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) m.long.push({ t: e.startTime, d: e.duration }); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  } catch (e) {}
})();
`;

export interface Req {
  id: string;
  url: string;
  method: string;
  type?: string;
  start: number;
  end?: number;
  rsc: boolean;
  prefetch: string | null;
  priority?: string;
  status?: number;
  mime?: string;
  disk?: boolean;
  memCache?: boolean;
  prefetchCache?: boolean;
  protocol?: string;
  cacheControl?: string;
  vercelCache?: string;
  bytes?: number;
  failed?: string;
}

type Headers = Record<string, string>;

/** A CDP network log on a page: every request, its status, cache flags, headers and bytes. */
export async function netlog(page: Page): Promise<{ cdp: CDPSession; list: () => Req[]; reset: () => void }> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  const reqs = new Map<string, Req>();
  cdp.on("Network.requestWillBeSent", (e: { requestId: string; type?: string; timestamp: number; request: { url: string; method: string; headers: Headers; initialPriority?: string } }) => {
    const h = e.request.headers;
    reqs.set(e.requestId, {
      id: e.requestId,
      url: e.request.url,
      method: e.request.method,
      type: e.type,
      start: e.timestamp,
      prefetch: h["Next-Router-Prefetch"] ?? h["next-router-prefetch"] ?? null,
      rsc: Boolean(h["RSC"] ?? h["rsc"]),
      priority: e.request.initialPriority,
    });
  });
  cdp.on("Network.requestServedFromCache", (e: { requestId: string }) => {
    const r = reqs.get(e.requestId);
    if (r) r.memCache = true;
  });
  cdp.on("Network.responseReceived", (e: { requestId: string; response: { status: number; mimeType: string; fromDiskCache?: boolean; fromPrefetchCache?: boolean; protocol?: string; headers: Headers } }) => {
    const r = reqs.get(e.requestId);
    if (!r) return;
    const h = e.response.headers;
    r.status = e.response.status;
    r.mime = e.response.mimeType;
    r.disk = e.response.fromDiskCache;
    r.prefetchCache = e.response.fromPrefetchCache;
    r.protocol = e.response.protocol;
    r.cacheControl = h["cache-control"] ?? h["Cache-Control"];
    r.vercelCache = h["x-vercel-cache"];
  });
  cdp.on("Network.loadingFinished", (e: { requestId: string; encodedDataLength: number; timestamp: number }) => {
    const r = reqs.get(e.requestId);
    if (!r) return;
    r.bytes = e.encodedDataLength;
    r.end = e.timestamp;
  });
  cdp.on("Network.loadingFailed", (e: { requestId: string; errorText: string }) => {
    const r = reqs.get(e.requestId);
    if (r) r.failed = e.errorText;
  });
  return { cdp, list: () => [...reqs.values()], reset: () => reqs.clear() };
}

export function kind(r: { url: string; type?: string; rsc?: boolean }): string {
  const u = r.url;
  if (r.rsc || /[?&]_rsc=/.test(u)) return "rsc";
  if (/\.(js|mjs)(\?|$)/.test(u) || r.type === "Script") return "js";
  if (/\.css(\?|$)/.test(u) || r.type === "Stylesheet") return "css";
  if (/\.(otf|ttf|woff2?)(\?|$)/.test(u) || r.type === "Font") return "font";
  if (/\.(png|jpe?g|webp|avif|svg|gif)(\?|$)/.test(u) || r.type === "Image") return "img";
  if (r.type === "Document") return "doc";
  return r.type?.toLowerCase() || "other";
}

export interface Summary {
  requests: number;
  bytes: number;
  by: Record<string, { n: number; bytes: number }>;
  notModified: number;
  fromCache: number;
  presenter: number;
  demo: number;
}

export function summarize(list: Req[], P: string, D: string): Summary {
  const out: Summary = { requests: 0, bytes: 0, by: {}, notModified: 0, fromCache: 0, presenter: 0, demo: 0 };
  for (const r of list) {
    if (r.url.startsWith("data:")) continue;
    out.requests++;
    const b = r.bytes ?? 0;
    out.bytes += b;
    const k = kind(r);
    out.by[k] ??= { n: 0, bytes: 0 };
    out.by[k].n++;
    out.by[k].bytes += b;
    if (r.status === 304) out.notModified++;
    if (r.disk || r.memCache) out.fromCache++;
    if (D !== P && r.url.startsWith(D)) out.demo++;
    else if (r.url.startsWith(P)) out.presenter++;
  }
  return out;
}

export const kb = (n?: number | null) => Math.round((n ?? 0) / 1024);
export const round = (n?: number | null) => (n == null ? null : Math.round(n));

export function median(a: (number | null | undefined)[]): number | null {
  const s = a.filter((x): x is number => x != null).sort((x, y) => x - y);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : null;
}

export function percentile(a: (number | null | undefined)[], p: number): number | null {
  const s = a.filter((x): x is number => x != null).sort((x, y) => x - y);
  return s.length ? s[Math.min(s.length - 1, Math.max(0, Math.ceil(s.length * p) - 1))] : null;
}

/** A markdown table from rows of cells. */
export function table(head: string[], rows: (string | number | null | undefined)[][]): string {
  const cell = (v: string | number | null | undefined) => (v == null ? "" : String(v));
  return [`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
}

function shortCommit(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "nogit";
  }
}

/** Writes docs/perf/results/<date>-<commit>-<task>[-<label>].json and returns its path. */
export function writeResult(task: string, data: unknown): string {
  const dir = path.join(process.cwd(), "docs", "perf", "results");
  mkdirSync(dir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  // `--label=<name>` keeps two runs of one task on one commit apart (before and after a change).
  const label = process.argv.find((a) => a.startsWith("--label="))?.slice(8);
  const file = path.join(dir, `${date}-${shortCommit()}-${task}${label ? `-${label}` : ""}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return path.relative(process.cwd(), file);
}

/** The deck's slide ids in order. */
export async function slideIds(): Promise<string[]> {
  const { slides } = await import("@/lib/content");
  return slides.map((s) => s.id);
}
