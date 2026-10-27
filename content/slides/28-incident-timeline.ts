import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "incident-timeline",
  index: 28,
  section: "package-managers",
  layout: "timeline",
  title: "Incident timeline",
  eyebrow: "SECTION 5 · PACKAGE MANAGERS",
  body: ["Every window was hours."],
  items: [
    {
      label: "26 Aug 2025 · Nx s1ngularity",
      detail: "About 8 hours live. postinstall abused installed AI CLIs with --dangerously-skip-permissions; 1,000+ GitHub tokens.",
    },
    {
      label: "8 Sep 2025 · chalk and debug",
      detail: "About 2 hours live. Maintainer phished; 18 versions, 2B+ weekly downloads combined.",
    },
    {
      label: "14 to 16 Sep 2025 · Shai-Hulud",
      detail: "First self-replicating npm worm; 500+ packages.",
    },
    {
      label: "21 to 24 Nov 2025 · Shai-Hulud 2.0",
      detail: "Ran at preinstall; 621 packages, 487 orgs, 14,206 secrets.",
    },
    {
      label: "31 Mar 2026 · Axios",
      detail: "About 3 hours live. Fake dependency with a postinstall RAT.",
    },
    {
      label: "11 May 2026 · TanStack",
      detail: "6 minutes to publish 84 artifacts. OIDC token read from runner memory; shipped with valid provenance; harvested Claude Code session logs.",
    },
    {
      label: "4 Aug 2026 · ChainDrop",
      detail: "444 packages via the projects' own release workflows, with valid trusted publishing and SLSA provenance; stole .claude/credentials.json.",
    },
    {
      label: "13 Oct 2026 · SlugFest",
      detail: "Trusted publisher bound to a mutable owner/repo; 1,500+ packages exposed.",
    },
  ],
  stats: [
    {
      value: "6,500+",
      label: "npm malware advisories in the year to May 2026, about 18 a day",
      source: "https://github.blog/security/supply-chain-security/the-case-for-a-cooldown-why-dependabot-now-waits-before-issuing-version-updates/",
    },
  ],
  citations: [
    {
      text: "Nx s1ngularity",
      url: "https://www.wiz.io/blog/s1ngularity-supply-chain-attack",
    },
    {
      text: "chalk and debug",
      url: "https://www.stepsecurity.io/blog/20-popular-npm-packages-compromised-chalk-debug-strip-ansi-color-convert-wrap-ansi",
    },
    {
      text: "GitHub: the case for a cooldown; 6,500+ advisories",
      url: "https://github.blog/security/supply-chain-security/the-case-for-a-cooldown-why-dependabot-now-waits-before-issuing-version-updates/",
    },
    {
      text: "Shai-Hulud",
      url: "https://sysdig.com/blog/shai-hulud-the-novel-self-replicating-worm-infecting-hundreds-of-npm-packages",
    },
    {
      text: "GitHub plan for a more secure npm supply chain",
      url: "https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/",
    },
    {
      text: "Shai-Hulud 2.0",
      url: "https://blog.checkpoint.com/research/shai-hulud-2-0-inside-the-second-coming-the-most-aggressive-npm-supply-chain-attack-of-2025/",
    },
    {
      text: "Axios",
      url: "https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise",
    },
    {
      text: "TanStack",
      url: "https://snyk.io/blog/tanstack-npm-packages-compromised",
    },
    {
      text: "ChainDrop",
      url: "https://stepsecurity.io/blog/chaindrop-npm-worm",
    },
    {
      text: "SlugFest",
      url: "https://helpnetsecurity.com/2026/10/13/slugfest-npm-trusted-publishing-flaw",
    },
  ],
  speakerNotes: "The timeline is the slide, so resist narrating all eight; pick Nx for the AI-CLI abuse, TanStack for the valid-provenance point, and ChainDrop for the stolen agent credentials, and let the dates carry the rest. Three patterns: every live window was hours, which is the whole argument for cooldowns; 2025 attacks stole tokens and 2026 attacks stole CI pipelines, so provenance proves which commit was built and not that the commit was authorised; and the new target class is AI-agent credentials and config. The chalk family on the delete table is the 8 September incident. Shai-Hulud 2.0 installed Bun to execute its payload, and egress allowlists that blocked that download are one of the mitigations that held. This audience runs coding agents on the same laptops that run npm install, and that's the detail that makes the room sit up.",
  timing: {
    minutes: 1.25,
    cumulative: 28.25,
  },
};
