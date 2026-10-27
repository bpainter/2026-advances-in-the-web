// Hooks for the F1 static frame. The engine remounts a fresh document on reset, so `reset` has
// nothing to clear; `resetTeaser` re-mounts the select, which closes its picker deterministically
// before the Firefox poster appears (PRD F1 builder notes).
const form = document.querySelector("#variant");
const replica = document.querySelector("#select-open-poster");
const pristine = form.querySelector("#color").cloneNode(true);

function isOpen(select) {
  try {
    return select.matches(":open");
  } catch {
    return false;
  }
}

// A scripted `click` (element.click(), untrusted) does not open a select's picker in any engine.
// The runtime's click lands here; showPicker() opens the picker when the frame holds a user
// activation, and the replica of the open picker stands in when the engine refuses it.
function wire(select) {
  select.addEventListener("click", (event) => {
    if (event.isTrusted || isOpen(select)) return;
    try {
      if (typeof select.showPicker !== "function") throw new Error("no showPicker");
      select.showPicker();
      replica.hidden = true;
    } catch {
      replica.hidden = false;
    }
  });
}

function resetTeaser() {
  const current = form.querySelector("#color");
  const fresh = pristine.cloneNode(true);
  current.replaceWith(fresh);
  wire(fresh);
  replica.hidden = true;
}

wire(form.querySelector("#color"));

window.demoHooks = { reset() {}, resetTeaser };
