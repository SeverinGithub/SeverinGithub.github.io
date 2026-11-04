---
tags: [technik, plan]
---
# Umstieg auf Godot

Wunsch des Nutzers (2026-11-03): das Spiel in Godot (GDScript) neu aufbauen, mit Export für iPad, PC und Steam. Die Browser-Fassung bleibt bis zum Ende spielbar und ist die Vorlage.

## Sicherung
- ZIP: `~/Documents/Schwarzer-Turm-Sicherungen/schwarzer-turm-vor-godot-2026-11-03.zip` (der ganze Ordner, 53 MB mit Musik und Klängen)
- Git-Tag `schwarzer-turm-vor-godot` auf Commit 509e323 (nur lokal)

## Was schon vorbereitet ist
**Export aus dem Browser-Spiel** (`tools/godot-export-server.mjs` + `tools/godot-export.js`). Er schreibt nach `godot/`:
- `data/*.json`: alle Grundteile mit Materialstufen (1064), Unikate (310), Gegnerarten (`VAR`, 74) und Monster (`MON`), Bosse, Fertigkeiten, Klassen, Affixe, die Texte der Werte (`mod_text`, z. B. `"+{v}% erhöhter Schaden"`), Paletten.
- `assets/sprites/`: alle Weltbilder aus `SPR` (Boden, Gras, Wände, Felsen, Brücken, Deko, Props, Turm), 202 Stück, mit Größe und Ankerpunkt in `data/sprites.json`.
- `assets/icons/`: das Beutelsymbol jedes Grundteils, Zuordnung in `data/icons.json`.
- `assets/figures/`: **gebackene Figuren**. Das Browser-Spiel zeichnet Held und Gegner jedes Bild neu aus Formen (`limb`, `blob`, `humanoid`). Der Export zeichnet sie einmal in Bögen: 8 Zeilen für die Richtungen (Zeile k blickt in Weltrichtung k·45°), dazu Spalten für Gehen, Angriff und Stehen. Es gibt 74 Gegnerarten und 4 Helden mit Startausrüstung. Zellgröße und Anker stehen in `data/figures.json`.

Neu exportieren (nach Änderungen am Browser-Spiel):
1. `node tools/build.mjs --test`
2. `node tools/godot-export-server.mjs` (Port 8771)
3. `http://localhost:8771/schwarzer-turm/_t.html?slot=gx` öffnen, einen Helden starten, dann in der Konsole:
   `__ev(await (await fetch('/schwarzer-turm/tools/godot-export.js')).text())`

