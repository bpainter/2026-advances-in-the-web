/**
 * Meta and Open Graph descriptions for the reader pages, written for someone deciding whether to
 * open a shared link. Feature intro pages are not listed: they use their section's description.
 * At most 160 characters, sentences of 15 words or fewer, the writing rules apply (lib/validate/seo.ts).
 */
export const SITE_DESCRIPTION =
  "Bermon Painter’s talk at FITC Web Unleashed 2026 in Toronto. Live demos of what browsers, frameworks and build tools shipped in 2026.";

export const pageDescriptions: Record<string, string> = {
  title: SITE_DESCRIPTION,
  "the-mandate": "Leadership says use AI. The open questions: which tools, what training, who reviews it, and who is accountable.",
  "three-reactions": "Three reactions to the AI mandate: why, how, and should we. Meet the Greybeards, the Line Toers and the New Luddites.",
  "two-perspectives": "Tim Berners-Lee’s vision of a neutral web for everyone. The W3C Strategy Team on the web in the AI era.",
  "keep-humanity": "As AI agents arrive on the web, keep people at the center of our work.",
  "open-web": "Why the open web matters as agents browse, buy and build. Interoperability, user control, durable access, accessibility, security and trust.",
  "what-we-cover": "Three parts: HTML, CSS and JavaScript. Frameworks and metaframeworks. Build tools and package managers.",

  "d1-used-to": "A cancel order confirm box built the old way. Custom modal markup, focus handling and Escape handling, all in script.",
  "d1-now": "The same cancel order flow with the dialog element. The browser handles focus, Escape and the backdrop for you.",
  "d2-used-to": "One product card in three slots, styled the old way. Viewport media queries and variant classes for every slot.",
  "d2-now": "The same product card with container queries. It adapts to the width of its slot, not the window.",
  "d3-used-to": "A support form with script that resizes its fields as you type, paste and reset.",
  "d3-now": "The same support form with field-sizing in CSS. Fields grow to fit their content with no script.",
  "d4-used-to": "An order list with a hand-written client-side router. Link clicks, Back and cancelled navigations all handled in script.",
  "d4-now": "The same order list with the Navigation API. One event handles links, filters and Back, and the links work without script.",
  "d5-used-to": "Three ways untrusted HTML can reach a product page. Finding every HTML sink by hand, before a bad review gets through.",
  "d5-now": "The same product page with Trusted Types. Report first, then enforce, so HTML only enters through your policy.",
  "d6-used-to": "A color picker built as a custom control that looks like a select. Every behavior is rebuilt in script.",
  "d6-now": "The same color picker as a real select, styled with customizable select. Swatches inside each option, and it still submits.",

  "m1-used-to": "Product hotspots on a photo, with cards placed by script. The cards must be repositioned whenever the layout changes.",
  "m1-now": "The same product hotspots with CSS anchor positioning. Cards follow their hotspot and flip when space runs out.",
  "m2-used-to": "A masonry wall of photos and quotes, positioned by script after the page loads.",
  "m2-now": "The same masonry wall with CSS Grid Lanes. Items of different heights pack into columns with no script.",
  "m3-used-to": "A product editor with its pricing tool in an iframe. The frame lets two versions of one custom element coexist.",
  "m3-now": "The same editor and pricing tool on one page. Scoped custom element registries keep each version’s definitions apart.",
  "m4-used-to": "A long article with a reading progress bar and reveals. Scroll listeners in script drive both.",
  "m4-now": "The same article with scroll-driven animations in CSS. The progress bar and reveals run with no script.",
  "m5-used-to": "A single-page store where script swaps the category and product views and animates between them.",
  "m5-now": "The same store as separate pages with real links. Cross-document view transitions animate the move between them.",

  "f2-used-to": "A Next.js product page with Cache Components turned off. The request log shows every query running on each load.",
  "f2-now": "The same Next.js page with Cache Components. Cache the catalog, stream the stock, and expire one tag on demand.",
  "f3-used-to": "Package supply chain attacks in 2025 and 2026. How a compromised release could reach your install.",
  "f3-now": "Package manager safeguards for 2026. A repository policy blocks install scripts, holds back brand-new releases, and stages publishing.",
  "f4-single": "Vite 8 and its Rolldown bundler, measured locally on one project. Build times, output size, warnings and plugins.",

  "what-changed": "Six takeaways from 2026. The browser does more, support is easier to check, and every dependency adds upkeep.",
  "people-to-follow": "People to follow for web platform features, CSS and front-end craft. Chris Coyier, Dave Rupert, Lea Verou and more.",
  closing: "Thank you from Bermon Painter, Head of DXP and Commerce at Slalom. Slides, demos and links to connect.",
};
