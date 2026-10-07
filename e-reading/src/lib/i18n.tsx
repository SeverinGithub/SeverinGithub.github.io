import { createContext, useCallback, useContext, useEffect, useState } from "react";

/* Texte: en = Standard. Neue Sprache = neuer Block mit denselben Schlüsseln. */
export const LANGS = ["en", "es", "de", "it"] as const;
export type Lang = (typeof LANGS)[number];
export const NATIVE: Record<Lang, string> = { en: "English", es: "Español", de: "Deutsch", it: "Italiano" };
export const READ: Record<Lang, string> = { en: "Read.", es: "Leer.", de: "Lesen.", it: "Leggere." };

const en = {
  locale: "en-GB", nav_label: "Main navigation", lang_label: "Language", nav_catalog: "Catalog", nav_langs: "4 languages", nav_faq: "FAQ", nav_cart: "Cart", nav_about: "About",
  kicker: "E-Book Store · Autumn 2026", h1a: "E-books,", h1b: "clearly", h1c: "set",
  hero_p: "Buy, download, read. On any device, in four languages.", cta1: "Browse catalog", cta2: "Four languages",
  f1b: "Instant access", f1s: "Download link right after purchase", f2b: "EPUB and PDF", f2s: "DRM-free, for reader, tablet and phone",
  f3b: "Four languages", f3s: "English, Spanish, German, Italian", f4b: "Secure payment", f4s: "Card, PayPal, Apple Pay",
  kat: "01 — Catalog", count: (n: number) => `· ${n} ${n === 1 ? "title" : "titles"}`, all: "All", filter_label: "Filter by category",
  add: "Add to cart", in_cart: "In cart", details: "Details", none: "No titles in this category.",
  plan_once: "One-time", plan_sub: "Subscription", per_month: "/ month", plan_label: "Choose how to buy",
  cats: { informational: "Informational", stories: "Stories", magazines: "Magazines", workbooks: "Workbooks", career: "Practical & Career", lifestyle: "Lifestyle & Hobbies" } as Record<string, string>,
  cat_blurbs: { informational: "Knowledge, clearly explained", stories: "Novels, tales, short fiction", magazines: "Issues and specials", workbooks: "Exercises, plans, templates", career: "Skills for work and money", lifestyle: "Health, habits, free time" } as Record<string, string>,
  browse: "Browse by category", soon: "Coming soon", search: "Search titles", all_titles: "All titles", show_all: "Show all",
  names: { en: "English", es: "Spanish", de: "German", it: "Italian" } as Record<Lang, string>,
  langs_title: "02 — Four languages", langs_aside: "One store, four languages",
  langs_h1: "Every page.", langs_h2: "Four languages",
  langs_p: "This store speaks English, Spanish, German and Italian. Pick yours below. Learning a language? Read two editions side by side.",
  langs_cta: "Choose a book", tongue_hint: "Switch site to",
  fok: "03 — Featured", fok_aside: "New this season", hal: "04 — Our approach",
  p1h: "Few titles, well chosen", p1p: "A curated list instead of endless shelves. Every book has a reason to be here.",
  p2h: "Fair prices, no subscriptions", p2p: "Buy once, keep forever. No hidden fees, no renewals.",
  p3h: "Reading without barriers", p3p: "Open formats without copy protection. The file is yours and works on every device.",
  abl: "05 — How it works", abl_aside: "Three steps, under a minute",
  s1h: "Choose a book", s1p: "Browse the catalog and add a title to the cart.",
  s2h: "Pay securely", s2p: "Checkout runs encrypted through our payment provider Whop.",
  s3h: "Start reading", s3p: "Download link by email and right on the confirmation page.",
  faq: "06 — FAQ", qa: [
    ["Which devices can I read on?", "EPUB works with Kobo, Tolino, Apple Books, Google Play Books and all common reading apps. The PDF suits tablets, laptops and printing. Kindle readers can send the EPUB via “Send to Kindle”."],
    ["When do I get my files?", "Right after payment. You get the download link on the confirmation page and by email."],
    ["Is there copy protection?", "No. Our e-books are DRM-free. Read and back them up on all your devices."],
    ["Can I return an e-book?", "For digital content, the right of withdrawal ends once the download starts, provided you agree to this at checkout. If anything goes wrong technically, write to us and we’ll help."],
    ["Do I get an invoice?", "Yes. The receipt arrives automatically by email."],
  ] as [string, string][],
  cart_close: "Close cart", sum: "Total incl. VAT", checkout: "Checkout", checkout_note: "Instant download after payment. EPUB and PDF.",
  checkout_multi: "Each title is paid separately. Use “Pay” next to each book.", pay: "Pay",
  empty: "Still empty", empty_p: "Pick a book from the catalog. It shows up here.", remove: "Remove",
  detail_close: "Close details", price: "Price incl. VAT", to_cart: "Go to cart", buy_now: "Buy now",
  sp_fmt: "Formats", sp_fmt_v: "EPUB, PDF · DRM-free", sp_del: "Delivery", sp_del_v: "Instant download", sp_cat: "Category",
  added: (t: string) => `“${t}” added to cart`, dupe: "This title is already in your cart",
  back: "Back to catalog", co_title: "Checkout", co_loading: "Loading checkout…", co_receipt: "Receipt", co_pay: "Pay now", co_working: "Working…",
  done_h: "Thank you", done_p: "Your order is in. The download link is on its way to your inbox.",
  about_k: "About", about_h: "A small press for e-books", about_p: "We publish few titles and take care over each one: clearly written, cleanly set, fairly priced. Every book is available as EPUB and PDF, without copy protection.",
  unavailable: "Checkout is not available for this title.",
};
type Dict = typeof en;

