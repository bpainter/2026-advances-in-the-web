import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "pnpm-cooldown",
  live: {
    kind: "srcdoc",
    browsers: [],
  },
  code: demoCode("pnpm-cooldown", [
    {
      file: "terminal.sh",
      lang: "bash",
    },
  ]),
  steps: [
    {
      id: "s1",
      highlight: [[3, 6]],
      caption: "The newest version is an hour old.",
      action: "Read the two timestamps aloud.",
    },
    {
      id: "s2",
      highlight: [[7, 10]],
      caption: "latest resolves to the previous version, and the warning says why.",
      action: "Read the resolved version aloud: 3.4.1.",
    },
    {
      id: "s3",
      highlight: [[11, 13]],
      caption: "The override, on purpose. The judgement stays yours.",
      action: "Read the resolved version aloud: 3.4.2.",
    },
  ],
  fork: [
    "https://pnpm.io/blog/releases/11.0",
    "https://gist.github.com/mcollina/b294a6c39ee700d24073c0e5a4e93104",
  ],
  fallback:
    "/fallbacks/pnpm-cooldown.cast (asciinema recording made the night before with the same commands)",
  wow: "The install succeeds, with an older version, and says why.",
  gotcha:
    "npx and bunx reportedly don't honour the cooldown; set the same cooldown in Dependabot or Renovate. Private-registry packages get held back unless excluded; pnpm audit --fix adds patched versions to the exclude list.",
};
