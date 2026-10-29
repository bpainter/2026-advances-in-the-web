import { demoFolder } from "@/lib/frames/registry";
import { composeFrame, frameResponse, buildFile } from "@/lib/frames/compose";
import { parseFlags } from "@/lib/frames/origins";
import { matchRoute } from "@/lib/frames/routes";
import { readFileSync } from "node:fs";
import { join } from "node:path";

declare global {
  /** Flags and background of each multi-page build's last mount, keyed "<demo>/<build>". */
  var __pageState: Record<string, { flags: string; bg: string | null }> | undefined;
}

/**
 * Frame documents and their files on the demo origin (PRD Part A, 8.2):
 *   /demos/<demo>/<build>              the composed document (also at .../index.html so relative links resolve)
 *   /demos/<demo>/<build>/<file>       a file of the build
 *   /demos/<demo>/<build>/<anything>   a route the demo folder registered (today addresses, submits)
 * Flags arrive as ?flags=enhance-css:0,enhance-js:1.
 */
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ demo: string; build: string; path?: string[] }> };

function notFound(what: string): Response {
  return new Response(`${what} not found`, { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

async function handle(req: Request, ctx: Ctx): Promise<Response> {
  const { demo, build, path = [] } = await ctx.params;
  const folder = demoFolder(demo);
  const def = folder?.builds[build as "today" | "native" | "static" | "terminal"];
  const url = new URL(req.url);
  if (folder && !def) {
    // Not a build name: the folder may serve this path itself (F3's timeline).
    const own = folder.routes ? matchRoute(folder.routes, req.method, url.pathname) : null;
    return own ? own.route.handler(req, { params: own.params, url }) : notFound("Demo build");
  }
  if (!folder || !def) return notFound("Demo build");
  // The CSP names the origin the document is actually served from; Next's req.url may carry the
  // configured hostname instead of the one the request arrived on (localhost vs 127.0.0.1).
  const host = req.headers.get("host") ?? url.host;
  const origin = `${req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")}://${host}`;
  const rest = path.join("/");
  const page = rest === "" ? "index.html" : rest;
  if (req.method === "GET" && (page === "index.html" || def.pages?.includes(page))) {
    // A multi-page build (still-in-motion-demos.md 3.3): the frame's own links load the other
    // pages with no query, so a flagless request takes the flags and background of the last mount.
    const key = `${demo}/${build}`;
    const given = url.searchParams.get("flags");
    const state = def.pages?.length ? (globalThis.__pageState ??= {}) : null;
    if (state && given !== null) state[key] = { flags: given, bg: url.searchParams.get("bg") };
    const remembered = state && given === null ? state[key] : undefined;
    const flags = { ...Object.fromEntries(Object.keys(def.manifest.flags).map((k) => [k, true])), ...parseFlags(given ?? remembered?.flags ?? null) };
    let body: string | undefined;
    if (page !== "index.html" || def.render) {
      const raw = readFileSync(join(def.dir, page), "utf8");
      try {
        body = def.render ? def.render(page, raw, url) : raw;
      } catch {
        return notFound("Demo record");
      }
    }
    return frameResponse(composeFrame(def, { flags, origin, body, bg: url.searchParams.get("bg") ?? remembered?.bg ?? null }), def, origin, flags);
  }
  if (req.method === "GET") {
    const file = buildFile(def, rest);
    if (file) return file;
  }
  const extra = folder.routes ? matchRoute(folder.routes, req.method, url.pathname) : null;
  if (extra) return extra.route.handler(req, { params: extra.params, url });
  return notFound("Demo file");
}

export const GET = handle;
export const POST = handle;
