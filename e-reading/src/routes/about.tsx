import { createFileRoute } from "@tanstack/react-router";

import { Dot } from "#/components/dot";
import { useT } from "#/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const t = useT();
  return (
    <section className="wrap page" aria-labelledby="about-title">
      <div className="sec-head" style={{ paddingTop: 0, marginBottom: 28 }}>
        <span className="meta">{t.about_k}</span>
      </div>
      <div className="news" style={{ paddingTop: 0 }}>
        <h1 id="about-title" className="big-h">{t.about_h}<Dot /></h1>
        <div className="done-side"><p>{t.about_p}</p></div>
      </div>
      <ul className="principles section-gap">
        <li><span className="meta">A</span><h3>{t.p1h}<Dot /></h3><p>{t.p1p}</p></li>
        <li><span className="meta">B</span><h3>{t.p2h}<Dot /></h3><p>{t.p2p}</p></li>
        <li><span className="meta">C</span><h3>{t.p3h}<Dot /></h3><p>{t.p3p}</p></li>
      </ul>
    </section>
  );
}
