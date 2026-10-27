import type { Field, Layout, Slide } from "@/content/schema";

// Image-backed layouts sit on navy so their text is white over the scrimmed still.
const DEFAULT_FIELD: Partial<Record<Layout, Field>> = { title: "navy", statement: "navy", section: "navy", close: "navy", "image-led": "navy" };

export function fieldFor(slide: Slide): Field {
  return slide.field ?? DEFAULT_FIELD[slide.layout] ?? "white";
}
