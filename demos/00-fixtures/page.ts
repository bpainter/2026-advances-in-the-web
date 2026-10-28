import type { SinglePage } from "@/content/demo-schema";

/** The fixture page /fixtures/spotlight renders (PRD v5, 3.4). Not part of the deck. */
export const spotlightFixturePage: SinglePage = {
  id: "fixture-spotlight",
  stage: "single",
  title: "Spotlight fixture",
  intro: "Engine fixture.",
  timing: { minutes: 0 },
  frame: { build: "static", route: "/demos/00-fixtures/static", viewport: { width: 640, height: 628 }, hooks: ["reset", "grow", "scaleIn"] },
  steps: [
    { id: "s0", label: "Radii", actions: [], spotlight: ["#r0", "#r8", "#r16", "#pill", "#mixed", "#circle", "#grow", "#panel"], bullets: [] },
    { id: "s1", label: "Grow", actions: [{ type: "hook", name: "grow" }, { type: "wait", ms: 500 }], spotlight: ["#grow"], bullets: [] },
    { id: "s2", label: "Scale in", actions: [{ type: "hook", name: "scaleIn" }, { type: "wait", ms: 300 }], spotlight: ["#panel"], bullets: [] },
  ],
};