const es: Dict = {
  ...en,
  locale: "es-ES", nav_label: "Navegación principal", lang_label: "Idioma", nav_catalog: "Catálogo", nav_langs: "4 idiomas", nav_faq: "Preguntas", nav_cart: "Carrito", nav_about: "Nosotros",
  kicker: "Tienda de e-books · Otoño 2026", h1a: "E-books,", h1b: "bien", h1c: "escritos",
  hero_p: "Compra, descarga, lee. En cualquier dispositivo, en cuatro idiomas.", cta1: "Ver catálogo", cta2: "Cuatro idiomas",
  f1b: "Acceso inmediato", f1s: "Enlace de descarga justo después de comprar", f2b: "EPUB y PDF", f2s: "Sin DRM, para e-reader, tableta y móvil",
  f3b: "Cuatro idiomas", f3s: "Inglés, español, alemán, italiano", f4b: "Pago seguro", f4s: "Tarjeta, PayPal, Apple Pay",
  kat: "01 — Catálogo", count: (n) => `· ${n} ${n === 1 ? "título" : "títulos"}`, all: "Todos", filter_label: "Filtrar por categoría",
  add: "Añadir al carrito", in_cart: "En el carrito", details: "Detalles", none: "No hay títulos en esta categoría.",
  plan_once: "Pago único", plan_sub: "Suscripción", per_month: "/ mes", plan_label: "Elige cómo comprar",
  cats: { informational: "Divulgación", stories: "Historias", magazines: "Revistas", workbooks: "Cuadernos de trabajo", career: "Práctico y carrera", lifestyle: "Estilo de vida y aficiones" },
  cat_blurbs: { informational: "Conocimiento, explicado con claridad", stories: "Novelas, relatos, cuentos", magazines: "Números y especiales", workbooks: "Ejercicios, planes, plantillas", career: "Habilidades para el trabajo y el dinero", lifestyle: "Salud, hábitos, tiempo libre" },
  browse: "Explorar por categoría", soon: "Próximamente", search: "Buscar títulos", all_titles: "Todos los títulos", show_all: "Ver todo",
  names: { en: "Inglés", es: "Español", de: "Alemán", it: "Italiano" },
  langs_title: "02 — Cuatro idiomas", langs_aside: "Una tienda, cuatro idiomas",
  langs_h1: "Cada página.", langs_h2: "Cuatro idiomas",
  langs_p: "Esta tienda habla inglés, español, alemán e italiano. Elige el tuyo abajo. ¿Aprendes un idioma? Lee dos ediciones en paralelo.",
  langs_cta: "Elegir un libro", tongue_hint: "Cambiar la web a",
  fok: "03 — Destacado", fok_aside: "Novedad de la temporada", hal: "04 — Nuestra forma de trabajar",
  p1h: "Pocos títulos, bien elegidos", p1p: "Una selección cuidada en lugar de estanterías infinitas. Cada libro tiene un motivo para estar aquí.",
  p2h: "Precios justos, sin suscripciones", p2p: "Compra una vez, consérvalo siempre. Sin costes ocultos, sin renovaciones.",
  p3h: "Leer sin barreras", p3p: "Formatos abiertos sin protección anticopia. El archivo es tuyo y funciona en cualquier dispositivo.",
  abl: "05 — Cómo funciona", abl_aside: "Tres pasos, menos de un minuto",
  s1h: "Elige un libro", s1p: "Explora el catálogo y añade un título al carrito.",
  s2h: "Paga con seguridad", s2p: "El pago se procesa cifrado a través de nuestro proveedor Whop.",
  s3h: "Empieza a leer", s3p: "Enlace de descarga por correo y en la página de confirmación.",
  faq: "06 — Preguntas frecuentes", qa: [
    ["¿En qué dispositivos puedo leer?", "El EPUB funciona con Kobo, Tolino, Apple Books, Google Play Libros y todas las apps de lectura habituales. El PDF es ideal para tableta, portátil e impresión. Con Kindle, envía el EPUB mediante «Send to Kindle»."],
    ["¿Cuándo recibo mis archivos?", "Justo después del pago. Recibes el enlace de descarga en la página de confirmación y por correo."],
    ["¿Tienen protección anticopia?", "No. Nuestros e-books no llevan DRM. Léelos y guárdalos en todos tus dispositivos."],
    ["¿Puedo devolver un e-book?", "En contenidos digitales, el derecho de desistimiento termina al iniciar la descarga, siempre que lo aceptes al comprar. Si hay un problema técnico, escríbenos y te ayudamos."],
    ["¿Recibo factura?", "Sí. El recibo llega automáticamente por correo."],
  ],
  cart_close: "Cerrar carrito", sum: "Total con IVA", checkout: "Ir a pagar", checkout_note: "Descarga inmediata tras el pago. EPUB y PDF.",
  checkout_multi: "Cada título se paga por separado. Usa «Pagar» junto a cada libro.", pay: "Pagar",
  empty: "Todavía vacío", empty_p: "Elige un libro del catálogo. Aparecerá aquí.", remove: "Quitar",
  detail_close: "Cerrar detalles", price: "Precio con IVA", to_cart: "Ir al carrito", buy_now: "Comprar ahora",
  sp_fmt: "Formatos", sp_fmt_v: "EPUB, PDF · sin DRM", sp_del: "Entrega", sp_del_v: "Descarga inmediata", sp_cat: "Categoría",
  added: (t) => `«${t}» añadido al carrito`, dupe: "Este título ya está en tu carrito",
  back: "Volver al catálogo", co_title: "Pago", co_loading: "Cargando el pago…", co_receipt: "Recibo", co_pay: "Pagar ahora", co_working: "Procesando…",
  done_h: "Gracias", done_p: "Tu pedido está hecho. El enlace de descarga va de camino a tu correo.",
  about_k: "Nosotros", about_h: "Una pequeña editorial de e-books", about_p: "Publicamos pocos títulos y cuidamos cada uno: bien escritos, bien compuestos, a precio justo. Cada libro está disponible en EPUB y PDF, sin protección anticopia.",
  unavailable: "El pago no está disponible para este título.",
};

