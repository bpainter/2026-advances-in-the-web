import "server-only";
import { BASE_CSS } from "./common";
import type { WrapperDef } from "./types";

/**
 * F3 now `terminal-window` (spec 4.10): a terminal app on dark glass. The title bar (three dots,
 * the title, the "Recorded" chip), one session tab with the working directory and a status bar
 * with the registry and tool versions. The shown block is the recorded lines. The placeholders
 * are filled from the recording by demos/07-package-workflow/build.ts. Nothing reads as live.
 */
export const terminalWindow: WrapperDef = {
  id: "terminal-window",
  banned: [{ name: "a live label", pattern: /\bLive\b/ }],
  render: () => {
    const before = [
      '<div class="wrap wrap--terminal"><div class="wrap-window">',
      '<header class="wrap-window__bar"><span class="wrap-window__dots" aria-hidden="true"><span class="wrap-window__dot"></span><span class="wrap-window__dot"></span><span class="wrap-window__dot"></span></span><p class="wrap-window__title"><!--term-title--></p><span class="wrap-window__chip"><!--captured--></span></header>',
      '<div class="wrap-window__tabs"><span class="wrap-window__tab"><!--term-cwd--></span></div>',
    ].join("");
    const after = ['<div class="wrap-window__status"><!--env--></div>', "</div></div>"].join("");
    return { before, after, shownClass: "wrap-shown--bare wrap-window__body", styles: [BASE_CSS, "/wrappers/terminal-window.css"], scripts: [] };
  },
};
