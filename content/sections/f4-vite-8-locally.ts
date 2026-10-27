import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./f4-vite-8-locally/files/. */
export const section: DemoSection = {
  id: "f4-vite-8-locally",
  order: 9,
  label: "Vite 8 locally",
  scenario:
    "Run the same repository under the existing Vite setup and Vite 8, and capture cold build time, warm build time, output size, warnings, and failing plugins.",
  support: {
    tier: "tooling",
    summary: "Vite 8 · Rolldown",
    detail:
      "Vite 8 shipped 12 Mar 2026 and replaces the split esbuild and Rollup path with Rolldown. The comparison runs on the demo repository on the presenting laptop.",
  },
  pages: [
    {
      id: "f4-single",
      stage: "single",
      title: "Vite 8 locally",
      frame: {
        build: "static",
        route: "/demos/09-vite-8",
        viewport: {
          width: 1296,
          height: 856,
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
          notes:
            "Same repository, the existing Vite setup against Vite 8, measured on this laptop.",
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
          notes: "Cold build, then warm build. Read both numbers aloud.",
          ifKeyboard: "Same. If asked, run pnpm measure:vite and show the JSON.",
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
          notes: "Output size, measured on the same build.",
          ifKeyboard: "Same.",
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
          notes:
            "Warnings and failing plugins are the upgrade cost. These are local measurements, so I am not repeating the project's 10 to 30 times benchmark claim. Your plugins decide your number.",
          ifKeyboard: "Same.",
        },
      ],
      notes: {
        open: "Keep Vite 8 concrete. Vite 8 replaces the split esbuild and Rollup path with Rolldown, and this is what that did to our repository.",
        bridge: "Last, a short list of what the core demos let you delete, and what stays.",
      },
      timing: {
        minutes: 0.5,
        cumulative: 30.25,
      },
    },
  ],
  citations: [
    {
      text: "Vite Team, Vite 8.0 is out (Rolldown; the 10 to 30 times claim is background only)",
      url: "https://vite.dev/blog/announcing-vite8.html",
    },
  ],
  cautions: [
    "Avoid vendor benchmark claims in the live narrative unless the same result is reproduced in the demo repository.",
  ],
};
