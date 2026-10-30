import { allExtraRoutes } from "@/lib/frames/registry";
import { matchRoute } from "@/lib/frames/routes";
import { asBuildFile } from "@/lib/frames/compose";

/**
 * Root-level instrumentation files demo folders register (D5's /demo/console.js, D4's
 * /demo/log.js, /demo/hooks.js and /demo/d4/*). Every one is a static script, fixed per
 * deployment, so it is cached like a build file (docs/PRD-perf.md, P1-FRAMEFILES).
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = matchRoute(allExtraRoutes(), "GET", url.pathname);
  if (!m) return new Response("Not found", { status: 404 });
  return asBuildFile(await m.route.handler(req, { params: m.params, url }));
}
