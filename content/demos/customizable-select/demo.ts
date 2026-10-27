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
    {
      file: "app.js",
      lang: "js",
    },
  ]),
  // The "before" beat: a button, a list and a hidden input, with the keyboard done by hand.
  legacy: {
    code: demoCode("customizable-select", [
      {
        file: "legacy/index.html",
        lang: "html",
      },
      {
        file: "legacy/styles.css",
        lang: "css",
      },
      {
        file: "legacy/app.js",
        lang: "js",
      },
    ]),
  },
  requires: [{ id: "base-select", kind: "css-supports", query: "appearance: base-select" }],
  liveStates: ["open", "japan", "labels", "submitted"],
  steps: [
    // Beat 1: today, with a pile of JavaScript.
    {
      id: "b1",
      file: "legacy/app.js",
      highlight: [[16, 31]],
      caption:
        "Today a styled select is a button and a list, and the script does the opening, the closing and the focus.",
      action: "The hand-rolled list opens under the button.",
      liveState: "open",
      phase: "before",
      target: "#list",
    },
    {
      id: "b2",
      file: "legacy/app.js",
      highlight: [[55, 73]],
      caption:
        "Arrow keys, Home, End, Enter, Escape and click outside: we re-implement what the native select already had.",
      action:
        "Japan is chosen by script; the button repaints with the flag and the name and the list closes.",
      liveState: "japan",
      phase: "before",
      target: ".trigger",
    },
    // prettier-ignore
    {
      id: "b3",
      file: "legacy/app.js",
      highlight: [[33, 44], [75, 77]],
      caption: "The form never sees the list, so a hidden input carries the value and the button repaints itself by hand.",
      action: "Check out: the output reads Posted country=jp, read from the hidden input.",
      liveState: "submitted",
      phase: "before",
      target: "#sent",
    },
    // Beat 2: now, native.
    {
      id: "a1",
      highlight: [],
      caption:
        "The same control is now a real select with a styled picker and no script for the picker.",
      action:
        "A labelled replica of the picker opens under the select. For the real one, click the select once.",
      liveState: "open",
      phase: "after",
    },
    {
      id: "a2",
      highlight: [],
      caption:
        "Pick Japan and the button shows the flag and the name, because selectedcontent mirrors the choice.",
      action: "The select now reads Japan with its flag; the replica closes.",
      liveState: "japan",
      phase: "after",
    },
    {
      id: "a3",
      highlight: [],
      caption:
        "Still a form control: the value posts, validation runs and screen readers get a select.",
      action: "Check out: the output reads Posted country=jp.",
      liveState: "submitted",
      phase: "after",
    },
    // Beat 3: the code.
    {
      id: "s1",
      file: "styles.css",
      highlight: [[31, 34]],
      caption: "Opt in on the select and on its picker with appearance: base-select.",
      action: "The replica picker opens under the select; for the real one, click the select once.",
      liveState: "open",
      target: "select",
    },
    {
      id: "s2",
      file: "index.html",
      highlight: [[7, 9]],
      caption: "The button and selectedcontent mirror the current choice.",
      action: "Japan is chosen; the select's button shows the flag and the name.",
      liveState: "japan",
      target: "selectedcontent",
    },
    {
      id: "s3",
      file: "index.html",
      highlight: [[10, 18]],
      caption:
        "Every option keeps text content, so an option still reads if the flag CSS never loads.",
      action: "The replica opens with the flag CSS off: the text is what is left.",
      liveState: "labels",
      target: "#replica li",
    },
    {
      id: "s4",
      file: "styles.css",
      highlight: [[43, 67]],
      caption: "The picker animates in with the same allow-discrete trick as the popover.",
      action: "The replica opens again with that transition; the real picker uses the same one.",
      liveState: "open",
      target: "#replica",
    },
    // prettier-ignore
    {
      id: "s5",
      file: "index.html",
      highlight: [[6, 6], [31, 32]],
      caption: "Still a form control: the value posts, validation runs and screen readers get a select.",
      action: "The output reads Posted country=jp. The stage calls the submit handler because the sandbox blocks a real post.",
      liveState: "submitted",
      target: "#sent",
    },
    {
      id: "s6",
      file: "index.html",
      highlight: [[6, 19]],
      caption:
        "In Firefox the same markup is a plain native select, and the form still works: the right failure mode.",
      action:
        "The replica opens again. In Firefox this same page shows a plain select, and Check out still posts.",
      liveState: "open",
      target: "select",
    },
  ],
  fork: ["https://codepen.io/web-dot-dev/pen/JoXrKoL", "https://codepen.io/una/embed/VYYQKbb"],
  fallback: "https://codepen.io/web-dot-dev/pen/JoXrKoL",
  wow: "Flags in options with a real select underneath.",
  gotcha:
    "WebKit's golden rule: every option keeps text content. UA defaults still differ between Chrome and Safari and are under CSSWG discussion. Opting in loses the native mobile picker sheet. On stage, select.showPicker() needs a user click, so the open steps show a labelled replica of the picker built from the same options; this is the one demo where one real click on the select is worth making. The sandbox also blocks form posts, so the submitted step calls the submit handler directly.",
};
