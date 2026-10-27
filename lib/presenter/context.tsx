"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { KeyAction } from "@/lib/keys";
import { createSync, type Sync, type Transport } from "./transport";
import { isNewer, newWriterId, type DemoHealth, type PresenterState, type SyncMessage } from "./types";

export type PresenterMode = "audience" | "speaker";

export interface Presenter {
  mode: PresenterMode;
  state: PresenterState;
  writer: string;
  transport: Transport;
  /** Windows that answered or sent `hello` in the last few seconds, including this one. */
  peers: number;
  demoHealth: Record<string, DemoHealth>;
  update: (patch: Partial<Omit<PresenterState, "seq" | "writer">>) => void;
  /** The latest state, synchronously (ahead of the render that `state` reflects). */
  getState: () => PresenterState;
  reportHealth: (demoId: string, status: DemoHealth) => void;
  /** The mounted stage registers its action handler so speaker controls can drive it. */
  registerPerform: (fn: ((action: KeyAction) => void) | null) => void;
  perform: (action: KeyAction) => void;
  /** Slide id the current page rendered; the provider navigates when state points elsewhere. */
  setRenderedSlide: (id: string) => void;
}

const PresenterContext = createContext<Presenter | null>(null);

export function usePresenter(): Presenter | null {
  return useContext(PresenterContext);
}

function stateFromUrl(writer: string, fallbackSlideId: string): PresenterState {
  const q = new URLSearchParams(window.location.search);
  const step = Number.parseInt(q.get("step") ?? "0", 10);
  return {
    seq: 0,
    writer,
    slideId: q.get("s") ?? fallbackSlideId,
    stepIndex: Number.isFinite(step) ? step : 0,
    blank: false,
    handsOn: false,
    live: false,
    startedAt: null,
    pausedAt: null,
  };
}

interface Props {
  mode: PresenterMode;
  /** Slide the server rendered for this page; the store starts from the URL around it. */
  initialSlideId: string;
  children: ReactNode;
}

/**
 * Two windows, one state (PRD Part A, section 5.1). Owns the sync transport, the hello handshake
 * and URL mirroring; the stage and speaker view read and write through `update`.
 */
