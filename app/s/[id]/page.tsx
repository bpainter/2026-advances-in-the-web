import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { bySlideId, slideIdByNumber, slides, deck } from "@/lib/content";
import { SlidePage } from "@/components/stage/SlidePage";

interface Params {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return slides.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const slide = bySlideId(id);
  return { title: slide ? `${slide.title} · ${deck.title}` : deck.title };
}

export default async function SlideRoute({ params }: Params) {
  const { id } = await params;
  // `/s/12` redirects to the id of slide 12 (PRD 3).
  if (/^\d+$/.test(id)) {
    const target = slideIdByNumber(Number.parseInt(id, 10));
    if (target) redirect(`/s/${target}`);
    notFound();
  }
  const slide = bySlideId(id);
  if (!slide) notFound();
  return <SlidePage slide={slide} mode="reader" />;
}
