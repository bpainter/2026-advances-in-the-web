import { readFileSync } from "node:fs";
import path from "node:path";
import type { DemoFolder, BuildDef } from "@/lib/frames/types";
import type { ServerRoute } from "@/lib/frames/routes";
import {
  folderBuild,
  nativeBuild,
  manifestDefaults,
  FORMS_SANDBOX,
} from "@/lib/frames/build-helpers";
import { composeFrame, frameResponse, buildFile } from "@/lib/frames/compose";
import { parseFlags } from "@/lib/frames/origins";
import { fillTemplate, listPage, orderPage, statusOf, type Rendered } from "./render";

/**
 * D4 Dashboard navigation (PRD Part A, 10.1; Part B, D4). Every address is a server-rendered
 * document composed from one template: the native build owns /orders, /orders?status=, /orders/:id
 * (plus /app.css, /app.js and the instrumentation at /demo/*) so the code page shows exactly what
 * runs; the today build serves the same pages under /demos/04-navigation-api/today/orders[/:id].
 */
const DEMO = "04-navigation-api";
const TODAY_PREFIX = `/demos/${DEMO}/today`;

const today: BuildDef = folderBuild(
  DEMO,
  "today",
  "Open orders",
  manifestDefaults({
    sandbox: FORMS_SANDBOX,
    enhancement: { css: "all", js: ["router.js"] },
    shell: { title: "Orders", nav: "orders" },
    styles: ["/portal/04-navigation-api.css"],
    instrumentation: ["/demo/log.js", "/demo/hooks.js"],
    sideEffects: ["reset"],
  }),
);

const native: BuildDef = nativeBuild(
  DEMO,
  "d4-dashboard-navigation",
  "Open orders",
  manifestDefaults({
    sandbox: FORMS_SANDBOX,
    flags: { "enhance-js": true },
    enhancement: { css: { files: [] }, js: ["app.js"] },
    shell: { title: "Orders", nav: "orders" },
    styles: ["/portal/04-navigation-api.css"],
    instrumentation: ["/demo/log.js", "/demo/hooks.js"],
    sideEffects: ["reset"],
  }),
);

// ---------------------------------------------------------------- flags across full loads

/**
 * The engine mounts a frame with `?flags=`; a full-page navigation inside the frame (a link
 * click with enhance-js off) carries no query, no referrer and no cookie the demo origin can rely
 * on, so the flags last given to this demo are kept for the flagless document requests that
 * follow. Every engine mount sends the flags explicitly, so the state is refreshed each time.
 */
declare global {
  var __d4Flags: Record<string, Record<string, boolean>> | undefined;
}

function flagsFor(def: BuildDef, url: URL): Record<string, boolean> {
  const known = Object.keys(def.manifest.flags);
  const defaults = Object.fromEntries(known.map((k) => [k, true]));
  const store = (globalThis.__d4Flags ??= {});
  const query = url.searchParams.get("flags");
  if (query !== null) {
    const given = parseFlags(query);
    store[def.manifest.build] = Object.fromEntries(known.map((k) => [k, given[k] ?? true]));
  }
  return { ...defaults, ...(store[def.manifest.build] ?? {}) };
}

// ---------------------------------------------------------------- slow network

/**
 * The frame runtime appends `demo-net=slow` or `demo-net=slow-instant` to the frame's same-origin
 * fetches; the response is delayed and the wait ends early when the request is aborted (PRD Part
 * A, 10.1). The delays must outlast the 100ms gap the steps author between two clicks, measured
 * from the first click: animated, the second click's cursor glide and ripple add about 700ms, so
 * the slow profile takes 1.4 seconds (the request outlasts the second click in every engine, and the
 * step still ends well inside the runtime's grace past its 2.5 s ceiling); in instant
 * replay the gap is the authored 100ms, so slow-instant takes 450ms. Either way the stale request
 * is still in flight and gets aborted.
 */
function delayFor(url: URL): number {
  const net = url.searchParams.get("demo-net");
  return net === "slow" ? 1400 : net === "slow-instant" ? 450 : 0;
}

function throttle(req: Request, url: URL): Promise<"ok" | "aborted"> {
  const ms = delayFor(url);
  if (!ms) return Promise.resolve("ok");
  return new Promise((resolve) => {
    const signal = req.signal;
    if (signal?.aborted) return resolve("aborted");
    const timer = setTimeout(() => resolve("ok"), ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve("aborted");
    });
  });
}

// ---------------------------------------------------------------- documents

function originOf(req: Request, url: URL): string {
  const host = req.headers.get("host") ?? url.host;
  return `${req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")}://${host}`;
}

async function document(req: Request, url: URL, def: BuildDef, page: Rendered): Promise<Response> {
  if ((await throttle(req, url)) === "aborted") return new Response(null, { status: 499 });
  const origin = originOf(req, url);
  const flags = flagsFor(def, url);
  const template = readFileSync(path.join(def.dir, "index.html"), "utf8");
  const html = composeFrame(def, {
    body: fillTemplate(template, page),
    origin,
    flags,
    title: page.title,
  });
  const res = frameResponse(html, def, origin, flags);
  return page.found ? res : new Response(res.body, { status: 404, headers: res.headers });
}

function list(def: BuildDef): ServerRoute["handler"] {
  return (req, { url }) =>
    document(req, url, def, listPage(statusOf(url.searchParams.get("status"))));
}

function order(def: BuildDef): ServerRoute["handler"] {
  return (req, { params, url }) => document(req, url, def, orderPage(params.id));
}

/** A file of the native build at a root path (the shown markup links /app.css and /app.js). */
function nativeFile(file: string): ServerRoute["handler"] {
  return () => buildFile(native, file) ?? new Response("Not found", { status: 404 });
}

export const folder: DemoFolder = {
  demo: DEMO,
  builds: { today, native },
  routes: [
    // Today's own assets at short addresses, so its index.html fits 44 columns.
    { method: "GET", path: "/demo/d4/app.css", handler: () => buildFile(today, "app.css") ?? new Response("Not found", { status: 404 }) },
    { method: "GET", path: "/demo/d4/router.js", handler: () => buildFile(today, "router.js") ?? new Response("Not found", { status: 404 }) },
    // Today: the same pages under the build prefix.
    { method: "GET", path: `${TODAY_PREFIX}/orders`, handler: list(today) },
    {
      method: "GET",
      path: new RegExp(`^${TODAY_PREFIX}/orders/(?<id>\\d+)$`),
      handler: order(today),
    },
    // Native: the application's own addresses. The engine mounts a route as <route>/index.html;
    // that address is the list too, redirected so the panel shows the canonical one.
    { method: "GET", path: "/orders", handler: list(native) },
    {
      method: "GET",
      path: "/orders/index.html",
      handler: (req, { url }) =>
        new Response(null, {
          status: 302,
          headers: { Location: `/orders${url.search}`, "Cache-Control": "no-store" },
        }),
    },
    { method: "GET", path: /^\/orders\/(?<id>\d+)$/, handler: order(native) },
    { method: "GET", path: "/app.css", handler: nativeFile("app.css") },
    { method: "GET", path: "/app.js", handler: nativeFile("app.js") },
    // Instrumentation and hooks (native-extra), on every address of both builds.
    {
      method: "GET",
      path: /^\/demo\/(?<file>log\.js|hooks\.js)$/,
      handler: (req, { params }) => nativeFile(params.file)(req, { params, url: new URL(req.url) }),
    },
  ],
};
