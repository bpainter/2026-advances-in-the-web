import type { DemoSection } from "@/content/demo-schema";

/** F4: the same repository under the existing Vite setup and Vite 8, measured on this laptop. */
export const section: DemoSection = {
  id: "f4-vite-8-locally",
  order: 10,
  label: "Vite 8 locally",
  scenario:
    "One fixture app built with Vite 7 and with Vite 8 on this laptop.",
  pages: [
    {
      id: "f4-single",
      stage: "single",
      title: "Vite 8 locally",
      intro:
        "Vite 8 uses one bundler, Rolldown, for development and builds. We measured our own repository on this laptop.",
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
          bullets: ["Cold build, then warm build. Read both numbers aloud."],
        },
        {
          id: "s2",
          label: "Output size",
          actions: [{ type: "reveal", target: "#row-size" }],
          spotlight: ["#row-size"],
          bullets: ["Output size, from the same build."],
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
            "Warnings and broken plugins are the cost of the upgrade.",
            "These numbers are ours. Your plugins decide yours.",
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
