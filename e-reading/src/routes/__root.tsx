import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { SiteFooter } from "#/components/footer";
import { SiteHeader } from "#/components/header";
import { FALLBACK_BRAND } from "#/lib/brand";
import { loadStoreBrand } from "#/lib/server-fns";
import { BrandProvider } from "#/lib/store";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: async () => ({ brand: await loadStoreBrand() }),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.brand.title ?? FALLBACK_BRAND.title },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { brand } = Route.useLoaderData();
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body className="min-h-screen bg-[#f4efe6] text-[#1a1916]">
        <BrandProvider brand={brand}>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </BrandProvider>
        <Scripts />
      </body>
    </html>
  );
}