const de: Dict = {
  ...en,
  locale: "de-DE", nav_label: "Hauptnavigation", lang_label: "Sprache", nav_catalog: "Katalog", nav_langs: "4 Sprachen", nav_faq: "Fragen", nav_cart: "Warenkorb", nav_about: "Über uns",
  kicker: "E-Book Store · Herbst 2026", h1a: "E-Books,", h1b: "klar", h1c: "gesetzt",
  hero_p: "Kaufen, herunterladen, lesen. Auf jedem Gerät, in vier Sprachen.", cta1: "Katalog ansehen", cta2: "Vier Sprachen",
  f1b: "Sofort lesbar", f1s: "Download-Link direkt nach dem Kauf", f2b: "EPUB und PDF", f2s: "Ohne DRM, für Reader, Tablet, Smartphone",
  f3b: "Vier Sprachen", f3s: "Englisch, Spanisch, Deutsch, Italienisch", f4b: "Sicher bezahlen", f4s: "Karte, PayPal, Apple Pay",
  kat: "01 — Katalog", count: (n) => `· ${n} Titel`, all: "Alle", filter_label: "Nach Kategorie filtern",
  add: "In den Warenkorb", in_cart: "Im Warenkorb", details: "Details", none: "Keine Titel in dieser Kategorie.",
  plan_once: "Einmalig", plan_sub: "Abo", per_month: "/ Monat", plan_label: "Kaufart wählen",
  cats: { informational: "Sachbuch", stories: "Geschichten", magazines: "Magazine", workbooks: "Arbeitsbücher", career: "Praxis & Karriere", lifestyle: "Lifestyle & Hobbys" },
  cat_blurbs: { informational: "Wissen, klar erklärt", stories: "Romane, Erzählungen, Kurzgeschichten", magazines: "Ausgaben und Sonderhefte", workbooks: "Übungen, Pläne, Vorlagen", career: "Können für Beruf und Geld", lifestyle: "Gesundheit, Gewohnheiten, Freizeit" },
  browse: "Nach Kategorie stöbern", soon: "Bald verfügbar", search: "Titel suchen", all_titles: "Alle Titel", show_all: "Alle zeigen",
  names: { en: "Englisch", es: "Spanisch", de: "Deutsch", it: "Italienisch" },
  langs_title: "02 — Vier Sprachen", langs_aside: "Ein Shop, vier Sprachen",
  langs_h1: "Jede Seite.", langs_h2: "Vier Sprachen",
  langs_p: "Dieser Shop spricht Englisch, Spanisch, Deutsch und Italienisch. Wähle deine Sprache unten. Du lernst eine Sprache? Lies zwei Ausgaben nebeneinander.",
  langs_cta: "Buch auswählen", tongue_hint: "Website umstellen auf",
  fok: "03 — Titel im Fokus", fok_aside: "Neu im Programm", hal: "04 — Haltung",
  p1h: "Wenige Titel, gut gewählt", p1p: "Ein kuratiertes Programm statt endloser Listen. Jedes Buch hat einen Grund, hier zu stehen.",
  p2h: "Faire Preise, keine Abos", p2p: "Einmal kaufen, für immer behalten. Keine versteckten Kosten, keine Verlängerung.",
  p3h: "Lesen ohne Hürden", p3p: "Offene Formate ohne Kopierschutz. Die Datei gehört dir und läuft auf jedem Gerät.",
  abl: "05 — So funktioniert’s", abl_aside: "Drei Schritte, unter einer Minute",
  s1h: "Titel wählen", s1p: "Im Katalog stöbern und den Titel in den Warenkorb legen.",
  s2h: "Sicher bezahlen", s2p: "Der Checkout läuft verschlüsselt über unseren Zahlungsanbieter Whop.",
  s3h: "Sofort lesen", s3p: "Download-Link per E-Mail und direkt auf der Bestätigungsseite.",
  faq: "06 — Häufige Fragen", qa: [
    ["Auf welchen Geräten kann ich lesen?", "EPUB funktioniert auf Tolino, Kobo, Apple Books, Google Play Books und allen gängigen Lese-Apps. Die PDF-Version eignet sich für Tablet, Laptop und Ausdruck. Kindle-Nutzer:innen schicken die EPUB-Datei per „Send to Kindle“."],
    ["Wann bekomme ich meine Dateien?", "Sofort nach der Zahlung. Du erhältst den Download-Link auf der Bestätigungsseite und zusätzlich per E-Mail."],
    ["Gibt es einen Kopierschutz?", "Nein. Unsere E-Books sind DRM-frei. Du kannst sie auf all deinen Geräten lesen und sichern."],
    ["Kann ich ein E-Book zurückgeben?", "Bei digitalen Inhalten erlischt das Widerrufsrecht mit Beginn des Downloads, sofern du dem beim Kauf zustimmst. Bei technischen Problemen schreib uns, wir helfen dir."],
    ["Bekomme ich eine Rechnung?", "Ja. Der Beleg kommt automatisch per E-Mail."],
  ],
  cart_close: "Warenkorb schließen", sum: "Summe inkl. MwSt.", checkout: "Zur Kasse", checkout_note: "Sofort-Download nach Zahlung. EPUB und PDF.",
  checkout_multi: "Jeder Titel wird einzeln bezahlt. Nutze „Bezahlen“ neben dem jeweiligen Buch.", pay: "Bezahlen",
  empty: "Noch leer", empty_p: "Wähle im Katalog einen Titel aus. Er erscheint hier.", remove: "Entfernen",
  detail_close: "Details schließen", price: "Preis inkl. MwSt.", to_cart: "Zum Warenkorb", buy_now: "Jetzt kaufen",
  sp_fmt: "Formate", sp_fmt_v: "EPUB, PDF · ohne DRM", sp_del: "Lieferung", sp_del_v: "Sofort-Download", sp_cat: "Kategorie",
  added: (t) => `„${t}“ liegt im Warenkorb`, dupe: "Dieser Titel ist schon im Warenkorb",
  back: "Zurück zum Katalog", co_title: "Kasse", co_loading: "Checkout wird geladen…", co_receipt: "Beleg", co_pay: "Jetzt bezahlen", co_working: "Wird bearbeitet…",
  done_h: "Danke", done_p: "Deine Bestellung ist da. Der Download-Link ist auf dem Weg in dein Postfach.",
  about_k: "Über uns", about_h: "Ein kleiner Verlag für E-Books", about_p: "Wir veröffentlichen wenige Titel und kümmern uns um jeden einzelnen: klar geschrieben, sauber gesetzt, fair bepreist. Jedes Buch gibt es als EPUB und PDF, ohne Kopierschutz.",
  unavailable: "Für diesen Titel ist der Checkout nicht verfügbar.",
};

