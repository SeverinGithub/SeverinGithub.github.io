# Der Schwarze Turm

Projektwissen liegt im Obsidian-Vault unter `docs/`. Zu Beginn einer Session lesen:
`docs/Start.md`, `docs/Arbeitsweise.md`, `docs/Architektur.md`, `docs/Code-Landkarte.md`, `docs/Test-Workflow.md`, `docs/Offene Punkte.md`.
Feature-Notizen (`docs/Features/`) und `docs/Changelog.md` nur lesen, wenn die Aufgabe sie betrifft.

Wichtigste Regeln (Details in `docs/Arbeitsweise.md`):
- **Die Browser-Fassung ist abgeschlossen** (2026-11-04): eine unveränderliche Kopie liegt in `../schwarzer-turm-browser/` – nie anfassen. Neue Arbeit in `godot/` und, seit 2026-11-10 auf Wunsch des Nutzers wieder, an der HTML-Fassung in `src/` (live unter `/schwarzer-turm/`); `src/` ist zugleich Vorlage und Quelle für den Godot-Export.
- Push nach `main` nur nach „Ja, live schalten“ – jede Freigabe gilt für einen Push.
- **Quellcode liegt in `src/`** (`src/js/NNN-name.js`, `src/style.css`, `src/shell.html`). `index.html` ist Build-Ergebnis: nie direkt bearbeiten und nie lesen, sondern `node tools/build.mjs` (mit `--test` zusätzlich `_t.html` mit Eval-Brücke).
- Code finden: zuerst `src/INDEX.md` (Definitionen und Wrapper pro Datei), dann `grep -n name src/js/*.js` und nur die betroffene Datei lesen.
- Bestehendes Verhalten direkt in seiner Moduldatei ändern; neue Systeme als neue Datei mit Nummer vor `999-boot-loop.js`. Wrapper nur noch, wenn ein System sich in ein fremdes einklinkt.
- Committen: `src/`, `tools/`, gebaute `index.html`, `docs/`, `godot/` (Godot-Projekt, Export siehe `docs/Godot-Umstieg.md`) – nie `_t.html`/`_d.html`. Vorher `node tools/build.mjs --check`. Commit auf Deutsch mit Präfix `Schwarzer Turm: `.
- Artefakt https://claude.ai/artifact/RyXp68BqnpmdkzTHnvAd8z ist nicht mehr erreichbar – ein neues nur nach Rückfrage.
- Leistung messen mit `?perf` (Shift+F3), siehe `docs/Features/Performance.md`.

Nach größeren Änderungen die passenden Notizen in `docs/` nachziehen (Code-Landkarte, Entscheidungen, Offene Punkte, Changelog).
