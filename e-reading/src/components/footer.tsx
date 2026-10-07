import { Link } from "@tanstack/react-router";
import { useBrand } from "#/lib/store";

export function SiteFooter() {
  const brand = useBrand();
  return (
    <footer className="border-t border-[#1a1916]/15 px-4 py-10 md:px-10">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <p className="text-2xl tracking-tight">{brand.title}</p>
        <nav className="flex flex-wrap gap-6 text-sm">
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
        </nav>
        <p className="text-xs opacity-60">© {new Date().getFullYear()}, {brand.title}</p>
      </div>
    </footer>
  );
}
