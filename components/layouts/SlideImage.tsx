import type { Slide } from "@/content/schema";
import { imageSrc } from "@/lib/images";

interface Props {
  slide: Slide;
  variant: "full-bleed" | "right-half" | "background";
}

/** The slide's generated still, or an honest placeholder until the file exists under public/images/. */
export function SlideImage({ slide, variant }: Props) {
  const image = slide.image;
  if (!image) return null;
  const src = imageSrc(slide.id);
  if (src) {
    // Stills are pre-generated AVIF/WebP at fixed widths; the runtime optimizer is off (PRD 13).
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="slide-image" data-variant={variant} src={src} alt={variant === "background" ? "" : image.alt} width={1920} height={1080} />;
  }
  return (
    <div className="slide-image slide-image--placeholder" data-variant={variant} role="img" aria-label={image.alt}>
      <p className="slide-image__note">Image pending: {image.alt}</p>
    </div>
  );
}
