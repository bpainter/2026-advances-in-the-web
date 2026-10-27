import Link from "next/link";
import { slides } from "@/lib/content";

/** 404: lists each section's first slide. No redirect to `/` (PRD 3). */
export default function NotFound() {
  const firstBySection = slides.filter((s, i) => slides.findIndex((x) => x.section === s.section) === i);
  return (
    <main className="not-found">
      <h1 className="not-found__title">That slide does not exist</h1>
      <ul className="not-found__list">
        {firstBySection.map((s) => (
          <li key={s.id}>
            <Link href={`/s/${s.id}`}>
              {s.section}: {s.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
