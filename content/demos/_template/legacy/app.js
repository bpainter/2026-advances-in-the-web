// Today's version: the listeners, geometry and state
// the platform now does for us. Length is the point;
// the panel scrolls.
const badge = document.querySelector(".badge");

function highlight(on) {
  badge.style.background = on ? "#0c62fb" : "";
  badge.style.color = on ? "#fff" : "";
}

// Stage hook: same state names as the native version.
document.addEventListener("demostate", (e) => {
  highlight(e.detail.state === "highlighted");
});
