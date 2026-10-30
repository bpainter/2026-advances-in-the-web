// Shared helpers for the live perf audit (no app code changes).
import { chromium } from "/Users/bermonpainter/Sites/web-unleashed-talk-2026/node_modules/@playwright/test/index.mjs";

export const P = "https://2026-advances-in-the-web.vercel.app";
export const D = "https://2026-advances-in-the-web-demos.vercel.app";

// Site isolation off so the page's CDP session sees the cross-origin demo iframes' traffic too
// (and network throttling applies to them).
export async function launch() {
  return chromium.launch({
    headless: true,
    args: ["--disable-site-isolation-trials", "--disable-features=IsolateOrigins,site-per-process", "--enable-blink-features=CSSGridLanesLayout"],
  });
}

export const PROFILES = {
  none: null,
  // A venue / hotel wifi guess: 20 Mbps down, 5 up, 60 ms RTT.
  venue: { offline: false, latency: 60, downloadThroughput: (20 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 },
};

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

/** Attaches a CDP network log to a page. */
export async function netlog(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  const reqs = new Map();
  cdp.on("Network.requestWillBeSent", (e) => {
    reqs.set(e.requestId, { id: e.requestId, url: e.request.url, method: e.request.method, type: e.type, start: e.timestamp, prefetch: e.request.headers["Next-Router-Prefetch"] || e.request.headers["next-router-prefetch"] || null, rsc: Boolean(e.request.headers["RSC"] || e.request.headers["rsc"]), priority: e.request.initialPriority, frameId: e.frameId });
  });
  cdp.on("Network.requestServedFromCache", (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.memCache = true;
  });
  cdp.on("Network.responseReceived", (e) => {
    const r = reqs.get(e.requestId);
    if (!r) return;
    r.status = e.response.status;
    r.mime = e.response.mimeType;
    r.disk = e.response.fromDiskCache;
    r.prefetchCache = e.response.fromPrefetchCache;
    r.protocol = e.response.protocol;
    r.cacheControl = e.response.headers["cache-control"] || e.response.headers["Cache-Control"];
    r.vercelCache = e.response.headers["x-vercel-cache"];
    r.ttfb = e.response.timing ? e.response.timing.receiveHeadersEnd : null;
  });
  cdp.on("Network.loadingFinished", (e) => {
    const r = reqs.get(e.requestId);
    if (!r) return;
    r.bytes = e.encodedDataLength;
    r.end = e.timestamp;
  });
  cdp.on("Network.loadingFailed", (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.failed = e.errorText;
  });
  return { cdp, reqs, list: () => [...reqs.values()], reset: () => reqs.clear() };
}

export function kind(r) {
  const u = r.url;
  if (r.rsc || /[?&]_rsc=/.test(u)) return "rsc";
  if (/\.(js|mjs)(\?|$)/.test(u) || r.type === "Script") return "js";
  if (/\.css(\?|$)/.test(u) || r.type === "Stylesheet") return "css";
  if (/\.(otf|ttf|woff2?)(\?|$)/.test(u) || r.type === "Font") return "font";
  if (/\.(png|jpe?g|webp|avif|svg|gif)(\?|$)/.test(u) || r.type === "Image") return "img";
  if (r.type === "Document") return "doc";
  return r.type?.toLowerCase() || "other";
}

export function summarize(list) {
  const out = { requests: 0, bytes: 0, by: {}, notModified: 0, fromCache: 0, presenter: 0, demo: 0 };
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
    if (r.url.startsWith(D)) out.demo++;
    else if (r.url.startsWith(P)) out.presenter++;
  }
  return out;
}

export const kb = (n) => Math.round((n ?? 0) / 1024);
