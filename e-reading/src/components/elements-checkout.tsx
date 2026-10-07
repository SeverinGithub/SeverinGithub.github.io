import { useEffect, useRef, useState } from "react";

import { useLang } from "#/lib/i18n";
import { confirmCheckoutSession, createCheckoutSession } from "#/lib/server-fns";

const ELEMENTS_SRC = "https://js.whop.cloud/elements/amber/elements.js";
const ENVIRONMENT = "production";

type ElementsCheckoutProps = {
  planIds: string[];
  accountId?: string;
  returnUrl: string;
};

type EmailValue = {
  email: string;
  complete: boolean;
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.getAttribute("data-loaded") === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(src)));
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-whop-elements", "");
    script.addEventListener("load", () => {
      script.setAttribute("data-loaded", "true");
      resolve();
    });
    script.addEventListener("error", () => reject(new Error(src)));
    document.head.append(script);
  });
}

export function ElementsCheckout({ planIds, accountId, returnUrl }: ElementsCheckoutProps) {
  const { t, lang } = useLang();
  const brandingRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const whopRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);
  const paymentElementRef = useRef<any>(null);
  const brandingElementRef = useRef<any>(null);
  const emailElementRef = useRef<any>(null);
  const sessionRef = useRef<any>(null);

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailValue, setEmailValue] = useState<EmailValue>({ email: "", complete: false });
  const [methodComplete, setMethodComplete] = useState(false);

  const items = planIds.join(",");

  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        await loadScript(ELEMENTS_SRC);
        if (destroyed) return;

        const session = await createCheckoutSession({
          data: { planIds: items.split(","), returnUrl },
        });
        if (destroyed) return;
        sessionRef.current = session;

        const amount = session.amount;
        const sellerId = session.seller_id ?? accountId;
        if (!sellerId) throw new Error("This checkout could not find a seller account.");

        const whop = (window as any).WhopElements({ environment: ENVIRONMENT });
        whopRef.current = whop;
        const payments = whop.payments.create({
          accountId: sellerId,
          currency: session.currency || "usd",
          amount,
          paymentMethodConfiguration: session.payment_method_configuration,
          checkoutSession: {
            id: session.id,
            clientSecret: session.client_secret,
          },
          returnUrl,
          appearance: { theme: { appearance: "light" } },
          locale: lang,
        });
        paymentsRef.current = payments;

        const branding = payments.create("branding");
        brandingElementRef.current = branding;
        branding.mount(brandingRef.current);

        // Zeigt alle in Whop freigeschalteten Zahlungsarten (Karte, Apple Pay, Google Pay, …).
        const payment = payments.create("payment", {
          layout: "accordion",
          onChange: (payload: { complete?: boolean }) => setMethodComplete(Boolean(payload.complete)),
          onError: (event: { message?: string }) => setError(event.message ?? "Payment methods could not load."),
        });
        paymentElementRef.current = payment;
        payment.mount(paymentRef.current);

        const emailElement = payments.create("email", {
          onChange: (payload: EmailValue) => setEmailValue(payload),
          onError: (event: { message?: string }) => setError(event.message ?? "Email could not load."),
        });
        emailElementRef.current = emailElement;
        emailElement.mount(emailRef.current);

        setMounted(true);
      } catch (failure) {
        if (destroyed) return;
        setError(failure instanceof Error ? failure.message : "This checkout could not be opened.");
      }
    })();

    return () => {
      destroyed = true;
      paymentElementRef.current?.destroy?.();
      brandingElementRef.current?.destroy?.();
      emailElementRef.current?.destroy?.();
      paymentsRef.current?.destroy?.();
      paymentElementRef.current = null;
      brandingElementRef.current = null;
      emailElementRef.current = null;
      paymentsRef.current = null;
      sessionRef.current = null;
      for (const slot of [paymentRef, emailRef, brandingRef]) {
        if (slot.current) slot.current.innerHTML = "";
      }
      setMounted(false);
      setMethodComplete(false);
    };
  }, [accountId, items, returnUrl, lang]);

  async function onCompletePurchase() {
    const session = sessionRef.current;
    if (!session) return;
    setSubmitting(true);
    setError(null);
    try {
      const { confirmationToken } = await paymentsRef.current.createConfirmationToken({
        billingDetails: {
          email: emailValue.email.trim(),
        },
      });

      const result = await confirmCheckoutSession({
        data: {
          sessionId: session.id,
          clientSecret: session.client_secret,
          confirmationToken,
          quotedAt: session.quoted_at,
        },
      });

      if (result.last_confirm_error) {
        throw new Error(result.last_confirm_error.message ?? "Payment could not be completed.");
      }
      if (result.next_action?.type === "complete" && result.next_action.client_secret) {
        await whopRef.current.payments.handleNextAction({
          clientSecret: result.next_action.client_secret,
          returnUrl,
        });
      }
      if (result.next_action?.type === "redirect" && result.next_action.destination_url) {
        window.location.assign(result.next_action.destination_url);
        return;
      }
      window.location.assign(returnUrl);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your payment could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  const readyToPay = mounted && emailValue.complete && methodComplete && !submitting;

  return (
    <div className="elements">
      {error ? <p className="co-error">{error}</p> : null}
      {!mounted && !error ? <p className="co-loading">{t.co_loading}</p> : null}
      <div hidden={!mounted}>
        <div className="el-slot" ref={paymentRef} />
        <p className="meta el-label">{t.co_receipt}</p>
        <div className="el-slot" ref={emailRef} />
        <button
          type="button"
          className="btn btn-accent"
          style={{ width: "100%", marginTop: 24 }}
          disabled={!readyToPay}
          onClick={onCompletePurchase}
        >
          {submitting ? t.co_working : t.co_pay}
        </button>
        <div className="el-brand" ref={brandingRef} />
      </div>
    </div>
  );
}
