import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "two-dates",
  index: 2,
  section: "cold-open",
  layout: "comparison",
  title: "Two dates, ten months apart",
  eyebrow: "COLD OPEN",
  items: [
    {
      label: "The loud thing",
      detail: "21 Oct 2025: OpenAI launches Atlas, a standalone AI browser\n9 Aug 2026: Atlas shuts down",
    },
    {
      label: "The boring thing",
      detail: "29% to 97%: Interop 2025 shared pass rate, Safari 43 to 99\n35 features reached Baseline in 2025\n1,100+ engine fixes in Safari 27",
    },
  ],
  citations: [
    {
      text: "Atlas launch",
      url: "https://en.wikipedia.org/wiki/ChatGPT_Atlas",
    },
    {
      text: "Atlas shutdown",
      url: "https://www.techradar.com/pro/openai-shuts-down-its-atlas-browser-after-not-even-a-year",
    },
    {
      text: "Anil Dash, an anti-web browser",
      url: "https://www.anildash.com/2025/10/22/atlas-anti-web-browser/",
    },
    {
      text: "Interop 2025 29% to 97%, Safari 43 to 99",
      url: "https://webkit.org/?p=17808",
    },
    {
      text: "35 Baseline features in 2025",
      url: "https://web.dev/baseline/2025",
    },
    {
      text: "Safari 27 over 1,100 fixes",
      url: "https://developer.apple.com/videos/play/wwdc2026/204/",
    },
    {
      text: "Next.js 16 on 21 Oct 2025",
      url: "https://nextjs.org/blog/next-16",
    },
    {
      text: "WebKit: the biggest feature of Safari 27.0 isn't a feature at all",
      url: "https://webkit.org/blog/18325/webkit-features-for-safari-27-0/",
    },
  ],
  speakerNotes: "Atlas launched the same day Next.js 16 shipped, and one of those is still here. Anil Dash called it an anti-web browser the next day because a search produced an AI page with no link to the site it summarised. On the other side is a spreadsheet nobody tweeted about: three vendors agreed on a test list and passed it, 29 to 97 in a year, and Safari's own release post said the biggest feature of 27.0 wasn't a feature at all, just over 1,100 fixes. While everyone watched the robots, the standards bodies did the boring thing. Hold the Dash quote; it earns its place in the next section.",
  timing: {
    minutes: 1.5,
    cumulative: 2,
  },
};
