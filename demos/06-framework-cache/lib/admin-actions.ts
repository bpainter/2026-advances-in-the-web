"use server";

import { saveProductCopy } from "./actions";

/**
 * The admin bar's form action (presenter chrome). It forwards to the shown `saveProductCopy`
 * Server Action, which writes the copy and calls `updateTag`, so the same code runs whether the
 * form is submitted by the presenter runtime (natively, before hydration) or by hand.
 */
export async function saveCopyForm(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const copy = String(formData.get("copy") ?? "").trim();
  if (!id || !copy) return;
  await saveProductCopy(id, copy);
}