**Held in Ebenen** (`tools/godot-export-layers.js`, läuft wie der Export oben, dauert etwa eine Viertelstunde). Alle Ausrüstungskombinationen zu backen ginge nicht, deshalb wird der Held zerlegt:
- `assets/hero/body_<klasse>_<haltung>.png`: der nackte Held je Klasse und Haltung (Haltung folgt der Waffe: `melee`, beim Krieger `great`/`hammer`/`spear`, Bogen `bow`, Armbrust `xbow`).
- `assets/hero/<platz>_<teil>_<klasse>_<p|s|t|g|f>.png`: jedes Grundteil je Klasse, die es trägt, in **Grau**, ein Bogen je Farbverlauf (p Hauptmaterial, s Zweitmaterial, t Griff/Stoff, g Edelstein). `shaders/ramp_map.gdshader` färbt das Grau mit dem Verlauf des echten Materials (Grau 0, ⅓, ⅔, 1 = die vier Stufen aus `PXM`, bei Steinen 0, ½, 1 aus `PXG`). So reicht ein Bogen für alle Materialstufen und Unikatfarben. Feste Farben (Augenschlitz, Glut, Leuchten) liegen farbig im `f`-Bogen. Farben, die das Spiel beim Zeichnen aus einem Verlauf mischt (`mixR`/`darkR`: Umhang und Kapuze der Jägerin, Schürze und Mantel des Alchemisten), liegen in eigenen Bögen `d0`, `d1` … mit Rezept (`derived`: Quellverlauf, Mischfarben, Anteil, abdunkeln); `hero.gd` mischt das echte Material genauso.
- Je Klasse, weil jede Klasse Rüstung anders zeichnet (Umhang der Jägerin, Robe des Magiers, Mantel des Alchemisten). Klassen-Ausrüstung wird nur auf ihrer Klasse gebacken, Waffen auf jeder Klasse, die sie führen darf, alles andere auf allen vier. Magier, Jägerin und Alchemist tragen Kapuze und Kragen unter einem Helm anders, deshalb gibt es von ihren Körpern und Rüstungen auch eine Fassung mit Helm (`_h`, Schlüssel `<klasse>:<grundteil>:h`); jeder Helm vermerkt in `helmed`, welche Fassung zu ihm passt (die Kapuzen der Jägerin etwa die ohne).
- `data/hero_layers.json`: Raster (Zelle 112, Anker, Spalten wie bei den Figuren), Reihenfolge der Plätze und Bögen, `layers` (`"<klasse>:<grundteil>"` → Datei, Bögen, Körper), `looks` (jeder Gegenstand inkl. Stufen → Grundteil und Materialien), Verläufe und Unikatfarben.
- Ausschneiden: der Held wird einmal mit dem Teil in Magenta (Loch) gezeichnet und je Verlauf einmal mit diesem Verlauf in Grau und den anderen in Magenta. Was sich vom Loch unterscheidet, gehört zum Bogen; an weichen Kanten wird der Magenta-Anteil herausgerechnet.
- `scripts/hero.gd` (`Hero`): setzt Körper und Bögen übereinander, `equip(platz, gegenstand, unikat)`. Geprüft im Browser gegen das Original (alle vier Klassen, 8 Richtungen, Gehen/Angriff/Stehen): stimmt bis auf einzelne Randpixel.
- Grenzen: `f` nur für Helm, Schild und Nahkampfwaffen; die Runen auf der Magierrobe nehmen im Spiel die Farbe des Waffen-Elements an, gebacken sind sie in der Grundfarbe; Rüstung und Handschuhe sind in der Grundhaltung der Klasse gebacken, bei anderer Waffenhaltung können Ärmel minimal abweichen; Effekte, die das Spiel zur Laufzeit dazumalt (Schwarzdiamant-Funkeln, Element-Leuchten), fehlen noch.
- `godot/assets/hero/` und `data/hero_layers.json` sind nicht im Git (über 100 MB, jederzeit neu erzeugbar). Vor dem ersten Öffnen in Godot einmal den Ebenen-Export laufen lassen, in einer frisch geladenen Seite direkt nach `startNew('krieger')` (in einer schon bespielten Seite rauschen die Angriffsbilder):
  `__ev(await (await fetch('/schwarzer-turm/tools/godot-export-layers.js')).text())`

**Godot-Projekt** (`godot/`, Godot 4.4 oder neuer, Renderer „Compatibility“ für iPad und Web):
- `project.godot`: interne Auflösung 760×430 wie im Browser, hochskaliert ohne Weichzeichnen.
- `scripts/data.gd`: Autoload `Data`, lädt alle JSON-Dateien, dazu `Data.mod_line()`, `Data.sprite()`, `Data.icon()`.
- `scripts/iso.gd`: dieselbe Iso-Projektion wie `110-camera-iso.js` (Kachel 64×32).
- `scripts/figure.gd`: spielt einen gebackenen Bogen ab (`play("walk")`, Richtung aus `face`, Tiefe nach x+y).
- `scripts/hero.gd` + `shaders/ramp_map.gdshader`: der Held aus Ebenen (siehe oben).
- `scenes/main.tscn`: Testszene mit Grasinsel, der Held läuft per Klick, Tasten 1–4 wechseln Klasse und Ausrüstung, Leertaste schlägt zu; sechs Gegnerarten streifen umher und schlagen zu.
- Godot 4.7.2 ist installiert (`/opt/homebrew/bin/godot`), das Projekt ist importiert. `scenes/main.tscn` bleibt als Testszene für Figuren und Ausrüstung.

