---
tags: [todo]
---
# Offene Punkte

- [ ] **Godot-Umstieg**: Turmebenen mit Kampf, Beute, Inventar und Klassenfertigkeiten laufen in Godot, dazu die Himmelswelt mit Inseln, Brücken, Leuchtfeuern, Gegnern und Turmtür (Schritt 5a, 2026-11-04). Wiese, Grasbüschel, Wolken, Truhen in Turm und auf Inseln und Insel-Kleinkram stehen (Schritt 5b Teil 1). Zweite Turmschicht (760: Geheimwand, Felsbrocken, Kram, Fallen) ist drin, ebenso Themen, Flüche und Turmräume (982/984); beides stimmt mit dem Browser. Das Hügeldorf (988) steht und stimmt ebenfalls. Bild bleibt bei ~430 Zeilen mit ganzzahligen Pixeln, Vollbild F11, Breitbild zeigt mehr (auf echtem 21:9-Monitor ansehen). Die Oberfläche steht scharf in Bildschirmauflösung: Titel, Menüs, Heldenliste mit eigenen Spielständen, HUD mit Orbs und Gürtel, Charakter, Fertigkeiten, Inventar, Händler, Bodenlose Truhe, Leuchtfeuer; Talentbaum, Sammlung, große Karte und Chronik stehen seit 2026-11-05; Runen, Sockel, Runenwörter, Brannocs Schmiede, der Schleifstein, Amboss der Vereinung und Glyphentisch stehen seit 2026-11-05 (im echten Spiel prüfen: Schieferquote, Sockelquote, Preise); es fehlen Arena-Statue (deren Chronik-Quest wird übersprungen) und Händlergespräche. Die Sehenswürdigkeiten 986 stehen und stimmen mit dem Browser (Klima und Schnee warten aufs Wetter). Die lebendigen Inseln 989 stehen ebenso (Glühwürmchen, Pfützen und Klänge warten auf Nacht, Wetter und Klang). Die Totenlande 510–550 stehen als Land (Stadt, Kloster, Wald, Burg, Zonen, Dunkelheit) und stimmen mit dem Browser; es fehlen Ser Haldor, Gram das Reittier und Akt VI der Chronik (Teil 2). Danach Tag und Nacht und Boss-Bögen. Die Browser-Fassung ist eingefroren in `schwarzer-turm-browser/`. Siehe [[Godot-Umstieg]].

