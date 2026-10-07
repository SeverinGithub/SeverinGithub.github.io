import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
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
  const shop = useShop();
  const { products } = shop;
  const navigate = useNavigate();
  // "cart" = ganzer Warenkorb in einer Zahlung (Einmalkauf); sonst ein einzelner Plan mit Abo-Wahl.
  const isCart = planId === "cart";
  const cartLines = shop.cart.map(shop.byId).filter((p): p is NonNullable<typeof p> => Boolean(p?.planId));
  const product = isCart ? undefined : products.find((entry) => entry.planId === planId || entry.sub?.planId === planId);
  const lines = isCart ? cartLines : product ? [product] : [];
  const planIds = isCart ? cartLines.map((p) => p.planId) : [planId];
  const total = cartLines.reduce((sum, p) => sum + p.price, 0);
  const isSub = Boolean(product?.sub && product.sub.planId === planId);
  const choose = (id: string) => { if (id !== planId) navigate({ to: "/checkout/$planId", params: { planId: id }, replace: true }); };
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setReady(true);
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(PENDING_KEY, planIds.join(",")); } catch { /* ignore */ }
  }, [planIds.join(",")]);

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
          <div>
            {lines.map((p) => (
              <div className="line" key={p.id}>
                <Cover product={p} index={products.indexOf(p)} />
                <div><h4>{tx(p).title}</h4><div className="sub">EPUB + PDF</div></div>
                <div className="meta" style={{ color: "var(--ink)" }}>
                  {isSub && p.sub ? `${money(p.sub.price, p.currency)} ${t.per_month}` : money(p.price, p.currency)}
                </div>
              </div>
            ))}
            {isCart && cartLines.length > 1 ? (
              <div className="sum" style={{ paddingTop: 16, borderTop: "1px solid var(--ink)" }}>
                <span className="meta">{t.sum}</span><b>{money(total, cartLines[0].currency)}</b>
              </div>
            ) : null}
          </div>
          {product?.sub ? (
            <div className="plan-pick" role="group" aria-label={t.plan_label}>
              <button type="button" aria-pressed={!isSub} onClick={() => choose(product.planId)}>
                <span>{t.plan_once}</span><b>{money(product.price, product.currency)}</b>
              </button>
              <button type="button" aria-pressed={isSub} onClick={() => choose(product.sub!.planId)}>
                <span>{t.plan_sub}</span><b>{money(product.sub.price, product.currency)} {t.per_month}</b>
              </button>
            </div>
          ) : null}
        </div>
        <div className="co-form">
          {isCart && shop.loaded && !cartLines.length ? (
            <p className="co-loading">{t.empty}</p>
          ) : ready && returnUrl && planIds.length ? (
            <ElementsCheckout planIds={planIds} accountId={accountId} returnUrl={returnUrl} />
          ) : (
            <p className="co-loading">{t.co_loading}</p>
          )}
        </div>
      </div>
    </section>
  );
}
