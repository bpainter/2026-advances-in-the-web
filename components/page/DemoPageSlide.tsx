import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { renderCodeFiles } from "@/lib/highlight";
import { manifestFor } from "@/lib/frames/registry";
import { meterValue } from "@/lib/meters";
import { existsSync } from "node:fs";
import path from "node:path";
import { PageBody } from "./PageBody";
import { hasFrame } from "@/content/demo-schema";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** Slot geometry on the 1920 x 1080 canvas (PRD Part A, 2.2). */
export const SLOT = { full: { width: 1792, height: 872 }, code: { width: 1232, height: 872 } };

/**
 * One demo page (PRD Part A, section 2): a title row with the badge or meter, the frame slot, and
 * the code panel on code pages. Nothing else is on the page.
 */
export async function DemoPageSlide({ slide, mode }: Props) {
  const page = slide.page;
  const section = slide.demoSection;
  if (!page || !section) throw new Error(`Slide ${slide.id} has layout demo-page but no page`);
  if (!hasFrame(page)) {
    return (
      <article className="page" data-stage={page.stage} aria-label={section.feature}>
        <header className="page__header">
          <h1 className="page__title">{section.feature}</h1>
        </header>
      </article>
    );
  }
  const files = page.files ? await renderCodeFiles(page.files.map((f) => ({ file: f.file, lang: f.lang, source: f.source }))) : [];
  const manifest = page.frame ? manifestFor(page.frame.route) : null;
  const hasCode = files.length > 0;
  const meters = Object.fromEntries(page.steps.filter((s) => s.meter).map((s) => [s.id, meterValue(s.meter!.source)]));
  // Posters are optional files under public/; the preview only shows the ones that exist.
  const posterExists = (p?: string) => Boolean(p && existsSync(path.join(process.cwd(), "public", p)));
  const posters = Object.fromEntries(page.steps.map((s) => [s.id, posterExists(s.poster) ? s.poster! : posterExists(page.frame?.poster) ? page.frame!.poster! : null]));
  return (
    <article className="page" data-stage={page.stage} data-code={hasCode} aria-label={page.title}>
      <header className="page__header">
        <h1 className="page__title">{page.title}</h1>
      </header>
      <PageBody page={page} files={files} sandbox={manifest?.sandbox ?? "allow-scripts allow-same-origin"} sideEffects={manifest?.sideEffects ?? []} mode={mode} slot={hasCode ? SLOT.code : SLOT.full} meters={meters} posters={posters} />
    </article>
  );
}
