// A real form: the value posts and validation runs.
const form = document.forms[0];
const select = document.querySelector("#ship");
const sent = document.querySelector("#sent");

function report() {
  const country = new FormData(form).get("country");
  sent.value = `Posted country=${country}`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  report();
});

// Stage hook: showPicker() needs a click. "open" shows
// a replica built from the same options (styles.css);
// "japan" and "submitted" drive the real control.
const list = document.querySelector("#replica ul");

for (const option of select.options) {
  const item = document.createElement("li");
  item.dataset.value = option.value;
  item.append(...option.cloneNode(true).childNodes);
  list.append(item);
}

function sync() {
  for (const item of list.children) {
    item.dataset.checked =
      item.dataset.value === select.value;
  }
}
select.addEventListener("change", sync);
sync();

document.addEventListener("demostate", (e) => {
  const state = e.detail.state;
  if (state === "japan" && select.value !== "jp") {
    select.value = "jp";
    select.dispatchEvent(
      new Event("change", { bubbles: true }),
    );
  }
  if (state === "submitted") report();
  else sent.value = "";
});
