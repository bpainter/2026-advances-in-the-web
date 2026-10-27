import { Suspense } from "react";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { PRODUCT_ID } from "@/lib/origins";
import { AdminBarForm } from "./admin-bar-form";

/**
 * The in-demo admin bar (presenter chrome): switch user and region (cookies), edit the product
 * copy and fire the tag invalidation through the shown Server Action, reset, reload. It reads the
 * cookies at request time, so it streams inside its own Suspense boundary.
 */
export function AdminBar() {
  return (
    <Suspense fallback={<div className="admin admin--pending" aria-hidden="true" />}>
      <Current />
    </Suspense>
  );
}

async function Current() {
  const jar = await cookies();
  const product = await db.products.find(PRODUCT_ID);
  return (
    <AdminBarForm
      id={PRODUCT_ID}
      user={jar.get("user")?.value ?? "agent-1"}
      region={jar.get("region")?.value ?? "us"}
      copy={product.copy}
    />
  );
}
