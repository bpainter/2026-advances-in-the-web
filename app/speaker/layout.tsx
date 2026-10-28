import type { ReactNode } from "react";
import { GlassMode } from "@/components/presenter/GlassMode";

export default function SpeakerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GlassMode />
      {children}
    </>
  );
}
