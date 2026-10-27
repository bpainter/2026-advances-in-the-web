"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { DemoPage, Step } from "@/content/demo-schema";
import type { Mode } from "@/lib/mode";
import { FrameHandle, type StepResult } from "@/lib/engine/frame";
import { flagsAt, replaySteps, segments, selectorsFor } from "@/lib/engine/steps";
import { flagsQuery, frameUrl } from "@/lib/frames/origins";
import { useStage } from "@/lib/stage-context";
import { Overlay } from "./Overlay";

interface Props {
  page: DemoPage;
  /** The frame's sandbox attribute and side-effecting hooks come from the build manifest. */
  sandbox: string;
  sideEffects: string[];
  mode: Mode;
  /** Slot size in canvas pixels. */
  slot: { width: number; height: number };
  onStatus?: (status: "loading" | "ready" | "error") => void;
  onStepResult?: (stepId: string, result: StepResult) => void;
}

function documentUrl(page: DemoPage, flags: Record<string, boolean>): { origin: string; url: string } {
  const route = page.frame!.route;
  const { origin, url } = frameUrl(route.endsWith("/") ? `${route}index.html` : route.includes(".") ? route : `${route}/index.html`);
  const q = flagsQuery(flags);
  return { origin, url: q ? `${url}?flags=${q}` : url };
}

/**
 * The live frame of a demo page and its player (PRD Part A, sections 3 and 4). Next from the
 * previous step plays the step animated in the active document; any other move mounts a fresh
 * document beneath, replays `s0..sN` instantly and swaps. Reloading toggles split a step.
 */
