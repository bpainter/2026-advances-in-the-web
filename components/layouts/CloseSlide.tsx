import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { SlideShell } from "./SlideShell";
import { SlideImage } from "./SlideImage";
import { Wordmark } from "./Wordmark";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

export function CloseSlide({ slide, total, mode }: Props) {
  return (
    <SlideShell
      slide={slide}
      total={total}
      mode={mode}
      titleSize="2xl"
      footer={false}
      before={
        slide.image?.placement === "background" ? (
          <>
            <SlideImage slide={slide} variant="background" />
            <div className="slide__scrim" data-heavy="true" aria-hidden="true" />
          </>
        ) : null
      }
    >
      <address className="close__contact">
        {slide.body?.map((line) => (
          <p className="close__line" key={line}>
            {line}
          </p>
        ))}
      </address>
      <Wordmark />
    </SlideShell>
  );
}
