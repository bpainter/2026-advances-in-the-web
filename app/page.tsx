import { slides } from "@/lib/content";
import { SlidePage } from "@/components/stage/SlidePage";

/** `/` renders slide 1; the stage rewrites the URL to `/s/[id]` on the client (PRD 3). */
export default function HomePage() {
  const first = slides[0];
  return <SlidePage slide={first} mode="reader" canonicalPath={`/s/${first.id}`} />;
}
