import { Link } from "@tanstack/react-router";

import { LANGS, NATIVE, useLang } from "#/lib/i18n";
import { useBrand, useShop } from "#/lib/store";

export function SiteHeader() {
  const brand = useBrand();
  const { t, lang, setLang } = useLang();
  const { cart, openCart } = useShop();
  return (
    <header className="site-header">
      <div className="wrap head">
        <Link className="logo" to="/">{brand.title}<span className="dot">.</span></Link>
        <nav aria-label={t.nav_label}>
          <ul className="meta">
            <li><Link to="/" hash="katalog">{t.nav_catalog}</Link></li>
            <li className="hide-s"><Link to="/" hash="sprachen">{t.nav_langs}</Link></li>
            <li className="hide-s"><Link to="/" hash="faq">{t.nav_faq}</Link></li>
            <li>
              <button className={`cart-btn meta${cart.length ? " has" : ""}`} type="button" aria-haspopup="dialog" onClick={openCart}>
                <span>{t.nav_cart}</span> <span className="n">{cart.length}</span>
              </button>
            </li>
            <li>
              <div className="lang-switch meta" role="group" aria-label={t.lang_label}>
                {LANGS.map((l) => (
                  <button key={l} type="button" lang={l} aria-pressed={l === lang} aria-label={NATIVE[l]} onClick={() => setLang(l)}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        </nav>
      </div>
      <div className="wrap"><div className="rule" /></div>
    </header>
  );
}
