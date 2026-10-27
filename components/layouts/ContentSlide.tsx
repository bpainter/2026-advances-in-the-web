import { icons } from "lucide-react";
import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { SlideShell } from "./SlideShell";

function iconByName(name?: string) {
  if (!name) return null;
  const pascal = name.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
  return (icons as Record<string, (typeof icons)[keyof typeof icons]>)[pascal] ?? null;
}

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** The standard content slide: eyebrow, title, up to two sentences, optional 3 to 6 items. */
export function ContentSlide({ slide, total, mode }: Props) {
  const items = slide.items ?? [];
  return (
    <SlideShell slide={slide} total={total} mode={mode}>
      {slide.body?.map((sentence) => (
        <p className="slide__text" key={sentence}>
          {sentence}
        </p>
      ))}
      {items.length > 0 ? (
        <ul className="item-list" data-count={items.length} data-icons={items.some((it) => Boolean(iconByName(it.icon)))}>
          {items.map((item) => {
            const Icon = iconByName(item.icon);
            return (
              <li className="item-list__item" key={item.label}>
                {Icon ? <Icon className="item-list__icon" aria-hidden="true" strokeWidth={1.75} /> : <span className="item-list__icon" aria-hidden="true" />}
                <strong className="item-list__label">{item.label}</strong>
                {item.detail ? <span className="item-list__detail">{item.detail}</span> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </SlideShell>
  );
}
