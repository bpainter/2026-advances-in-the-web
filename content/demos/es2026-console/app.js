const ledger = [1e20, 0.1, -1e20];
const stock = new Set(["Trail Runner 2", "Road Racer"]);
const wishlist = new Set(["Road Racer", "Camp Slide"]);
const bySize = new Map();
const url =
  "https://shop.example/products/trail-runner-2";

// Before and after. Arrow bodies become the prompts.
const pairs = [
  [
    () => ledger.reduce((a, b) => a + b, 0),
    () => Math.sumPrecise(ledger),
  ],
  [
    () => [...stock].filter((s) => wishlist.has(s)),
    () => stock.intersection(wishlist),
  ],
  [
    () =>
      bySize.get("M") ?? bySize.set("M", []).get("M"),
    () => bySize.getOrInsert("L", ["Road Racer"]),
  ],
  [
    () => /\/products\/([^/]+)/.exec(url)[1],
    () =>
      new URLPattern({
        pathname: "/products/:slug",
      }).exec(url).pathname.groups.slug,
  ],
];

const out = document.querySelector("#out");

const show = (v) =>
  v instanceof Set
    ? `Set {${[...v].map(show).join(", ")}}`
    : JSON.stringify(v);

// Each line runs in a try; a missing API prints why.
function print(fn, kind) {
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
    .replace(/^\(\) =>\s*/, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*}/g, " }");
  samp.textContent = value;
  li.className = kind;
  li.append(code, samp);
  out.append(li);
}

// All eight lines print at load; the stage reveals
// them a pair at a time through html[data-state].
for (const [before, after] of pairs) {
  print(before, "before");
  print(after, "after");
}
