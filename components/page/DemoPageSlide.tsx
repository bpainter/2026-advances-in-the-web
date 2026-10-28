import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Slide } from "@/content/schema";
import { hasFrame } from "@/content/demo-schema";
import type { Mode } from "@/lib/mode";
import { renderCodeFiles } from "@/lib/highlight";
import { manifestFor } from "@/lib/frames/registry";
import { meterValue } from "@/lib/meters";
import { elisionLines } from "@/lib/excerpt";
import { PageBody } from "./PageBody";
import { IntroSlide } from "./IntroSlide";
import { FrameWarm } from "./FrameWarm";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/**
 * Slot geometry on the 1920 x 1080 canvas (PRD v4, 1.4): walk pages split 50/50, frame left and
 * code right, each 880 by 864; single pages use one 1792 by 864 slot.
 */
const BROWSER_NAMES = { chrome: "Chrome", edge: "Edge", firefox: "Firefox", safari: "Safari" } as const;

export const SLOT = { split: { width: 880, height: 864 }, full: { width: 1792, height: 864 } };

/**
 * One demo page. Intro slides render `IntroSlide`. Walk pages (used-to, now) show the feature as
 * the eyebrow, the stage title, the meter at the top right of the title row, the frame and the
 * code panel. Single pages show the section label and one slot.
 */
export async function DemoPageSlide({ slide, mode }: Props) {
  const page = slide.page;
  const section = slide.demoSection;
  if (!page || !section) throw new Error(`Slide ${slide.id} has layout demo-page but no page`);
  if (!hasFrame(page)) {
    const nextPage = section.pages[section.pages.indexOf(page) + 1];
    const warm = mode === "audience" && nextPage && hasFrame(nextPage) ? nextPage.frame : null;
    return (
      <>
        <IntroSlide section={section} page={page} />
        {warm ? <FrameWarm route={warm.route} flags={warm.flags} sandbox={manifestFor(warm.route)?.sandbox ?? "allow-scripts allow-same-origin"} /> : null}
      </>
    );
  }
  const sourceFiles = page.files ?? [];
  const rendered = await renderCodeFiles(sourceFiles.map((f) => ({ file: f.file, lang: f.lang, source: f.source })));
  // Elision lines of excerpts render dimmed and italic and are never highlighted (PRD v4, 7.1).
  const files = rendered.map((r, i) => {
    const ex = sourceFiles[i].excerptOf;
    const abs = ex ? path.join(process.cwd(), ex.path) : null;
    const total = abs && existsSync(abs) ? readFileSync(abs, "utf8").replace(/\n$/, "").split("\n").length : 0;
    return { ...r, elisions: ex ? elisionLines(ex.ranges, total) : [] };
  });
  const manifest = manifestFor(page.frame.route);
  const split = files.length > 0;
  const meters = Object.fromEntries(page.steps.filter((s) => s.meter).map((s) => [s.id, meterValue(s.meter!.source)]));
  // Posters are optional files under public/; the preview only shows the ones that exist.
  const posterExists = (p?: string) => Boolean(p && existsSync(path.join(process.cwd(), "public", p)));
  const posters = Object.fromEntries(page.steps.map((s) => [s.id, posterExists(s.poster) ? s.poster! : posterExists(page.frame.poster) ? page.frame.poster! : null]));
  const eyebrow = page.stage === "single" ? null : page.eyebrow;
  return (
    <article className="page" data-stage={page.stage} data-split={split} aria-label={eyebrow ? `${eyebrow}: ${page.title}` : page.title}>
      <header className="page__header">
        {eyebrow ? <p className="page__eyebrow">{eyebrow}</p> : null}
        <h1 className="page__title">{page.title}</h1>
        {page.stage === "single" && page.badge ? (
          <p className="page__badge">
            {page.badge.text}
            {page.badge.missing?.map((b) => (
              <s key={b}>
                {BROWSER_NAMES[b]}
                <span className="visually-hidden"> missing</span>
              </s>
            ))}
          </p>
        ) : null}
      </header>
      <PageBody page={page} files={files} sandbox={manifest?.sandbox ?? "allow-scripts allow-same-origin"} sideEffects={manifest?.sideEffects ?? []} mode={mode} slot={split ? SLOT.split : SLOT.full} meters={meters} posters={posters} />
    </article>
  );
}
