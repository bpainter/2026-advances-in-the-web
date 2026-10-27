// Everything color-mix(), oklch(from), light-dark() and
// contrast-color() now do in CSS.
const root = document.documentElement;
const brand = document.querySelector("#brand");
const dark = document.querySelector("#dark");

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function hex(channels) {
  const pair = (c) =>
    Math.round(c).toString(16).padStart(2, "0");
  return `#${channels.map(pair).join("")}`;
}

// Sass mix(): a weighted average of two colours.
function mix(a, b, t) {
  const bb = rgb(b);
  return hex(rgb(a).map((c, i) => c + (bb[i] - c) * t));
}

// Sass darken(): scale every channel toward black.
function darken(a, t) {
  return mix(a, "#000000", t);
}

// WCAG relative luminance, then black or white text.
function contrast(a) {
  const [r, g, b] = rgb(a).map((c) => {
    const s = c / 255;
    return s <= 0.03928
      ? s / 12.92
      : ((s + 0.055) / 1.055) ** 2.4;
  });
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return l > 0.179 ? "#000000" : "#ffffff";
}

// Recompute every derived colour and write it inline.
function paint() {
  const a = brand.value;
  const surface = dark.checked ? "#16213f" : "#ffffff";
  root.style.setProperty("--accent", a);
  root.style.setProperty(
    "--hero",
    mix(surface, a, 0.14),
  );
  root.style.setProperty(
    "--btn-hover",
    darken(a, 0.12),
  );
  root.style.setProperty("--btn-text", contrast(a));
}

brand.addEventListener("input", paint);
dark.addEventListener("change", () => {
  root.classList.toggle("dark", dark.checked);
  paint();
});
paint();

// Stage hook: the slide's steps drive the same states.
const swatch = {
  yellow: "#f7e36b",
  navy: "#17306b",
  dark: "#17306b",
  sweep: "#d2322d",
};
document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state in swatch) brand.value = swatch[state];
  dark.checked = state === "dark";
  root.classList.toggle("dark", dark.checked);
  paint();
});
