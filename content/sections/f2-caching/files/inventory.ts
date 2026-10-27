import { cookies } from 'next/headers';
import { db } from './db';
import { log } from './log';

// No 'use cache': this depends on the
// signed-in user and their region.
export async function getInventory(
  id: string,
) {
  const jar = await cookies();
  const region = jar.get('region')?.value;
  const user = jar.get('user')?.value;
  log('inventory query', id, region);
  return db.inventory.find(id, {
    region,
    user,
  });
}
