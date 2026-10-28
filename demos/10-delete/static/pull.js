// Fills the F5 Weekly column and the header date from fixtures/npm-pull.json (served at
// ./npm-pull.json): one pull, one date, printed once (PRD F5 builder notes). The markup stands
// without this script, with a dash in every count.
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const header = document.querySelector("#pull-date");

function render(data) {
  const packages = data.packages || {};
  for (const li of document.querySelectorAll(".weekly li[data-package]")) {
    const entry = packages[li.getAttribute("data-package")];
    const weekly = entry && typeof entry.weekly === "number" ? entry.weekly : null;
    li.textContent = weekly === null ? "—" : compact.format(weekly);
    if (weekly === null) li.removeAttribute("data-pulled");
    else li.setAttribute("data-pulled", "");
  }
  const start =
    data.window && typeof data.window.start === "string" ? new Date(data.window.start) : null;
  if (start && !Number.isNaN(start.getTime()))
    header.textContent = `npm, week of ${dateFormat.format(start)}`;
  else header.textContent = "npm, one pull the week of the talk";
}

fetch("npm-pull.json", { headers: { Accept: "application/json" } })
  .then((r) => (r.ok ? r.json() : { pulled: false }))
  .then(render)
  .catch(() => render({ pulled: false }));

// The engine remounts a fresh document on reset, so the hook has nothing to clear; it must exist,
// or an instant replay stops at the s0 `reset` action.
window.demoHooks = { reset() {} };
