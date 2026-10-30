import { DEMO_ORIGIN, PRESENTER_ORIGIN } from "@/lib/frames/origins";

/**
 * Host-aware robots.txt (PRD r7, 10.4). One deployment answers on both domains: the demo host
 * disallows everything, the presenter host allows the reader pages and names the sitemap. Any
 * other host (a preview deployment) disallows everything too.
 *
 * Link-preview bots honour robots.txt, so a shared /present or /speaker link would unfurl as a blank
 * card. They get their own group that allows those two (the pages carry noindex and the cover's
 * Open Graph tags); a bot reads only its most specific group, so the rest of the list is repeated.
 */
export const dynamic = "force-dynamic";

const PREVIEW_BOTS = ["LinkedInBot", "Twitterbot", "facebookexternalhit", "Slackbot", "Slackbot-LinkExpanding", "Discordbot", "WhatsApp", "TelegramBot", "Applebot", "redditbot", "SkypeUriPreview"];
const PREVIEW_ALLOWED = new Set(["/present", "/speaker"]);
const PRESENTER_DISALLOW = ["/present", "/speaker", "/demos/", "/demo/", "/orders", "/cases", "/cms/", "/api/", "/fixtures/", "/_health"];

function robotsFor(host: string): string {
  const presenter = new URL(PRESENTER_ORIGIN);
  const demo = new URL(DEMO_ORIGIN);
  const h = host.toLowerCase();
  if (h === presenter.host && h !== demo.host)
    return [
      ...PREVIEW_BOTS.map((ua) => `User-agent: ${ua}`),
      "Allow: /",
      ...PRESENTER_DISALLOW.filter((p) => !PREVIEW_ALLOWED.has(p)).map((p) => `Disallow: ${p}`),
      "",
      "User-agent: *",
      "Allow: /",
      "Allow: /s/",
      ...PRESENTER_DISALLOW.map((p) => `Disallow: ${p}`),
      "",
      `Sitemap: ${PRESENTER_ORIGIN}/sitemap.xml`,
      "",
    ].join("\n");
  return ["User-agent: *", "Disallow: /", ""].join("\n");
}

export function GET(request: Request): Response {
  return new Response(robotsFor(request.headers.get("host") ?? ""), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
