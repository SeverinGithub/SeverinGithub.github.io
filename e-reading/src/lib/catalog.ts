export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  collection: string;
  planId: string;
  /* Optionales Abo (Whop-Variante mit wiederkehrendem Preis). */
  sub?: { planId: string; price: number; days: number };
};

/* Überkategorien. Zuordnung in Whop: Produkt → Labels → einen dieser Slugs eintragen (z. B. "stories").
   Ohne passendes Label landet ein Titel unter "informational". */
export const CATEGORIES = ["informational", "stories", "magazines", "workbooks", "career", "lifestyle"] as const;
export type Category = (typeof CATEGORIES)[number];

const ALIASES: Record<string, Category> = {
  info: "informational", sachbuch: "informational", nonfiction: "informational", "non-fiction": "informational",
  story: "stories", fiction: "stories", geschichten: "stories", roman: "stories", novel: "stories",
  magazine: "magazines", magazin: "magazines", zeitschrift: "magazines",
  workbook: "workbooks", arbeitsbuch: "workbooks",
  practical: "career", praxis: "career", karriere: "career", "practical-career": "career",
  hobbies: "lifestyle", hobby: "lifestyle", "lifestyle-hobbies": "lifestyle",
};

export function toCategory(labels: string[]): Category {
  for (const raw of labels) {
    const label = raw.trim().toLowerCase().replace(/[\s/&]+/g, "-");
    if ((CATEGORIES as readonly string[]).includes(label)) return label as Category;
    if (ALIASES[label]) return ALIASES[label];
  }
  return "informational";
}
