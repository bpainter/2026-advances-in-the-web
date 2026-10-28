import { existsSync } from "node:fs";
import path from "node:path";
import type { DemoSection, IntroPage } from "@/content/demo-schema";
import { supportEntry } from "@/lib/support";
import { SupportRow } from "./SupportRow";

/**
 * The intro slide of a demo (PRD v4, 1.1): a captured still of the native demo on the left; the
 * feature name, the author's one-sentence description plus the generated support sentence, the
 * support row and the "also uses" line on the right. No frame and no code. v5 (PRD 1.6, spec 5):
 * the slide sits on the section background; the still is on a light glass card and the text in
 * one dark glass panel.
 */
export function IntroSlide({ section, page }: { section: DemoSection; page: IntroPage }) {
  const support = supportEntry(section.id);
  const visual = existsSync(path.join(process.cwd(), "public", page.visual.src)) ? page.visual.src : null;
  return (
    <article className="intro" aria-label={section.feature}>
      <figure className="intro__visual">
        {/* A captured PNG under public/intro (pnpm visuals). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {visual ? <img className="intro__image" src={visual} alt={page.visual.alt} /> : <figcaption className="intro__missing">Run pnpm visuals to capture this still</figcaption>}
      </figure>
      <div className="intro__text glass-dark">
        <h1 className="intro__title">{section.feature}</h1>
        <p className="intro__description">
          {page.description} {support?.since ?? ""}
        </p>
        {support ? <SupportRow tiles={support.tiles} kind={support.kind} /> : <p className="intro__missing">Run pnpm support</p>}
        {support?.alsoUses ? <p className="intro__also">{support.alsoUses}</p> : null}
      </div>
    </article>
  );
}
