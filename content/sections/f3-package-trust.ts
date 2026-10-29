import type { Action, DemoSection } from "@/content/demo-schema";
import { repoFile, sectionCode } from "@/lib/demo-files";

const USED_TO = "demos/07-package-workflow/used-to";
const T = (a: number, b: number): Action => ({ type: "terminal", lines: [a, b] });

/** F3: blanket script bans and a stored token, then pnpm permissions, a release-age gate and staged publishing. */
export const section: DemoSection = {
  id: "f3-package-trust",
  background: "f3",
  order: 13,
  label: "Package trust",
  feature: "Package trust",
  scenario:
    "A workspace adds a package with an install script, then publishes a package through CI.",
  support: {
    kind: "tooling",
    packages: [
      { name: "pnpm", npm: "pnpm", version: "12.11", logo: "/logos/pnpm.svg" },
      { name: "npm", npm: "npm", version: "11.15", logo: "/logos/npm.svg" },
    ],
  },
  pages: [
    {
      id: "f3-intro",
      stage: "intro",
      intro:
        "Package managers changed their defaults this year. We follow one package from install to release. Each step is a recorded terminal session.",
      description:
        "Package managers now ask before a package runs code, and a person approves each release.",
      visual: {
        src: "/intro/f3-package-trust.png",
        alt: "The terminal listing a denied install script, then its one-line approval.",
        capture: { pageId: "f3-now", stepId: "s2" },
      },
      steps: [{ id: "s0", label: "Title and support", actions: [], bullets: [] }],
      timing: { minutes: 0.25 },
    },
    {
      id: "f3-used-to",
      stage: "used-to",
      eyebrow: "Package trust",
      title: "What we used to do",
      intro:
        "This timeline shows npm attacks from August 2025 to October 2026. Here is how teams defended.",
      frame: {
        build: "static",
        route: "/demos/07-package-workflow/timeline",
        viewport: { width: 640, height: 628 },
        hooks: ["reset"],
      },
      files: [
        repoFile(`${USED_TO}/.npmrc`, "bash"),
        repoFile(`${USED_TO}/ci.yml`, "yaml"),
        repoFile(`${USED_TO}/publish.yml`, "yaml"),
      ],
      steps: [
        {
          id: "s0",
          label: "Empty axis",
          actions: [{ type: "hook", name: "reset" }],
          code: { file: ".npmrc", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Attacks in 2025",
          actions: [
            { type: "reveal", target: "#incident-1" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#incident-2" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#incident-3" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#incident-4" },
          ],
          code: { file: ".npmrc", lines: [[1, 3]] },
          spotlight: ["#incident-1", "#incident-4"],
          bullets: [
            "In 2025, install scripts ran malware. Teams turned off every script in one file.",
          ],
        },
        {
          id: "s2",
          label: "Attacks in 2026",
          actions: [
            { type: "reveal", target: "#incident-5" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#incident-6" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#incident-7" },
            { type: "wait", ms: 250 },
            { type: "reveal", target: "#incident-8" },
          ],
          code: { file: "ci.yml", lines: [[11, 15]] },
          spotlight: ["#incident-6", "#incident-7"],
          bullets: [
            "Each attack was live for hours. CI blocked scripts, then rebuilt trusted packages by hand.",
          ],
        },
        {
          id: "s3",
          label: "The old release",
          key: true,
          actions: [{ type: "pointer", to: "#incident-8" }],
          code: { file: "publish.yml", lines: [[16, 20]] },
          spotlight: ["#incident-8"],
          bullets: [
            "Releases used a long-lived token stored in CI.",
            "Anyone who stole it could publish to every user.",
          ],
        },
      ],
      timing: { minutes: 0.5 },
    },
    {
      id: "f3-now",
      stage: "now",
      eyebrow: "Package trust",
      title: "What we can do today",
      intro:
        "The install steps were recorded on this laptop against a test registry. The release steps are an example. The policy and workflow files are on the right.",
      frame: {
        build: "terminal",
        route: "/demos/07-package-workflow/terminal/session",
        viewport: { width: 640, height: 628 },
        hooks: ["reset"],
      },
      files: [
        sectionCode("f3-package-trust", "pnpm-workspace.yaml", "yaml"),
        sectionCode("f3-package-trust", "publish.yml", "yaml"),
      ],
      steps: [
        {
          id: "s0",
          label: "Policy file",
          actions: [{ type: "hook", name: "reset" }, T(1, 4)],
          code: { file: "pnpm-workspace.yaml", lines: [] },
          bullets: [],
        },
        {
          id: "s1",
          label: "Script blocked",
          actions: [T(5, 10)],
          code: { file: "pnpm-workspace.yaml", lines: [[7, 9]] },
          ifKeyboard:
            "Run pnpm add -w report-exporter, then ls .marker. Press Next once to sync the frame.",
          bullets: [
            "Adding the package stops at its install script. Nothing ran.",
            "The workspace file lists what each package may run. This one starts at no.",
          ],
        },
        {
          id: "s2",
          label: "Review and approve",
          key: true,
          actions: [T(11, 30)],
          code: { file: "pnpm-workspace.yaml", lines: [[7, 9]] },
          proof: "Show the permission entry in version control so the decision is reviewable.",
          ifKeyboard:
            "Run pnpm permissions, pnpm approve and git diff, then pnpm install. Press Next once to sync.",
          bullets: [
            "We check what the package asks for and approve it. Now the script runs.",
            "The approval is one line in a committed file, so it gets code review.",
          ],
        },
        {
          id: "s3",
          label: "Too new to install",
          actions: [T(31, 49)],
          code: { file: "pnpm-workspace.yaml", lines: [[4, 5]] },
          bullets: [
            "Version 1.3.0 is minutes old, so pnpm refuses it until it is a day old.",
            "Attacks were live for hours, so a one-day wait skips most of them.",
            "npm refuses a package from a plain web address.",
          ],
        },
        {
          id: "s4",
          label: "Stage the release",
          actions: [T(50, 69)],
          code: {
            file: "publish.yml",
            lines: [
              [19, 21],
              [29, 30],
            ],
          },
          bullets: [
            "This part is an example, not a recording. CI stops at a staged release.",
            "CI signs in with a short-lived token. No long-lived token is stored.",
            "A maintainer downloads the exact package and reads its files.",
          ],
        },
        {
          id: "s5",
          label: "Approve and check",
          actions: [T(70, 74)],
          code: { file: "publish.yml", lines: [30] },
          proof:
            "Inspect the staged tarball before approval and show the provenance or trusted-publishing record.",
          bullets: [
            "Approval asks for a one-time password, then the version goes live.",
            "The signature check ties the release to the workflow that built it.",
          ],
        },
      ],
      timing: { minutes: 2.25 },
    },
  ],
  citations: [
    {
      text: "Nx s1ngularity, 26 Aug 2025, about eight hours live",
      url: "https://www.wiz.io/blog/s1ngularity-supply-chain-attack",
    },
    {
      text: "chalk and debug, 8 Sep 2025, about two hours live",
      url: "https://www.stepsecurity.io/blog/20-popular-npm-packages-compromised-chalk-debug-strip-ansi-color-convert-wrap-ansi",
    },
    {
      text: "Shai-Hulud, 14 to 16 Sep 2025, 500+ packages",
      url: "https://sysdig.com/blog/shai-hulud-the-novel-self-replicating-worm-infecting-hundreds-of-npm-packages",
    },
    {
      text: "Shai-Hulud 2.0, 21 to 24 Nov 2025, preinstall, 621 packages",
      url: "https://blog.checkpoint.com/research/shai-hulud-2-0-inside-the-second-coming-the-most-aggressive-npm-supply-chain-attack-of-2025/",
    },
    {
      text: "Axios, 31 Mar 2026, about three hours live",
      url: "https://securitylabs.datadoghq.com/articles/axios-npm-supply-chain-compromise",
    },
    {
      text: "TanStack, 11 May 2026, valid provenance; mitigations that held",
      url: "https://snyk.io/blog/tanstack-npm-packages-compromised",
    },
    {
      text: "ChainDrop, 4 Aug 2026, valid trusted publishing and SLSA provenance; provenance proves which commit was built, not that it was authorised",
      url: "https://stepsecurity.io/blog/chaindrop-npm-worm",
    },
    {
      text: "SlugFest, 13 Oct 2026, 1,500+ packages exposed",
      url: "https://helpnetsecurity.com/2026/10/13/slugfest-npm-trusted-publishing-flaw",
    },
    {
      text: "GitHub, the case for a cooldown: 6,500+ npm malware advisories in the year to May 2026",
      url: "https://github.blog/security/supply-chain-security/the-case-for-a-cooldown-why-dependabot-now-waits-before-issuing-version-updates/",
    },
    {
      text: "Dependabot three-day default cooldown, 14 Jul 2026",
      url: "https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/",
    },
    {
      text: "Collina: set the cooldown in the package manager and the update bot",
      url: "https://gist.github.com/mcollina/b294a6c39ee700d24073c0e5a4e93104",
    },
    {
      text: "pnpm 12.11.0: permissions, pnpm approve",
      url: "https://pnpm.io/blog/releases/12.11.0",
    },
    {
      text: "pnpm 12.12.0: signed remote cache",
      url: "https://pnpm.io/blog/releases/12.12.0",
    },
    {
      text: "GitHub, staged publishing and new install-time controls for npm",
      url: "https://github.blog/changelog/2026-05-29-staged-publishing-and-new-install-time-controls-for-npm/",
    },
    {
      text: "npm-stage CLI reference",
      url: "https://docs.npmjs.com/cli/v11/commands/npm-stage/",
    },
    {
      text: "Aikido: about 21% of the top 51,370 packages use trusted publishing (Q&A only)",
      url: "https://www.aikido.dev/blog/shai-hulud-trusted-publishing",
    },
  ],
  cautions: [
    "Permissions limit install scripts. They do not review what the package does when it runs.",
    "A release-age wait also delays urgent fixes. Write down how to skip it.",
    "Decide who may approve a staged release and what they check first.",
  ],
};
