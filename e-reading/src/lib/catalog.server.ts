import type { Product } from "#/lib/catalog";
import { seedProducts } from "#/lib/seed";
import { loadAccountId } from "#/lib/brand.server";
import { listAll } from "#/lib/whop.server";

const FRESH_MS = 60_000;
const JUNK = new Set([
  "default title", "storefront", "lookbook",
  "taste", "cafe", "cpg", "press", "surf", "jewelry", "beauty",
  "sip", "brew", "batch", "folio", "swell", "facet", "lumen",
]);

type RawImage = { url?: unknown } | null;
type RawPlan = {
  id?: unknown;
  title?: unknown;
  initial_price?: unknown;
  currency?: unknown;
  visibility?: unknown;
  plan_type?: unknown;
  product?: { id?: unknown } | string | null;
};
type RawProduct = {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  visibility?: unknown;
  route?: unknown;
  labels?: unknown;
  metadata?: unknown;
  banner_image?: RawImage;
  gallery_images?: RawImage[] | null;
  default_plan?: RawPlan | null;
};

function moneyAmount(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (value && typeof value === "object" && "amount" in value) {
    return Number((value as { amount: unknown }).amount);
  }
  return 0;
}

function moneyCurrency(value: unknown, fallback = "USD"): string {
  if (typeof value === "string" && value) return value.toUpperCase();
  if (value && typeof value === "object" && "currency" in value) {
    const currency = (value as { currency?: unknown }).currency;
    if (typeof currency === "string" && currency) return currency.toUpperCase();
  }
  return fallback;
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function productIdOf(plan: RawPlan): string {
  if (typeof plan.product === "string") return plan.product;
  if (plan.product && typeof plan.product.id === "string") return plan.product.id;
  return "";
}

function imageUrlOf(value: RawImage | undefined): string {
  return typeof value?.url === "string" && value.url ? value.url : "";
}

const LOCAL_COVERS: Record<string, string> = {
  prod_PY4FLqe3Iu9sQ: "/products/der-disziplin-reset.png",
  "der-disziplin-reset-wie-du-gewohnheiten-aufbaust-die-wirklich-bleiben": "/products/der-disziplin-reset.png",
};

function productImage(row: RawProduct, metadata: Record<string, unknown>, handle: string, seed?: Product): string {
  const banner = imageUrlOf(row.banner_image);
  if (banner) return banner;
  const gallery = Array.isArray(row.gallery_images) ? row.gallery_images : [];
  for (const item of gallery) {
    const url = imageUrlOf(item);
    if (url) return url;
  }
  const metaImage = typeof metadata.image === "string" ? metadata.image : "";
  if (metaImage) return metaImage;
  const local = LOCAL_COVERS[String(row.id ?? "")] || LOCAL_COVERS[handle];
  if (local) return local;
  return seed?.image || "";
}

function pickPlan(row: RawProduct, plans: RawPlan[]): RawPlan | null {
  const productPlans = plans.filter(
    (plan) => productIdOf(plan) === String(row.id) && (!plan.visibility || plan.visibility === "visible"),
  );
  const oneTime = productPlans.filter((plan) => !plan.plan_type || plan.plan_type === "one_time");
  const paidOneTime = oneTime.find((plan) => moneyAmount(plan.initial_price) > 0);
  if (paidOneTime) return paidOneTime;
  if (oneTime[0]) return oneTime[0];
  if (row.default_plan && typeof row.default_plan.id === "string") return row.default_plan;
  return productPlans[0] ?? null;
}

function mapProduct(row: RawProduct, plans: RawPlan[]): Product | null {
  if (row.visibility && row.visibility !== "visible") return null;
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!title || JUNK.has(title.toLowerCase())) return null;
  const handle = (typeof row.route === "string" && row.route) || slugify(title);
  const plan = pickPlan(row, plans);
  if (!plan || typeof plan.id !== "string") return null;
  const metadata = (row.metadata && typeof row.metadata === "object") ? row.metadata as Record<string, unknown> : {};
  const seed = seedProducts.find((item) => item.title.toLowerCase() === title.toLowerCase() || item.handle === handle);
  const labels = Array.isArray(row.labels) ? row.labels.filter((label): label is string => typeof label === "string") : [];
  return {
    id: String(row.id ?? handle),
    handle,
    title,
    description: (typeof row.description === "string" && row.description.trim()) || seed?.description || title,
    price: moneyAmount(plan.initial_price) || moneyAmount((plan as { renewal_price?: unknown }).renewal_price),
    currency: moneyCurrency(plan.initial_price, moneyCurrency(plan.currency)),
    image: productImage(row, metadata, handle, seed),
    collection: (labels[0] || seed?.collection || "books").toLowerCase(),
    planId: String(plan.id),
  };
}

let snapshot: { products: Product[]; at: number } | null = null;

export async function loadCatalogue(): Promise<Product[]> {
  if (snapshot && Date.now() - snapshot.at < FRESH_MS) return snapshot.products;
  try {
    const account = await loadAccountId();
    const [rawProducts, rawPlans] = await Promise.all([
      listAll<RawProduct>("products", account),
      listAll<RawPlan>("plans", account),
    ]);
    const products = rawProducts.map((row) => mapProduct(row, rawPlans)).filter((row): row is Product => Boolean(row));
    if (products.length === 0) return seedProducts;
    snapshot = { products, at: Date.now() };
    return products;
  } catch {
    return snapshot?.products ?? seedProducts;
  }
}

export async function loadProduct(handle: string): Promise<Product | null> {
  const products = await loadCatalogue();
  return products.find((product) => product.handle === handle) ?? null;
}
