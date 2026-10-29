// Opens one card at a time in the float
// root, and handles closing and focus.
import {
  computePosition,
  autoUpdate,
} from "./position.js";

const root = document.querySelector(
  "#t-float-root",
);
const cards =
  document.querySelector("#t-cards");
let open = null;

function place(pin, card) {
  const { x, y, side } = computePosition(
    pin,
    card,
  );
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;
  card.dataset.side = side;
  card.className = `card card--${side}`;
}

function close({
  restoreFocus = false,
} = {}) {
  if (!open) return;
  open.stop();
  open.card.remove();
  open.pin.setAttribute(
    "aria-expanded",
    "false",
  );
  if (restoreFocus) open.pin.focus();
  open = null;
}

function show(pin) {
  const id = pin.getAttribute(
    "aria-controls",
  );
  if (open?.pin === pin) return close();
  close();
  const card = cards.content
    .getElementById(id)
    .cloneNode(true);
  root.append(card);
  pin.setAttribute("aria-expanded", "true");
  const stop = autoUpdate(pin, card, () =>
    place(pin, card),
  );
  open = { pin, card, stop };
}

for (const pin of document.querySelectorAll(
  ".pin",
)) {
  pin.addEventListener("click", () =>
    show(pin),
  );
}

// Outside click and Escape close the card.
document.addEventListener(
  "click",
  (event) => {
    if (!open) return;
    if (open.card.contains(event.target))
      return;
    if (open.pin.contains(event.target))
      return;
    close();
  },
);
document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape")
      close({ restoreFocus: true });
  },
);
