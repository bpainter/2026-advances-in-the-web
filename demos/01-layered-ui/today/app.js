// The order row: wires the hand-rolled menu and modal to the one request the
// row exists for, and announces the result.

import { createMenu } from "./menu.js";
import { createModal } from "./modal.js";

const orderId = "418";
const actions = document.querySelector("#t-actions");
const live = document.querySelector("#t-status");

const modal = createModal({
  title: `Cancel order ${orderId}?`,
  keepLabel: "Keep order",
  confirmLabel: "Cancel order",
  onClose: async (reason) => {
    if (reason !== "confirm") return;
    await cancelOrder(orderId);
    announce(`Order ${orderId} was canceled`);
  },
});

const menu = createMenu(actions, {
  items: [{ id: "t-cancel", label: "Cancel order" }],
  onSelect(item) {
    if (item.id === "t-cancel") modal.open({ returnFocusTo: actions });
  },
});

async function cancelOrder(id) {
  const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
  if (!res.ok) {
    announce(`Order ${id} was not canceled`);
    throw new Error(`Cancel ${res.status}`);
  }
}

function announce(message) {
  live.textContent = message;
}

// Frame hook: the engine remounts the document, so reset only clears what a
// remount would otherwise leave behind in this page: open layers and the
// status line.
function reset() {
  modal.close("dismiss", { restoreFocus: false });
  menu.close({ restoreFocus: false });
  announce("");
}

window.demoHooks = { reset };
