/**
 * `pnpm perf <task>`: production performance measurements (docs/PRD-perf.md 9.2). Each run writes
 * docs/perf/results/<date>-<commit>-<task>.json and prints a markdown table.
 *
 *   pnpm perf load        first load, cold and warm: TTFB, FCP, LCP, CLS, hydration, frame s0, bytes, 304s
 *   pnpm perf nav         key to paint, background, still and frame s0, reader or audience
 *   pnpm perf frame       step Back replays and requests per frame mount
 *   pnpm perf walk        whole-deck bytes, requests and 304s, cold then warm (--offline for P0-5)
 *   pnpm perf headers     cache-control, x-vercel-cache and x-vercel-id per header rule, both origins
 *   pnpm perf lighthouse  desktop and mobile, performance and accessibility
 *   pnpm perf functions   traced size per route from the last build's .nft.json files
 *
 * Common options: --origin=<presenter> (default production), --demo=<demo origin>,
 * --profile=none|venue|poor. Baseline scripts and results: docs/perf/baseline/.
 */
const TASKS = ["load", "nav", "frame", "walk", "headers", "lighthouse", "functions"] as const;
type Task = (typeof TASKS)[number];

const [task, ...rest] = process.argv.slice(2);
if (!TASKS.includes(task as Task)) {
  console.log(`Usage: pnpm perf <${TASKS.join("|")}> [--origin=<url>] [--profile=none|venue|poor]`);
  process.exit(task ? 1 : 0);
}
const mod = (await import(`./${task}.mts`)) as { run: (argv: string[]) => Promise<void> };
await mod.run(rest);