export function PageFrame({ page, sandbox, sideEffects, mode, slot, onStatus, onStepResult }: Props) {
  const { stepIndex, handsOn, live, reloadToken, registerPlayback, dispatchKey } = useStage();
  const slotRef = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<FrameHandle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [viewportMs, setViewportMs] = useState(0);
  const current = useRef<{ handle: FrameHandle; stepIndex: number; flags: Record<string, boolean> } | null>(null);
  const generation = useRef(0);
  const run = useRef<{ finish: () => void; cancel: () => void; playing: () => boolean } | null>(null);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = page.frame!;
  const scale = Math.min(slot.width / frame.viewport.width, slot.height / frame.viewport.height);
  const step: Step | undefined = page.steps[stepIndex];

  const report = useCallback(
    (s: "loading" | "ready" | "error") => {
      setStatus(s);
      onStatus?.(s);
    },
    [onStatus],
  );

  /** Mounts a fresh document with `flags`; hidden until shown. */
  const mount = useCallback(
    (flags: Record<string, boolean>, visible: boolean): FrameHandle => {
      const { origin, url } = documentUrl(page, flags);
      const iframe = document.createElement("iframe");
      iframe.className = "page-frame__iframe";
      iframe.title = `Live demo: ${page.title}`;
      iframe.setAttribute("sandbox", sandbox);
      iframe.setAttribute("allow", "");
      iframe.referrerPolicy = "no-referrer";
      iframe.dataset.visible = String(visible);
      iframe.tabIndex = mode === "audience" ? -1 : 0;
      slotRef.current?.appendChild(iframe);
      const h = new FrameHandle(iframe, { expectedOrigin: origin, mirror: false, handsOn, reducedMotion, flags, sideEffects });
      h.onViewport(({ inlineSize, ms }) => {
        setViewportMs(ms);
        setViewportWidth(Number.parseFloat(inlineSize));
      });
      h.onKey((k) => dispatchKey(k.key, k.shift));
      iframe.src = url;
      return h;
    },
    [page, sandbox, mode, handsOn, reducedMotion, sideEffects, dispatchKey],
  );

  const show = useCallback(
    (h: FrameHandle, idx: number, flags: Record<string, boolean>) => {
      const old = current.current?.handle;
      h.iframe.dataset.visible = "true";
      current.current = { handle: h, stepIndex: idx, flags };
      setHandle(h);
      if (old && old !== h) requestAnimationFrame(() => old.dispose());
      if (mode === "audience" && !handsOn) h.focus();
    },
    [mode, handsOn],
  );

  // Enter the step: animate from the previous one, or reset and replay.
  useEffect(() => {
    const gen = ++generation.current;
    const target = step;
    if (!target) return;
    const cur = current.current;
    const watchList = selectorsFor(target);
    const animate = cur !== null && cur.stepIndex === stepIndex - 1 && !handsOn && cur.handle.supports !== null;

    if (animate && cur) {
      // Play forward in the active document; reloading toggles split the step.
      const segs = segments(target, cur.flags);
      cur.handle.watch(watchList, true);
      void (async () => {
        let h = cur.handle;
        let last: StepResult | null = null;
        for (const [i, seg] of segs.entries()) {
          if (gen !== generation.current) return;
          if (seg.reload) {
            const fresh = mount(seg.flags, false);
            fresh.watch(watchList, true);
            await fresh.ready;
            show(fresh, stepIndex, seg.flags);
            h = fresh;
          }
          const stepRun = h.runStep({ ...target, actions: target.actions }, "animated", seg.startAt);
          run.current = { finish: stepRun.finish, cancel: stepRun.cancel, playing: () => stepRun.playing };
          last = await stepRun.done;
          if (i === segs.length - 1 && gen === generation.current) current.current = { handle: h, stepIndex, flags: seg.flags };
        }
        run.current = null;
        if (last && gen === generation.current) onStepResult?.(target.id, last);
      })();
      return;
    }

    // Reset and replay: a fresh document with the flags accumulated up to this step.
    run.current?.cancel();
    run.current = null;
    const flags = flagsAt(page, stepIndex);
    // A fresh document starts at its authored viewport; replayed resizes set it again.
    setViewportWidth(null);
    setViewportMs(0);
    const fresh = mount(flags, cur === null);
    fresh.watch(watchList, false);
    report(cur === null ? "loading" : status);
    const timeout = window.setTimeout(() => {
      if (gen === generation.current && !current.current) report("error");
    }, 1500);
    void fresh.ready.then(async () => {
      window.clearTimeout(timeout);
      if (gen !== generation.current) {
        fresh.dispose();
        return;
      }
      const result = await fresh.replayTo(replaySteps(page, stepIndex));
      if (gen !== generation.current) {
        fresh.dispose();
        return;
      }
      show(fresh, stepIndex, flags);
      report("ready");
      onStepResult?.(target.id, result);
    });
    return () => window.clearTimeout(timeout);
    // `status` is read for the report only; it must not retrigger entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, stepIndex, handsOn, reloadToken, mount, show, report, onStepResult]);

  // Terminal pages: `l` hides the recording for a real terminal.
  useEffect(() => {
    current.current?.handle.setLive(live);
  }, [live, handle]);

  // Hands-on mode: tell the runtime and give the frame the keyboard.
  useEffect(() => {
    const h = current.current?.handle;
    if (!h) return;
    h.setMode(handsOn);
    if (handsOn) h.focus();
  }, [handsOn]);

  // Next while playing finishes the step instead of advancing.
  useEffect(() => {
    registerPlayback({
      isPlaying: () => Boolean(run.current?.playing()),
      finish: () => run.current?.finish(),
    });
    return () => registerPlayback(null);
  }, [registerPlayback]);

  // Unmount: drop every frame.
  useLayoutEffect(() => {
    const el = slotRef.current;
    const gen = generation;
    const cur = current;
    return () => {
      gen.current++;
      cur.current?.handle.dispose();
      cur.current = null;
      if (el) el.replaceChildren();
    };
  }, []);

  const frameStyle = {
    "--frame-scale": scale,
    "--frame-width": `${viewportWidth ?? frame.viewport.width}px`,
    "--frame-height": `${frame.viewport.height}px`,
    "--frame-resize-ms": `${viewportMs}ms`,
  } as CSSProperties;

  return (
    <div className="page-frame" data-status={status} data-build={frame.build} style={frameStyle}>
      <div className="page-frame__scaled">
        <div className="page-frame__slot" ref={slotRef} />
        <Overlay handle={handle} step={step} handsOn={handsOn} reducedMotion={reducedMotion} />
      </div>
      {status === "loading" ? <p className="page-frame__status">Loading demo…</p> : null}
      {status === "error" ? <p className="page-frame__status">The demo frame did not answer. Press r to reload it.</p> : null}
    </div>
  );
}
