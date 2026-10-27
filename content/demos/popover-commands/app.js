// Custom commands fire on the target, not the button.
const card = document.querySelector("#card");
const menu = document.querySelector("#menu");

card.addEventListener("command", (e) => {
  if (e.command !== "--save") return;
  card.classList.toggle("saved");
  menu.hidePopover();
});

// Stage hook: the slide's steps post a state and the
// same menu opens, dismisses and saves without a click.
const more = document.querySelector(".more");

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  const open = state === "open";
  if (open !== menu.matches(":popover-open")) {
    menu.togglePopover(open);
  }
  card.classList.toggle("saved", state === "saved");
  more.dataset.focus = state === "dismissed";
  if (state === "dismissed") more.focus();
});
