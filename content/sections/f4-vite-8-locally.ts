import type { DemoSection } from "@/content/demo-schema";

/** F4: the same repository under the existing Vite setup and Vite 8, measured on this laptop. */
export const section: DemoSection = {
  id: "f4-vite-8-locally",
  background: "f4",
  order: 14,
  label: "Vite 8 locally",
  scenario:
    "One fixture app built with Vite 7 and with Vite 8 on this laptop.",
  pages: [
    {
      id: "f4-single",
      stage: "single",
      badge: { text: "Vite 7 and Vite 8, measured here" },
      title: "Vite 8 locally",
      intro:
        "Here’s a local build-tool comparison using the same project.\n\nThe useful question is what changes for this codebase, not which tool has the biggest number on its website.",
      frame: {
        build: "static",
        route: "/demos/09-vite-8/static",
        viewport: { width: 1304, height: 628 },
        hooks: ["reset"],
      },
      steps: [
        {
          id: "s0",
          label: "Table header",
          actions: [{ type: "hook", name: "reset" }],
          bullets: [],
        },
        {
          id: "s1",
          label: "Build times",
          actions: [
            { type: "reveal", target: "#row-cold" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#row-warm" },
          ],
          spotlight: ["#row-cold", "#row-warm"],
          ifKeyboard: "If asked, run pnpm measure:vite and show the JSON.",
          bullets: [
            "Look at the recorded cold and warm runs.",
            "The newer setup is faster in this fixture. That’s a result for this project and machine, not a promise that every build will improve by the same amount.",
          ],
        },
        {
          id: "s2",
          label: "Output size",
          actions: [{ type: "reveal", target: "#row-size" }],
          spotlight: ["#row-size"],
          bullets: [
            "Now compare the output.",
            "The bundle size is about the same in this example. Faster build tooling doesn’t automatically mean less JavaScript for the user.",
            "Those are separate measurements.",
          ],
        },
        {
          id: "s3",
          label: "Warnings and plugins",
          key: true,
          actions: [
            { type: "reveal", target: "#row-warnings" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#row-plugins" },
          ],
          spotlight: ["#row-warnings", "#row-plugins"],
          bullets: [
            "The three plugins in this fixture complete without warnings.",
            "That’s useful, but it isn’t a compatibility test for every plugin. A practical upgrade still checks the project’s plugins, tests, output, and deployment.",
            "The win is less waiting without changing what the application is meant to do.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
      cutPriority: 2,
    },
  ],
  citations: [
    {
      text: "Vite Team, Vite 8.0 is out (Rolldown; the 10 to 30 times claim is background only)",
      url: "https://vite.dev/blog/announcing-vite8.html",
    },
  ],
  cautions: [],
};
