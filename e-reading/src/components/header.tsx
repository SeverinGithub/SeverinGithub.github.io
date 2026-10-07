import { Link } from "@tanstack/react-router";
import { useBrand } from "#/lib/store";

export function SiteHeader() {
  const brand = useBrand();
  return (
    <header className="border-b border-[#1a1916]/15">
      <div className="flex items-center justify-between px-4 py-5 md:px-10">
        <Link to="/" className="text-2xl tracking-tight">{brand.title}</Link>
        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/shop">Books</Link>
          <Link to="/about">About</Link>
        </nav>
        <Link to="/shop" className="text-sm">Shop</Link>
      </div>
    </header>
  );
}
