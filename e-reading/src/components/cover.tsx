import type { Product } from "#/lib/catalog";
import { useT } from "#/lib/i18n";
import { useText } from "#/lib/product-text";

/* Swiss-Cover: echtes Coverbild, wenn Whop eins liefert – sonst Fläche + Geometrie, Titel unten links. */
const SKINS = [
  ["c-ink", "g-bars"], ["c-accent", "g-grid"], ["c-white", "g-circle"], ["c-stone", "g-square"],
  ["c-white", "g-half"], ["c-ink", "g-line"], ["c-stone", "g-tri"], ["c-accent", "g-circle"],
] as const;

export function categoryName(t: ReturnType<typeof useT>, slug: string) {
  return t.cats[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function Cover({ product, index, className = "" }: { product: Product; index: number; className?: string }) {
  const t = useT();
  const tx = useText();
  const no = String(index + 1).padStart(2, "0");
  if (product.image) {
    return (
      <div className={`cover c-photo ${className}`} aria-hidden="true">
        <img src={product.image} alt="" loading="lazy" />
      </div>
    );
  }
  const [skin, geo] = SKINS[index % SKINS.length];
  return (
    <div className={`cover ${skin} ${className}`} aria-hidden="true">
      <span className="no"><span>{no}</span><span>{categoryName(t, product.collection)}</span></span>
      {geo === "g-bars" ? <span className="g g-bars"><i /><i /><i /></span> : <span className={`g ${geo}`} />}
      <span className="t">{tx(product).title}</span>
    </div>
  );
}
