/*
  Demo frame runtime (PRD Part A, sections 3 to 5). Injected into every frame document on the demo
  origin. It does nothing until a valid `init` arrives from the presenter origin, so a document
  opened standalone behaves as a plain page.

  Trusted Types safe: no innerHTML, outerHTML, insertAdjacentHTML, document.write, DOMParser, eval,
  new Function, string timers, on* attribute writes or script src writes.

  Parent -> runtime: init, run-step, replay-to, finish, reset, set-flag, set-mode, watch.
  Runtime -> parent: ready, rects, cue, unloading, step-done, error, key, resize-viewport (extension:
  the `:viewport` resize target asks the parent to resize the iframe).
*/
(function () {
  "use strict";

  var metaEl = document.querySelector('meta[name="presenter-origin"]');
  var PRESENTER = metaEl ? metaEl.getAttribute("content") : null;
  var embedded = window.parent && window.parent !== window;

  var frameId = null;
  var mirror = false;
  var handsOn = false;
  var reducedMotion = false;
  var sideEffects = [];
  var pace = { glideMs: 420, rippleMs: 260, charMs: 45, resizeMs: 700, revealMs: 250 };
  var flags = {};
  var watched = [];
  var liveRects = false;
  var lastRectsJson = "";
  var rectsSeq = 0;
  var activeUntil = 0;
  var netProfile = "fast";
  var pendingFetches = 0;
  var asserts = [];
  var revealed = [];
  var resized = {};
  var terminalLines = 0;
  var run = null; // { runId, stepId, cancelled, finish, instant, cursor }
  var hooks = function () {
    return window.demoHooks || {};
  };

  function post(msg) {
    if (!embedded || !PRESENTER) return;
    msg.v = 1;
    msg.frameId = frameId;
    window.parent.postMessage(msg, PRESENTER);
  }

  // ---------------------------------------------------------------- features

  function features() {
    function supports(q) {
      try {
        return CSS.supports(q);
      } catch (e) {
        return false;
      }
    }
    return {
      popover: "showPopover" in HTMLElement.prototype,
      "dialog-request-close": "requestClose" in HTMLDialogElement.prototype,
      "invoker-commands": "commandForElement" in HTMLButtonElement.prototype,
      "open-pseudo": supports("selector(:open)"),
      "container-queries": supports("container-type: inline-size"),
      scope: typeof CSSScopeRule !== "undefined",
      has: supports("selector(:has(a))"),
      "field-sizing": supports("field-sizing: content"),
      "navigation-api": "navigation" in window,
      "trusted-types": "trustedTypes" in window,
      "customizable-select": supports("appearance: base-select"),
      "anchor-positioning": supports("anchor-name: --a"),
      "focus-visible-option": probeFocusVisibleOption(),
    };
  }

  var focusVisibleNative = null;
  function probeFocusVisibleOption() {
    if (focusVisibleNative !== null) return focusVisibleNative;
    if (document.activeElement && document.activeElement !== document.body) return (focusVisibleNative = false);
    try {
      var b = document.createElement("button");
      b.style.position = "fixed";
      b.style.opacity = "0";
      b.style.pointerEvents = "none";
      document.body.appendChild(b);
      b.focus({ focusVisible: true, preventScroll: true });
      focusVisibleNative = b.matches(":focus-visible");
      b.blur();
      b.remove();
    } catch (e) {
      focusVisibleNative = false;
    }
    return focusVisibleNative;
  }

  // ---------------------------------------------------------------- helpers

  function q(sel) {
    var el = document.querySelector(sel);
    if (!el) throw errorOf("selector-not-found", "No element matches " + sel, sel);
    return el;
  }
  function errorOf(code, message, selector) {
    var e = new Error(message);
    e.code = code;
    e.selector = selector;
    return e;
  }
  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }
  function sleep(ms) {
    return new Promise(function (r) {
      setTimeout(r, ms);
    });
  }
  function raf() {
    return new Promise(function (r) {
      requestAnimationFrame(function () {
        r();
      });
    });
  }
  function focusable(el) {
    if (!el || typeof el.focus !== "function") return false;
    if (el.matches("a[href], button, input, select, textarea, summary, [tabindex], [contenteditable]")) return !el.disabled;
    return false;
  }
  function isTextControl(el) {
    return !!el && (el.matches("input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea, select") || el.isContentEditable);
  }

  // ---------------------------------------------------------------- instant sheet

  var instantSheet = null;
  function enableInstant() {
    try {
      if (!instantSheet) {
        instantSheet = new CSSStyleSheet();
        instantSheet.replaceSync("@layer presenter-instant { *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; } }");
      }
      if (document.adoptedStyleSheets.indexOf(instantSheet) === -1) document.adoptedStyleSheets = document.adoptedStyleSheets.concat([instantSheet]);
    } catch (e) {
      /* no adopted sheets */
    }
  }
  function disableInstant() {
    if (!instantSheet) return;
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(function (s) {
      return s !== instantSheet;
    });
  }
  function finishAnimations() {
    try {
      document.getAnimations().forEach(function (a) {
        try {
          a.finish();
        } catch (e) {
          /* not finishable */
        }
      });
    } catch (e) {
      /* no WAAPI */
    }
  }

  // ---------------------------------------------------------------- network

  var nativeFetch = window.fetch;
  function installFetch() {
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : input && input.url ? input.url : String(input);
      try {
        var u = new URL(url, location.href);
        if (u.origin === location.origin) {
          if (netProfile === "slow" && !mirror) u.searchParams.set("demo-net", run && run.instant ? "slow-instant" : "slow");
          if (mirror && init && init.method && init.method.toUpperCase() !== "GET") {
            return Promise.resolve(new Response(null, { status: 204 }));
          }
          url = u.href;
          input = typeof input === "string" ? url : new Request(url, input);
        }
      } catch (e) {
        /* leave input */
      }
      pendingFetches++;
      var done = function () {
        pendingFetches--;
      };
      var p = nativeFetch.call(window, input, init);
      p.then(done, done);
      return p;
    };
  }

  // Instant mode keeps no idle time, but a `wait` still lasts while the navigation or request the
  // previous actions started is in flight (fetch, render, focus, scroll restoration), capped at
  // the authored duration: a replay then settles the way the animated run did, and a wait that is
  // shorter than a slow response still leaves that request in flight, so stale-request aborts
  // replay deterministically (PRD Part A, 10.1 and 15).
  async function settle(ms) {
    var deadline = Date.now() + Math.min(ms, 2000);
    await sleep(0); // queued navigations (form submission, traversal) start in a task
    while (Date.now() < deadline) {
      var busy = pendingFetches > 0;
      try {
        if (window.navigation && navigation.transition) busy = true;
      } catch (e) {
        /* none */
      }
      if (!busy) break;
      await sleep(10);
    }
    await raf();
  }

  async function quiescence() {
    var start = Date.now();
    while (pendingFetches > 0 && Date.now() - start < 1500) await sleep(20);
    try {
      if (window.navigation && navigation.transition) await navigation.transition.finished.catch(function () {});
    } catch (e) {
      /* none */
    }
    try {
      await Promise.all(
        document.getAnimations().map(function (a) {
          return a.finished.catch(function () {});
        }),
      );
    } catch (e) {
      /* none */
    }
    await raf();
    await raf();
  }

  // ---------------------------------------------------------------- flags

  function enhancementSheets() {
    return Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"][data-flag="enhance-css"], style[data-flag="enhance-css"]'));
  }
  var removedSupports = []; // { sheet, rules: [{ index, cssText }] }
  function applyFlag(flag, on) {
    flags[flag] = on;
    if (flag === "enhance-css") {
      var mode = document.documentElement.getAttribute("data-enhance-css-mode") || "all";
      if (mode === "supports-blocks") {
        if (!on) {
          removedSupports = [];
          Array.prototype.slice.call(document.styleSheets).forEach(function (sheet) {
            var removed = [];
            try {
              for (var i = sheet.cssRules.length - 1; i >= 0; i--) {
                if (sheet.cssRules[i] instanceof CSSSupportsRule) {
                  removed.unshift({ index: i, cssText: sheet.cssRules[i].cssText });
                  sheet.deleteRule(i);
                }
              }
            } catch (e) {
              /* cross-origin sheet */
            }
            if (removed.length) removedSupports.push({ sheet: sheet, rules: removed });
          });
        } else {
          removedSupports.forEach(function (entry) {
            entry.rules.forEach(function (r) {
              try {
                entry.sheet.insertRule(r.cssText, Math.min(r.index, entry.sheet.cssRules.length));
              } catch (e) {
                /* unsupported rule */
              }
            });
          });
          removedSupports = [];
        }
      } else {
        enhancementSheets().forEach(function (el) {
          if (el.sheet) el.sheet.disabled = !on;
          else el.disabled = !on;
        });
      }
      return;
    }
    if (flag === "enhance-js" || flag === "csp-enforce") {
      throw errorOf("flag-unknown", flag + " reloads the document; the engine splits the step at it");
    }
    throw errorOf("flag-unknown", "Unknown flag " + flag);
  }

  // ---------------------------------------------------------------- rects

  function computeRects() {
    var rects = {};
    for (var i = 0; i < watched.length; i++) {
      var sel = watched[i];
      var list = [];
      try {
        var els = document.querySelectorAll(sel);
        for (var j = 0; j < els.length; j++) {
          var r = rectOf(els[j]);
          var cs = getComputedStyle(els[j]);
          if (r.w > 0 && r.h > 0 && cs.visibility !== "hidden") list.push(r);
        }
      } catch (e) {
        /* bad selector */
      }
      rects[sel] = list;
    }
    var active = document.activeElement;
    var focus = active && active !== document.body && active !== document.documentElement ? rectOf(active) : null;
    var fv = false;
    try {
      fv = !!active && active.matches(":focus-visible");
    } catch (e) {
      fv = false;
    }
    return { rects: rects, focus: focus, focusVisible: fv };
  }
  function postRects(force) {
    if (!frameId) return;
    var data = computeRects();
    var json = JSON.stringify(data);
    if (!force && json === lastRectsJson) return;
    lastRectsJson = json;
    post({ type: "rects", seq: ++rectsSeq, viewport: { w: window.innerWidth, h: window.innerHeight }, rects: data.rects, focus: data.focus, focusVisibleNative: data.focusVisible || focusVisibleNative === true });
  }
  var rafPending = false;
  function scheduleRects() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      postRects(false);
    });
  }
  function startObservers() {
    try {
      new ResizeObserver(scheduleRects).observe(document.documentElement);
    } catch (e) {
      /* none */
    }
    window.addEventListener("resize", scheduleRects);
    document.addEventListener("scroll", scheduleRects, true);
    try {
      new MutationObserver(scheduleRects).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    } catch (e) {
      /* none */
    }
    document.addEventListener("focusin", scheduleRects);
    document.addEventListener("focusout", scheduleRects);
    (function loop() {
      if (liveRects || Date.now() < activeUntil) scheduleRects();
      requestAnimationFrame(loop);
    })();
  }

  // ---------------------------------------------------------------- asserts and digest

  function evaluate(target, expect) {
    var negate = expect.charAt(0) === "!";
    var ex = negate ? expect.slice(1) : expect;
    var el = document.querySelector(target);
    var actual = "";
    var pass = false;
    function visible(e) {
      if (!e) return false;
      var r = e.getBoundingClientRect();
      var cs = getComputedStyle(e);
      return r.width > 0 && r.h !== 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
    }
    var m;
    if (ex.charAt(0) === ":") {
      pass = !!el && el.matches(ex);
      actual = el ? (pass ? "matches" : "does not match") + " " + ex : "missing";
    } else if (ex === "focused") {
      pass = !!el && document.activeElement === el;
      actual = document.activeElement ? describe(document.activeElement) : "none";
    } else if (ex === "visible") {
      pass = visible(el);
      actual = el ? (pass ? "visible" : "not visible") : "missing";
    } else if (ex === "hidden") {
      pass = !visible(el);
      actual = el ? (pass ? "hidden" : "visible") : "missing";
    } else if ((m = /^count=(\d+)$/.exec(ex))) {
      var n = document.querySelectorAll(target).length;
      pass = n === Number(m[1]);
      actual = String(n);
    } else if ((m = /^value-length([<>=])(\d+)$/.exec(ex))) {
      var len = el && "value" in el ? String(el.value).length : -1;
      pass = m[1] === ">" ? len > Number(m[2]) : m[1] === "<" ? len < Number(m[2]) : len === Number(m[2]);
      actual = String(len);
    } else if ((m = /^inline-size([<>=])(\d+)px$/.exec(ex))) {
      var w = el ? el.getBoundingClientRect().width : -1;
      pass = m[1] === ">" ? w > Number(m[2]) : m[1] === "<" ? w < Number(m[2]) : Math.round(w) === Number(m[2]);
      actual = Math.round(w) + "px";
    } else if ((m = /^(?:text~=|contains:)(.*)$/.exec(ex))) {
      var text = el ? el.textContent || "" : "";
      pass = text.indexOf(m[1]) !== -1;
      actual = text.trim().slice(0, 80);
    } else if ((m = /^attr:([\w-]+)(?:=(.*))?$/.exec(ex))) {
      var has = !!el && el.hasAttribute(m[1]);
      pass = m[2] === undefined ? has : has && el.getAttribute(m[1]) === m[2];
      actual = has ? m[1] + "=" + el.getAttribute(m[1]) : "no " + m[1];
    } else if ((m = /^no-attr:([\w-]+)$/.exec(ex))) {
      pass = !!el && !el.hasAttribute(m[1]);
      actual = el && el.hasAttribute(m[1]) ? "has " + m[1] : "no " + m[1];
    } else if ((m = /^url=(.*)$/.exec(ex))) {
      var here = location.pathname + location.search;
      pass = here === m[1];
      actual = here;
    } else if ((m = /^style:block-size=([\d.]+)lh$/.exec(ex))) {
      var cs = el ? getComputedStyle(el) : null;
      var lh = cs ? parseFloat(cs.lineHeight) : 0;
      var bs = cs ? parseFloat(cs.blockSize || cs.height) : -1;
      pass = !!cs && Math.abs(bs - Number(m[1]) * lh) <= 2;
      actual = bs + "px (lh " + lh + "px)";
    } else if ((m = /^columns=(\d+)$/.exec(ex))) {
      var cols = el ? getComputedStyle(el).gridTemplateColumns : "";
      var count = cols && cols !== "none" ? cols.trim().split(/\s+/).length : 0;
      pass = count === Number(m[1]);
      actual = cols || "none";
    } else {
      actual = "unknown expectation " + ex;
    }
    if (negate) pass = !pass;
    return { pass: pass, actual: actual };
  }

  function describe(el) {
    if (!el) return "none";
    var s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    return s;
  }

  function digest() {
    var entries = [];
    entries.push("url=" + location.pathname + location.search);
    entries.push("title=" + document.title);
    entries.push("history=" + history.length);
    entries.push("active=" + describe(document.activeElement));
    entries.push("popovers=" + document.querySelectorAll(":popover-open").length);
    var dialogs = document.querySelectorAll("dialog[open]");
    entries.push("dialogs=" + dialogs.length);
    var controls = document.querySelectorAll("input[id], textarea[id], select[id]");
    for (var i = 0; i < controls.length; i++) entries.push("value:" + controls[i].id + "=" + (controls[i].type === "checkbox" ? controls[i].checked : controls[i].value));
    entries.push("scroll=" + Math.round(window.scrollY));
    Object.keys(flags).forEach(function (k) {
      entries.push("flag:" + k + "=" + flags[k]);
    });
    entries.push("revealed=" + revealed.join(","));
    Object.keys(resized).forEach(function (k) {
      entries.push("inline-size:" + k + "=" + resized[k]);
    });
    entries.push("terminal-lines=" + terminalLines);
    asserts.forEach(function (a) {
      entries.push("assert:" + a.stepId + ":" + a.index + "=" + a.pass);
    });
    var probes = hooks().probes;
    if (typeof probes === "function") {
      try {
        var extra = probes() || {};
        Object.keys(extra).forEach(function (k) {
          entries.push("probe:" + k + "=" + extra[k]);
        });
      } catch (e) {
        /* probe failure */
      }
    }
    entries.sort();
    return fnv(entries.join("\n"));
  }
  function fnv(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8);
  }

  // ---------------------------------------------------------------- cues

  async function cue(kind, data, ms) {
    if (!run || run.instant || mirror) return;
    var msg = { type: "cue", runId: run.runId, index: run.cursor.action, cue: Object.assign({ kind: kind }, data) };
    post(msg);
    if (ms > 0 && !reducedMotion) await sleep(ms);
    else if (ms > 0) await sleep(Math.min(ms, 120));
  }

  // ---------------------------------------------------------------- actions

  function viaKind(via, key) {
    var v = String(via);
    if (/hook:/.test(v)) return "hook";
    if (/requestClose/.test(v)) return "dialog-close";
    if (/hidePopover/.test(v)) return "popover-hide";
    if (/requestSubmit/.test(v)) return "submit";
    if (/dispatch/.test(v)) return "dispatch";
    if (/selectedIndex|\.next\(\)|\.prev\(\)/.test(v)) return "select";
    if (/navigation\.back|history\.back/.test(v)) return "back";
    if (/navigation\.forward|history\.forward/.test(v)) return "forward";
    if (/focus\(/.test(v)) return "focus";
    if (/click\(\)/.test(v)) return "click";
    if (key === "Escape") return "dialog-close";
    if (key === "Tab" || key === "Shift+Tab") return "focus";
    if (key === "Enter" || key === "Space") return "click";
    if (key === "ArrowDown" || key === "ArrowUp") return "select";
    return "dispatch";
  }

  function keycapLabel(key) {
    return { Escape: "Esc", "Shift+Tab": "Shift Tab", "Alt+ArrowLeft": "Alt ←", "Alt+ArrowRight": "Alt →", ArrowDown: "↓", ArrowUp: "↑" }[key] || key;
  }

  function focusThenClick(el) {
    if (focusable(el)) {
      try {
        el.focus({ preventScroll: true, focusVisible: false });
      } catch (e) {
        el.focus();
      }
    }
    el.click();
  }

  function topmostDialog() {
    var open = document.querySelectorAll("dialog[open]");
    return open.length ? open[open.length - 1] : null;
  }
  function topmostPopover() {
    var open = document.querySelectorAll(":popover-open");
    return open.length ? open[open.length - 1] : null;
  }

  // Back and Forward (PRD Part A, 3.3): navigation.back()/forward() where the API exists, else
  // history. The traversal may be intercepted (same document; the run continues here) or load a
  // document (`pagehide` posts `unloading` with the cursor), so nothing is announced up front.
  // The API's promises reject when there is no entry to go to; that must not surface as an
  // uncaught error.
  function swallow(result) {
    if (!result) return;
    if (result.committed) result.committed.catch(function () {});
    if (result.finished) result.finished.catch(function () {});
    if (typeof result.catch === "function") result.catch(function () {});
  }
  function traverse(dir) {
    if (window.navigation) swallow(dir === "back" ? navigation.back() : navigation.forward());
    else if (dir === "back") history.back();
    else history.forward();
  }

  async function exec(action, instant) {
    var el;
    switch (action.type) {
      case "pointer":
        el = q(action.to);
        await cue("cursor", { to: rectOf(el), ms: pace.glideMs }, pace.glideMs);
        return;
      case "click":
        el = q(action.target);
        await cue("cursor", { to: rectOf(el), ms: pace.glideMs }, pace.glideMs);
        await cue("ripple", { at: rectOf(el) }, pace.rippleMs);
        if (el.matches('button[type="submit"], input[type="submit"]') || (el.form && el.type === "submit")) markUnloadingSoon();
        focusThenClick(el);
        return;
      case "key": {
        await cue("keycap", { label: keycapLabel(action.key), ms: 900 }, 150);
        var kind = viaKind(action.via, action.key);
        el = action.target ? q(action.target) : null;
        if (kind === "dialog-close") {
          var d = el && el.tagName === "DIALOG" ? el : topmostDialog();
          if (!d) throw errorOf("via-unsupported", "No open dialog to close");
          if (typeof d.requestClose === "function") d.requestClose();
          else {
            var ev = new Event("cancel", { cancelable: true });
            if (d.dispatchEvent(ev)) d.close();
          }
        } else if (kind === "popover-hide") {
          var p = el || topmostPopover();
          if (!p) throw errorOf("via-unsupported", "No open popover to hide");
          p.hidePopover();
        } else if (kind === "focus") {
          if (!el) throw errorOf("via-unsupported", "focus(target) needs a target");
          el.focus({ focusVisible: true });
        } else if (kind === "click") {
          focusThenClick(el || document.activeElement);
        } else if (kind === "submit") {
          var f = (el || document.activeElement).form || (el || document.activeElement).closest("form");
          if (!f) throw errorOf("via-unsupported", "No form owner for requestSubmit");
          markUnloadingSoon();
          f.requestSubmit();
        } else if (kind === "select") {
          var s = el || document.activeElement;
          var dir = action.key === "ArrowUp" ? -1 : 1;
          s.selectedIndex = Math.max(0, Math.min(s.options.length - 1, s.selectedIndex + dir));
          s.dispatchEvent(new Event("input", { bubbles: true }));
          s.dispatchEvent(new Event("change", { bubbles: true }));
        } else if (kind === "back" || kind === "forward") {
          traverse(kind);
          await sleep(instant ? 60 : 200);
        } else if (kind === "hook") {
          var hookName = /hook:([\w-]+)/.exec(String(action.via))[1];
          await callHook(hookName, [], instant);
        } else {
          var t = el || document.activeElement || document;
          var parts = action.key.split("+");
          var keyName = parts[parts.length - 1] === "Space" ? " " : parts[parts.length - 1];
          var initDict = { key: keyName, bubbles: true, cancelable: true, shiftKey: parts.indexOf("Shift") !== -1, altKey: parts.indexOf("Alt") !== -1 };
          t.dispatchEvent(new KeyboardEvent("keydown", initDict));
          t.dispatchEvent(new KeyboardEvent("keyup", initDict));
        }
        return;
      }
      case "focus":
        el = q(action.target);
        el.focus({ focusVisible: action.visible !== false });
        return;
      case "type": {
        el = q(action.target);
        el.focus({ preventScroll: true });
        var text = action.text;
        for (var i = 0; i < text.length; i++) {
          if (run && run.cancelled) return;
          insertText(el, text.charAt(i), "insertText");
          if (!instant && !(run && run.finishing)) await sleep(reducedMotion ? 0 : pace.charMs);
          else if (i % 40 === 0) await raf();
        }
        return;
      }
      case "paste":
        el = q(action.target);
        el.focus({ preventScroll: true });
        await cue("caption", { text: "Paste", ms: 900 }, 300);
        insertText(el, action.text, "insertFromPaste");
        return;
      case "resize": {
        if (action.target === ":viewport") {
          post({ type: "resize-viewport", inlineSize: action.inlineSize, ms: instant ? 0 : pace.resizeMs });
          await sleep(instant ? 30 : pace.resizeMs + 30);
          resized[":viewport"] = action.inlineSize;
          return;
        }
        el = q(action.target);
        var from = el.getBoundingClientRect().width + "px";
        if (!instant && !reducedMotion) {
          try {
            var anim = el.animate([{ inlineSize: from }, { inlineSize: action.inlineSize }], { duration: pace.resizeMs, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
            await anim.finished.catch(function () {});
            anim.cancel();
          } catch (e) {
            /* no WAAPI */
          }
        }
        el.style.inlineSize = action.inlineSize;
        resized[action.target] = action.inlineSize;
        return;
      }
      case "toggle":
        applyFlag(action.flag, action.on);
        return;
      case "navigate":
        if (action.history) {
          traverse(action.history);
        } else if (action.url) {
          if (window.navigation) swallow(navigation.navigate(action.url));
          else location.assign(action.url);
        }
        await sleep(instant ? 60 : 200);
        return;
      case "network":
        netProfile = action.profile;
        if (!instant) await cue("caption", { text: action.profile === "slow" ? "Slow network" : "Fast network", ms: 900 }, 0);
        var netHook = hooks().setNetwork;
        if (typeof netHook === "function") await netHook(action.profile);
        return;
      case "hook":
        await callHook(action.name, action.args || [], instant);
        return;
      case "terminal": {
        var lines = document.querySelectorAll("[data-line]");
        for (var k = 0; k < lines.length; k++) {
          var ln = Number(lines[k].getAttribute("data-line"));
          if (ln >= action.lines[0] && ln <= action.lines[1]) {
            lines[k].hidden = false;
            if (!instant && lines[k].getAttribute("data-kind") === "cmd") await sleep(Math.min(350, 30 * (lines[k].textContent || "").length));
            else if (!instant) await sleep(Math.min(350, Number(lines[k].getAttribute("data-delay") || 0)));
          }
        }
        terminalLines = Math.max(terminalLines, action.lines[1]);
        var scroller = document.querySelector("[data-terminal]") || document.scrollingElement;
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
        return;
      }
      case "reveal":
        el = q(action.target);
        el.hidden = false;
        el.removeAttribute("hidden");
        if (revealed.indexOf(action.target) === -1) revealed.push(action.target);
        if (!instant) await sleep(pace.revealMs);
        return;
      case "wait":
        if (!instant && !(run && run.finishing)) await sleep(action.ms);
        else if (instant) await settle(action.ms);
        return;
      case "assert": {
        var result = evaluate(action.target, action.expect);
        asserts.push({ stepId: run ? run.stepId : "", index: run ? run.cursor.action : 0, target: action.target, expect: action.expect, pass: result.pass, actual: result.actual });
        return;
      }
      default:
        throw errorOf("exception", "Unknown action " + action.type);
    }
  }

  var unloadSoon = false;
  function markUnloadingSoon() {
    unloadSoon = true;
  }
  window.addEventListener("pagehide", function () {
    if (run && !run.unloadPosted) {
      run.unloadPosted = true;
      post({ type: "unloading", runId: run.runId, cursor: { step: run.cursor.step, action: run.cursor.action + 1 } });
    }
  });

  function insertText(el, text, inputType) {
    var before = new InputEvent("beforeinput", { inputType: inputType, data: text, bubbles: true, cancelable: true });
    if (!el.dispatchEvent(before)) return;
    if (typeof el.setRangeText === "function" && "value" in el) {
      var end = el.value.length;
      el.setRangeText(text, end, end, "end");
    } else if (el.isContentEditable) {
      el.append(document.createTextNode(text));
    } else if ("value" in el) {
      el.value += text;
    }
    el.dispatchEvent(new InputEvent("input", { inputType: inputType, data: text, bubbles: true }));
  }

  async function callHook(name, args, instant) {
    var h = hooks()[name];
    if (typeof h !== "function") throw errorOf("hook-missing", "Frame hook " + name + " is not registered");
    if (mirror && sideEffects.indexOf(name) !== -1) return;
    var result = h.apply(null, args.concat([{ instant: instant }]));
    var budget = sleep(600).then(function () {
      return "timeout";
    });
    var outcome = await Promise.race([Promise.resolve(result), budget]);
    if (outcome === "timeout") post({ type: "error", runId: run ? run.runId : undefined, code: "timeout", message: "Hook " + name + " exceeded 600ms" });
  }

  // ---------------------------------------------------------------- runs

  async function runStep(msg) {
    if (run && run.playing) run.cancelled = true;
    var instant = msg.mode === "instant";
    var r = { runId: msg.runId, stepId: msg.stepId, instant: instant, cancelled: false, finishing: false, playing: true, cursor: { step: 0, action: msg.startAt || 0 } };
    run = r;
    activeUntil = Date.now() + 600;
    var started = performance.now();
    if (instant) enableInstant();
    try {
      for (var i = msg.startAt || 0; i < msg.actions.length; i++) {
        if (r.cancelled) break;
        r.cursor.action = i;
        if (r.finishing) {
          if (msg.actions[i].type === "wait") continue;
          await exec(msg.actions[i], true);
        } else {
          await exec(msg.actions[i], instant);
        }
        postRects(true);
        activeUntil = Date.now() + 600;
      }
      if (instant) {
        await quiescence();
        finishAnimations();
      }
    } catch (err) {
      if (!r.cancelled) post({ type: "error", runId: r.runId, code: err.code || "exception", message: err.message || String(err), action: r.cursor.action, selector: err.selector });
    }
    if (instant && run === r) disableInstant();
    r.playing = false;
    if (r.cancelled) return; // a newer run owns the document now
    postRects(true);
    post({ type: "step-done", runId: r.runId, stepId: r.stepId, asserts: asserts.slice(), digest: digest(), ms: Math.round(performance.now() - started), finished: !!r.finishing });
  }

  async function replayTo(msg) {
    if (run && run.playing) run.cancelled = true;
    var r = { runId: msg.runId, stepId: "", instant: true, cancelled: false, finishing: false, playing: true, cursor: { step: msg.from ? msg.from.step : 0, action: 0 } };
    run = r;
    var started = performance.now();
    enableInstant();
    try {
      for (var s = msg.from ? msg.from.step : 0; s < msg.steps.length; s++) {
        if (r.cancelled) break;
        var acts = msg.steps[s].actions;
        r.stepId = msg.steps[s].stepId;
        r.cursor.step = s;
        for (var a = s === (msg.from ? msg.from.step : 0) ? (msg.from ? msg.from.action : 0) : 0; a < acts.length; a++) {
          if (r.cancelled) break;
          r.cursor.action = a;
          await exec(acts[a], true);
        }
      }
      await quiescence();
      finishAnimations();
    } catch (err) {
      if (!r.cancelled) post({ type: "error", runId: r.runId, code: err.code || "exception", message: err.message || String(err), action: r.cursor.action, selector: err.selector });
    }
    if (run === r) disableInstant();
    r.playing = false;
    if (r.cancelled) return; // a newer run owns the document now
    postRects(true);
    post({ type: "step-done", runId: r.runId, stepId: r.stepId, asserts: asserts.slice(), digest: digest(), ms: Math.round(performance.now() - started), finished: true });
  }

  // ---------------------------------------------------------------- keys

  var FORWARD_ALWAYS = ["PageDown", "PageUp"];
  var FORWARD_SCRIPTED = ["ArrowRight", "ArrowLeft", " ", "b", ".", "f", "h", "l", "r", "t", "d", "F5"];
  function onKeydown(e) {
    // The runtime's own dispatch(keydown) and hook-driven events are untrusted; let builds see them.
    if (!e.isTrusted) return;
    var key = e.key;
    var inText = isTextControl(document.activeElement);
    var forward = FORWARD_ALWAYS.indexOf(key) !== -1 || (FORWARD_SCRIPTED.indexOf(key) !== -1 && (!handsOn || !inText));
    if (forward) {
      e.preventDefault();
      e.stopPropagation();
      post({ type: "key", key: key === " " ? "Space" : key, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey, ctrl: e.ctrlKey });
      return;
    }
    if (!handsOn && frameId) {
      // Scripted mode: stray keys must not change demo state.
      e.preventDefault();
      e.stopPropagation();
    }
  }

  // ---------------------------------------------------------------- protocol

  function handle(msg) {
    switch (msg.type) {
      case "init":
        frameId = msg.frameId;
        mirror = !!msg.mirror;
        handsOn = !!msg.handsOn;
        reducedMotion = !!msg.reducedMotion;
        if (msg.pace) pace = Object.assign(pace, msg.pace);
        flags = Object.assign({}, msg.flags || {});
        sideEffects = msg.sideEffects || [];
        document.documentElement.setAttribute("data-presenter", mirror ? "mirror" : "audience");
        postRects(true);
        return;
      case "run-step":
        if (msg.frameId !== frameId) return;
        void runStep(msg);
        return;
      case "replay-to":
        if (msg.frameId !== frameId) return;
        void replayTo(msg);
        return;
      case "finish":
        if (run && run.playing && run.runId === msg.runId) {
          run.finishing = true;
          finishAnimations();
        }
        return;
      case "reset": {
        var r = hooks().reset;
        if (typeof r === "function") void r();
        return;
      }
      case "set-flag":
        try {
          applyFlag(msg.flag, msg.on);
        } catch (err) {
          post({ type: "error", code: err.code || "flag-unknown", message: err.message });
        }
        postRects(true);
        return;
      case "set-live":
        if (msg.on) document.documentElement.setAttribute("data-live", "");
        else document.documentElement.removeAttribute("data-live");
        return;
      case "set-mode":
        handsOn = !!msg.handsOn;
        if (handsOn && !mirror) {
          try {
            window.focus();
          } catch (e) {
            /* none */
          }
        }
        return;
      case "watch":
        watched = Array.isArray(msg.selectors) ? msg.selectors.slice() : [];
        liveRects = !!msg.live;
        lastRectsJson = "";
        postRects(true);
        return;
      default:
        return;
    }
  }

  function valid(data) {
    return data && typeof data === "object" && data.v === 1 && typeof data.type === "string";
  }

  window.addEventListener("message", function (e) {
    if (!embedded || e.source !== window.parent || e.origin !== PRESENTER) return;
    if (!valid(e.data)) return;
    handle(e.data);
  });

  window.addEventListener("keydown", onKeydown, true);
  window.addEventListener("error", function (e) {
    post({ type: "error", code: "exception", message: String(e.message || "error") });
  });

  function ready() {
    installFetch();
    startObservers();
    var hookNames = Object.keys(hooks()).filter(function (k) {
      return typeof hooks()[k] === "function";
    });
    var initialFlags = {};
    var fl = document.documentElement.getAttribute("data-flags");
    if (fl) {
      fl.split(",").forEach(function (pair) {
        var kv = pair.split(":");
        if (kv[0]) initialFlags[kv[0]] = kv[1] !== "0";
      });
    }
    flags = initialFlags;
    post({ type: "ready", build: document.documentElement.getAttribute("data-build") || "", url: location.pathname + location.search, title: document.title, supports: features(), hooks: hookNames, flags: initialFlags });
  }
  function onLoaded() {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready, ready);
    else ready();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onLoaded);
  else onLoaded();
})();
