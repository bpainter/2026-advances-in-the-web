import "server-only";
import type { Demo, Slide } from "@/content/schema";
import { slides } from "@/content/slides";
import { deck } from "@/content/deck";

export { slides, deck };

export function bySlideId(id: string): Slide | undefined {
  return slides.find((s) => s.id === id);
}

export function slideIdByNumber(n: number): string | undefined {
  return slides[n - 1]?.id;
}

/** Prev/next are computed from array position, never from `index` arithmetic. */
export function neighbours(id: string): { prev?: Slide; next?: Slide; position: number } {
  const position = slides.findIndex((s) => s.id === id);
  return { prev: slides[position - 1], next: slides[position + 1], position };
}

export function allDemos(): Demo[] {
  return slides.flatMap((s) => [...(s.demo ? [s.demo] : []), ...(s.demos ?? [])]);
}

export function byDemoId(id: string): Demo | undefined {
  return allDemos().find((d) => d.id === id);
}
