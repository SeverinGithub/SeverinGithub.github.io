---
tags: [feature, items, startinsel]
---
# Schleifstein

Wunsch (2026-11-02): „Auf der Startinsel weiter links vom Enchanting Table soll ein Schleifstein sein; wenn man ein gesockeltes Item reinlegt, kommen als Output das Item und die Runen getrennt raus.“ Umgesetzt in `2aec3eb`.

## Platzierung
- Objekt `{type:'grind',name:'Schleifstein'}` in `m.home.objs`, gesetzt von `grindTick` sobald der Glyphentisch existiert: `nearWalk(HOX+22.5-4.8, HOY+22.5+12.9)`, danach `m.ac=null;owTick()`.
- Zum Vergleich: Amboss `(cx+.5, cy+10.5)`, Glyphentisch `(cx-2.2, cy+11.6)`. Im Iso-Bild heißt „links“ kleineres x / größeres y. Der Stein steht nah an der Inselkante links neben dem Glyphentisch.

## Optik (`drawGrind`)
Im Low-Poly-Stil wie Amboss/Glyphentisch, in lokalen Pixelkoordinaten gezeichnet:
- Wassertrog aus Planken (Oberseite, zwei Seitenflächen, Wasser mit schimmerndem Licht).
- Hinterer und vorderer Holzbock, Querbalken.
- Steinscheibe als Ellipse mit Verlauf (hell oben links), dunkler Rand, Glanzbogen, 6 kleine Marken, die mit `o.rot` drehen; unten nass, wo sie ins Wasser taucht.
- Achse nach rechts mit Kurbel (Griff aus Holz), dreht mit.
- Nach dem Schleifen (`G.grindFx`, 1,1 s): Rad dreht schnell, warmer Glutschein, Funkenflug.
- Hover-Label „Schleifstein“ (gold). Lore in `TALES.grind`.

## Ablauf
- `interact` → `openGrind()` öffnet `#dialog` (Überschrift „Schleifstein“ mit Marker `data-grind-root`), Liste aller Gegenstände mit eingesetzten Runen – zuerst angelegte (`P.eq`), dann Inventar – mit Icon (`invIcon` liefert eine Data-URL), Name in Seltenheitsfarbe, Runennamen und Herkunft. Hover zeigt den normalen Item-Tooltip.
- Klick (`[data-grind]`, Capture-Listener) → `grindItem(it)`:
  1. Runenwort: `w.m` abziehen, `rw` löschen, `rar='normal'`, Name = `it.name0` (falls vorhanden und ≠ Runenwortname) sonst Grundname `it.b`.
  2. Mods jeder Rune (`RBY[k][sgrp(it)]`) abziehen; Werte ≈0 werden gelöscht.
  3. `req.lvl` = `it.req0`; bei alten Items ohne `req0` Rückfall `grindReq`: Grundform-Stufe (normal/Runenwort), `max(b.lvl, floor(ilvl*.7))` (magisch/selten) bzw. Unique-Stufe.
  4. `runes=[]`, Sockelanzahl `soc` bleibt → Sockel wieder frei.
  5. Runen mit `_makeRuneL` neu erzeugt, ins Inventar (`invAdd`), bei vollem Inventar fallen sie am Schleifstein zu Boden.
- Rückmeldung: Funken + Lichtblitz, Schleifgeräusch (`sample('sword',.55,{rate:.55})`, dann Truhen-Klick), bei Runenwort zusätzlich `sfx('unique')`, Log-Zeile, Dialog zeigt „Vom Stein“: Item („N Sockel frei“) und jede Rune als Kachel mit Pop-Animation, ggf. „Das Runenwort ‚…‘ ist verklungen.“
- Dialog schließt sich, wenn der Spieler sich mehr als 0,8 wegbewegt.
- Kosten: **keine** (nicht besprochen; ggf. nachfragen, ob Glut kosten soll).

## Test
Alle 15 Runenwörter + ein magisches Item: einsetzen → schleifen → Name, Seltenheit, Anforderung und Mods exakt wie vorher. Auch der Rückfallweg ohne `req0/name0` stimmt.

Zurück zu [[Start]].
