---
tags: [wiki]
---
# Turm-Wiki (Kompendium)

`turm-wiki/index.html` im Repo-Wurzelordner, live unter `/turm-wiki/`.

- Lädt `../schwarzer-turm/index.html` per `fetch` in einen versteckten iframe (`srcdoc` mit `<base href="../schwarzer-turm/">`), hängt die Eval-Brücke `__ev` an und stellt `requestAnimationFrame`/`setInterval` ab (kein Spielablauf, keine Musik, kein Speichern).
- `EXTRACT()` liest `VAR/MON`, `BOSSES/WB/makeRgBoss`, `BASE`, `UNIQ`, `AFF`, `RUNES/RW`, `CLS/SKILLS`, `TALES`; Werte pro Monsterstufe durch kurzes Umsetzen von `G.mlvl`.
- `PICS()` zeichnet mit den Spielfunktionen: `drawEnemy` (zugeschnitten), `invIcon`, Runen über `_makeRuneL`, Fertigkeiten aus `SKIC`.
- Aktualisiert sich bei jedem Spiel-Update von selbst; nur bei umbenannten internen Namen anpassen.

Zurück zu [[Start]].
