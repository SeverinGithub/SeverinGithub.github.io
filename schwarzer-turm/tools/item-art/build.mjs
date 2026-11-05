// Item art: renders the hand-built pieces (pieces.mjs) into the Godot project, over the pictures the browser export baked.
// For every inventory picture (data/icons.json) and ground picture (data/ground.json) whose base has a piece, it writes
// assets/icons/<file> at 24 px per cell and assets/ground/<file> at 32 px in the 34×34 frame. Materials per item come from
// the browser's looks (p, s, t, g per item and stage, unique colours), kept in looks.json beside this file.
// Run: node tools/item-art/build.mjs [base …]   then   godot --headless --path godot --import
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {png, frame} from './engine.mjs';
import {render, PIECES} from './pieces.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), G = path.resolve(HERE, '../../godot');
const J = f => JSON.parse(fs.readFileSync(path.join(G, 'data', f + '.json'), 'utf8'));
const icons = J('icons'), ground = J('ground'), items = J('items'), uniques = J('uniques');
// the looks are part of the hero-layer export (not in git); keep a copy here so the art can be rebuilt without it
const LOOKS = path.join(HERE, 'looks.json');
if (fs.existsSync(path.join(G, 'data/hero_layers.json'))) { const h = J('hero_layers'); fs.writeFileSync(LOOKS, JSON.stringify({looks: h.looks, unique_looks: h.unique_looks}, null, 0)) }
const {looks, unique_looks} = JSON.parse(fs.readFileSync(LOOKS, 'utf8'));

// which piece draws which base, with options for the piece
export const ART = {
  // helms
  'Lederkappe': ['cap'], 'Kettenhaube': ['coif'], 'Eisenhelm': ['spangen'], 'Nasalhelm': ['spangen', {nasal: 1}], 'Topfhelm': ['greathelm'], 'Schaller': ['sallet'],
  'Barbuta': ['barbuta'], 'Hornhelm': ['horned'], 'Widderhelm': ['horned', {ram: 1}], 'Totenkrone': ['crown'], 'Kriegskrone': ['crown', {helm: 1}],
  // body armour
  'Lederwams': ['jerkin'], 'Gambeson': ['jerkin', {quilt: 1}], 'Kettenhemd': ['mail'], 'Ringpanzer': ['mail', {fine: 1, trim: 1}], 'Schuppenpanzer': ['scale'],
  'Lamellenpanzer': ['scale', {lam: 1}], 'Brigantine': ['brigantine'], 'Plattenharnisch': ['plate'], 'Kriegsharnisch': ['plate', {haute: 1}],
  'Schwarzer Harnisch': ['plate', {spikes: 1, gem: 1}], 'Ritterharnisch': ['plate', {fluted: 1, gem: 1}],
  // gloves
  'Lederhandschuhe': ['gloves'], 'Kettenhandschuhe': ['gloves', {mail: 1}], 'Panzerhandschuhe': ['gloves', {plate: 1}], 'Klauenhandschuhe': ['gloves', {claw: 1}],
  'Fausthandschuhe': ['gloves', {mitten: 1}], 'Schuppenfäuste': ['gloves', {scale: 1}], 'Stahlfäuste': ['gloves', {plate: 1, knuckle: 1}], 'Kriegsfäuste': ['gloves', {plate: 1, claw: 1, knuckle: 1}],
  // boots
  'Stiefel': ['boots'], 'Kettenstiefel': ['boots', {mail: 1}], 'Plattenstiefel': ['boots', {plate: 1, knee: 1}], 'Schattentreter': ['boots', {gem: 1}],
  'Marschstiefel': ['boots', {plate: 1}], 'Schienenstiefel': ['boots', {splint: 1, toe: 1}], 'Stahlschuhe': ['boots', {plate: 1, toe: 1}], 'Kriegsschritt': ['boots', {plate: 1, knee: 1, toe: 1}],
  // belts
  'Schärpe': ['sash'], 'Ledergürtel': ['belt'], 'Kriegsgürtel': ['belt', {plates: 1, hang: 's'}], 'Kettengürtel': ['belt', {chain: 1}], 'Waffengurt': ['belt', {sword: 1, studs: 1}],
  'Schwertgurt': ['belt', {sword: 1}], 'Eisengurt': ['belt', {plates: 1}], 'Titanengurt': ['belt', {plates: 1, gem: 1, hang: 's'}],
  // shields
  'Rundschild': ['round'], 'Turmschild': ['tower'], 'Wappenschild': ['heater'], 'Grabsteinschild': ['grave'], 'Drachenschild': ['grave', {dragon: 1}],
};

const baseOf = n => { const it = items[n]; return it && it.tier ? n.slice(it.tier.length + 1) : n };
const uq = Object.fromEntries(uniques.map(u => [u.n, u]));
function lookOf(key) {
  if (key.startsWith('U:')) { const u = uq[key.slice(2)]; if (!u) return null; const l = {...(looks[u.b] || {})}, c = unique_looks[u.n];
    if (c) ['p', 's', 't', 'g'].forEach((k, i) => { if (c[i]) l[k] = c[i] }); return {base: baseOf(u.b), mats: l} }
  return looks[key] ? {base: baseOf(key), mats: looks[key]} : null;
}

const only = process.argv.slice(2);
let n = 0;
for (const key of Object.keys(icons)) {
  const lk = lookOf(key); if (!lk || !ART[lk.base] || (only.length && !only.includes(lk.base))) continue;
  const [piece, opt] = ART[lk.base], P = PIECES[piece], m = {p: lk.mats.p, s: lk.mats.s, t: lk.mats.t, g: lk.mats.g || 'ruby'};
  const [cw, ch] = icons[key].size; if (P.w !== cw * 24 || P.h !== ch * 24) console.warn('Größe passt nicht: ' + key, P.w, P.h, cw, ch); const inv = frame(render(piece, m, 1, opt), cw * 24, ch * 24);
  fs.writeFileSync(path.join(G, 'assets/icons', icons[key].file), png(inv));
  if (ground[key]) { const gr = render(piece, m, 32 / Math.max(P.w, P.h), opt); fs.writeFileSync(path.join(G, 'assets/ground', ground[key].file), png(frame(gr, ground[key].w, ground[key].h, true))) }
  n++;
}
console.log('Gegenstandsbilder: ' + n + ' neu gezeichnet');
