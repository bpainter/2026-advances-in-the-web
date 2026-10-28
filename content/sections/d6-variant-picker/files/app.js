const form =
  document.querySelector('#variant');
const status =
  document.querySelector('#status');

// The select is a real form control, so
// FormData already has the color.
form.addEventListener('submit',
  async event => {
    event.preventDefault();
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    });
    status.textContent = await res.text();
  });
