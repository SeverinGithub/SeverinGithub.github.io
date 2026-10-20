// Liest alle Bilder aus photos/ und schreibt photos.js neu.
// Aufruf (im Ordner sino):  node update-photos.mjs
//
// Bildunterschriften und Größen, die du in photos.js schon eingetragen
// hast, bleiben erhalten. Neue Bilder werden hinten angehängt,
// gelöschte Bilder fliegen raus.

import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "photos");
const out = join(here, "photos.js");
const exts = /\.(jpe?g|png|webp|avif|gif)$/i;

const files = readdirSync(dir).filter((f) => exts.test(f) && !f.startsWith("."));

let existing = [];
if (existsSync(out)) {
  const m = readFileSync(out, "utf8").match(/window\.PHOTOS\s*=\s*(\[[\s\S]*\]);?/);
  if (m) {
    try { existing = Function(`"use strict"; return ${m[1]}`)(); } catch {}
  }
}

const byFile = new Map(existing.map((p) => [p.file, p]));
const kept = existing.filter((p) => files.includes(p.file));
const added = files
  .filter((f) => !byFile.has(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((file) => ({ file, caption: "", size: "", pos: "" }));

const photos = [...kept, ...added];
const body = photos
  .map((p) => `  { file: ${JSON.stringify(p.file)}, caption: ${JSON.stringify(p.caption || "")}, size: ${JSON.stringify(p.size || "")}, pos: ${JSON.stringify(p.pos || "")} }`)
  .join(",\n");

writeFileSync(
  out,
  `// Deine Fotos (Dateien liegen in photos/).
// Reihenfolge hier = Reihenfolge auf der Seite.
// Das Über-Foto (aboutPhoto in content.js) wird in der Galerie automatisch ausgelassen.
// caption: kurzer Text, z.B. "Rooftop Session — Augsburg"
// size:    "" (normal), "wide" (doppelt breit), "tall" (doppelt hoch), "big" (beides)
// pos:     Bildausschnitt, falls etwas abgeschnitten wird, z.B. "50% 80%" (= weiter unten)
// Neu einlesen:  node update-photos.mjs

window.PHOTOS = [
${body}
];
`
);

console.log(`photos.js: ${photos.length} Bilder (${added.length} neu, ${existing.length - kept.length} entfernt)`);
