// Godot export: runs inside the game (test build, through __ev) and writes data and baked pictures into godot/ via tools/godot-export-server.mjs.
// The game draws its figures anew every frame from shapes; here they are baked once into sheets: 8 directions × walk, attack, idle.
(async () => {
  const LOG = [], put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const slug = s => String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  // plain data only: no functions, no canvases; sets and maps become arrays and objects
  const plain = (o, d = 0) => {
    if (d > 8 || o == null || typeof o === 'function' || o instanceof HTMLCanvasElement) return undefined;
    if (o instanceof Set) return [...o].map(v => plain(v, d + 1));
    if (o instanceof Map) return Object.fromEntries([...o].map(([k, v]) => [k, plain(v, d + 1)]));
    if (Array.isArray(o)) return o.map(v => plain(v, d + 1)).map(v => v === undefined ? null : v);
    if (typeof o === 'object') { const r = {}; for (const k of Object.keys(o)) { const v = plain(o[k], d + 1); if (v !== undefined) r[k] = v } return r }
    return typeof o === 'number' && !isFinite(o) ? null : o;
  };
  const json = (rel, o) => put('data/' + rel, JSON.stringify(plain(o), null, 1));

  // ---------- data ----------
  const items = {}; for (const [k, b] of Object.entries(BASE)) items[k] = b;
  await json('items.json', items);
  await json('uniques.json', UNIQ);
  await json('unique_looks.json', PXU);
  await json('monsters.json', MON);
  await json('variants.json', VAR);
  await json('bosses.json', BOSSES);
  await json('skills.json', SKILLS);
  await json('classes.json', CLS);
  await json('affixes.json', AFF.map(a => ({k: a.k, p: a.p, s: a.s, minT: a.minT || 0, n: a.n, r: [0, 1, 2, 3].map(t => a.r(t))})));
  await json('mod_text.json', Object.fromEntries(Object.keys(MODTXT).map(k => [k, MODTXT[k]('{v}')])));
  await json('mod_order.json', MODORDER);
  await json('palette.json', {ramps: PXM, figure: RP, monster: RMP, elements: typeof EL !== 'undefined' ? EL : null, slots: SLOTNAME, rare1: RARE1, rare2: RARE2});
  LOG.push('Daten: ' + Object.keys(items).length + ' Grundteile, ' + UNIQ.length + ' Unikate, ' + Object.keys(VAR).length + ' Gegnerarten, ' + SKILLS.length + ' Fertigkeiten');

  // ---------- world sprites ----------
  // some sets are only painted when first needed: paint them now
  for (const f of ['hvSprites', 'lvSpr', 'dcSprites', 'chestSprites', 'ydSprites', 'rgBuildSprites']) try { eval(f)() } catch (_) {}
  const sprMeta = {}; let nS = 0;
  const walk = async (o, p) => {
    if (!o) return;
    if (o instanceof HTMLCanvasElement) { await put('assets/sprites/' + p + '.png', await png(o)); sprMeta[p] = {w: o.width, h: o.height, ax: o.ax ?? null, ay: o.ay ?? null}; nS++; return }
    if (typeof o === 'object') for (const k of Object.keys(o)) await walk(o[k], p ? p + '/' + slug(k) : slug(k));
  };
  await walk(SPR, '');
  await json('sprites.json', sprMeta);
  LOG.push('Weltbilder: ' + nS);

  // ---------- item icons ----------
  const icons = {}; let nI = 0;
  for (const [k, b] of Object.entries(BASE)) {
    const it = {id: UID++, b: k, name: k, slot: b.slot, cls: b.cls, rar: 'normal', ilvl: 1, mods: {}, req: {lvl: 1, str: 0, dex: 0}};
    if (b.dmg) { it.dmg = b.dmg.slice(); it.speed = b.speed; it.twoH = b.twoH } if (b.def) it.def = b.def;
    try { const url = invIcon(it), blob = await (await fetch(url)).blob(), f = slug(k) + '.png'; await put('assets/icons/' + f, blob); icons[k] = {file: f, size: isz(it)}; nI++ } catch (e) { LOG.push('Symbol fehlt: ' + k) }
  }
  await json('icons.json', icons);
  LOG.push('Symbole: ' + nI);

  // ---------- baked figures ----------
  const DIRS = 8, sv = {ctx, CX, CY, W, H, shadow, imp: IMP.on, t: G.t};
  const sheet = (S, cols) => { const c = document.createElement('canvas'); c.width = S * cols; c.height = S * DIRS; return c };
  const cellAt = (g, S, col, row, x, y) => { g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(col * S, row * S, S, S); g.clip(); CX = col * S + S / 2 - (x - y) * 32; CY = row * S + Math.round(S * .85) - (x + y) * 16 };
  const anims = {};
  try {
    // a screen as large as every sheet, or the game skips figures it thinks are off screen
    shadow = () => {}; IMP.on = false; IMP.hz = 1e-9; W = H = 1e5;
    // enemies: per kind 8 walk frames, 4 attack frames, 1 standing frame, in 8 directions (world angle k·45°, 0 = towards the lower right of the screen)
    for (const vid of Object.keys(VAR)) {
      const e = makeEnemy(vid, 50, 50), S = Math.ceil(96 * (e.scale || 1)) + 16, cols = 13, c = sheet(S, cols), g = c.getContext('2d');
      ctx = g;
      for (let r = 0; r < DIRS; r++) for (let col = 0; col < cols; col++) {
        cellAt(g, S, col, r, e.x, e.y);
        Object.assign(e, {face: r * Math.PI / 4, dead: false, flash: 0, hitT: 0, lungeT: 0, charge: 0, aggro: true, _at: G.t});
        if (col < 8) { e.anim = col / 8 * 2 * Math.PI / 9; e._ar = 3; e._an = e.anim }
        else if (col < 12) { e.anim = 0; e._ar = 0; e._an = 0; e.lungeT = .22 * (1 - (col - 8 + .5) / 4) }
        else { e.anim = 0; e._ar = 0; e._an = 0 }
        try { drawEnemy(e) } catch (err) { LOG.push('Gegner ' + vid + ': ' + err.message) }
        g.restore();
      }
      await put('assets/figures/enemy_' + slug(vid) + '.png', await png(c));
      anims['enemy_' + slug(vid)] = {cell: S, anchor: [S / 2, Math.round(S * .85)], dirs: DIRS, walk: [0, 8], attack: [8, 4], idle: [12, 1], name: e.name, look: e.look || e.type};
    }
    // heroes: each class with its starting kit · 8 walk, 6 attack, 1 standing
    const keepP = P;
    for (const cls of Object.keys(CLS)) {
      // the same kit as a new hero of that class (startNew without entering the world)
      const C = CLS[cls]; P = newPlayer(); P.cls = cls; P.stats = {...C.stats}; P.sk = {}; C.skills.forEach((id, i) => P.sk[id] = i === 0 ? 1 : 0); P.sel = C.skills[0]; P.eq.weapon = startWeapon(C.wc);
      P.eq.armor = {id: UID++, b: 'Lederwams', name: 'Lederwams', slot: 'armor', cls: 'armor', rar: 'normal', ilvl: 1, def: 8, mods: {}, req: {lvl: 1, str: 0, dex: 0}};
      recalc(); P.hp = P.d.life; P.x = P.y = 50; const S = 112, cols = 15, c = sheet(S, cols), g = c.getContext('2d'); ctx = g;
      for (let r = 0; r < DIRS; r++) for (let col = 0; col < cols; col++) {
        cellAt(g, S, col, r, P.x, P.y);
        Object.assign(P, {face: r * Math.PI / 4, gT: G.t, gX: P.x, gY: P.y, hurt: 0, roll: 0, dash: null, leap: null, whirl: 0, trail: []});
        if (col < 8) { P.moving = true; P.gV = 4.2; P.gA = 1; P.gPh = col / 8 * Math.PI * 2 / 2.15; P.atkT = 0 }
        else if (col < 14) { P.moving = false; P.gA = 0; P.gV = 0; P.atkDur = .4; P.atkT = .4 * (1 - (col - 8 + .5) / 6) }
        else { P.moving = false; P.gA = 0; P.gV = 0; P.atkT = 0 }
        try { drawPlayer() } catch (err) { LOG.push('Held ' + cls + ': ' + err.message) }
        g.restore();
      }
      await put('assets/figures/hero_' + slug(cls) + '.png', await png(c));
      anims['hero_' + slug(cls)] = {cell: S, anchor: [S / 2, Math.round(S * .85)], dirs: DIRS, walk: [0, 8], attack: [8, 6], idle: [14, 1], name: CLS[cls].n};
    }
    P = keepP; recalc();
  } finally { ctx = sv.ctx; CX = sv.CX; CY = sv.CY; W = sv.W; H = sv.H; shadow = sv.shadow; IMP.on = sv.imp; IMP.hz = 15; G.t = sv.t }
  await json('figures.json', anims);
  LOG.push('Figuren-Bögen: ' + Object.keys(anims).length);
  await put('EXPORT.txt', 'Export aus dem Browser-Spiel, ' + new Date().toISOString() + '\n' + LOG.join('\n') + '\n');
  return LOG.join('\n');
})()
