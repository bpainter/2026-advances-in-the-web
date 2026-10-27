// Demo console (instrumentation, never shown as code): every CSP violation
// the document reports and every uncaught error, written into #console with
// textContent. Loaded by both D5 builds as /demo/console.js, so a report-only
// violation shows on screen deterministically (PRD Part A, 10.2).
(function () {
  if (window.demoConsole) return;
  var list = document.querySelector("#console");

  function log(text) {
    var item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  }

  document.addEventListener("securitypolicyviolation", function (event) {
    var line =
      "securitypolicyviolation: " + event.effectiveDirective + " (" + event.disposition + ")";
    if (event.sample) line += " sample: " + event.sample;
    log(line);
  });

  window.addEventListener("error", function (event) {
    log("error: " + (event.message || "unknown error"));
  });

  window.demoConsole = { log: log };
})();
