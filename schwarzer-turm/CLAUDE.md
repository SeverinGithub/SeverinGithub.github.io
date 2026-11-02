# Der Schwarze Turm

Projektwissen liegt im Obsidian-Vault unter `docs/`. Zu Beginn einer Session lesen:
`docs/Start.md`, `docs/Arbeitsweise.md`, `docs/Architektur.md`, `docs/Code-Landkarte.md`, `docs/Test-Workflow.md`, `docs/Offene Punkte.md`.
Feature-Notizen (`docs/Features/`) und `docs/Changelog.md` nur lesen, wenn die Aufgabe sie betrifft.

Wichtigste Regeln (Details in `docs/Arbeitsweise.md`):
- Push nach `main` nur nach „Ja, live schalten“ – jede Freigabe gilt für einen Push.
- Nach jeder Änderung das Artefakt https://claude.ai/artifact/RyXp68BqnpmdkzTHnvAd8z aktualisieren.
- Nur `index.html` committen, nie `_t.html`/`_d.html`; Commit auf Deutsch mit Präfix `Schwarzer Turm: `.
- Code nie umschreiben, sondern umhüllen (Wrapper-Muster); neue Module direkt vor die Init-Zeile `expandItems();buildPalette();…`.
- `index.html` nie ganz lesen (~1 MB) – immer `grep -n` nach Funktionsnamen, dann gezielt Ausschnitte.

Nach größeren Änderungen die passenden Notizen in `docs/` nachziehen (Code-Landkarte, Entscheidungen, Offene Punkte, Changelog).
