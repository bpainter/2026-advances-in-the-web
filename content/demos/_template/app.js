// The feature's own script, if any, goes first.

// Stage hook: every interaction the audience must see
// is a state. Idempotent: setting the current state
// again is a no-op, and nothing here may throw while
// a transition is mid-flight (the presenter will
// double-press).
document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  switch (state) {
    case "rest":
      // Return every element to its resting look.
      break;
    case "highlighted":
      // CSS handles this one; see styles.css.
      break;
    default:
      break;
  }
});
