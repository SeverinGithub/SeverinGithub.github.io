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
};

export const COLLECTIONS = [
  { slug: "books", name: "Books", blurb: "Titles from the Publisher demo catalog." },
] as const;
