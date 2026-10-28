import type { Browser, DemoSection, SupportSource } from "@/content/demo-schema";

/**
 * Browser and tool support for the intro slides (PRD v4, section 3). Every version and date comes
 * from the installed `web-features` package (or, for tools, the npm registry at authoring time);
 * nothing here is typed by hand. `scripts/support-data.mts` writes the result to
 * content/.generated/support.json, the only file the intro slide reads.
 */

export const BROWSERS: { id: Browser; name: string; logo: string }[] = [
  { id: "chrome", name: "Chrome", logo: "/logos/chrome.svg" },
  { id: "edge", name: "Edge", logo: "/logos/edge.svg" },
  { id: "firefox", name: "Firefox", logo: "/logos/firefox.svg" },
  { id: "safari", name: "Safari", logo: "/logos/safari.svg" },
];

export interface WebFeaturesData {
  browsers: Record<string, { name: string; releases: { version: string; date: string }[] }>;
  features: Record<string, { kind?: string; name?: string; status?: { baseline: "high" | "low" | false; baseline_low_date?: string; support: Record<string, string> } }>;
}

export interface SupportTile {
  /** Browser id or npm package name. */
  id: string;
  name: string;
  logo: string;
  /** First supporting version as web-features gives it ("≤" kept), or null for "Not yet". */
  version: string | null;
  /** Release date of that version (YYYY-MM-DD), when known. */
  date: string | null;
}

export interface SupportEntry {
  kind: "web-features" | "tooling";
  /** Primary web-features id (web-features sections). */
  id?: string;
  /** The feature's web-features name. */
  name?: string;
  baseline?: "high" | "low" | false;
  baselineLowDate?: string | null;
  tiles: SupportTile[];
  /** The generated sentence(s) after the author's description. */
  since: string;
  /** "This demo also uses ..." or null. */
  alsoUses: string | null;
}

export interface SupportFile {
  package: "web-features";
  version: string;
  /** Tool release dates fetched by `pnpm support --tools`, keyed "<npm>@<version>". */
  toolDates: Record<string, string>;
  sections: Record<string, SupportEntry>;
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2022-03-14" -> "March 2022". */
export function monthYear(date: string): string {
  const [y, m] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "a, b and c" (no serial comma, as in PRD 3.3). */
export function joinAnd(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function releaseDate(data: WebFeaturesData, browser: string, version: string): string | null {
  const v = version.replace(/^≤/, "");
  return data.browsers[browser]?.releases.find((r) => r.version === v)?.date ?? null;
}

/** The web-features name of a feature, for sentences: "<dialog>" reads as "Dialog". */
export function spokenName(name: string): string {
  const plain = name.replace(/<([\w-]+)>/g, "$1");
  return plain.charAt(0).toUpperCase() + plain.slice(1);
}

export function webFeaturesEntry(data: WebFeaturesData, source: Extract<SupportSource, { kind: "web-features" }>): SupportEntry {
  const feature = data.features[source.id];
  if (!feature?.status) throw new Error(`web-features has no feature "${source.id}"`);
  const support = feature.status.support;
  const tiles: SupportTile[] = BROWSERS.map((b) => {
    const version = support[b.id] ?? null;
    return { id: b.id, name: b.name, logo: b.logo, version, date: version ? releaseDate(data, b.id, version) : null };
  });
  let since: string;
  if (feature.status.baseline && feature.status.baseline_low_date) {
    since = `It has been available in all four browsers since ${monthYear(feature.status.baseline_low_date)}.`;
  } else {
    const listed = tiles.filter((t) => t.version);
    const latest = listed.map((t) => t.date ?? "").sort().pop() ?? "";
    const missing = tiles.filter((t) => !t.version);
    since = `It works in ${joinAnd(listed.map((t) => t.name))} since ${monthYear(latest)}.`;
    if (missing.length) {
      const fallback = source.fallback?.text;
      if (!fallback) throw new Error(`${source.id}: not Baseline and missing in ${missing.map((m) => m.name).join(", ")}, but support.fallback is not set`);
      since += ` ${joinAnd(missing.map((m) => m.name))} shows ${fallback}.`;
    }
  }
  let alsoUses: string | null = null;
  if (source.alsoUses?.length) {
    const parts = source.alsoUses.map((id) => {
      const f = data.features[id];
      if (!f?.status) throw new Error(`web-features has no feature "${id}"`);
      const when = f.status.baseline_low_date ? ` (${monthYear(f.status.baseline_low_date)})` : "";
      return `${spokenName(f.name ?? id)}${when}`;
    });
    alsoUses = `This demo also uses ${joinAnd(parts)}.`;
  }
  return { kind: "web-features", id: source.id, name: feature.name, baseline: feature.status.baseline, baselineLowDate: feature.status.baseline_low_date ?? null, tiles, since, alsoUses };
}

/** npm version for a tile's version: "16" -> "16.0.0", "12.11" -> "12.11.0". */
export function fullVersion(version: string): string {
  const parts = version.split(".");
  while (parts.length < 3) parts.push("0");
  return parts.join(".");
}

export function toolingEntry(source: Extract<SupportSource, { kind: "tooling" }>, toolDates: Record<string, string>): SupportEntry {
  const tiles: SupportTile[] = source.packages.map((p) => ({ id: p.npm, name: p.name, logo: p.logo, version: p.version, date: toolDates[`${p.npm}@${fullVersion(p.version)}`] ?? null }));
  const dated = tiles.filter((t) => t.date);
  const since = dated.length
    ? dated.length === 1
      ? `${dated[0].name} ${dated[0].version} came out in ${monthYear(dated[0].date!)}.`
      : `${joinAnd(dated.map((t, i) => (i === 0 ? `${t.name} ${t.version} came out in ${monthYear(t.date!)}` : `${t.name} ${t.version} in ${monthYear(t.date!)}`)))}.`
    : "";
  return { kind: "tooling", tiles, since, alsoUses: null };
}

/** Every section with an intro page, computed from the data. */
export function computeSupport(sections: DemoSection[], data: WebFeaturesData, version: string, toolDates: Record<string, string>): SupportFile {
  const out: SupportFile = { package: "web-features", version, toolDates, sections: {} };
  for (const s of sections) {
    if (!s.support || !s.pages.some((p) => p.stage === "intro")) continue;
    out.sections[s.id] = s.support.kind === "web-features" ? webFeaturesEntry(data, s.support) : toolingEntry(s.support, toolDates);
  }
  return out;
}
