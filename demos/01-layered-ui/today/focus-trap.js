// Focus trap for the hand-rolled modal. Tab and Shift+Tab wrap inside the
// container, and focus that escapes (a click on the page behind, a return
// from browser chrome) is pulled back to the last element that had it.

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

function isTabbable(el) {
  if (el.hidden || el.closest("[hidden]")) return false;
  const style = getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  return el.getClientRects().length > 0;
}

export function focusableIn(container) {
  return Array.from(container.querySelectorAll(FOCUSABLE)).filter(isTabbable);
}

export function createFocusTrap(container, options = {}) {
  let active = false;
  let lastFocused = null;

  function focusFallback() {
    const items = focusableIn(container);
    const target =
      lastFocused && container.contains(lastFocused) ? lastFocused : items[0] || container;
    target.focus({ preventScroll: true });
  }

  function onKeydown(event) {
    if (!active || event.key !== "Tab") return;
    const items = focusableIn(container);
    if (items.length === 0) {
      event.preventDefault();
      container.focus({ preventScroll: true });
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const current = document.activeElement;
    const outside = !container.contains(current);
    if (event.shiftKey) {
      if (current === first || outside) {
        event.preventDefault();
        last.focus();
      }
    } else if (current === last || outside) {
      event.preventDefault();
      first.focus();
    }
  }

  function onFocusIn(event) {
    if (!active) return;
    if (container.contains(event.target)) {
      lastFocused = event.target;
      return;
    }
    focusFallback();
  }

  return {
    activate() {
      if (active) return;
      active = true;
      document.addEventListener("keydown", onKeydown, true);
      document.addEventListener("focusin", onFocusIn, true);
      const initial =
        options.initialFocus && container.contains(options.initialFocus)
          ? options.initialFocus
          : focusableIn(container)[0] || container;
      initial.focus({ preventScroll: true });
      lastFocused = initial;
    },
    deactivate() {
      if (!active) return;
      active = false;
      document.removeEventListener("keydown", onKeydown, true);
      document.removeEventListener("focusin", onFocusIn, true);
      lastFocused = null;
    },
    get active() {
      return active;
    },
  };
}
