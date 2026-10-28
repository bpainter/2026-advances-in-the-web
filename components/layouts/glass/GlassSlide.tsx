import type { ComponentType } from "react";
import { Accessibility, Activity, ClipboardCheck, CodeXml, DoorOpen, GraduationCap, KeyRound, Layers, Link, MonitorSmartphone, Package, ShieldCheck, SlidersHorizontal, UserCheck, Wrench } from "lucide-react";
import type { GlassContent, Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { deck } from "@/content/deck";
import { GlassClosing } from "./GlassClosing";

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

/** Two glass pills at y 1012 (spec 6.1): the site on the left, the event, speaker and slide number on the right. */
function Footer({ slide, tone }: { slide: Slide; tone: "light" | "dark" }) {
  return (
    <footer className="sg-footer" data-tone={tone}>
      <p className="sg-pill">{deck.site.label}</p>
      <p className="sg-pill">
        FITC Web Unleashed 2026, Bermon Painter, Slalom <span className="sg-pill__num">{slide.index}</span>
      </p>
    </footer>
  );
}

/** The Slalom wordmark, white on dark slides. */
function Wordmark() {
  return (
    <p className="sg-wordmark" aria-label="Slalom">
      slalom
    </p>
  );
}

/**
 * Native opening and closing slides on glass (PRD v5, 4.5; docs/design/demo-wrappers-spec.md 6):
 * the slide's background comes from the stage; these layouts draw text, cards and panels with the
 * glass and chrome tokens only.
 */
export function GlassSlide({ slide }: Props) {
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
          <div className="sg-card sg-card--dark sg-speaker">
            <p className="sg-speaker__name">{g.speaker.name}</p>
            <p className="sg-speaker__role">{g.speaker.role}</p>
          </div>
          <Wordmark />
        </section>
      );
    case "grid":
      return (
        <section className={`sg sg--grid sg--${g.variant}`} data-tone={g.tone} data-slide={slide.id} aria-label={slide.title}>
          {g.eyebrow ? <p className="sg-eyebrow">{g.eyebrow}</p> : null}
          {g.display ? <h1 className="sg-display">{g.display}</h1> : null}
          {g.title ? <h1 className="sg-title">{g.title}</h1> : null}
          {g.lede ? <p className="sg-body sg-lede">{g.lede}</p> : null}
          {g.cardsEyebrow ? <p className="sg-eyebrow sg-cards-eyebrow">{g.cardsEyebrow}</p> : null}
          <ul className="sg-cards">
            {g.cards.map((c) => (
              <li key={c.title} className={`sg-card ${g.tone === "dark" ? "sg-card--dark" : ""}`}>
                {c.image ? (
                  // Portraits are static files under public/images/design/.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="sg-portrait" src={c.image.src} alt={c.image.alt} width={512} height={512} />
                ) : null}
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
          <Footer slide={slide} tone={g.tone} />
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
          <Footer slide={slide} tone="dark" />
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
          <Footer slide={slide} tone="dark" />
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
                    {p.initials}
                  </span>
                  <span className="sg-person__text">
                    <span className="sg-person__name">{p.name}</span>
                    <span className="sg-person__role">{p.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Footer slide={slide} tone="light" />
        </section>
      );
    case "closing":
      return <GlassClosing slide={slide} content={g} />;
  }
}
