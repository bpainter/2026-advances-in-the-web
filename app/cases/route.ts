import { allExtraRoutes } from "@/lib/frames/registry";
import { matchRoute } from "@/lib/frames/routes";

/** Root-level routes demo folders register (D3's native case submit). */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const m = matchRoute(allExtraRoutes(), "POST", url.pathname);
  if (!m) return new Response("Not found", { status: 404 });
  return m.route.handler(req, { params: m.params, url });
}
