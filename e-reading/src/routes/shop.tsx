import { Link, createFileRoute } from "@tanstack/react-router";

import { ExpressCheckout } from "#/components/express-checkout";
import { ProductCover } from "#/components/product-cover";

import { COLLECTIONS } from "#/lib/catalog";
import { money } from "#/lib/money";
import { loadStoreCatalog } from "#/lib/server-fns";

type Search = { type?: string };

export const Route = createFileRoute("/shop")({
  loader: async () => ({ products: await loadStoreCatalog() }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    type: typeof search.type === "string" ? search.type : undefined,
  }),
  component: ShopPage,
});

function ShopPage() {
  const { products } = Route.useLoaderData();
  const { type } = Route.useSearch();
  const visible = type ? products.filter((p) => p.collection === type) : products;
  return (
    <div className="px-4 py-12 md:px-10">
      <h1 className="mb-8 text-4xl">Shop</h1>
      <div className="mb-10 flex flex-wrap gap-4 text-sm">
        <Link to="/shop" className={!type ? "underline" : "text-[#1a1916]/50"}>All</Link>
        {COLLECTIONS.map((col) => (
          <Link
            key={col.slug}
            to="/shop"
            search={{ type: col.slug }}
            className={type === col.slug ? "underline" : "text-[#1a1916]/50"}
          >
            {col.name}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {visible.map((product) => (
          <div key={product.handle}>
            <Link to="/products/$handle" params={{ handle: product.handle }}>
              <ProductCover src={product.image} alt={product.title} className="mb-3" />
              <p>{product.title}</p>
              <p className="text-[#1a1916]/55">{money(product.price, product.currency)}</p>
            </Link>
            {product.planId ? <ExpressCheckout planId={product.planId} theme="light" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
