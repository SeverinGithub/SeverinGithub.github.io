---
tags: [technik]
---
# Code-Landkarte

Zeilennummern in `schwarzer-turm/index.html`, Stand Commit `2aec3eb`. Sie verschieben sich mit jeder Änderung – immer per `grep -n` nachschlagen; die Namen sind stabil.

| Zeile | Was | Notiz |
|---|---|---|
| 796 | `const VARS=` / `VAR` / `varPool(f)` | Gegnervarianten `[id,base,name,pal,hp,dmg,spd,scale,elem,proj,minF,w]` |
| 913 | `function makeItem` | `it={id,b,slot,cls,rar,ilvl,mods,req}`; normal: `name=b.n`, `req.lvl=b.lvl` |
| 1065 | `function makeEnemy(vid,x,y,rank)` | `e.type`=Familie, `e.vid`=Variante |
| 1380 | `function summonArena` | Original; in Zeile ~7700 komplett ersetzt, siehe [[Arena]] |
| 1409 | `function killEnemy` | Basis: XP, Glut (jetzt `if(!e.arena)`), Beute |
| 1469 | `function interact` | Objekt-Interaktion, viele Wrapper |
| 1500 | `addEventListener('keydown',…)` | Haupt-Tastatur; Tab/V siehe [[Steuerung]] |
| 1784 / 1842 | `humanoid`, `heroLook` | Figurenzeichnung; Magierrobe hängt sich hier ein |
| 2394 | `function drawLabels` | Namen am Boden |
| 2768 | `function openShrine` | Muster für `#dialog`-Inhalte |
| 3244 | `RW` | Runenwörter |
| 3285 | `function insertRune` | Rune einsetzen, Runenwort prüfen |
| 3697 | `function lootShown` | Beutefilter (dimmt Gegenstände, auch für Schnellaufheben) |
| 3868 | `KEYS_HTML` | Tastenübersicht im Menü |
| 4194 | `const EL=` | Elemente Feuer/Frost/Blitz/Gift mit Farben |
| 4261 | `function mCast` | Magierzauber + Resonanzen |
| 4368 | `function bindPad` | Touch-Knöpfe |
| 5348 | `const mpOn` | Multiplayer aktiv? (const!) |
| 5422 | `function mpRecv` | Netzwerk-Empfang, viele Wrapper |
| 5448 | `function mpQuestSync` | Chronik-Angleich, siehe [[Multiplayer]] |
| 5490 | `function mpDesc` | Gegner → Netzpaket (kopiert primitive Felder, z. B. `arena`) |
| 5523 | `function mpHostHere` | Gast ist auf der Karte des Hosts |
| 5579 / 5609 | `mpCastFx`, `mpFxTick` | Fähigkeiten anderer Spieler darstellen |
| 5838 | `const _makeRuneL` | echtes `makeRune` (das umhüllte liefert ohne 3 Bosse nur Ramsch) |
| 5896 | `function tvCluster` | iPad-Knopfgruppe |
| 6087 / 6097 | `drawEnchT`, `craftTick` | Glyphentisch, Amboss, Platzierung auf der Startinsel |
| 6339 / 6342 / 6345 | `leapTo`, `later`, `WSK` | Waffenfertigkeiten |
| 6637 | `const STF=` / `stOf()` | Statistik am Helden (`P.st2`) |
| 7576 | `function bigIsland` | Rieseninseln, siehe [[Overworld Inseln und Brücken]] |
| 7674 | `function titleCam` | Titelbildschirm, siehe [[Titelbildschirm]] |
| 7693–7830 | Modul „names on the ground, the statue's arena, what others cast, the grindstone“ | Tab-Namen, `kvOf`, `summonArena`, `MPOLD`, `visProxy`, `visRun`, Schleifstein (`grindItem`, `openGrind`, `drawGrind`, `grindTick`) |
| 7832–8054 | Modul „four ways up the tower“ | Klassen, Waffen pro Klasse, Bögen/Armbrüste/Holzzauberstab, Alchemist-Phiolen, Talentbaum mit 4 Zweigen, Spielstand-Übernahme, Jägerin-/Alchemist-Aussehen, siehe [[Klassen]] |
| 8055 | `expandItems();buildPalette();…` | Init-Zeile – neue Module direkt davor |

Zurück zu [[Start]].
