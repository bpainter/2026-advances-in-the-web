import type { Slide } from "@/content/schema";

export const slide: Slide = {
  id: "delete-this-quarter",
  index: 26,
  section: "delete",
  layout: "table",
  title: "Delete this quarter",
  eyebrow: "SAFE TO DELETE, WITH THE CAVEAT",
  citations: [
    {
      text: "Download counts (swap names)",
      url: "https://api.npmjs.org/downloads/point/last-week/dotenv",
    },
    {
      text: "--env-file stable",
      url: "https://nodejs.org/api/cli.html",
    },
    {
      text: "Type stripping stable 25.2 and 24.12",
      url: "https://nodejs.org/api/typescript.html",
    },
    {
      text: "--watch, Permission Model",
      url: "https://nodejs.org/api/permissions.html",
    },
    {
      text: "toSorted and with Widely Jan 2026",
      url: "https://webstatus.dev/features/array-by-copy",
    },
    {
      text: "structuredClone Widely 14 Sep 2024",
      url: "https://webstatus.dev/features/structured-clone",
    },
    {
      text: "e18e native manifest",
      url: "https://github.com/es-tooling/module-replacements/blob/main/manifests/native.json",
    },
    {
      text: "Chalk family compromise 8 Sep 2025",
      url: "https://www.stepsecurity.io/blog/20-popular-npm-packages-compromised-chalk-debug-strip-ansi-color-convert-wrap-ansi",
    },
    {
      text: "Corepack removed from Node 25",
      url: "https://nodejs.org/blog/release/v25.0.0",
    },
  ],
  speakerNotes: "This is the one deliberately dense slide in the deck, and it earns it because the audience asked for a list they can take away; read three rows, uuid, dotenv, and the polyfill, and let them photograph the rest. The urlpattern-polyfill row is the datum: a year after Baseline it still ships 11 million times a week. The chalk family, chalk at 289M, debug 431M, ansi-styles 407M, strip-ansi 313M, string-width 312M, has native replacements in util.styleText() and util.stripVTControlCharacters(), and the argument there is security rather than bytes, because those exact packages were compromised on 8 September 2025; that's the bridge to section 5. Optional 20-second terminal aside, cut first if long: node --watch --env-file=.env server.ts with a type annotation in the file and no flags for TypeScript, erasable syntax only; also, Corepack is gone from Node 25+ tarballs, so packageManager pins silently do nothing on a fresh machine.",
  timing: {
    minutes: 1.25,
    cumulative: 26,
  },
  cutPriority: 1,
  tableColumns: ["Delete", "Weekly", "Native replacement", "Safe since", "Caveat"],
  tableRows: [
    {
      cells: ["uuid", "174M", "crypto.randomUUID()", "years", "v4 only; secure context"],
    },
    {
      cells: ["node-fetch, axios", "121M, 67M", "global fetch, AbortSignal.timeout()", "Node 18+", "interceptors and upload progress need hand-rolling"],
    },
    {
      cells: ["dotenv", "112M", "node --env-file, process.loadEnvFile()", "Oct 2025", "no variable expansion or .env.local cascade"],
    },
    {
      cells: ["lodash family", "142M", "toSorted, Object.groupBy, structuredClone, Set methods, iterator helpers", "2024 to 2026 by method", "no native debounce, throttle, memoize, isEqual"],
    },
    {
      cells: ["tsx, ts-node", "60M, 25M", "Node type stripping, stable 24.12", "late 2025", "no enum, namespace, paths; no type-checking"],
    },
    {
      cells: ["nodemon", "7.4M", "node --watch", "Node 22", "no nodemon.json"],
    },
    {
      cells: ["react-textarea-autosize", "5.2M", "field-sizing: content", "Jun 2026", "Newly, not Widely"],
    },
    {
      cells: ["urlpattern-polyfill", "11.3M", "URLPattern", "Sep 2025", "11M a week a year after Baseline: nobody deletes polyfills"],
    },
  ],
};
