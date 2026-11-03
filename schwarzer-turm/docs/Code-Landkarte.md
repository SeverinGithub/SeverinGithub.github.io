---
tags: [technik]
---
# Code-Landkarte

Fundorte in `schwarzer-turm/src/js/` (Dateiname). Die vollständige, automatisch erzeugte Übersicht aller Definitionen und Wrapper pro Datei steht in `src/INDEX.md` (wird bei jedem Build neu geschrieben). Suchen: `grep -n "function name\|const name=" src/js/*.js`.

| Datei | Was | Notiz |
|---|---|---|
| 030-data.js | `const VARS=` / `VAR` / `varPool(f)` | Gegnervarianten `[id,base,name,pal,hp,dmg,spd,scale,elem,proj,minF,w]` |
| 060-items.js | `function makeItem` | `it={id,b,slot,cls,rar,ilvl,mods,req}`; normal: `name=b.n`, `req.lvl=b.lvl` |
| 080-maps.js | `function makeEnemy(vid,x,y,rank)` | `e.type`=Familie, `e.vid`=Variante |
| 170-combat.js | `function summonArena` | Original; in `850-names-arena-grindstone.js` komplett ersetzt, siehe [[Arena]] |
| 170-combat.js | `function killEnemy` | Basis: XP, Glut (jetzt `if(!e.arena)`), Beute |
| 180-interaction.js | `function interact` | Objekt-Interaktion, viele Wrapper |
| 190-input.js | `addEventListener('keydown',…)` | Haupt-Tastatur; Tab/V siehe [[Steuerung]] |
| 220-figures.js | `humanoid`, `heroLook` | Figurenzeichnung; Magierrobe hängt sich hier ein |
| 230-environment.js | `function drawLabels` | Namen am Boden |
| 260-ui.js | `function openShrine` | Muster für `#dialog`-Inhalte |
| 350-runes.js | `RW` | Runenwörter |
| 350-runes.js | `function insertRune` | Rune einsetzen, Runenwort prüfen |
| 400-comfort.js | `function lootShown` | Beutefilter (dimmt Gegenstände, auch für Schnellaufheben) |
| 440-menus.js | `KEYS_HTML` | Tastenübersicht im Menü |
| 470-class-skills-2.js | `const EL=` | Elemente Feuer/Frost/Blitz/Gift mit Farben |
| 470-class-skills-2.js | `function mCast` | Magierzauber + Resonanzen |
| 480-touch-2.js | `function bindPad` | Touch-Knöpfe |
| 560-online.js | `const mpOn` | Multiplayer aktiv? (const!) |
| 560-online.js | `function mpRecv` | Netzwerk-Empfang, viele Wrapper |
| 560-online.js | `function mpQuestSync` | Chronik-Angleich, siehe [[Multiplayer]] |
| 560-online.js | `function mpDesc` | Gegner → Netzpaket (kopiert primitive Felder, z. B. `arena`) |
| 560-online.js | `function mpHostHere` | Gast ist auf der Karte des Hosts |
| 560-online.js | `mpCastFx`, `mpFxTick` | Fähigkeiten anderer Spieler darstellen |
| 570-loot-economy.js | `const _makeRuneL` | echtes `makeRune` (das umhüllte liefert ohne 3 Bosse nur Ramsch) |
| 580-touch-v2-tablets.js | `function tvCluster` | iPad-Knopfgruppe |
| 600-workshop.js | `drawEnchT`, `craftTick` | Glyphentisch, Amboss, Platzierung auf der Startinsel |
| 640-weapon-arts.js | `leapTo`, `later`, `WSK` | Waffenfertigkeiten |
| 700-pages-3.js | `const STF=` / `stOf()` | Statistik am Helden (`P.st2`) |
| 820-meadow.js | `function bigIsland` | Rieseninseln, siehe [[Overworld Inseln und Brücken]] |
| 840-title.js | `function titleCam` | Titelbildschirm, siehe [[Titelbildschirm]] |
| 850-names-arena-grindstone.js | Modul „names on the ground, the statue's arena, what others cast, the grindstone“ | Tab-Namen, `kvOf`, `summonArena`, `MPOLD`, `visProxy`, `visRun`, Schleifstein (`grindItem`, `openGrind`, `drawGrind`, `grindTick`) |
| 860–940 | Modul „four ways up the tower“ | Klassen, Waffen pro Klasse, Bögen/Armbrüste/Holzzauberstab, Alchemist-Phiolen, großer Talentbaum (`920-talent-tree-eight.js`, siehe [[Talentbaum]]), Spielstand-Übernahme, Jägerin-/Alchemist-Aussehen, siehe [[Klassen]] |
| 950-adaptive-map-collision.js | Modul „the tower measures you“ | Karten-Pinch-Zoom und +/−, Spieler-Analyse (`PW`, `myPow`, `teamPow`), adaptive Bosse (`adaptBoss`) und Gegner (`adaptFoe`), Boss-Kombos/Trank-Bestrafung, feste Kartenobjekte (`SOLID`, `moveEnt`-Wrapper) |
| 999-boot-loop.js | Init-Zeile `expandItems();buildPalette();…` + Spielschleife `frame` | neue Module bekommen eine Nummer **vor** 999 |

