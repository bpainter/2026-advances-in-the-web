// Stage hook: the slide's steps open a panel the way a
// click would; the name attribute closes the others.
const panel = {
  returns: "returns",
  materials: "materials",
  found: "materials",
};

// Find-in-page cannot be scripted, so "found" marks the
// word a search for lugs would land on.
function mark(on) {
  const p = document.querySelector("#materials p");
  const m = p.querySelector("mark");
  if (on && !m) {
    p.innerHTML = p.innerHTML.replace(
      "lugs",
      "<mark>lugs</mark>",
    );
  }
  if (!on && m) m.replaceWith(m.textContent);
}

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  const el = document.getElementById(panel[state]);
  if (el && !el.open) el.open = true;
  mark(state === "found");
});
