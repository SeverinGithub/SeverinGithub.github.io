import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { Cover, categoryName } from "#/components/cover";
import { Dot } from "#/components/dot";
import { ExpressCheckout } from "#/components/express-checkout";
import { useT } from "#/lib/i18n";
import { useMoney, useShop } from "#/lib/store";

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <path d="M2 2l12 12M14 2L2 14" />
  </svg>
);

export function Spec({ category, price }: { category: string; price?: string }) {
  const t = useT();
  return (
    <dl className="spec">
      <dt>{t.sp_cat}</dt><dd>{categoryName(t, category)}</dd>
      <dt>{t.sp_fmt}</dt><dd>{t.sp_fmt_v}</dd>
      {price ? <><dt>{t.price}</dt><dd>{price}</dd></> : <><dt>{t.sp_del}</dt><dd>{t.sp_del_v}</dd></>}
    </dl>
  );
}

export function Panels() {
  const t = useT();
  const money = useMoney();
  const shop = useShop();
  const { panel, close } = shop;
  const cartClose = useRef<HTMLButtonElement>(null);
  const detailClose = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (panel === "cart") cartClose.current?.focus();
    if (panel === "detail") detailClose.current?.focus();
  }, [panel]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Escape") close(); };

  const lines = shop.cart.map(shop.byId).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const currency = lines[0]?.currency ?? "USD";
  const total = lines.reduce((s, p) => s + p.price, 0);
  const detail = shop.detailId ? shop.byId(shop.detailId) : undefined;
  const detailIndex = detail ? shop.products.indexOf(detail) : 0;

  return (
    <>
      <div className={`scrim${panel ? " on" : ""}`} onClick={close} />

      <aside className={`panel${panel === "cart" ? " on" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cartTitle" aria-hidden={panel !== "cart"} onKeyDown={onKey}>
        <div className="panel-head">
          <h2 className="meta" id="cartTitle">{t.nav_cart}</h2>
          <button ref={cartClose} className="x" type="button" aria-label={t.cart_close} onClick={close}><CloseIcon /></button>
        </div>
        <div className="panel-body">
          {lines.length ? lines.map((p) => (
            <div className="line" key={p.id}>
              <Cover product={p} index={shop.products.indexOf(p)} />
              <div>
                <h4>{p.title}</h4>
                <div className="sub">EPUB + PDF</div>
                <div className="line-actions">
                  <button className="rm" type="button" onClick={() => shop.remove(p.id)}>{t.remove}</button>
                  {lines.length > 1 && p.planId ? (
                    <Link className="rm pay" to="/checkout/$planId" params={{ planId: p.planId }} onClick={close}>{t.pay} →</Link>
                  ) : null}
                </div>
              </div>
              <div className="meta" style={{ color: "var(--ink)" }}>{money(p.price, p.currency)}</div>
            </div>
          )) : (
            <>
              <p className="empty-h">{t.empty}<Dot /></p>
              <p className="note" style={{ marginTop: 10 }}>{t.empty_p}</p>
            </>
          )}
        </div>
        <div className="panel-foot">
          <div className="sum"><span className="meta">{t.sum}</span><b>{money(total, currency)}</b></div>
          {lines.length === 1 && lines[0].planId ? (
            <Link className="btn btn-accent" style={{ width: "100%" }} to="/checkout/$planId" params={{ planId: lines[0].planId }} onClick={close}>{t.checkout}</Link>
          ) : (
            <button className="btn btn-accent" type="button" style={{ width: "100%" }} disabled>{t.checkout}</button>
          )}
          <p className="note">{lines.length > 1 ? t.checkout_multi : t.checkout_note}</p>
        </div>
      </aside>

      <aside className={`panel detail${panel === "detail" ? " on" : ""}`} role="dialog" aria-modal="true" aria-labelledby="detailTitle" aria-hidden={panel !== "detail"} onKeyDown={onKey}>
        <div className="panel-head">
          <span className="meta">{detail ? `${String(detailIndex + 1).padStart(2, "0")} · ${categoryName(t, detail.collection)}` : ""}</span>
          <button ref={detailClose} className="x" type="button" aria-label={t.detail_close} onClick={close}><CloseIcon /></button>
        </div>
        <div className="panel-body">
          {detail ? (
            <>
              <Cover product={detail} index={detailIndex} />
              <h2 id="detailTitle">{detail.title}</h2>
              <p className="desc">{detail.description}</p>
              <Spec category={detail.collection} />
            </>
          ) : null}
        </div>
        <div className="panel-foot">
          {detail ? (
            <>
              <div className="sum"><span className="meta">{t.price}</span><b>{money(detail.price, detail.currency)}</b></div>
              <button
                className="btn btn-accent"
                type="button"
                style={{ width: "100%" }}
                onClick={() => { if (!shop.inCart(detail.id)) shop.add(detail.id); shop.openCart(); }}
              >
                {shop.inCart(detail.id) ? t.to_cart : t.add}
              </button>
              {detail.planId ? <ExpressCheckout planId={detail.planId} theme="light" /> : null}
            </>
          ) : null}
        </div>
      </aside>

      <div className={`toast${shop.toast ? " on" : ""}`} role="status" aria-live="polite">{shop.toast}</div>
    </>
  );
}