- [ ] **Pixel-Art-Rework der Gegenstände** (seit 2026-11-05, `tools/item-art/`): Krieger- und Grundrüstung samt Schilden ist neu (51 Formen). Es fehlen Klassenrüstung von Magier, Jägerin, Alchemist, Drachenschuppen-Teile, Ringe, Amulette, Tränke, Runen, Schiefer, Ramsch und alle Waffen. Siehe [[Godot-Umstieg]].
- [ ] Godot: neue Steuerung (W A S D, Linksklick nur Schwerthieb, seit 2026-11-05) im echten Spiel prüfen – Reichweite fürs Aufheben und Benutzen ohne Laufen (1,6 bzw. 2,2 Felder), Schlagen beim Gehen. Auf dem iPad gibt es keine Tasten: dort bleibt Classic.
- [ ] **Mit `?perf` auf dem iPad messen** (auf dem Mac ist auch der große Kampf nur halb ausgelastet, Messung 2026-11-03 abends) (Oberwelt mit vielen Gegnern, Turm, Multiplayer) – Grundlage für den GPU-Renderer, siehe [[Performance]].
- [ ] **GPU-Renderer** (Texturatlas, instanziertes Zeichnen, Licht als Shader, Boden-Chunks) als umschaltbares Modul neben dem alten bauen.
- [ ] **Inhalte als Daten**: Gegner, Bosse, Waffen, Unikate, Runen, Quests, Überlieferung aus `030-data.js` & Co. in eigene Daten-Dateien; das Wiki und die Turm-Schmiede lesen sie direkt.
- [ ] **Wrapper-Stapel zurückfalten** (in `src/INDEX.md` mit `↻` markiert), System für System, sobald es ohnehin angefasst wird; dazu Logik-Tests in Node (Schaden, Beute, Balancing, Spielstand-Migration).
- [ ] PWA (Homescreen, offline) fürs iPad; später Capacitor (App Store) bzw. Tauri (PC/Steam).
- [ ] Spielstände versionieren (Format-Version + Migrationen statt Einzelfällen wie `P.clv`).
- [ ] **Neues Artefakt anlegen?** Die alte Artefakt-URL ist nicht mehr erreichbar – nachfragen.
- [ ] Großer Talentbaum (2026-11-03): Werte und Wege im echten Spiel prüfen, siehe [[Talentbaum]].
- [ ] Klassen: Balance im echten Spiel prüfen (Phiolenschaden, Jägerin-Tempo, Krieger-Leben) – seit 2026-11-03 zusätzlich `potPow` aus der Alchemisten-Ausrüstung (bis über +100 % im Endspiel).
- [x] Jägerin-Banditin: Schatten nach dem Schattenschritt (2026-11-03, siehe [[Klassen]]). Im echten Spiel prüfen, ob 2–3 s sich gut anfühlen.
- [ ] Multiplayer: Mitspieler-Aussehen von Jägerin/Alchemist und der Heilnebel mit zwei echten Spielern prüfen.
- [x] Bogen/Armbrust: eigene Schuss-Animation mit Spannen, Pfeil und Rückstoß (2026-11-03, siehe [[Klassen]]).
- [x] Bogen mit beiden Armen, Aufladen, Nachschwingen, auch für Gegner-Schützen (2026-11-03, siehe [[Klassen]]). Im echten Spiel prüfen, ob sich schnelles Schießen gut anfühlt.
- [x] Heldenliste statt Speicherplätze, Position wird mitgespeichert (2026-11-03, siehe [[Helden und Spielstände]]). Auf dem iPad mit echten alten Spielständen prüfen.
- [x] Gang für alle Figuren (Stehen/Atmen, Gehen, Laufen, Sprinten mit Knien) und Dash nach vorn mit Salto etwa jedes 5. Mal (2026-11-03, siehe [[Bewegung]]). Auf dem iPad ansehen, ob der Dash zu stark kippt.
- [ ] **Waffen-Ideen abarbeiten**: Nr. 1–25 sind drin (außer Wurfbeil), weiter mit Nr. 26 (Stangenwaffen, Hellebarde neu) bis 54 und dem Wurfbeil, siehe [[Waffen-Ideen]] und [[Neue Waffen]].
- [ ] Neue Waffen und Krieger-Set im echten Spiel prüfen: Balance der Treffer-Effekte (Schockwelle, Blutung, Betäubung) und eigene Bewegungen je Waffe (bisher nutzen alle die Bewegung ihrer Art).
- [x] Questgeber Eldrik neu gezeichnet mit eigener Schreibstube (2026-11-03, siehe [[Eldriks Schreibstube]]).
- [x] Kartendesign: Themen-Stockwerke, Flüche, Sonderräume, Fässer/Kronleuchter/Druckplatten, Bodenrisse, Aufzug, Grüfte, Landmarken, Brückensteine, Klima, Turm-Lichter (2026-11-03, siehe [[Turm-Ebenen und Inseln]]). Im echten Spiel Häufigkeiten und Schaden prüfen.
- [x] Startinsel als Dorf mit festem Grundriss, Wegen, Vierteln, Friedhof, Steg, Dorfbewohnern und Wachstum (2026-11-03, siehe [[Der Hügel]]). Im echten Spiel prüfen, ob Stationen gut erreichbar sind.
- [ ] **Multiplayer für die neuen Kartenteile**: Hebel, Prüfung, Fässer, Kronleuchter, Bodenrisse und Brückensteine werden noch nicht übertragen.
- [ ] **Odalindes Sockelanzahl wählbar machen** – angeboten nach der Runenwort-Prüfung, Nutzer hat nicht geantwortet. Würde gezieltes Bauen von 2/3/4-Runen-Runenwörtern erlauben. Erst nachfragen.
- [ ] **Multiplayer mit zwei echten Spielern testen**: Statue für Gäste (`ar`/`arx`) und sichtbare Fähigkeiten wurden nur mit simulierten Paketen geprüft.
- [ ] Schleifstein: soll das Herauslösen etwas kosten (Glut)? Nicht besprochen, aktuell kostenlos.
- [x] Remote-Fähigkeiten: Klingenwall, Dash und Klangdämpfung am Mitspieler (2026-11-03, siehe [[Multiplayer]]). Mit zwei echten Spielern prüfen.
- [ ] Bodennamen aus (Tab): Anklicken über Namensschild nicht möglich – evtl. Hinweis im Spiel oder Klick auf das Item-Sprite selbst erlauben, falls der Nutzer das vermisst.
- [ ] Umhänge „erstmal“ raus – ggf. später neu aufgreifen.
- [ ] Ungetrackte Dateien im Repo (`judas-unter-uns.html`, `turm-schmiede.html`, `music/`, `sfx/`, `.DS_Store`) gehören nicht zu diesen Änderungen – nicht anfassen ohne Rückfrage.

Zurück zu [[Start]].
