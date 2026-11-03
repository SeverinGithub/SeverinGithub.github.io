---
tags: [feature]
---
# Der Hügel: die Startinsel als Dorf

Seit 2026-11-03. Vorher standen die Stationen mit festen Abständen zu Odalinde, zur Tür oder zur Turmmitte irgendwo im Gras (`nearWalk`). Jetzt legt `988-hill-village.js` einen Grundriss über die Insel. Die Stationen behalten ihre eigenen Module (Zeichnen, Dialoge, Ticks). `hvTick` versetzt sie nur an ihre Plätze (`H.hvS`, Merker `o.hvp`).

## Grundriss
Winkel und Abstände zählen ab der Turmmitte (lokal 22,5 / 22,5). Liegt der Inselrand zu nah, rückt alles nach innen (`hvEdge`), denn die Insel hat je nach Seed eine andere Form.

| Viertel | Wo | Was dort steht |
|---|---|---|
| Ring | Radius 4,7 um den Turm | gepflasterter Weg, 8 Laternen außen herum |
| Dorfplatz | vor dem Tor (45°, Abstand 8) | Leuchtfeuer im Steinkreis, Brunnen, Truhe, zwei Bänke, zwei Banner am Torweg, Wegweiser |
| Markt | Osten, an der Straße zur Arena | Odalinde nördlich der Straße zwischen Übungsplatz und Riss-Stein (−16,5°, Abstand 8,8; vom Nutzer so gewünscht), mit Kräuterbeeten, Fass und Kiste; Brannoc südlich am Dorfplatz mit Löschfass und Kohle |
| Werkstatt | Südwesten (102°) | Amboss, Glyphentisch und Schleifstein in einer Reihe unter einem Pultdach mit Werkzeugwand, Holzstapel und Kohle dahinter |
| Gelehrtenwinkel | Westen (165°), an der Westbrücke | Eldriks Schreibstube, Hecke dahinter, Bücherkisten, Kräutergarten |
| Friedhof | 135° am Rand | Eisenzaun mit Tor zur Werkstattgasse, Gräber, ein alter Baum |
| Übungsplatz | Nordosten, wie bisher | Strohpuppe, Heu, Gestell, Zaun, Hühner (die verstreuten Laternen und Blumen von dort sind weg) |
| Steg | am Rand vor dem Platz (ohne Brücke in der Nähe) | Holzplanken über dem Abgrund, Bank, Fernrohr, Laterne |

## Wege
- Straßen sind Steinboden (Feld 7). Sie laufen nur auf Gras der Startinsel.
- Vom Ring führt eine Straße zu jeder Brücke. Die Brücken sucht `hvHeads` zur Laufzeit: Brückenfelder (8) neben Gras, höchstens 20 Felder von der Mitte.
- Dazu kommen Torweg, Marktgasse, Werkstattgasse bis zum Friedhofstor, ein Weg zu Eldrik, einer zum Übungsplatz und einer zum Steg.
- **Brückentore:** An jeder Brücke stehen zwei Steinpfeiler (`hvwall`) und eine Laterne.
- **Wegweiser** (`hvsign`, ein Objekt) stehen am Platz und an jeder Brückenstraße. Ihre Bretter zeigen in die Richtung ihrer Ziele. Ein Klick öffnet ein kleines Fenster (`#hvpop`) mit allen Orten des Dorfs (`H.hvDest`) und der Entfernung in Schritten. Wählt man einen Ort, legt `hvGuide` eine Spur aus goldenen Pfeilen auf dem kürzesten Weg dorthin (`findPath`). Pfeile hinter dem Helden erlöschen, am Ziel heißt es „Du bist da“, nach 90 s erlischt die Spur. Geht man vom Schild weg, schließt sich das Fenster.
- **Laternen** (`hvlamp`) stehen abwechselnd links und rechts an den Straßen. Nachts leuchten sie (`PLIGHT.hvlamp`).
- Gras-Büschel auf Steinen und wilde Blumen zwischen den Häusern fallen weg. Lose Felsen nahe der Mitte werden entfernt.

## Friedhof
Wird ein Held aus der Heldenliste gelöscht, merkt sich der Wrapper um `hPut` Name, Klasse und Stufe (`SAVEKEY-graves`, höchstens 12). Auf den Gräbern stehen die letzten fünf. Wer nahe herangeht, liest die Inschrift. Freie Gräber tragen alte Namen aus dem Dorf (`HVRIP`).

## Dorfbewohner (`hvfolk`, `hvWalk`)
Sie gehen feste Runden, warten an den Enden und sagen etwas, wenn man nahe ist. Sie verwenden dieselbe Figur wie der Held (`humanoid`) und gehen mit demselben Gang.
- **Lehrling Tam:** trägt einen Sack Erz von Brannoc zur Werkstatt.
- **Magd Wilma:** trägt Eimer zwischen Brunnen und Odalinde.
- **Pim** (Kind): rennt um das Leuchtfeuer.
- Ab 3 Hütern **Wache Gernot** mit Speer an der Arenastraße, ab 6 **Gärtnerin Hedda**, ab 8 ein zweites Kind (**Lotte**).

## Wachstum (`hvGrow` = besiegte Hüter, höchstens 8)
| Hüter | Neu |
|---|---|
| 1 | Händlerzelt, Kiste und Banner am Markt |
| 2 | erstes Haus |
| 3 | dichtere Laternen, Wache |
| 4 | zweites Haus |
| 5 | Wachturm mit Fackel am Brückentor zur Arena |
| 6 | drittes Haus, Gärtnerin |
| 7 | Wimpelketten über dem Dorfplatz |
| 8 | Banner an jedem Brückentor, zweites Kind |

Ändert sich die Zahl, macht `hvUndo` alle Feld-Änderungen rückgängig und baut neu (Liste `H.hvU`). Dazu erscheint „Der Hügel wächst“ als Banner und im Log.

## Technik
- Straßen bekommen Gras unter das Pflaster (`210-render.js`, nur Oberwelt). Sonst schimmerte der blaue Himmel als Fugen durch.
- Das Werkstattdach wird durchsichtig, wenn der Held darunter oder dahinter steht.
- `hvBuild(m)` legt zuerst alle Brücken der Startinsel an (`owBridge` für die Nachbar-Chunks), damit die Wege sie auch finden, wenn der Held woanders lädt.
- Feste Teile sind Blöcke mit eigenem Bild (`SPR.prop.hvhedge`, `hvwall`, `hvwell`, dazu `grave`, `tree`, `house`, `tent`, `barrel`, `crate`). Offene Teile sind Props mit `hv` vor dem Namen. `hvDraw` zeichnet sie.
- Der Startpunkt (`m.start`) liegt am Dorfplatz.
- Alles ist aus `G.seed` ausgewürfelt. Nur das Wachstum hängt vom eigenen Helden ab, im Multiplayer sieht also jeder sein eigenes Dorf.

## Noch offen
- Im echten Spiel prüfen, ob alle Stationen von allen Seiten gut erreichbar sind und nichts im Weg steht. Getestet wurden drei verschiedene Seeds.
- Häuser sind bisher nur Kulisse und haben keine Türen.

Zurück zu [[Start]].
