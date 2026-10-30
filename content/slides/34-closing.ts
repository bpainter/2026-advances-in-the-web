import type { Slide } from "@/content/schema";
import { deck } from "@/content/deck";

/** The closing slide (PRD v5, 4.6; spec 7): name, role and LinkedIn, with a QR code. Always last. */
export const slide: Slide = {
  id: "closing",
  index: 50,
  section: "close",
  layout: "glass-closing",
  title: "Thank you",
  glass: {
    kind: "closing",
    eyebrow: "Thank you",
    name: deck.speaker.name,
    role: `${deck.speaker.title}, ${deck.speaker.org}`,
    link: "linkedin.com/in/bermonpainter",
    // The QR generator reads this; the validator checks it equals deck.speaker.linkedin (PRD r7, 5.1).
    url: deck.speaker.linkedin,
    caption: "Scan to open LinkedIn",
  },
  citations: [],
  speakerNotes: "I’ll leave you with one ask: go build something.\n\nTry one of these features on a real problem. Look at the code. Test it. Publish what you learn.\n\nUse AI when it helps. But don’t let it replace your judgment or your curiosity. You’re still responsible for understanding what you ship.\n\nI don’t want to experience everything the web has to offer through a chat window. I still enjoy finding a site and seeing how someone else thinks. The design, the writing, the strange little interaction they didn’t have to add but did anyway.\n\nThat’s part of what makes the web worth keeping open.\n\nGo make something worth visiting.\n\n*Leave the closing slide visible during questions.*",
  timing: { minutes: 0.25, cumulative: 42 },
  background: "closing",
};
