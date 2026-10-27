import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/npm-skipped-scripts/demo";

export const slide: Slide = {
  id: "install-scripts",
  index: 31,
  section: "package-managers",
  layout: "terminal",
  title: "Install scripts",
  eyebrow: "TERMINAL · NPM 12 · 8 JUL 2026",
  body: ["npm 12 skips install scripts by default. Most of the room hasn't noticed yet."],
  support: {
    tier: "none",
    note: "allowScripts off by default, including the implicit node-gyp rebuild · --allow-git and --allow-remote default to none · strict-allow-scripts turns a skipped script into a hard CI error",
  },
  demo: demo,
  citations: [
    {
      text: "npm 12 defaults and approve flow",
      url: "https://www.socket.dev/blog/npm-12",
    },
    {
      text: "pnpm scripts-off and allowBuilds",
      url: "https://pnpm.io/supply-chain-security",
    },
    {
      text: "pnpm 11",
      url: "https://pnpm.io/blog/releases/11.0",
    },
    {
      text: "Bun trusted list and 1.4 narrowing",
      url: "https://bun.com/blog/bun-v1.4",
    },
    {
      text: "Bun Security Scanner API",
      url: "https://bun.com/docs/pm/security-scanner-api",
    },
    {
      text: "Deno approve-scripts",
      url: "https://deno.com/blog/v2.6",
    },
    {
      text: "pnpm 10.21 trustPolicy",
      url: "https://pnpm.io/blog/releases/10.21",
    },
    {
      text: "Shai-Hulud 2.0 delivery via preinstall",
      url: "https://blog.checkpoint.com/research/shai-hulud-2-0-inside-the-second-coming-the-most-aggressive-npm-supply-chain-attack-of-2025/",
    },
    {
      text: "Axios delivery via postinstall",
      url: "https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise",
    },
    {
      text: "ChainDrop delivery via postinstall",
      url: "https://stepsecurity.io/blog/chaindrop-npm-worm",
    },
  ],
  speakerNotes: "The default flipped in July, and a good part of the room will meet it in their next CI failure. Frame the approve step as the moment a human decides which packages get to run code on their machine, a new habit for the JavaScript ecosystem and an old one everywhere else. Shai-Hulud 2.0 ran at preinstall, Axios and ChainDrop at postinstall, so this default alone would have neutralised all three. For the engineering managers, one sentence each: Bun's Security Scanner API routes every install through Socket or an enterprise scanner from a bunfig.toml entry with fatal blocking the install, and pnpm 10.21's trustPolicy no-downgrade fails the install when a package from a trusted publisher arrives with weaker provenance, a cheap tripwire for stolen laptops. Then the number that keeps this act honest.",
  timing: {
    minutes: 1,
    cumulative: 30.75,
  },
};
