import { seoIssues } from "/Users/bermonpainter/Sites/web-unleashed-talk-2026/lib/validate/seo.ts";
import { slides } from "/Users/bermonpainter/Sites/web-unleashed-talk-2026/lib/content.ts";
import * as seo from "/Users/bermonpainter/Sites/web-unleashed-talk-2026/lib/seo.ts";
const issues = await seoIssues(process.cwd());
for (const i of issues) console.log(`${i.level === "error" ? "✖" : "!"} [${i.rule}] ${i.where}: ${i.message}`);
console.log(`${issues.filter((i) => i.level === "error").length} error(s), ${issues.filter((i) => i.level === "warning").length} warning(s)`);
if (process.argv.includes("--list")) for (const s of slides) console.log(s.index, s.id, "|", seo.slidePageTitle(s), "|", seo.slideDescription(s).length, seo.slideDescription(s));
