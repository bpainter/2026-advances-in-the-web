/** Keyboard map from PRD Part A, section 4.1, plus the demo view toggle on 1 to 4. */
export type KeyAction =
  | { type: "advance" }
  | { type: "retreat" }
  | { type: "next-slide" }
  | { type: "prev-slide" }
  | { type: "next-step" }
  | { type: "prev-step" }
  | { type: "first-slide" }
  | { type: "last-slide" }
  | { type: "toggle-blank" }
  | { type: "toggle-fullscreen" }
  | { type: "open-demo" }
  | { type: "reload-demo" }
  | { type: "show-fallback" }
  | { type: "focus-live" }
  | { type: "toggle-live" }
  | { type: "toggle-timer" }
  | { type: "open-speaker" }
  | { type: "goto" }
  | { type: "escape" }
  | { type: "help" }
  | { type: "digit"; n: number } // 0-4: demo-grid cell focus, or demo-split view
  | { type: "noop" };

import type { DemoView } from "@/content/schema";

/** Digit to view on demo-split slides. */
export const VIEW_BY_DIGIT: Record<number, DemoView> = { 1: "live", 2: "split", 3: "code", 4: "half" };

export function actionForKey(e: Pick<KeyboardEvent, "key" | "shiftKey" | "metaKey" | "ctrlKey" | "altKey">): KeyAction | null {
  if (e.metaKey || e.ctrlKey || e.altKey) return null;
  switch (e.key) {
    case "ArrowRight":
      return e.shiftKey ? { type: "next-slide" } : { type: "advance" };
    case "PageDown":
    case " ":
      return { type: "advance" };
    case "ArrowLeft":
      return e.shiftKey ? { type: "prev-slide" } : { type: "retreat" };
    case "PageUp":
    case "Backspace":
      return { type: "retreat" };
    case "n":
      return { type: "next-step" };
    case "p":
      return { type: "prev-step" };
    case "Home":
      return { type: "first-slide" };
    case "End":
      return { type: "last-slide" };
    case "b":
    case ".":
      return { type: "toggle-blank" };
    case "f":
      return { type: "toggle-fullscreen" };
    case "o":
      return { type: "open-demo" };
    case "r":
      return { type: "reload-demo" };
    case "x":
      return { type: "show-fallback" };
    case "l":
      return { type: "toggle-live" };
    case "t":
      return { type: "toggle-timer" };
    case "s":
      return { type: "open-speaker" };
    case "g":
      return { type: "goto" };
    case "Enter":
      return { type: "focus-live" };
    case "Escape":
      return { type: "escape" };
    case "?":
      return { type: "help" };
    case "F5":
      return { type: "noop" };
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
      return { type: "digit", n: Number(e.key) };
    default:
      return null;
  }
}

/** True when the key event originated in a form control the stage should leave alone. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export const KEY_HELP: { keys: string[]; action: string }[] = [
  { keys: ["→", "PageDown", "Space"], action: "Next code step, then next slide" },
  { keys: ["←", "PageUp", "Backspace"], action: "Previous code step, then previous slide" },
  { keys: ["Shift", "→"], action: "Next slide, skipping steps" },
  { keys: ["Shift", "←"], action: "Previous slide" },
  { keys: ["n", "p"], action: "Next or previous code step only" },
  { keys: ["1", "2", "3", "4"], action: "Demo slide: live only, split 60/40, code only, split 50/50" },
  { keys: ["1", "2", "3", "4", "0"], action: "Lightning round: enlarge a cell with its code; 0 restores the grid" },
  { keys: ["Home", "End"], action: "First or last slide" },
  { keys: ["Enter"], action: "Hand focus to the live demo" },
  { keys: ["Esc"], action: "Return focus from the demo to the stage" },
  { keys: ["o"], action: "Open the demo standalone in a new tab" },
  { keys: ["r"], action: "Reload the demo" },
  { keys: ["x"], action: "Show the demo fallback" },
  { keys: ["l"], action: "Terminal slide: hide the recording for a live terminal" },
  { keys: ["b", "."], action: "Blank the audience window" },
  { keys: ["t"], action: "Start or pause the talk timer" },
  { keys: ["s"], action: "Open or focus the speaker window" },
  { keys: ["g"], action: "Speaker view: go to a slide number" },
  { keys: ["f"], action: "Toggle fullscreen" },
  { keys: ["?"], action: "This help" },
];
