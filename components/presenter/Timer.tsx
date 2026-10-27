"use client";

import { useEffect, useState } from "react";
import type { PresenterState } from "@/lib/presenter/types";

interface Props {
  state: PresenterState;
  /** Target elapsed time at the end of the current slide, in minutes. */
  targetMinutes: number;
  /** The last slide's cumulative target, in minutes. */
  totalMinutes: number;
  onToggle: () => void;
  onReset: () => void;
  /** Collapses the bar back to the status-bar clock. */
  onHide?: () => void;
}

function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** The clock that stands in for the bar while it is hidden: elapsed, and over or under the slide's target. */
export function TimerBadge({ state, targetMinutes }: { state: PresenterState; targetMinutes: number }) {
  const now = useNow();
  const elapsed = elapsedMs(state, now);
  const delta = elapsed - targetMinutes * 60_000;
  const started = state.startedAt !== null;
  return (
    <span className="timer-badge" data-over={started && delta > 0} data-running={started && state.pausedAt === null}>
      <time className="timer-badge__elapsed" dateTime={`PT${Math.round(elapsed / 1000)}S`}>
        {formatClock(elapsed)}
      </time>
      <span className="timer-badge__delta">{!started ? "not started" : delta >= 0 ? `${formatClock(delta)} over` : `${formatClock(-delta)} under`}</span>
    </span>
  );
}

export function formatClock(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const total = Math.round(Math.abs(ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${sign}${m}:${String(s).padStart(2, "0")}`;
}

export function elapsedMs(state: PresenterState, now: number): number {
  if (state.startedAt === null) return 0;
  return (state.pausedAt ?? now) - state.startedAt;
}

/** Elapsed, target for this slide, delta as text first, and total remaining (PRD 5.2). */
export function Timer({ state, targetMinutes, totalMinutes, onToggle, onReset, onHide }: Props) {
  const now = useNow();
  const elapsed = elapsedMs(state, now);
  const target = targetMinutes * 60_000;
  const delta = elapsed - target;
  const remaining = totalMinutes * 60_000 - elapsed;
  const running = state.startedAt !== null && state.pausedAt === null;
  const deltaText = state.startedAt === null ? "not started" : delta >= 0 ? `${formatClock(delta)} over` : `${formatClock(-delta)} under`;
  return (
    <section className="timer" aria-label="Timing">
      <p className="timer__elapsed">
        <span className="timer__label">Elapsed</span>
        <time className="timer__value" dateTime={`PT${Math.round(elapsed / 1000)}S`}>
          {formatClock(elapsed)}
        </time>
      </p>
      <p className="timer__target">
        <span className="timer__label">Target by end of slide</span>
        <span className="timer__value">{formatClock(target)}</span>
      </p>
      <p className="timer__delta" data-over={delta > 0 && state.startedAt !== null}>
        {deltaText}
      </p>
      <p className="timer__remaining">
        <span className="timer__label">Remaining</span>
        <span className="timer__value">{formatClock(remaining)}</span>
      </p>
      <div className="timer__controls">
        <button type="button" className="speaker__button" onClick={onToggle}>
          {running ? "Pause" : state.startedAt === null ? "Start timer" : "Resume"}
        </button>
        <button type="button" className="speaker__button speaker__button--quiet" onClick={onReset}>
          Reset
        </button>
        {onHide ? (
          <button type="button" className="speaker__button speaker__button--quiet" onClick={onHide}>
            Hide
          </button>
        ) : null}
      </div>
    </section>
  );
}
