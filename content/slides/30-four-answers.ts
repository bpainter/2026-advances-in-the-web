import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "four-answers",
  index: 30,
  section: "package-managers",
  layout: "list",
  title: "Four answers, every package manager",
  eyebrow: "FOUR ANSWERS",
  items: [
    {
      label: "Cooldowns",
      detail: "Refuse versions younger than N days. pnpm 11 default 1 day; Dependabot default 3 (14 Jul 2026); Renovate 3; npm 11.10 min-release-age opt-in; Yarn 4.10 in minutes; Bun 1.3 in seconds with a stability check; Deno 2.6.",
      icon: "clock",
    },
    {
      label: "Install scripts off",
      detail: "pnpm 10 first; npm 12 (8 Jul 2026) made it universal with allowScripts off and npm approve-scripts; Bun's trusted list; Deno approve-scripts.",
      icon: "shield-off",
    },
    {
      label: "Short-lived or OIDC publish credentials",
      detail: "Classic tokens revoked 9 Dec 2025; two-hour npm login sessions; granular write tokens capped at 90 days; trusted publishing GA 31 Jul 2025.",
      icon: "key-round",
    },
    {
      label: "Staged publishing",
      detail: "npm stage publish, approve, reject with a human 2FA step (GA May 2026, npm CLI 11.15+); pnpm stage; yarn npm stage. 2FA-bypass tokens lose direct publishing around Jan 2027.",
      icon: "inbox",
    },
  ],
  citations: [
    {
      text: "pnpm 10.16",
      url: "https://pnpm.io/blog/releases/10.16",
    },
    {
      text: "pnpm 11 defaults",
      url: "https://pnpm.io/blog/releases/11.0",
    },
    {
      text: "pnpm supply-chain docs",
      url: "https://pnpm.io/supply-chain-security",
    },
    {
      text: "Yarn 4.10",
      url: "https://github.com/yarnpkg/berry/releases/tag/%40yarnpkg%2Fcli%2F4.10.0",
    },
    {
      text: "Collina gist",
      url: "https://gist.github.com/mcollina/b294a6c39ee700d24073c0e5a4e93104",
    },
    {
      text: "Bun 1.3",
      url: "https://bun.com/blog/bun-v1.3",
    },
    {
      text: "Bun 1.4",
      url: "https://bun.com/blog/bun-v1.4",
    },
    {
      text: "Bun install docs",
      url: "https://bun.com/docs/pm/cli/install",
    },
    {
      text: "npm 11.10 min-release-age",
      url: "https://github.com/npm/cli/releases/tag/v11.10.0",
    },
    {
      text: "min-release-age walkthrough",
      url: "https://dev.classmethod.jp/articles/npm-v11-min-release-age/",
    },
    {
      text: "Nesbitt: package managers need to cool down",
      url: "https://nesbitt.io/2026/03/04/package-managers-need-to-cool-down",
    },
    {
      text: "Deno 2.6",
      url: "https://deno.com/blog/v2.6",
    },
    {
      text: "Dependabot 3-day default",
      url: "https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/",
    },
    {
      text: "Renovate minimum release age",
      url: "https://docs.renovatebot.com/key-concepts/minimum-release-age/",
    },
    {
      text: "npm 12",
      url: "https://www.socket.dev/blog/npm-12",
    },
    {
      text: "Classic tokens revoked 9 Dec 2025",
      url: "https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/",
    },
    {
      text: "Trusted publishing GA",
      url: "https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/",
    },
    {
      text: "Staged publishing",
      url: "https://infoq.com/news/2026/08/npm-stage-available",
    },
    {
      text: "Bun acquisition",
      url: "https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone",
    },
  ],
  speakerNotes: "This is a map for the two demos that follow, so keep it to thirty seconds and point at items one and two. The spread on cooldowns is itself the point: 1 day for pnpm, 3 for Dependabot and Renovate, 7 in Bun's example, and eight of ten attacks had sub-week exposure, so three days is a defensible team default; Collina's claim that a 24-hour cooldown would have blocked axios 1.14.1 holds on the timeline. Set the cooldown in both the package manager and the update bot or the bot opens PRs that CI can't install; npx and bunx reportedly don't honour it, and Yarn silently ignores day suffixes like 7d, so use minutes. Since Shai-Hulud 2.0, Axios, and ChainDrop all delivered via install scripts, the scripts-off default alone would have neutralised three headline incidents. Two of the four package managers in the terminal are corporate-owned, Bun by Anthropic since 2 December 2025, still MIT, and Vite's team by Cloudflare, and that gets said once before the terminal.",
  timing: {
    minutes: 0.5,
    cumulative: 29,
  },
};
