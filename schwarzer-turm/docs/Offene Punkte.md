---
tags: [todo]
---
# Offene Punkte

- [ ] **Mit `?perf` auf dem iPad messen** (Oberwelt mit vielen Gegnern, Turm, Multiplayer) – Grundlage für den GPU-Renderer, siehe [[Performance]].
- [ ] **GPU-Renderer** (Texturatlas, instanziertes Zeichnen, Licht als Shader, Boden-Chunks) als umschaltbares Modul neben dem alten bauen.
- [ ] **Inhalte als Daten**: Gegner, Bosse, Waffen, Unikate, Runen, Quests, Überlieferung aus `030-data.js` & Co. in eigene Daten-Dateien; das Wiki und die Turm-Schmiede lesen sie direkt.
- [ ] **Wrapper-Stapel zurückfalten** (in `src/INDEX.md` mit `↻` markiert), System für System, sobald es ohnehin angefasst wird; dazu Logik-Tests in Node (Schaden, Beute, Balancing, Spielstand-Migration).
- [ ] PWA (Homescreen, offline) fürs iPad; später Capacitor (App Store) bzw. Tauri (PC/Steam).
- [ ] Spielstände versionieren (Format-Version + Migrationen statt Einzelfällen wie `P.clv`).
- [ ] **Neues Artefakt anlegen?** Die alte Artefakt-URL ist nicht mehr erreichbar – nachfragen.
- [ ] Großer Talentbaum (2026-11-03): Werte und Wege im echten Spiel prüfen, siehe [[Talentbaum]].
- [ ] Klassen: Balance im echten Spiel prüfen (Phiolenschaden, Jägerin-Tempo, Krieger-Leben) – seit 2026-11-03 zusätzlich `potPow` aus der Alchemisten-Ausrüstung (bis über +100 % im Endspiel).
- [ ] Krieger hat noch kein eigenes Set wie Magier/Jägerin/Alchemist (nutzt die allgemeinen schweren Rüstungen) – ggf. nachfragen.
- [x] Jägerin-Banditin: Schatten nach dem Schattenschritt (2026-11-03, siehe [[Klassen]]). Im echten Spiel prüfen, ob 2–3 s sich gut anfühlen.
- [ ] Multiplayer: Mitspieler-Aussehen von Jägerin/Alchemist und der Heilnebel mit zwei echten Spielern prüfen.
- [x] Bogen/Armbrust: eigene Schuss-Animation mit Spannen, Pfeil und Rückstoß (2026-11-03, siehe [[Klassen]]).
- [x] Bogen mit beiden Armen, Aufladen, Nachschwingen, auch für Gegner-Schützen (2026-11-03, siehe [[Klassen]]). Im echten Spiel prüfen, ob sich schnelles Schießen gut anfühlt.
- [x] Heldenliste statt Speicherplätze, Position wird mitgespeichert (2026-11-03, siehe [[Helden und Spielstände]]). Auf dem iPad mit echten alten Spielständen prüfen.
- [x] Gang für alle Figuren (Stehen/Atmen, Gehen, Laufen, Sprinten mit Knien) und Dash nach vorn mit Salto etwa jedes 5. Mal (2026-11-03, siehe [[Bewegung]]). Auf dem iPad ansehen, ob der Dash zu stark kippt.
- [ ] **Waffen-Ideen abarbeiten**: 54 Einträge in [[Waffen-Ideen]], der Reihe nach (zuerst Knotenstab für den Magier, dann Schwerter, Hellebarde neu).
- [x] Questgeber Eldrik neu gezeichnet mit eigener Schreibstube (2026-11-03, siehe [[Eldriks Schreibstube]]).
- [ ] **Odalindes Sockelanzahl wählbar machen** – angeboten nach der Runenwort-Prüfung, Nutzer hat nicht geantwortet. Würde gezieltes Bauen von 2/3/4-Runen-Runenwörtern erlauben. Erst nachfragen.
- [ ] **Multiplayer mit zwei echten Spielern testen**: Statue für Gäste (`ar`/`arx`) und sichtbare Fähigkeiten wurden nur mit simulierten Paketen geprüft.
- [ ] Schleifstein: soll das Herauslösen etwas kosten (Glut)? Nicht besprochen, aktuell kostenlos.
- [x] Remote-Fähigkeiten: Klingenwall, Dash und Klangdämpfung am Mitspieler (2026-11-03, siehe [[Multiplayer]]). Mit zwei echten Spielern prüfen.
- [ ] Bodennamen aus (Tab): Anklicken über Namensschild nicht möglich – evtl. Hinweis im Spiel oder Klick auf das Item-Sprite selbst erlauben, falls der Nutzer das vermisst.
- [ ] Umhänge „erstmal“ raus – ggf. später neu aufgreifen.
- [ ] Ungetrackte Dateien im Repo (`judas-unter-uns.html`, `turm-schmiede.html`, `music/`, `sfx/`, `.DS_Store`) gehören nicht zu diesen Änderungen – nicht anfassen ohne Rückfrage.

Zurück zu [[Start]].
