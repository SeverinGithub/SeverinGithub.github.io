import { WhopExpressCheckoutButton } from "@whop/checkout/react";
import { useEffect, useMemo, useState } from "react";

type ExpressCheckoutProps = {
  planId: string;
  theme: "light" | "dark";
};

export function ExpressCheckout({ planId, theme }: ExpressCheckoutProps) {
  const [origin, setOrigin] = useState("");
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const returnUrl = useMemo(() => (origin ? `${origin}/order-complete` : undefined), [origin]);

  if (!returnUrl || hidden) return null;

  return (
    <div className="mt-3 w-full">
      <WhopExpressCheckoutButton
        planId={planId}
        theme={theme}
        returnUrl={returnUrl}
        onComplete={() => {
          window.location.assign(returnUrl);
        }}
        onExpressMethodResolved={({ rendered }) => {
          if (rendered === "none") setHidden(true);
        }}
      />
    </div>
  );
}
