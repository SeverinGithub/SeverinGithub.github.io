import type { Product } from "#/lib/catalog";
import { useT } from "#/lib/i18n";
import { useMoney, useShop } from "#/lib/store";

/* Einmalig / Abo je Titel im Warenkorb. Ohne Abo-Variante in Whop wird nichts angezeigt. */
export function PlanToggle({ product }: { product: Product }) {
  const t = useT();
  const money = useMoney();
  const shop = useShop();
  if (!product.sub) return null;
  const kind = shop.kindOf(product.id);
  return (
    <div className="plan-mini" role="group" aria-label={t.plan_label}>
      <button type="button" aria-pressed={kind === "once"} onClick={() => shop.setKind(product.id, "once")}>
        {t.plan_once} · {money(product.price, product.currency)}
      </button>
      <button type="button" aria-pressed={kind === "sub"} onClick={() => shop.setKind(product.id, "sub")}>
        {t.plan_sub} · {money(product.sub.price, product.currency)} {t.per_month}
      </button>
    </div>
  );
}

/* Preis eines Warenkorb-Titels nach gewählter Kaufart. */
export function useLinePrice() {
  const t = useT();
  const money = useMoney();
  const shop = useShop();
  return (p: Product) =>
    shop.kindOf(p.id) === "sub" && p.sub ? `${money(p.sub.price, p.currency)} ${t.per_month}` : money(p.price, p.currency);
}

/* Summen getrennt nach Einmalkauf und Abo. */
export function useCartTotals(lines: Product[]) {
  const shop = useShop();
  let once = 0;
  let sub = 0;
  for (const p of lines) {
    if (shop.kindOf(p.id) === "sub" && p.sub) sub += p.sub.price;
    else once += p.price;
  }
  return { once, sub, currency: lines[0]?.currency ?? "EUR" };
}

/* Summenblock: einmalige Summe und/oder monatliche Abo-Summe, plus MwSt.-Hinweis (Whop rechnet MwSt. zusätzlich). */
export function CartSums({ lines }: { lines: Product[] }) {
  const t = useT();
  const money = useMoney();
  const { once, sub, currency } = useCartTotals(lines);
  return (
    <>
      {once || !sub ? <div className="sum"><span className="meta">{t.sum}</span><b>{money(once, currency)}</b></div> : null}
      {sub ? (
        <div className={`sum${once ? " sum-sub" : ""}`}>
          <span className="meta">{once ? t.plan_sub : t.sum}</span><b>{money(sub, currency)} {t.per_month}</b>
        </div>
      ) : null}
      <p className="note">{t.vat_note}</p>
    </>
  );
}
