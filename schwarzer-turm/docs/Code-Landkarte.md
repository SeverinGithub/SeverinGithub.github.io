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
| 860–940 | Modul „four ways up the tower“ | Klassen, Waffen pro Klasse, Bögen/Armbrüste/Holzzauberstab, Alchemist-Phiolen, Talentpfad je Klasse (`920-talent-tree-path.js`, siehe [[Talentbaum]]), Spielstand-Übernahme, Jägerin-/Alchemist-Aussehen, siehe [[Klassen]] |
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
| 989-living-isles.js | `lvSpr`, `lvTick`, `lvGround`, `lvAir`, `lvGlow`, `lvWhisper`, `LV` | Lebendige Inseln: Gras im Wind, Trampelpfade, Bodenflecken, Pfützen, Wind mit Blättern, Vogelschwärme und Fledermäuse, Krähen auf Gräbern, Mücken, Bienen, Motten, Glühwürmchen, bröckelnde Ränder, Runensteine, Flüstern |
| 991-weapons-two.js | `NW`, `NWPX`, `NWIMP`, `NWS`, `NWT`, `NWD`, `nwW`, `nwStun`, `nwBlade` | 24 neue Waffen (Stäbe, Schwerter, Äxte, stumpfe Waffen) mit Materialstufen, eingebauten Werten, Treffer-Effekten (`weaponHit`-Wrapper), Blutung und Betäubung (`updEnemy`-Wrapper) und eigenem Bild in der Hand (`vWeapon`-Wrapper); Symbolgröße pro Form über `WEXT[Name]` |
| 992-warrior-gear.js | `KRIE`, `KRIET`, `KRIMP`, `isKrie` | Krieger-Set: 24 Teile in drei Macharten, gezeichnet wie die alten Ketten-/Schuppen-/Plattenteile (`shape`), mit Stärke, Leben und Schadensminderung eingebaut |

Zurück zu [[Start]].

