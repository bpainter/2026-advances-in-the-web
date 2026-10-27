import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "title",
  index: 1,
  section: "cold-open",
  layout: "title",
  title: "The web shipped while everyone watched the robots",
  eyebrow: "2026 ADVANCES IN THE WEB · FITC WEB UNLEASHED 2026",
  body: ["Bermon Painter, Senior Director, Slalom. Toronto, 2026."],
  image: {
    prompt: "Candid daytime photo inside a Toronto conference venue lobby, wide shot. A mixed group of developers in casual clothes talk near tall windows; one laptop is open on a standing table showing a plain code editor with no readable text. Bright natural daylight, warm skin tones, slightly cool neutral walls, one pop of Slalom blue in a jacket or tote bag. Documentary style, nobody looking at the camera, no logos, no lens flare, no colour wash, no motion blur. 16:9, room for a headline on the left third.",
    alt: "Developers talking by tall windows in a bright conference lobby, with one open laptop on a standing table.",
    model: "higgsfield/nano-banana-2",
    placement: "full-bleed",
  },
  citations: [],
  speakerNotes: "Don't read the abstract. Ask the room how many of them shipped a popover library this year, then name the deal: 35 minutes, about seventeen live demos, a support label on every one, and a terminal at the end. Name the three browsers open on this machine, Chrome 156, Firefox 158, and Safari 27, so the labels have teeth. The argument comes from four directions: HTML and CSS, the frameworks, the dependency tree, and the package manager, and in each one the measurement is public. Start with two dates.",
  timing: {
    minutes: 0.5,
    cumulative: 0.5,
  },
};
