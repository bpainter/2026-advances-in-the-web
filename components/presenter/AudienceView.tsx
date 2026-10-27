"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Wake lock on mount and on return to visibility; cursor hidden after 2s idle (PRD 5.3). */
export function AudienceView({ children }: { children: ReactNode }) {
  const [cursorHidden, setCursorHidden] = useState(false);

  useEffect(() => {
    let sentinel: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        if (document.visibilityState === "visible" && "wakeLock" in navigator) sentinel = await navigator.wakeLock.request("screen");
      } catch {
        /* unsupported or denied; the runbook covers display sleep */
      }
    };
    void request();
    const onVisible = () => {
      if (document.visibilityState === "visible") void request();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release();
    };
  }, []);

  useEffect(() => {
    let timer = window.setTimeout(() => setCursorHidden(true), 2000);
    const wake = () => {
      setCursorHidden(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCursorHidden(true), 2000);
    };
    window.addEventListener("pointermove", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
    };
  }, []);

  return (
    <div className="audience" data-cursor={cursorHidden ? "hidden" : "visible"}>
      {children}
    </div>
  );
}
