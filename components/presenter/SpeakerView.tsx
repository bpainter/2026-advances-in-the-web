"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Slide } from "@/content/schema";
import type { Action, DemoPage, DemoSection, Step } from "@/content/demo-schema";
import { usePresenter } from "@/lib/presenter/context";
import { frameUrl } from "@/lib/frames/origins";
import { Timer, TimerBadge } from "./Timer";

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
  /** Position of this page's section in the demo section (1-based) and the count. */
  sectionPosition?: { n: number; of: number };
}

/** "Click Actions; Esc via hidePopover()" (PRD Part A, 6.4). */
function summarize(actions: Action[]): string {
  const parts: string[] = [];
  for (const a of actions) {
    switch (a.type) {
      case "click":
        parts.push(`Click ${a.target}`);
        break;
      case "key":
        parts.push(`${a.key} via ${a.via.split(/[;(]/)[0].trim()}${a.via.includes("(") ? "()" : ""}`);
        break;
      case "type":
        parts.push(`Type "${a.text.slice(0, 24)}${a.text.length > 24 ? "…" : ""}"`);
        break;
      case "paste":
        parts.push("Paste");
        break;
      case "resize":
        parts.push(`Resize ${a.target} to ${a.inlineSize}`);
        break;
      case "toggle":
        parts.push(`${a.flag} ${a.on ? "on" : "off"}`);
        break;
      case "navigate":
        parts.push(a.history ? `History ${a.history}` : `Go to ${a.url}`);
        break;
      case "network":
        parts.push(`${a.profile} network`);
        break;
      case "hook":
        parts.push(`Hook ${a.name}`);
        break;
      case "terminal":
        parts.push(`Lines ${a.lines[0]} to ${a.lines[1]}`);
        break;
      case "reveal":
        parts.push(`Reveal ${a.target}`);
        break;
      default:
        break;
    }
  }
  return parts.join("; ");
}

function stageName(page: DemoPage): string {
  return page.stage === "single" ? "single page" : page.stage;
}

/**
 * Speaker window (PRD Part A, 6.4): previews on the left, notes for the exact step on the right,
 * next press, counters, timer, status and controls below.
 */
