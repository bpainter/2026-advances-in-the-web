import type { Slide } from "@/content/schema";
import { demo } from "@/content/demos/field-sizing/demo";

export const slide: Slide = {
  id: "field-sizing",
  index: 12,
  section: "platform-baseline",
  layout: "demo-split",
  title: "Field sizing",
  eyebrow: "BASELINE NEWLY · 16 JUN 2026 (FIREFOX 152)",
  body: ["Replaces react-textarea-autosize (5.2M a week) and autosize (349K)."],
  support: {
    tier: "baseline-newly",
    since: "16 Jun 2026 (Chrome 123, Safari 26.2, Firefox 152)",
    note: "Newly, so Widely in December 2028. Keep the script that long if you support frozen enterprise browsers.",
  },
  demo: demo,
  citations: [
    {
      text: "Baseline 16 Jun 2026 (Chrome 123, Safari 26.2, Firefox 152)",
      url: "https://webstatus.dev/features/field-sizing",
    },
    {
      text: "web.dev: can replace custom auto-resize scripts",
      url: "https://web.dev/blog/baseline-digest-jun-2026",
    },
    {
      text: "Works on select and inputs",
      url: "https://webkit.org/?p=17640",
    },
    {
      text: "Download counts, 12 to 18 Oct 2026",
      url: "https://api.npmjs.org/downloads/point/last-week/react-textarea-autosize",
    },
  ],
  speakerNotes: "This is the palate cleanser between two heavier demos, and people remember it because the payoff is visible on every keystroke. web.dev's June digest says it can replace custom auto-resize scripts, and it also works on select and text inputs. It's the first time we use the 30-month rule out loud: Baseline Newly in June 2026 means Widely in December 2028, and that date belongs in your adoption plan. Keep it short. Colour is next, and it's the one most teams still do in JavaScript.",
  timing: {
    minutes: 0.75,
    cumulative: 12.5,
  },
};
