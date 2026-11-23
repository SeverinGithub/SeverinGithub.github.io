# Severin Organizer

Persönliche Organizer-App als installierbare **PWA im Stil einer nativen Apple-App**: Systemschrift (SF Pro), iOS-Systemfarben mit Hell- und Dunkelmodus nach Geräteeinstellung, große Titel, die beim Scrollen in eine durchscheinende Leiste wandern, gruppierte Listen wie in den Einstellungen, Sheets mit Griff (nach unten wegziehbar), Aktionsblätter zum Bestätigen und eine schwebende Tab-Bar aus Glas unten in der Mitte.

Drei Seiten:

| Links: **Jobs** | Mitte: **Übersicht** | Rechts: **To-dos** |
|---|---|---|
| Bis zu 3 Jobs (auch ein Praktikum) mit Farbe und Stundenlohn | Gesamtvermögen aus händisch eingetragenen Kontoständen | To-dos wie in Erinnerungen, optional mit Datum |
| Stunden pro Tag im Monatskalender eintragen (Schnellwahl 2–8 Std., Notiz) | Kacheln: Verdienst diesen Monat, Ø pro Monat, offene To-dos, heute | Erledigte ein-/ausblenden und löschen |
| Monat: Verdienst, Stunden, Tage, pro Job mit Balken bis zur Minijob-Grenze (603 €, einstellbar) | Gemeinsamer Kalender: Arbeitstage (Jobfarbe) und To-dos (Ring); Tag antippen → Stunden eintragen oder To-do anlegen | Schnellnotizen wie in Notizen, als To-do übernehmbar |
| Verlauf über 6 Monate, Liste aller Einträge | Überfällige To-dos, nächste 7 Tage, Backup sichern/wiederherstellen | To-dos mit Datum erscheinen im Kalender der Übersicht |

## Starten

Kein Build-Schritt nötig:

```bash
cd severin-organizer && python3 -m http.server 8080
```

Dann http://localhost:8080 öffnen. Der Service Worker braucht `localhost` oder HTTPS, beim direkten Öffnen von `index.html` läuft die App ohne Offline-Modus.

Nach einem Push nach `main` liegt die App unter `https://severingithub.github.io/severin-organizer/`. Installieren auf dem iPhone: in Safari öffnen → Teilen → „Zum Home-Bildschirm“.

## Daten

Alles liegt im `localStorage` des Geräts (Schlüssel `severin-organizer-v1`). Über **Übersicht → Daten** lässt sich ein JSON-Backup sichern (auf dem iPhone über das Teilen-Menü) und wiederherstellen. Achtung: Eine installierte PWA auf dem iPhone hat einen eigenen Speicher, getrennt von Safari.

Der Stundenlohn wird mit jeder Schicht gespeichert. Ändert sich der Lohn, gilt er für neue Einträge; per Schalter auch rückwirkend.

## Dateien

- `index.html` – Gerüst, Symbole (SVG im Stil der SF Symbols), Navigationsleisten, Tab-Bar, Overlays
- `style.css` – Design-Tokens (iOS-Systemfarben hell/dunkel) und Bausteine
- `app.js` – Daten, Seiten, Sheets, Ereignisse
- `sw.js` – Service Worker (offline, stale-while-revalidate)
- `manifest.json`, `icons/` – PWA-Manifest und App-Icon (`icons/icon.svg` ist die Vorlage)
