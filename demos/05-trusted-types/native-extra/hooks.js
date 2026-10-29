// Instrumentation for the native build (not shown on the code page): the
// hooks the steps call. `reset` has nothing to clear because the engine
// remounts a fresh document. `renderFixture` and `renderDirect` import the
// shown app.js (the same module instance the page loaded), call `render` or
// `renderDirect` with a fixture, and log what the browser did to #console.

const content = fetch("fixtures/cms-content.json").then((r) => r.json());
// A document the engine discards mid-load aborts this fetch; the hooks report it, not the window.
content.catch(() => {});

window.demoHooks = {
  reset() {},
  renderFixture: (name) => call("render", name),
  renderDirect: (name) => call("renderDirect", name),
};

function log(text) {
  const demoConsole = window.demoConsole;
  if (demoConsole) demoConsole.log(text);
}

async function call(fn, name) {
  const [app, data] = await Promise.all([import("./app.js"), content]);
  const body = data[name];
  if (typeof body !== "string") throw new Error(`No fixture named ${name}`);
  // A direct assignment reports a violation (report-only) or reports and
  // throws (enforce); the event is queued, so wait for it before the asserts.
  const reported = fn === "renderDirect" ? nextViolation() : Promise.resolve();
  let thrown = null;
  try {
    app[fn](body);
  } catch (error) {
    thrown = error;
  }
  await reported;
  // The console lists newest first. The violation report is queued after the throw, so the error
  // is logged once the report is in: the blocked write stays the top row (review r6 L10).
  if (thrown) log(`${thrown.name}: ${thrown.message}`);
  await settled(document.querySelector("#description img"));
}

function nextViolation() {
  return new Promise((resolve) => {
    const done = () => resolve();
    document.addEventListener("securitypolicyviolation", done, { once: true });
    setTimeout(done, 300);
  });
}

// An injected image loads or fails after a round trip; the payload's handler,
// if it survived, runs on that event. Wait for it so the step is settled.
function settled(img) {
  if (!img || img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true });
    setTimeout(done, 300);
  });
}
