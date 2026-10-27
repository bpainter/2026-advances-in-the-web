// The only script: the picker sets one custom property.
const root = document.documentElement;
const brand = document.querySelector("#brand");

brand.addEventListener("input", () => {
  root.style.setProperty("--accent", brand.value);
});

// Stage hook: the slide's steps pick colours, flip the
// scheme and sweep the hue with no pointer on stage.
const dark = document.querySelector("#dark");
const swatch = {
  yellow: "#f7e36b",
  navy: "#17306b",
  dark: "#17306b",
};
let frame = 0;
let current = "";

function pick(value) {
  brand.value = value;
  brand.dispatchEvent(new Event("input"));
}

// A fully saturated hue as the hex the picker wants.
function hue(h) {
  const c = (n) => {
    const k = (n + h / 30) % 12;
    const v =
      0.5 -
      0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${c(0)}${c(8)}${c(4)}`;
}

// Around the wheel in 1.5 s, back to blue at the end.
function sweep() {
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / 1500, 1);
    pick(hue(220 + t * 360));
    frame = t < 1 ? requestAnimationFrame(tick) : 0;
  };
  frame = requestAnimationFrame(tick);
}

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state === current) return;
  current = state;
  cancelAnimationFrame(frame);
  frame = 0;
  if (state in swatch) pick(swatch[state]);
  if (state !== "sweep")
    dark.checked = state === "dark";
  if (state === "sweep") sweep();
});
