import { allDemos, slides } from "@/lib/content";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    ok: true,
    build: process.env.NEXT_PUBLIC_BUILD_ID ?? "dev",
    slides: slides.length,
    demos: allDemos().length,
  });
}
