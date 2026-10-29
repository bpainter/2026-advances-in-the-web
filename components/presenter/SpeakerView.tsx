"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Slide } from "@/content/schema";
import { hasFrame, type Action, type DemoPage, type DemoSection, type Step } from "@/content/demo-schema";
import { Menu } from "lucide-react";
import { usePresenter } from "@/lib/presenter/context";
import { frameUrl } from "@/lib/frames/origins";
import { Timer, TimerBadge } from "./Timer";
import { NavTrigger, isNavOpen } from "@/components/chrome/NavDrawer";

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
  const [notesSize, setNotesSize] = useState(40);
  const [showActions, setShowActions] = useState(false);
  const notesBodyRef = useRef<HTMLDivElement>(null);
  const [timerShown, setTimerShown] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timerSeen = useRef<number | null>(null);

  useEffect(() => {
    try {
      const saved = Number.parseInt(localStorage.getItem(NOTES_KEY) ?? "", 10);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved >= 28 && saved <= 56) setNotesSize(saved);
      if (localStorage.getItem(TIMER_KEY) === "1") setTimerShown(true);
    } catch {
      /* no storage */
    }
  }, []);
  const changeNotes = (delta: number) => {
    const n = Math.min(56, Math.max(28, notesSize + delta));
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

  // Rehearsal (`d`): the next step's scripted actions also show under Next (PRD v4, 5.1 item 7).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "d" && !isNavOpen() && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target instanceof HTMLInputElement)) setShowActions((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Every step change brings the current step's notes into view (PRD v4, 5.1).
  const currentStep = presenter?.state.stepIndex;
  useEffect(() => {
    notesBodyRef.current?.scrollTo({ top: 0 });
  }, [slide.id, currentStep]);

  if (!presenter) return null;
  const { state, demoHealth, transport, peers, update, perform } = presenter;
  const page: DemoPage | undefined = slide.page;
  const section: DemoSection | undefined = slide.demoSection;
  const steps: Step[] = page?.steps ?? [];
  const stepIndex = state.stepIndex < 0 ? Math.max(steps.length - 1, 0) : Math.min(state.stepIndex, Math.max(steps.length - 1, 0));
  const step = steps[stepIndex];
  const last = steps.length > 0 && stepIndex === steps.length - 1;
  const nextStep = steps[stepIndex + 1];
  const showCautions = last && page?.stage === "now";
  const nextPageName = next ? (next.page && hasFrame(next.page) && next.page.stage !== "single" ? `${next.page.eyebrow}: ${next.page.title}` : next.title) : null;
  const nextLine = nextStep ? `Next: ${nextStep.label}` : nextPageName ? `Next page: ${nextPageName}` : "End of deck";
  const heading = page && section ? (hasFrame(page) && page.stage !== "single" ? { eyebrow: page.eyebrow, title: page.title } : { eyebrow: page.stage === "intro" ? "Intro slide" : null, title: page.stage === "intro" ? (section.feature ?? section.label) : page.title }) : null;
  const health = page ? demoHealth[page.id] : undefined;
  // Playing while the audience frame runs this step; Ready once it has finished (CX risk 2).
  const pb = presenter.playback;
  const playing = Boolean(pb && pb.playing && pb.slideId === slide.id && pb.stepIndex === stepIndex);
  const supportLine = section?.support ? (section.support.kind === "tooling" ? `Tools: ${section.support.packages.map((p) => `${p.name} ${p.version}`).join(", ")}.` : `web-features: ${section.support.id}${section.support.alsoUses?.length ? `; also uses ${section.support.alsoUses.join(", ")}` : ""}.`) : null;
  const openAudience = () => window.open("/present", "deck-audience");
  const openFrame = () => {
    if (page && hasFrame(page)) window.open(frameUrl(page.frame.route).url, "_blank", "noopener");
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

      <section className="speaker__notes" aria-label="Notes" style={{ "--notes-size": `${notesSize}px` } as React.CSSProperties}>
        <div className="speaker__notes-head">
          <p className="speaker__region-label">Notes</p>
          <div className="speaker__notes-size">
            <button type="button" className="speaker__button speaker__button--quiet" onClick={() => changeNotes(-4)} aria-label="Smaller notes">
              −
            </button>
            <button type="button" className="speaker__button speaker__button--quiet" onClick={() => changeNotes(4)} aria-label="Larger notes">
              +
            </button>
          </div>
        </div>
        <div className="speaker__notes-body" ref={notesBodyRef}>
          {page && step && heading ? (
            <>
              <header className="notes__header">
                <p className="notes__page">
                  {heading.eyebrow ? <span className="notes__eyebrow">{heading.eyebrow}: </span> : null}
                  {heading.title}
                </p>
                <p className="notes__step">
                  Step {stepIndex + 1} of {steps.length}: {step.label}
                  {step.key ? <span className="notes__chip notes__chip--key">Key point</span> : null}
                  {step.proof ? <span className="notes__chip">Proof</span> : null}
                  {hasFrame(page) ? (
                    <span className="notes__play" data-playing={playing} role="status">
                      {playing ? "Playing" : "Ready"}
                    </span>
                  ) : null}
                </p>
              </header>
              {state.handsOn && step.ifKeyboard ? <p className="notes__hands-on">{step.ifKeyboard}</p> : null}
              {stepIndex === 0 && page.intro ? <p className="notes__intro">{page.intro}</p> : null}
              {step.bullets.length ? (
                <ul className="notes__bullets" data-key={step.key || undefined}>
                  {step.bullets.map((b, i) => (
                    <li key={b} className="notes__bullet" data-key={(step.key && i === step.bullets.length - 1) || undefined}>
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}
              {showCautions && section && section.cautions.length ? (
                <section className="notes__cautions" aria-label="Cautions">
                  <p className="notes__cautions-label">Cautions</p>
                  <ul>
                    {section.cautions.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <details className="notes__reference">
                <summary>Reference</summary>
                {supportLine ? <p className="notes__support">{supportLine}</p> : null}
                {step.proof ? <p className="notes__support">Proof item: {step.proof}</p> : null}
                {section?.citations.length ? (
                  <ul className="notes__citations">
                    {section.citations.map((c) => (
                      <li key={c.url + c.text}>
                        <a href={c.url} target="_blank" rel="noopener">
                          {c.text}
                        </a>
                      </li>
                    ))}
                  </ul>
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
                <p className="notes__actions">This step: {summarize(step.actions) || "no actions"}</p>
                {nextStep ? <p className="notes__actions">Next step: {summarize(nextStep.actions) || "no actions"}</p> : null}
              </details>
            </>
          ) : (
            <p className="notes__intro">{slide.speakerNotes}</p>
          )}
        </div>
        <p className="notes__next">
          {nextLine}
          {showActions && nextStep ? <span className="notes__next-actions">{summarize(nextStep.actions)}</span> : null}
        </p>
      </section>

      <footer className="speaker__bottom">
        <nav className="speaker__controls" aria-label="Presenter controls">
          {/* The drawer (PRD r7, 9.4); the current preview's stage renders the dialog it opens. */}
          <NavTrigger className="speaker__button">
            <Menu aria-hidden="true" />
            Slides
          </NavTrigger>
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
          <button type="button" className="speaker__button speaker__button--quiet" onClick={openFrame} disabled={!page || !hasFrame(page)}>
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
