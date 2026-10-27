// F3 today: the frame declares `hooks: ["reset"]`. The engine remounts a fresh
// document on reset, so the hook only re-hides the markers for a document that
// is reset in place (hands-on rehearsal).
const items = document.querySelectorAll(".tl__item");

window.demoHooks = {
  reset() {
    for (const item of items) item.hidden = true;
  },
};
