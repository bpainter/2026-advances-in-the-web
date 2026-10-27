// Stage hook, inlined in both pages: the slide's steps
// post "a" or "b" and this navigates to that page. It
// does nothing for the transition; the at-rule does.
const PAGES = { a: "page-a.html", b: "page-b.html" };
let timer = 0;

function here() {
  return location.pathname.endsWith(PAGES.b)
    ? "b"
    : "a";
}

// Let a double press settle: one navigation, not two.
document.addEventListener("demostate", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const want = document.documentElement.dataset.state;
    if (!PAGES[want] || want === here()) return;
    location.assign(PAGES[want]);
  }, 250);
});
