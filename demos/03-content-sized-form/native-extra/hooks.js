// Instrumentation for the native build (not shown on the code page). The
// engine remounts a fresh document on reset, so `reset` has nothing to clear.
// `formReset` calls the form's own reset. `submitted` resolves once a submit
// that app.js started has finished (the form's reset event follows the 204),
// so a replay can assert on the reset size without a timed wait.

const form = document.querySelector(".case-form");
let inFlight = 0;
let waiting = [];

form.addEventListener("submit", () => {
  inFlight += 1;
});

form.addEventListener("reset", () => {
  if (inFlight > 0) inFlight -= 1;
  if (inFlight === 0) {
    const resolvers = waiting;
    waiting = [];
    for (const resolve of resolvers) resolve();
  }
});

function settled() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

window.demoHooks = {
  reset() {},
  formReset() {
    form.reset();
    return settled();
  },
  submitted() {
    if (inFlight === 0) return settled();
    return new Promise((resolve) => waiting.push(resolve)).then(settled);
  },
};
