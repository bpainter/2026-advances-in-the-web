import type { Action, Step } from "@/content/demo-schema";
import { DEFAULT_PACE, parseFromRuntime, type AssertResult, type Cursor, type Cue, type Flags, type FromRuntime, type Rect, type RunMode, type ToRuntime } from "./protocol";

export interface StepResult {
  asserts: AssertResult[];
  digest: string;
  ms: number;
  finished: boolean;
}

export interface StepRun {
  runId: number;
  readonly playing: boolean;
  finish(): void;
  cancel(): void;
  done: Promise<StepResult>;
}

export interface RectsMessage {
  rects: Record<string, Rect[]>;
  focus: Rect | null;
  focusVisibleNative: boolean;
  viewport: { w: number; h: number };
}

type Listener<T> = (value: T) => void;

let nextFrameId = 1;
let nextRunId = 1;

/** Handles keyed by the iframe's WindowProxy, which survives in-frame navigations. */
const bySource = new Map<Window, FrameHandle>();
let routerInstalled = false;

function installRouter() {
  if (routerInstalled || typeof window === "undefined") return;
  routerInstalled = true;
  window.addEventListener("message", (e) => {
    const frame = e.source ? bySource.get(e.source as Window) : undefined;
    if (!frame || e.origin !== frame.expectedOrigin) return;
    const msg = parseFromRuntime(e.data);
    if (!msg) return;
    if (msg.frameId !== null && msg.frameId !== frame.id) return;
    frame.receive(msg);
  });
}

export interface FrameHandleOptions {
  expectedOrigin: string;
  mirror: boolean;
  handsOn: boolean;
  reducedMotion: boolean;
  flags: Flags;
  sideEffects: string[];
}

/**
 * One iframe instance and its runtime (PRD Part A, 5.4). The handle sends `init` on every `ready`
 * (the document may navigate), tracks the current run, and resumes it after an unload.
 */
export class FrameHandle {
  readonly id = `f${nextFrameId++}`;
  readonly expectedOrigin: string;
  readonly iframe: HTMLIFrameElement;
  private opts: FrameHandleOptions;
  private readyResolvers: Array<() => void> = [];
  private isReady = false;
  private run: { runId: number; stepId: string; mode: RunMode; actions: Action[]; resolve: (r: StepResult) => void; playing: boolean; steps?: { stepId: string; actions: Action[] }[] } | null = null;
  private pendingResume: { kind: "run" | "replay"; cursor: Cursor } | null = null;
  private watched: string[] = [];
  private live = false;
  supports: Record<string, boolean> = {};
  hooks: string[] = [];
  lastRects: RectsMessage | null = null;
  private rectListeners = new Set<Listener<RectsMessage>>();
  private cueListeners = new Set<Listener<Cue>>();
  private errorListeners = new Set<Listener<Extract<FromRuntime, { type: "error" }>>>();
  private keyListeners = new Set<Listener<Extract<FromRuntime, { type: "key" }>>>();
  private viewportListeners = new Set<Listener<{ inlineSize: string; ms: number }>>();
  private readyListeners = new Set<Listener<void>>();

  constructor(iframe: HTMLIFrameElement, opts: FrameHandleOptions) {
    this.iframe = iframe;
    this.opts = opts;
    this.expectedOrigin = opts.expectedOrigin;
    installRouter();
    if (iframe.contentWindow) bySource.set(iframe.contentWindow, this);
    iframe.addEventListener("load", () => {
      if (iframe.contentWindow) bySource.set(iframe.contentWindow, this);
    });
  }

  get ready(): Promise<void> {
    if (this.isReady) return Promise.resolve();
    return new Promise((resolve) => this.readyResolvers.push(resolve));
  }

  private post(msg: ToRuntime) {
    this.iframe.contentWindow?.postMessage(msg, this.expectedOrigin);
  }

