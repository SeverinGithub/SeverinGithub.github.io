import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { FALLBACK_BRAND, type Brand } from "#/lib/brand";
import type { Product } from "#/lib/catalog";
import { storage, useLang, useT } from "#/lib/i18n";
import { localize } from "#/lib/product-text";

const BrandContext = createContext<Brand>(FALLBACK_BRAND);

export function BrandProvider({ brand, children }: { brand: Brand; children: React.ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  return useContext(BrandContext);
}

/* Katalog, Warenkorb, Panels und Toast – einmal im Root, überall nutzbar. */
type Panel = "cart" | "detail" | null;
type ShopState = {
  products: Product[];
  byId: (id: string) => Product | undefined;
  cart: string[];
  loaded: boolean;
  inCart: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  removeMany: (ids: string[]) => void;
  /* Kaufart je Titel im Warenkorb: einmalig (Standard) oder Abo. */
  kindOf: (id: string) => PlanKind;
  setKind: (id: string, kind: PlanKind) => void;
  planOf: (p: Product) => string;
  panel: Panel;
  detailId: string | null;
  openCart: () => void;
  openDetail: (id: string) => void;
  close: () => void;
  toast: string;
};

export type PlanKind = "once" | "sub";
const ShopContext = createContext<ShopState | null>(null);
const CART_KEY = "cart3";
const KINDS_KEY = "cart-kinds";

export function ShopProvider({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const { t, lang } = useLang();
  const [cart, setCart] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [kinds, setKinds] = useState<Record<string, PlanKind>>({});
  const [panel, setPanel] = useState<Panel>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastFocus = useRef<HTMLElement | null>(null);

  const byId = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  useEffect(() => {
    try {
      const raw = JSON.parse(storage.get(CART_KEY) || "[]");
      if (Array.isArray(raw)) setCart(raw.filter((id) => typeof id === "string" && byId(id)));
      const k = JSON.parse(storage.get(KINDS_KEY) || "{}");
      if (k && typeof k === "object") setKinds(k);
    } catch { /* ignore */ }
    setLoaded(true);
  }, [byId]);

  const persist = (next: string[]) => {
    setCart(next);
    storage.set(CART_KEY, JSON.stringify(next));
  };

  const toast = (msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 2400);
  };

  const remember = () => {
    if (!panel) lastFocus.current = document.activeElement as HTMLElement | null;
  };

  const value: ShopState = {
    products,
    byId,
    cart,
    loaded,
    inCart: (id) => cart.includes(id),
    add: (id) => {
      const p = byId(id);
      if (!p) return;
      if (cart.includes(id)) return toast(t.dupe);
      persist([...cart, id]);
      toast(t.added(localize(p, lang).title));
    },
    remove: (id) => persist(cart.filter((x) => x !== id)),
    removeMany: (ids) => persist(cart.filter((x) => !ids.includes(x))),
    kindOf: (id) => (kinds[id] === "sub" && byId(id)?.sub ? "sub" : "once"),
    setKind: (id, kind) => setKinds((prev) => {
      const next = { ...prev, [id]: kind };
      storage.set(KINDS_KEY, JSON.stringify(next));
      return next;
    }),
    planOf: (p) => (kinds[p.id] === "sub" && p.sub ? p.sub.planId : p.planId),
    panel,
    detailId,
    openCart: () => { remember(); setPanel("cart"); },
    openDetail: (id) => { remember(); setDetailId(id); setPanel("detail"); },
    close: () => { setPanel(null); setDetailId(null); lastFocus.current?.focus(); },
    toast: toastMsg,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop outside ShopProvider");
  return ctx;
}

/* Merkt sich den Plan, der gerade bezahlt wird, damit er nach dem Kauf aus dem Warenkorb fällt. */
export const PENDING_KEY = "pending-plan";

export function useMoney() {
  const t = useT();
  return useMemo(
    () => (amount: number, currency = "USD") => {
      try {
        return new Intl.NumberFormat(t.locale, { style: "currency", currency }).format(amount);
      } catch {
        return `${amount} ${currency}`;
      }
    },
    [t.locale],
  );
}
