# Closet – Digitaler Kleiderschrank (PWA)

Web-App zum Verwalten deines Kleiderschranks: **Fits** (Outfit-Vorschläge) · **Home** (Überblick) · **Editor** (Schrank).

## Lokal starten

```bash
cd closet
npm install
npm run dev
```

Öffne die URL aus der Konsole (meist `http://localhost:5173/closet/`).

## Build

```bash
npm run build
```

Ausgabe in `dist/` – für GitHub Pages unter `/closet/`.

## Roadmap (schrittweise)

1. **Grundlage** – Navigation, Design, Platzhalter-Screens ✅
2. **Editor** – Kleidungsstücke per Foto hinzufügen, Kategorien
3. **Speicher** – IndexedDB (+ localStorage-Backup), Export/Import JSON
4. **Fits** – Outfit-Vorschläge aus eigenen Teilen
5. **Account / Sync** – optional später (Workaround ohne klassische DB)
