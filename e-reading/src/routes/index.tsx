import { Link, createFileRoute } from "@tanstack/react-router";

import { ExpressCheckout } from "#/components/express-checkout";
import { ProductCover } from "#/components/product-cover";

import { money } from "#/lib/money";
import { loadStoreCatalog } from "#/lib/server-fns";

export const Route = createFileRoute("/")({
  loader: async () => ({ products: await loadStoreCatalog() }),
  component: Home,
});

function Home() {
  const { products } = Route.useLoaderData();
  const books = products.filter((p) => p.collection === "books");
  const magazines = products.filter((p) => p.collection === "magazines");

  return (
    <div>
      <section className="grid border-b border-[#1a1916]/15 md:grid-cols-2">
        <img src="/hero.jpg" alt="Tablet mit E-Book" className="h-full max-h-[70vh] w-full object-cover" />
        <div className="flex flex-col items-start justify-center gap-6 px-8 py-16">
          <p className="text-xs uppercase tracking-[0.2em]">Independent titles</p>
          <h1 className="text-5xl tracking-tight md:text-6xl">A press for printed matter.</h1>
          <Link to="/shop" className="border border-[#1a1916] px-6 py-3 text-sm">
            Shop books
          </Link>
        </div>
      </section>

      <section className="px-4 py-16 md:px-10">
        <h2 className="mb-8 text-3xl">Books</h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {books.map((product) => (
            <div key={product.handle}>
              <Link to="/products/$handle" params={{ handle: product.handle }}>
                <ProductCover src={product.image} alt={product.title} className="mb-3 shadow-sm" />
                <p className="text-sm">{product.title}</p>
                <p className="text-sm text-[#1a1916]/55">{money(product.price, product.currency)}</p>
              </Link>
              {product.planId ? <ExpressCheckout planId={product.planId} theme="light" /> : null}
            </div>
          ))}
        </div>
      </section>

      {magazines.length > 0 ? (
        <section className="px-4 pb-16 md:px-10">
          <h2 className="mb-8 text-3xl">Magazines</h2>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {magazines.map((product) => (
              <div key={product.handle}>
                <Link to="/products/$handle" params={{ handle: product.handle }}>
                  <ProductCover src={product.image} alt={product.title} className="mb-3 shadow-sm" />
                  <p className="text-sm">{product.title}</p>
                  <p className="text-sm text-[#1a1916]/55">{money(product.price, product.currency)}</p>
                </Link>
                {product.planId ? <ExpressCheckout planId={product.planId} theme="light" /> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
