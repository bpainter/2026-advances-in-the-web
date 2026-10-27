import { Compass, Flame, Globe, X } from "lucide-react";
import type { Engine, SupportLabel as SupportLabelData, Tier } from "@/content/schema";

const TIER_TEXT: Record<Tier, string> = {
  "baseline-widely": "Baseline widely",
  "baseline-newly": "Baseline newly",
  "two-engine": "Two engines",
  "one-engine": "One engine",
  none: "Not yet",
};

const ENGINES: { id: Engine; name: string; Icon: typeof Globe }[] = [
  { id: "chrome", name: "Chrome", Icon: Globe },
  { id: "safari", name: "Safari", Icon: Compass },
  { id: "firefox", name: "Firefox", Icon: Flame },
];

/** Support badge rendered on every demo slide (PRD Part A, section 6.4). */
export function SupportLabel({ support }: { support: SupportLabelData }) {
  const missing = new Set(support.missing ?? []);
  return (
    <div className="support" data-tier={support.tier}>
      <span className="support__tier">{TIER_TEXT[support.tier]}</span>
      {support.since ? <span className="support__since">since {support.since}</span> : null}
      <ul className="support__engines" aria-label="Engines">
        {ENGINES.map(({ id, name, Icon }) => {
          const isMissing = missing.has(id);
          return (
            <li className="support__engine" data-engine={id} data-missing={isMissing} key={id}>
              {isMissing ? <X aria-hidden="true" /> : <Icon aria-hidden="true" />}
              <span>{name}</span>
              {isMissing ? <span className="visually-hidden"> missing</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
