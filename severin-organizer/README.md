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

Umschalter **Tag · Woche · Monat** (die Wahl bleibt gespeichert). Die Monatsansicht zeigt Punkte pro Tag (Prüfung pink, Schule, Jobfarbe, To-do-Ring). Tag und Woche zeigen eine Zeitachse von 00:00 bis 24:00 mit Blöcken: Unterricht (violett), Schichten mit Beginn (Jobfarbe, Länge = Stunden), nebeneinander bei Überschneidung; oben in der Zeile „ganztägig“ Prüfungen, To-dos, Ferien und Schichten ohne Uhrzeit. Eine rote Linie markiert die aktuelle Uhrzeit. Wochenleiste antippen → Tag; freie Stelle antippen → Tag öffnen, „Stunden eintragen“ übernimmt die angetippte Stunde als Beginn. Schichten haben dafür ein optionales Feld **Beginn**.

### Schule (eigener Tab zwischen Jobs und Übersicht)

- Oben ein **Auswahlmenü**: 12. Klasse (ganzes Jahr, 1. oder 2. Halbjahr), 11. Klasse (ebenso) und **Fachabi-Vorhersage**. Der Tab startet immer in der 12. Klasse (aktuelles Schuljahr 2026/27).
- **Fächer** wurden einmalig aus dem Stundenplan angelegt; umbenennen, Farbe, hinzufügen, löschen, als Fachabi-Prüfungsfach markieren.
- **Noten** mit Punkten 15–0, Art, Gewichtung, Datum, Halbjahr (11/1, 11/2, 12/1, 12/2 – folgt dem Datum, Wechsel 15. Februar). Pro Fach Schnitt und Graph. Laufende Schnitte werden auf die Note gerundet.
- **Prüfungen planen** (Plus oben rechts oder beim Fach): Fach, Art, Datum, Gewichtung 0,5–2,0, Prognose optional. Prüfungen mit Datum stehen im **Kalender der Übersicht** als ganztägiger Eintrag in Pink, im Tag-Sheet und unter „Nächste 7 Tage“. „Geschrieben – Ergebnis eintragen“ macht daraus eine echte Note.
- **Fachabi-Vorhersage** nach FOBOSO § 35 und Anlage 4 (FOS Bayern): 4 Abschlussprüfungen (Deutsch, Englisch, Mathematik, Physik) je dreifach (max. 180) + die besten 25 Halbjahresergebnisse aus 11/2, 12/1, 12/2 (max. 375; je Fach fällt höchstens eins weg; Sport zählt nicht) + fachpraktische Ausbildung (2 Halbjahre, max. 30) = höchstens 585 Punkte. Note = 17/3 − 5 · Punkte / 585, auf eine Stelle abgeschnitten; für 2,1 sind 406 Punkte nötig (genau 2,1 = 10,7 P im Schnitt). Halbjahresergebnis = gewichteter Schnitt, ab ,5 aufgerundet. Offene Teile (Halbjahre ohne Noten, offene Prüfungen) schätzt die App mit deinem bisherigen Fachschnitt; sie zeigt die Prognose, was du überall mindestens brauchst, und pro Prüfung bzw. Fach die Mindestpunkte. Die mündliche Prüfung ist nicht eingerechnet.

In der Übersicht stehen der nächste Schultag, die nächste Prüfung, der Schnitt der 12. Klasse und die Fachabi-Prognose.

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
