"use client";

import { useEffect, useState } from "react";
import { frameQuery, frameUrl } from "@/lib/frames/origins";

/**
 * Warms the next page's frame while an intro slide shows (PRD v4, 7.1 item 12): one hidden,
 * sandboxed document at the frame's step-0 URL, so the route is compiled and its files are cached
 * when the used-to page mounts its own. Framework frames are skipped: their apps log every
 * request, and the F2 frame must be requested once per audience entry.
 */
export function FrameWarm({ route, flags, sandbox, background }: { route: string; flags?: Record<string, boolean>; sandbox: string; background?: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (route.startsWith("/framework")) return;
    const t = window.setTimeout(() => {
      const path = route.endsWith("/") ? `${route}index.html` : route.includes(".") ? route : `${route}/index.html`;
      setSrc(`${frameUrl(path).url}${frameQuery(route, flags, background)}`);
    }, 300);
    return () => window.clearTimeout(t);
  }, [route, flags, background]);
  if (!src) return null;
  // Inert: a warming document must never take focus, or the clicker's keys would land in it.
  return <iframe className="frame-warm" src={src} title="" aria-hidden="true" tabIndex={-1} sandbox={sandbox} inert />;
}