## Godot (`godot/`)
Export: `tools/godot-export-server.mjs` (Server, schreibt nach `godot/`), `tools/godot-export.js` (Daten, Bilder, Figuren) `tools/godot-export-skills.js` (Fertigkeiten, Symbole, Waffensätze), `tools/godot-export-items.js` (Affix-Bereiche, Beute-Tabellen, Bodenbilder, Regeln der Klassenausrüstung) `tools/godot-export-sky.js` (Wiese, hohes Gras, Truhen, Insel-Kleinkram), `tools/godot-export-dc.js` (nur der Insel-Kleinkram als Low-Poly-Bilder), `tools/godot-export-rg.js` (Gebäude der Totenlande in beiden Lagen), `tools/godot-export-mount.js` (Rösser im Galopp, Ser Haldor, Gram als Reittier in zwei Lagen mit Sattelpunkten) und `tools/godot-export-layers.js` (Held in Ebenen), alle laufen im Spiel; `tools/godot-worldhash.js` (Prüfzahlen der Himmelswelt mit dem ganzen Inselinhalt bis 989, Gegenstück zu `--worldhash`), `tools/godot-maphash.js` (Gegenstück zu `--maphash` für Turmebenen), `tools/godot-rghash.js` (Gegenstück zu `--rghash` für die Totenlande), `tools/godot-hillhash.js` (Gegenstück zu `--hillhash`), `tools/godot-export-village.js` (Bögen der Dorfbewohner), `tools/godot-export-runes.js` (Runen, Schiefer, Schmiede und Schleifrad als Bögen), `tools/godot-export-craft.js` (Amboss der Vereinung und Glyphentisch), `tools/godot-export-lv.js` (Pfade, Flecken und Runensteine der lebendigen Inseln). `tools/godot-palette.mjs` (Paletten-Tabelle), `tools/item-art/` (Pixel-Art der Gegenstandsbilder: `engine.mjs`, `pieces.mjs`, `build.mjs` mit `ART`, `preview.mjs`). Godot-Skripte: `data.gd` (Autoload `Data`), `game.gd` (Autoload `Game`: Spielstand, Werte, `recalc`), `screen.gd` (Autoload `Screen`: ganzzahlige Pixel, Breitbild, Vollbild F11/Alt+Enter, Strg+Plus/Minus), `iso.gd`, `rng.gd` (mulberry32), `dungeon_gen.gd` (`tryDungeon` + `decorate`), `world_gen.gd` (Himmelswelt: Inseln, Brücken, Inhalt, Heimatinsel, `owTick`), `overworld.gd` (Ebene 0 zeichnen und nachladen, Wiese, Grasbüschel, Wolken, fester Insel-Kleinkram `SOLID`/`open_box`), `tower_two.gd` (zweite Turmschicht aus 760: Geheimwand und -kammer, Felsbrocken, Kram, dazu Stachelplatten und Feuerdüsen aus 390; `v8_shuffle` wie `sort(()=>R()-.5)` in V8), `floor_themes.gd` (Themen, Flüche, Sonderräume und Gefahren aus 982/984 legen), `theme_run.gd` (sie im Spiel: Licht, Lava, Wasser, Fässer, Hebel, Prüfung, Sturz), `theme_draw.gd` (ihre Bilder), `hill_village.gd` (Hügeldorf aus 988: `hvBuild`, Zeichnungen, Dorfbewohner, Wegweiser und Lichterspur), `living_isles.gd` (lebendige Inseln aus 989: Büschel im Wind, Pfade, Flecken, Runensteine, Vögel, Krähen, Mücken, Bienen, bröckelnde Kanten), `dead_lands.gd` (Totenlande aus 510–550: Plan `rgPlan` als Klasse `Plan`, `fill`/`content` in der Welt, Zonen, Dunkelheit, Gebäude, Laternen, Kessel, schwebende Felsen, Fallgitter, Wegstein, Burgtor; `hash_text` für `--rghash`), `weather.gd` (Wetter aus 370 mit Klima und Schnee aus 986 und Blitz aus 630), `world_events.gd` (Zufallsbegegnungen und Kopfgelder aus 370), `day_night.gd` (Tag und Nacht aus 370/720/740: Uhr, Nachtstärke der Gegner, Werwölfe und Nachtgeister, Rasten bis zu einer Stunde, Abendschleier, Schein der Nachtgeister), `rg_play.gd` (Totenlande im Spiel aus 550: Ser Haldor, Gram und das Reiten, Akt VI der Chronik), `island_sights.gd` (Sehenswürdigkeiten aus 986: Wahrzeichen, Grüfte als Ebene −1, Brückensteine, treibende Inselchen, Turmlichter), `chests.gd` (Truhenarten, `dungeonChests`, Inseltruhen und -kleinkram, `chestLoot`), `level.gd` (eine Ebene im Spiel: Bild, Wege, Gegner-KI, Kampf, Licht, beide Steuerungen), `enemy.gd`, `items.gd` (`makeItem`, Tränke, Ramsch, Raster, Tooltip-Zeilen), `inventory.gd` (Inventarfenster auf der UI-Ebene), `skills.gd` (alle Fertigkeiten und ihre Zonen, Fallen, Blitze, Buffs), `skill_panel.gd` (Fertigkeitsfenster), `ui_layer.gd` (`UiLayer`: scharfe Oberfläche, Menüdecke, Overlay für Hand und Tooltip), `ui_kit.gd` (`Ui`: Texturen, Schriften, Theme, Steinplatten, Tooltip), `title_screen.gd` (Titel), `menus.gd` (Pause, Einstellungen, Steuerung mit Wahl Classic/W A S D, Heldenwahl, Heldenliste), `save.gd` (Helden und Spielstände), `char_panel.gd` (Charakter), `shop.gd` (Händler mit Runen und Sockeln), `runes.gd` (Runen, Sockel, Runenwörter, Schiefer, Schmiedestufen, Schleifen), `forge.gd` (Brannocs Schmiede), `grind.gd` (Schleifstein), `craft.gd` (Werkstatt aus 600: Vereinen und Glyphen), `stash.gd` (Bodenlose Truhe), `bonfire.gd` (Leuchtfeuer-Fenster), `full_view.gd` (Vollbild-Ansicht mit Ziehen und Zoomen), `talents.gd` (Talentbaum aus 920, Punkte, Wirkung), `talent_view.gd` (P), `collection.gd` (Sammlung J), `map_view.gd` (große Karte M), `quests.gd` (Chronik aus 320: Quests, Zähler, Ziele), `chronicle.gd` (Zeitleiste L), `figure.gd`, `hero.gd` (Held aus Ebenen, im Sattel auf Gram), `prop.gd` (Requisiten und Objekte), `fx.gd` (Effekte), `hud.gd`, `tower.gd` (Startszene, Testschalter), `main.gd` (Testszene); Shader `ramp_map.gdshader` (Grau → Materialverlauf), `darkness.gdshader`, `palette.gdshader`, `tuft.gdshader` (Grasbüschel im Wind), `soft_light.gdshader` (Themen-Farbton), `orb.gdshader` (Flüssigkeit der Orbs), `title_bg.gdshader` und `gold_text.gdshader` (Titel). UI-Texturen in `assets/ui/`, Schriften (OFL) in `assets/fonts/`. Siehe [[Godot-Umstieg]].
