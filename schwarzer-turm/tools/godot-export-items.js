// Godot export, items: what the item step needs beyond tools/godot-export.js. Runs the same way (test build, through __ev):
// affixes with their ranges per tier, junk and loot tables, ground pictures (pxCanvas) for every base, unique, junk and potion,
// and inventory icons for junk, potions and uniques (merged into icons.json).
(async () => {
  const LOG = [], put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const slug = s => String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const json = (rel, o) => put('data/' + rel, JSON.stringify(o, null, 1));

  // ---------- data ----------
  await json('affixes.json', AFF.map(a => ({k: a.k, p: a.p, s: a.s, minT: a.minT || 0, n: a.n, r: [0, 1, 2, 3].map(t => a.r(t))})));
  await json('loot.json', {slotw: SLOTW, slotcode: SLOTCODE, rcol: RCOL, jmax: JMAX, junk: JUNK, jfam: JFAM});
  // per base: the implicit mods of class gear (MGIMP, HUIMP/ALIMP, NWIMP, KRIMP, in the order the browser adds them),
  // whose kit it is (the drop re-roll leans away from other classes' gear), which classes may wield a weapon, and the dragon pieces that never drop
  const imp = {}, owner = {}, wok = {}, add = (k, im) => { if (!im) return; imp[k] = imp[k] || {}; for (const m in im) imp[k][m] = (imp[k][m] || 0) + Math.round(im[m]) };
  for (const [k, b] of Object.entries(BASE)) {
    const it = {b: k, slot: b.slot, cls: b.cls, mods: {}};
    if (b.mage && MGIMP[b.slot]) add(k, MGIMP[b.slot](b.lvl));
    if ((b.hunt || b.alch) && (b.hunt ? HUIMP : ALIMP)[b.slot]) add(k, (b.hunt ? HUIMP : ALIMP)[b.slot](b.lvl));
    try { const s = nwSh(it); if (s && NWIMP[s]) add(k, NWIMP[s](b.lvl)) } catch (_) {}
    if (b.krie && KRIMP[b.slot]) add(k, KRIMP[b.slot](b.lvl));
    const o = gSetOf(it) || (isKrie(it) ? 'krieger' : null); if (o) owner[k] = o;
    if (b.slot === 'weapon') wok[k] = Object.keys(CLSW).filter(c => CLSW[c](it));
  }
  await json('item_rules.json', {implicit: imp, owner, wok, dragon: Object.values(DRN), elements: ELK, sizes: Object.fromEntries(Object.keys(BASE).map(k => [k, isz({b: k, slot: BASE[k].slot, cls: BASE[k].cls})]))});
  LOG.push('Daten: ' + AFF.length + ' Affixe, ' + Object.keys(JUNK).length + ' Ramscharten');

  // ---------- ground pictures ----------
  const ground = {};
  const g = async (key, uq, name) => { const c = pxCanvas(key, uq), f = slug(name) + '.png'; await put('assets/ground/' + f, await png(c)); ground[name] = {file: f, w: c.width, h: c.height} };
  for (const k of Object.keys(BASE)) await g(k, '', k);
  for (const u of UNIQ) await g(u.b, u.n, 'U:' + u.n);
  for (const k of Object.keys(JUNK)) await g('Junk:' + k, '', 'Junk:' + k);
  await g('potL', '', 'potL'); await g('potM', '', 'potM');
  await json('ground.json', ground);
  LOG.push('Bodenbilder: ' + Object.keys(ground).length);

  // ---------- more inventory icons ----------
  const icons = await (await fetch('/schwarzer-turm/godot/data/icons.json')).json();
  const ic = async (it, name) => { try { const url = invIcon(it), blob = await (await fetch(url)).blob(), f = slug(name) + '.png'; await put('assets/icons/' + f, blob); icons[name] = {file: f, size: isz(it)} } catch (e) { LOG.push('Symbol fehlt: ' + name) } };
  for (const k of Object.keys(JUNK)) await ic(makeJunk(k, 1), 'Junk:' + k);
  await ic(makePotion('life', 1), 'potL'); await ic(makePotion('mana', 1), 'potM');
  for (const u of UNIQ) { const b = BASE[u.b], it = {id: UID++, b: u.b, name: u.n, slot: b.slot, cls: b.cls, rar: 'unique', ilvl: 1, mods: {}, req: {lvl: 1, str: 0, dex: 0}}; await ic(it, 'U:' + u.n) }
  await json('icons.json', icons);
  LOG.push('Symbole jetzt: ' + Object.keys(icons).length);
  console.log(LOG.join('\n'));
  return LOG.join('\n');
})()
