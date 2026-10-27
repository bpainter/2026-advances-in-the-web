"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { actionForKey, isEditableTarget, type KeyAction } from "@/lib/keys";
import type { Mode } from "@/lib/mode";
import { usePresenter } from "@/lib/presenter/context";
import { frameUrl } from "@/lib/frames/origins";
import type { StepResult } from "@/lib/engine/frame";
import { StageContext, type DemoStatus, type Playback, type StageState } from "@/lib/stage-context";
import { ReaderControls } from "@/components/chrome/ReaderControls";
import { KeyboardHelp } from "@/components/chrome/KeyboardHelp";
import { GotoDialog } from "@/components/chrome/GotoDialog";

const CANVAS = { width: 1920, height: 1080 };

interface Props {
  slideId: string;
  slideTitle: string;
  slideIndex: number;
  total: number;
  prevId?: string;
  nextId?: string;
  firstId: string;
  lastId: string;
  slideIds: string[];
  /** The page's steps (labels only), empty on other slides. */
  steps: { label: string }[];
  /** The page frame's route, for `o`. */
  frameRoute?: string;
  mode: Mode;
  canonicalPath?: string;
  embedded?: boolean;
  passive?: boolean;
  children: ReactNode;
}

interface LocalState {
  stepIndex: number;
  blank: boolean;
  handsOn: boolean;
  live: boolean;
}

function stepFromUrl(stepCount: number): number {
  const raw = new URLSearchParams(window.location.search).get("step");
  if (raw === null || stepCount === 0) return 0;
  if (raw === "last") return stepCount - 1;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), stepCount - 1) : 0;
}

/**
 * Stage controller: canvas scaling, the keyboard map (PRD Part A, 6.1), step and mode state, URL
 * sync and announcements. In the presenter windows the state lives in the shared store instead of
 * here. Remounted per slide (keyed on slide id).
 */
