// node tools/item-art/preview.mjs OUT.png piece mat,mat,mat[,gem] ... : a contact sheet of pieces, inventory size and ground size
import fs from 'node:fs';
import {png, sheet} from './engine.mjs';
import {render, PIECES} from './pieces.mjs';
const [out, k, ...specs] = process.argv.slice(2), ims = [];
for (const sp of specs) {
  const [nm, m = 'steel,steel,steel,ruby'] = sp.split(':'), [p, s, t, g] = m.split(','), [name, ...os] = nm.split('+'), P = PIECES[name], opt = Object.fromEntries(os.map(k => [k, 1]));
  ims.push(render(name, {p, s: s || p, t: t || p, g: g || 'ruby'}, 1, opt));
  if (!process.env.NOG) ims.push(render(name, {p, s: s || p, t: t || p, g: g || "ruby"}, 32 / Math.max(P.w, P.h), opt));
}
fs.writeFileSync(out, png(sheet(ims, +k)));
