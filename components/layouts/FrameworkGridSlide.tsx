import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { SlideShell } from "./SlideShell";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** 2x2 of short labels. Short labels (a figure or date) render large; `stats` become a thin strip beneath. */
export function FrameworkGridSlide({ slide, total, mode }: Props) {
  const items = (slide.items ?? []).slice(0, 4);
  return (
    <SlideShell slide={slide} total={total} mode={mode} headerExtra={slide.body?.[0] ? <p className="slide__subtitle">{slide.body[0]}</p> : null}>
      <ol className="quad" data-dense={items.some((it) => (it.detail?.length ?? 0) > 160)}>
        {items.map((it) => (
          <li className="quad__cell" key={it.label}>
            <h2 className="quad__label" data-figure={it.label.length <= 12}>
              {it.label}
            </h2>
            {it.detail ? <p className="quad__detail">{it.detail}</p> : null}
          </li>
        ))}
      </ol>
      {slide.stats?.length ? (
        <ol className="strip" aria-label="Dates">
          {slide.stats.map((s) => (
            <li className="strip__item" key={s.value + s.label}>
              <strong className="strip__value">{s.value}</strong>
              <span className="strip__label">{s.label}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </SlideShell>
  );
}