| 790-heroes.js | `hAll`, `hCur`, `hMigrate`, `save`/`loadData`-Ersatz, Menüansicht `heroes` | Heldenliste statt Speicherplätze, siehe [[Helden und Spielstände]] |
| 960-perf-overlay.js | `perfToggle`, `PERF_FN` | Messanzeige `?perf` / Shift+F3, siehe [[Performance]] |
| 220-figures.js | `humanoid` (Gang, Atmen), `drawPlayer`, `heroDash`, `heroRoll` | Figuren und Bewegung, siehe [[Bewegung]] |
| 980-eldrik-study.js | `eldMesh`, `eldPose`, `drawChron` | Eldriks Schreibstube, siehe [[Eldriks Schreibstube]] |
| 970-class-gear.js | `HUNT`, `ALCH`, `gearAdd`, `ALDG`, `HUIMP`/`ALIMP`, `gSetOf`, `gGlint`, `HOODOFF` | Ausrüstung von Jägerin und Alchemist, neue Dolche und Unikate, Masken und Kapuzen in `vHelm`, siehe [[Klassen]] |
| 982-floor-themes.js | `FTH`, `fthOf`, `CURSE`, `ftDress`, `ftWell`, `ftGround`, `ftProp`, `ftTick`, `dungDark`, `plLight`, `floorSpd` | Themen-Stockwerke, Flüche, Turmfenster, Lichtschacht, Lava/Wasser/Dampf, Feuerbecken, siehe [[Turm-Ebenen und Inseln]] |
| 984-tower-rooms.js | `twS` (`G.tw`), `twDress`, `TWI`, `twObjE`, `twBlast`, `twWave`, `twFall` | Sonderräume, Pulverfässer und Kronleuchter, Druckplatten, Bodenrisse, Aufzug |
| 986-island-sights.js | `ISN`, `genCrypt`, `enterCrypt`, `isBuild`, `CLIM`, `drawIslets`, `TWLIGHTS` | Landmarken, Grüfte, Brückensteine, treibende Inseln, Klima nach Region, Turm-Lichter |
| 988-hill-village.js | `hvBuild`, `hvTick`, `hvHeads`, `hvEdge`, `hvWalk`, `HVLOOK`, `hvDraw`, `hvSprites`, `hvGraves` | Der Hügel als Dorf: Ring, Straßen, feste Plätze der Stationen, Platz, Werkstattdach, Friedhof, Steg, Laternen, Wegweiser, Dorfbewohner, Wachstum nach Hütern |

Zurück zu [[Start]].