export function SpeakerView({ slide, next, total, targetMinutes, lastCumulative, rehearse, current, nextPreview, sectionPosition }: Props) {
  const presenter = usePresenter();
  const [notesSize, setNotesSize] = useState(28);
  const [timerShown, setTimerShown] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timerSeen = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = Number.parseInt(localStorage.getItem(NOTES_KEY) ?? "", 10);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved >= 20 && saved <= 40) setNotesSize(saved);
      if (localStorage.getItem(TIMER_KEY) === "1") setTimerShown(true);
    } catch {
      /* no storage */
    }
  }, []);
  const changeNotes = (delta: number) => {
    const n = Math.min(40, Math.max(20, notesSize + delta));
    setNotesSize(n);
    try {
      localStorage.setItem(NOTES_KEY, String(n));
    } catch {
      /* no storage */
    }
  };
  const toggleTimerBar = () => {
    const n = !timerShown;
    setTimerShown(n);
    try {
      localStorage.setItem(TIMER_KEY, n ? "1" : "0");
    } catch {
      /* no storage */
    }
  };

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
  const page: DemoPage | undefined = slide.page;
  const section: DemoSection | undefined = slide.demoSection;
  const steps: Step[] = page?.steps ?? [];
  const stepIndex = state.stepIndex < 0 ? Math.max(steps.length - 1, 0) : Math.min(state.stepIndex, Math.max(steps.length - 1, 0));
  const step = steps[stepIndex];
  const last = steps.length > 0 && stepIndex === steps.length - 1;
  const nextStep = steps[stepIndex + 1];
  const lastCodeStep = last && page?.stage === "code";
  const nextLine = nextStep ? `${nextStep.label}${nextStep.actions.length ? `: ${summarize(nextStep.actions)}` : ""}` : next ? `Next page: ${next.title}` : "End of deck";
  const health = page ? demoHealth[page.id] : undefined;
  const openAudience = () => window.open("/present", "deck-audience");
  const openFrame = () => {
    if (page?.frame) window.open(frameUrl(page.frame.route).url, "_blank", "noopener");
  };
  const exportLog = () => {
    const blob = new Blob([localStorage.getItem(LOG_KEY) ?? "[]"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rehearsal-log.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="speaker" data-rehearse={rehearse} data-blank={state.blank} data-timer={timerShown} data-hands-on={state.handsOn}>
      {timerShown ? (
        <Timer state={state} targetMinutes={slide.timing.cumulative} totalMinutes={Math.max(targetMinutes, lastCumulative)} onToggle={() => perform({ type: "toggle-timer" })} onReset={() => update({ startedAt: null, pausedAt: null })} onHide={toggleTimerBar} />
      ) : null}

      <section className="speaker__left" aria-label="Slides">
        <div className="speaker__current" data-blank={state.blank}>
          {state.blank ? <p className="speaker__blank-eyebrow">BLANK</p> : null}
          {state.handsOn ? <p className="speaker__blank-eyebrow speaker__blank-eyebrow--hands">HANDS-ON</p> : null}
          {current}
        </div>
        <div className="speaker__status" role="status">
          <span className="speaker__counter">
            {slide.index} / {total}
          </span>
          {page && sectionPosition ? (
            <span className="speaker__section">
              section {sectionPosition.n} of {sectionPosition.of} · {stageName(page)}
              {steps.length ? ` · step ${stepIndex + 1} of ${steps.length}` : ""}
            </span>
          ) : (
            <span className="speaker__section">{slide.section}</span>
          )}
          {page ? (
            <span className="speaker__engines" data-health={health ?? "none"}>
              frame {health ?? "not reported"}
            </span>
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
                  {next.index}. {next.title}
                </p>
                {next.page ? <p className="speaker__next-wow">{next.demoSection?.scenario}</p> : null}
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
            {step ? <span className="speaker__notes-step"> · {step.label}</span> : null}
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
          {page && step ? (
            <>
              {state.handsOn && step.ifKeyboard ? <p className="speaker__action">{step.ifKeyboard}</p> : null}
              {stepIndex === 0 ? (
                <>
                  <p className="speaker__eyebrow">Open</p>
                  <p className="speaker__notes-text">{page.notes.open}</p>
                </>
              ) : null}
              <p className="speaker__notes-text">{step.notes}</p>
              {step.proof ? <p className="speaker__proof">Proof: {step.proof}</p> : null}
              {last ? (
                <>
                  <p className="speaker__eyebrow">Bridge</p>
                  <p className="speaker__notes-text">{page.notes.bridge}</p>
                </>
              ) : null}
              <p className="speaker__next-press">
                <span className="speaker__next-press-label">Next press</span> {nextLine}
              </p>
              {lastCodeStep && section ? (
                <ul className="speaker__cautions">
                  {section.cautions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
              {section?.support?.detail ? <p className="speaker__gotcha">{section.support.detail}</p> : null}
              {section ? (
                <details className="speaker__citations">
                  <summary>Citations ({section.citations.length})</summary>
                  <ul>
                    {section.citations.map((c) => (
                      <li key={c.url + c.text}>
                        <a href={c.url} target="_blank" rel="noopener">
                          {c.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              <ol className="speaker__steps" aria-label="Steps">
                {steps.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" className="speaker__button speaker__button--quiet" aria-current={i === stepIndex} onClick={() => update({ stepIndex: i })}>
                      {s.id} {s.label}
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <p className="speaker__notes-text">{slide.speakerNotes}</p>
              <p className="speaker__next-press">
                <span className="speaker__next-press-label">Next press</span> {nextLine}
              </p>
            </>
          )}
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
          <button type="button" className="speaker__button" onClick={() => perform({ type: "toggle-hands-on" })} aria-pressed={state.handsOn}>
            Hands-on
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={() => perform({ type: "reset-step" })} disabled={!page}>
            Reset step
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={openAudience}>
            Audience window
          </button>
          <button type="button" className="speaker__button speaker__button--quiet" onClick={openFrame} disabled={!page?.frame}>
            Open frame
          </button>
          {rehearse ? (
            <button type="button" className="speaker__button speaker__button--quiet" onClick={exportLog}>
              Export rehearsal log
            </button>
          ) : null}
        </nav>
        <p className="speaker__transport">
          {transport === "broadcast" ? "BroadcastChannel" : "localStorage"} · {peers} window{peers === 1 ? "" : "s"}
        </p>
      </footer>

      {toast ? (
        <p className="speaker__toast" role="status">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
