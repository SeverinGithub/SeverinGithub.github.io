// Godot export server: serves the site like the test server and lets the export script in the browser write files into godot/.
// Start: node tools/godot-export-server.mjs  → open http://localhost:8771/schwarzer-turm/_t.html?slot=gx and run tools/godot-export.js (see docs/Godot-Umstieg.md)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..');            // schwarzer-turm/
const SITE = path.resolve(GAME, '..');            // the site root, so /schwarzer-turm/... works as on the test server
const OUT = path.join(GAME, 'godot');             // everything the export writes lands under godot/
const PORT = +process.env.PORT || 8771;
const TYPES = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml'};

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (req.method === 'PUT' && url.startsWith('/__export/')) {
    const rel = url.slice('/__export/'.length), dst = path.resolve(OUT, rel);
    if (!dst.startsWith(OUT + path.sep)) { res.writeHead(400); return res.end('bad path'); }
    const parts = [];
    req.on('data', c => parts.push(c));
    req.on('end', () => {
      fs.mkdirSync(path.dirname(dst), {recursive: true});
      fs.writeFileSync(dst, Buffer.concat(parts));
      res.writeHead(200); res.end('ok');
    });
    return;
  }
  const file = path.resolve(SITE, '.' + (url.endsWith('/') ? url + 'index.html' : url));
  if (!file.startsWith(SITE) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Godot-Export: http://localhost:${PORT}/schwarzer-turm/_t.html?slot=gx  → schreibt nach ${OUT}`));
