'use server';
import { updateTag } from 'next/cache';
import { db } from './db';

export async function saveProductCopy(
  id: string,
  copy: string,
) {
  await db.products.update(id, { copy });
  updateTag(`product:${id}`);
}
