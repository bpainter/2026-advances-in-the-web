import type { Slide } from "@/content/schema";
import type { Mode } from "@/lib/mode";
import { ContentSlide } from "@/components/layouts/ContentSlide";
import { DemoSplitSlide } from "@/components/layouts/DemoSplitSlide";
import { TitleSlide } from "@/components/layouts/TitleSlide";
import { StatementSlide } from "@/components/layouts/StatementSlide";
import { StatSlide } from "@/components/layouts/StatSlide";
import { ComparisonSlide } from "@/components/layouts/ComparisonSlide";
import { QuoteSlide } from "@/components/layouts/QuoteSlide";
import { TimelineSlide } from "@/components/layouts/TimelineSlide";
import { TableSlide } from "@/components/layouts/TableSlide";
import { ChartSlide } from "@/components/layouts/ChartSlide";
import { FrameworkGridSlide } from "@/components/layouts/FrameworkGridSlide";
import { DemoGridSlide } from "@/components/layouts/DemoGridSlide";
import { TerminalSlide } from "@/components/layouts/TerminalSlide";
import { ImageLedSlide } from "@/components/layouts/ImageLedSlide";
import { SectionSlide } from "@/components/layouts/SectionSlide";
import { CloseSlide } from "@/components/layouts/CloseSlide";
import { DesignedSlide } from "@/components/layouts/DesignedSlide";

interface Props {
  slide: Slide;
  total: number;
  mode: Mode;
}

/** Picks the layout component from `slide.layout`; a new Layout value is a type error until handled. */
export function SlideRouter(props: Props) {
  switch (props.slide.layout) {
    case "title":
      return <TitleSlide {...props} />;
    case "statement":
      return <StatementSlide {...props} />;
    case "stat":
      return <StatSlide {...props} />;
    case "comparison":
      return <ComparisonSlide {...props} />;
    case "quote":
      return <QuoteSlide {...props} />;
    case "list":
      return <ContentSlide {...props} />;
    case "timeline":
      return <TimelineSlide {...props} />;
    case "table":
      return <TableSlide {...props} />;
    case "chart":
      return <ChartSlide {...props} />;
    case "framework-grid":
      return <FrameworkGridSlide {...props} />;
    case "demo-split":
      return <DemoSplitSlide {...props} />;
    case "demo-grid":
      return <DemoGridSlide {...props} />;
    case "terminal":
      return <TerminalSlide {...props} />;
    case "image-led":
      return <ImageLedSlide {...props} />;
    case "section":
      return <SectionSlide {...props} />;
    case "close":
      return <CloseSlide {...props} />;
    case "designed":
      return <DesignedSlide {...props} />;
    default: {
      const exhaustive: never = props.slide.layout;
      throw new Error(`Unhandled layout ${String(exhaustive)}`);
    }
  }
}
