// Everything <details name> and ::details-content do.
const faqs = [...document.querySelectorAll(".faq")];
const DUR = 200;

function expand(faq) {
  const panel = faq.querySelector(".panel");
  panel.hidden = false;
  const h = panel.scrollHeight;
  panel.style.height = "0px";
  void panel.offsetHeight; // reflow, so it transitions
  panel.style.height = `${h}px`;
  faq.classList.add("open");
  faq.querySelector(".summary").ariaExpanded = "true";
  // Back to auto once it lands, so content can reflow.
  setTimeout(() => {
    if (faq.classList.contains("open")) {
      panel.style.height = "auto";
    }
  }, DUR);
}

function collapse(faq) {
  const panel = faq.querySelector(".panel");
  panel.style.height = `${panel.scrollHeight}px`;
  void panel.offsetHeight;
  panel.style.height = "0px";
  faq.classList.remove("open");
  faq.querySelector(".summary").ariaExpanded = "false";
  // Hidden afterwards, which is why find cannot see it.
  setTimeout(() => {
    if (!faq.classList.contains("open"))
      panel.hidden = true;
  }, DUR);
}

// Exclusive: open this one and close every sibling.
function show(target) {
  for (const faq of faqs) {
    const open = faq.classList.contains("open");
    if (faq === target && !open) expand(faq);
    if (faq !== target && open) collapse(faq);
  }
}

for (const faq of faqs) {
  const panel = faq.querySelector(".panel");
  if (faq.classList.contains("open")) {
    panel.style.height = "auto";
  } else {
    panel.hidden = true;
  }
  faq
    .querySelector(".summary")
    .addEventListener("click", () => {
      show(faq.classList.contains("open") ? null : faq);
    });
}

// Stage hook: the slide's steps drive the same states.
// "found" is a search for lugs: the panel is hidden, so
// find-in-page finds nothing and the panel stays shut.
const panels = {
  returns: "returns",
  materials: "materials",
};
document.addEventListener("demostate", (e) => {
  const id = panels[e.detail.state];
  show(id ? document.getElementById(id) : null);
});
