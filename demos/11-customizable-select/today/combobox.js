// Hand-rolled select: a combobox div, a
// listbox, a hidden input for the form, and
// script for every key a native select
// already handles.

export function createCombobox(
  button,
  list,
  input,
  options,
) {
  let open = false;
  let active = 0;
  let typed = "";
  let typedTimer = 0;

  const items = options.map((o, i) => {
    const li = document.createElement("li");
    li.id = `${list.id}-${o.value}`;
    li.className =
      "combo__option glass-menu__item";
    li.setAttribute("role", "option");
    const swatch =
      document.createElement("span");
    swatch.className = "swatch " + o.value;
    li.append(swatch, o.label);
    li.addEventListener("click", () => {
      choose(i);
      close();
    });
    list.append(li);
    return li;
  });
  list.classList.add("glass-menu");

  function render() {
    const o = options[active];
    button.replaceChildren(
      ...items[active].cloneNode(true)
        .childNodes,
    );
    input.value = o.value;
    items.forEach((li, i) => {
      li.setAttribute(
        "aria-selected",
        String(i === active),
      );
    });
  }

  function highlight(i) {
    const n = items.length;
    active = ((i % n) + n) % n;
    items.forEach((li, j) => {
      li.classList.toggle(
        "is-active",
        j === active,
      );
    });
    button.setAttribute(
      "aria-activedescendant",
      items[active].id,
    );
  }

  function choose(i) {
    highlight(i);
    render();
    button.dispatchEvent(
      new Event("change", {
        bubbles: true,
      }),
    );
  }

  function show() {
    open = true;
    list.hidden = false;
    button.setAttribute(
      "aria-expanded",
      "true",
    );
    highlight(active);
    document.addEventListener(
      "pointerdown",
      outside,
    );
  }

  function close() {
    open = false;
    list.hidden = true;
    button.setAttribute(
      "aria-expanded",
      "false",
    );
    button.removeAttribute(
      "aria-activedescendant",
    );
    document.removeEventListener(
      "pointerdown",
      outside,
    );
  }

  function outside(event) {
    if (
      !button.contains(event.target) &&
      !list.contains(event.target)
    )
      close();
  }

  function typeAhead(key) {
    clearTimeout(typedTimer);
    typed += key.toLowerCase();
    typedTimer = setTimeout(() => {
      typed = "";
    }, 500);
    const i = options.findIndex((o) =>
      o.label
        .toLowerCase()
        .startsWith(typed),
    );
    if (i >= 0)
      open ? highlight(i) : choose(i);
  }

  button.addEventListener("click", () =>
    open ? close() : show(),
  );
  button.addEventListener(
    "keydown",
    (e) => {
      const step = {
        ArrowDown: 1,
        ArrowUp: -1,
      };
      if (e.key in step) {
        e.preventDefault();
        if (!open) show();
        highlight(active + step[e.key]);
      } else if (e.key === "Home") {
        e.preventDefault();
        highlight(0);
      } else if (e.key === "End") {
        e.preventDefault();
        highlight(items.length - 1);
      } else if (
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        if (open) {
          choose(active);
          close();
        } else show();
      } else if (e.key === "Escape") {
        if (open) {
          e.preventDefault();
          close();
        }
      } else if (e.key === "Tab") {
        if (open) close();
      } else if (e.key.length === 1) {
        typeAhead(e.key);
      }
    },
  );

  choose(0);
  return { close };
}
