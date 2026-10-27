import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "crawl-to-referral",
  index: 5,
  section: "open-web",
  layout: "comparison",
  title: "Crawl-to-referral ratio",
  eyebrow: "CLOUDFLARE, SPOKEN BY MATTHEW PRINCE",
  body: ["Pages crawled for every visitor sent back."],
  items: [
    {
      label: "The ratio",
      detail: "Google 6:1 (2:1 ten years ago)\nOpenAI 250:1\nAnthropic 6,000:1",
    },
    {
      label: "What Cloudflare did",
      detail: "1 Jul 2025: default flipped to block AI crawlers\n80% of AI crawling was for training, 2% for user-triggered actions\nAlso a Platinum sponsor of Ladybird",
    },
  ],
  citations: [
    {
      text: "6:1, 250:1, 6,000:1",
      url: "https://searchengineland.com/ai-killing-web-business-model-455157",
    },
    {
      text: "80% training, 2% user actions",
      url: "https://blog.cloudflare.com/crawlers-click-ai-bots-training/",
    },
    {
      text: "1 Jul 2025 default block; traffic was always a poor proxy for value",
      url: "https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/",
    },
    {
      text: "15 Sep 2026 crawler split, Pay Per Use",
      url: "https://engadget.com/2207360/cloudflare-will-filter-out-web-crawlers-that-serve-ai-companies",
    },
    {
      text: "Ladybird sponsorship",
      url: "https://ladybird.org/",
    },
    {
      text: "Perplexity stealth crawler",
      url: "https://blog.cloudflare.com/perplexity-is-using-stealth-undeclared-crawlers-to-evade-website-no-crawl-directives/",
    },
    {
      text: "Perplexity reply",
      url: "https://www.perplexity.ai/hub/blog/agents-or-bots-making-sense-of-ai-on-the-open-web",
    },
  ],
  speakerNotes: "For twenty years the web's implicit deal was that a crawler took a page and sent a reader back; the ratio measures how far that deal drifted, and it names companies, including the one whose tooling is open on this laptop. Prince's spoken numbers are the headline; the measured Radar figures for Anthropic are on the next slide. Flag the conflict of interest before someone else does: Cloudflare is the loudest critic and also sells the remedy, Pay Per Crawl and then Pay Per Use from 15 September. Perplexity was caught running an undeclared crawler impersonating Chrome when blocked, and its reply warned of a two-tiered internet where your access depends on something other than your needs, which is the strongest pro-agent principle in the whole debate. Prince's own line, traffic was always a poor proxy for value, is the counter to this slide if the room pushes back.",
  timing: {
    minutes: 1,
    cumulative: 4.25,
  },
};
