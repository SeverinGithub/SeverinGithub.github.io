import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { Cover } from "#/components/cover";
import { Dot } from "#/components/dot";
import { ElementsCheckout } from "#/components/elements-checkout";
import { useT } from "#/lib/i18n";
import { loadStoreAccountId } from "#/lib/server-fns";
import { PENDING_KEY, useMoney, useShop } from "#/lib/store";
import { useText } from "#/lib/product-text";

export const Route = createFileRoute("/checkout/$planId")({
  loader: async () => ({ accountId: await loadStoreAccountId() }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { planId } = Route.useParams();
  const { accountId } = Route.useLoaderData();
  const t = useT();
  const tx = useText();
  const money = useMoney();
  const { products } = useShop();
  const product = products.find((entry) => entry.planId === planId);
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setReady(true);
    setOrigin(window.location.origin);
    try { sessionStorage.setItem(PENDING_KEY, planId); } catch { /* ignore */ }
  }, [planId]);

  const returnUrl = useMemo(() => (origin ? `${origin}/order-complete` : undefined), [origin]);

  return (
    <section className="wrap page" aria-labelledby="co-title">
      <div className="sec-head" style={{ paddingTop: 0, marginBottom: 28 }}>
        <Link className="meta" to="/" hash="katalog">← {t.back}</Link>
        <span className="meta" style={{ color: "var(--grey)" }}>{t.checkout_note}</span>
      </div>
      <div className="checkout">
        <div className="co-summary">
          <h1 id="co-title" className="prod-h">{t.co_title}<Dot /></h1>
          {product ? (
            <div className="line" style={{ borderBottom: "1px solid var(--ink)" }}>
              <Cover product={product} index={products.indexOf(product)} />
              <div><h4>{tx(product).title}</h4><div className="sub">EPUB + PDF</div></div>
              <div className="meta" style={{ color: "var(--ink)" }}>{money(product.price, product.currency)}</div>
            </div>
          ) : null}
        </div>
        <div className="co-form">
          {ready && returnUrl ? (
            <ElementsCheckout planId={planId} accountId={accountId} returnUrl={returnUrl} />
          ) : (
            <p className="co-loading">{t.co_loading}</p>
          )}
        </div>
      </div>
    </section>
  );
}
