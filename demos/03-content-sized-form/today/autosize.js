// Textarea autosize the scrollHeight way:
// set the height to auto, read
// scrollHeight, write the new height
// clamped between a minimum and a maximum,
// and repeat after every edit, paste, font
// load, resize and form reset.

export function autosize(
  textarea,
  { minRows = 6, maxRows = 12 } = {},
) {
  let frame = 0;

  function resize() {
    const style =
      getComputedStyle(textarea);
    const lineHeight = parseFloat(
      style.lineHeight,
    );
    const border =
      parseFloat(
        style.borderBlockStartWidth,
      ) +
      parseFloat(style.borderBlockEndWidth);
    const padding =
      parseFloat(style.paddingBlockStart) +
      parseFloat(style.paddingBlockEnd);
    const min =
      minRows * lineHeight +
      padding +
      border;
    const max =
      maxRows * lineHeight +
      padding +
      border;
    // Shrinking needs the height reset
    // first, or scrollHeight never goes
    // down.
    textarea.style.blockSize = "auto";
    const height = Math.min(
      max,
      Math.max(
        min,
        textarea.scrollHeight + border,
      ),
    );
    textarea.style.blockSize =
      height + "px";
    textarea.style.overflowY =
      height >= max ? "auto" : "hidden";
    if (height <= min)
      textarea.dataset.rows = "min";
    else if (height >= max)
      textarea.dataset.rows = "max";
    else delete textarea.dataset.rows;
  }

  // Paste and reset fire before the value
  // changes, so measure on the next frame.
  function deferred() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(resize);
  }

  textarea.addEventListener(
    "input",
    resize,
  );
  textarea.addEventListener(
    "paste",
    deferred,
  );
  textarea.form.addEventListener(
    "reset",
    deferred,
  );
  window.addEventListener(
    "resize",
    deferred,
  );
  document.fonts.ready.then(resize);
  resize();
}
