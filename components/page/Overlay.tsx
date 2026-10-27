"use client";

import { useEffect, useState } from "react";
import type { Step } from "@/content/demo-schema";
import type { Cue, Rect } from "@/lib/engine/protocol";
import type { FrameHandle, RectsMessage } from "@/lib/engine/frame";

interface Props {
  handle: FrameHandle | null;
  step: Step | undefined;
  /** Hands-on mode hides the ghost cursor and keycaps. */
  handsOn: boolean;
  reducedMotion: boolean;
}

interface CursorState {
  at: Rect | null;
  visible: boolean;
}

/**
 * Presenter chrome drawn above the frame inside the scaled wrapper (PRD Part A, 3.1, 5.2): ghost
 * cursor, ripple, keycaps and captions, spotlights, callouts and the focus ring. Coordinates are
 * frame CSS pixels because the wrapper carries the scale.
 */
export function Overlay({ handle, step, handsOn, reducedMotion }: Props) {
  const [rects, setRects] = useState<RectsMessage | null>(handle?.lastRects ?? null);
  const [cursor, setCursor] = useState<CursorState>({ at: null, visible: false });
  const [ripple, setRipple] = useState<{ at: Rect; key: number } | null>(null);
  const [cap, setCap] = useState<{ text: string; key: number } | null>(null);

  useEffect(() => {
    if (!handle) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRects(handle.lastRects);
    const offRects = handle.onRects(setRects);
    let hideTimer = 0;
    let capTimer = 0;
    const offCue = handle.onCue((cue: Cue) => {
      if (cue.kind === "cursor") {
        setCursor({ at: cue.to, visible: true });
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => setCursor((c) => ({ ...c, visible: false })), cue.ms + 1500);
      } else if (cue.kind === "ripple") {
        setCursor({ at: cue.at, visible: true });
        setRipple({ at: cue.at, key: Date.now() });
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => setCursor((c) => ({ ...c, visible: false })), 1500);
      } else if (cue.kind === "keycap" || cue.kind === "caption") {
        const text = cue.kind === "keycap" ? cue.label : cue.text;
        setCap({ text, key: Date.now() });
        window.clearTimeout(capTimer);
        capTimer = window.setTimeout(() => setCap(null), cue.ms);
      }
    });
    return () => {
      offRects();
      offCue();
      window.clearTimeout(hideTimer);
      window.clearTimeout(capTimer);
    };
  }, [handle]);

  const spotlights = (step?.spotlight ?? []).flatMap((sel) => (rects?.rects[sel] ?? []).map((r, i) => ({ sel, r, i })));
  const viewport = rects?.viewport ?? { w: 0, h: 0 };
  const callouts = (step?.callouts ?? []).map((c) => ({ ...c, r: rects?.rects[c.target]?.[0] ?? null })).filter((c) => c.r);
  const focusRing = rects?.focus && !rects.focusVisibleNative && !handsOn ? rects.focus : null;

  return (
    <div className="overlay" aria-hidden="true" data-reduced={reducedMotion} data-hands-on={handsOn}>
      {spotlights.map(({ sel, r, i }) => (
        <div className="overlay__spotlight" key={`${sel}:${i}`} style={{ left: r.x, top: r.y, width: r.w, height: r.h }} />
      ))}
      {focusRing ? <div className="overlay__focus" style={{ left: focusRing.x, top: focusRing.y, width: focusRing.w, height: focusRing.h }} /> : null}
      {callouts.map((c) => (
        <div className="overlay__callout" key={`${c.target}:${c.text}`} data-side={c.side} style={calloutStyle(c.side, c.r!, viewport)}>
          <span className="overlay__callout-text">{c.text}</span>
        </div>
      ))}
      {ripple ? <div className="overlay__ripple" key={ripple.key} style={{ left: ripple.at.x + ripple.at.w / 2, top: ripple.at.y + ripple.at.h / 2 }} /> : null}
      {!handsOn ? (
        <div className="overlay__cursor" data-visible={cursor.visible} style={cursor.at ? { left: cursor.at.x + cursor.at.w / 2, top: cursor.at.y + cursor.at.h / 2 } : undefined}>
          <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
            <path d="M4 2 L4 22 L9.5 17.5 L13 26 L17 24.4 L13.6 16 L21 16 Z" fill="#000" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
      {cap && !handsOn ? (
        <p className="overlay__keycap" key={cap.key}>
          {cap.text}
        </p>
      ) : null}
    </div>
  );
}

/** A callout that would leave the frame flips to the opposite side; its anchor stays inside the frame. */
function calloutStyle(side: "top" | "right" | "bottom" | "left", r: Rect, vp: { w: number; h: number }): React.CSSProperties {
  const gap = 28;
  const room = 72;
  let s = side;
  if (vp.h && s === "top" && r.y - gap < room) s = "bottom";
  else if (vp.h && s === "bottom" && r.y + r.h + gap > vp.h - room) s = "top";
  if (vp.w && s === "left" && r.x - gap < 160) s = "right";
  else if (vp.w && s === "right" && r.x + r.w + gap > vp.w - 160) s = "left";
  const cx = vp.w ? Math.min(Math.max(r.x + r.w / 2, 120), vp.w - 120) : r.x + r.w / 2;
  r = { ...r, x: cx - r.w / 2 };
  side = s;
  switch (side) {
    case "top":
      return { left: r.x + r.w / 2, top: r.y - gap, transform: "translate(-50%, -100%)" };
    case "bottom":
      return { left: r.x + r.w / 2, top: r.y + r.h + gap, transform: "translate(-50%, 0)" };
    case "left":
      return { left: r.x - gap, top: r.y + r.h / 2, transform: "translate(-100%, -50%)" };
    default:
      return { left: r.x + r.w + gap, top: r.y + r.h / 2, transform: "translate(0, -50%)" };
  }
}
