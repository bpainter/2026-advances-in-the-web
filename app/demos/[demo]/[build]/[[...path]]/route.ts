import { demoFolder } from "@/lib/frames/registry";
import { composeFrame, frameResponse, buildFile } from "@/lib/frames/compose";
import { parseFlags } from "@/lib/frames/origins";
import { matchRoute } from "@/lib/frames/routes";

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
  if (!folder || !def) return notFound("Demo build");
  const url = new URL(req.url);
  // The CSP names the origin the document is actually served from; Next's req.url may carry the
  // configured hostname instead of the one the request arrived on (localhost vs 127.0.0.1).
  const host = req.headers.get("host") ?? url.host;
  const origin = `${req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")}://${host}`;
  const rest = path.join("/");
  if (req.method === "GET" && (rest === "" || rest === "index.html")) {
    const flags = { ...Object.fromEntries(Object.keys(def.manifest.flags).map((k) => [k, true])), ...parseFlags(url.searchParams.get("flags")) };
    return frameResponse(composeFrame(def, { flags, origin }), def, origin, flags);
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
