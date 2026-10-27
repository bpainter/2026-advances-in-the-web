import type { Demo } from "@/content/schema";
import { demoCode } from "@/lib/demo-files";

export const demo: Demo = {
  id: "customizable-select",
  live: {
    kind: "srcdoc",
    browsers: ["chrome", "safari", "firefox"],
  },
  code: demoCode("customizable-select", [
    {
      file: "index.html",
      lang: "html",
    },
    {
      file: "styles.css",
      lang: "css",
    },
  ]),
  steps: [
    {
      id: "s1",
      file: "styles.css",
      highlight: [[16, 18]],
      caption: "Opt in on the select and on its picker.",
      action: "Open it: a styled picker. Arrow keys and Enter still work.",
    },
    {
      id: "s2",
      file: "index.html",
      highlight: [[6, 8]],
      caption: "The button and selectedcontent mirror the current choice.",
      action: "Pick Japan; the trigger shows the flag and the name.",
    },
    {
      id: "s3",
      file: "index.html",
      highlight: [[9, 11]],
      caption: "Every option keeps text content. Icon-only options render empty if the CSS fails.",
      action: "Point at the text beside each flag.",
    },
    {
      id: "s4",
      file: "styles.css",
      highlight: [[24, 42]],
      caption: "The picker animates in with the same allow-discrete trick as the popover.",
      action: "Open and close it once more.",
    },
    {
      id: "s5",
      file: "index.html",
      highlight: [[25, 29]],
      caption:
        "Still a form control. The value posts, validation works, screen readers get a select.",
      action: "Check out: Posted country=jp.",
    },
    {
      id: "s6",
      file: "index.html",
      highlight: [],
      caption: "Firefox: the same page, a plain native select. That's the right failure mode.",
      action: "Switch to Firefox and open it.",
    },
  ],
  fork: ["https://codepen.io/web-dot-dev/pen/JoXrKoL", "https://codepen.io/una/embed/VYYQKbb"],
  fallback: "https://codepen.io/web-dot-dev/pen/JoXrKoL",
  wow: "Flags in options with a real select underneath.",
  gotcha:
    "WebKit's golden rule: every option keeps text content. UA defaults still differ between Chrome and Safari and are under CSSWG discussion. Opting in loses the native mobile picker sheet.",
};
