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

export function TitleSlide({ slide, total, mode }: Props) {
  return (
    <SlideShell
      slide={slide}
      total={total}
      mode={mode}
      titleSize="2xl"
      footer={false}
      before={
        <>
          <SlideImage slide={slide} variant="full-bleed" />
          <div className="slide__scrim" aria-hidden="true" />
        </>
      }
      headerExtra={slide.body?.[0] ? <p className="slide__subtitle">{slide.body[0]}</p> : null}
    >
      <Wordmark />
    </SlideShell>
  );
}
