import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { manifestFor } from "@/lib/frames/registry";
import { spotlightFixturePage } from "@/demos/00-fixtures/page";
import { SpotlightFixture } from "./SpotlightFixture";

export const metadata: Metadata = { title: "Spotlight fixture", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Dev-only engine fixture for the spotlight gate and radii (PRD v5, 3.4); 404 in production. */
export default function SpotlightFixturePage() {
  if (process.env.NODE_ENV === "production") notFound();
  const manifest = manifestFor(spotlightFixturePage.frame.route);
  if (!manifest) notFound();
  return <SpotlightFixture page={spotlightFixturePage} sandbox={manifest.sandbox} sideEffects={manifest.sideEffects} />;
}
