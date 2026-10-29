"use client";

import { ChevronLeft, ChevronRight, Keyboard, Menu } from "lucide-react";
import { NavTrigger } from "./NavDrawer";

interface Props {
  slideIndex: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onHelp: () => void;
  /** Wakes the pill when the pointer reaches it (PRD r7, 6.4: it may have faded while a frame had the input). */
  onWake?: () => void;
}

/**
 * Minimal read-later controls: the drawer, previous, counter, next, help (PRD r7, 9.4), top to
 * bottom in a rail in the canvas's right gutter, so they never cover the slide (review r7 L1).
 */
export function ReaderControls({ slideIndex, total, hasPrev, hasNext, onPrev, onNext, onHelp, onWake }: Props) {
  return (
    <nav className="reader-controls" aria-label="Deck controls" onPointerEnter={onWake}>
      <NavTrigger className="reader-controls__button" label="Sections">
        <Menu aria-hidden="true" />
      </NavTrigger>
      <button type="button" className="reader-controls__button" onClick={onPrev} disabled={!hasPrev} aria-label="Previous">
        <ChevronLeft aria-hidden="true" />
      </button>
      {/* Stacked in the rail (review r7 L1): the number over the total. Read as "12 of 50". */}
      <p className="reader-controls__counter">
        <span>{slideIndex}</span>
        <span className="visually-hidden"> of </span>
        <span className="reader-controls__total">{total}</span>
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

/**
 * The audience window's pill (PRD r7, 9.4; r7-spec 4): the menu button alone, a mouse fallback that
 * hides with the cursor. Out of the tab order: the audience window's keys belong to the clicker.
 */
export function AudienceControls() {
  return (
    <nav className="reader-controls reader-controls--audience" aria-label="Deck controls">
      <NavTrigger className="reader-controls__button" label="Sections" tabIndex={-1}>
        <Menu aria-hidden="true" />
      </NavTrigger>
    </nav>
  );
}
