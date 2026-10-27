import type { DemoSection } from "@/content/demo-schema";
import { sectionFile } from "@/lib/demo-files";

/** Extracted from PRD_Demos.md by scripts/extract-demo-prd.mts; code files live in ./f3-package-trust/files/. */
export const section: DemoSection = {
  id: "f3-package-trust",
  order: 8,
  label: "Package trust",
  scenario:
    "A small workspace adds a package with an install script, upgrades its build tool, then publishes an internal UI package through CI.",
  support: {
    tier: "tooling",
    summary: "pnpm 12.11 · npm 11.15",
    detail:
      "pnpm 12.11: permissions, pnpm permissions, pnpm approve (build scripts and agent skills); minimumReleaseAge. npm 11.15: --allow-git, --allow-remote, --allow-file, --allow-directory; npm stage publish, list, view, download, approve. pnpm 12.12 signed remote cache is an aside only.",
  },
  pages: [
    {
      id: "f3-today",
      stage: "today",
      title: "Package trust: today",
      frame: {
        build: "static",
        route: "/demos/07-package-workflow/timeline",
        viewport: {
          width: 1296,
          height: 856,
        },
        hooks: ["reset"],
        poster: "/posters/f3-today-s3.png",
      },
      steps: [
        {
          id: "s0",
          label: "Empty axis",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
          ],
          notes: "Eighteen months of npm incidents, August 2025 to October 2026.",
        },
        {
          id: "s1",
          label: "2025 incidents",
          actions: [
            {
              type: "reveal",
              target: "#incident-1",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#incident-2",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#incident-3",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#incident-4",
            },
          ],
          spotlight: ["#incident-1", "#incident-2"],
          notes:
            "2025. Nx in August ran a postinstall that abused installed AI command-line tools, live about eight hours. chalk and debug in September came from a phished maintainer and were live about two hours. The two Shai-Hulud worms republished themselves through stolen tokens, and the second one ran at preinstall.",
          ifKeyboard: "Same.",
        },
        {
          id: "s2",
          label: "2026 incidents",
          actions: [
            {
              type: "reveal",
              target: "#incident-5",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#incident-6",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#incident-7",
            },
            {
              type: "wait",
              ms: 250,
            },
            {
              type: "reveal",
              target: "#incident-8",
            },
          ],
          spotlight: ["#incident-6", "#incident-7"],
          notes:
            "2026. Axios was live about three hours. TanStack and ChainDrop shipped with valid provenance, and ChainDrop went after agent credentials on developer laptops. Every live window was hours.",
          ifKeyboard: "Same.",
        },
        {
          id: "s3",
          label: "What teams commonly maintain",
          actions: [],
          callouts: [
            {
              target: "#incident-4",
              text: "Install scripts run",
              side: "bottom",
            },
            {
              target: "#incident-2",
              text: "Day-zero versions install",
              side: "top",
            },
            {
              target: "#incident-3",
              text: "Long-lived publish tokens",
              side: "bottom",
            },
            {
              target: "#incident-7",
              text: "Consumers notice first",
              side: "top",
            },
          ],
          notes:
            "Install scripts run as a side effect of dependency installation unless a team adds separate controls. A newly published package version can enter CI immediately after release. A long-lived registry token publishes directly to the public version stream, and the first person to notice a bad package may be a consumer after publication.",
          ifKeyboard: "Same.",
        },
      ],
      notes: {
        open: "The package section follows one dependency from intake to release. First, why the install-time defaults changed.",
        bridge:
          "Current tools close each of those gaps. Here they are on a harmless fixture package.",
      },
      timing: {
        minutes: 0.75,
        cumulative: 27,
      },
    },
    {
      id: "f3-now",
      stage: "now",
      title: "Package trust: now",
      frame: {
        build: "terminal",
        route: "/demos/07-package-workflow/terminal/session",
        viewport: {
          width: 1296,
          height: 856,
        },
        hooks: ["reset"],
        poster: "/posters/f3-now-s7.png",
      },
      steps: [
        {
          id: "s0",
          label: "Clean terminal",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
            {
              type: "terminal",
              lines: [1, 5],
            },
          ],
          notes:
            "Recorded sessions, pnpm 12.11 and npm 11.15, against a private test registry on this laptop.",
        },
        {
          id: "s1",
          label: "Add: script blocked",
          actions: [
            {
              type: "terminal",
              lines: [6, 12],
            },
          ],
          notes:
            "pnpm 12.11 records dependency permissions. The package installs, its install script does not run, and there is no marker file.",
          ifKeyboard: "Run pnpm add report-exporter and ls .marker in the fixture workspace.",
        },
        {
          id: "s2",
          label: "Review and approve",
          actions: [
            {
              type: "terminal",
              lines: [13, 23],
            },
          ],
          notes:
            "pnpm permissions shows what the package asks for. pnpm approve is the review step, and I allow this one on purpose. The decision lands in pnpm-workspace.yaml, so it goes through code review like any other change.",
          ifKeyboard: "Run pnpm permissions, pnpm approve, then git diff pnpm-workspace.yaml.",
          proof: "Show the permission entry in version control so the decision is reviewable.",
        },
        {
          id: "s3",
          label: "Install: script runs",
          actions: [
            {
              type: "terminal",
              lines: [24, 27],
            },
          ],
          notes:
            "Install again and the script runs. The marker file shows the whole path: blocked, reviewed, then intentionally allowed.",
          ifKeyboard: "Run pnpm install and cat .marker.",
          proof:
            "Use a harmless local fixture package whose install script writes a marker file. Show it blocked, reviewed, and then intentionally allowed.",
        },
        {
          id: "s4",
          label: "Too new: held back",
          actions: [
            {
              type: "terminal",
              lines: [28, 35],
            },
          ],
          notes:
            "minimumReleaseAge can keep versions that are too new outside the resolution window. Version 1.3.0 is minutes old, so the install takes 1.2.0 and says why. Dependabot has used a three-day cooldown by default since 14 July.",
          ifKeyboard:
            "Run pnpm add report-exporter@latest after publishing 1.3.0 to the test registry.",
        },
        {
          id: "s5",
          label: "npm: remote source refused",
          actions: [
            {
              type: "terminal",
              lines: [36, 43],
            },
          ],
          notes:
            "npm 11.15 adds install-source allow flags for Git, remote URLs, files, and directories. This project sets remote sources to none, so a tarball URL is refused until someone passes --allow-remote on purpose.",
          ifKeyboard: "Run the npm install against the tarball URL in the fixture project.",
        },
        {
          id: "s6",
          label: "Staged, then inspected",
          actions: [
            {
              type: "terminal",
              lines: [44, 63],
            },
          ],
          notes:
            "npm staged publishing can require an authenticated maintainer to approve a tarball after CI uploads it. CI staged version 2.4.0. I list it, view it, download the exact tarball, and read its file list, all against the test registry.",
          ifKeyboard: "Play the recording; do not run staging live.",
          proof:
            "Use a private test registry or a recorded terminal session for staged publishing. Do not risk a live public release during the talk.",
        },
        {
          id: "s7",
          label: "Approve, check the record",
          actions: [
            {
              type: "terminal",
              lines: [64, 69],
            },
          ],
          notes:
            "Approval asks for a one-time password, then the version goes live. npm audit signatures shows the attestation, which ties the release to the workflow and branch that built it.",
          ifKeyboard: "Play the recording.",
          proof:
            "Inspect the staged tarball before approval and show the provenance or trusted-publishing record.",
        },
      ],
      notes: {
        open: "A small workspace adds a package with an install script, then publishes an internal UI package through CI. The package is a local fixture whose install script writes a marker file and does nothing else.",
        bridge: "Two files make this repeatable: the workspace policy and the publish workflow.",
      },
      timing: {
        minutes: 1.25,
        cumulative: 28.25,
      },
    },
    {
      id: "f3-code",
      stage: "code",
      title: "Package trust: code",
      frame: {
        build: "terminal",
        route: "/demos/07-package-workflow/terminal/session",
        viewport: {
          width: 1296,
          height: 856,
        },
        hooks: ["reset"],
        poster: "/posters/f3-code-s5.png",
      },
      files: [
        {
          file: "pnpm-workspace.yaml",
          lang: "yaml",
          source: sectionFile("f3-package-trust", "pnpm-workspace.yaml"),
        },
        {
          file: "publish.yml",
          lang: "yaml",
          source: sectionFile("f3-package-trust", "publish.yml"),
        },
      ],
      steps: [
        {
          id: "s0",
          label: "Policy file",
          actions: [
            {
              type: "hook",
              name: "reset",
            },
            {
              type: "terminal",
              lines: [1, 5],
            },
          ],
          notes: "The workspace policy on the right, the same recordings on the left.",
        },
        {
          id: "s1",
          label: "Permission entry",
          actions: [
            {
              type: "terminal",
              lines: [6, 23],
            },
          ],
          code: {
            file: "pnpm-workspace.yaml",
            lines: [[7, 9]],
          },
          notes:
            "This is the policy as committed before review: build false. pnpm approve flips that line, and the diff in the terminal is the reviewable decision.",
          ifKeyboard: "Open pnpm-workspace.yaml next to git diff.",
        },
        {
          id: "s2",
          label: "Release-age gate",
          actions: [
            {
              type: "terminal",
              lines: [24, 43],
            },
          ],
          code: {
            file: "pnpm-workspace.yaml",
            lines: [[4, 5]],
          },
          notes:
            "minimumReleaseAge is in minutes, so 1440 is one day. Set the same window in your update bot, or the bot opens pull requests that CI cannot install. The npm refusal below it comes from the project's .npmrc, which sets remote sources to none.",
          ifKeyboard: "Same.",
        },
        {
          id: "s3",
          label: "OIDC only on publish",
          actions: [
            {
              type: "terminal",
              lines: [44, 48],
            },
          ],
          code: {
            file: "publish.yml",
            lines: [
              [5, 6],
              [19, 21],
            ],
          },
          notes:
            "The workflow starts read-only. id-token: write appears only on the publish job, which is the OIDC trusted-publishing path GitHub recommends pairing with staging. Pinning trusted publishing to one workflow file and one branch, with id-token write only on the publish job, is one of the mitigations that held in 2026.",
          ifKeyboard: "Open the workflow file in the editor.",
        },
        {
          id: "s4",
          label: "CI stages the release",
          actions: [
            {
              type: "terminal",
              lines: [49, 63],
            },
          ],
          code: {
            file: "publish.yml",
            lines: [18, 30],
          },
          notes:
            "The publish job ends at npm stage publish. The environment gives that job its own protection rules, and a maintainer still has to inspect and approve the staged tarball.",
          ifKeyboard: "Same.",
        },
        {
          id: "s5",
          label: "Approve, then the cautions",
          actions: [
            {
              type: "terminal",
              lines: [64, 69],
            },
          ],
          code: {
            file: "publish.yml",
            lines: [30],
          },
          notes:
            "Provenance proves where a package was built. It does not prove who authorised the release, and TanStack and ChainDrop both shipped with valid provenance. pnpm 12.12 can share signed task results and dependency builds through a remote cache; treat that as a separate CI optimization after the trust workflow is clear. Then the cautions.",
          ifKeyboard: "Same.",
        },
      ],
      notes: {
        open: "Two files. The workspace policy decides what installs. The workflow decides how a release gets staged.",
        bridge:
          "The same workspace also upgraded its build tool. Here is what Vite 8 did to our repository.",
      },
      timing: {
        minutes: 1.5,
        cumulative: 29.75,
      },
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
    "Permissions reduce install-time risk. They do not review the package's runtime behavior or remove the need for dependency scanning.",
    "A release-age gate reduces exposure to a brand-new compromise, but it also delays urgent fixes. Document the override path.",
    "Staged publishing adds a human checkpoint. Define who may approve, what evidence they inspect, and how an abandoned stage is removed.",
    "Remote caches need signing, access control, retention, and a clear response when cached output is suspected.",
  ],
};
