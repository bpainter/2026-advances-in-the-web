import "server-only";
import { BASE_CSS } from "./common";
import type { WrapperDef } from "./types";

/**
 * F2 `storefront-product` (spec 4.8). Both F2 apps render this wrapper themselves
 * (`components/storefront-shell.tsx`): a staff preview strip with the demo controls, the
 * storefront header, the shown product page and the request log docked as a drawer on dark glass.
 * This entry carries what the validator needs: the banned list and the stylesheets that
 * `pnpm theme:sync` copies into both apps. The layout never fetches, caches or revalidates.
 */
export const storefrontProduct: WrapperDef = {
  id: "storefront-product",
  banned: [
    { name: "fetch", pattern: /\bfetch\(/ },
    { name: "a cache directive", pattern: /use cache|cacheLife|cacheTag|unstable_cache/ },
    { name: "revalidate", pattern: /revalidate/ },
  ],
  render: () => ({ before: "", after: "", styles: [BASE_CSS, "/wrappers/storefront-product.css"], scripts: [] }),
};
