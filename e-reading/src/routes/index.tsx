import { Link, createFileRoute } from "@tanstack/react-router";

import { Catalog } from "#/components/catalog";
import { Cover, categoryName } from "#/components/cover";
import { Dot } from "#/components/dot";
import { Spec } from "#/components/panels";
import { LANGS, NATIVE, READ, useLang } from "#/lib/i18n";
import { useMoney, useShop } from "#/lib/store";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t, lang, setLang } = useLang();
  const money = useMoney();
  const shop = useShop();
  const featured = shop.products[0];

  return (
    <>
      <section className="wrap hero" aria-labelledby="hero-title">
        <div className="sec-head" style={{ paddingTop: 0, marginBottom: 28 }}>
          <span className="meta">{t.kicker}</span>
          <span className="meta" style={{ color: "var(--grey)" }}>EPUB · PDF · EN ES DE IT</span>
        </div>
        <div className="grid">
          <h1 id="hero-title"><span>{t.h1a}</span><span>{t.h1b}</span><span>{t.h1c}<Dot /></span></h1>
          <div className="hero-side">
            <p>{t.hero_p}</p>
            <div className="hero-actions">
              <a className="btn btn-accent" href="#katalog">{t.cta1}</a>
              <a className="btn" href="#sprachen">{t.cta2}</a>
            </div>
          </div>
        </div>
        <div className="facts">
          <ul>
            <li><b>{t.f1b}</b><span>{t.f1s}</span></li>
            <li><b>{t.f2b}</b><span>{t.f2s}</span></li>
            <li><b>{t.f3b}<Dot /></b><span>{t.f3s}</span></li>
            <li><b>{t.f4b}</b><span>{t.f4s}</span></li>
          </ul>
        </div>
      </section>

      <Catalog />

      <section className="wrap section" id="sprachen" aria-labelledby="lang-title">
        <div className="rule" />
        <div className="sec-head"><h2 className="meta" id="lang-title">{t.langs_title}</h2><span className="meta" style={{ color: "var(--grey)" }}>{t.langs_aside}</span></div>
        <div className="tongue-top">
          <h3>{t.langs_h1}<br />{t.langs_h2}<Dot /></h3>
          <div><p>{t.langs_p}</p><a className="btn btn-accent" href="#katalog">{t.langs_cta}</a></div>
        </div>
        <ul className="tongues">
          {LANGS.map((l) => (
            <li key={l}>
              <button type="button" className="tongue" aria-pressed={l === lang} aria-label={`${t.tongue_hint} ${NATIVE[l]}`} onClick={() => setLang(l)}>
                <span className="code"><span>{l.toUpperCase()}</span><span>{t.names[l]}</span></span>
                <span className="w" lang={l}>{READ[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {featured ? (
        <section className="wrap section" id="titel-im-fokus" aria-labelledby="fok-title">
          <div className="rule" />
          <div className="sec-head"><h2 className="meta" id="fok-title">{t.fok}</h2><span className="meta" style={{ color: "var(--grey)" }}>{t.fok_aside}</span></div>
          <div className="feature">
            <Cover product={featured} index={0} />
            <div className="feature-body">
              <span className="meta">{categoryName(t, featured.collection)}</span>
              <h3>{featured.title}<Dot /></h3>
              <p>{featured.description}</p>
              <Spec category={featured.collection} price={money(featured.price, featured.currency)} />
              <div className="hero-actions">
                <button className="btn btn-accent" type="button" onClick={() => shop.add(featured.id)}>{t.add}</button>
                <Link className="btn" to="/products/$handle" params={{ handle: featured.handle }}>{t.details}</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="wrap section" aria-labelledby="hal-title">
        <div className="rule" />
        <div className="sec-head"><h2 className="meta" id="hal-title">{t.hal}</h2></div>
        <ul className="principles">
          <li><span className="meta">A</span><h3>{t.p1h}<Dot /></h3><p>{t.p1p}</p></li>
          <li><span className="meta">B</span><h3>{t.p2h}<Dot /></h3><p>{t.p2p}</p></li>
          <li><span className="meta">C</span><h3>{t.p3h}<Dot /></h3><p>{t.p3p}</p></li>
        </ul>
      </section>

      <section className="wrap section" id="ablauf" aria-labelledby="abl-title">
        <div className="rule" />
        <div className="sec-head"><h2 className="meta" id="abl-title">{t.abl}</h2><span className="meta" style={{ color: "var(--grey)" }}>{t.abl_aside}</span></div>
        <ol className="steps">
          <li><div><h3>{t.s1h}</h3><p>{t.s1p}</p></div></li>
          <li><div><h3>{t.s2h}</h3><p>{t.s2p}</p></div></li>
          <li><div><h3>{t.s3h}</h3><p>{t.s3p}</p></div></li>
        </ol>
      </section>

      <section className="wrap section" id="faq" aria-labelledby="faq-title">
        <div className="rule" />
        <div className="sec-head"><h2 className="meta" id="faq-title">{t.faq}</h2></div>
        <div className="faq">
          {t.qa.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><div className="ans">{a}</div></details>
          ))}
        </div>
      </section>
    </>
  );
}
