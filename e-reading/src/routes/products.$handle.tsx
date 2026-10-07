import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { Cover, categoryName } from "#/components/cover";
import { Dot } from "#/components/dot";
import { ExpressCheckout } from "#/components/express-checkout";
import { Spec } from "#/components/panels";
import { useT } from "#/lib/i18n";
import { loadStoreProduct } from "#/lib/server-fns";
import { useMoney, useShop } from "#/lib/store";

export const Route = createFileRoute("/products/$handle")({
  loader: async ({ params }) => {
    const product = await loadStoreProduct({ data: params.handle });
    if (!product) throw notFound();
    return product;
  },
  component: ProductPage,
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.title ?? "Product" }],
  }),
});

function ProductPage() {
  const product = Route.useLoaderData();
  const t = useT();
  const money = useMoney();
  const shop = useShop();
  const index = Math.max(0, shop.products.findIndex((p) => p.id === product.id));
  const has = shop.inCart(product.id);

  return (
    <section className="wrap page" aria-labelledby="prod-title">
      <div className="sec-head" style={{ paddingTop: 0, marginBottom: 28 }}>
        <Link className="meta" to="/" hash="katalog">← {t.back}</Link>
        <span className="meta" style={{ color: "var(--grey)" }}>{String(index + 1).padStart(2, "0")} · {categoryName(t, product.collection)}</span>
      </div>
      <div className="feature" style={{ marginTop: 0 }}>
        <Cover product={product} index={index} />
        <div className="feature-body">
          <h1 id="prod-title" className="prod-h">{product.title}<Dot /></h1>
          <p>{product.description}</p>
          <Spec category={product.collection} price={money(product.price, product.currency)} />
          {product.planId ? (
            <div className="buy-box">
              <div className="hero-actions">
                <Link className="btn btn-accent" to="/checkout/$planId" params={{ planId: product.planId }}>{t.buy_now}</Link>
                <button className="btn" type="button" onClick={() => (has ? shop.openCart() : shop.add(product.id))}>{has ? t.to_cart : t.add}</button>
              </div>
              <ExpressCheckout planId={product.planId} theme="light" />
            </div>
          ) : (
            <p className="note">{t.unavailable}</p>
          )}
        </div>
      </div>
    </section>
  );
}
