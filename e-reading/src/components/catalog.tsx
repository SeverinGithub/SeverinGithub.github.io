import { useState } from "react";

import { Cover, categoryName } from "#/components/cover";
import { CATEGORIES, type Category } from "#/lib/catalog";
import { useT } from "#/lib/i18n";
import { useMoney, useShop } from "#/lib/store";
import { useText } from "#/lib/product-text";

export function Catalog() {
  const t = useT();
  const money = useMoney();
  const shop = useShop();
  const tx = useText();
  const [active, setActive] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = shop.products.filter((p) =>
    (active === "all" || p.collection === active) &&
    (!q || `${tx(p).title} ${p.title}`.toLowerCase().includes(q)));
  const countOf = (c: Category) => shop.products.filter((p) => p.collection === c).length;

  return (
    <section className="wrap section" id="katalog" aria-labelledby="kat-title">
      <div className="rule" />
      <div className="sec-head">
        <h2 className="meta" id="kat-title">{t.kat} <span style={{ color: "var(--grey)" }}>{t.count(shop.products.length)}</span></h2>
        <input className="search" type="search" placeholder={t.search} aria-label={t.search} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <h3 className="meta cats-label">{t.browse}</h3>
      <ul className="cats" role="group" aria-label={t.filter_label}>
        {CATEGORIES.map((c, i) => {
          const n = countOf(c);
          return (
            <li key={c}>
              <button type="button" className="cat" aria-pressed={c === active} onClick={() => setActive(c === active ? "all" : c)}>
                <span className="meta cat-top"><span>{String(i + 1).padStart(2, "0")}</span><span>{n ? t.count(n).replace("· ", "") : t.soon}</span></span>
                <span className="cat-name">{categoryName(t, c)}</span>
                <span className="cat-blurb">{t.cat_blurbs[c]}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sec-head list-head">
        <h3 className="meta">{active === "all" ? t.all_titles : categoryName(t, active)} <span style={{ color: "var(--grey)" }}>{t.count(list.length)}</span></h3>
        {active !== "all" ? <button type="button" className="chip meta" onClick={() => setActive("all")}>{t.show_all}</button> : null}
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
        }) : <li className="empty">{active !== "all" && !q ? `${categoryName(t, active)} · ${t.soon}` : t.none}</li>}
      </ul>
    </section>
  );
}
