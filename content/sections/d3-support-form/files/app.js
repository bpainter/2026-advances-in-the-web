const form =
  document.querySelector('.case-form');

// No sizing script. This only submits
// in place; native validation runs first.
form.addEventListener('submit',
  async event => {
    event.preventDefault();
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form)
    });
    if (res.ok) form.reset();
  });
