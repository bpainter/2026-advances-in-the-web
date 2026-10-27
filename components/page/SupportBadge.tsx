import { X } from "lucide-react";
import type { DemoSupportLabel } from "@/content/demo-schema";

const ENGINE_NAME = { chrome: "Chrome", safari: "Safari", firefox: "Firefox", edge: "Edge" } as const;

/** Support badge on now and code pages (PRD Part A, 2.4): summary text, tier fill, missing engines struck through. */
export function SupportBadge({ support }: { support: DemoSupportLabel }) {
  return (
    <p className="badge" data-tier={support.tier}>
      <span className="badge__summary">{support.summary}</span>
      {support.missing?.map((engine) => (
        <span className="badge__missing" key={engine}>
          <X className="badge__x" size={16} strokeWidth={1.75} aria-hidden="true" />
          <s>{ENGINE_NAME[engine]}</s>
          <span className="badge__sr">missing</span>
        </span>
      ))}
    </p>
  );
}
