// Instrumentation for D4, not part of the talk's code (PRD Part A, 10.1; Part B, D4 notes): it
// stands in for the address bar. It writes the four state fields of the demo panel (address,
// title, focus as tag#id, scrollY) and the request log: `document <path>` on each full load, and
// `GET <path> 200` or `GET <path> aborted` for every fetch. It only observes; it is served on
// every address of both builds, and stays when the enhance-js flag removes app.js.
(function () {
  if (window.__d4Log) return;
  window.__d4Log = true;

  var fields = {
    url: document.getElementById("s-url"),
    title: document.getElementById("s-title"),
    focus: document.getElementById("s-focus"),
    scroll: document.getElementById("s-scroll"),
  };
  var log = document.getElementById("request-log");

  // The engine's own query (`?flags=`) and network profile (`demo-net=`) are plumbing, not part
  // of the application's address, so the panel leaves them out.
  function address(url) {
    var u = new URL(url, location.href);
    u.searchParams.delete("flags");
    u.searchParams.delete("demo-net");
    return u.pathname + u.search;
  }
  function describe(el) {
    if (!el || el === document.body || el === document.documentElement) return "body";
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    return s;
  }
  function set(el, text) {
    if (el && el.textContent !== text) el.textContent = text;
  }
  function update() {
    set(fields.url, address(location.href));
    set(fields.title, document.title);
    set(fields.focus, describe(document.activeElement));
    set(fields.scroll, String(Math.round(window.scrollY)));
  }
  function line(text) {
    if (!log) return null;
    var li = document.createElement("li");
    li.textContent = text;
    log.append(li);
    return li;
  }

  // State fields: on load, after each navigation (success or error), and on the events that
  // change one field between navigations.
  update();
  window.addEventListener("load", update);
  window.addEventListener("popstate", update);
  document.addEventListener("focusin", update);
  document.addEventListener("focusout", update);
  window.addEventListener("scroll", update, { passive: true });
  if (window.navigation) {
    // The address commits right after the navigate event is handled; WebKit 26.0 fires no
    // currententrychange, so the panel also reads it on the next task.
    navigation.addEventListener("navigate", function () {
      setTimeout(update, 0);
    });
    navigation.addEventListener("currententrychange", update);
    navigation.addEventListener("navigatesuccess", function () {
      update();
      requestAnimationFrame(update);
    });
    navigation.addEventListener("navigateerror", update);
  }

  // Request log. `fetch` is an accessor so that a wrapper installed later (the frame runtime
  // adds `demo-net=` to same-origin fetches) stays underneath this one instead of replacing it.
  var inner = window.fetch;
  function loggedFetch(input, init) {
    var path = address(input instanceof Request ? input.url : String(input));
    var li = line("GET " + path);
    var settled = false;
    function finish(text) {
      if (settled) return;
      settled = true;
      if (li) li.textContent = "GET " + path + " " + text;
    }
    var signal = init && init.signal;
    if (signal) {
      if (signal.aborted) finish("aborted");
      else
        signal.addEventListener("abort", function () {
          finish("aborted");
        });
    }
    var p = inner.call(window, input, init);
    p.then(
      function (res) {
        finish(String(res.status));
      },
      function (err) {
        finish(err && err.name === "AbortError" ? "aborted" : "failed");
      },
    );
    return p;
  }
  Object.defineProperty(window, "fetch", {
    configurable: true,
    enumerable: true,
    get: function () {
      return loggedFetch;
    },
    set: function (fn) {
      inner = fn;
    },
  });

  line("document " + address(location.href));
})();
