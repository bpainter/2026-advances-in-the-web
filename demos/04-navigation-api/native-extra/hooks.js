// Frame hooks for D4 (not shown on the code page). Both builds declare `reset` and `scrollTo`:
// the engine remounts a fresh document on reset, so the hook only clears what a remount cannot,
// the today router's scroll map in sessionStorage.
window.demoHooks = {
  reset() {
    try {
      sessionStorage.removeItem("d4-scroll");
    } catch {
      /* storage unavailable */
    }
  },
  scrollTo(x, y) {
    window.scrollTo(x, y);
  },
};