  receive(msg: FromRuntime) {
    switch (msg.type) {
      case "ready": {
        this.supports = msg.supports;
        this.hooks = msg.hooks;
        this.post({ v: 1, type: "init", frameId: this.id, mirror: this.opts.mirror, handsOn: this.opts.handsOn, reducedMotion: this.opts.reducedMotion, pace: DEFAULT_PACE, flags: this.opts.flags, sideEffects: this.opts.sideEffects });
        if (this.watched.length) this.post({ v: 1, type: "watch", frameId: this.id, selectors: this.watched, live: this.live });
        this.isReady = true;
        this.readyResolvers.splice(0).forEach((r) => r());
        this.readyListeners.forEach((l) => l());
        // A document that navigated mid-run continues where the old one stopped.
        if (this.pendingResume && this.run) {
          const resume = this.pendingResume;
          this.pendingResume = null;
          if (resume.kind === "run") this.post({ v: 1, type: "run-step", frameId: this.id, runId: this.run.runId, stepId: this.run.stepId, actions: this.run.actions, mode: this.run.mode, startAt: resume.cursor.action });
          else this.post({ v: 1, type: "replay-to", frameId: this.id, runId: this.run.runId, steps: this.run.steps ?? [], from: resume.cursor });
        }
        return;
      }
      case "rects":
        this.lastRects = { rects: msg.rects, focus: msg.focus, focusVisibleNative: msg.focusVisibleNative, viewport: msg.viewport };
        this.rectListeners.forEach((l) => l(this.lastRects!));
        return;
      case "cue":
        if (this.run && msg.runId === this.run.runId) this.cueListeners.forEach((l) => l(msg.cue));
        return;
      case "unloading":
        if (this.run && msg.runId === this.run.runId) {
          this.pendingResume = { kind: this.run.steps ? "replay" : "run", cursor: msg.cursor };
          this.isReady = false;
        }
        return;
      case "step-done":
        if (this.run && msg.runId === this.run.runId) {
          const r = this.run;
          this.run = null;
          r.playing = false;
          r.resolve({ asserts: msg.asserts, digest: msg.digest, ms: msg.ms, finished: msg.finished });
        }
        return;
      case "error":
        this.errorListeners.forEach((l) => l(msg));
        return;
      case "key":
        this.keyListeners.forEach((l) => l(msg));
        return;
      case "resize-viewport":
        this.viewportListeners.forEach((l) => l({ inlineSize: msg.inlineSize, ms: msg.ms }));
        return;
    }
  }

  /** Plays one step; animated or instant. Resolves on `step-done`. */
  runStep(step: Step, mode: RunMode, startAt = 0): StepRun {
    const runId = nextRunId++;
    let resolve!: (r: StepResult) => void;
    const done = new Promise<StepResult>((r) => (resolve = r));
    const run = { runId, stepId: step.id, mode, actions: step.actions, resolve, playing: true };
    this.run = run;
    void this.ready.then(() => {
      if (this.run !== run) return;
      this.post({ v: 1, type: "run-step", frameId: this.id, runId, stepId: step.id, actions: step.actions, mode, startAt });
    });
    return {
      runId,
      get playing() {
        return run.playing;
      },
      finish: () => this.post({ v: 1, type: "finish", frameId: this.id, runId }),
      cancel: () => {
        if (this.run === run) {
          this.run = null;
          run.playing = false;
          resolve({ asserts: [], digest: "", ms: 0, finished: false });
        }
      },
      done,
    };
  }

  /** Replays `steps` instantly from a fresh document. */
  replayTo(steps: Step[], from: Cursor = { step: 0, action: 0 }): Promise<StepResult> {
    const runId = nextRunId++;
    return new Promise<StepResult>((resolve) => {
      const list = steps.map((s) => ({ stepId: s.id, actions: s.actions }));
      this.run = { runId, stepId: steps[steps.length - 1]?.id ?? "s0", mode: "instant", actions: [], resolve, playing: true, steps: list };
      void this.ready.then(() => {
        if (!this.run || this.run.runId !== runId) return;
        this.post({ v: 1, type: "replay-to", frameId: this.id, runId, steps: list, from });
      });
    });
  }

  setFlag(flag: string, on: boolean) {
    this.post({ v: 1, type: "set-flag", frameId: this.id, flag, on });
  }
  setMode(handsOn: boolean) {
    this.opts.handsOn = handsOn;
    this.post({ v: 1, type: "set-mode", frameId: this.id, handsOn });
  }
  reset() {
    this.post({ v: 1, type: "reset", frameId: this.id });
  }
  watch(selectors: string[], live: boolean) {
    this.watched = selectors;
    this.live = live;
    if (this.isReady) this.post({ v: 1, type: "watch", frameId: this.id, selectors, live });
  }
  focus() {
    this.iframe.focus();
    try {
      this.iframe.contentWindow?.focus();
    } catch {
      /* cross-origin focus is still allowed, but be safe */
    }
  }

  onRects(cb: Listener<RectsMessage>) {
    this.rectListeners.add(cb);
    return () => this.rectListeners.delete(cb);
  }
  onCue(cb: Listener<Cue>) {
    this.cueListeners.add(cb);
    return () => this.cueListeners.delete(cb);
  }
  onError(cb: Listener<Extract<FromRuntime, { type: "error" }>>) {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }
  onKey(cb: Listener<Extract<FromRuntime, { type: "key" }>>) {
    this.keyListeners.add(cb);
    return () => this.keyListeners.delete(cb);
  }
  onViewport(cb: Listener<{ inlineSize: string; ms: number }>) {
    this.viewportListeners.add(cb);
    return () => this.viewportListeners.delete(cb);
  }
  onReady(cb: Listener<void>) {
    this.readyListeners.add(cb);
    return () => this.readyListeners.delete(cb);
  }

  dispose() {
    if (this.iframe.contentWindow) bySource.delete(this.iframe.contentWindow);
    this.run?.resolve({ asserts: [], digest: "", ms: 0, finished: false });
    this.run = null;
    this.iframe.remove();
  }
}
