"use client";

import { ChevronLeft, ChevronRight, Keyboard } from "lucide-react";

interface Props {
  slideIndex: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onHelp: () => void;
}

/** Minimal read-later controls: previous, next, counter, help. */
export function ReaderControls({ slideIndex, total, hasPrev, hasNext, onPrev, onNext, onHelp }: Props) {
  return (
    <nav className="reader-controls" aria-label="Deck controls">
      <button type="button" className="reader-controls__button" onClick={onPrev} disabled={!hasPrev} aria-label="Previous">
        <ChevronLeft aria-hidden="true" />
      </button>
      <p className="reader-controls__counter">
        {slideIndex} / {total}
      </p>
      <button type="button" className="reader-controls__button" onClick={onNext} disabled={!hasNext} aria-label="Next">
        <ChevronRight aria-hidden="true" />
      </button>
      <button type="button" className="reader-controls__button" onClick={onHelp} aria-label="Keyboard help">
        <Keyboard aria-hidden="true" />
      </button>
    </nav>
  );
}
