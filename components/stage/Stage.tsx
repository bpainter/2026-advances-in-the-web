"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { DemoView, StepPhase } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { actionForKey, isEditableTarget, VIEW_BY_DIGIT, type KeyAction } from "@/lib/keys";
import { StageContext, type DemoStatus, type StageState } from "@/lib/stage-context";
import { usePresenter } from "@/lib/presenter/context";
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
  /** One step list per demo on the slide (one for demo-split and terminal, four for demo-grid). */
  stepSets: { caption: string; phase: StepPhase }[][];
  stepThrough: "steps-first" | "slide-only";
  demoIds: string[];
  kind: "split" | "grid" | "terminal" | "none";
  defaultView: DemoView;
  mode: Mode;
  canonicalPath?: string;
  embedded?: boolean;
  passive?: boolean;
  children: ReactNode;
}

interface LocalState {
  stepIndex: number;
  view: DemoView;
  cellIndex: number | null;
  blank: boolean;
  liveMode: boolean;
}

function stepFromUrl(stepCount: number): number {
  const raw = new URLSearchParams(window.location.search).get("step");
  if (raw === null || stepCount === 0) return 0;
  if (raw === "last") return stepCount - 1;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), stepCount - 1) : 0;
}

/**
 * Stage controller: canvas scaling, the keyboard map, step/view/cell state, URL sync and
 * announcements. In the presenter windows the state lives in the shared store instead of here.
 * Remounted per slide (keyed on slide id).
 */
