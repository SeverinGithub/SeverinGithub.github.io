---
tags: [technik]
---
# Architektur

## Eine Datei, ein IIFE
- Alles liegt in `schwarzer-turm/index.html`: CSS im `<style>`, HTML-Gerüst (`#title`, Panels `pChar/pInv/pSkill/pShop/pColl/pStash`, `#dialog`, `#tip`, …), dann ein großes `<script>` mit einem IIFE `(()=>{ … })();`.
- Assets (Musik, Sounds) liegen außerhalb im Repo (`music/`, `sfx/`); Grafik wird zur Laufzeit gezeichnet (Canvas 2D + WebGL-Nachbearbeitung).
- Gerendert wird in den 2D-Canvas `cv` (logische Größe `W×H`, Zoom `ZM`), danach per WebGL (`initGL`) mit Licht/Grain ausgegeben. **Der 2D-Canvas wird nach dem Hochladen geleert** – für Nahaufnahmen deshalb Objekte in einen eigenen Canvas zeichnen (siehe [[Test-Workflow]]).

## Wrapper-Muster (wichtigste Konvention)
Funktionen werden nie umgeschrieben, sondern weiter hinten im Code umhüllt:
```js
const _killEnemyAr=killEnemy;killEnemy=function(e,a){ … _killEnemyAr(e,a) … };
```
- Funktionsdeklarationen (`function x(){}`) und `let`-Variablen sind dadurch neu zuweisbar. **`const`-Funktionen nicht** (z. B. `mpOn`, `later`, `stOf`, `canSock`, `wFoes`, `mElem`) – vor dem Umhüllen prüfen: `grep -n "const name=\|function name(" index.html`.
- Variablennamen der gespeicherten Originale müssen eindeutig sein (`_updForgeG` gab es schon → `_updForgeGr`). Vor dem Einfügen auf Doppelte prüfen.
- Der zuletzt definierte Wrapper ist der äußerste. Neue Module werden **direkt vor** der Init-Zeile eingefügt:
  ```js
  expandItems();buildPalette();buildUI();initGL();buildSprites();buildEnvSprites();buildGrain();
  ```
  Damit sind sie äußerer als alle bestehenden Wrapper (z. B. alle 15 `killEnemy`-Wrapper liegen davor).

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
