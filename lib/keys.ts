/** Keyboard map (PRD Part A, 6.1) plus the deck's own navigation keys. */
export type KeyAction =
  | { type: "advance" }
  | { type: "retreat" }
  | { type: "next-slide" }
  | { type: "prev-slide" }
  | { type: "first-slide" }
  | { type: "last-slide" }
  | { type: "toggle-blank" }
  | { type: "toggle-fullscreen" }
  | { type: "toggle-hands-on" }
  | { type: "toggle-live" }
  | { type: "reset-step" }
  | { type: "toggle-timer" }
  | { type: "toggle-rehearsal" }
  | { type: "open-demo" }
  | { type: "open-speaker" }
  | { type: "goto" }
  | { type: "escape" }
  | { type: "help" }
  | { type: "noop" };

export function actionForKey(e: Pick<KeyboardEvent, "key" | "shiftKey" | "metaKey" | "ctrlKey" | "altKey">): KeyAction | null {
  if (e.metaKey || e.ctrlKey || e.altKey) return null;
  switch (e.key) {
    case "ArrowRight":
    case "PageDown":
      return e.shiftKey ? { type: "next-slide" } : { type: "advance" };
    case " ":
    case "Space":
      return { type: "advance" };
    case "ArrowLeft":
    case "PageUp":
      return e.shiftKey ? { type: "prev-slide" } : { type: "retreat" };
    case "Backspace":
      return { type: "retreat" };
    case "Home":
      return { type: "first-slide" };
    case "End":
      return { type: "last-slide" };
    case "b":
    case ".":
      return { type: "toggle-blank" };
    case "f":
      return { type: "toggle-fullscreen" };
    case "h":
      return { type: "toggle-hands-on" };
    case "l":
      return { type: "toggle-live" };
    case "r":
      return { type: "reset-step" };
    case "t":
      return { type: "toggle-timer" };
    case "d":
      return { type: "toggle-rehearsal" };
    case "o":
      return { type: "open-demo" };
    case "s":
      return { type: "open-speaker" };
    case "g":
      return { type: "goto" };
    case "Escape":
      return { type: "escape" };
    case "?":
      return { type: "help" };
    case "F5":
      return { type: "noop" };
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
  { keys: ["→", "PageDown", "Space"], action: "Next: plays the next step, then the next page" },
  { keys: ["←", "PageUp", "Backspace"], action: "Previous: back one step (reset and replay), then the previous page" },
  { keys: ["Shift", "→"], action: "Next page, step 0" },
  { keys: ["Shift", "←"], action: "Previous page, step 0" },
  { keys: ["h"], action: "Hands-on mode: steps stop playing; your keyboard and pointer reach the demo" },
  { keys: ["r"], action: "Reset and replay the current step" },
  { keys: ["l"], action: "Terminal page: hide the recording for a live terminal" },
  { keys: ["d"], action: "Rehearsal overlay" },
  { keys: ["Home", "End"], action: "First or last slide" },
  { keys: ["o"], action: "Open the frame standalone in a new tab" },
  { keys: ["b", "."], action: "Blank the audience window" },
  { keys: ["t"], action: "Start or pause the talk timer" },
  { keys: ["s"], action: "Open or focus the speaker window" },
  { keys: ["g"], action: "Speaker view: go to a slide number" },
  { keys: ["f"], action: "Toggle fullscreen" },
  { keys: ["?"], action: "This help" },
];
