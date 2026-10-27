"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Demo, Engine, Slide } from "@/content/schema";
import { resolveLive } from "@/lib/steps";
import { usePresenter } from "@/lib/presenter/context";
import { SupportLabel } from "@/components/demo/SupportLabel";
import { Timer, TimerBadge } from "./Timer";

const ENGINE_NAME: Record<Engine, string> = { chrome: "Chrome", safari: "Safari", firefox: "Firefox" };
const NOTES_KEY = "deck:notes-size";
const TIMER_KEY = "deck:timer-shown";
const LOG_KEY = "deck:rehearsal-log";

interface Props {
  slide: Slide;
  next?: Slide;
  total: number;
  targetMinutes: number;
  lastCumulative: number;
  rehearse: boolean;
  current: ReactNode;
  nextPreview: ReactNode | null;
}

function demosOf(slide?: Slide): Demo[] {
  if (!slide) return [];
  return slide.demo ? [slide.demo] : (slide.demos ?? []);
}

function standalonePath(demo: Demo, legacy = false): string {
  if (legacy) return `/demos/${demo.id}/legacy`;
  return demo.live.kind === "route" && demo.live.src ? demo.live.src : `/demos/${demo.id}`;
}

/** Absolute URL for the clipboard; resolved at click time because the origin is only known in the browser. */
function standaloneUrl(demo: Demo, legacy = false): string {
  return new URL(standalonePath(demo, legacy), process.env.NEXT_PUBLIC_DECK_URL ?? window.location.origin).href;
}

/**
 * Speaker window (PRD 5.2): current and next previews stacked on the left, the notes in their own
 * scrolling column on the right, demo health and controls in one row below. The timing bar is
 * hidden until asked for; a small clock in the status bar stands in.
 */
