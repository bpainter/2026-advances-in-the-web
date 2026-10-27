import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "thank-you",
  index: 36,
  section: "close",
  layout: "close",
  title: "Thank you",
  body: ["Every label on these slides is dated. Check the date before you quote it.", "Bermon Painter, Senior Director, Slalom. bermonpainter.com and the demo repo."],
  image: {
    prompt: "Reuse the slide 1 image with a heavier navy scrim; no new generation.",
    alt: "Developers talking by tall windows in a bright conference lobby, with one open laptop on a standing table.",
    model: "higgsfield/nano-banana-2",
    placement: "background",
  },
  citations: [],
  speakerNotes: "Stay on this slide through the ten minutes of Q&A so the contact and the repo stay visible, and invite the Firefox and Safari questions first. Point at the repo: every demo, every label, every source URL, dated 23 October 2026. The line about dated labels is a real instruction, since half the Baseline dates in this deck are less than six months old and some will be Widely by the time anyone watches the recording. Expect the first question to be about Firefox and the second to be about agents and semantic HTML; the answers are on slides 11 and 8.",
  timing: {
    minutes: 0.25,
    cumulative: 35,
  },
};
