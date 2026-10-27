import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "npm-skipped-scripts",
  live: {
    kind: "srcdoc",
    browsers: [],
  },
  code: demoCode("npm-skipped-scripts", [
    {
      file: "terminal.sh",
      lang: "bash",
    },
  ]),
  steps: [
    {
      id: "s1",
      highlight: [[3, 6]],
      caption: "A native package installs, and its scripts don't run. Read the warning.",
      action: "Point at the warn lines.",
    },
    {
      id: "s2",
      highlight: [[7, 12]],
      caption:
        "A human approves which packages get to run code on this machine. It writes the entry to package.json.",
      action: "Show the allowScripts entry.",
    },
    {
      id: "s3",
      highlight: [[13, 15]],
      caption: "Install again; the build runs.",
      action: "Read the install line.",
    },
  ],
  fork: ["https://www.socket.dev/blog/npm-12"],
  fallback: "/fallbacks/npm-skipped-scripts.cast (asciinema recording made the night before)",
  wow: "The default changed under everyone in July, and most of the room meets it for the first time in their next CI failure.",
  gotcha:
    "CI that relied on implicit node-gyp rebuilds breaks until approved; use strict-allow-scripts so it breaks loudly. Expect to approve sharp, better-sqlite3, bcrypt, Cypress, Playwright, Puppeteer, and Electron.",
};