export function Stage(props: Props) {
  const { slideId, slideTitle, slideIndex, total, prevId, nextId, firstId, lastId, slideIds, stepSets, stepThrough, demoIds, kind, defaultView, mode, canonicalPath, embedded, passive, children } = props;
  const router = useRouter();
  const presenter = usePresenter();
  const shared = Boolean(presenter) && !passive;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [scale, setScale] = useState(1);
  const [local, setLocal] = useState<LocalState>({ stepIndex: 0, view: defaultView, cellIndex: null, blank: false, liveMode: false });
  // Mirror of `local`, written synchronously in `patch`, so two key presses in one task (clicker
  // repeats, keys forwarded from a frame) both see the step the first one set.
  const localRef = useRef(local);
  const [reloadToken, setReloadToken] = useState(0);
  const [focusToken, setFocusToken] = useState(0);
  const [showFallback, setShowFallback] = useState(false);
  const [demoStatus, setDemoStatusState] = useState<Record<string, DemoStatus>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [gotoOpen, setGotoOpen] = useState(false);
  const [idle, setIdle] = useState(false);

  // ----- state source: shared store in presenter windows, local otherwise -----
  const cellIndex = shared ? presenter!.state.cellIndex : local.cellIndex;
  const activeSet = kind === "grid" ? cellIndex : 0;
  const steps = useMemo(() => (activeSet === null ? [] : (stepSets[activeSet] ?? [])), [activeSet, stepSets]);
  const stepCount = steps.length;
  const rawStep = shared ? presenter!.state.stepIndex : local.stepIndex;
  const stepIndex = rawStep < 0 ? Math.max(stepCount - 1, 0) : Math.min(rawStep, Math.max(stepCount - 1, 0));
  const view = shared ? (presenter!.state.view ?? defaultView) : local.view;
  const blank = shared ? presenter!.state.blank : local.blank;
  const liveMode = shared ? presenter!.state.liveMode : local.liveMode;
  const stepsFirst = stepThrough === "steps-first" && stepCount > 0;
  const demoId = activeSet === null ? demoIds[0] : demoIds[activeSet];
  const hasDemoViews = kind === "split";

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
  // The step and count as of the last write, ahead of the render (see `localRef`).
  const current = useCallback(() => {
    const s = shared ? presenter!.getState() : localRef.current;
    const set = kind === "grid" ? s.cellIndex : 0;
    const count = set === null ? 0 : (stepSets[set]?.length ?? 0);
    const idx = s.stepIndex < 0 ? Math.max(count - 1, 0) : Math.min(s.stepIndex, Math.max(count - 1, 0));
    return { stepIndex: idx, stepCount: count };
  }, [shared, presenter, kind, stepSets]);
  const setStepIndex = useCallback((n: number) => patch({ stepIndex: Math.min(Math.max(n, 0), Math.max(current().stepCount - 1, 0)) }), [patch, current]);
  const setView = useCallback((v: DemoView) => patch({ view: v }), [patch]);
  const setCellIndex = useCallback((n: number | null) => patch({ cellIndex: n, stepIndex: 0 }), [patch]);
  const setDemoStatus = useCallback(
    (id: string, status: DemoStatus) => {
      setDemoStatusState((s) => (s[id] === status ? s : { ...s, [id]: status }));
      if (shared && mode === "audience") presenter!.reportHealth(id, status);
    },
    [shared, mode, presenter],
  );

  // A shared "-1" step means "land on the last step"; resolve it once the step count is known.
  useEffect(() => {
    if (shared && presenter!.state.stepIndex === -1) presenter!.update({ stepIndex: Math.max(stepCount - 1, 0) });
  }, [shared, presenter, stepCount]);

  // ----- canvas scaling (PRD 6.2) -----
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
    // The URL is the source of truth for the step (PRD 4.2); it is only readable after mount.
    localRef.current = { ...localRef.current, stepIndex: restored };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocal((l) => ({ ...l, stepIndex: restored }));
    const url = new URL(window.location.href);
    if (canonicalPath && url.pathname !== canonicalPath) url.pathname = canonicalPath;
    if (restored > 0) url.searchParams.set("step", String(restored));
    else url.searchParams.delete("step");
    window.history.replaceState(null, "", url);
  }, [shared, passive, canonicalPath, stepCount]);

  // Focus the title and announce the slide.
  useEffect(() => {
    if (passive) return;
    const title = document.getElementById("slide-title");
    if (title && !(document.activeElement instanceof HTMLIFrameElement)) title.focus({ preventScroll: true });
    const t = window.setTimeout(() => {
      if (announcerRef.current) announcerRef.current.textContent = `Slide ${slideIndex} of ${total}, ${slideTitle}`;
    }, 150);
    return () => window.clearTimeout(t);
  }, [passive, slideIndex, slideTitle, total]);

  // Reader mode: keep `?step=` in the URL after a user change. Announce step changes everywhere.
  useEffect(() => {
    if (passive || !touched.current) return;
    if (!shared) {
      const url = new URL(window.location.href);
      if (stepIndex > 0) url.searchParams.set("step", String(stepIndex));
      else url.searchParams.delete("step");
      window.history.replaceState(null, "", url);
    }
    if (stepCount > 0 && announcerRef.current) {
      const current = steps[stepIndex];
      announcerRef.current.textContent = `Step ${stepIndex + 1} of ${stepCount}${current?.phase === "before" ? ", today" : ""}, ${current?.caption ?? ""}`;
    }
  }, [passive, shared, stepIndex, stepCount, steps]);

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

  // Prefetch neighbours so slide switches are instant.
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
        p.update({ slideId: id, stepIndex: step === "last" ? -1 : 0, cellIndex: null, view: null, liveMode: false, ...(startTimer ? { startedAt: Date.now(), pausedAt: null } : {}) });
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
        case "next-step":
          setStepIndex(current().stepIndex + 1);
          break;
        case "prev-step":
          setStepIndex(current().stepIndex - 1);
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
        case "open-demo":
          if (demoId) window.open(`/demos/${demoId}`, "_blank", "noopener");
          break;
        case "reload-demo":
          setShowFallback(false);
          if (demoId) setDemoStatus(demoId, "loading");
          setReloadToken((n) => n + 1);
          break;
        case "show-fallback":
          if (demoId) setShowFallback(true);
          break;
        case "focus-live":
          if (demoId) setFocusToken((n) => n + 1);
          break;
        case "toggle-live":
          if (kind === "terminal") patch({ liveMode: !liveMode });
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
        case "digit":
          if (kind === "grid") setCellIndex(action.n === 0 ? null : Math.min(action.n, stepSets.length) - 1);
          else if (hasDemoViews && action.n > 0) setView(VIEW_BY_DIGIT[action.n]);
          break;
        case "noop":
          break;
      }
    },
    [stepsFirst, current, setStepIndex, setView, setCellIndex, setDemoStatus, patch, go, nextId, prevId, firstId, lastId, demoId, blank, liveMode, helpOpen, gotoOpen, mode, kind, hasDemoViews, stepSets.length, presenter, toggleTimer],
  );

  // Speaker controls drive the stage through the provider.
  useEffect(() => {
    if (!shared) return;
    presenter!.registerPerform(perform);
    return () => presenter!.registerPerform(null);
  }, [shared, presenter, perform]);

  useEffect(() => {
    if (passive) return;
    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if ((helpOpen || gotoOpen) && e.key !== "Escape") return;
      const action = actionForKey(e);
      if (!action) return;
      e.preventDefault();
      perform(action);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [passive, perform, helpOpen, gotoOpen]);

  // Swipe (read-later): 60px horizontal with less vertical travel changes slides, never steps.
  useEffect(() => {
    if (mode !== "reader") return;
    let start: { x: number; y: number } | null = null;
    const onStart = (e: TouchEvent) => {
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const dx = e.changedTouches[0].clientX - start.x;
      const dy = e.changedTouches[0].clientY - start.y;
      start = null;
      if (Math.abs(dx) >= 60 && Math.abs(dy) < Math.abs(dx)) go(dx < 0 ? nextId : prevId);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [mode, go, nextId, prevId]);

  const dispatchKey = useCallback(
    (key: string, shiftKey: boolean) => {
      const action = actionForKey({ key, shiftKey, metaKey: false, ctrlKey: false, altKey: false });
      if (action) perform(action);
    },
    [perform],
  );
  const focusStage = useCallback(() => canvasRef.current?.focus({ preventScroll: true }), []);

  const ctx = useMemo<StageState>(
    () => ({ stepIndex, stepCount, view, cellIndex, liveMode, reloadToken, focusToken, showFallback, demoStatus, setStepIndex, setView, setCellIndex, setDemoStatus, dispatchKey, focusStage }),
    [stepIndex, stepCount, view, cellIndex, liveMode, reloadToken, focusToken, showFallback, demoStatus, setStepIndex, setView, setCellIndex, setDemoStatus, dispatchKey, focusStage],
  );

  const style = { "--stage-scale": scale } as CSSProperties;
  const showBlank = blank && mode === "audience";

  return (
    <StageContext.Provider value={ctx}>
      <div className={embedded ? "stage stage--embedded" : "stage"} ref={wrapperRef} data-blank={showBlank} data-mode={mode} data-idle={idle} style={style}>
        <div className="stage__canvas" id={passive ? undefined : "stage"} ref={canvasRef} tabIndex={-1}>
          {children}
        </div>
        {passive ? null : <div className="stage__announcer" aria-live="polite" aria-atomic="true" ref={announcerRef} />}
      </div>
      {mode === "reader" ? (
        <ReaderControls
          slideIndex={slideIndex}
          total={total}
          hasPrev={Boolean(prevId)}
          hasNext={Boolean(nextId)}
          onPrev={() => perform({ type: "retreat" })}
          onNext={() => perform({ type: "advance" })}
          demoId={demoId}
          hasDemoViews={hasDemoViews}
          view={view}
          onView={(v) => setView(v)}
          onHelp={() => setHelpOpen(true)}
        />
      ) : null}
      {mode !== "audience" && !passive ? <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} /> : null}
      {presenter?.mode === "speaker" && !passive ? <GotoDialog open={gotoOpen} total={total} onGo={(n) => go(slideIds[n - 1])} onClose={() => setGotoOpen(false)} /> : null}
    </StageContext.Provider>
  );
}
