import { allDemos, byDemoId } from "@/lib/content";
import { composeDemo } from "@/lib/compose";
import { demoResponse } from "../route";

/**
 * The "before" document of a demo: the same component driven by the old script, composed from
 * `demo.legacy.code` with the same bridge and CSP (docs/demo-plan.md, E3.1). A literal segment,
 * so it wins over `[page]`.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return allDemos()
    .filter((d) => d.legacy && d.legacy.code.some((f) => f.lang === "html"))
    .map((d) => ({ id: d.id }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const demo = byDemoId(id);
  if (!demo?.legacy || !demo.legacy.code.some((f) => f.lang === "html")) {
    return new Response("No legacy document for this demo", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return demoResponse(composeDemo(demo, undefined, "legacy"));
}
