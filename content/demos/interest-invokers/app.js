// Stage hook: interest cannot be shown from script,
// so each state opens the hint with the popover API
// (what hover or focus on the link would do) and the
// keyboard state paints the ring a Tab would, in CSS,
// so the clicker keeps the keyboard. Idempotent: an
// open hint stays open, and nothing here throws.
const link = document.querySelector("[interestfor]");
const hint = document.querySelector("#who");

function showHint(open) {
  if (open === hint.matches(":popover-open")) return;
  try {
    hint.togglePopover(open);
  } catch {
    // No popover support: nothing to show.
  }
}

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  const keyboard = state === "shown-keyboard";
  showHint(state === "shown" || keyboard);
  link.dataset.focus = keyboard;
});
