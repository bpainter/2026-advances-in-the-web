import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "clicks-and-summaries",
  index: 4,
  section: "open-web",
  layout: "stat",
  title: "Clicks when a summary appears",
  eyebrow: "READ MORE, VISITED LESS",
  stats: [
    {
      value: "8%",
      label: "of visits clicked a result when an AI summary appeared, against 15% without one (Pew, 68,879 real searches)",
      source: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/",
    },
    {
      value: "<1%",
      label: "of publisher page-view referrals come from chatbots (Chartbeat, two-year view)",
      source: "https://www.axios.com/2026/03/17/chartbeat-search-traffic-ai-chatbots",
    },
  ],
  citations: [
    {
      text: "Pew: 8% vs 15%, 1% on summary links, 68,879 searches",
      url: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/",
    },
    {
      text: "Chartbeat: under 1%, search referrals down 60/47/22%",
      url: "https://www.axios.com/2026/03/17/chartbeat-search-traffic-ai-chatbots",
    },
    {
      text: "Google rebuttal",
      url: "https://blog.google/products/search/ai-search-driving-more-queries-higher-quality-clicks/",
    },
    {
      text: "Pichai: more opinionated than it should be",
      url: "https://www.searchenginejournal.com/google-ceo-on-ai-overviews-more-opinionated-than-it-should-be/575902/",
    },
  ],
  speakerNotes: "Pew measured real searches, not a survey, and links inside the AI summary got clicked in one percent of visits. Chartbeat's under-one-percent answers the idea that chatbots simply redirected the traffic somewhere else: Google search referrals fell 60 percent for small publishers, 47 for medium, 22 for large, and chatbots didn't replace it. Concede Google's reply plainly: organic clicks are relatively stable and quality is up, and they didn't publish the data. Pichai said on Decoder in May that AI Overviews are probably more opinionated than they should be. Next slide turns traffic into a ratio.",
  timing: {
    minutes: 1,
    cumulative: 3.25,
  },
};
