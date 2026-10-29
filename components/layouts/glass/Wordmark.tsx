import type { Mode } from "@/lib/mode";
import { deck } from "@/content/deck";
import { NewTabLink } from "./NewTabLink";

/** The Slalom wordmark, white on dark slides, a link to slalom.com named "Slalom" (PRD r7, 5.1). */
export function Wordmark({ mode, className = "sg-wordmark" }: { mode: Mode; className?: string }) {
  return (
    <p className={className}>
      <NewTabLink href={deck.org.url} mode={mode} label={deck.org.name}>
        slalom
      </NewTabLink>
    </p>
  );
}
