"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, ViewTransition, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PrefetchOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { actionForKey, isEditableTarget, type KeyAction } from "@/lib/keys";
import type { Mode } from "@/lib/mode";
import type { NavGroup } from "@/lib/nav";
import { usePresenter } from "@/lib/presenter/context";
import { readerHref, slideHref } from "@/lib/presenter/url";
import { frameUrl } from "@/lib/frames/origins";
import type { StepResult } from "@/lib/engine/frame";
import { StageContext, type DemoStatus, type Playback, type StageState } from "@/lib/stage-context";
import { ReaderControls } from "@/components/chrome/ReaderControls";
import { KeyboardHelp } from "@/components/chrome/KeyboardHelp";
import { GotoDialog } from "@/components/chrome/GotoDialog";
import { NavDrawer, isNavOpen } from "@/components/chrome/NavDrawer";

const CANVAS = { width: 1920, height: 1080 };

/**
 * A full prefetch (PRD r7, 9.2). `PrefetchKind` is internal to Next: the default ("auto", PPR)
 * fetches almost nothing for a `force-dynamic` page, and only "full" fetches the whole payload
 * (next/dist/client/components/segment-cache/prefetch.js `prefetchRoute`; the enum lives in
 * next/dist/client/components/router-reducer/router-reducer-types.js).
 */
const FULL_PREFETCH = { kind: "full" } as unknown as PrefetchOptions;

/** After Next asks a playing step to finish, a press this much later advances anyway (PRD r7, 6.4). */
const STUCK_PLAYBACK_MS = 1500;

/**
 * The slide crossfade (PRD r7, 9.3) runs in the audience window and reader mode, never under
 * automation or capture, so walks, visuals and captures stay as they were. `?fade=0` turns it off;
 * `?fade=1` forces it on for the walk that tests it. Decided once per window, on the first client
 * render: `<ViewTransition>` renders no element, so the server's markup hydrates either way, and a
 * stable answer never remounts the canvas.
 */
let fadeDecision: boolean | null = null;
function fadeAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (fadeDecision === null) {
    const q = new URLSearchParams(window.location.search);
    const forced = q.get("fade");
    const automated = navigator.webdriver || q.get("capture") === "1" || document.documentElement.dataset.capture === "1";
    fadeDecision = forced === "1" ? true : forced === "0" ? false : !automated;
  }
  return fadeDecision;
}

/**
 * The last scale each kind of stage measured in this window. A stage that mounts on a slide change
 * starts at it, so its first paint is already scaled: the crossfade snapshots the new slide in that
 * paint, and an unscaled first frame would zoom for the length of the fade (r7 design review).
 * The first stage of a window starts at 1, as the server rendered it, and measures before paint.
 */
const lastScale = new Map<string, number>();

/** Set by a drawer jump: the stage that mounts next takes focus (PRD r7, 9.5). */
let focusOnArrival = false;

