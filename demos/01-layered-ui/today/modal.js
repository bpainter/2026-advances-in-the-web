// Hand-rolled confirmation modal: a
// backdrop and a div with role="dialog"
// rendered into the portal root. Owns the
// focus trap, the scroll lock, the stacking
// order, hiding the page behind it from
// assistive technology, Escape and backdrop
// dismissal, and focus return to the opener
// on close.

import { createFocusTrap } from "./focus-trap.js";
import {
  lockScroll,
  unlockScroll,
} from "./scroll-lock.js";

function portalRoot() {
  return document.getElementById(
    "overlay-root",
  );
}

export function createModal({
  title,
  keepLabel,
  confirmLabel,
  onClose,
}) {
  let backdrop = null;
  let modal = null;
  let trap = null;
  let returnTo = null;
  let inerted = [];
  let open = false;

  function render() {
    backdrop =
      document.createElement("div");
    backdrop.id = "t-backdrop";
    backdrop.addEventListener("click", () =>
      close("dismiss"),
    );

    modal = document.createElement("div");
    modal.id = "t-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute(
      "aria-modal",
      "true",
    );
    modal.setAttribute(
      "aria-labelledby",
      "t-modal-title",
    );
    modal.tabIndex = -1;

    const heading =
      document.createElement("h2");
    heading.id = "t-modal-title";
    heading.textContent = title;

    const actions =
      document.createElement("div");
    actions.className = "modal__actions";

    const keep =
      document.createElement("button");
    keep.id = "t-keep";
    keep.type = "button";
    keep.textContent = keepLabel;
    keep.addEventListener("click", () =>
      close("keep"),
    );

    const confirm =
      document.createElement("button");
    confirm.id = "t-confirm";
    confirm.type = "button";
    confirm.textContent = confirmLabel;
    confirm.addEventListener("click", () =>
      close("confirm"),
    );

    actions.append(keep, confirm);
    modal.append(heading, actions);
    portalRoot().append(backdrop, modal);
    return keep;
  }

  // aria-modal alone is not enough
  // everywhere: mark the rest of the page
  // inert so screen readers and Tab cannot
  // reach it while the modal is up.
  function hidePage() {
    const root = portalRoot();
    inerted = Array.from(
      document.body.children,
    ).filter(
      (el) =>
        el !== root &&
        !el.inert &&
        el.tagName !== "SCRIPT",
    );
    inerted.forEach((el) => {
      el.inert = true;
    });
  }

  function showPage() {
    inerted.forEach((el) => {
      el.inert = false;
    });
    inerted = [];
  }

  function onDocumentKeydown(event) {
    if (!open || event.key !== "Escape")
      return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close("dismiss");
  }

  function openModal({
    returnFocusTo,
  } = {}) {
    if (open) return;
    open = true;
    returnTo =
      returnFocusTo ||
      document.activeElement;
    const keep = render();
    lockScroll();
    hidePage();
    trap = createFocusTrap(modal, {
      initialFocus: keep,
    });
    trap.activate();
    // Window, capture phase: the modal is
    // the top layer, so it answers Escape
    // before any menu or page listener
    // below it sees the key. (The frame
    // runtime stops key propagation at the
    // window in scripted mode, so a
    // document listener would never see its
    // dispatched Escape.)
    window.addEventListener(
      "keydown",
      onDocumentKeydown,
      true,
    );
  }

  function close(
    reason = "dismiss",
    { restoreFocus = true } = {},
  ) {
    if (!open) return;
    open = false;
    window.removeEventListener(
      "keydown",
      onDocumentKeydown,
      true,
    );
    trap.deactivate();
    trap = null;
    showPage();
    unlockScroll();
    backdrop.remove();
    modal.remove();
    backdrop = null;
    modal = null;
    const target = returnTo;
    returnTo = null;
    if (
      restoreFocus &&
      target &&
      target.isConnected
    ) {
      target.focus({ preventScroll: true });
    }
    onClose(reason);
  }

  return {
    open: openModal,
    close,
    get isOpen() {
      return open;
    },
  };
}
