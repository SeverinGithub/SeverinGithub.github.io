---
tags: [feature]
---
# Helden und Spielstände

Seit 2026-11-03 gibt es keine Speicherplätze mehr, sondern eine **Heldenliste**: Jeder Held hat seinen eigenen Spielstand und speichert sich selbst. Ein neuer Held überschreibt nie einen alten.

## Für Spieler
- Titel: **Fortsetzen** spielt den zuletzt gespielten Helden („Name · Klasse · Stufe … · Datum“), **Neuer Held** legt immer einen zusätzlichen an, **Helden** öffnet die Liste.
- Liste: Name antippen und ändern, **Spielen**/**Fortsetzen**, **✕** löscht nur nach zweitem Tippen innerhalb von 4 s („Wirklich löschen?“).
- Esc-Menü: „Speichern“ meldet „Gespeichert · Name“; dort gibt es ebenfalls **Helden** (Wechsel speichert zuerst den aktuellen Helden, beendet Multiplayer und lädt die Seite neu, der gewählte Held startet sofort) und „Neuen Helden beginnen“ (speichert, dann Klassenwahl).
- **Position**: Beim Speichern wird Ebene und Standort gemerkt (`g.pos={f,x,y}`, nicht im Tod oder am Boden). Fortsetzen beginnt genau dort, auf der Oberwelt über `G.owAt`, im Turm durch Setzen von `P.x/P.y` nach `begin(f)`, falls der Punkt begehbar ist; sonst wie früher beim Leuchtfeuer.

## Technik (`src/js/790-heroes.js`)
- Schlüssel: `SAVEKEY+'-heroes'` (Index: `{id,n,cls,lvl,pl,fl,t}`), `SAVEKEY+'-cur'` (aktueller Held), `SAVEKEY+'-h-'+id` (Spielstand).
- `save`/`loadData` werden überschrieben und meinen immer den aktuellen Helden; `startNew` legt vor dem ersten Schritt einen neuen Eintrag an. Ist der Browser-Speicher voll, gibt es einmal eine rote Meldung.
- **Übernahme** (`hMigrate`, einmalig, solange der Index fehlt): der alte Einzelspielstand und die zehn Plätze aus `SAVEKEY+'-slots'` werden zu Helden (doppelte Stände nur einmal), danach werden die alten Schlüssel gelöscht.
- Position: `saveData` in `280-save.js` (`pos`), Wiederherstellung im `btnCont`-Handler in `440-menus.js`.
- Getestet: Übernahme aus altem Stand und Plätzen, Wechsel aus Titel und Pause, Löschen mit Bestätigung, neuer Held neben altem, Position auf der Oberwelt und auf Ebene 1.

Zurück zu [[Start]].
