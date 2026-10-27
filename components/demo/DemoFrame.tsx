"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Demo } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { useStage } from "@/lib/stage-context";
import { FallbackCard } from "./FallbackCard";

interface Props {
  demo: Demo;
  slideTitle: string;
  /** Effective state of the current step (lib/steps resolveLive); posted to the demo through the bridge. */
  liveState?: string;
  stepId?: string;
  /** Selector the current step spotlights inside the demo; null or undefined clears the spotlight. */
  target?: string | null;
  mode: Mode;
  /** Scale override; defaults to `demo.zoom`, then 2. */
  zoom?: number;
  /** Frame title suffix, for grid cells ("Live demo 2 of 4: ..."). */
  frameTitle?: string;
  /** "legacy" loads `/demos/[id]/legacy` (the "before" document) and reports health as `[id]:legacy`. */
  variant?: "native" | "legacy";
  /** False keeps the frame loaded but hidden (the other phase's document is showing). */
  visible?: boolean;
}

type FromDemo =
  | { type: "demo:ready"; id: string; supports: Record<string, boolean> }
  | { type: "demo:state"; state: string }
  | { type: "demo:spotlight"; selector: string | null; count: number }
  | { type: "demo:error"; message: string }
  | { type: "demo:escape" }
  | { type: "demo:key"; key: string; shiftKey: boolean }
  | { type: "demo:pong" };

function isFromDemo(data: unknown): data is FromDemo {
  return typeof data === "object" && data !== null && typeof (data as { type?: unknown }).type === "string" && (data as { type: string }).type.startsWith("demo:");
}

/** Sandboxed, route-served demo document in an iframe with the bridge protocol (PRD 7.2, 7.3). */
export function DemoFrame({ demo, slideTitle, liveState, stepId, target, mode, zoom, frameTitle, variant = "native", visible = true }: Props) {
  const { reloadToken, focusToken, showFallback, demoStatus, setDemoStatus, dispatchKey, focusStage } = useStage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [focused, setFocused] = useState(false);
  // Remembers which load attempt failed before `demo:ready`; a reload (new token) clears it.
  const [failedToken, setFailedToken] = useState<number | null>(null);
  const failedBeforeReady = failedToken === reloadToken;
  const healthId = variant === "legacy" ? `${demo.id}:legacy` : demo.id;
  const status = demoStatus[healthId] ?? "loading";
  const ready = status === "ready";

  // Messages from the demo: only accept them from our own frame's window.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = iframeRef.current;
      if (!frame || event.source !== frame.contentWindow || !isFromDemo(event.data)) return;
      const msg = event.data;
      switch (msg.type) {
        case "demo:ready":
          setDemoStatus(healthId, "ready");
          frame.contentWindow?.postMessage({ type: "demo:reduceMotion", value: window.matchMedia("(prefers-reduced-motion: reduce)").matches }, "*");
          if (liveState) frame.contentWindow?.postMessage({ type: "demo:setState", state: liveState, stepId }, "*");
          frame.contentWindow?.postMessage({ type: "demo:highlight", selector: target ?? null }, "*");
          break;
        case "demo:error":
          if (!ready) setFailedToken(reloadToken);
          setDemoStatus(healthId, ready ? "error" : "fallback");
          break;
        case "demo:escape":
          focusStage();
          break;
        case "demo:key":
          dispatchKey(msg.key, msg.shiftKey);
          break;
        default:
          break;
      }
    };
    window.addEventListener("message", onMessage);
    // The server-rendered iframe can finish loading before this listener exists; ask again.
    if (!ready) iframeRef.current?.contentWindow?.postMessage({ type: "demo:ping" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [healthId, ready, reloadToken, liveState, stepId, target, setDemoStatus, dispatchKey, focusStage]);

  // Drive the live view on every step change (keyed on stepId, so a state the presenter changed by
  // hand is re-asserted even when two steps share one), then spotlight the step's target. The
  // spotlight goes second so it can name something the state just revealed.
  useEffect(() => {
    if (!ready || !liveState) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "demo:setState", state: liveState, stepId }, "*");
  }, [ready, liveState, stepId]);
  useEffect(() => {
    if (!ready) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "demo:highlight", selector: target ?? null }, "*");
  }, [ready, target, stepId]);

  // Enter hands focus to the live view.
  useEffect(() => {
    if (focusToken > 0 && visible) iframeRef.current?.focus();
  }, [focusToken, visible]);

  // Track whether the iframe holds focus (visible focus requirement, PRD 7.5).
  useEffect(() => {
    const check = () => setFocused(document.activeElement === iframeRef.current);
    window.addEventListener("blur", () => setTimeout(check, 0));
    window.addEventListener("focus", check);
    document.addEventListener("focusin", check);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("focusin", check);
    };
  }, []);

  const external = demo.live.kind === "external";
  const fallback = showFallback || failedBeforeReady;

  // The speaker's previews never run the demo; the projector does (PRD 5.2 previews stay cheap).
  if (mode === "speaker-preview") {
    return (
      <figure className="demo" data-demo-id={demo.id} data-status="preview">
        <div className="demo__viewport">
          <div className="demo__preview">
            <p className="demo__preview-label">Live demo on the audience window</p>
            <p className="demo__preview-wow">{demo.wow}</p>
          </div>
        </div>
      </figure>
    );
  }
  // Non-full-page demos are rendered at a smaller logical viewport and scaled up so they read from the back of the room.
  const zoomStyle = { "--demo-zoom": demo.zoom ?? zoom ?? 2 } as CSSProperties;
  // route-kind demos live at their own URL (real same-origin pages); composed demos at /demos/[id].
  const src = variant === "legacy" ? `/demos/${demo.id}/legacy` : demo.live.kind === "route" && demo.live.src ? demo.live.src : `/demos/${demo.id}`;

  return (
    <figure className="demo" data-demo-id={demo.id} data-variant={variant} data-status={status} data-visible={visible} aria-hidden={!visible} style={zoomStyle}>
      <div className="demo__viewport" data-focused={focused && visible}>
        {external ? (
          <FallbackCard title={demo.wow} url={demo.live.src ?? demo.fallback} reason="external" />
        ) : fallback ? (
          <FallbackCard title={demo.wow} url={demo.fallback} reason={showFallback ? "requested" : "failed"} />
        ) : (
          <>
            <iframe
              key={reloadToken}
              ref={iframeRef}
              className="demo__frame"
              src={src}
              title={frameTitle ?? (variant === "legacy" ? `Today's version: ${slideTitle}` : `Live demo: ${slideTitle}`)}
              sandbox={demo.live.kind === "route" ? "allow-scripts allow-same-origin allow-forms" : "allow-scripts"}
              allow=""
              referrerPolicy="no-referrer"
              loading="eager"
              onLoad={(e) => e.currentTarget.contentWindow?.postMessage({ type: "demo:ping" }, "*")}
              tabIndex={mode === "audience" || !visible ? -1 : 0}
            />
            {status === "loading" ? <p className="demo__status">Loading demo…</p> : null}
          </>
        )}
      </div>
    </figure>
  );
}
