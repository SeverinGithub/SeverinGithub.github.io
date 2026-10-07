import { useBrand } from "#/lib/store";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const brand = useBrand();
  return (
    <div>
      <img src="/hero.jpg" alt="" className="max-h-[60vh] w-full object-cover" />
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-4xl">About {brand.title}</h1>
        <p className="mt-6 text-[#1a1916]/65">
          A press for books, magazines, and printed matter.
        </p>
      </div>
    </div>
  );
}
