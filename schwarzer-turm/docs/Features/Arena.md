---
tags: [feature, arena]
---
# Arena und Wächterstatue

## Grundlagen (seit `3a2d55c`)
- Arena-Bereich `m.arena={x,y,r}` mit Statue `type:'colossus'` (großes Sprite, eigene Hover-/Interaktionsdistanz 2.2). Auf der Overworld/dem Hügel; Quest-Ziel `q.ty==='arena'` sucht die Statue in `m.home.objs`.
- Statue erwacht erst ab `G.maxFloor>=20`. Max. 12 lebende Arena-Gegner, 1,2 s Abklingzeit (`G.sumT`).
- Jede Berührung ruft **3 Gegner** auf Stufe des Helden (`G.mlvl=P.lvl`), Pool `varPool(floor(lvl/2)+1)`, Rang: 8 % unique, 14 % champ, sonst normal. Gegner tragen `e.arena=true`. Kills zählen für Quest `qInc('arena')`.

## Änderung 2026-11-02 (`2aec3eb`)
Wunsch: „in der Arena dürfen nur Gegner spawnen, die man schon besiegt hat, und sie dürfen wirklich nichts droppen – nur fürs Leveling, auch keine Glut. Und alle aus der Multiplayer-Host-Map sollen die Statue aktivieren können.“

### Nur besiegte Gegnerarten
- Neues Feld `stOf().kv` = `{variantId:1}` (liegt in `P.st2`, wird dadurch mitgespeichert).
- `kvOf()` legt es beim ersten Zugriff an. **Alte Spielstände:** Es gibt keine Kill-Daten pro Variante, nur pro Familie (`S.kills[type]`, `P.qc['k_'+type]`). Daher werden alle Varianten einer Familie freigeschaltet, deren Familie schon getötet wurde (bewusste Näherung).
- Ab jetzt merkt sich der äußerste `killEnemy`-Wrapper jede getötete Variante: `kvOf()[e.vid]=1` (nur echte Gegner, keine Übungspuppe `dummy`, keine Mauer `wall`).
- `summonArena(o,rq)` ist komplett ersetzt: Pool = `varPool(...)` gefiltert auf `kv`. Leerer Pool → „Die Statue findet in dir keinen Gegner, den du schon bezwungen hast.“ Rückgabe `true/false`.

### Keine Beute, keine Glut
Drei Schichten, damit wirklich nichts durchrutscht:
1. Basis-`killEnemy`: Glutzeile jetzt `if(!e.arena){P.glut+=gl;ftext(…'+Glut')}` (auch kein „+Glut“-Text mehr). `n=nj=0` für Items/Ramsch gab es schon; Tränke, Wunder-Unique und Runen (`runeDrop`) waren schon per `!e.arena` gesperrt.
2. Äußerster Wrapper `_killEnemyAr`: für Arena-Gegner wird `dropItem` während des Aufrufs durch eine leere Funktion ersetzt; danach wird `m.items` auf die alte Länge gekürzt und `P.glut` auf den alten Wert zurückgesetzt, falls ein anderer Wrapper (z. B. Drachen-Drop `_killEnemyDr`, Schiefer) etwas hinzugefügt hat.
3. Erfahrung bleibt erhalten (`gainXp`).
- Getestet: Gegner auf Rang 'boss' gesetzt und getötet → Glut 0→0, Items 0→0, XP 0→263.

### Statue für alle Spieler auf der Host-Karte
- Gast (`mpOn() && mpHostHere()`) klickt Statue → lokale Prüfung `maxFloor>=20` und Abklingzeit, dann `mpSend({t:'ar',id,lvl:P.lvl,mf:G.maxFloor,kv:[…ids],nm})`. Der Gast spawnt **nichts lokal**.
- Host (`mpRecv`-Wrapper, `NET.role==='host'`, `G.floor===0`, Arena vorhanden) ruft `summonArena(null,{id,lvl,mf,kv,nm})`: Stufe und Gegnerliste **des Fragenden**, Prüfung `mf>=20` mit dessen Wert. `G.mlvl` wird nur kurz gesetzt und danach zurückgesetzt; jeder Gegner bekommt `e.ml=lvl`. Log: „<Name> weckt den Wächter · drei Gegner auf Stufe N“.
- Ablehnung → Host schickt `{t:'arx',to,why:'full'|'none'}`, der Gast zeigt die passende Meldung.
- Die Gegner kommen über den normalen Host-Sync (`mpDesc` kopiert das Bool `arena`) zum Gast; dessen Kill eines Spiegel-Gegners läuft lokal durch `killEnemy` → XP ja, Glut/Beute nein, `kv` wird gemerkt.
- Ist der Gast nicht auf der Host-Karte, verhält sich die Statue wie offline.

## Godot (2026-11-10)
Die Statue steht auch in der Godot-Fassung (`godot/scripts/arena.gd`): gleiche Regeln (ab Ebene 20, drei Gegner auf Heldenstufe, nur besiegte Arten, höchstens zwölf, keine Beute und keine Glut). Die Mehrspieler-Anfrage der Gäste fehlt dort noch. Details in [[Godot-Umstieg]].

Siehe auch [[Multiplayer]].
Zurück zu [[Start]].
