import {
  cacheLife,
  cacheTag,
} from 'next/cache';
import { db } from './db';
import { log } from './log';

export async function getCatalogProduct(
  id: string,
) {
  'use cache';
  cacheLife('hours');
  cacheTag(`product:${id}`);
  log('catalog query', id);
  return db.products.find(id);
}
