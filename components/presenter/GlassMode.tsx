"use client";

import { useEffect } from "react";

/**
 * `?glass=off` on /present and /speaker (PRD v4, 6.6): marks the window's root with
 * data-glass="off" (the theme tokens switch to solid surfaces) and remembers it for the session, so
 * every frame the window mounts gets the `glass:0` flag (lib/frames/origins.ts glassFlags).
 */
export function GlassMode() {
  useEffect(() => {
    // pnpm visuals adds ?capture=1: frames lighten their scrim so the intro still reads (review M12).
    if (new URLSearchParams(window.location.search).get("capture") === "1") document.documentElement.dataset.capture = "1";
    const q = new URLSearchParams(window.location.search).get("glass");
    try {
      if (q === "off") sessionStorage.setItem("deck:glass", "off");
      if (q === "on") sessionStorage.removeItem("deck:glass");
      if (sessionStorage.getItem("deck:glass") === "off") document.documentElement.dataset.glass = "off";
      else delete document.documentElement.dataset.glass;
    } catch {
      if (q === "off") document.documentElement.dataset.glass = "off";
    }
  }, []);
  return null;
}
