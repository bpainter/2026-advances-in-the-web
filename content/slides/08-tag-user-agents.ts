import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "tag-user-agents",
  index: 8,
  section: "open-web",
  layout: "quote",
  title: "W3C TAG on user agents",
  quote: {
    text: "A user agent must put its user's interests first, and must never block the user from switching to another agent or exporting their data.",
    who: "W3C Technical Architecture Group",
    where: "Web User Agents, draft note, 27 November 2025",
    url: "https://www.w3.org/TR/2025/DNOTE-web-user-agents-20251127/",
  },
  body: ["The note counts generative AI systems that present snippets or summaries of website content as user agents."],
  citations: [
    {
      text: "TAG note",
      url: "https://www.w3.org/TR/2025/DNOTE-web-user-agents-20251127/",
    },
    {
      text: "W3C Ethical Web Principles: the web can be consumed in any way that people choose",
      url: "https://www.w3.org/TR/2024/STMT-ethical-web-principles-20241212/",
    },
    {
      text: "Mueller: no AI system currently uses llms.txt",
      url: "https://www.seroundtable.com/google-ai-llms-txt-39607.html",
    },
    {
      text: "RSL builds on robots.txt and RSS",
      url: "https://rslstandard.org/",
    },
  ],
  speakerNotes: "The TAG wrote this before most of the room had heard of Atlas, which is what makes it useful: it's a standard written before the reaction. Loyalty is a duty the browser already carries without anyone noticing, and the note says the duty travels with whoever takes the browser's job. Pair it with the December 2024 statement that the web can be consumed in any way people choose. One thing not to claim: no vendor document says agents parse semantic HTML better, and Google's John Mueller says no AI system currently uses llms.txt, so offer semantic HTML as the agentic strategy as your inference. Now, what did the people building that ordinary HTML surface ship: seventeen demos.",
  timing: {
    minutes: 0.75,
    cumulative: 6.75,
  },
};
