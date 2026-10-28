// Subject width from a hidden mirror: the
// span copies the input's text and font,
// its measured width becomes the input's
// width, and the measurement runs again on
// every input event, after fonts load, on
// resize and on reset.

const MIN_CHARS = 18;

export function createInputWidth(
  input,
  mirror,
) {
  function width(text) {
    mirror.textContent = text;
    return mirror.getBoundingClientRect()
      .width;
  }

  function measure() {
    const style = getComputedStyle(input);
    mirror.style.font = style.font;
    mirror.style.letterSpacing =
      style.letterSpacing;
    // Padding, borders and room for the
    // caret sit outside the text.
    const extra =
      parseFloat(style.paddingInlineStart) +
      parseFloat(style.paddingInlineEnd) +
      parseFloat(
        style.borderInlineStartWidth,
      ) +
      parseFloat(
        style.borderInlineEndWidth,
      ) +
      2;
    const min =
      width("0".repeat(MIN_CHARS)) + extra;
    const max =
      input.form.getBoundingClientRect()
        .width;
    const text =
      width(
        input.value || input.placeholder,
      ) + extra;
    const size = Math.min(
      max,
      Math.max(min, text),
    );
    input.style.inlineSize =
      Math.ceil(size) + "px";
  }

  input.addEventListener("input", measure);
  // Reset fires before the value clears, so
  // measure on the next frame.
  input.form.addEventListener("reset", () =>
    requestAnimationFrame(measure),
  );
  window.addEventListener(
    "resize",
    measure,
  );
  document.fonts.ready.then(measure);
  measure();
}
