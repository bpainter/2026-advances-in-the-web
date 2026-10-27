import type { Slide } from "@/content/schema";
import type { DemoPage, DemoSection } from "@/content/demo-schema";
import { slides } from "@/content/slides";
import { sections } from "@/content/sections";
import { deck } from "@/content/deck";

export { slides, deck, sections };

export function bySlideId(id: string): Slide | undefined {
  return slides.find((s) => s.id === id);
}

export function slideIdByNumber(n: number): string | undefined {
  return slides[n - 1]?.id;
}

export function neighbours(id: string): { prev?: Slide; next?: Slide; position: number } {
  const i = slides.findIndex((s) => s.id === id);
  return { prev: slides[i - 1], next: slides[i + 1], position: i };
}

/** A demo page by id, with its section. */
export function pageById(id: string): { section: DemoSection; page: DemoPage } | undefined {
  for (const section of sections) {
    const page = section.pages.find((p) => p.id === id);
    if (page) return { section, page };
  }
  return undefined;
}
