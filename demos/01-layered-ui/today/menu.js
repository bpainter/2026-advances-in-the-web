// Hand-rolled action menu: a div with
// role="menu" rendered into the portal root
// on open. Owns the open state and
// aria-expanded, positioning under its
// button (and again on scroll and resize),
// outside click, Escape, arrow-key movement
// between items, and focus return to the
// button on close.

const MENU_ID = "t-menu";

function portalRoot() {
  return document.getElementById(
    "overlay-root",
  );
}

export function createMenu(
  button,
  { items, onSelect },
) {
  let menu = null;
  let itemEls = [];
  let open = false;
  let activeIndex = -1;

  button.setAttribute(
    "aria-haspopup",
    "menu",
  );
  button.setAttribute(
    "aria-expanded",
    "false",
  );
  button.setAttribute(
    "aria-controls",
    MENU_ID,
  );

  function render() {
    menu = document.createElement("div");
    menu.id = MENU_ID;
    menu.className = "glass-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute(
      "aria-labelledby",
      button.id,
    );
    menu.tabIndex = -1;
    itemEls = items.map((item, index) => {
      const el =
        document.createElement("div");
      el.id = item.id;
      el.className = "glass-menu__item";
      el.setAttribute("role", "menuitem");
      el.tabIndex = -1;
      el.textContent = item.label;
      el.addEventListener("click", () =>
        choose(index),
      );
      el.addEventListener(
        "pointermove",
        () => setActive(index, false),
      );
      menu.append(el);
      return el;
    });
    portalRoot().append(menu);
  }

  function position() {
    if (!menu) return;
    const r =
      button.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const gap = 4;
    let left = r.right - width;
    let top = r.bottom + gap;
    // Flip above the button when the
    // viewport has no room below it.
    if (top + height > window.innerHeight)
      top = r.top - height - gap;
    if (left < gap) left = gap;
    if (top < gap) top = gap;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  function setActive(index, focus = true) {
    if (!itemEls.length) return;
    const n = itemEls.length;
    activeIndex = ((index % n) + n) % n;
    itemEls.forEach((el, i) => {
      el.classList.toggle(
        "is-active",
        i === activeIndex,
      );
    });
    if (focus)
      itemEls[activeIndex].focus({
        preventScroll: true,
      });
  }

  function choose(index) {
    const item = items[index];
    close();
    onSelect(item);
  }

  function onDocumentPointerDown(event) {
    if (!open) return;
    const t = event.target;
    if (
      menu.contains(t) ||
      button.contains(t)
    )
      return;
    close();
  }

  function onDocumentKeydown(event) {
    if (!open) return;
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        setActive(activeIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(itemEls.length - 1);
        break;
      case "Enter":
      case " ":
        if (activeIndex >= 0) {
          event.preventDefault();
          choose(activeIndex);
        }
        break;
      case "Tab":
        // A menu is not part of the tab
        // sequence; Tab leaves and closes
        // it.
        close();
        break;
      default:
    }
  }

  function openMenu() {
    if (open) return;
    open = true;
    render();
    position();
    button.setAttribute(
      "aria-expanded",
      "true",
    );
    document.addEventListener(
      "pointerdown",
      onDocumentPointerDown,
    );
    // Window, capture phase, for the same
    // reason as the modal: keys must reach
    // the menu even when a listener below
    // stops them bubbling.
    window.addEventListener(
      "keydown",
      onDocumentKeydown,
      true,
    );
    window.addEventListener(
      "resize",
      position,
    );
    window.addEventListener(
      "scroll",
      position,
      true,
    );
    setActive(0);
  }

  function close({
    restoreFocus = true,
  } = {}) {
    if (!open) return;
    open = false;
    document.removeEventListener(
      "pointerdown",
      onDocumentPointerDown,
    );
    window.removeEventListener(
      "keydown",
      onDocumentKeydown,
      true,
    );
    window.removeEventListener(
      "resize",
      position,
    );
    window.removeEventListener(
      "scroll",
      position,
      true,
    );
    const hadFocus = menu.contains(
      document.activeElement,
    );
    menu.remove();
    menu = null;
    itemEls = [];
    activeIndex = -1;
    button.setAttribute(
      "aria-expanded",
      "false",
    );
    if (restoreFocus && hadFocus)
      button.focus({ preventScroll: true });
  }

  function toggle() {
    if (open) close();
    else openMenu();
  }

  button.addEventListener("click", toggle);
  button.addEventListener(
    "keydown",
    (event) => {
      if (open) return;
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp"
      ) {
        event.preventDefault();
        openMenu();
        if (event.key === "ArrowUp")
          setActive(itemEls.length - 1);
      }
    },
  );

  return {
    open: openMenu,
    close,
    toggle,
    get isOpen() {
      return open;
    },
  };
}
