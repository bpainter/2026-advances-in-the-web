import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "concessions",
  index: 7,
  section: "open-web",
  layout: "list",
  title: "Five things worth conceding",
  eyebrow: "THE CONCESSIONS",
  items: [
    {
      label: "AI answers are often what people want.",
      detail: "Pew's 26% session-ended rate reads as satisfaction to Google and as lost visits to publishers.",
    },
    {
      label: "The SEO-bait problem predates AI.",
      detail: "Jeremy Keith concedes the pop-ups and rubbish ads himself.",
    },
    {
      label: "Closed players fund the open stack.",
      detail: "Google's search payments are about 95% of Mozilla's revenue.",
    },
    {
      label: "The $1.5B was about piracy.",
      detail: "Training on bought books could be fair use.",
    },
    {
      label: "The open alternatives are small.",
      detail: "Bluesky's mobile MAU was 10.4M in June 2026, down 27% year over year.",
    },
  ],
  citations: [
    {
      text: "Pew 26% vs 16% session ended",
      url: "https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/",
    },
    {
      text: "Keith concession",
      url: "https://adactio.com/journal/22540",
    },
    {
      text: "95% of Mozilla revenue",
      url: "https://ppc.land/mozilla-cfo-testifies-in-google-search-case-warns-of-browser-ecosystem-risks/",
    },
    {
      text: "Bluesky 10.4M, down 27%",
      url: "https://daringfireball.net/linked/2026/08/21/bluesky-user-base-is-tiny",
    },
    {
      text: "React Foundation",
      url: "https://react.dev/blog/2025/10/07/introducing-the-react-foundation",
    },
    {
      text: "Apple Interop jump",
      url: "https://webkit.org/?p=17808",
    },
  ],
  speakerNotes: "State each one in a sentence and don't defend it; conceding early is what separates an argument from a rant, and this room has heard the rant. The Mozilla number surprises people: the open engine most of them think of as independent is paid for by the company whose AI Overviews are the problem two slides back. Credit the closed players where it's due: Meta moved React to a Linux Foundation-hosted React Foundation in October 2025, and Apple made the biggest Interop 2025 jump of any vendor. After all five, the claim that survives is that AI is changing who gets to be the web's user agent, and the standards community already has a word for what a good one owes you.",
  timing: {
    minutes: 0.75,
    cumulative: 6,
  },
  cutPriority: 7,
};
