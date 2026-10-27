import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/popover-commands/demo";

export const slide: Slide = {
  id: "popover-commands",
  index: 9,
  section: "platform-baseline",
  layout: "demo-split",
  title: "Popover and invoker commands",
  eyebrow: "BASELINE NEWLY · 12 DEC 2025",
  body: ["A menu, Esc, light dismiss, and focus return with no script tag."],
  support: {
    tier: "baseline-newly",
    since: "12 Dec 2025 (Safari 26.2, invoker commands); popover 27 Jan 2025",
    note: "The overlay property is Chrome-only, so the exit animation may snap out of the top layer in Safari and Firefox. Say it before it happens.",
  },
  demo: demo,
  citations: [
    {
      text: "Popover Baseline 27 Jan 2025",
      url: "https://webstatus.dev/features/popover",
    },
    {
      text: "Invoker commands Baseline 12 Dec 2025 (Chrome 135, Firefox 144, Safari 26.2)",
      url: "https://webstatus.dev/features/invoker-commands",
    },
    {
      text: ":open Baseline 11 May 2026",
      url: "https://webstatus.dev/features/open-pseudo",
    },
    {
      text: "Safari 26.5 release notes",
      url: "https://webkit.org/blog/17938/webkit-features-for-safari-26-5/",
    },
    {
      text: "@starting-style Baseline 6 Aug 2024",
      url: "https://webstatus.dev/features/starting-style",
    },
    {
      text: "overlay Chrome-only",
      url: "https://api.webstatus.dev/v1/features?q=popover",
    },
    {
      text: "Chrome 154 light-dismiss change",
      url: "https://developer.chrome.com/release-notes/154",
    },
  ],
  speakerNotes: "This is the biggest demo in the deck because it removes the founding reason for a whole class of libraries: overlay management. The accessibility behaviour comes from the spec, so focus return and Esc handling are the same in all three engines instead of three slightly different library implementations. :open matches everywhere since 11 May 2026; @starting-style and allow-discrete shipped 6 August 2024, which makes them Widely in February 2027 by the 30-month rule. Say the Chrome 154 light-dismiss change out loud; someone in the room has already hit it. The custom command is the detail that lands with senior engineers because it inverts where behaviour lives, and then we position the menu without Floating UI.",
  timing: {
    minutes: 2,
    cumulative: 9.25,
  },
};