export function PresenterProvider({ mode, initialSlideId, children }: Props) {
  const router = useRouter();
  const writer = useMemo(() => newWriterId(), []);
  const [state, setState] = useState<PresenterState>(() => ({
    seq: 0,
    writer,
    slideId: initialSlideId,
    stepIndex: 0,
    blank: false,
    handsOn: false,
    live: false,
    startedAt: null,
    pausedAt: null,
  }));
  const stateRef = useRef(state);
  const [transport, setTransport] = useState<Transport>("broadcast");
  const [demoHealth, setDemoHealth] = useState<Record<string, DemoHealth>>({});
  const [peerSeen, setPeerSeen] = useState<Record<string, number>>({});
  const [rendered, setRendered] = useState(initialSlideId);
  const syncRef = useRef<Sync | null>(null);
  const performRef = useRef<((action: KeyAction) => void) | null>(null);
  // The provider survives slide navigations (same page component); the transport must start once.
  const firstSlideRef = useRef(initialSlideId);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Transport, hello handshake, and the first state (sync > storage > URL). Runs once per window.
  useEffect(() => {
    const initialSlide = firstSlideRef.current;
    let settled = false;
    // A URL the presenter typed, followed or opened names the slide to show (`?s=`), and wins over
    // whatever the other window holds. A reload or back/forward carries the mirrored URL of the
    // state it had, so the live state wins there and the window resumes. (docs/demo-plan.md, E8.1)
    const navType = (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;
    const urlSlide = new URLSearchParams(window.location.search).get("s");
    const urlWins = navType === "navigate" && urlSlide !== null;
    let claimed = false;
    const accept = (incoming: PresenterState) => {
      if (!isNewer(incoming, stateRef.current)) return;
      settled = true;
      if (urlWins && !claimed && urlSlide && incoming.slideId !== urlSlide) {
        // Take the peer's timer and counters, but move both windows to the URL's slide.
        claimed = true;
        const fromUrl = stateFromUrl(writer, initialSlide);
        const next: PresenterState = { ...incoming, slideId: urlSlide, stepIndex: fromUrl.stepIndex, seq: incoming.seq + 1, writer };
        stateRef.current = next;
        setState(next);
        sync.send({ type: "state", state: next });
        return;
      }
      claimed = true;
      stateRef.current = incoming;
      setState(incoming);
    };
    const sync = createSync((msg: SyncMessage) => {
      if (msg.type === "state") {
        accept(msg.state);
        setPeerSeen((p) => ({ ...p, [msg.state.writer]: Date.now() }));
      } else if (msg.type === "hello") {
        setPeerSeen((p) => ({ ...p, [msg.writer]: Date.now() }));
        // The current holder answers with its state.
        sync.send({ type: "state", state: stateRef.current });
      } else if (msg.type === "demo-health") {
        setPeerSeen((p) => ({ ...p, [msg.writer]: Date.now() }));
        setDemoHealth((h) => (h[msg.demoId] === msg.status ? h : { ...h, [msg.demoId]: msg.status }));
      }
    });
    syncRef.current = sync;
    setTransport(sync.transport);
    sync.send({ type: "hello", writer });
    const t = window.setTimeout(() => {
      // A peer answered, or this window already wrote state (a press before the fallback fired).
      if (settled || stateRef.current.seq > 0) return;
      const stored = sync.readStored();
      const fromUrl = stateFromUrl(writer, initialSlide);
      // No other window answered: a typed URL wins; a reload resumes the last stored state.
      const initial = stored && !urlWins ? { ...stored, writer } : fromUrl;
      stateRef.current = initial;
      setState(initial);
    }, 300);
    return () => {
      window.clearTimeout(t);
      sync.close();
      syncRef.current = null;
    };
  }, [writer]);

  // Mirror state into the URL, and navigate when the state names a slide this page did not render.
  // The step mirror is throttled to one write per 250 ms (leading, then trailing): WebKit and
  // Firefox rate-limit the history API per page, and a clicker burst would otherwise trip it.
  const lastMirror = useRef(0);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", state.slideId);
    if (state.stepIndex > 0) url.searchParams.set("step", String(state.stepIndex));
    else url.searchParams.delete("step");
    if (state.slideId !== rendered) {
      router.replace(url.pathname + url.search);
      return;
    }
    if (url.href === window.location.href) return;
    const write = () => {
      lastMirror.current = Date.now();
      try {
        window.history.replaceState(null, "", url);
      } catch {
        /* rate limited: the next change catches up */
      }
    };
    const wait = 250 - (Date.now() - lastMirror.current);
    if (wait <= 0) {
      write();
      return;
    }
    const t = window.setTimeout(write, wait);
    return () => window.clearTimeout(t);
  }, [state.slideId, state.stepIndex, rendered, router]);

  const update = useCallback<Presenter["update"]>(
    (patch) => {
      const next: PresenterState = { ...stateRef.current, ...patch, seq: stateRef.current.seq + 1, writer };
      stateRef.current = next;
      setState(next);
      syncRef.current?.send({ type: "state", state: next });
    },
    [writer],
  );

  const reportHealth = useCallback<Presenter["reportHealth"]>(
    (demoId, status) => {
      setDemoHealth((h) => (h[demoId] === status ? h : { ...h, [demoId]: status }));
      syncRef.current?.send({ type: "demo-health", demoId, status, writer });
    },
    [writer],
  );

  const getState = useCallback(() => stateRef.current, []);

  const registerPerform = useCallback<Presenter["registerPerform"]>((fn) => {
    performRef.current = fn;
  }, []);
  const perform = useCallback<Presenter["perform"]>((action) => performRef.current?.(action), []);

  // Windows heard from in the last 5 seconds, re-counted on a timer so stale peers age out.
  const [peers, setPeers] = useState(1);
  useEffect(() => {
    const count = () => {
      const cutoff = Date.now() - 5000;
      setPeers(1 + Object.entries(peerSeen).filter(([id, t]) => id !== writer && t > cutoff).length);
    };
    const id = window.setInterval(count, 1000);
    return () => window.clearInterval(id);
  }, [peerSeen, writer]);

  const value = useMemo<Presenter>(
    () => ({ mode, state, writer, transport, peers, demoHealth, update, getState, reportHealth, registerPerform, perform, setRenderedSlide: setRendered }),
    [mode, state, writer, transport, peers, demoHealth, update, getState, reportHealth, registerPerform, perform],
  );

  return <PresenterContext.Provider value={value}>{children}</PresenterContext.Provider>;
}
