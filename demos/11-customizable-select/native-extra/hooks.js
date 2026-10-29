// Instrumentation for the D6 native build (not shown). A scripted click
// (element.click(), untrusted) cannot open a select's picker: showPicker()
// needs a user activation the frame does not have when the clicker drives
// it. The runtime's click lands here; showPicker() opens the real picker when
// the frame holds an activation (hands-on mode), and a replica of the open
// picker stands in otherwise. `showFirefox` reveals the captured Firefox run
// beside the live select (PRD v4, 2.2).

const select = document.querySelector("#color");
const supportsBase = CSS.supports("appearance", "base-select");

function isOpen() {
  try {
    return select.matches(":open");
  } catch {
    return false;
  }
}

const replica = document.createElement("div");
replica.id = "picker-replica";
replica.className = "glass-menu picker-replica";
replica.hidden = true;
replica.setAttribute("aria-hidden", "true");
for (const option of select.options) {
  const row = document.createElement("div");
  row.className = "glass-menu__item picker-replica__option";
  row.dataset.value = option.value;
  const photo = option.querySelector("img");
  if (photo) row.append(photo.cloneNode(true));
  row.append(option.textContent.trim());
  replica.append(row);
}
select.after(replica);

function syncReplica() {
  for (const row of replica.children) row.classList.toggle("is-active", row.dataset.value === select.value);
}

select.addEventListener("click", (event) => {
  if (event.isTrusted || isOpen()) return;
  if (!replica.hidden) {
    replica.hidden = true;
    return;
  }
  try {
    if (typeof select.showPicker !== "function") throw new Error("no showPicker");
    select.showPicker();
  } catch {
    syncReplica();
    // Under its select, as the real picker opens (design review H5).
    replica.style.top = `${select.offsetTop + select.offsetHeight + 4}px`;
    replica.style.left = `${select.offsetLeft}px`;
    replica.hidden = !supportsBase;
  }
});
select.addEventListener("change", () => {
  syncReplica();
  replica.hidden = true;
});

const capture = document.createElement("figure");
capture.id = "firefox-capture";
capture.className = "glass-card firefox-capture";
capture.hidden = true;
capture.innerHTML = '<img src="/posters/d6-firefox.png" alt="The same form in Firefox: a normal select, and Save still posts the color."><figcaption>Firefox: a normal select</figcaption>';

// Below the status line, in the flow of the page (design review H6).
function showFirefox() {
  if (!capture.isConnected) (document.querySelector("#status") ?? select).after(capture);
  capture.hidden = false;
}

window.demoHooks = { reset() {}, showFirefox };
