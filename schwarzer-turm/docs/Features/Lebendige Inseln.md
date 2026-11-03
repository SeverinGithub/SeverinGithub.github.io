---
tags: [feature, welt]
---
# Lebendige Inseln

Seit 2026-11-03, das Starterpaket aus den [[Welt-Ideen]]. Alles steckt in `989-living-isles.js`. Was auf den Inseln liegt, wird pro `G.seed` ausgewürfelt (`hsh`), sodass alle Mitspieler es gleich sehen. Was sich bewegt (Vögel, Blätter, Glühwürmchen), sieht jeder für sich.

## Am Boden (`lvGround`, im `drawDecals`-Wrapper)
- **Gras im Wind:** Die Grasbüschel (`tuft`) sind keine flache Deko mehr. Sie neigen sich mit dem Wind und weichen zur Seite, wenn der Held oder ein Gegner hindurchgeht. Unter den Füßen raschelt es.
- **Trampelpfade:** Auf normalen Inseln läuft von der Mitte zu jeder Brücke ein leicht krummer Pfad, ein Feld breit. Er ist kein Overlay, sondern eigene Bodenfelder (`LVS.path`, 6 Varianten): dieselbe Art Kachel wie das Gras, nur gelblicher, mit weniger Halmen, etwas Erde und Kieseln. Wo der Pfad zur Seite springt, kommt ein Zwischenfeld dazu, damit die Felder sich an einer Kante berühren und nicht nur an einer Ecke. Auf dem Pfad liegt keine Deko.
- **Bodenflecken:** Moos, Klee mit kleinen Blüten, Laub (auch unter Bäumen), Kies und Schlammflecken. Wie viel wovon, hängt von der Inselart ab: Wald hat viel Moos und Laub, die wilde Insel Klee, Felsinseln und Ruinen Kies.
- **Pfützen:** Nach Regen füllen sich die Schlammflecken (`LV.wet`) und spiegeln den Himmel. Danach trocknen sie in etwa zwei Minuten. Im Regen ziehen sie Ringe.

## In der Luft (`lvAir`, im `drawFxWorld`-Wrapper)
- **Wind** (`LV.wind`) folgt dem Wetter: bei Regen und Schnee stark, bei Nebel kaum, dazu Böen. Er trägt Blätter (vor allem im Wald), Pusteblumensamen oder bei Ascheregen Asche. Bei starkem Wind ziehen feine Luftschlieren.
- **Schwärme:** Alle 16 bis 38 s zieht ein Schwarm in V-Form hoch über die Inseln, nachts sind es Fledermäuse. Über Land werfen sie einen kleinen Schatten.
- **Krähen auf Gräbern:** Auf Gräberinseln sitzen bis zu drei Krähen auf Grabsteinen und picken. Kommt man näher als 3,4 Felder, fliegen sie krächzend auf und kreisen. Sind alle mehr als 7,5 Felder weg, landen sie nach 5 s wieder.
- **Mücken** tanzen unter Bäumen und über Schlamm (nicht nachts), **Bienen** an Blumen (am Tag), **Motten** umkreisen nachts jedes Licht: Feuer, Laternen, Pilze.
- **Bröckelnde Ränder:** Alle ein bis zwei Sekunden lösen sich an einer sichtbaren Inselkante kleine Steine und fallen in die Tiefe, manchmal mit Staub und leisem Grollen. Bei Erschütterungen (`G.shake`) passiert das viermal so oft.

## Im Dunkeln (`lvGlow`, im `drawFxGlow`-Wrapper)
- **Glühwürmchen** erscheinen nachts über Land (im Wald bis 40, auf Felsen wenige), blinken langsam und weichen dem Helden aus. Bei Tagesanbruch verlöschen sie.
- **Runensteine** (`lvrune`, ein Block): auf Ruineninseln meist zwei, auf Gräberinseln oft einer, auf wilden Inseln und im Wald selten. Die Runen sind eingeritzt. Kommt man näher als 4,5 Felder, glühen sie auf (Ruinen eisblau, Gräber grün, Wildnis violett), es klingt leise, Funken steigen auf, und der Stein gibt etwas Licht. Danach verblassen sie langsam über 6 s.

## Klang (alles erzeugt, keine Dateien)
- `lvNoise` für Rascheln und Grollen, `lvChime` für die Runen, `lvCaw` für die Krähen.
- **Flüstern** (`lvWhisper`): Alle 18 bis 40 s flüstert es mit 70 % Chance, wenn ein Runenstein oder eine Gruft näher als 7 Felder ist (nachts auch bei den Gräbern). Das Flüstern ist gefiltertes Rauschen mit wechselnden Silben und kaltem Echo. Es kommt von der Seite, auf der der Ort liegt.

## Technik
- `owContent`-Wrapper: legt pro Chunk `c.lv` an (`tuft`, `path`, `patch`, `rune`, `crow`, `gnat`, `bee`). Die Büschel werden dafür aus `c.deco` herausgenommen. Runensteine setzen ihr Feld auf 9 wie andere Blöcke.
- `owTick`-Wrapper: Wechselt die Menge der aktiven Chunks, setzt er `m.lv` aus ihnen neu zusammen.
- `updWorld`-Wrapper ruft `lvTick` auf (nur in der Oberwelt).
- Der Hügel bekommt Wind, Schwärme, Glühwürmchen und Ränder, aber keine Pfade oder Flecken, denn er hat sein eigenes Dorf ([[Der Hügel]]).
- Runensteine halten Abstand zu jedem Weg von einem Brückenkopf zur Inselmitte, auch zu den geknickten Wegen großer Inseln (`onWay`), und stehen nie auf dem Pfad.
- Kosten im Test: unter 0,1 ms pro Bild für alles Zeichnen.

## Noch offen
- Im echten Spiel mit Ton prüfen, ob Flüstern und Krähen gut laut sind.
- Große Inseln (Riesen- und Langinseln) haben noch keine Trampelpfade.

Zurück zu [[Start]].