## Stand 2026-11-04: Turmebenen spielbar (Schritt 1 und 2)
Startszene ist jetzt `scenes/tower.tscn`: ein neuer Krieger auf Ebene 1, Klick zum Gehen, Klick auf Feinde zum Zuschlagen, Umschalt+Klick schlägt im Stand, Leertaste rollt, F trinkt aus dem Flakon. Über die Treppe geht es tiefer, jede dritte Ebene hat einen Boss.
- `scripts/rng.gd` (`Rng`): mulberry32 aus `020-utils.js` mit `rnd`, `rint`, `pick`, `wpick`.
- `scripts/dungeon_gen.gd` (`DungeonGen`): `tryDungeon` (080) und `decorate` (230) Zeile für Zeile. **Gleicher Seed, gleiche Ebene wie im Browser**: geprüft mit `--maphash` gegen `_genDungeonF(f)` im Browser, Ebenen 1–4 mit Seed 4242 stimmen in Kacheln, Deko, Requisiten und Objekten exakt überein.
- `scripts/game.gd` (Autoload `Game`): was eine Ebene überdauert (`G`/`P`): Seed, Ebene, Leuchtfeuer, Bosse, Klasse, Werte, Stufe, Erfahrung, Glut, Flakon, Ausrüstung; `recalc()` aus `070-player-stats.js` mit Klassenboni (`CBON`), `start_new()` wie `startNew` (Startwaffe der Klasse, Lederwams).
- `scripts/level.gd` (`Level`): eine Ebene im Spiel. Boden und Deko in 16×16-Feldern gezeichnet, Wände, Requisiten, Objekte, Gegner und Held in einem nach y sortierten Knoten (Bildschirm-y = (x+y)·16, also dieselbe Tiefenordnung wie im Browser); Wände vor dem Helden werden durchsichtig. Darin übersetzt: `walkable`/`free`/`los`/`eLos`/`moveEnt`, A* (`findPath`) und Flussfeld der Gegner (090), `populate` und `varPool`, `update` (Held, Gegner, Warnflächen, Geschosse), `updEnemy`/`chase`/`fireProj`/`bossUpdate`/`sepEnemies` (200), `hurtPlayer`/`hitEnemy`/`weaponHit`/`killEnemy`/`startAttack`/`resolveSwing`/`doRoll`/`drinkFlask` (170), `interact` für Leuchtfeuer (Rasten: heilen, Flakon füllen, Feinde erheben sich), Treppe und Truhe (Glut), Tod mit Glut-Mal und Erwachen am Leuchtfeuer.
- `scripts/enemy.gd` (`Enemy`, erbt `Figure`): `makeEnemy`/`makeBoss` mit Rängen (Champion, Gefolge, Einzigartige mit Elite-Eigenschaften), Treffer-Stauchen, Ausfallschritt, Umfallen beim Tod.
- `scripts/prop.gd` (`Prop`): Requisiten aus den Weltbildern (Wandbilder geschert wie im Browser) und die gemalten Dinge (`drawProp`/`drawObj`): Fackel, Feuerschale, Flammen, Leuchtfeuer, Treppe, Truhe.
- `scripts/fx.gd` (`Fx`): Warnflächen und Klickring am Boden, Funken, Blut, Hiebe, Geschosse, schwebende Zahlen.
- `scripts/hud.gd` (`Hud`): Lebens- und Manakugel, Ausdauer, Erfahrung, Flakon, Glut, Ebene, Gegner unter der Maus mit Lebensbalken, Meldungen, Banner.
- **Bild wie im Browser**: `shaders/darkness.gdshader` legt die Dunkelheit über die Ebene und schneidet jedes Licht als weiche Ellipse heraus (wie `destination-out` in `render()`), farbiges Leuchten wird danach addiert, und `shaders/palette.gdshader` macht zum Schluss, was `present()` per WebGL macht: Bayer-Dithering und Abbildung auf die 139 Farben der Palette (`assets/palette_lut.png`, erzeugt mit `node tools/godot-palette.mjs`). Zahlen und HUD liegen außerhalb.
- Testschalter (nach `--`): `--seed=4242 --floor=3 --class=jaegerin`, `--shot=/pfad.png --shot-after=3` (Bildschirmfoto, dann Ende), `--bot` (`=near`, `=boss`, `=stairs`: spielt selbst und schreibt Leben, Stufe, Erfahrung in die Konsole), `--raw` (ohne Dunkelheit und Palette), `--maphash` (Prüfsummen der Ebenen 1–4). Beispiel: `godot --path godot -- --bot=boss --floor=3 --shot=/tmp/boss.png --shot-after=8`.
- Stolperstein: Texturen, die nur in `_draw()` mit `draw_texture()` benutzt werden, müssen festgehalten werden, sonst werden sie freigegeben und zeichnen weiß. `Data.sprite()` hält deshalb alle geladenen Weltbilder.
- Noch nicht drin: die späteren Schichten der Turmebenen (Themen-Stockwerke und Flüche aus 982, Sonderräume aus 984), Gegenstände und Beute (Schritt 3), Fertigkeiten (Schritt 4), Klänge, Karte, Speichern, Titelbild. Bosse haben noch keine eigenen Bögen (Platzhalter: Grabritter, Brutmutter, Koloss), Kerzen haben drei geschätzte Dochte (`candlesTop` fehlt im Export), Lichtschächte, Ratten, Staub und Sporen fehlen.

