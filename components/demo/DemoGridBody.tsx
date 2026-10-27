"use client";

import type { Demo } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import type { RenderedFile } from "@/lib/highlight";
import { useStage } from "@/lib/stage-context";
import { DemoFrame } from "./DemoFrame";
import { CodePanel } from "./CodePanel";

interface Cell {
  demo: Demo;
  files: RenderedFile[];
  label: string;
}

interface Props {
  cells: Cell[];
  slideTitle: string;
  mode: Mode;
}

/** 2x2 of live demos. Keys 1 to 4 enlarge a cell to a 50/50 split with its code; 0 restores the grid. */
export function DemoGridBody({ cells, mode }: Props) {
  const { cellIndex, stepIndex, setCellIndex } = useStage();
  return (
    <ul className="demo-grid" data-focused={cellIndex === null ? "none" : String(cellIndex)}>
      {cells.map((cell, i) => {
        const enlarged = cellIndex === i;
        const step = enlarged ? cell.demo.steps[stepIndex] : undefined;
        return (
          <li className="demo-grid__cell" key={cell.demo.id} data-enlarged={enlarged} data-hidden={cellIndex !== null && !enlarged}>
            <div className="demo-grid__live">
              <DemoFrame
                demo={cell.demo}
                slideTitle={cell.label}
                frameTitle={`Live demo ${i + 1} of ${cells.length}: ${cell.demo.wow}`}
                liveState={step?.liveState}
                stepId={step?.id}
                mode={mode}
                zoom={enlarged ? (cell.demo.zoom ?? 2) : 1.25}
              />
              <h2 className="demo-grid__title">
                <button type="button" className="demo-grid__select" onClick={() => setCellIndex(enlarged ? null : i)} tabIndex={mode === "audience" ? -1 : 0}>
                  <span className="demo-grid__number">{i + 1}</span> {cell.label}
                </button>
              </h2>
            </div>
            {enlarged ? (
              <section className="demo-grid__code" aria-label="Code">
                <CodePanel demo={cell.demo} files={cell.files} stepIndex={stepIndex} mode={mode} />
              </section>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
