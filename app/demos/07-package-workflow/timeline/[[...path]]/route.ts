import { allExtraRoutes } from "@/lib/frames/registry";
import { matchRoute } from "@/lib/frames/routes";

/**
 * F3's today frame lives at /demos/07-package-workflow/timeline (PRD Part A, 8.2), a path whose
 * second segment is not a build name, so the generic frame handler cannot reach the folder's
 * routes for it. This static segment wins over [demo]/[build] and delegates to them.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = matchRoute(allExtraRoutes(), "GET", url.pathname);
  if (!m) return new Response("Not found", { status: 404 });
  return m.route.handler(req, { params: m.params, url });
}
