import { DEMO_ORIGIN, PRESENTER_ORIGIN } from "@/lib/frames/origins";

/**
 * Host-aware robots.txt (PRD r7, 10.4). One deployment answers on both domains: the demo host
 * disallows everything, the presenter host allows the reader pages and names the sitemap. Any
 * other host (a preview deployment) disallows everything too.
 */
export const dynamic = "force-dynamic";

const PRESENTER_DISALLOW = ["/present", "/speaker", "/demos/", "/demo/", "/orders", "/cases", "/cms/", "/api/", "/fixtures/", "/_health"];

function robotsFor(host: string): string {
  const presenter = new URL(PRESENTER_ORIGIN);
  const demo = new URL(DEMO_ORIGIN);
  const h = host.toLowerCase();
  if (h === presenter.host && h !== demo.host)
    return ["User-agent: *", "Allow: /", "Allow: /s/", ...PRESENTER_DISALLOW.map((p) => `Disallow: ${p}`), "", `Sitemap: ${PRESENTER_ORIGIN}/sitemap.xml`, ""].join("\n");
  return ["User-agent: *", "Disallow: /", ""].join("\n");
}

export function GET(request: Request): Response {
  return new Response(robotsFor(request.headers.get("host") ?? ""), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
