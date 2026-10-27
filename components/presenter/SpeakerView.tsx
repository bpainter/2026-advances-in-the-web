"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Demo, Engine, Slide } from "@/content/schema";
import { usePresenter } from "@/lib/presenter/context";
import { SupportLabel } from "@/components/demo/SupportLabel";
import { Timer } from "./Timer";

const ENGINE_NAME: Record<Engine, string> = { chrome: "Chrome", safari: "Safari", firefox: "Firefox" };
const NOTES_KEY = "deck:notes-size";
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

function standalonePath(demo: Demo): string {
  return demo.live.kind === "route" && demo.live.src ? demo.live.src : `/demos/${demo.id}`;
}

/** Absolute URL for the clipboard; resolved at click time because the origin is only known in the browser. */
function standaloneUrl(demo: Demo): string {
  return new URL(standalonePath(demo), process.env.NEXT_PUBLIC_DECK_URL ?? window.location.origin).href;
}

/** Speaker window layout (PRD 5.2): preview, status bar, next, notes, timing, demo health, controls. */
export function SpeakerView({ slide, next, total, targetMinutes, lastCumulative, rehearse, current, nextPreview }: Props) {
  const presenter = usePresenter();
  const [notesSize, setNotesSize] = useState(22);
  const [toast, setToast] = useState<string | null>(null);
  const timerSeen = useRef<number | null>(null);

  // Restore the persisted notes size after mount (it is a per-viewer preference, not render input).
  useEffect(() => {
    try {
      const saved = Number.parseInt(localStorage.getItem(NOTES_KEY) ?? "", 10);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved >= 18 && saved <= 32) setNotesSize(saved);
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
    <div className="speaker" data-rehearse={rehearse} data-blank={state.blank}>
      <Timer
        state={state}
        targetMinutes={slide.timing.cumulative}
        totalMinutes={Math.max(targetMinutes, lastCumulative)}
        onToggle={() => perform({ type: "toggle-timer" })}
        onReset={() => update({ startedAt: null, pausedAt: null })}
      />

      <main className="speaker__main">
        <div className="speaker__current" data-blank={state.blank}>
          {state.blank ? <p className="speaker__blank-eyebrow">BLANK</p> : null}
          {current}
        </div>
        <div className="speaker__status" role="status">
          <span className="speaker__counter">
            {slide.index} / {total}
          </span>
          <span className="speaker__section">{slide.section}</span>
          {steps.length > 0 ? (
            <span className="speaker__step">
              Step {stepIndex + 1} of {steps.length}
              {step ? `: ${step.caption}` : ""}
            </span>
          ) : null}
          {activeDemo && activeDemo.live.browsers.length > 0 ? (
            <span className="speaker__engines">Run in: {activeDemo.live.browsers.map((b) => ENGINE_NAME[b]).join(", then ")}</span>
          ) : null}
        </div>
      </main>

      <aside className="speaker__next" aria-label="Next">
        <p className="speaker__region-label">Next</p>
        {next ? (
          <>
            <div className="speaker__next-preview">{nextPreview}</div>
            <p className="speaker__next-title">
              {next.index}. {next.title} <span className="speaker__next-layout">{next.layout}</span>
            </p>
            {nextDemos[0] ? <p className="speaker__next-wow">{nextDemos[0].wow}</p> : null}
          </>
        ) : (
          <p className="speaker__next-title">End of deck</p>
        )}
      </aside>

      <section className="speaker__notes" aria-label="Notes" style={{ fontSize: `${notesSize}px` }}>
        <div className="speaker__notes-head">
          <p className="speaker__region-label">Notes</p>
          <div className="speaker__notes-size">
            <button type="button" className="speaker__button speaker__button--quiet" onClick={() => changeNotes(-2)} aria-label="Smaller notes">
              −
            </button>
            <button type="button" className="speaker__button speaker__button--quiet" onClick={() => changeNotes(2)} aria-label="Larger notes">
              +
            </button>
          </div>
        </div>
        {step?.action ? <p className="speaker__action">{step.action}</p> : null}
        {slide.support ? <SupportLabel support={slide.support} /> : null}
        {slide.support?.note ? <p className="speaker__support-note">{slide.support.note}</p> : null}
        <p className="speaker__notes-text">{slide.speakerNotes}</p>
        {activeDemo?.gotcha ? <p className="speaker__gotcha">{activeDemo.gotcha}</p> : null}
      </section>

      <section className="speaker__health" aria-label="Demo health">
        <ul className="speaker__chips">
          {[...demos, ...nextDemos].map((d) => (
            <li className="speaker__chip" key={d.id} data-status={demoHealth[d.id] ?? "loading"}>
              <span className="speaker__chip-id">{d.id}</span>
              <span className="speaker__chip-status">{d.code.some((f) => f.lang !== "bash") ? (demoHealth[d.id] ?? "no report") : "transcript"}</span>
              {d.code.some((f) => f.lang !== "bash") ? (
                <>
                  <button type="button" className="speaker__button speaker__button--quiet" onClick={() => void navigator.clipboard?.writeText(standaloneUrl(d))}>
                    Copy URL
                  </button>
                  <a className="speaker__button speaker__button--quiet" href={standalonePath(d)} target="_blank" rel="noopener">
                    Open
                  </a>
                </>
              ) : null}
            </li>
          ))}
          {demos.length + nextDemos.length === 0 ? <li className="speaker__chip">No demos on this or the next slide</li> : null}
        </ul>
        <p className="speaker__transport">
          {transport === "broadcast" ? "BroadcastChannel" : "localStorage"} · {peers} window{peers === 1 ? "" : "s"}
        </p>
      </section>

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
        <button type="button" className="speaker__button" onClick={openAudience}>
          Open audience window
        </button>
        <button type="button" className="speaker__button" onClick={() => perform({ type: "open-demo" })} disabled={!activeDemo}>
          Open demo
        </button>
        <button type="button" className="speaker__button" onClick={() => perform({ type: "reload-demo" })} disabled={!activeDemo}>
          Reload demo
        </button>
        <button type="button" className="speaker__button" onClick={() => perform({ type: "show-fallback" })} disabled={!activeDemo}>
          Show fallback
        </button>
        {rehearse ? (
          <button type="button" className="speaker__button speaker__button--quiet" onClick={exportLog}>
            Export rehearsal log
          </button>
        ) : null}
        <span className="speaker__clock-note">{state.startedAt === null ? "Timer starts on the first advance from slide 1" : ""}</span>
      </nav>

      {toast ? (
        <p className="speaker__toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
