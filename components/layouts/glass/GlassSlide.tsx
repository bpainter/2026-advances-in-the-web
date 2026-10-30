import type { ComponentType } from "react";
import { Accessibility, Activity, ClipboardCheck, CodeXml, DoorOpen, GraduationCap, KeyRound, Layers, Link, MonitorSmartphone, Package, ShieldCheck, SlidersHorizontal, UserCheck, Wrench } from "lucide-react";
import type { GlassContent, Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { deck, siteHref } from "@/content/deck";
import { pictureSources } from "@/lib/assets";
import { GlassClosing } from "./GlassClosing";
import { NewTabLink } from "./NewTabLink";
import { Wordmark } from "./Wordmark";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

const ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number; className?: string; "aria-hidden"?: boolean }>> = {
  Wrench,
  KeyRound,
  GraduationCap,
  UserCheck,
  ClipboardCheck,
  Activity,
  MonitorSmartphone,
  SlidersHorizontal,
  Link,
  Accessibility,
  ShieldCheck,
  DoorOpen,
  CodeXml,
  Layers,
  Package,
};

function Icon({ name, size }: { name?: string; size: number }) {
  const I = name ? ICONS[name] : undefined;
  return I ? <I size={size} strokeWidth={1.75} className="sg-icon" aria-hidden /> : null;
}

/**
 * Slide 3's portraits: masters under public/images/design/, served as AVIF with a WebP fallback at
 * 512 and 1024 w (pnpm images). Shown at 512 by 472 canvas px (object-fit: cover).
 */
function Portrait({ src, alt }: { src: string; alt: string }) {
  const p = pictureSources(src, 512);
  return (
    // display: contents keeps the card's layout on the <img>, as before the <picture>.
    <picture style={{ display: "contents" }}>
      {p.sources.map((s) => (
        <source key={s.type} type={s.type} srcSet={s.srcSet} sizes={p.sizes} />
      ))}
      <img className="sg-portrait" src={p.src} srcSet={p.srcSet} sizes={p.sizes} alt={alt} width={512} height={512} />
    </picture>
  );
}

/**
 * Two glass pills at y 1012 (spec 6.1): the site on the left, a link (PRD r7, 5.1), and the event,
 * speaker and slide number on the right.
 */
function Footer({ slide, tone, mode }: { slide: Slide; tone: "light" | "dark"; mode: Mode }) {
  return (
    <footer className="sg-footer" data-tone={tone}>
      <p className="sg-pill">
        <NewTabLink href={siteHref(slide.id)} mode={mode}>
          {deck.site.label}
        </NewTabLink>
      </p>
      <p className="sg-pill">
        {/* The number is named for screen readers (a11y L3): "…, Slalom, slide 48". */}
        FITC Web Unleashed 2026, Bermon Painter, Slalom<span className="visually-hidden">, slide </span>
        <span className="sg-pill__num">{slide.index}</span>
      </p>
    </footer>
  );
}

/**
 * Native opening and closing slides on glass (PRD v5, 4.5; docs/design/demo-wrappers-spec.md 6):
 * the slide's background comes from the stage; these layouts draw text, cards and panels with the
 * glass and chrome tokens only.
 */
export function GlassSlide({ slide, mode }: Props) {
  const g = slide.glass as GlassContent | undefined;
  if (!g) throw new Error(`Slide ${slide.id} has a glass layout but no glass content`);
  switch (g.kind) {
    case "title":
      return (
        <section className="sg sg--title" data-tone="dark" aria-label={slide.title}>
          <p className="sg-eyebrow">{g.eyebrow}</p>
          <h1 className="sg-display sg-title-lines">
            {g.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h1>
          {/* The name and job title come from content/deck.ts, shared with the closing and the metadata (PRD r7, 4.2). */}
          <p className="sg-cover__name">
            <NewTabLink href={deck.speaker.linkedin} mode={mode} rel="me noopener">
              {deck.speaker.name}
            </NewTabLink>
          </p>
          <p className="sg-cover__role">
            {deck.speaker.title}, {deck.speaker.org}
          </p>
          <Wordmark mode={mode} />
        </section>
      );
    case "grid":
      return (
        <section className={`sg sg--grid sg--${g.variant}${g.align === "center" ? " sg--center" : ""}`} data-tone={g.tone} data-slide={slide.id} aria-label={slide.title}>
          {g.eyebrow ? <p className="sg-eyebrow">{g.eyebrow}</p> : null}
          {g.display ? <h1 className="sg-display">{g.display}</h1> : null}
          {g.title ? <h1 className="sg-title">{g.title}</h1> : null}
          {g.lede ? <p className="sg-body sg-lede">{g.lede}</p> : null}
          {g.cardsEyebrow ? <p className="sg-eyebrow sg-cards-eyebrow">{g.cardsEyebrow}</p> : null}
          <ul className="sg-cards">
            {g.cards.map((c) => (
              <li key={c.title} className={`sg-card ${g.tone === "dark" ? "sg-card--dark" : ""}`}>
                {c.image ? <Portrait src={c.image.src} alt={c.image.alt} /> : null}
                {c.num ? <p className="sg-num">{c.num}</p> : null}
                <Icon name={c.icon} size={g.variant === "numbered" || c.body ? 56 : 48} />
                <div className="sg-card__text">
                  <p className="sg-card__title">{c.title}</p>
                  {c.body ? <p className="sg-card__body">{c.body}</p> : null}
                </div>
                {c.question ? <p className="sg-question">{c.question}</p> : null}
              </li>
            ))}
          </ul>
          <Footer slide={slide} tone={g.tone} mode={mode} />
        </section>
      );
    case "quotes":
      return (
        <section className="sg sg--quotes" data-tone="dark" aria-label={slide.title}>
          <div className="sg-card sg-card--dark sg-quotes">
            <h1 className="sg-title">{g.title}</h1>
            <div className="sg-quotes__grid">
              {g.quotes.map((q) => (
                <figure key={q.cite} className="sg-quote">
                  <blockquote className="sg-quote__text">{q.text}</blockquote>
                  <figcaption className="sg-quote__cite">{q.cite}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <Footer slide={slide} tone="dark" mode={mode} />
        </section>
      );
    case "statement":
      return (
        <section className="sg sg--statement" data-tone="dark" aria-label={slide.title}>
          <div className="sg-card sg-card--dark sg-statement">
            <h1 className="sg-display sg-title-lines">
              {g.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h1>
          </div>
          <Footer slide={slide} tone="dark" mode={mode} />
        </section>
      );
    case "people":
      return (
        <section className="sg sg--people" data-tone="light" aria-label={slide.title}>
          <h1 className="sg-title">{g.title}</h1>
          <div className="sg-card sg-people">
            <ul className="sg-people__grid">
              {g.people.map((p) => (
                <li key={p.name} className="sg-person">
                  <span className="sg-person__avatar" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.photo ? <img className="sg-person__photo" src={p.photo} alt="" width={96} height={96} decoding="async" /> : p.initials}
                  </span>
                  <span className="sg-person__text">
                    <span className="sg-person__name">{p.name}</span>
                    <span className="sg-person__role">{p.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Footer slide={slide} tone="light" mode={mode} />
        </section>
      );
    case "closing":
      return <GlassClosing slide={slide} content={g} mode={mode} />;
  }
}