const it: Dict = {
  ...en,
  locale: "it-IT", nav_label: "Navigazione principale", lang_label: "Lingua", nav_catalog: "Catalogo", nav_langs: "4 lingue", nav_faq: "Domande", nav_cart: "Carrello", nav_about: "Chi siamo",
  kicker: "Negozio di e-book · Autunno 2026", h1a: "E-book,", h1b: "scritti", h1c: "bene",
  hero_p: "Compra, scarica, leggi. Su ogni dispositivo, in quattro lingue.", cta1: "Sfoglia il catalogo", cta2: "Quattro lingue",
  f1b: "Accesso immediato", f1s: "Link per il download subito dopo l’acquisto", f2b: "EPUB e PDF", f2s: "Senza DRM, per e-reader, tablet e smartphone",
  f3b: "Quattro lingue", f3s: "Inglese, spagnolo, tedesco, italiano", f4b: "Pagamento sicuro", f4s: "Carta, PayPal, Apple Pay",
  kat: "01 — Catalogo", count: (n) => `· ${n} ${n === 1 ? "titolo" : "titoli"}`, all: "Tutti", filter_label: "Filtra per categoria",
  add: "Aggiungi al carrello", in_cart: "Nel carrello", details: "Dettagli", none: "Nessun titolo in questa categoria.",
  plan_once: "Una tantum", plan_sub: "Abbonamento", per_month: "/ mese", plan_label: "Scegli come acquistare",
  cats: { informational: "Saggistica", stories: "Storie", magazines: "Riviste", workbooks: "Eserciziari", career: "Pratica e carriera", lifestyle: "Lifestyle e hobby" },
  cat_blurbs: { informational: "Sapere, spiegato con chiarezza", stories: "Romanzi, racconti, novelle", magazines: "Numeri e speciali", workbooks: "Esercizi, piani, modelli", career: "Competenze per lavoro e denaro", lifestyle: "Salute, abitudini, tempo libero" },
  browse: "Sfoglia per categoria", soon: "In arrivo", search: "Cerca titoli", all_titles: "Tutti i titoli", show_all: "Mostra tutto",
  names: { en: "Inglese", es: "Spagnolo", de: "Tedesco", it: "Italiano" },
  langs_title: "02 — Quattro lingue", langs_aside: "Un negozio, quattro lingue",
  langs_h1: "Ogni pagina.", langs_h2: "Quattro lingue",
  langs_p: "Questo negozio parla inglese, spagnolo, tedesco e italiano. Scegli la tua lingua qui sotto. Stai imparando una lingua? Leggi due edizioni in parallelo.",
  langs_cta: "Scegli un libro", tongue_hint: "Passa il sito a",
  fok: "03 — In evidenza", fok_aside: "Novità di stagione", hal: "04 — Il nostro approccio",
  p1h: "Pochi titoli, scelti bene", p1p: "Una selezione curata invece di scaffali infiniti. Ogni libro ha un motivo per essere qui.",
  p2h: "Prezzi onesti, niente abbonamenti", p2p: "Compri una volta, è tuo per sempre. Nessun costo nascosto, nessun rinnovo.",
  p3h: "Leggere senza ostacoli", p3p: "Formati aperti senza protezione anticopia. Il file è tuo e funziona su ogni dispositivo.",
  abl: "05 — Come funziona", abl_aside: "Tre passi, meno di un minuto",
  s1h: "Scegli un libro", s1p: "Sfoglia il catalogo e aggiungi un titolo al carrello.",
  s2h: "Paga in sicurezza", s2p: "Il pagamento avviene in modo cifrato tramite il nostro fornitore Whop.",
  s3h: "Inizia a leggere", s3p: "Link per il download via email e direttamente nella pagina di conferma.",
  faq: "06 — Domande frequenti", qa: [
    ["Su quali dispositivi posso leggere?", "L’EPUB funziona con Kobo, Tolino, Apple Books, Google Play Libri e tutte le app di lettura più diffuse. Il PDF è adatto a tablet, laptop e stampa. Con Kindle, invia l’EPUB tramite «Send to Kindle»."],
    ["Quando ricevo i file?", "Subito dopo il pagamento. Trovi il link per il download nella pagina di conferma e via email."],
    ["C’è una protezione anticopia?", "No. I nostri e-book sono senza DRM. Leggili e salvali su tutti i tuoi dispositivi."],
    ["Posso restituire un e-book?", "Per i contenuti digitali il diritto di recesso decade all’avvio del download, se lo accetti al momento dell’acquisto. In caso di problemi tecnici scrivici e ti aiutiamo."],
    ["Ricevo una fattura?", "Sì. La ricevuta arriva automaticamente via email."],
  ],
  cart_close: "Chiudi carrello", sum: "Totale IVA inclusa", checkout: "Vai alla cassa", checkout_note: "Download immediato dopo il pagamento. EPUB e PDF.",
  checkout_multi: "Ogni titolo si paga separatamente. Usa «Paga» accanto a ciascun libro.", pay: "Paga",
  empty: "Ancora vuoto", empty_p: "Scegli un libro dal catalogo. Comparirà qui.", remove: "Rimuovi",
  detail_close: "Chiudi dettagli", price: "Prezzo IVA inclusa", to_cart: "Vai al carrello", buy_now: "Compra ora",
  sp_fmt: "Formati", sp_fmt_v: "EPUB, PDF · senza DRM", sp_del: "Consegna", sp_del_v: "Download immediato", sp_cat: "Categoria",
  added: (t) => `«${t}» aggiunto al carrello`, dupe: "Questo titolo è già nel carrello",
  back: "Torna al catalogo", co_title: "Cassa", co_loading: "Caricamento del pagamento…", co_receipt: "Ricevuta", co_pay: "Paga ora", co_working: "Elaborazione…",
  done_h: "Grazie", done_p: "Il tuo ordine è arrivato. Il link per il download sta arrivando nella tua casella email.",
  about_k: "Chi siamo", about_h: "Una piccola casa editrice di e-book", about_p: "Pubblichiamo pochi titoli e curiamo ognuno: scritti con chiarezza, composti con cura, a prezzi onesti. Ogni libro è disponibile in EPUB e PDF, senza protezione anticopia.",
  unavailable: "Il pagamento non è disponibile per questo titolo.",
};

export const STR: Record<Lang, Dict> = { en, es, de, it };

export const storage = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};

const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

type LangState = { lang: Lang; t: Dict; setLang: (l: Lang) => void };
const LangContext = createContext<LangState>({ lang: "en", t: en, setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = storage.get("lang");
    const browser = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "";
    const next = isLang(stored) ? stored : isLang(browser) ? browser : "en";
    setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storage.set("lang", l);
  }, []);

  return <LangContext.Provider value={{ lang, t: STR[lang], setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT() {
  return useContext(LangContext).t;
}
