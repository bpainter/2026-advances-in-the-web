import { allExtraRoutes } from "@/lib/frames/registry";
import { matchRoute } from "@/lib/frames/routes";

/** Root-level file a demo folder registers (D4's shown markup links /app.js). */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const m = matchRoute(allExtraRoutes(), "GET", url.pathname);
  if (!m) return new Response("Not found", { status: 404 });
  return m.route.handler(req, { params: m.params, url });
}
