// Godot palette: bakes the browser's colour lookup (buildPalette in src/js/010-palette.js) into godot/assets/palette_lut.png.
// Every 15-bit colour (32 steps per channel) maps to its nearest palette colour; the post shader (godot/shaders/palette.gdshader)
// dithers with the same 4×4 Bayer matrix and looks up here, as present() does in the browser.  Run: node tools/godot-palette.mjs
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SRC = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src/js/010-palette.js'), 'utf8');
const PAL_RAMPS = eval(SRC.match(/const PAL_RAMPS=(\[[\s\S]*?\]\]);/)[1]);
const cols = [[0, 0, 0], [255, 255, 255]], hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
for (const [n, ...ks] of PAL_RAMPS) { const K = ks.map(hx); for (let i = 0; i < n; i++) { const t = i / (n - 1) * (K.length - 1), k = Math.min(K.length - 2, Math.floor(t)), u = t - k; cols.push(K[k].map((v, c) => Math.round(v + (K[k + 1][c] - v) * u))) } }
const W = 1024, H = 32, px = Buffer.alloc(W * H * 4);
for (let r = 0; r < 32; r++) for (let g = 0; g < 32; g++) for (let b = 0; b < 32; b++) {
  const R0 = r * 8 + 4, G0 = g * 8 + 4, B0 = b * 8 + 4; let best = 0, bd = 1e12;
  for (let i = 0; i < cols.length; i++) { const [pr, pg, pb] = cols[i], dr = R0 - pr, dg = G0 - pg, db = B0 - pb, rm = (R0 + pr) / 2, d = (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db; if (d < bd) { bd = d; best = i } }
  const o = (r * W + g * 32 + b) * 4; px[o] = cols[best][0]; px[o + 1] = cols[best][1]; px[o + 2] = cols[best][2]; px[o + 3] = 255;
}
// a plain PNG: one IHDR, one IDAT, no filters
const crcT = Array.from({length: 256}, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 });
const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 };
const chunk = (type, data) => { const l = Buffer.alloc(4), t = Buffer.from(type), c = Buffer.alloc(4); l.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([l, t, data, c]) };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
const raw = Buffer.alloc((W * 4 + 1) * H); for (let y = 0; y < H; y++) px.copy(raw, y * (W * 4 + 1) + 1, y * W * 4, (y + 1) * W * 4);
const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../godot/assets/palette_lut.png');
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('Palette: ' + cols.length + ' Farben → ' + out);
