import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "close",
  index: 35,
  section: "close",
  layout: "image-led",
  title: "The platform outlasts the hype cycle",
  eyebrow: "CLOSE",
  body: ["Ten months of Atlas, twelve months of Interop.", "A user agent owes you loyalty, and three engines, a public scoreboard, and a published spec are what that looks like."],
  image: {
    prompt: "Wide candid daylight photo of Toronto's waterfront from the deck of the Island ferry, mid-morning, clear autumn sky, a few passengers in coats at the rail looking toward the skyline, natural colour, warm skin tones, slightly cool water and glass, no lens flare, no colour wash, no logos, no readable text. Leave the lower-left third uncluttered for a headline. 16:9.",
    alt: "Passengers at a ferry rail looking at the Toronto skyline on a clear morning.",
    model: "higgsfield/nano-banana-2",
    placement: "full-bleed",
  },
  citations: [
    {
      text: "Atlas ten months",
      url: "https://www.techradar.com/pro/openai-shuts-down-its-atlas-browser-after-not-even-a-year",
    },
    {
      text: "Interop 2025",
      url: "https://webkit.org/?p=17808",
    },
    {
      text: "TAG loyalty",
      url: "https://www.w3.org/TR/2025/DNOTE-web-user-agents-20251127/",
    },
    {
      text: "Simmons, WWDC26 session 204",
      url: "https://developer.apple.com/videos/play/wwdc2026/204/",
    },
    {
      text: "Keith: make it boring",
      url: "https://adactio.com/journal/22219",
    },
    {
      text: "Russell via Nielsen",
      url: "https://notes.jim-nielsen.com/n/2025-07-11-1311/",
    },
    {
      text: "Berners-Lee, Pan Macmillan",
      url: "https://www.panmacmillan.com/news/tim-berners-lee-on-ai",
    },
    {
      text: "Epic v. Apple Ninth Circuit (optional line)",
      url: "https://www.cravath.com/news-insights/epic-games-ninth-circuit-win-affirming-civil-contempt-finding.html",
    },
    {
      text: "Ladybird: free from conflicts of interest",
      url: "https://ladybird.org/",
    },
  ],
  speakerNotes: "One minute, and end on a quote rather than a recap. Capability fact: Jen Simmons at WWDC26, we set out to greatly improve the quality of existing web platform features, we put our focus there this year rather than on implementing a whole lot of brand new ones, and the Interop score proves it. Governance fact: the TAG's loyalty duty from slide 8. Primary closing line, Jeremy Keith, October 2025: make it boring, that's what's interesting; alternate for a very senior room, Alex Russell at JSNation 2025, JavaScript has always been and will always be the slowest way to do anything on the web; second alternate, Berners-Lee, the future is not something that simply happens to us, it is something we build. Last sentence in your own words, slowly: the open web's advantage is that you always know what you're standing on, and the one standalone AI browser that tried to replace it lasted ten months, then stop.",
  timing: {
    minutes: 1,
    cumulative: 34.75,
  },
};
