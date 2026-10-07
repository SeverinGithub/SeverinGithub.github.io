import type { Product } from "#/lib/catalog";
import { useLang, type Lang } from "#/lib/i18n";

/* Übersetzte Titel und Beschreibungen je Buch (Schlüssel = Whop-Handle).
   Deutsch kommt immer direkt aus Whop; fehlt eine Übersetzung, bleibt der Whop-Text stehen. */
type Text = { title: string; description?: string };
const TRANSLATIONS: Record<string, Partial<Record<Lang, Text>>> = {
  "der-dopamin-reset-14-tage-entgiftung-fur-handy-fokus-und-kopf": {
    en: { title: "The Dopamine Reset: A 14-Day Detox for Your Phone, Focus and Mind" },
    es: { title: "El reinicio de la dopamina: 14 días de desintoxicación para el móvil, la concentración y la mente" },
    it: { title: "Il reset della dopamina: 14 giorni di disintossicazione per smartphone, concentrazione e mente" },
  },
  "der-disziplin-reset-wie-du-gewohnheiten-aufbaust-die-wirklich-bleiben": {
    en: { title: "The Discipline Reset: How to Build Habits That Actually Stick", description: "You don’t lack discipline. You lack a system that still works on bad days." },
    es: { title: "El reinicio de la disciplina: cómo crear hábitos que de verdad perduran", description: "No te falta disciplina, te falta un sistema que funcione también en los días malos." },
    it: { title: "Il reset della disciplina: come costruire abitudini che durano davvero", description: "Non ti manca la disciplina, ti manca un sistema che funzioni anche nelle giornate storte." },
  },
};

export function localize(product: Product, lang: Lang): { title: string; description: string } {
  const tr = lang === "de" ? undefined : TRANSLATIONS[product.handle]?.[lang];
  const title = tr?.title ?? product.title;
  // Ist die Whop-Beschreibung nur der Titel, wird auch sie zum übersetzten Titel.
  const description = product.description === product.title ? title : tr?.description ?? product.description;
  return { title, description };
}

export function useText() {
  const { lang } = useLang();
  return (product: Product) => localize(product, lang);
}
