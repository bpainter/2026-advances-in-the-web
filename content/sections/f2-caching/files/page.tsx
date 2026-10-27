import { Suspense } from 'react';
import { getCatalogProduct } from
  '@/lib/catalog';
import { getInventory } from
  '@/lib/inventory';

export async function
generateStaticParams() {
  return [{ id: 'ridgeline-trail' }];
}

export default async function Page({
  params,
}: PageProps<'/products/[id]'>) {
  const { id } = await params;
  const product =
    await getCatalogProduct(id);
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.copy}</p>
      <Suspense
        fallback={<p>Checking stock</p>}
      >
        <Stock id={id} />
      </Suspense>
    </article>
  );
}

async function Stock(
  { id }: { id: string },
) {
  const stock = await getInventory(id);
  return (
    <p className="stock">{stock.label}</p>
  );
}
