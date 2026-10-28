"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { FramePage, Step } from "@/content/demo-schema";
import type { Mode } from "@/lib/mode";
import { FrameHandle, type StepResult } from "@/lib/engine/frame";
import { installInputRelay, withInput } from "@/lib/engine/input-relay";
import { flagsAt, replaySteps, segments, selectorsFor } from "@/lib/engine/steps";
import { frameQuery, frameUrl, glassFlags } from "@/lib/frames/origins";
import { useStage } from "@/lib/stage-context";
import { Overlay } from "./Overlay";

interface Props {
  page: FramePage;
  /** The frame's sandbox attribute and side-effecting hooks come from the build manifest. */
  sandbox: string;
  sideEffects: string[];
  mode: Mode;
  /** Slot size in canvas pixels. */
  slot: { width: number; height: number };
  onStatus?: (status: "loading" | "ready" | "error") => void;
  onStepResult?: (stepId: string, result: StepResult) => void;
  /** The section's background id (PRD v5, 4.2), passed to the frame as `bg`. */
  background?: string;
}

/** How long the code highlight shows before a step's playback starts (docs/design/demo-flow-cx.md, 4). */
const CODE_LEAD_MS = 400;

function documentUrl(page: FramePage, flags: Record<string, boolean>, background?: string): { origin: string; url: string } {
  const route = page.frame!.route;
  const { origin, url } = frameUrl(route.endsWith("/") ? `${route}index.html` : route.includes(".") ? route : `${route}/index.html`);
  return { origin, url: `${url}${frameQuery(route, glassFlags(flags), background)}` };
}

/**
 * The live frame of a demo page and its player (PRD Part A, sections 3 and 4). Next from the
 * previous step plays the step animated in the active document; any other move mounts a fresh
 * document beneath, replays `s0..sN` instantly and swaps. Reloading toggles split a step.
 */
export function PageFrame({ page, sandbox, sideEffects, mode, slot, onStatus, onStepResult, background }: Props) {
  const { stepIndex, handsOn, live, reloadToken, rehearsal, registerPlayback, dispatchKey, reportPlaying } = useStage();
  const slotRef = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<FrameHandle | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [viewportMs, setViewportMs] = useState(0);
  /** The step whose playback (animated or replayed) has finished; spotlights wait for it. */
  const [doneStep, setDoneStep] = useState<{ index: number } | null>(null);
  const current = useRef<{ handle: FrameHandle; stepIndex: number; flags: Record<string, boolean> } | null>(null);
  const generation = useRef(0);
  const run = useRef<{ finish: () => void; cancel: () => void; playing: () => boolean } | null>(null);
  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frame = page.frame!;
  // The card has a 1 px border: the frame fills its content box (design review L9).
  const scale = Math.min((slot.width - 2) / frame.viewport.width, (slot.height - 2) / frame.viewport.height);
  const narrowed = viewportWidth !== null && viewportWidth < frame.viewport.width;
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
      const { origin, url } = documentUrl(page, flags, background);
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
    [page, sandbox, mode, handsOn, reducedMotion, sideEffects, dispatchKey, background],
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

  useEffect(() => installInputRelay(), []);

  // Enter the step: animate from the previous one, or reset and replay.
  useEffect(() => {
    const gen = ++generation.current;
    const target = step;
    // Spotlights for this entry wait until its playback has finished (PRD v5, 3.2 rule 5).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoneStep(null);
    if (!target) return;
    const cur = current.current;
    const watchList = selectorsFor(target);
    const animate = cur !== null && cur.stepIndex === stepIndex - 1 && !handsOn && cur.handle.supports !== null;

    if (animate && cur) {
      // Play forward in the active document; reloading toggles split the step.
      const segs = segments(target, cur.flags);
      cur.handle.watch(watchList, true);
      reportPlaying(true);
      void (async () => {
        let h = cur.handle;
        let last: StepResult | null = null;
        // The code highlight leads the playback by 400 ms, so the room reads the cause first (CX 4).
        if (target.code && !reducedMotion) await new Promise((r) => window.setTimeout(r, CODE_LEAD_MS));
        if (gen !== generation.current) return;
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
        if (gen === generation.current) {
          reportPlaying(false);
          setDoneStep({ index: stepIndex });
        }
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
    reportPlaying(true);
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
      // The replaying document takes focus first, and the replay is posted from a task carrying the
      // presenter's press: WebKit 26.0 ignores programmatic focus in a cross-origin frame outside
      // such a task, so focus asserts and focus returns would replay differently (input-relay.ts).
      const result = await new Promise<StepResult | null>((resolve) =>
        withInput(() => {
          if (gen !== generation.current) return resolve(null);
          if (mode === "audience" && !handsOn) fresh.focus();
          void fresh.replayTo(replaySteps(page, stepIndex)).then(resolve);
        }),
      );
      if (gen !== generation.current || !result) {
        fresh.dispose();
        return;
      }
      show(fresh, stepIndex, flags);
      report("ready");
      reportPlaying(false);
      setDoneStep({ index: stepIndex });
      onStepResult?.(target.id, result);
    });
    return () => window.clearTimeout(timeout);
    // `status` is read for the report only; it must not retrigger entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, stepIndex, handsOn, reloadToken, mount, show, report, onStepResult, reportPlaying]);

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
        <Overlay handle={handle} step={step} ready={doneStep !== null && doneStep.index === stepIndex} handsOn={handsOn} reducedMotion={reducedMotion} rehearsal={rehearsal} clipBottom={frame.spotlightClip?.bottom} keycap={frame.keycap} />
      </div>
      {narrowed ? <div className="page-frame__edge" style={{ left: `calc(${viewportWidth}px * ${scale})` }} aria-hidden="true" /> : null}
      {status === "loading" ? <p className="page-frame__status">Loading demo…</p> : null}
      {status === "error" ? <p className="page-frame__status">The demo frame did not answer. Press r to reload it.</p> : null}
    </div>
  );
}
