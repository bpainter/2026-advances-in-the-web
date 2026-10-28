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
        // The last keycap of a step stays up until the next step, so the speaker can point at it
        // while saying the bullet (design review L3); the next cue replaces it.
        const text = cue.kind === "keycap" ? cue.label : cue.text;
        setCap({ text, key: Date.now() });
      }
    });
    return () => {
      offRects();
      offCue();
      window.clearTimeout(hideTimer);
    };
  }, [handle]);

  // A new step clears the held keycap.
  const stepId = step?.id;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCap(null);
  }, [stepId]);

  const spotlights = mergeRects((step?.spotlight ?? []).flatMap((sel) => rects?.rects[sel] ?? [])).map((r, i) => ({ sel: "spot", r, i }));
  const viewport = rects?.viewport ?? { w: 0, h: 0 };
  const callouts = (step?.callouts ?? []).map((c) => ({ ...c, r: rects?.rects[c.target]?.[0] ?? null })).filter((c) => c.r);
  const focusRing = rects?.focus && !rects.focusVisibleNative && !handsOn ? rects.focus : null;

  return (
    <div className="overlay" aria-hidden="true" data-reduced={reducedMotion} data-hands-on={handsOn}>
      {spotlights.map(({ sel, r, i }) => (
        <div className="overlay__spotlight" key={`${sel}:${i}`} style={{ left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: (r.r ?? 0) + 4 }} />
      ))}
      {focusRing ? <div className="overlay__focus" style={{ left: focusRing.x, top: focusRing.y, width: focusRing.w, height: focusRing.h }} /> : null}
      {callouts.map((c) => (
        <div className="overlay__callout" key={`${c.target}:${c.text}`} data-side={c.side} style={calloutStyle(c.side, c.r!, viewport)}>
          <span className="overlay__callout-text">{c.text}</span>
        </div>
      ))}
      {ripple ? <div className="overlay__ripple" key={ripple.key} style={aim(ripple.at)} /> : null}
      {!handsOn ? (
        <div className="overlay__cursor" data-visible={cursor.visible} style={cursor.at ? aim(cursor.at) : undefined}>
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

/** The cursor tip lands near the bottom right of a target, not on its label (design review L2). */
function aim(r: Rect): React.CSSProperties {
  return { left: r.x + Math.max(r.w - 12, r.w / 2), top: r.y + Math.max(r.h - 8, r.h / 2) };
}

/** Spotlights within 12 frame px of each other merge into one outline (design review M3). */
function mergeRects(list: Rect[]): Rect[] {
  const out: Rect[] = [];
  for (const r of list) {
    const near = out.findIndex((o) => r.x <= o.x + o.w + 12 && o.x <= r.x + r.w + 12 && r.y <= o.y + o.h + 12 && o.y <= r.y + r.h + 12);
    if (near === -1) {
      out.push({ ...r });
      continue;
    }
    const o = out[near];
    const x = Math.min(o.x, r.x);
    const y = Math.min(o.y, r.y);
    out[near] = { x, y, w: Math.max(o.x + o.w, r.x + r.w) - x, h: Math.max(o.y + o.h, r.y + r.h) - y, r: Math.min(o.r ?? 0, r.r ?? 0) };
  }
  return out;
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
