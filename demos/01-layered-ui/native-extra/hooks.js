// Instrumentation for the native build (not shown on the code page): the
// frame declares `hooks: ["reset"]`, and the engine remounts a fresh document
// on reset, so there is nothing for the hook to clear.
window.demoHooks = { reset() {} };
