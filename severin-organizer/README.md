# Severin Organizer

Persönliche Organizer-App als installierbare **PWA im Stil einer nativen Apple-App**: Systemschrift (SF Pro), iOS-Systemfarben mit Hell- und Dunkelmodus nach Geräteeinstellung, große Titel, die beim Scrollen in eine durchscheinende Leiste wandern, gruppierte Listen wie in den Einstellungen, Sheets mit Griff (nach unten wegziehbar), Aktionsblätter zum Bestätigen und eine schwebende Tab-Bar aus Glas unten in der Mitte.

Vier Tabs (Jobs · Schule · Übersicht · To-dos); die drei ursprünglichen Seiten:

| Links: **Jobs** | Mitte: **Übersicht** | Rechts: **To-dos** |
|---|---|---|
| Bis zu 3 Jobs (auch ein Praktikum) mit Farbe und Stundenlohn | Gesamtvermögen aus händisch eingetragenen Kontoständen | To-dos wie in Erinnerungen, optional mit Datum |
| Stunden pro Tag im Monatskalender eintragen (Schnellwahl 2–8 Std., Notiz) | Kacheln: Verdienst diesen Monat, Ø pro Monat, offene To-dos, heute | Erledigte ein-/ausblenden und löschen |
| Monat: Verdienst, Stunden, Tage, pro Job mit Balken bis zur Minijob-Grenze (603 €, einstellbar) | Gemeinsamer Kalender wie Apple Kalender: **Tag · Woche · Monat**; Tag antippen → Stunden eintragen oder To-do anlegen | Schnellnotizen wie in Notizen, als To-do übernehmbar |
| Verlauf über 6 Monate, Liste aller Einträge | Überfällige To-dos, nächste 7 Tage, Backup sichern/wiederherstellen | To-dos mit Datum erscheinen im Kalender der Übersicht |

### Kalender der Übersicht

Umschalter **Tag · Woche · Monat** (die Wahl bleibt gespeichert). Die Monatsansicht zeigt Punkte pro Tag (Schule, Jobfarbe, To-do-Ring). Tag und Woche zeigen eine Zeitachse von 00:00 bis 24:00 mit Blöcken: Unterricht (violett), Schichten mit Beginn (Jobfarbe, Länge = Stunden), nebeneinander bei Überschneidung; oben in der Zeile „ganztägig“ To-dos, Ferien und Schichten ohne Uhrzeit. Eine rote Linie markiert die aktuelle Uhrzeit. Wochenleiste antippen → Tag; freie Stelle antippen → Tag öffnen, „Stunden eintragen“ übernimmt die angetippte Stunde als Beginn. Schichten haben dafür ein optionales Feld **Beginn**.

### Schule (eigener Tab zwischen Jobs und Übersicht)

- **Notenschnitt** in Punkten und als Note (Note = (17 − Punkte) ÷ 3), **Verlauf** des Gesamtschnitts nach jeder Note, **Schnitt je Fach** als Balken.
- **Fächer** wurden einmalig aus dem Stundenplan angelegt (Kürzel → Name, z. B. Te → Technologie); umbenennen, Farbe ändern, hinzufügen und löschen geht. Ein neues Kürzel im Stundenplan legt das Fach automatisch an.
- **Noten** mit Punkten 15–0, Art (Schulaufgabe ×2, Kurzarbeit, Stegreifaufgabe, Mündlich, Referat, Sonstiges je ×1), frei änderbarer Gewichtung, Datum und Bezeichnung. Pro Fach: gewichteter Schnitt und Graph (einzelne Noten, gestrichelt der Schnitt).
- Der Gesamtschnitt ist das Mittel der Fachschnitte (jedes Fach zählt gleich). Durchschnittsnoten werden wie beim Abitur auf eine Stelle **abgeschnitten**, nicht gerundet.
- Oben umschalten: **11/1 · 11/2 · 12 · Vorhersage**. Jede Note gehört zu einem Halbjahr (beim Eintragen wählbar, Vorgabe nach Datum: Wechsel am 15. Februar, 12. Klasse ab September; das Schuljahr der 11. Klasse ist in der Vorhersage einstellbar).
- **Vorhersage:** Ziel ist eine Gesamtnote (Standard 2,1 = genau 10,7 P; weil abgeschnitten wird, reicht jeder Schnitt über 10,4 P – per Schalter lässt sich mit genau 10,7 P rechnen). Geplante Prüfungen (Gewichtung 0,5–2,0) bleiben offen oder bekommen eine Prognose. Die App zeigt, wie viele Punkte du in jeder offenen Prüfung mindestens brauchst, und pro Fach die schlechteste Note bzw. den Mindestschnitt, wenn alle anderen Fächer so bleiben. Fachabi-Fächer (Deutsch, Englisch, Mathematik, Physik) haben eine offene Abschlussprüfung ×2; welche Halbjahre mitzählen, ist einstellbar.

In der Übersicht stehen nur noch der nächste Schultag und der Notenschnitt.

Der Stundenplan (Stand 30.11.2026, Format Fach · Raum · Lehrkraft) ist fest hinterlegt und wiederholt sich jede Woche. Im Tab **Schule → Stundenplan** stehen der heutige bzw. nächste Schultag mit „Jetzt“-Markierung, der Editor für den Stundenplan (Wochentage, Schnellwahl nach Stundenraster, „gilt ab/bis“), Ferien und freie Tage sowie der Export **In Apple Kalender übernehmen**: eine `.ics`-Datei mit wöchentlichen Serien, Ferien als Ausnahmen. Der Export ist eine einmalige Kopie – nach Änderungen neu exportieren (gleiche UIDs, Apple Kalender aktualisiert die Serien). Im Kalender der Übersicht markiert ein kleines violettes Quadrat Schultage.

### Sperre per Face ID / Touch ID

Unter **Übersicht → Sicherheit** lässt sich die App mit einem Passkey (WebAuthn, Plattform-Authentifikator) sperren: beim Öffnen und nach einer Minute im Hintergrund. Im Hintergrund wird der Inhalt sofort weichgezeichnet. Das ist ein **Sichtschutz** – die Daten liegen weiterhin unverschlüsselt im Speicher des Geräts. Der Passkey gehört zur Domain (`severingithub.github.io` bzw. `localhost`). Wird er im Schlüsselbund gelöscht, lässt sich die App nur noch durch Löschen der Website-Daten zurücksetzen (Backup vorher sichern).

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
