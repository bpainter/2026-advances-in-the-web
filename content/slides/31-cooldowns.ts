import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/pnpm-cooldown/demo";

export const slide: Slide = {
  id: "cooldowns",
  index: 31,
  section: "package-managers",
  layout: "terminal",
  title: "Cooldowns",
  eyebrow: "TERMINAL · PNPM 11 · DEFAULT ON SINCE LATE APR 2026",
  body: ["pnpm 11 refuses a day-old version, and says why."],
  support: {
    tier: "none",
    note: "minimumReleaseAge: 1 day · blockExoticSubdeps: true · strictDepBuilds: true · pnpm audit --fix lets security patches jump the queue",
  },
  demo: demo,
  citations: [
    {
      text: "pnpm 10.16 minimumReleaseAge; packages typically removed within an hour",
      url: "https://pnpm.io/blog/releases/10.16",
    },
    {
      text: "pnpm 11 defaults, audit --fix exclude",
      url: "https://pnpm.io/blog/releases/11.0",
    },
    {
      text: "npm min-release-age, ETARGET",
      url: "https://github.com/npm/cli/releases/tag/v11.10.0",
    },
    {
      text: "min-release-age walkthrough",
      url: "https://dev.classmethod.jp/articles/npm-v11-min-release-age/",
    },
    {
      text: "Collina gotchas",
      url: "https://gist.github.com/mcollina/b294a6c39ee700d24073c0e5a4e93104",
    },
  ],
  speakerNotes: "Nobody is doing terminal demos of cooldowns on a conference stage, which is why this one is here. The registry removes malicious packages typically within an hour, so a one-day cooldown skips almost every incident on the timeline. The package manager now makes a time-based judgement on your behalf, and the override shows it remains your judgement. Read the resolved versions aloud; the back of the room can't see a terminal. The npm equivalent is npm config set min-release-age=3, in days, applied transitively, failing with ETARGET when you ask for a too-new version explicitly, and it's not default-on in npm 11 or 12.",
  timing: {
    minutes: 1,
    cumulative: 30,
  },
};
