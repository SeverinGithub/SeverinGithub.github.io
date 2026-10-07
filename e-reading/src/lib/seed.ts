import type { Product } from "#/lib/catalog";

function p(
  handle: string,
  title: string,
  description: string,
  price: number,
  collection: string,
  image: string,
  planId: string,
): Product {
  return {
    id: `local_${handle}`,
    handle,
    title,
    description,
    price,
    currency: "USD",
    image,
    collection,
    planId,
  };
}

export const seedProducts: Product[] = [
  p(
    "der-disziplin-reset-wie-du-gewohnheiten-aufbaust-die-wirklich-bleiben",
    "Der Disziplin-Reset: Wie du Gewohnheiten aufbaust, die wirklich bleiben",
    "Dir fehlt nicht die Disziplin, sondern ein System, das auch an schlechten Tagen funktioniert.",
    4.99,
    "books",
    "/products/der-disziplin-reset.png",
    "plan_LrMXCNxUIVPNp",
  ),
];
