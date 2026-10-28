const dialog =
  document.querySelector('#cancel-418');
const live =
  document.querySelector('#status');
const row =
  document.querySelector('#order-418 p');
const orderId = '418';

dialog.addEventListener('close',
  async () => {
    const choice = dialog.returnValue;
    dialog.returnValue = '';
    if (choice !== 'confirm') return;
    await cancelOrder(orderId);
    row.textContent = 'Order 418, canceled';
    announce('Order 418 was canceled');
  });

async function cancelOrder(id) {
  const res = await fetch(
    `/api/orders/${id}/cancel`,
    { method: 'POST' });
  if (!res.ok) {
    announce('Order 418 was not canceled');
    throw new Error(`Cancel ${res.status}`);
  }
}

function announce(message) {
  live.textContent = message;
}
