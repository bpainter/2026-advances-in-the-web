// Everything appearance: base-select now does for free.
const form = document.forms[0];
const value = form.elements.country;
const trigger = document.querySelector(".trigger");
const list = document.querySelector("#list");
const items = [...list.children];
const sent = document.querySelector("#sent");
let open = false;
let active = 0;

function focusItem(i) {
  active = Math.max(0, Math.min(i, items.length - 1));
  items[active].focus();
}

function show() {
  open = true;
  list.hidden = false;
  trigger.setAttribute("aria-expanded", "true");
  focusItem(
    items.findIndex(
      (item) => item.dataset.value === value.value,
    ),
  );
}

function hide() {
  open = false;
  list.hidden = true;
  trigger.setAttribute("aria-expanded", "false");
}

// The form never sees the list: a hidden input carries
// the value and the button repaints itself by hand.
function choose(i) {
  const item = items[i];
  value.value = item.dataset.value;
  trigger.innerHTML = item.innerHTML;
  items.forEach((it) =>
    it.setAttribute("aria-selected", it === item),
  );
  hide();
  trigger.focus();
}

trigger.addEventListener("click", () =>
  open ? hide() : show(),
);

list.addEventListener("click", (e) => {
  const i = items.indexOf(e.target.closest("li"));
  if (i > -1) choose(i);
});

// Keyboard: the native select had all of this already.
list.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") focusItem(active + 1);
  else if (e.key === "ArrowUp") focusItem(active - 1);
  else if (e.key === "Home") focusItem(0);
  else if (e.key === "End") focusItem(items.length - 1);
  else if (e.key === "Enter" || e.key === " ")
    choose(active);
  else if (e.key === "Escape") {
    hide();
    trigger.focus();
  } else return;
  e.preventDefault();
});

document.addEventListener("pointerdown", (e) => {
  if (open && !e.target.closest(".field")) hide();
});

function report() {
  sent.value = `Posted country=${value.value}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  report();
});

// Stage hook: the slide's steps drive the same states.
document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  const want = state === "open" || state === "labels";
  if (want !== open) (want ? show : hide)();
  if (state === "japan" && value.value !== "jp")
    choose(1);
  if (state === "submitted") report();
  else sent.value = "";
});
