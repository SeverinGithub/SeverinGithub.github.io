import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { ElementsCheckout } from "#/components/elements-checkout";
import { money } from "#/lib/money";
import { loadStoreAccountId, loadStoreBrand, loadStoreCatalog } from "#/lib/server-fns";

export const Route = createFileRoute("/checkout/$planId")({
  loader: async () => ({ products: await loadStoreCatalog(), brand: await loadStoreBrand(), accountId: await loadStoreAccountId() }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { planId } = Route.useParams();
  const { products, brand, accountId } = Route.useLoaderData();
  const product = products.find((entry) => entry.planId === planId);
  const [ready, setReady] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setReady(true);
    setOrigin(window.location.origin);
  }, []);

  const returnUrl = useMemo(() => (origin ? `${origin}/order-complete` : undefined), [origin]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <p className="font-medium">{brand.title}</p>
        <Link to="/shop" className="text-sm underline">Continue shopping</Link>
      </div>
      <h1 className="mt-10 text-3xl">Checkout</h1>
      <p className="mt-2 text-[#1a1916]/60">
        {product ? `${product.title} · ${money(product.price, product.currency)}` : "Complete your order"}
      </p>
      <div className="mt-8 border border-[#1a1916] bg-white p-4 sm:p-6">
        {ready && returnUrl ? (
          <ElementsCheckout planId={planId} accountId={accountId} returnUrl={returnUrl} />
        ) : (
          <p className="py-16 text-center text-sm text-[#1a1916]/50">Loading checkout…</p>
        )}
      </div>
    </div>
  );
}
