import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { ExpressCheckout } from "#/components/express-checkout";
import { ProductCover } from "#/components/product-cover";

import { money } from "#/lib/money";
import { loadStoreProduct } from "#/lib/server-fns";

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ params }) => {
    const product = await loadStoreProduct({ data: params.handle });
    if (!product) throw notFound();
    return product;
  },
  component: ProductPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Product"} — ` }],
  }),
});

function ProductPage() {
  const product = Route.useLoaderData();
  return (
    <div className="grid gap-10 px-4 py-12 md:grid-cols-2 md:px-10">
      <ProductCover src={product.image} alt={product.title} />
      <div>
        <h1 className="text-4xl">{product.title}</h1>
        <p className="mt-4 text-lg">{money(product.price, product.currency)}</p>
        <p className="mt-6 max-w-md text-[#1a1916]/65">{product.description}</p>
        {product.planId ? (
          <>
            <Link
              to="/checkout/$planId"
              params={{ planId: product.planId }}
              className="mt-8 inline-flex border border-[#1a1916] px-8 py-3 text-sm"
            >
              Add to cart
            </Link>
            <ExpressCheckout planId={product.planId} theme="light" />
          </>
        ) : (
          <p className="mt-8 text-sm text-[#1a1916]/50">Checkout is not available for this title.</p>
        )}
      </div>
    </div>
  );
}
