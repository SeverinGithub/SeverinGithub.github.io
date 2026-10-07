import { Link } from "@tanstack/react-router";

import { useT } from "#/lib/i18n";
import { useBrand } from "#/lib/store";

export function SiteFooter() {
  const brand = useBrand();
  const t = useT();
  return (
    <footer className="wrap site-footer">
      <div className="foot meta">
        <span>© {new Date().getFullYear()} {brand.title}</span>
        <ul>
          <li><Link to="/" hash="katalog">{t.nav_catalog}</Link></li>
          <li><Link to="/about">{t.nav_about}</Link></li>
          <li><Link to="/" hash="faq">{t.nav_faq}</Link></li>
        </ul>
      </div>
    </footer>
  );
}
