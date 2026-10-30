import type { DemoSection, IntroPage } from "@/content/demo-schema";
import { introImage } from "@/lib/assets";
import { supportEntry } from "@/lib/support";
import { SupportRow } from "./SupportRow";

/**
 * The intro slide of a demo (PRD v4, 1.1): a captured still of the native demo on the left; the
 * feature name, the author's one-sentence description plus the generated support sentence, the
 * support row and the "also uses" line on the right. No frame and no code. v5 (PRD 1.6, spec 5):
 * the slide sits on the section background; the still is on a light glass card and the text in
 * one dark glass panel. r7: a "Still in motion" chip above the title on M1 to M5.
 */
export function IntroSlide({ section, page }: { section: DemoSection; page: IntroPage }) {
  const support = supportEntry(section.id);
  const visual = introImage(page.visual.src);
  return (
    <article className="intro" aria-label={section.feature}>
      <figure className="intro__visual">
        {/* A captured PNG under public/intro (pnpm visuals), served as AVIF with a WebP fallback at
            its display size (pnpm images). width and height reserve the box before it loads. */}
        {visual ? (
          <picture>
            {visual.avifSrcSet ? <source type="image/avif" srcSet={visual.avifSrcSet} sizes={visual.sizes} /> : null}
            <img className="intro__image" src={visual.src} srcSet={visual.webpSrcSet || undefined} sizes={visual.sizes || undefined} width={visual.width} height={visual.height} alt={page.visual.alt} />
          </picture>
        ) : (
          <figcaption className="intro__missing">Run pnpm visuals to capture this still</figcaption>
        )}
      </figure>
      <div className="intro__text glass-dark">
        {/* M1 to M5 (PRD r7, 8.3): the chip tells the room these five are not ship-ready yet. */}
        {section.group === "still-in-motion" ? <p className="intro__group">Still in motion</p> : null}
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
