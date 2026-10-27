import { allDemos, byDemoId } from "@/lib/content";
import { composeDemo, demoPages, DEMO_CSP } from "@/lib/compose";

/** Standalone demo document, byte-identical whether embedded or opened in another browser (PRD 7.1, 7.2). */
export const dynamic = "force-static";

export function generateStaticParams() {
  return allDemos()
    .filter((d) => d.live.kind !== "external" && demoPages(d).length > 0)
    .map((d) => ({ id: d.id }));
}

export function demoResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": DEMO_CSP,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const demo = byDemoId(id);
  if (!demo || demo.live.kind === "external" || demoPages(demo).length === 0) {
    return new Response("Demo not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  return demoResponse(composeDemo(demo));
}
