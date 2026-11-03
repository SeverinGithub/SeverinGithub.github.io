---
tags: [technik]
---
# Architektur

## Quellcode in `src/`, gebaut zu einer Datei (seit 2026-11-03)
- **Bearbeitet wird nur `src/`**, nie `index.html` direkt. `node tools/build.mjs` setzt daraus die eine `index.html` zusammen. Die bleibt eine einzelne Datei, damit GitHub Pages, das Turm-Wiki und Artefakte unverändert funktionieren.
  - `src/shell.html`: HTML-Gerüst (`#title`, Panels `pChar/pInv/pSkill/pShop/pColl/pStash`, `#dialog`, `#tip`, …) mit den Platzhaltern `/*@CSS*/` und `//@JS`.
  - `src/style.css`: das ganze CSS.
  - `src/js/NNN-name.js`: ~100 Module, nach Nummer zusammengehängt in **ein** IIFE `(()=>{'use strict'; … })();`. Alle Module teilen also einen Gültigkeitsbereich, und ein späteres Modul sieht und umhüllt alles aus früheren.
  - `src/INDEX.md` wird beim Build erzeugt: pro Datei die definierten Namen und die umhüllten Funktionen (`↻`). **Erste Anlaufstelle, um Code zu finden.**
- Der Build prüft die Syntax (`node --check`) und meldet die fehlerhafte Quelldatei samt Zeile. `--test` erzeugt zusätzlich `_t.html` mit Eval-Brücke, `--check` prüft nur, ob `index.html` aktuell ist.
- Assets (Musik, Sounds) liegen außerhalb im Repo (`music/`, `sfx/`). Grafik wird zur Laufzeit gezeichnet: Canvas 2D in kleiner Auflösung, dann per WebGL (`initGL`/`present`) mit Palette, Licht und Grain ausgegeben. **Der 2D-Canvas wird nach dem Hochladen geleert**, für Nahaufnahmen deshalb Objekte in einen eigenen Canvas zeichnen (siehe [[Test-Workflow]]).

## Ändern statt umhüllen
- **Fehler und Änderungen an bestehendem Verhalten** werden direkt in der Datei gemacht, in der der Code steht (Fundort über `src/INDEX.md` oder `grep -n name src/js/*.js`). Das geht jetzt, weil jede Datei klein ist. Neue Wrapper-Schichten auf alte Funktionen vermeiden.
- **Neue Systeme** bekommen eine eigene Datei mit freier Nummer vor `999-boot-loop.js`, z. B. `970-…js`. Zwischen bestehenden Nummern ist Platz (Zehnerschritte).
- Wrapper bleiben erlaubt, wenn ein neues System sich bewusst in ein fremdes einklinkt:
  ```js
  const _killEnemyAr=killEnemy;killEnemy=function(e,a){ … _killEnemyAr(e,a) … };
  ```
  - Funktionsdeklarationen und `let` sind neu zuweisbar, **`const`-Funktionen nicht** (z. B. `mpOn`, `later`, `stOf`, `canSock`, `wFoes`, `mElem`, `free`, `walkable`).
  - Die Namen der gespeicherten Originale müssen eindeutig sein. Der Build findet doppelte `const`.
  - Der Wrapper in der höchsten Dateinummer ist der äußerste.
- Altlast: Viele Funktionen tragen noch Wrapper-Stapel aus der Ein-Datei-Zeit (`src/INDEX.md` zeigt sie mit `↻`). Wer ein System ohnehin anfasst, faltet dessen Wrapper nach und nach in die Grundfunktion zurück (siehe [[Offene Punkte]]).

## Zentrale Globals
- `G` – Spielzustand: `state` ('title'|'play'|'paused'|…), `floor` (0 = Overworld/Hügel), `map`, `t` (Zeit), `proj`, `zones`, `rings`, `bolts`, `fx`, `labels`, `maxFloor`, `mlvl` (Monsterstufe), `shake`, `vproj`/`vzones` (nur optisch, Multiplayer).
- `P` – der Held (`let P`): `x,y,face,hp,mp,lvl,cls,eq,inv,sk,d` (abgeleitete Werte inkl. `d.okS` = Set der erfüllten Ausrüstung), `qi` (Questindex), `qc` (Questzähler), `st2` (Statistik, siehe `stOf()`), `glut`.
- `CFG` – Einstellungen, gespeichert mit `saveCfg()` in localStorage (`CFG.lblOff`, `CFG.lootf`, `CFG.mpName`, …).
- `NET` – Multiplayer: `role` ('host'|'guest'|null), `me`, `others` (Map id → Remote-Spieler `r`).
- Daten: `VARS`/`VAR` (Gegnervarianten), `BASE` (Item-Grundformen, Schlüssel = Name), `UNIQ`, `RUNES`/`RBY`, `RW` (Runenwörter), `SKILLS`/`SKBY`, `CLS`, `EL` (Magier-Elemente), `TALES` (Lore-Texte für Objekte).

## Karten
- Overworld (`floor 0`, `m.world`): Himmelsinseln in Chunks; Startinsel = `m.home` mit `HOX/HOY` (Mitte `HOX+22.5`). Objekte der Startinsel stehen in `m.home.objs` und werden über `m.ac=null;owTick()` in `m.objs` übernommen.
- Objekte haben `type`; gezeichnet über `drawObj(o)`, benutzt über `interact(o)`, angewählt über `hoverObj()` – alle drei werden pro Typ umhüllt.
- Turm-Ebenen 1…n (`kind:'dungeon'`), Arena-Bereich `m.arena={x,y,r}` mit Statue `colossus`.

## Speichern
- `saveData()` wird umhüllt, um Felder an `d.p` zu hängen (z. B. `st2`, `slv`). Was in `P.st2` liegt, wird automatisch gespeichert (genutzt für `kv`, siehe [[Arena]]).

Zurück zu [[Start]] · weiter zu [[Code-Landkarte]].
