// Custom commands fire on the target, not the button.
const card = document.querySelector("#card");
const menu = document.querySelector("#menu");

card.addEventListener("command", (e) => {
  if (e.command !== "--save") return;
  card.classList.toggle("saved");
  menu.hidePopover();
});
