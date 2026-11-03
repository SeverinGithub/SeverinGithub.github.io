---
tags: [index]
---
# Der Schwarze Turm – Projekt-Vault

Ein isometrisches Action-RPG im Browser (Diablo-artig): Turm mit Ebenen, endlose Himmelsinseln (Overworld), vier Klassen (Krieger, Jägerin, Magier, Alchemist), Runen, Online-Multiplayer per PeerJS. Alles steckt in **einer einzigen Datei**: `schwarzer-turm/index.html` (~7.860 Zeilen, ~1 MB).

- Live: GitHub Pages des Repos `SeverinGithub/SeverinGithub.github.io`, Pfad `/schwarzer-turm/`
- Artefakt (Vorschau auf claude.ai): die alte Adresse RyXp68BqnpmdkzTHnvAd8z ist nicht mehr erreichbar (2026-11-02) – neues Artefakt nur nach Rückfrage
- Wiki: `turm-wiki/index.html` im selben Repo, liest Daten und Bilder live aus dem Spiel (siehe [[Turm-Wiki]])
- Letzter Stand: siehe [[Changelog]] bzw. `git log` (Stand 2026-11-03: Bogen-Animation, Schatten der Jägerin, Mitspieler-Effekte)

## Zum Einstieg in einer neuen Session
1. [[Arbeitsweise]] lesen – feste Regeln (Push nur nach „Ja, live schalten“, Artefakt immer aktualisieren, Commit-Format).
2. [[Architektur]] – Quellcode in `src/js/` (≈100 Module), gebaut mit `node tools/build.mjs` zu `index.html`; Übersicht aller Funktionen in `src/INDEX.md`.
3. [[Code-Landkarte]] – wo die wichtigen Funktionen liegen.
4. [[Test-Workflow]] – wie man im Browser testet (`node tools/build.mjs --test`, `_t.html`, `__ev`, `?perf`).
5. [[Offene Punkte]] – was noch angeboten oder unklar ist.

## Features (Details zu allem, was in den letzten Sessions gebaut wurde)
- [[Klassen]] – Krieger, Jägerin, Magier, Alchemist; Waffen pro Klasse, Bögen/Armbrüste, eigene Ausrüstung für Jägerin und Alchemist
- [[Talentbaum]] – 8 Zweige, 4 Ringe, 32 Meilensteine, 1.561 Knoten
- [[Anpassung]] – Bosse und Gegner passen sich an Schaden und Zähigkeit des Spielers an, Multiplayer-Skalierung, Karten-Zoom, feste Kartenobjekte
- [[Performance]] – Messanzeige `?perf`, Messwerte, erledigte Optimierungen, Plan für den GPU-Renderer
- [[Steuerung]] – Tastatur, Tab/V, iPad-Knöpfe
- [[Arena]] – Statue, nur besiegte Gegner, keine Beute
- [[Multiplayer]] – Sync, Quest-Angleich, Statue für Gäste, sichtbare Fähigkeiten
- [[Runen und Runenwörter]]
- [[Schleifstein]]
- [[Magierrobe]]
- [[Titelbildschirm]]
- [[Overworld Inseln und Brücken]]
- [[Ausrüstung und Kleinigkeiten]] – Zweihand-Anzeige, Umhänge entfernt, Quest-Dialog-Fix

## Verlauf
- [[Entscheidungen]] – was wann warum so entschieden wurde
- [[Changelog]] – alle Commits mit vollständigen Nachrichten
