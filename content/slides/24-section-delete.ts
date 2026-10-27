import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "section-delete",
  index: 24,
  section: "delete",
  layout: "stat",
  title: "Delete things",
  eyebrow: "SECTION 4",
  body: ["uuid out-downloads React."],
  stats: [
    {
      value: "174M",
      label: "uuid weekly downloads, against 116M for React. Native: crypto.randomUUID(), for years.",
      source: "https://api.npmjs.org/downloads/point/last-week/uuid",
    },
    {
      value: "121M",
      label: "node-fetch weekly downloads, years after Node shipped fetch.",
      source: "https://api.npmjs.org/downloads/point/last-week/node-fetch",
    },
  ],
  citations: [
    {
      text: "npm last-week counts, 12 to 18 Oct 2026 (swap the package name)",
      url: "https://api.npmjs.org/downloads/point/last-week/uuid",
    },
    {
      text: "AbortSignal.timeout() Widely 18 Oct 2026",
      url: "https://webstatus.dev/features/abortsignal-timeout",
    },
  ],
  speakerNotes: "One ratio opens the act because it's the most quotable fact in the dependency material: uuid ships 1.5 times as often as React, for a function the platform has had for years. State the counting caveat before anyone else does: downloads include CI and agent-driven installs and run three to four times what late-2025 articles reported, so use ratios between packages rather than absolutes, and npm publishes no unique-project counts. The slide measures inertia, which is what the decision framework at the end is built to overcome. Thirty seconds, then the table.",
  timing: {
    minutes: 0.5,
    cumulative: 24.5,
  },
  field: "navy",
};
