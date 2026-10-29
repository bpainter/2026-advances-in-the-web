// The editor side of the bridge. Every
// change crosses as a message.
const frame = document.querySelector(
  "#t-app-frame",
);
const field = document.querySelector(
  "#t-base-price",
);
let base = Number(
  field.getAttribute("value"),
);

function send() {
  frame.contentWindow.postMessage(
    { type: "base-price", value: base },
    location.origin,
  );
}

document.addEventListener(
  "price-change",
  (event) => {
    base = event.detail.value;
    send();
  },
);

window.addEventListener(
  "message",
  (event) => {
    if (event.origin !== location.origin)
      return;
    if (
      event.source !== frame.contentWindow
    )
      return;
    if (event.data?.type === "ready")
      send();
  },
);
