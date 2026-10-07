import { Link, createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/order-complete")({
  component: OrderComplete,
});

function OrderComplete() {
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="text-4xl">Thank you</h1>
      <p className="mt-4 text-[#1a1916]/60">Your order is in. We’ll be in touch.</p>
      <Link to="/shop" className="mt-8 inline-block underline">Continue shopping</Link>
    </div>
  );
}
