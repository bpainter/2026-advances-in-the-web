import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "anthropic",
  index: 6,
  section: "open-web",
  layout: "framework-grid",
  title: "Anthropic",
  eyebrow: "REPORTED STRAIGHT",
  items: [
    {
      label: "−86.7%",
      detail: "ClaudeBot crawl-to-refer ratio, Jan to Jul 2025 (286,930 to 38,066). Worst measured, improved fastest.",
    },
    {
      label: "$1.5B",
      detail: "Bartz v. Anthropic settlement, about $3,000 per book across 400,000+ books, approved July 2026.",
    },
    {
      label: "23.6%",
      detail: "Prompt-injection success for autonomous browsing without mitigations, in Claude for Chrome's own launch post. 11.2% with them.",
    },
    {
      label: "2 Dec 2025",
      detail: "Anthropic acquired Bun. Bun stays MIT-licensed.",
    },
  ],
  citations: [
    {
      text: "−86.7%, 286,930 to 38,066, lags in bot verification",
      url: "https://blog.cloudflare.com/crawlers-click-ai-bots-training/",
    },
    {
      text: "$1.5B settlement, $3,000 per book, 400,000+ books",
      url: "https://www.jurist.org/news/2026/07/judge-approves-record-1-5-billion-settlement-involving-anthropic/",
    },
    {
      text: "AAP on final approval",
      url: "https://publishers.org/news/aap-welcomes-courts-final-settlement-approval-in-bartz-v-anthropic/",
    },
    {
      text: "Reddit suit",
      url: "https://www.pbs.org/newshour/nation/reddit-sues-ai-company-over-alleged-industrial-scale-scraping-of-its-users-comments",
    },
    {
      text: "Crawler policy",
      url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-the-web",
    },
    {
      text: "23.6% / 11.2%",
      url: "https://claude.com/resources/articles/claude-for-chrome",
    },
    {
      text: "Bun acquisition",
      url: "https://www.anthropic.com/news/anthropic-acquires-bun-as-claude-code-reaches-usd1b-milestone",
    },
    {
      text: "Simon Willison on the Bun acquisition",
      url: "https://simonwillison.net/2025/Dec/2/anthropic-acquires-bun/",
    },
  ],
  speakerNotes: "We present with Anthropic tooling, so this gets said flat and complete, and two of the four facts are in its favour. Judge Alsup ruled that training on lawfully bought books could be fair use and that building a permanent, general-purpose library from pirated copies was not; the money was about piracy. Reddit sued in June 2025 for continued use after being told to stop, while licensing the same data to Google and OpenAI. Anthropic's crawler policy now names three agents, honours robots.txt, and publishes IPs, and Cloudflare still says it lags in bot verification. The prompt-injection number is the bridge: agents that act on your behalf have attack surfaces a page never had, and the Bun fact comes back in the terminal.",
  timing: {
    minutes: 1,
    cumulative: 5.25,
  },
};
