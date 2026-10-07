import { useState } from "react";

import { Cover, categoryName } from "#/components/cover";
import { useT } from "#/lib/i18n";
import { useMoney, useShop } from "#/lib/store";
import { useText } from "#/lib/product-text";

export function Catalog() {
  const t = useT();
  const money = useMoney();
  const shop = useShop();
  const tx = useText();
  const [active, setActive] = useState("all");
  const cats = ["all", ...new Set(shop.products.map((p) => p.collection))];
  const list = shop.products.filter((p) => active === "all" || p.collection === active);

  return (
    <section className="wrap section" id="katalog" aria-labelledby="kat-title">
      <div className="rule" />
      <div className="sec-head">
        <h2 className="meta" id="kat-title">{t.kat} <span style={{ color: "var(--grey)" }}>{t.count(list.length)}</span></h2>
        {cats.length > 2 ? (
          <div className="filters meta" role="group" aria-label={t.filter_label}>
            {cats.map((c) => (
              <button key={c} type="button" className="chip meta" aria-pressed={c === active} onClick={() => setActive(c)}>
                {c === "all" ? t.all : categoryName(t, c)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <ul className="books">
        {list.length ? list.map((p) => {
          const has = shop.inCart(p.id);
          return (
            <li className="book" key={p.id}>
              <button type="button" className="book-open" aria-label={`${tx(p).title} – ${t.details}`} onClick={() => shop.openDetail(p.id)}>
                <Cover product={p} index={shop.products.indexOf(p)} />
                <h3>{tx(p).title}</h3>
                <span className="row"><span>{categoryName(t, p.collection)}</span><span className="price">{money(p.price, p.currency)}</span></span>
              </button>
              <button type="button" className={`add${has ? " in" : ""}`} onClick={() => shop.add(p.id)}>
                {has ? t.in_cart : t.add}<span aria-hidden="true">{has ? "✓" : "+"}</span>
              </button>
            </li>
          );
        }) : <li className="empty">{t.none}</li>}
      </ul>
    </section>
  );
}
