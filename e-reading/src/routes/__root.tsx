import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { SiteFooter } from "#/components/footer";
import { SiteHeader } from "#/components/header";
import { Panels } from "#/components/panels";
import { FALLBACK_BRAND } from "#/lib/brand";
import { LangProvider } from "#/lib/i18n";
import { loadStoreBrand, loadStoreCatalog } from "#/lib/server-fns";
import { BrandProvider, ShopProvider } from "#/lib/store";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: async () => {
    const [brand, products] = await Promise.all([loadStoreBrand(), loadStoreCatalog()]);
    return { brand, products };
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: loaderData?.brand.title ?? FALLBACK_BRAND.title },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;900&family=IBM+Plex+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { brand, products } = Route.useLoaderData();
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <LangProvider>
          <BrandProvider brand={brand}>
            <ShopProvider products={products}>
              <SiteHeader />
              <main id="top">{children}</main>
              <SiteFooter />
              <Panels />
            </ShopProvider>
          </BrandProvider>
        </LangProvider>
        <Scripts />
      </body>
    </html>
  );
}
