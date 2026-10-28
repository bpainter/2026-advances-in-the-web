// The shared helper every render path is
// supposed to call before it writes HTML.
// Nothing makes a path call it; code review
// is expected to notice.

import DOMPurify from "/vendor/purify.es.mjs";

export function sanitize(html) {
  return DOMPurify.sanitize(html);
}
