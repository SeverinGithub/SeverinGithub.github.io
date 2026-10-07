import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { Dot } from "#/components/dot";
import { useT } from "#/lib/i18n";
import { PENDING_KEY, useShop } from "#/lib/store";

export const Route = createFileRoute("/order-complete")({
  component: OrderComplete,
});

function OrderComplete() {
  const t = useT();
  const shop = useShop();

  useEffect(() => {
    if (!shop.loaded) return;
    try {
      const plan = sessionStorage.getItem(PENDING_KEY);
      const bought = shop.products.find((p) => p.planId === plan);
      if (bought && shop.inCart(bought.id)) shop.remove(bought.id);
      sessionStorage.removeItem(PENDING_KEY);
    } catch { /* ignore */ }
  }, [shop]);

  return (
    <section className="wrap page">
      <div className="rule" />
      <div className="news">
        <h1 className="big-h">{t.done_h}<Dot /></h1>
        <div className="done-side">
          <p>{t.done_p}</p>
          <Link className="btn" to="/" hash="katalog">{t.back}</Link>
        </div>
      </div>
    </section>
  );
}
