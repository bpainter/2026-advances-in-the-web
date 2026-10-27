/*
  Presenter hooks for the F2 frames (PRD Part A, 10.3 and Part B2, F2 builder notes). A classic
  script in the root layout, so `window.demoHooks` exists before the document finishes parsing
  and before the frame runtime reports ready. With `?presenter=1` it also adds the
  `presenter-origin` meta and loads the runtime from the demo origin; standalone it only registers
  the hooks the admin bar's Reload and Reset buttons use.

  Every state-changing hook ends in a full document load, so the presenter runtime resumes the
  step in the fresh document (its `unloading` / `ready` handshake) and the log rows it sees are
  the server-rendered ones. Those hooks return pending promises: the document unloads before the
  runtime's 600ms budget matters. Loads use location.replace, so history.length (part of the
  runtime's digest) stays constant.

  Sessions: the presenter mounts a hidden second frame beside the shown one on some moves and
  replays it, and the shown panel must not pick up that frame's lines or reset. `reset` starts a
  session for this frame, kept in window.name (it survives reloads, and each frame has its own).
  Each of this frame's own requests carries it as `?s=` (and, for React's own form posts, the
  `f2s` cookie); proxy.ts turns it into the `x-demo-session` header that lib/log.ts scopes lines
  by. On load the parameter is removed from the address bar again before the runtime reads it,
  so the runtime's digest (which includes the URL) is the same forward and back.
*/
(function () {
  "use strict";

  var script = document.currentScript;
  var app = script.getAttribute("data-app") || "now";
  var presenterOrigin = script.getAttribute("data-presenter-origin");
  var runtimeSrc = script.getAttribute("data-runtime");
  var PRODUCT = "ridgeline-trail";

  // The address bar never shows the session or the mount marker (see the header comment).
  (function () {
    var shown = new URL(location.href);
    if (shown.searchParams.has("s") || shown.searchParams.has("mount")) {
      shown.searchParams.delete("s");
      shown.searchParams.delete("mount");
      history.replaceState(history.state, "", shown.href);
    }
  })();

  function withSession(url) {
    if (window.name) url.searchParams.set("s", window.name);
    return url;
  }

  function pageUrl(extra) {
    var url = new URL(location.href);
    url.pathname = "/products/" + PRODUCT;
    url.searchParams.delete("reset");
    url.searchParams.delete("mount");
    url.searchParams.delete("inventoryDelayMs");
    Object.keys(extra || {}).forEach(function (k) {
      url.searchParams.set(k, String(extra[k]));
    });
    return withSession(url).href;
  }

  function setCookie(name, value) {
    document.cookie = name + "=" + encodeURIComponent(value) + "; Path=/; SameSite=Lax";
  }

  function newSession() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** Marks the next request from this frame as this frame's. */
  function stamp() {
    if (!window.name) window.name = newSession();
    setCookie("f2s", window.name);
  }

  function load(href) {
    document.documentElement.setAttribute("data-unloading", "");
    stamp();
    location.replace(href);
    return new Promise(function () {});
  }

  // A save still in flight when the next hook runs: the reload waits for it.
  var pendingSave = Promise.resolve();

  var hooks = {
    reset: function () {
      return pendingSave
        .then(function () {
          window.name = newSession();
          stamp();
          return fetch(withSession(new URL("/__demo/reset", location.href)).href, {
            method: "POST",
            credentials: "same-origin",
          });
        })
        .then(function () {
          window.dispatchEvent(new Event("f2:reset"));
          return load(pageUrl({ reset: 1 }));
        });
    },
    requestPage: function (opts) {
      var extra = {};
      if (opts && typeof opts === "object" && typeof opts.inventoryDelayMs === "number")
        extra.inventoryDelayMs = opts.inventoryDelayMs;
      return pendingSave.then(function () {
        return load(pageUrl(extra));
      });
    },
    probes: function () {
      var kinds = [];
      var rows = document.querySelectorAll("#request-log .log-row");
      for (var i = 0; i < rows.length; i++) kinds.push(rows[i].getAttribute("data-kind"));
      return { log: kinds.join(",") };
    },
  };

  if (app === "now") {
    hooks.invalidateProduct = function (copy) {
      var form = document.querySelector("form[data-demo-save]");
      if (!form) return Promise.reject(new Error("admin form missing"));
      form.elements.namedItem("copy").value = String(copy);
      // The form's own fields (including React's $ACTION_ID) posted to the page URL: Next runs
      // the shown Server Action as a no-JS form submission and answers with the re-rendered
      // document. A fetch, because the presenter's sandbox has no allow-forms and because it
      // works before React hydrates.
      stamp();
      var target = withSession(new URL(location.href));
      pendingSave = fetch(target.pathname + target.search, {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
      }).then(function (res) {
        if (!res.ok) throw new Error("save failed: " + res.status);
        // The action's tag expiry reaches the cache handler after its response; give it a beat
        // so the reload that follows is the first request to miss, forward and in replay alike.
        return new Promise(function (resolve) {
          setTimeout(resolve, 350);
        });
      });
      return pendingSave;
    };
    hooks.switchRegion = function (code) {
      setCookie("region", String(code));
    };
    hooks.switchUser = function (id) {
      setCookie("user", String(id));
    };
  } else {
    var reload = document.querySelector("[data-demo-reload]");
    var reset = document.querySelector("[data-demo-reset]");
    if (reload) reload.addEventListener("click", hooks.requestPage);
    if (reset) reset.addEventListener("click", hooks.reset);
  }

  window.demoHooks = hooks;

  // The admin bar's own Save (React's fetch) must land in this frame's session too.
  document.addEventListener("submit", stamp, true);

  if (
    new URLSearchParams(location.search).get("presenter") === "1" &&
    presenterOrigin &&
    runtimeSrc
  ) {
    var meta = document.createElement("meta");
    meta.name = "presenter-origin";
    meta.content = presenterOrigin;
    document.head.appendChild(meta);
    var runtime = document.createElement("script");
    runtime.src = runtimeSrc;
    runtime.async = false;
    document.head.appendChild(runtime);
  }
})();
