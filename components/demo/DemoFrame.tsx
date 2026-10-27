"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Demo } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { useStage } from "@/lib/stage-context";
import { FallbackCard } from "./FallbackCard";

interface Props {
  demo: Demo;
  slideTitle: string;
  /** `liveState` of the current step, if any; posted to the demo through the bridge. */
  liveState?: string;
  stepId?: string;
  mode: Mode;
  /** Scale override; defaults to `demo.zoom`, then 2. */
  zoom?: number;
  /** Frame title suffix, for grid cells ("Live demo 2 of 4: ..."). */
  frameTitle?: string;
}

type FromDemo =
  | { type: "demo:ready"; id: string; supports: Record<string, boolean> }
  | { type: "demo:state"; state: string }
  | { type: "demo:error"; message: string }
  | { type: "demo:escape" }
  | { type: "demo:key"; key: string; shiftKey: boolean }
  | { type: "demo:pong" };

function isFromDemo(data: unknown): data is FromDemo {
  return typeof data === "object" && data !== null && typeof (data as { type?: unknown }).type === "string" && (data as { type: string }).type.startsWith("demo:");
}

/** Sandboxed, route-served demo document in an iframe with the bridge protocol (PRD 7.2, 7.3). */
export function DemoFrame({ demo, slideTitle, liveState, stepId, mode, zoom, frameTitle }: Props) {
  const { reloadToken, focusToken, showFallback, demoStatus, setDemoStatus, dispatchKey, focusStage } = useStage();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [focused, setFocused] = useState(false);
  // Remembers which load attempt failed before `demo:ready`; a reload (new token) clears it.
  const [failedToken, setFailedToken] = useState<number | null>(null);
  const failedBeforeReady = failedToken === reloadToken;
  const status = demoStatus[demo.id] ?? "loading";
  const ready = status === "ready";

  // Messages from the demo: only accept them from our own frame's window.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = iframeRef.current;
      if (!frame || event.source !== frame.contentWindow || !isFromDemo(event.data)) return;
      const msg = event.data;
      switch (msg.type) {
        case "demo:ready":
          setDemoStatus(demo.id, "ready");
          frame.contentWindow?.postMessage({ type: "demo:reduceMotion", value: window.matchMedia("(prefers-reduced-motion: reduce)").matches }, "*");
          if (liveState) frame.contentWindow?.postMessage({ type: "demo:setState", state: liveState, stepId }, "*");
          break;
        case "demo:error":
          if (!ready) setFailedToken(reloadToken);
          setDemoStatus(demo.id, ready ? "error" : "fallback");
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
  }, [demo.id, ready, reloadToken, liveState, stepId, setDemoStatus, dispatchKey, focusStage]);

  // Drive the live view when the step's liveState changes.
  useEffect(() => {
    if (!ready || !liveState) return;
    iframeRef.current?.contentWindow?.postMessage({ type: "demo:setState", state: liveState, stepId }, "*");
  }, [ready, liveState, stepId]);

  // Enter hands focus to the live view.
  useEffect(() => {
    if (focusToken > 0) iframeRef.current?.focus();
  }, [focusToken]);

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
  const src = demo.live.kind === "route" && demo.live.src ? demo.live.src : `/demos/${demo.id}`;

  return (
    <figure className="demo" data-demo-id={demo.id} data-status={status} style={zoomStyle}>
      <div className="demo__viewport" data-focused={focused}>
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
              title={frameTitle ?? `Live demo: ${slideTitle}`}
              sandbox={demo.live.kind === "route" ? "allow-scripts allow-same-origin allow-forms" : "allow-scripts"}
              allow=""
              referrerPolicy="no-referrer"
              loading="eager"
              onLoad={(e) => e.currentTarget.contentWindow?.postMessage({ type: "demo:ping" }, "*")}
              tabIndex={mode === "audience" ? -1 : 0}
            />
            {status === "loading" ? <p className="demo__status">Loading demo…</p> : null}
          </>
        )}
      </div>
    </figure>
  );
}
