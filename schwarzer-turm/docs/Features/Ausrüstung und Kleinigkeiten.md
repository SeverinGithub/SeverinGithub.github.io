---
tags: [feature, ui]
---
# Ausrüstung und kleinere Änderungen

## Zweihand-Anzeige (`db01a8f`)
Wunsch: Wenn ein Item zwei Hände belegt, dasselbe Item leicht ausgegraut nochmal in der anderen Hand zeigen.
- Ausrüstungs-Template: Schildslot leer **und** `P.eq.weapon.twoH` → `<img class="px twoh" …><span class="lbl">Zweihändig</span>`.
- CSS: `.eq img.twoh{opacity:.42;filter:grayscale(1) brightness(.95)}`.

## Umhänge entfernt (`9a7e14e`)
- In `386bf34` bekam jeder Held einen Umhang in einer von zehn Farben (pro Spielstand zugelost, im Multiplayer sichtbar, mit Stoffphysik).
- Nach der neuen [[Magierrobe]] wollte der Nutzer: „Mach das Cape erstmal komplett aus dem Game raus, das macht keinen Sinn, wenn der Magier jetzt eh so cool aussieht.“
- Entfernt: `drawCape`, `capeSpring`, das CAPES-Modul, Cape-Einträge im Look, `capeS`-Props, Multiplayer-Cape-Felder – bei Helden, Mitspielern und Skelettrittern.
- „Erstmal“ → eventuell kommt die Idee später wieder; dann neu bauen, nicht aus der Historie zurückholen ohne Rückfrage.

## Quest-Dialog-Fix (`5eed86c`)
- Fehler: Beim Questgeber blieb manchmal ein goldener Block im Dialog (der Fortschrittsbalken der Questkarte war absolut positioniert).
- Fix: `#dialog .qbar i{display:block;position:static;height:100%;…}`.

Zurück zu [[Start]].
