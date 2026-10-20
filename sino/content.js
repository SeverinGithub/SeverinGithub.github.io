// ─────────────────────────────────────────────────────────────
//  SINO — Inhalte der Website
//  Hier änderst du alles, was auf der Seite steht.
//  Fotos kommen in den Ordner "photos/" und werden in photos.js
//  gelistet (automatisch mit:  node update-photos.mjs).
// ─────────────────────────────────────────────────────────────

window.SITE = {
  name: "Sino",
  email: "severinschwarz@icloud.com",

  // Links erscheinen im Footer. Leere Einträge ("") werden ausgeblendet.
  links: {
    instagram: "https://www.instagram.com/sin0_onthattrack/",
    soundcloud: "",
    spotify: "https://open.spotify.com/artist/1WGlFtsFCrGxHPqbiy5KCr",
    youtube: ""
  },

  // Dein Hauptfoto oben auf der Seite (Dateiname im Ordner photos/).
  // Leer lassen = es wird automatisch das erste Foto aus photos.js genommen.
  heroPhoto: "01-pult.jpg",

  // Foto neben dem "Über"-Text. Leer = zweites Foto aus photos.js.
  aboutPhoto: "02-rane.jpg",

  // Laufband unter dem Hero.
  ticker: ["House", "Christian Music", "DJ Sets", "Open Air", "Club", "Worship"],

  // Deine Sets. Neueste oben. "upcoming: true" markiert kommende Termine.
  // "link" ist optional (z.B. SoundCloud-Mix oder Event-Seite).
  // "promo" ist optional: ein kleiner Werbe-Link unter dem Set-Namen.
  // "date" darf leer sein ("") – dann wird kein Datum angezeigt.
  sets: [
    { date: "2026-10-18", event: "Sunday Night Session",         city: "München · Neuraum",     link: "" },
    { date: "",           event: "Hochzeiten",                   city: "",                      link: "" },
    { date: "",           event: "Geburtstage",                  city: "",                      link: "" },
    { date: "2026-07-24", event: "Sommerparty",                  city: "",                      link: "" },
    { date: "2026-07-12", event: "Daily Prayer",                 city: "München · Hackerbrücke", link: "",
      promo: { label: "Daily Prayer Clothing", url: "https://daily-prayer.de" } }
  ],

  // Texte auf Deutsch und Englisch.
  text: {
    de: {
      title: "Sino — DJ",
      status: "Booking offen",
      role: "DJ / Producer",
      genres: "House & christliche Musik",
      intro: "Für den Tanz und für die Stille.",
      "nav-sets": "Sets",
      "nav-photos": "Bilder",
      "nav-about": "Über",
      "nav-contact": "Booking",
      "sets-label": "Sets",
      "sets-title": "Wo ich gespielt habe",
      "upcoming": "Demnächst",
      "photos-label": "Bilder",
      "photos-title": "Aus den Sets",
      "about-label": "Über",
      "about-1": "Ich bin Sino. Ich feiere zwei Welten in meiner Musik: House – für Sets, in denen der Beat alles trägt – und christliche Musik, für die Momente, in denen es tiefer geht – mit Texten, die Wahrheit enthalten.",
      "about-2": "Beides gehört für mich zusammen. Der Groove, der bewegt, und Texte, die bleiben, weil sie wahr sind. Für mich ist Jesus die Wahrheit, und genau davon erzählen diese Songs. Ich spiele, was ich selbst hören will – ehrlich und mit Herz.",
      "contact-label": "Booking & Kontakt",
      "contact-title": "Lass uns dein nächstes Event planen.",
      "listen": "Anhören",
      "promo-cta": "Schau vorbei",
      "follow": "Folgen",
      "copy": "Klicken zum Kopieren",
      "copied": "Kopiert ✓",
      "close": "Schließen",
      "prev": "Vorheriges Bild",
      "next": "Nächstes Bild",
      "empty": "Foto hier ablegen"
    },
    en: {
      title: "Sino — DJ",
      status: "Open for booking",
      role: "DJ / Producer",
      genres: "House & Christian music",
      intro: "For the dance and for the stillness.",
      "nav-sets": "Sets",
      "nav-photos": "Photos",
      "nav-about": "About",
      "nav-contact": "Booking",
      "sets-label": "Sets",
      "sets-title": "Where I've played",
      "upcoming": "Upcoming",
      "photos-label": "Photos",
      "photos-title": "From the sets",
      "about-label": "About",
      "about-1": "I'm Sino. I celebrate two worlds in my music: house – for sets where the beat carries everything – and Christian music, for the moments that go deeper – with lyrics that hold the truth.",
      "about-2": "For me, they belong together. The groove that moves you and the words that stay, because they're true. For me, Jesus is the truth, and that's what these songs are about. I play what I want to hear myself – honest and from the heart.",
      "contact-label": "Booking & Contact",
      "contact-title": "Let's plan your next event.",
      "listen": "Listen",
      "promo-cta": "Check it out",
      "follow": "Follow",
      "copy": "Click to copy",
      "copied": "Copied ✓",
      "close": "Close",
      "prev": "Previous photo",
      "next": "Next photo",
      "empty": "Drop photo here"
    }
  }
};
