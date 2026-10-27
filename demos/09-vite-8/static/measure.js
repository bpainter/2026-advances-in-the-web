// Fills the F4 table from fixtures/vite-measurements.json (served at ./measurements.json). The
// markup already says "Not measured" in every cell, so the page stands without this script; any
// missing or null value keeps that text. Values are never typed here (PRD F4 builder notes).
const NOT_MEASURED = "Not measured";
const meta = document.querySelector("#measure-meta");
const foot = document.querySelector("#measure-foot");

const integer = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatMs(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(ms >= 10000 ? 1 : 2)} s`;
  return `${integer.format(ms)} ms`;
}

function formatKb(kb) {
  if (kb >= 10000) return `${(kb / 1024).toFixed(1)} MB`;
  return `${integer.format(kb)} KB`;
}

function formatCell(key, value) {
  if (value === null || value === undefined) return null;
  if (key.endsWith("Ms")) return typeof value === "number" ? formatMs(value) : null;
  if (key.endsWith("Kb")) return typeof value === "number" ? formatKb(value) : null;
  if (key === "warnings") return typeof value === "number" ? integer.format(value) : null;
  if (key === "failingPlugins")
    return Array.isArray(value) ? (value.length ? value : "None") : null;
  return String(value);
}

function fill(cell, formatted) {
  cell.replaceChildren();
  cell.removeAttribute("data-unmeasured");
  if (formatted === null) {
    cell.textContent = NOT_MEASURED;
    cell.setAttribute("data-unmeasured", "");
  } else if (Array.isArray(formatted)) {
    formatted.forEach((name, i) => {
      if (i) cell.append(", ");
      const code = document.createElement("code");
      code.textContent = name;
      cell.append(code);
    });
  } else {
    cell.textContent = formatted;
  }
}

function render(data) {
  const setups = { existing: data.existing || {}, vite8: data.vite8 || {} };
  for (const cell of document.querySelectorAll("#measure-table td[data-cell]")) {
    const [setup, key] = cell.getAttribute("data-cell").split(".");
    fill(cell, formatCell(key, setups[setup][key]));
  }
  for (const [setup, el] of [
    ["existing", document.querySelector("#v-existing")],
    ["vite8", document.querySelector("#v-vite8")],
  ]) {
    const v = setups[setup].vite;
    el.textContent = typeof v === "string" && v ? `Vite ${v}` : NOT_MEASURED;
  }
  const when = typeof data.measuredAt === "string" ? new Date(data.measuredAt) : null;
  if (when && !Number.isNaN(when.getTime())) {
    const parts = [`Measured ${dateFormat.format(when)}`];
    if (data.machine) parts.push(String(data.machine));
    if (data.node) parts.push(`Node ${data.node}`);
    meta.textContent = parts.join(" · ");
    foot.textContent =
      "Median of five runs. Cold: a fresh clone with caches cleared. Warm: a second run with caches kept.";
  } else {
    meta.textContent = NOT_MEASURED;
    foot.textContent = "Values arrive from pnpm measure:vite at rehearsal.";
  }
}

fetch("measurements.json", { headers: { Accept: "application/json" } })
  .then((r) => (r.ok ? r.json() : { measured: false }))
  .then(render)
  .catch(() => render({ measured: false }));
