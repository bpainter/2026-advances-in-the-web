"use client";

import { useEffect, useRef, useState } from "react";
import type { Demo } from "@/content/schema";
import { highlightSet } from "@/lib/steps";
import { useStage } from "@/lib/stage-context";

interface Props {
  demo: Demo;
  lines: string[];
}

type Kind = "command" | "comment" | "output";
const kindOf = (line: string): Kind => (line.startsWith("$ ") ? "command" : line.startsWith("# ") ? "comment" : "output");

const TYPING_MS = 18;
const OUTPUT_PAUSE_MS = 250;

/** Visible line count at a step: every line up to the end of that step's revealed range. */
function targetFor(demo: Demo, stepIndex: number, total: number): number {
  let max = 0;
  for (let i = 0; i <= Math.min(stepIndex, demo.steps.length - 1); i++) {
    for (const n of highlightSet(demo.steps[i].highlight)) max = Math.max(max, n);
  }
  return Math.min(max, total);
}

/**
 * Stepped replay of a recorded transcript (PRD 7.10): commands type at 18ms per character,
 * output prints whole after a pause; reduced motion shows lines instantly.
 */
export function Terminal({ demo, lines }: Props) {
  const { stepIndex, liveMode } = useStage();
  const target = targetFor(demo, stepIndex, lines.length);
  // `shown` = fully revealed lines; `partial` = characters typed of the next command line.
  const [state, setState] = useState<{ shown: number; partial: number }>({ shown: 0, partial: 0 });
  const stateRef = useRef(state);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const current = stateRef.current;
    if (target <= current.shown || reduce) {
      const t = window.setTimeout(() => setState({ shown: target, partial: 0 }), 0);
      return () => window.clearTimeout(t);
    }
    let cancelled = false;
    let timer = 0;
    const reveal = (index: number) => {
      if (cancelled || index >= target) return;
      const line = lines[index];
      if (kindOf(line) === "command") {
        let chars = 0;
        const tick = () => {
          if (cancelled) return;
          chars++;
          if (chars >= line.length) {
            setState({ shown: index + 1, partial: 0 });
            timer = window.setTimeout(() => reveal(index + 1), OUTPUT_PAUSE_MS);
          } else {
            setState({ shown: index, partial: chars });
            timer = window.setTimeout(tick, TYPING_MS);
          }
        };
        timer = window.setTimeout(tick, TYPING_MS);
      } else {
        timer = window.setTimeout(() => {
          if (cancelled) return;
          setState({ shown: index + 1, partial: 0 });
          reveal(index + 1);
        }, kindOf(line) === "output" ? 60 : OUTPUT_PAUSE_MS);
      }
    };
    reveal(current.shown);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [target, lines]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state]);

  return (
    <figure className="terminal" data-live={liveMode}>
      <pre className="terminal__log" role="log" aria-live="polite" ref={logRef}>
        {lines.slice(0, state.shown).map((line, i) => (
          <span className="terminal__line" data-kind={kindOf(line)} key={i}>
            {line}
          </span>
        ))}
        {state.partial > 0 ? (
          <span className="terminal__line" data-kind="command" data-typing="true">
            {lines[state.shown].slice(0, state.partial)}
          </span>
        ) : null}
        <span className="terminal__cursor" aria-hidden="true" />
      </pre>
      <kbd className="terminal__chip">{liveMode ? "live" : "recorded"}</kbd>
      {liveMode ? <p className="terminal__live-note">Recording hidden. Press l to bring it back.</p> : null}
    </figure>
  );
}
