"use client";

import { ChevronLeft, ChevronRight, ExternalLink, Keyboard } from "lucide-react";
import type { DemoView } from "@/content/schema";

interface Props {
  slideIndex: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  demoId?: string;
  hasDemoViews: boolean;
  view: DemoView;
  onView: (v: DemoView) => void;
  onHelp: () => void;
}

const VIEWS: { key: string; view: DemoView; label: string }[] = [
  { key: "1", view: "live", label: "Live only" },
  { key: "2", view: "split", label: "Split 60/40" },
  { key: "3", view: "code", label: "Code only" },
  { key: "4", view: "half", label: "Split 50/50" },
];

/** Minimal read-later controls: previous, next, counter, demo views, open demo, help. */
export function ReaderControls({ slideIndex, total, hasPrev, hasNext, onPrev, onNext, demoId, hasDemoViews, view, onView, onHelp }: Props) {
  return (
    <nav className="reader-controls" aria-label="Deck controls">
      <button type="button" className="reader-controls__button" onClick={onPrev} disabled={!hasPrev} aria-label="Previous">
        <ChevronLeft aria-hidden="true" />
      </button>
      <p className="reader-controls__counter" aria-live="off">
        {slideIndex} / {total}
      </p>
      <button type="button" className="reader-controls__button" onClick={onNext} disabled={!hasNext} aria-label="Next">
        <ChevronRight aria-hidden="true" />
      </button>
      {hasDemoViews ? (
        <div className="reader-controls__group" role="group" aria-label="Demo view">
          {VIEWS.map((v) => (
            <button key={v.view} type="button" className="reader-controls__button" aria-pressed={view === v.view} aria-label={v.label} title={`${v.label} (${v.key})`} onClick={() => onView(v.view)}>
              {v.key}
            </button>
          ))}
        </div>
      ) : null}
      {demoId ? (
        <a className="reader-controls__button" href={`/demos/${demoId}`} target="_blank" rel="noopener" aria-label="Open demo in a new tab" title="Open demo (o)">
          <ExternalLink aria-hidden="true" />
        </a>
      ) : null}
      <button type="button" className="reader-controls__button" onClick={onHelp} aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)">
        <Keyboard aria-hidden="true" />
      </button>
    </nav>
  );
}
