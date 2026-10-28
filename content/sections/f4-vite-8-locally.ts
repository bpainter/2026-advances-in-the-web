import type { DemoSection } from "@/content/demo-schema";

/** Schema v4 (docs/PRD-demos-v4.md); shown code files live in ./f4-vite-8-locally/files/. */
export const section: DemoSection = {
  id: "f4-vite-8-locally",
  order: 10,
  label: "Vite 8 locally",
  scenario:
    "TODO rewrite: Run the same repository under the existing Vite setup and Vite 8, and capture cold build time, warm build time, output size, warnings, and failing plugins.",
  pages: [
    {
      id: "f4-single",
      stage: "single",
      title: "Vite 8 locally",
      intro:
        "TODO rewrite: Keep Vite 8 concrete. Vite 8 replaces the split esbuild and Rollup path with Rolldown, and this is what that did to our repository.",
      frame: {
        build: "static",
        route: "/demos/09-vite-8/static",
        viewport: {
          width: 1304,
          height: 628,
        },
        hooks: ["reset"],
        poster: "/posters/f4-s3.png",
      },
      steps: [
        {
          id: "s0",
          label: "Table header",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
          ],
          bullets: [
            "TODO rewrite: Same repository, the existing Vite setup against Vite 8, measured on this laptop.",
          ],
        },
        {
          id: "s1",
          label: "Build times",
          actions: [
            {
              type: "reveal",
              target: "#row-cold",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#row-warm",
            },
          ],
          spotlight: ["#row-cold", "#row-warm"],
          bullets: [
            "TODO rewrite: Cold build, then warm build.",
            "TODO rewrite: Read both numbers aloud.",
          ],
          ifKeyboard: "TODO rewrite: Same. If asked, run pnpm measure:vite and show the JSON.",
        },
        {
          id: "s2",
          label: "Output size",
          actions: [
            {
              type: "reveal",
              target: "#row-size",
            },
          ],
          spotlight: ["#row-size"],
          bullets: ["TODO rewrite: Output size, measured on the same build."],
          ifKeyboard: "TODO rewrite: Same.",
        },
        {
          id: "s3",
          label: "Warnings and plugins",
          actions: [
            {
              type: "reveal",
              target: "#row-warnings",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#row-plugins",
            },
          ],
          spotlight: ["#row-warnings", "#row-plugins"],
          bullets: [
            "TODO rewrite: Warnings and failing plugins are the upgrade cost.",
            "TODO rewrite: These are local measurements, so I am not repeating the project's 10 to 30 times benchmark claim.",
            "TODO rewrite: Your plugins decide your number.",
          ],
          ifKeyboard: "TODO rewrite: Same.",
        },
      ],
      timing: {
        minutes: 0.5,
      },
      cutPriority: 2,
    },
  ],
  citations: [
    {
      text: "Vite Team, Vite 8.0 is out (Rolldown; the 10 to 30 times claim is background only)",
      url: "https://vite.dev/blog/announcing-vite8.html",
    },
  ],
  cautions: [
    "TODO rewrite: Avoid vendor benchmark claims in the live narrative unless the same result is reproduced in the demo repository.",
  ],
};
