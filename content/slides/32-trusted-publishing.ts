import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "trusted-publishing",
  index: 32,
  section: "package-managers",
  layout: "stat",
  title: "Trusted publishing",
  eyebrow: "ADOPTION",
  body: ["Provenance proves which commit was built. It doesn't prove the commit was authorised."],
  stats: [
    {
      value: "21%",
      label: "of the top 51,370 npm packages use trusted publishing. Packages representing about 75% of download volume still publish with long-lived tokens, and the mechanism was bypassed three times in 2026 (TanStack, ChainDrop, SlugFest).",
      source: "https://www.aikido.dev/blog/shai-hulud-trusted-publishing",
    },
  ],
  citations: [
    {
      text: "21% and 75%",
      url: "https://www.aikido.dev/blog/shai-hulud-trusted-publishing",
    },
    {
      text: "Mitigations that held (TanStack)",
      url: "https://snyk.io/blog/tanstack-npm-packages-compromised",
    },
    {
      text: "Mitigations that held (ChainDrop)",
      url: "https://stepsecurity.io/blog/chaindrop-npm-worm",
    },
    {
      text: "Token plan (September)",
      url: "https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/",
    },
    {
      text: "Token changelog (December)",
      url: "https://github.blog/changelog/2025-12-09-npm-classic-tokens-revoked-session-based-auth-and-cli-token-management-now-available/",
    },
    {
      text: "Corepack removed from Node 25",
      url: "https://nodejs.org/blog/release/v25.0.0",
    },
    {
      text: "pnpm 11 devEngines",
      url: "https://pnpm.io/blog/releases/11.0",
    },
  ],
  speakerNotes: "We end the act on the number that stops it being a victory lap: four-fifths of the top packages still publish with the credentials the 2025 attacks stole, and the new mechanism was bypassed three times this year. The mitigations that held: pin trusted publishing to a workflow file and a branch, id-token write only on the publish job, egress allowlists that block the Bun download the worms relied on, and phishing-resistant MFA. For a design-system or SDK team the practical consequence is that CI publish tokens stopped working on 9 December 2025 unless already migrated; the September plan said seven-day publish tokens and the December changelog says a 90-day maximum, so quote the changelog. Corepack is gone from the Node 25 and 26 tarballs, so packageManager pins do nothing on a clean machine unless you install Corepack, use a version manager, or rely on pnpm 11's devEngines.packageManager with pmOnFail. Now, how to decide.",
  timing: {
    minutes: 0.75,
    cumulative: 31.5,
  },
  cutPriority: 10,
  field: "navy",
};
