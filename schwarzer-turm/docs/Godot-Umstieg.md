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
- Noch nicht in Godot geöffnet: Godot ist auf diesem Mac nicht installiert. Beim ersten Öffnen importiert der Editor alle Bilder, das dauert etwas.

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
- **Reihenfolge:** Vorschlag 1. Laufen, Kamera, eine Turmebene aus `080-maps.js` · 2. Kampf mit einer Gegnerart · 3. Gegenstände, Beute, Inventar · 4. Fertigkeiten der vier Klassen · 5. Oberwelt mit Inseln und Dorf · 6. Händler, Schmiede, Runen · 7. Mehrspieler · 8. Export iPad/PC.

## Aufwand, ehrlich
Das Browser-Spiel hat 107 Module und etwa 1,2 MB Code. Die Daten und Bilder sind jetzt mitnehmbar, die Logik muss übersetzt werden. Das sind eher Monate als Wochen, wenn alles wieder drin sein soll.

Zurück zu [[Start]].
