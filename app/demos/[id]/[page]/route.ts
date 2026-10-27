import { allDemos, byDemoId } from "@/lib/content";
import { composeDemo, demoPages } from "@/lib/compose";
import { demoResponse } from "../route";

/** Second and later pages of a route-kind demo, e.g. /demos/cross-document-transitions/page-b.html (PRD 7.11). */
export const dynamic = "force-static";

export function generateStaticParams() {
  return allDemos().flatMap((d) => demoPages(d).map((page) => ({ id: d.id, page })));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; page: string }> }) {
  const { id, page } = await ctx.params;
  const demo = byDemoId(id);
  if (!demo || !demoPages(demo).includes(page)) {
    return new Response("Demo page not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return demoResponse(composeDemo(demo, page));
}
