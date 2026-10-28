// The hand-rolled router (PRD Part B, D4
// "Today build spec"): a document-level
// click handler, a submit handler for the
// GET form, pushState and replaceState, a
// popstate listener, a scroll position map
// in sessionStorage keyed by history state,
// manual focus, an AbortController per
// navigation and a loading class. The pages
// live under the build prefix, so the
// application's addresses (/orders,
// /orders/418) are mapped onto it.

const BASE =
  "/demos/04-navigation-api/today";
const SCROLL_KEY = "d4-scroll";

const content =
  document.querySelector("#content");

let controller = null;
let nextId = 1;

// -- history state

function currentId() {
  return history.state &&
    typeof history.state.id === "number"
    ? history.state.id
    : null;
}

function ensureState() {
  if (currentId() === null) {
    history.replaceState(
      { id: nextId++ },
      "",
      entryUrl(),
    );
  } else {
    nextId = currentId() + 1;
  }
}

// The entry document is served as
// index.html; the router presents it as the
// list address.
function entryUrl() {
  const url = new URL(location.href);
  if (
    url.pathname === `${BASE}/index.html` ||
    url.pathname === `${BASE}/`
  ) {
    url.pathname = `${BASE}/orders`;
  }
  return url.href;
}

// -- scroll map

function readScrollMap() {
  try {
    return JSON.parse(
      sessionStorage.getItem(SCROLL_KEY) ||
        "{}",
    );
  } catch {
    return {};
  }
}

function saveScroll() {
  const id = currentId();
  if (id === null) return;
  const map = readScrollMap();
  map[id] = {
    x: window.scrollX,
    y: window.scrollY,
  };
  try {
    sessionStorage.setItem(
      SCROLL_KEY,
      JSON.stringify(map),
    );
  } catch {
    /* storage unavailable: scroll will not restore */
  }
}

function restoreScroll() {
  const id = currentId();
  const saved =
    id === null
      ? null
      : readScrollMap()[id];
  window.scrollTo(
    saved ? saved.x : 0,
    saved ? saved.y : 0,
  );
}

// -- addresses

// Application addresses are root-relative
// (/orders/418); the build lives under
// BASE.
function toBuildUrl(href) {
  const url = new URL(href, location.href);
  if (url.origin !== location.origin)
    return null;
  if (
    url.pathname === "/orders" ||
    url.pathname.startsWith("/orders/")
  ) {
    url.pathname = BASE + url.pathname;
  }
  if (
    !url.pathname.startsWith(
      `${BASE}/orders`,
    )
  )
    return null;
  return url;
}

function isPlainLink(event, link) {
  if (
    event.defaultPrevented ||
    event.button !== 0
  )
    return false;
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return false;
  if (link.hasAttribute("download"))
    return false;
  if (
    link.target &&
    link.target !== "_self"
  )
    return false;
  if (
    link
      .getAttribute("href")
      .startsWith("#")
  )
    return false;
  return true;
}

// -- loading

async function load(
  url,
  { push, restore },
) {
  if (controller) controller.abort();
  const mine = new AbortController();
  controller = mine;

  if (push) {
    saveScroll();
    history.pushState(
      { id: nextId++ },
      "",
      url,
    );
  }
  content.classList.add("is-loading");

  let page;
  try {
    const res = await fetch(url, {
      signal: mine.signal,
    });
    if (!res.ok)
      throw new Error(`HTTP ${res.status}`);
    page = new DOMParser().parseFromString(
      await res.text(),
      "text/html",
    );
  } catch (err) {
    // Superseded by a newer navigation.
    if (mine.signal.aborted) return;
    content.classList.remove("is-loading");
    showError(err);
    return;
  }
  // A newer navigation won the race.
  if (controller !== mine) return;

  const main =
    page.querySelector("#content");
  content.replaceChildren(
    ...(main ? main.childNodes : []),
  );
  document.title = page.title;
  content.classList.remove("is-loading");
  controller = null;

  if (restore) restoreScroll();
  else window.scrollTo(0, 0);
  content.focus({ preventScroll: true });
}

function showError(err) {
  const p = document.createElement("p");
  p.className = "error";
  p.textContent = `Could not load this page (${err.message}).`;
  content.replaceChildren(p);
  content.focus({ preventScroll: true });
}

// -- listeners

document.addEventListener(
  "click",
  (event) => {
    const link =
      event.target.closest("a[href]");
    if (!link || !isPlainLink(event, link))
      return;
    const url = toBuildUrl(link.href);
    if (!url) return;
    event.preventDefault();
    load(url, {
      push: true,
      restore: false,
    });
  },
);

document.addEventListener(
  "submit",
  (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement))
      return;
    if (
      (
        form.method || "get"
      ).toLowerCase() !== "get"
    )
      return;
    const url = toBuildUrl(form.action);
    if (!url) return;
    event.preventDefault();
    url.search = new URLSearchParams(
      new FormData(form),
    ).toString();
    load(url, {
      push: true,
      restore: false,
    });
  },
);

window.addEventListener("popstate", () => {
  ensureState();
  load(new URL(location.href), {
    push: false,
    restore: true,
  });
});

// Keep the current entry's scroll position
// fresh so Back restores it even after a
// reload.
let scrollTimer = 0;
window.addEventListener(
  "scroll",
  () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(
      saveScroll,
      100,
    );
  },
  { passive: true },
);

history.scrollRestoration = "manual";
ensureState();
