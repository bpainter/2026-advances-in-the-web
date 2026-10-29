// Instrumentation for both M1 builds (unshown). The engine remounts a fresh document on reset,
// and the photo resize is the runtime's own `resize` action, so `reset` is the only hook.
window.demoHooks = { reset() {} };
