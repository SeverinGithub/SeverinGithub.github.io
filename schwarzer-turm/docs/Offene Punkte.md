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
- [ ] Klassen: Balance im echten Spiel prüfen (Phiolenschaden, Jägerin-Tempo, Krieger-Leben).
- [ ] Jägerin-Banditin: Unsichtbarkeit nach Schattenschritt (Gegner verlieren das Ziel) wäre ein naheliegender Ausbau.
- [ ] Multiplayer: Mitspieler-Aussehen von Jägerin/Alchemist und der Heilnebel mit zwei echten Spielern prüfen.
- [ ] Bogen: Beim Grundangriff schwingt die Figur noch wie mit einer Klinge; eigene Schuss-Animation wäre schöner.
- [ ] **Odalindes Sockelanzahl wählbar machen** – angeboten nach der Runenwort-Prüfung, Nutzer hat nicht geantwortet. Würde gezieltes Bauen von 2/3/4-Runen-Runenwörtern erlauben. Erst nachfragen.
- [ ] **Multiplayer mit zwei echten Spielern testen**: Statue für Gäste (`ar`/`arx`) und sichtbare Fähigkeiten wurden nur mit simulierten Paketen geprüft.
- [ ] Schleifstein: soll das Herauslösen etwas kosten (Glut)? Nicht besprochen, aktuell kostenlos.
- [ ] Remote-Fähigkeiten: `g_parry`-Schild und Dash-Bewegung am Mitspieler nicht dargestellt; `sfx()` anderer Spieler ohne Entfernungsdämpfung.
- [ ] Bodennamen aus (Tab): Anklicken über Namensschild nicht möglich – evtl. Hinweis im Spiel oder Klick auf das Item-Sprite selbst erlauben, falls der Nutzer das vermisst.
- [ ] Umhänge „erstmal“ raus – ggf. später neu aufgreifen.
- [ ] Ungetrackte Dateien im Repo (`judas-unter-uns.html`, `turm-schmiede.html`, `music/`, `sfx/`, `.DS_Store`) gehören nicht zu diesen Änderungen – nicht anfassen ohne Rückfrage.

Zurück zu [[Start]].
