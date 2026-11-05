---
tags: [verlauf]
---
# Entscheidungen

Was entschieden wurde und warum, neueste zuerst.

| Datum | Entscheidung | Warum / Quelle |
|---|---|---|
| 2026-11-02 | Vier Klassen: Krieger, Jägerin (Banditin, Klingen), Magier (klassisch), Alchemist (Bogen/Armbrust/Holzzauberstab + Wurftränke); Wanderer entfällt | Nutzer: jede Klasse soll sich anders spielen |
| 2026-11-02 | Fremde Waffen tragbar, aber halber Schaden und keine Waffenfertigkeiten | Nutzer: „helfen überhaupt nicht, arbeiten gegen den Build“ – Singleplayer soll nicht blockiert sein |
| 2026-11-02 | Wurftränke kosten nur Mana | Nutzer: „Fähigkeiten wie alles andere“ |
| 2026-11-02 | Alte Wanderer wählen beim Laden neu; Stufe/XP/Gegenstände bleiben, Punkte kommen zurück | Nutzer: Weiterspielen soll Spaß machen |
| 2026-11-02 | Talentbaum 4 Zweige, Reset für alle | Folgt aus den Klassen; Punkte kommen zurück |
| 2026-11-02 | Neue Waffen erst nach `expandItems` anlegen | Sonst verschieben sich die 240 generierten Unikate |
| 2026-11-02 | Tab = Bodennamen, Minikarte auf **V** | Nutzer per Rückfrage: „Tab für Namen, Minikarte auf andere Taste“; vorgeschlagenes O war schon Statistik |
| 2026-11-02 | Arena: nur Varianten, die der Held schon getötet hat; alte Saves schalten ganze getötete Familien frei | Keine Kill-Daten pro Variante in alten Saves |
| 2026-11-02 | Arena-Gegner: XP ja, Items/Runen/Tränke/Glut nein – dreifach abgesichert | Nutzer: „wirklich nichts droppen, nur fürs Leveling, auch keine Glut“ |
| 2026-11-02 | Statue im MP: Host spawnt mit Stufe + Gegnerliste des Fragenden | Gegner gehören dem Host; so passt die Stufe zu dem, der fragt |
| 2026-11-02 | Remote-Fähigkeiten: echte Fertigkeit in Sandbox statt Nachbau | Alle 31 neuen Fertigkeiten sehen exakt aus wie beim Wirkenden, auch künftige |
| 2026-11-02 | Schleifstein kostenlos, Sockel bleiben, Runenwort zerfällt, Runen kommen heil zurück | Nutzer: „Item und Runen getrennt raus“ |
| 2026-11-02 | Runen beim Schleifen über `_makeRuneL` erzeugen | Sonst würden sie vor 3 Bossen zu Ramsch |
| 2026-11-02 | Chronik-Angleich ohne jede Belohnung | Nutzer: sonst „auf einmal zu OP“ |
| 2026-11-02 | iPad: Rolle = großer Knopf rechts, Angriff = kleiner Knopf links | Nutzer: „hat sich wieder vertauscht, Rolle rechts, Angriff klein links“ |
| 2026-11-02 | Umhänge komplett entfernt | Neue Magierrobe macht sie überflüssig |
| 2026-11-02 | Titelbildschirm neu, Inhalt/Buttons/IDs unverändert | Nutzer: „inhaltlich alles gleich, darf viel cooler aussehen“ |
| 2026-11-02 | Magierrobe im eigenen Poly-Stil, inspiriert von Pixel-Art-Vorlage | Nutzer-Screenshot als Vorlage |
| 2026-11-02 | Bosse „sehr schwer“ und adaptiv: ~68 s Kampf, ~7 volle Treffer tödlich, Elden-Ring-Gefühl | Nutzer: „immer sehr sehr schwer“, „elden ring boss system“ |
| 2026-11-02 | Normale Gegner nur sanft angepasst (±35 %) | Nutzer wählte „Sanft“ |
| 2026-11-02 | Multiplayer-Bosse: stärkster Spieler als Basis, Leben ×N, Schaden ×(1+0,25·(N−1)) | Nutzer-Beispiel: 3 Spieler → 3× Leben, 1,5× Schaden |
| 2026-11-02 | Karte: Zwei-Finger-Zoom + Plus/Minus | Nutzer wählte „Zwei-Finger-Zoom“ |
| 2026-11-03 | Quellcode in `src/js/` aufgeteilt (~100 Module), Build `tools/build.mjs` erzeugt weiter eine einzelne `index.html` | Nutzer: „größer denken“, weniger Tokens pro Änderung; eine Datei bleibt für Pages, Wiki und Artefakte |
| 2026-11-03 | Bestehenden Code direkt im Modul ändern statt neue Wrapper zu stapeln | Dateien sind jetzt klein genug; Wrapper nur noch beim Einklinken fremder Systeme |
| 2026-11-03 | Bei Web/JavaScript bleiben, kein Engine-Wechsel; Plattformen später über PWA, Capacitor (iPad) und Tauri (PC) | Engpass ist der Canvas-2D-Renderer, nicht die Sprache (Messung) |
| 2026-11-03 | Kartendesign in drei neuen Modulen (982/984/986), alles pro Seed ausgewürfelt | Nutzer: alle zwölf Ideen umsetzen; gleiche Karten für alle Mitspieler |
| 2026-11-03 | Wetter nach Region lenkt das bestehende Wetter (`G.wx`) statt eines zweiten Systems; Schnee neu | Es gab schon Regen, Asche und Nebel in 370 |
| 2026-11-03 | Startinsel: Stationen behalten ihre Module, ein Plan in 988 versetzt sie nur an feste Plätze; Straßen sind Steinboden (Feld 7) | Kein Umbau von sieben Modulen nötig; Brücken werden zur Laufzeit gesucht, damit es für jeden Seed passt |
| 2026-11-03 | Einbahntür als Aufzug: unten entriegeln, oben bis dahin verschlossen | Ein Objekt statt Tür-Kacheln, gleiche Wirkung wie in Elden Ring |
| 2026-11-04 | Talentbaum: ein Pfad nach oben je Klasse, Kosten 1–4 je Stufe, Schlussstein 5 | Wunsch des Nutzers; 83 statt 1.561 Knoten, übersichtlich und schnell; Reset für alle (`tv=3`) |
| 2026-11-04 | Godot: Dunkelheit als eigener Shader statt `Light2D`, Palette als Nachbearbeitung | Gleiches Bild wie im Browser (Lichter schneiden aus der Dunkelheit, 139 Farben mit Dithering); `Light2D` hellte gezeichnete Böden anders auf als Sprites |
| 2026-11-04 | Godot: Karten aus demselben Zufall wie im Browser (mulberry32, gleiche Reihenfolge der Würfe) | Gleicher Seed, gleiche Ebene; nötig für Mehrspieler zwischen beiden Fassungen und zum Prüfen |
| 2026-11-04 | Browser-Fassung abgeschlossen, für immer eingefroren in `schwarzer-turm-browser/`; weiter nur in Godot | Nutzer: „für immer, dass ich immer auch das Browser-Game habe … bekommt keine Updates mehr“; eigener Ordner mit Musik und Klängen, damit nichts davon abhängt, was später unter `/schwarzer-turm/` liegt |
| 2026-11-04 | Godot: feste Werte der Klassenausrüstung und Waffenregeln je Grundteil vorberechnet exportieren (`item_rules.json`) statt die Wrapper zu übersetzen | Die Formeln hängen nur an der Stufe des Grundteils; eine Tabelle ist einfacher und stimmt sicher mit dem Browser überein |
| 2026-11-04 | Godot: Fertigkeitsstufen am Platz (`slv`), Beschreibungen als exportierte Grundwerte | Wie im Browser bleibt ein Punkt beim Platz, wenn die Waffe den Satz wechselt; die Beschreibungen hängen an vielen Laufzeitwerten, als Text je Stufe sind sie sicher gleich wie im Browser |
| 2026-11-04 | Godot: Oberwelt in Teilschritten, zuerst die Grundwelt aus 300 (mit 820, 310, 510 soweit sie Inseln und Brücken ändern), geprüft gegen die unverpackten Browser-Funktionen | Die Welt hängt an über zehn Modulen; so stimmt der Kern nachweislich, die Schichten (Dorf, Gras, Sehenswürdigkeiten) folgen einzeln |
| 2026-11-04 | Godot: der Himmelsboden wird jedes Bild neu gezeichnet statt in festen Kacheln | Wie im Browser; Felskanten und Brückenseiten hängen weit über ihr Feld hinaus und müssen in der Reihenfolge i+j liegen |
| 2026-11-04 | Godot: Grasbüschel als Sprites mit Vertex-Shader statt jedes Bild neu gezeichnet | Tausende Büschel; der Shader biegt sie im Wind und unter Läufern ohne Rechenzeit im Skript, das Bild bleibt wie im Browser |
| 2026-11-04 | Godot: `dungeonChests` läuft schon beim Erzeugen der Ebene statt beim ersten `populate` | Sie hat ihren eigenen festen Zufall und hängt nur an Karte und Objekten; so prüft `--maphash` die Truhen gleich mit |
| 2026-11-05 | Godot-Werkstatt: das Ergebnis der Vereinung wird einmal berechnet und beim Schlag übernommen | Die Beförderung würfelt einen Namen; so bekommt man genau das Stück, das die Vorschau zeigte |
| 2026-11-05 | Godot: Grüfte sind Ebene −1 mit eigener Karte in `Game.crypt` | Eine Gruft gibt es nur, solange man drin ist; eine Zahl statt `'crypt'` hält `floor_no` ganzzahlig, Speichern fällt von selbst auf das Leuchtfeuer zurück |
| 2026-11-05 | Godot: Grasbüschel der Inseln werden jedes Bild mit Scherung gezeichnet statt als Sprites mit Shader | Wie im Browser hängen Neigung und Ausweichen an Held und Gegnern; die Wiesenbüschel aus 820 bleiben beim Shader |
| 2026-11-05 | Godot: zweite Steuerung mit W A S D, Linksklick nur Schwerthieb; was nah unter der Maus liegt, nimmt oder benutzt der Klick ohne Laufen | Nutzer: „Linksklick … nur noch der Attack mit dem Schwert“; ohne Aufheben und Türen ginge es nicht weiter, neue Tasten dafür wollte er nicht |
| 2026-11-05 | Godot: Insel-Kleinkram als Low-Poly-Bilder aus 810 statt der flachen aus 760; Wegweiser, Fahnen, Karren, Brunnen, Vogelscheuchen und andere große Stücke sind fest | Nutzer: die Stücke „passen vom Pixel-Art-Stil überhaupt nicht“ und man kann durchgehen; der Browser zeichnete längst die Low-Poly-Fassung, nur der Export nahm die alte; kleines Zeug (Knochen, Pilze, Büsche) bleibt begehbar, damit Inseln nicht verstopfen |
| 2026-11-05 | Godot: vor der Riesenburg zieht die Kamera halb zur Burg, aber nicht zurück wie im Browser (ZF bis 0,58) | Mehr Bild ginge nur mit ungleichen Pixeln oder Weichzeichnen, die Godot-Fassung hält ganzzahlige Pixel ([[Godot-Umstieg]]) |
| 2026-11-05 | Godot: H ist neben einem brennenden Leuchtfeuer die Heimkehr, sonst Auf- und Absitzen | Im Browser lösten beide zugleich aus; so tut die Taste immer genau eines ([[Godot-Umstieg]]) |
| 2026-11-05 | Godot: Eldriks Karte (Akt VI) gibt vorerst die Chronik (L), seine Worte stehen auf der Questkarte | Eldrik steht in Godot noch nicht im Dorf; sobald er kommt, wandert die Übergabe zu ihm ([[Godot-Umstieg]]) |
| 2026-11-05 | Godot: Rasten bis zur Nacht stellt erst die Uhr, dann wird gerastet, und zeigt nur ein Banner | Im Browser setzt erst das nächste Bild `G.night`, nach `rest()`, und das Nacht-Banner überdeckt dann das Rast-Banner ([[Godot-Umstieg]]) |
| 2026-11-05 | Godot: was eine Zufallsbegegnung bringt (Gegner, Hausierer, Sternentruhe), verschwindet 45 Felder hinter dem Helden | Im Browser baut `owTick` die Objekte neu und räumt sie so ab; Godot streamt Objekte anders, deshalb die feste Regel ([[Godot-Umstieg]]) |
| laufend | Push nur nach „Ja, live schalten“ | Standing rule, siehe [[Arbeitsweise]] |

Zurück zu [[Start]].