export function SpeakerView({ slide, next, total, targetMinutes, lastCumulative, rehearse, current, nextPreview }: Props) {
  const presenter = usePresenter();
  const [notesSize, setNotesSize] = useState(22);
  const [timerShown, setTimerShown] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timerSeen = useRef<number | null>(null);

  // Restore per-viewer preferences after mount (not render input).
  useEffect(() => {
    try {
      const saved = Number.parseInt(localStorage.getItem(NOTES_KEY) ?? "", 10);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved >= 18 && saved <= 32) setNotesSize(saved);
      if (localStorage.getItem(TIMER_KEY) === "1") setTimerShown(true);
    } catch {
      /* no storage */
    }
  }, []);
  const changeNotes = (delta: number) => {
    const next = Math.min(32, Math.max(18, notesSize + delta));
    setNotesSize(next);
    try {
      localStorage.setItem(NOTES_KEY, String(next));
    } catch {
      /* no storage */
    }
  };
  const toggleTimerBar = () => {
    const next = !timerShown;
    setTimerShown(next);
    try {
      localStorage.setItem(TIMER_KEY, next ? "1" : "0");
    } catch {
      /* no storage */
    }
  };

  // "Timer started" toast when the shared timer first starts.
  const startedAt = presenter?.state.startedAt ?? null;
  useEffect(() => {
    if (startedAt !== null && timerSeen.current === null) {
      setToast("Timer started");
      const t = window.setTimeout(() => setToast(null), 2500);
      timerSeen.current = startedAt;
      return () => window.clearTimeout(t);
    }
    timerSeen.current = startedAt;
  }, [startedAt]);

  // Rehearsal log: seconds spent on each slide, kept in localStorage (PRD 2).
  useEffect(() => {
    if (!rehearse) return;
    const entered = Date.now();
    return () => {
      try {
        const log = JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]") as { slideId: string; seconds: number; at: number }[];
        log.push({ slideId: slide.id, seconds: Math.round((Date.now() - entered) / 1000), at: entered });
        localStorage.setItem(LOG_KEY, JSON.stringify(log));
      } catch {
        /* no storage */
      }
    };
  }, [rehearse, slide.id]);

  if (!presenter) return null;
  const { state, demoHealth, transport, peers, update, perform } = presenter;
  const demos = demosOf(slide);
  const nextDemos = demosOf(next);
  const activeDemo = slide.demos ? (state.cellIndex === null ? undefined : slide.demos[state.cellIndex]) : slide.demo;
  const steps = activeDemo?.steps ?? [];
  const stepIndex = state.stepIndex < 0 ? Math.max(steps.length - 1, 0) : Math.min(state.stepIndex, Math.max(steps.length - 1, 0));
  const step = steps[stepIndex];
  const live = activeDemo ? resolveLive(activeDemo, stepIndex) : undefined;
  const phaseName = live ? (live.phase === "before" ? "Today" : live.phase === "after" ? "Native" : "Code") : null;
  const nextStep = steps[stepIndex + 1];
  const nextAction = nextStep ? `${nextStep.caption}${nextStep.action ? ` · ${nextStep.action}` : ""}` : next ? `Next slide: ${next.index}. ${next.title}` : "End of deck";
  const healthRows = [...demos, ...nextDemos].flatMap((d) => [{ demo: d, id: d.id }, ...(d.legacy ? [{ demo: d, id: `${d.id}:legacy` }] : [])]);
  const openAudience = () => window.open("/present", "deck-audience");
  const exportLog = () => {
    const blob = new Blob([localStorage.getItem(LOG_KEY) ?? "[]"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rehearsal-log.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="speaker" data-rehearse={rehearse} data-blank={state.blank} data-timer={timerShown}>
      {timerShown ? (
        <Timer
          state={state}
          targetMinutes={slide.timing.cumulative}
          totalMinutes={Math.max(targetMinutes, lastCumulative)}
          onToggle={() => perform({ type: "toggle-timer" })}
          onReset={() => update({ startedAt: null, pausedAt: null })}
          onHide={toggleTimerBar}
        />
      ) : null}

      <section className="speaker__left" aria-label="Slides">
        <div className="speaker__current" data-blank={state.blank}>
          {state.blank ? <p className="speaker__blank-eyebrow">BLANK</p> : null}
          {current}
        </div>
        <div className="speaker__status" role="status">
          <span className="speaker__counter">
            {slide.index} / {total}
          </span>
          <span className="speaker__section">{slide.section}</span>
          {activeDemo && activeDemo.live.browsers.length > 0 ? (
            <span className="speaker__engines">Run in: {activeDemo.live.browsers.map((b) => ENGINE_NAME[b]).join(", then ")}</span>
          ) : null}
          <span className="speaker__status-timer">
            <TimerBadge state={state} targetMinutes={slide.timing.cumulative} />
            <button type="button" className="speaker__button speaker__button--quiet" onClick={toggleTimerBar} aria-pressed={timerShown}>
              {timerShown ? "Hide timer" : "Timer"}
            </button>
          </span>
        </div>
        <aside className="speaker__next" aria-label="Next">
          <p className="speaker__region-label">Next</p>
          {next ? (
            <div className="speaker__next-row">
              <div className="speaker__next-preview">{nextPreview}</div>
              <div className="speaker__next-meta">
                <p className="speaker__next-title">
                  {next.index}. {next.title} <span className="speaker__next-layout">{next.layout}</span>
                </p>
                {nextDemos[0] ? <p className="speaker__next-wow">{nextDemos[0].wow}</p> : null}
              </div>
            </div>
          ) : (
            <p className="speaker__next-title">End of deck</p>
          )}
        </aside>
      </section>

      <section className="speaker__notes" aria-label="Notes" style={{ fontSize: `${notesSize}px` }}>
        <div className="speaker__notes-head">
          <p className="speaker__region-label">
            Notes
            {steps.length > 0 ? (
              <span className="speaker__notes-step">
                {" "}
                · Step {stepIndex + 1} of {steps.length}
                {phaseName ? ` · ${phaseName}` : ""}
                {live?.state ? ` · ${live.state}` : ""}
              </span>
            ) : null}
          </p>
          <div className="speaker__notes-size">
            <button type="button" className="speaker__button speaker__button--quiet" onClick={() => changeNotes(-2)} aria-label="Smaller notes">
              −
            </button>
            <button type="button" className="speaker__button speaker__button--quiet" onClick={() => changeNotes(2)} aria-label="Larger notes">
              +
            </button>
          </div>
        </div>
        <div className="speaker__notes-body">
          {step ? <p className="speaker__step">{step.caption}</p> : null}
          {step?.action ? <p className="speaker__action">{step.action}</p> : null}
          <p className="speaker__next-press">
            <span className="speaker__next-press-label">Next press</span> {nextAction}
          </p>
          {slide.support ? <SupportLabel support={slide.support} /> : null}
          {slide.support?.note ? <p className="speaker__support-note">{slide.support.note}</p> : null}
          <p className="speaker__notes-text">{slide.speakerNotes}</p>
          {activeDemo?.gotcha ? <p className="speaker__gotcha">{activeDemo.gotcha}</p> : null}
        </div>
      </section>

      <footer className="speaker__bottom">
        <nav className="speaker__controls" aria-label="Presenter controls">
          <button type="button" className="speaker__button" onClick={() => perform({ type: "retreat" })}>
            Previous
          </button>
          <button type="button" className="speaker__button" onClick={() => perform({ type: "advance" })}>
            Next
          </button>
          <button type="button" className="speaker__button" onClick={() => perform({ type: "toggle-blank" })} aria-pressed={state.blank}>
            Blank
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={openAudience}>
            Audience window
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={() => perform({ type: "open-demo" })} disabled={!activeDemo}>
            Open demo
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={() => perform({ type: "reload-demo" })} disabled={!activeDemo}>
            Reload
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={() => perform({ type: "show-fallback" })} disabled={!activeDemo}>
            Fallback
          </button>
          {rehearse ? (
            <button type="button" className="speaker__button speaker__button--quiet" onClick={exportLog}>
              Export rehearsal log
            </button>
          ) : null}
        </nav>
        <section className="speaker__health" aria-label="Demo health">
          <ul className="speaker__chips">
            {healthRows.map(({ demo: d, id }) => {
              const legacy = id.endsWith(":legacy");
              const frame = d.code.some((f) => f.lang !== "bash");
              return (
                <li className="speaker__chip" key={id} data-status={demoHealth[id] ?? "loading"}>
                  <span className="speaker__chip-id">{id}</span>
                  <span className="speaker__chip-status">{frame ? (demoHealth[id] ?? "no report") : "transcript"}</span>
                  {frame ? (
                    <>
                      <button type="button" className="speaker__button speaker__button--quiet" onClick={() => void navigator.clipboard?.writeText(standaloneUrl(d, legacy))}>
                        Copy URL
                      </button>
                      <a className="speaker__button speaker__button--quiet" href={standalonePath(d, legacy)} target="_blank" rel="noopener">
                        Open
                      </a>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <p className="speaker__transport">
            {transport === "broadcast" ? "BroadcastChannel" : "localStorage"} · {peers} window{peers === 1 ? "" : "s"}
          </p>
        </section>
      </footer>

      {toast ? (
        <p className="speaker__toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
