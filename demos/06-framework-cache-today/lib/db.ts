import seed from "@/fixtures/products.json";
import { RESET_SUFFIX } from "./origins";

/**
 * A seeded in-memory database (fixtures/products.json): products, a per-region inventory table
 * and per-user reservations. No network. State lives on globalThis so every route and HMR reload
 * sees the same rows; `db.reset()` reseeds it.
 */
export interface Product {
  id: string;
  name: string;
  copy: string;
  price: number;
}

export interface Stock {
  id: string;
  region: string;
  user: string;
  quantity: number;
  reserved: number;
  label: string;
}

interface State {
  products: Map<string, Product>;
}

const g = globalThis as typeof globalThis & { __f2Db?: State };
const state: State = (g.__f2Db ??= { products: seedProducts() });

function seedProducts(): Map<string, Product> {
  return new Map(seed.products.map((p) => [p.id, { ...p }]));
}

/** `<id>--reset` is the reset reload (lib/origins.ts); it reads the same seeded product. */
function canonical(id: string): string {
  return id.endsWith(RESET_SUFFIX) ? id.slice(0, -RESET_SUFFIX.length) : id;
}

const DEFAULT_REGION = "us";
const DEFAULT_USER = "agent-1";

export const db = {
  products: {
    async find(id: string): Promise<Product> {
      const product = state.products.get(canonical(id));
      if (!product) throw new Error(`No product ${id}`);
      return { ...product };
    },
  },
  inventory: {
    async find(
      id: string,
      opts: { region?: string; user?: string; delayMs?: number },
    ): Promise<Stock> {
      const delay = opts.delayMs ?? 0;
      if (delay > 0) await new Promise((r) => setTimeout(r, Math.min(delay, 10_000)));
      const key = canonical(id);
      const region = opts.region && opts.region in seed.inventory ? opts.region : DEFAULT_REGION;
      const user = opts.user || DEFAULT_USER;
      const table = seed.inventory[region as keyof typeof seed.inventory];
      const quantity = (table.stock as Record<string, number>)[key] ?? 0;
      const reserved =
        ((seed.reservations as Record<string, Record<string, number>>)[user] ?? {})[key] ?? 0;
      return {
        id: key,
        region,
        user,
        quantity,
        reserved,
        label: `${quantity} in stock · ${table.label} · ${reserved} reserved for ${user}`,
      };
    },
  },
  prices: {
    async find(id: string): Promise<{ id: string; amount: number; currency: string }> {
      const product = state.products.get(canonical(id));
      if (!product) throw new Error(`No product ${id}`);
      return { id: canonical(id), amount: product.price, currency: "USD" };
    },
  },
  /** Restores the seeded rows. */
  reset(): void {
    state.products = seedProducts();
  },
};
