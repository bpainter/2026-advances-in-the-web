"use client";

import { useEffect, useRef } from "react";
import { KEY_HELP } from "@/lib/keys";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function KeyboardHelp({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog className="keyboard-help" ref={ref} onClose={onClose} aria-labelledby="keyboard-help-title">
      <h2 className="keyboard-help__title" id="keyboard-help-title">
        Keyboard
      </h2>
      <dl className="keyboard-help__list">
        {KEY_HELP.map((row) => (
          <div key={row.action} style={{ display: "contents" }}>
            <dt className="keyboard-help__keys">
              {row.keys.map((k) => (
                <kbd key={k}>{k}</kbd>
              ))}
            </dt>
            <dd className="keyboard-help__action">{row.action}</dd>
          </div>
        ))}
      </dl>
      <button type="button" className="keyboard-help__close" onClick={onClose}>
        Close
      </button>
    </dialog>
  );
}
