/*
  Demo bridge. Injected by the composer into every demo document; the only app code that runs inside a demo.
  Parent -> demo: demo:setState, demo:ping, demo:reduceMotion, demo:highlight.
  Demo -> parent: demo:ready, demo:state, demo:spotlight, demo:error, demo:escape, demo:key, demo:pong.
  It never touches window.parent beyond postMessage. (PRD Part A, section 7.3)
*/
(function () {
  var embedded = window.parent && window.parent !== window;
  var requires = window.__DEMO_REQUIRES__ || [];
  var demoId = document.documentElement.getAttribute("data-demo-id") || "";
  var readyMessage = null; // kept so a late parent (listener attached after load) can ask for it again

  function post(msg) {
    if (embedded) window.parent.postMessage(msg, "*");
  }

  function evaluate(check) {
    try {
      if (check.kind === "css-supports") return CSS.supports(check.query);
      if (check.kind === "css-selector") return CSS.supports("selector(" + check.selector + ")");
      if (check.kind === "html-attr") return check.attr in document.createElement(check.element);
      if (check.kind === "js") return Boolean(new Function("return (" + check.expr + ")")());
    } catch (err) {
      return false;
    }
    return false;
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data.type !== "string") return;
    if (data.type === "demo:setState" && typeof data.state === "string") {
      document.documentElement.dataset.state = data.state;
      document.dispatchEvent(new CustomEvent("demostate", { detail: { state: data.state, stepId: data.stepId } }));
      post({ type: "demo:state", state: data.state });
    } else if (data.type === "demo:ping") {
      post(readyMessage || { type: "demo:pong" });
    } else if (data.type === "demo:reduceMotion") {
      document.documentElement.dataset.reducedMotion = data.value ? "true" : "false";
    } else if (data.type === "demo:highlight") {
      spotlight(typeof data.selector === "string" ? data.selector : "");
    }
  });

  // Marks the elements matching `selector` with data-spotlight (the composer styles it) and clears
  // every other mark. An empty selector clears. Echoes demo:spotlight with the match count.
  function spotlight(selector) {
    var prev = document.querySelectorAll("[data-spotlight]");
    for (var i = 0; i < prev.length; i++) prev[i].removeAttribute("data-spotlight");
    var count = 0;
    if (selector) {
      var els = [];
      try {
        els = document.querySelectorAll(selector);
      } catch (err) {
        post({ type: "demo:error", message: "Bad spotlight selector: " + selector });
      }
      void document.documentElement.offsetWidth; // flush so the pulse replays on the same element
      for (var j = 0; j < els.length; j++) els[j].setAttribute("data-spotlight", "");
      count = els.length;
    }
    post({ type: "demo:spotlight", selector: selector || null, count: count });
  }

  window.addEventListener("error", function (e) {
    post({ type: "demo:error", message: String(e.message || "error"), source: e.filename, line: e.lineno });
  });
  window.addEventListener("unhandledrejection", function (e) {
    post({ type: "demo:error", message: String((e.reason && e.reason.message) || e.reason || "rejection") });
  });

  var FORWARD = ["PageUp", "PageDown", "ArrowRight", "ArrowLeft", "b", ".", "0", "1", "2", "3", "4"];
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      post({ type: "demo:escape" });
      return;
    }
    var tag = e.target && e.target.tagName;
    var editing = tag === "INPUT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable);
    if (!editing && FORWARD.indexOf(e.key) !== -1) {
      e.preventDefault();
      post({ type: "demo:key", key: e.key, shiftKey: e.shiftKey });
    }
  });

  function ready() {
    var supports = {};
    for (var i = 0; i < requires.length; i++) supports[requires[i].id] = evaluate(requires[i]);
    readyMessage = { type: "demo:ready", id: demoId, supports: supports };
    post(readyMessage);
  }
  function onLoaded() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready, ready);
    else ready();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onLoaded);
  else onLoaded();
})();