export function Stage(props: Props) {
  const { slideId, slideTitle, slideIndex, total, prevId, nextId, firstId, lastId, slideIds, steps, frameRoute, mode, canonicalPath, embedded, passive, children } = props;
  const router = useRouter();
  const presenter = usePresenter();
  const shared = Boolean(presenter) && !passive;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const playback = useRef<Playback | null>(null);
  const [scale, setScale] = useState(1);
  const [local, setLocal] = useState<LocalState>({ stepIndex: 0, blank: false, handsOn: false, live: false });
  const localRef = useRef(local);
  const [reloadToken, setReloadToken] = useState(0);
  const [rehearsal, setRehearsal] = useState(false);
  const [demoStatus, setDemoStatusState] = useState<Record<string, DemoStatus>>({});
  const [stepResults, setStepResults] = useState<Record<string, { stepId: string; result: StepResult }>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [gotoOpen, setGotoOpen] = useState(false);
  const [idle, setIdle] = useState(false);

  // ----- state source: shared store in presenter windows, local otherwise -----
  const stepCount = steps.length;
  const rawStep = shared ? presenter!.state.stepIndex : local.stepIndex;
  const stepIndex = rawStep < 0 ? Math.max(stepCount - 1, 0) : Math.min(rawStep, Math.max(stepCount - 1, 0));
  const blank = shared ? presenter!.state.blank : local.blank;
  const handsOn = shared ? presenter!.state.handsOn : local.handsOn;
  const live = shared ? presenter!.state.live : local.live;
  const stepsFirst = stepCount > 0;

  const patch = useCallback(
    (p: Partial<LocalState>) => {
      touched.current = true;
      if (shared) presenter!.update(p);
      else {
        localRef.current = { ...localRef.current, ...p };
        setLocal((l) => ({ ...l, ...p }));
      }
    },
    [shared, presenter],
  );
  const current = useCallback(() => {
    const s = shared ? presenter!.getState() : localRef.current;
    const idx = s.stepIndex < 0 ? Math.max(stepCount - 1, 0) : Math.min(s.stepIndex, Math.max(stepCount - 1, 0));
    return { stepIndex: idx, stepCount };
  }, [shared, presenter, stepCount]);
  const setStepIndex = useCallback((n: number) => patch({ stepIndex: Math.min(Math.max(n, 0), Math.max(stepCount - 1, 0)) }), [patch, stepCount]);
  const setDemoStatus = useCallback(
    (id: string, status: DemoStatus) => {
      setDemoStatusState((s) => (s[id] === status ? s : { ...s, [id]: status }));
      if (shared && mode === "audience") presenter!.reportHealth(id, status);
    },
    [shared, mode, presenter],
  );
  const setStepResult = useCallback((pageId: string, stepId: string, result: StepResult) => {
    setStepResults((s) => ({ ...s, [pageId]: { stepId, result } }));
    // Rehearsal tooling and the walk read the latest result here.
    (window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults = { ...((window as unknown as { __stepResults?: Record<string, unknown> }).__stepResults ?? {}), [`${pageId}:${stepId}`]: result };
  }, []);
  const registerPlayback = useCallback((p: Playback | null) => {
    playback.current = p;
  }, []);

  // A shared "-1" step means "land on the last step"; resolve it once the step count is known.
  useEffect(() => {
    if (shared && presenter!.state.stepIndex === -1) presenter!.update({ stepIndex: Math.max(stepCount - 1, 0) });
  }, [shared, presenter, stepCount]);

  // ----- canvas scaling (PRD v2 6.2) -----
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(r.width / CANVAS.width, r.height / CANVAS.height));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    document.addEventListener("fullscreenchange", update);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", update);
    };
  }, []);

  // ----- reader mode: restore step from the URL, canonicalise `/` -----
  useEffect(() => {
    if (shared || passive) return;
    const restored = stepFromUrl(stepCount);
    localRef.current = { ...localRef.current, stepIndex: restored };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal((l) => ({ ...l, stepIndex: restored }));
    const url = new URL(window.location.href);
    if (canonicalPath && url.pathname !== canonicalPath) url.pathname = canonicalPath;
    if (restored > 0) url.searchParams.set("step", String(restored));
    else url.searchParams.delete("step");
    if (url.href !== window.location.href) window.history.replaceState(null, "", url);
  }, [shared, passive, canonicalPath, stepCount]);

  // Tell the presenter store which slide this page rendered.
  useEffect(() => {
    if (shared) presenter!.setRenderedSlide(slideId);
  }, [shared, presenter, slideId]);

  // Reader mode: keep `?step=` in the URL after a user change.
  useEffect(() => {
    if (passive || !touched.current || shared) return;
    const url = new URL(window.location.href);
    if (stepIndex > 0) url.searchParams.set("step", String(stepIndex));
    else url.searchParams.delete("step");
    window.history.replaceState(null, "", url);
  }, [passive, shared, stepIndex]);

  // Announce the page title 150ms after a page change (Part A, 13).
  useEffect(() => {
    if (passive) return;
    const t = window.setTimeout(() => {
      if (announcerRef.current) announcerRef.current.textContent = slideTitle;
    }, 150);
    return () => window.clearTimeout(t);
  }, [passive, slideTitle]);

  // Reader controls fade out after a short idle period.
  useEffect(() => {
    if (mode !== "reader") return;
    let timer = window.setTimeout(() => setIdle(true), 2500);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2500);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [mode]);

  // Prefetch neighbours.
  useEffect(() => {
    if (passive) return;
    const base = shared ? `${window.location.pathname}?s=` : "/s/";
    if (prevId) router.prefetch(`${base}${prevId}`);
    if (nextId) router.prefetch(`${base}${nextId}`);
  }, [passive, shared, router, prevId, nextId]);

  const go = useCallback(
    (id: string | undefined, step?: "last") => {
      if (!id) return;
      touched.current = true;
      if (shared) {
        const p = presenter!;
        const startTimer = slideIndex === 1 && p.state.startedAt === null && id === nextId;
        p.update({ slideId: id, stepIndex: step === "last" ? -1 : 0, ...(startTimer ? { startedAt: Date.now(), pausedAt: null } : {}) });
      } else {
        router.push(`/s/${id}${step ? `?step=${step}` : ""}`);
      }
    },
    [shared, presenter, router, slideIndex, nextId],
  );

  const toggleTimer = useCallback(() => {
    if (!shared) return;
    const { startedAt, pausedAt } = presenter!.state;
    const now = Date.now();
    if (startedAt === null) presenter!.update({ startedAt: now, pausedAt: null });
    else if (pausedAt !== null) presenter!.update({ startedAt: startedAt + (now - pausedAt), pausedAt: null });
    else presenter!.update({ pausedAt: now });
  }, [shared, presenter]);

  const perform = useCallback(
    (action: KeyAction) => {
      switch (action.type) {
        case "advance": {
          // Next during playback completes the step; a second press advances (Part A, 4.1).
          if (playback.current?.isPlaying()) {
            playback.current.finish();
            break;
          }
          const c = current();
          if (stepsFirst && c.stepIndex < c.stepCount - 1) setStepIndex(c.stepIndex + 1);
          else go(nextId);
          break;
        }
        case "retreat": {
          const c = current();
          if (stepsFirst && c.stepIndex > 0) setStepIndex(c.stepIndex - 1);
          else go(prevId, "last");
          break;
        }
        case "next-slide":
          go(nextId);
          break;
        case "prev-slide":
          go(prevId);
          break;
        case "first-slide":
          go(firstId);
          break;
        case "last-slide":
          go(lastId);
          break;
        case "toggle-blank":
          patch({ blank: !blank });
          break;
        case "toggle-fullscreen":
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen();
          break;
        case "toggle-hands-on":
          patch({ handsOn: !handsOn });
          break;
        case "toggle-live":
          patch({ live: !live });
          break;
        case "reset-step":
          setReloadToken((n) => n + 1);
          break;
        case "toggle-rehearsal":
          setRehearsal((r) => !r);
          break;
        case "open-demo":
          if (frameRoute) window.open(frameUrl(frameRoute).url, "_blank", "noopener");
          break;
        case "toggle-timer":
          toggleTimer();
          break;
        case "open-speaker":
          window.open("/speaker", "deck-speaker");
          break;
        case "goto":
          if (presenter?.mode === "speaker") setGotoOpen(true);
          break;
        case "escape":
          if (helpOpen) setHelpOpen(false);
          if (gotoOpen) setGotoOpen(false);
          break;
        case "help":
          if (mode !== "audience") setHelpOpen((o) => !o);
          break;
        case "noop":
          break;
      }
    },
    [mode, stepsFirst, current, setStepIndex, patch, go, nextId, prevId, firstId, lastId, blank, handsOn, live, frameRoute, helpOpen, gotoOpen, presenter, toggleTimer],
  );

  // The speaker window's controls drive the stage through the presenter store.
  useEffect(() => {
    if (!shared) return;
    presenter!.registerPerform(perform);
    return () => presenter!.registerPerform(null);
  }, [shared, presenter, perform]);

  // ----- keyboard -----
  useEffect(() => {
    if (passive) return;
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target) || (gotoOpen && e.key !== "Escape")) return;
      const action = actionForKey(e);
      if (!action) return;
      e.preventDefault();
      perform(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [passive, perform, gotoOpen]);

  const dispatchKey = useCallback(
    (key: string, shiftKey: boolean) => {
      const action = actionForKey({ key: key === "Space" ? " " : key, shiftKey, metaKey: false, ctrlKey: false, altKey: false });
      if (action) perform(action);
    },
    [perform],
  );

  const focusStage = useCallback(() => canvasRef.current?.focus({ preventScroll: true }), []);

  const ctx = useMemo<StageState>(
    () => ({ stepIndex, stepCount, handsOn, live, reloadToken, rehearsal, demoStatus, stepResults, setStepIndex, setDemoStatus, setStepResult, registerPlayback, dispatchKey, focusStage }),
    [stepIndex, stepCount, handsOn, live, reloadToken, rehearsal, demoStatus, stepResults, setStepIndex, setDemoStatus, setStepResult, registerPlayback, dispatchKey, focusStage],
  );

  const style = { "--stage-scale": scale } as CSSProperties;
  const showBlank = blank && mode === "audience";
  const last = stepResults[slideId]?.result;

  return (
    <StageContext.Provider value={ctx}>
      <div className={embedded ? "stage stage--embedded" : "stage"} ref={wrapperRef} data-blank={showBlank} data-mode={mode} data-idle={idle} data-hands-on={handsOn} style={style}>
        <div className="stage__canvas" id={passive ? undefined : "stage"} ref={canvasRef} tabIndex={-1}>
          {children}
        </div>
        {passive ? null : <div className="stage__announcer" aria-live="polite" aria-atomic="true" ref={announcerRef} />}
        {rehearsal && !passive ? (
          <p className="stage__rehearsal">
            {slideId} · step {stepIndex + 1}/{Math.max(stepCount, 1)} · {last?.digest ?? "no digest"} · {last?.ms ?? 0}ms · {last?.asserts.filter((a) => !a.pass).length ?? 0} failed assert(s)
          </p>
        ) : null}
      </div>
      {mode === "reader" ? (
        <ReaderControls slideIndex={slideIndex} total={total} hasPrev={Boolean(prevId)} hasNext={Boolean(nextId)} onPrev={() => perform({ type: "retreat" })} onNext={() => perform({ type: "advance" })} onHelp={() => setHelpOpen(true)} />
      ) : null}
      {mode !== "audience" && !passive ? <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} /> : null}
      {presenter?.mode === "speaker" && !passive ? <GotoDialog open={gotoOpen} total={total} onGo={(n) => go(slideIds[n - 1])} onClose={() => setGotoOpen(false)} /> : null}
    </StageContext.Provider>
  );
}