const decoded = new Map<string, Promise<void>>();
/** Fetches and decodes an image once per window (PRD v5, 1.6; r7, 9.2): backgrounds, stills, posters. */
function decodeBackground(src: string): Promise<void> {
  let p = decoded.get(src);
  if (!p) {
    const img = new Image();
    img.src = src;
    p = img.decode().catch(() => {});
    decoded.set(src, p);
    // Merged, so a module reload in development never drops what this window already decoded.
    const w = window as unknown as { __decodedBackgrounds?: string[] };
    w.__decodedBackgrounds = [...new Set([...(w.__decodedBackgrounds ?? []), ...decoded.keys()])];
  }
  return p;
}

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
  /** Step count per slide, in `slideIds` order: a press during a slide change counts from the target. */
  slideSteps?: number[];
  /** The slide's background file (PRD v5, 1.3), drawn by the stage under the slide. */
  background: string;
  /** The previous and next slides' backgrounds, decoded ahead so no slide arrives without one. */
  neighbourBackgrounds: string[];
  /** Intro stills and posters the window shows after the next press (PRD r7, 9.2). */
  neighbourAssets?: string[];
  /** The previous slide has more than one step, so Back lands on its last step. */
  prevHasSteps?: boolean;
  /** The navigation drawer's list and current link (PRD r7, 9.6); null where no drawer renders. */
  nav?: { groups: NavGroup[]; currentId: string | null } | null;
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
  const { slideId, slideTitle, slideIndex, total, prevId, nextId, prevHasSteps, firstId, lastId, slideIds, slideSteps = [], background, neighbourBackgrounds, neighbourAssets = [], nav, steps, frameRoute, mode, canonicalPath, embedded, passive, children } = props;
  const router = useRouter();
  const presenter = usePresenter();
  const shared = Boolean(presenter) && !passive;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const announcerRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const playback = useRef<Playback | null>(null);
  const scaleKey = `${mode}:${embedded ? "embedded" : "full"}:${passive ? "passive" : "live"}`;
  const [scale, setScale] = useState(() => lastScale.get(scaleKey) ?? 1);
  const [local, setLocal] = useState<LocalState>({ stepIndex: 0, blank: false, handsOn: false, live: false });
  const localRef = useRef(local);
  const [reloadToken, setReloadToken] = useState(0);
  const [rehearsal, setRehearsal] = useState(false);
  const [demoStatus, setDemoStatusState] = useState<Record<string, DemoStatus>>({});
  const [stepResults, setStepResults] = useState<Record<string, { stepId: string; result: StepResult }>>({});
  const [helpOpen, setHelpOpen] = useState(false);
  const [gotoOpen, setGotoOpen] = useState(false);
  const [idle, setIdle] = useState(false);
  // Stable handles for callbacks the page frame depends on: the presenter object and `perform`
  // change on every store update, and a changed callback would remount the frame.
  const presenterRef = useRef(presenter);
  const performRef = useRef<(a: KeyAction) => void>(() => {});
  useEffect(() => {
    presenterRef.current = presenter;
  }, [presenter]);

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
      if (shared && mode === "audience") presenterRef.current?.reportHealth(id, status);
    },
    [shared, mode],
  );
  const setStepResult = useCallback((pageId: string, stepId: string, result: StepResult) => {
    setStepResults((s) => ({ ...s, [pageId]: { stepId, result } }));
    // Rehearsal tooling and the walk read the latest result here.
    const w = window as unknown as { __stepResults?: Record<string, unknown>; __stepSeq?: number };
    w.__stepSeq = (w.__stepSeq ?? 0) + 1;
    w.__stepResults = { ...(w.__stepResults ?? {}), [`${pageId}:${stepId}`]: { ...result, seq: w.__stepSeq } };
  }, []);
  const playState = useRef({ slideId, stepIndex });
  useEffect(() => {
    playState.current = { slideId, stepIndex };
  }, [slideId, stepIndex]);
  /** When Next first asked the playing step to finish, for the stuck-playback watchdog. */
  const finishAsked = useRef<{ stepIndex: number; at: number } | null>(null);
  const reportPlaying = useCallback(
    (playing: boolean) => {
      if (!playing) finishAsked.current = null;
      if (shared && mode === "audience") presenterRef.current?.reportPlayback({ ...playState.current, playing });
    },
    [shared, mode],
  );
  const registerPlayback = useCallback((p: Playback | null) => {
    playback.current = p;
  }, []);

  // A shared "-1" step means "land on the last step"; resolve it once the step count is known. Only
  // the stage that shows the target slide resolves it: the outgoing stage still renders while the
  // next one loads, and its step count is the wrong one (PRD r7, 6.3).
  const sharedSlideId = shared ? presenter!.state.slideId : null;
  const sharedStep = shared ? presenter!.state.stepIndex : null;
  useEffect(() => {
    if (shared && sharedStep === -1 && sharedSlideId === slideId) presenterRef.current!.update({ stepIndex: Math.max(stepCount - 1, 0) });
  }, [shared, sharedStep, sharedSlideId, slideId, stepCount]);

  // ----- rehearsal: 95th percentile frame time (PRD v4, 6.6: under 20 ms during playback) -----
  const [p95, setP95] = useState<number | null>(null);
  useEffect(() => {
    if (!rehearsal) return;
    const deltas: number[] = [];
    let last = performance.now();
    let raf = 0;
    let n = 0;
    const tick = (t: number) => {
      deltas.push(t - last);
      last = t;
      if (deltas.length > 600) deltas.shift();
      if (++n % 30 === 0 && deltas.length > 30) {
        const sorted = [...deltas].sort((a, b) => a - b);
        setP95(Math.round(sorted[Math.floor(sorted.length * 0.95)] * 10) / 10);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rehearsal]);

  // ----- canvas scaling (PRD v2 6.2) -----
  // Measured before paint, and remembered for the next stage of the same kind (see `lastScale`).
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const next = Math.min(r.width / CANVAS.width, r.height / CANVAS.height);
      if (next > 0) lastScale.set(scaleKey, next);
      setScale(next);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    document.addEventListener("fullscreenchange", update);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", update);
    };
  }, [scaleKey]);

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

  // Reader controls fade out after a short idle period. Keys a frame forwards and the pointer
  // reaching the pill wake them too (PRD r7, 6.4): events inside a frame never reach this window.
  const wakeRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (mode !== "reader") return;
    let timer = window.setTimeout(() => setIdle(true), 2500);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2500);
    };
    wakeRef.current = wake;
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      wakeRef.current = () => {};
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [mode]);
  const wake = useCallback(() => wakeRef.current(), []);

  // Prefetch the neighbours in full (PRD r7, 9.2), at the exact URLs a press navigates to, so the
  // press starts no page or RSC request. The presenter windows keep their other parameters.
  useEffect(() => {
    if (passive) return;
    const hrefs = shared ? [prevId, nextId].flatMap((id) => (id ? [slideHref(id)] : [])) : [...(prevId ? [readerHref(prevId, { last: prevHasSteps })] : []), ...(nextId ? [readerHref(nextId)] : [])];
    for (const href of hrefs) router.prefetch(href, FULL_PREFETCH);
  }, [passive, shared, router, prevId, nextId, prevHasSteps]);

  const go = useCallback(
    (id: string | undefined, step?: "last") => {
      if (!id) return;
      touched.current = true;
      if (shared) {
        const p = presenter!;
        const startTimer = slideIndex === 1 && p.state.startedAt === null && id === nextId;
        p.update({ slideId: id, stepIndex: step === "last" ? -1 : 0, ...(startTimer ? { startedAt: Date.now(), pausedAt: null } : {}) });
      } else {
        // Back lands on the last step; a slide with one step has no other, and the bare URL is the prefetched one.
        router.push(readerHref(id, { last: step === "last" && (id !== prevId || prevHasSteps) }));
      }
    },
    [shared, presenter, router, slideIndex, nextId, prevId, prevHasSteps],
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
      // A press while the previous press's slide is still on its way counts from that slide, not
      // from the one this stage shows, so two quick presses land two slides on (PRD r7, 9.3).
      const pending = shared ? presenter!.getState() : null;
      if (pending && pending.slideId !== slideId && (action.type === "advance" || action.type === "retreat" || action.type === "next-slide" || action.type === "prev-slide")) {
        const i = slideIds.indexOf(pending.slideId);
        if (i >= 0) {
          const count = slideSteps[i] ?? 0;
          const at = pending.stepIndex < 0 ? Math.max(count - 1, 0) : pending.stepIndex;
          if (action.type === "advance" && at < count - 1) presenter!.update({ stepIndex: at + 1 });
          else if (action.type === "retreat" && at > 0) presenter!.update({ stepIndex: at - 1 });
          else if (action.type === "advance" || action.type === "next-slide") go(slideIds[i + 1]);
          else go(slideIds[i - 1], action.type === "retreat" ? "last" : undefined);
          return;
        }
      }
      switch (action.type) {
        case "advance": {
          // Next during playback completes the step; a second press advances (Part A, 4.1).
          const c = current();
          if (playback.current?.isPlaying()) {
            // Watchdog (PRD r7, 6.4): a run that still reports playing 1500 ms after it was asked to
            // finish is stuck, and this press advances anyway.
            const asked = finishAsked.current;
            const now = performance.now();
            if (!asked || asked.stepIndex !== c.stepIndex) finishAsked.current = { stepIndex: c.stepIndex, at: now };
            if (!asked || asked.stepIndex !== c.stepIndex || now - asked.at < STUCK_PLAYBACK_MS) {
              playback.current.finish();
              break;
            }
            finishAsked.current = null;
            const w = window as unknown as { __stuckPlayback?: string[] };
            w.__stuckPlayback = [...(w.__stuckPlayback ?? []), `${slideId} s${c.stepIndex}`];
            if (rehearsal || new URLSearchParams(window.location.search).get("rehearse") === "1") console.warn(`Stuck playback on ${slideId} s${c.stepIndex}`);
          } else finishAsked.current = null;
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
    [mode, shared, slideIds, slideSteps, stepsFirst, current, setStepIndex, patch, go, nextId, prevId, firstId, lastId, blank, handsOn, live, frameRoute, helpOpen, gotoOpen, presenter, toggleTimer, slideId, rehearsal],
  );

  useEffect(() => {
    performRef.current = perform;
  }, [perform]);

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
      // The drawer owns every key while it is open (PRD r7, 9.5): Escape is its own, PageUp and
      // PageDown close it (NavDrawer), and nothing moves the deck.
      if (isNavOpen()) return;
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
      wake();
      if (isNavOpen()) return;
      const action = actionForKey({ key: key === "Space" ? " " : key, shiftKey, metaKey: false, ctrlKey: false, altKey: false });
      if (action) performRef.current(action);
    },
    [wake],
  );

  const focusStage = useCallback(() => canvasRef.current?.focus({ preventScroll: true }), []);

  // A drawer jump hands the keyboard to the stage that shows the target slide.
  useEffect(() => {
    if (passive || !focusOnArrival) return;
    focusOnArrival = false;
    canvasRef.current?.focus({ preventScroll: true });
  }, [passive]);
  const jump = useCallback(
    (id: string) => {
      if (id !== slideId) focusOnArrival = true;
      focusStage();
      go(id);
    },
    [slideId, focusStage, go],
  );

  // Links on the slides (PRD r7, 5.2). In the audience window a click opens the link and the stage
  // takes the keyboard back, so the clicker keeps working. A speaker preview is a picture.
  const onCanvasClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!link) return;
      if (embedded || passive) {
        e.preventDefault();
        return;
      }
      if (mode === "audience") window.setTimeout(focusStage, 0);
    },
    [embedded, passive, mode, focusStage],
  );

  // The audience keyboard belongs to the stage on arrival. When the focused frame of the previous
  // slide is removed, the browser can hand focus to another iframe (the hidden warming frame of an
  // intro slide), where the clicker's keys would be lost. A page frame takes focus again when its
  // document is shown, so claiming it here is safe on every slide.
  useEffect(() => {
    if (mode !== "audience" || passive) return;
    const claim = () => {
      const a = document.activeElement;
      const lost = !a || a === document.body || (a instanceof HTMLIFrameElement && !a.classList.contains("page-frame__iframe"));
      if (lost) canvasRef.current?.focus({ preventScroll: true });
    };
    claim();
    const t = window.setTimeout(claim, 450);
    const t2 = window.setTimeout(claim, 1200);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [mode, passive]);

  const ctx = useMemo<StageState>(
    () => ({ stepIndex, stepCount, handsOn, live, reloadToken, rehearsal, demoStatus, stepResults, setStepIndex, setDemoStatus, setStepResult, reportPlaying, registerPlayback, dispatchKey, focusStage }),
    [stepIndex, stepCount, handsOn, live, reloadToken, rehearsal, demoStatus, stepResults, setStepIndex, setDemoStatus, setStepResult, reportPlaying, registerPlayback, dispatchKey, focusStage],
  );

  // Device pixels per CSS pixel, so the grain tile maps one tile pixel to one device pixel.
  const [dpr, setDpr] = useState(1);
  useEffect(() => {
    const update = () => setDpr(window.devicePixelRatio || 1);
    update();
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Decode the neighbours' backgrounds ahead of time (PRD v5, 1.6). Kept in a module cache so a
  // decoded image is never fetched twice.
  const neighbourKey = neighbourBackgrounds.join("|");
  useEffect(() => {
    if (mode !== "audience" || passive) return;
    for (const src of neighbourKey.split("|").filter(Boolean)) decodeBackground(src);
  }, [neighbourKey, mode, passive]);
  // The next slide's still or first poster (audience), or the posters the speaker's previews show
  // after the next press (PRD r7, 9.2). Once the slide has settled, so they never compete with it.
  const assetKey = neighbourAssets.join("|");
  useEffect(() => {
    if (passive || !assetKey) return;
    const t = window.setTimeout(() => {
      for (const src of assetKey.split("|")) decodeBackground(src);
    }, 300);
    return () => window.clearTimeout(t);
  }, [assetKey, passive]);

  const style = { "--stage-scale": scale, "--dpr": dpr } as CSSProperties;
  const canvasStyle = { "--slide-bg-image": `url("${background}")` } as CSSProperties;
  // The grain is the audience window's alone: previews and other modes draw none (PRD v5, 1.2).
  const grain = mode === "audience" && !embedded && !passive;
  const showBlank = blank && mode === "audience";
  const last = stepResults[slideId]?.result;
  // The crossfade wraps the canvas only, so the pill and dialogs never fade (PRD r7, 9.3).
  const fade = (mode === "audience" || mode === "reader") && !embedded && !passive && fadeAllowed();
  const canvas = (
    <div className="stage__canvas" id={passive ? undefined : "stage"} ref={canvasRef} tabIndex={-1} style={canvasStyle} data-background={background} onClick={onCanvasClick}>
      <div className="stage__bg" aria-hidden="true" />
      {grain ? <div className="stage__grain" aria-hidden="true" /> : null}
      {/* The slide is the page's main landmark (axe `region`); a speaker preview sits inside the speaker's own layout. */}
      <div className="stage__slide" role={embedded || passive ? undefined : "main"}>
        {children}
      </div>
    </div>
  );

  return (
    <StageContext.Provider value={ctx}>
      <div className={embedded ? "stage stage--embedded" : "stage"} ref={wrapperRef} data-blank={showBlank} data-mode={mode} data-idle={idle} data-hands-on={handsOn} style={style}>
        {fade ? (
          <ViewTransition name="deck-slide" share="deck-fade" enter="none" exit="none" update="none" default="none">
            {canvas}
          </ViewTransition>
        ) : (
          canvas
        )}
        {passive ? null : <div className="stage__announcer" aria-live="polite" aria-atomic="true" ref={announcerRef} />}
        {rehearsal && !passive ? (
          <p className="stage__rehearsal">
            {slideId} · step {stepIndex + 1}/{Math.max(stepCount, 1)} · {last?.digest ?? "no digest"} · {last?.ms ?? 0}ms · {last?.asserts.filter((a) => !a.pass).length ?? 0} failed assert(s) · p95 frame {p95 ?? "…"} ms{p95 !== null && p95 > 20 ? " (over 20)" : ""}
          </p>
        ) : null}
      </div>
      {mode === "reader" ? (
        <ReaderControls slideIndex={slideIndex} total={total} hasPrev={Boolean(prevId)} hasNext={Boolean(nextId)} onPrev={() => perform({ type: "retreat" })} onNext={() => perform({ type: "advance" })} onHelp={() => setHelpOpen(true)} onWake={wake} />
      ) : null}
      {/* One drawer per window, outside the canvas and the pill, so no capture includes it (PRD r7, 9.4). */}
      {nav && !passive && mode !== "print" ? <NavDrawer groups={nav.groups} currentId={nav.currentId} onJump={jump} focusStage={focusStage} returnFocusToStage={mode === "audience"} /> : null}
      {mode !== "audience" && !passive ? <KeyboardHelp open={helpOpen} onClose={() => setHelpOpen(false)} /> : null}
      {presenter?.mode === "speaker" && !passive ? <GotoDialog open={gotoOpen} total={total} onGo={(n) => go(slideIds[n - 1])} onClose={() => setGotoOpen(false)} /> : null}
    </StageContext.Provider>
  );
}
