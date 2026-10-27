// The same four answers before ES2026: a compensated
// sum, a loop for the intersection, has-then-set, and
// a regex standing in for a route pattern.
const ledger = [1e20, 0.1, -1e20];
const stock = new Set(["Trail Runner 2", "Road Racer"]);
const wishlist = new Set(["Road Racer", "Camp Slide"]);
const bySize = new Map();
const url =
  "https://shop.example/products/trail-runner-2";

// Neumaier summation, because reduce alone returns 0.
function sum(xs) {
  let total = 0;
  let lost = 0;
  for (const x of xs) {
    const t = total + x;
    if (Math.abs(total) >= Math.abs(x)) {
      lost += total - t + x;
    } else {
      lost += x - t + total;
    }
    total = t;
  }
  return total + lost;
}

// Set algebra by hand: loop one set, probe the other.
function intersect(a, b) {
  const out = new Set();
  for (const v of a) {
    if (b.has(v)) out.add(v);
  }
  return out;
}

// has-then-set, in every codebase, slightly different.
function getOrInsert(map, key, value) {
  if (!map.has(key)) map.set(key, value);
  return map.get(key);
}

// A route pattern as a regex nobody wants to review.
function slugOf(href) {
  const m = /\/products\/([^/?#]+)/.exec(href);
  return m ? decodeURIComponent(m[1]) : null;
}

const lines = [
  () => sum(ledger),
  () => intersect(stock, wishlist),
  () => getOrInsert(bySize, "L", ["Road Racer"]),
  () => slugOf(url),
];

const out = document.querySelector("#out");

const show = (v) =>
  v instanceof Set
    ? `Set {${[...v].map(show).join(", ")}}`
    : JSON.stringify(v);

function print(fn) {
  let value;
  try {
    value = show(fn());
  } catch (e) {
    value = e.message;
  }
  const li = document.createElement("li");
  const code = document.createElement("code");
  const samp = document.createElement("samp");
  code.textContent = fn
    .toString()
    .replace(/^\(\) =>\s*/, "");
  samp.textContent = value;
  li.append(code, samp);
  out.append(li);
}

// All four lines print at load; the stage reveals them
// one at a time through html[data-state].
for (const fn of lines) print(fn);