## Wie die Browser-Module in Godot aufgehen
| Browser | Godot |
|---|---|
| `G`, `P`, Spielstand (`localStorage`) | Autoloads `Game` und `Save` (Datei `user://`) |
| `030-data.js` & Co. | `data/*.json` über `Data` (vom Export erzeugt, später direkt gepflegt) |
| `080-maps.js`, `300-endless-sky.js` (Karten erzeugen) | GDScript 1:1 übersetzen, Kacheln in `TileMapLayer` (isometrisch) |
| `210-render.js`, Tiefensortierung | `y_sort`/`z_index` nach x+y, kein eigenes Zeichnen mehr |
| `220-figures.js` (Figuren aus Formen) | gebackene Bögen; Ausrüstung am Helden siehe unten |
| Licht, Dunkelheit, Leuchteffekte | `PointLight2D`, `CanvasModulate`, Partikel (`GPUParticles2D`) |
| `170-combat.js`, Fertigkeiten | Knoten pro Geschoss/Effekt, Logik übersetzt |
| HUD, Inventar, Dialoge (HTML/CSS) | `Control`-Szenen |
| Klänge (`syn`, `sample`) | `AudioStreamPlayer`; erzeugte Klänge als WAV vorab aufnehmen |
| Mehrspieler (WebRTC über PeerJS) | Godot `MultiplayerAPI` mit ENet (PC) bzw. WebRTC (Web), eigener kleiner Vermittler nötig |

## Offene Entscheidungen
- ~~Ausrüstung am Helden~~: entschieden 2026-11-03, Ebenen backen (siehe oben).
- **Web-Fassung:** Godot kann ins Web exportieren, aber größer und mit längerer Ladezeit. Soll die GitHub-Pages-Fassung bleiben, bis Godot alles kann?
- ~~Reihenfolge~~: gearbeitet wird nach dem Vorschlag (2026-11-04): 1. Laufen, Kamera, eine Turmebene ✓ · 2. Kampf ✓ (alle Gegnerarten, Bosse mit Platzhalter-Figur) · 3. Gegenstände, Beute, Inventar · 4. Fertigkeiten der vier Klassen · 5. Oberwelt mit Inseln und Dorf · 6. Händler, Schmiede, Runen · 7. Mehrspieler · 8. Export iPad/PC.

## Aufwand, ehrlich
Das Browser-Spiel hat 107 Module und etwa 1,2 MB Code. Die Daten und Bilder sind jetzt mitnehmbar, die Logik muss übersetzt werden. Das sind eher Monate als Wochen, wenn alles wieder drin sein soll.

Zurück zu [[Start]].
