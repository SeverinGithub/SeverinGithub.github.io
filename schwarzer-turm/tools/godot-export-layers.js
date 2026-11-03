// Godot export, part two: the hero in layers. Runs like tools/godot-export.js (inside the game, through __ev).
// A body sheet per class and pose, then every piece of gear on its own sheet, in grey: one sheet per colour ramp of the piece
// (p = main material, s = second, t = grip or cloth, g = gem). Godot colours each grey sheet with the ramp of the actual material,
// so one bake serves every material tier. Parts the game paints in fixed colours (glows, eye holes, strings) go on an f sheet in colour.
// How a layer is cut out: the hero is drawn once with the piece in a solid key colour (magenta, the "hole") and once per ramp in grey
// with the other ramps still in key colour, so they hide what lies behind them. What differs from the hole is that ramp's visible part;
// where its edge was smoothed into the key colour, the key is taken back out (grey and alpha restored).
// Some colours the game mixes from a ramp while drawing (mixR, darkR: the huntress's mantle and hood, the alchemist's apron). Those parts get
// their own d sheets with the recipe in hero_layers.json, so Godot mixes the real material the same way before colouring.
(async () => {
  const LOG = [], put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const slug = s => String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const DIRS = 8, S = 112, COLS = 15, ANCH = [S / 2, Math.round(S * .85)];
  const GREY = ['#000000', '#555555', '#aaaaaa', '#ffffff'], KEY = ['#ff00ff', '#ff00ff', '#ff00ff', '#ff00ff'];
  PXM.__g = GREY; PXM.__gm = GREY; METAL.add('__gm'); PXM.__x = KEY; PXG.__g = ['#000000', '#808080', '#ffffff']; PXG.__x = KEY.slice(0, 3);
  const sv = {ctx, CX, CY, W, H, shadow, P, t: G.t};

  // the whole sheet of one hero setup: 8 directions × 8 walk, 6 attack, 1 standing
  const sheet = () => {
    const c = document.createElement('canvas'); c.width = S * COLS; c.height = S * DIRS; const g = c.getContext('2d', {willReadFrequently: true}); ctx = g;
    for (let r = 0; r < DIRS; r++) for (let col = 0; col < COLS; col++) {
      g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(col * S, r * S, S, S); g.clip();
      CX = col * S + S / 2 - (P.x - P.y) * 32; CY = r * S + ANCH[1] - (P.x + P.y) * 16;
      Object.assign(P, {face: r * Math.PI / 4, gT: G.t, gX: P.x, gY: P.y, hurt: 0, roll: 0, dash: null, leap: null, whirl: 0, trail: [], veilT: 0});
      if (col < 8) { P.moving = true; P.gV = 4.2; P.gA = 1; P.gPh = col / 8 * Math.PI * 2 / 2.15; P.atkT = 0 }
      else if (col < 14) { P.moving = false; P.gA = 0; P.gV = 0; P.atkDur = .4; P.atkT = .4 * (1 - (col - 8 + .5) / 6) }
      else { P.moving = false; P.gA = 0; P.gV = 0; P.atkT = 0 }
      try { drawPlayer() } catch (err) { if (LOG.length < 20) LOG.push('Zeichnen: ' + err.message) }
      g.restore();
    }
    return c;
  };
  // the pixels of a that differ from b; null when there are none
  // grey layers: a pixel that is part key, part grey has g = grey·(1-k) and min(r,b) - g = 255·k, so both come back exactly;
  // colour layers (f): the key share is taken out the same way (colour = (pixel - k·magenta) / (1-k)), pixels mostly made of key are dropped
  const cut = (a, b, grey) => {
    const w = a.width, h = a.height, A = a.getContext('2d').getImageData(0, 0, w, h), B = b.getContext('2d').getImageData(0, 0, w, h), d = A.data, e = B.data; let n = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] === e[i] && d[i + 1] === e[i + 1] && d[i + 2] === e[i + 2] && d[i + 3] === e[i + 3]) { d[i + 3] = 0; continue }
      const k = Math.max(0, Math.min(1, (Math.min(d[i], d[i + 2]) - d[i + 1]) / 255));
      if (grey) { const q = 1 - k, a2 = d[i + 3] * q; if (a2 < 10) { d[i + 3] = 0; continue } const v = Math.min(255, Math.round(d[i + 1] / q)); d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = Math.round(a2) }
      else { if (k > .5) { d[i + 3] = 0; continue } if (k > 0) { const q = 1 - k; d[i] = Math.max(0, Math.min(255, Math.round((d[i] - 255 * k) / q))); d[i + 1] = Math.min(255, Math.round(d[i + 1] / q)); d[i + 2] = Math.max(0, Math.min(255, Math.round((d[i + 2] - 255 * k) / q))); d[i + 3] = Math.round(d[i + 3] * q); if (d[i + 3] < 10) { d[i + 3] = 0; continue } } }
      if (d[i + 3] > 0) n++;
    }
    if (n < 4) return null;
    const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(A, 0, 0); c.n = n; return c;
  };
  // a stand-in item drawn like the real base, with the ramps we choose
  const fake = (root, mats) => {
    // one stand-in per slot, so the hidden weapon and the piece being baked never share their colours
    const b = BASE[root], k = '__bake_' + b.slot; BASE[k] = Object.assign({}, b, {n: k, shape: root}); PXS[k] = [PXS[root] ? PXS[root][0] : null, ...mats];
    const it = {id: UID++, b: k, name: 'x', slot: b.slot, cls: b.cls, rar: 'normal', ilvl: 1, mods: {}, req: {lvl: 1, str: 0, dex: 0}};
    if (b.dmg) { it.dmg = b.dmg.slice(); it.speed = b.speed; it.twoH = b.twoH } if (b.def) it.def = b.def; if (b.block) it.block = b.block; return it;
  };
  const hero = cls => { const C = CLS[cls]; P = newPlayer(); P.cls = cls; P.lvl = 99; P.stats = {str: 999, dex: 999, vit: 99, ene: 99}; P.sk = {}; C.skills.forEach(id => P.sk[id] = 1); P.x = P.y = 50; P.eq = {weapon: null, offhand: null, helm: null, armor: null, gloves: null, boots: null, belt: null} };
  const equip = (slot, it) => { P.eq[slot] = it; recalc() };
  const mats = root => { const s = PXS[root] || []; const p = s[1] || 'iron'; return {p, s: s[2] || p, t: s[3] || p, g: s[4] || 'ruby'} };
  const grey = m => METAL.has(m) ? '__gm' : '__g';
  const pose = () => { const w = P.eq.weapon; if (!w) return 'melee'; if (w.cls === 'bow' || w.cls === 'xbow') return w.cls; return (typeof wSetKey === 'function' && wSetKey()) || 'melee' };

  const bodies = {}, layers = {};
  // mage, huntress and alchemist draw hood and collar differently under a helm, so their bodies and armour also come in a helmed version (_h),
  // baked with an invisible helm on
  const HELMED = ['magier', 'jaegerin', 'alchemist'];
  let ghostHelm = null;
  const body = async (cls, ps, holeWeapon, helmed) => {
    const k = cls + '_' + ps + (helmed ? '_h' : ''); if (bodies[k]) return k;
    hero(cls); if (holeWeapon) equip('weapon', holeWeapon); if (helmed) equip('helm', ghostHelm());
    await put('assets/hero/body_' + k + '.png', await png(sheet())); bodies[k] = {cls, pose: ps, helmed: !!helmed}; return k;
  };
  try {
    shadow = () => {}; W = H = 1e5;
    // a body for every class with its own weapon kind, and the alchemist also with a crossbow and a wand
    const holeOf = root => fake(root, ['__x', '__x', '__x', '__x']);
    // the hidden weapon on a body bake must vanish, not show in key colour: there it is drawn see-through
    PXM.__n = ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)']; PXG.__n = ['rgba(0,0,0,0)', '#000000', 'rgba(0,0,0,0)'];
    const ghostOf = root => fake(root, ['__n', '__n', '__n', '__n']);
    // a gem's glow appends 'aa' to its colour, so the ghost's black gem would leave a dark halo: make that glow see-through too
    const ACS = CanvasGradient.prototype.addColorStop; CanvasGradient.prototype.addColorStop = function (o, c) { return ACS.call(this, o, c === '#000000aa' ? 'rgba(0,0,0,0)' : c) }; sv.acs = ACS;
    // mixed colours: in a plain pass a mix of the grey ramp is noted as a recipe and hidden in key colour; in its own pass the ramp is a marker
    // (near-key, which cut() drops) and only the mix of that recipe comes out grey, so it decodes like any ramp once Godot mixes the material
    const MK = '#ff01ff'; PXM.__d = [MK, MK, MK, MK]; PXM.__dm = PXM.__d; METAL.add('__dm');
    const isGrey = A => A && A[0] === '#000000' && A[1] === '#555555' && A[3] === '#ffffff', isKey = A => A && A[0] === '#ff00ff', tag = r => { const g = GREY.slice(); g.rec = r; return g };
    const bake = {pass: null, found: [], want: null}; sv.mixR = mixR; sv.darkR = darkR;
    mixR = function (A, B, t) {
      if (isKey(A)) return KEY.slice();
      if (isGrey(A)) { const id = bake.pass + '|' + B.join() + '|' + t; if (!bake.found.some(r => r.id === id)) bake.found.push({id, src: bake.pass, mix: B.slice(), t, dark: false}); return KEY.slice() }
      if (A && A[0] === MK) return bake.want && bake.want.id === bake.pass + '|' + B.join() + '|' + t ? tag(bake.want) : KEY.slice();
      return sv.mixR(A, B, t);
    };
    darkR = function (C) { if (C && C.rec) { C.rec.dark = true; return C } if (isKey(C)) return KEY.slice(); return sv.darkR(C) };
    ghostHelm = () => ghostOf('Eisenhelm');
    for (const cls of Object.keys(CLS)) for (const hd of HELMED.includes(cls) ? [false, true] : [false]) { const w = startWeapon(CLS[cls].wc); hero(cls); equip('weapon', ghostOf(w.b)); await body(cls, pose(), ghostOf(w.b), hd) }
    const roots = Object.values(BASE).filter(b => !b.shape && !b.n.startsWith('__bake') && ['weapon', 'offhand', 'helm', 'armor', 'gloves', 'boots', 'belt'].includes(b.slot));
    let n = 0;
    for (const b of roots) {
      const root = b.n, slot = b.slot, M = mats(root);
      // who wears it: each class draws gear its own way (the huntress's mantle, the mage's robe), so a piece is baked once per class that wears it:
      // weapons on every class that may use them, a class's own kit on that class, everything else on all four
      const probe = {b: root, cls: b.cls, slot};
      const wearers = slot === 'weapon' ? Object.keys(CLS).filter(c => CLSW[c] && CLSW[c](probe)) : b.hunt ? ['jaegerin'] : b.alch ? ['alchemist'] : b.mage ? ['magier'] : b.krie ? ['krieger'] : Object.keys(CLS);
      for (const cls of (wearers.length ? wearers : ['krieger'])) for (const hd of slot === 'armor' && HELMED.includes(cls) ? [false, true] : [false]) {
      const dress = () => { hero(cls); if (slot !== 'weapon') equip('weapon', ghostOf(sw.b)); if (hd) equip('helm', ghostHelm()) };
      const sw = startWeapon(CLS[cls].wc); dress();
      equip(slot, holeOf(root)); const ps = pose(), bk = await body(cls, ps, slot === 'weapon' ? ghostOf(root) : ghostOf(sw.b), hd);
      dress(); equip(slot, holeOf(root)); const hole = sheet();
      const L = {slot, cls, body: bk, passes: [], mats: M, file: slot + '_' + slug(root) + '_' + cls + (hd ? '_h' : '')};
      const at = {t: 2, p: 0, s: 1}; bake.found = [];
      for (const [k, set] of [['t', ['__x', '__x', grey(M.t), '__x']], ['p', [grey(M.p), '__x', '__x', '__x']], ['s', ['__x', grey(M.s), '__x', '__x']], ['g', ['__x', '__x', '__x', '__g']]]) {
        bake.pass = k; equip(slot, fake(root, set)); const c = cut(sheet(), hole, true);
        if (c) { await put('assets/hero/' + L.file + '_' + k + '.png', await png(c)); L.passes.push(k) }
      }
      const found = bake.found.slice();
      for (let i = 0; i < found.length; i++) {
        const r = found[i], set = ['__x', '__x', '__x', '__x']; set[at[r.src]] = METAL.has(M[r.src]) ? '__dm' : '__d';
        bake.pass = r.src; bake.want = r; equip(slot, fake(root, set)); const c = cut(sheet(), hole, true); bake.want = null;
        if (c) { const k = 'd' + i; await put('assets/hero/' + L.file + '_' + k + '.png', await png(c)); L.passes.push(k); (L.derived = L.derived || {})[k] = {src: r.src, mix: r.mix, t: r.t, dark: r.dark} }
      }
      bake.pass = null;
      // the fixed colours: compare the hole with the hero without the piece (only where taking it off does not change the pose)
      if (!['armor', 'gloves', 'boots', 'belt'].includes(slot) && !(slot === 'weapon' && (b.cls === 'bow' || b.cls === 'xbow'))) {
        equip(slot, null); let c = cut(hole, sheet(), false);
        // a helm on mage, huntress or alchemist: compare with the helmed body as well and keep whichever leaves less behind;
        // a huntress's hood, for one, keeps the plain body. hero.gd picks the body and armour version from this
        if (slot === 'helm' && HELMED.includes(cls)) { equip(slot, ghostHelm()); const c2 = cut(hole, sheet(), false); if (!c2 || (c && c2.n < c.n)) { L.helmed = true; c = c2 } }
        if (c) { await put('assets/hero/' + L.file + '_f.png', await png(c)); L.passes.push('f') }
      }
      layers[cls + ':' + root + (hd ? ':h' : '')] = L; n++;
      }
    }
    LOG.push('Körper: ' + Object.keys(bodies).length + ', Ebenen (Teil × Klasse): ' + n);
  } finally { if (sv.acs) CanvasGradient.prototype.addColorStop = sv.acs; if (sv.mixR) { mixR = sv.mixR; darkR = sv.darkR } ctx = sv.ctx; CX = sv.CX; CY = sv.CY; W = sv.W; H = sv.H; shadow = sv.shadow; P = sv.P; G.t = sv.t; for (const k of Object.keys(BASE)) if (k.startsWith('__bake')) { delete BASE[k]; delete PXS[k] } recalc() }

  // which base uses which layer (looked up as <class>:<layer>) and which materials, tiers and uniques included
  const looks = {};
  for (const [k, b] of Object.entries(BASE)) { if (!['weapon', 'offhand', 'helm', 'armor', 'gloves', 'boots', 'belt'].includes(b.slot)) continue; const s = PXS[k] || []; const p = s[1] || 'iron'; looks[k] = {layer: SH(k), p, s: s[2] || p, t: s[3] || p, g: s[4] || 'ruby'} }
  const file = {cell: S, anchor: ANCH, dirs: DIRS, walk: [0, 8], attack: [8, 6], idle: [14, 1], order: ['boots', 'armor', 'belt', 'gloves', 'helm', 'offhand', 'weapon'], pass_order: ['t', 'p', 's', 'g', 'd0', 'd1', 'd2', 'd3', 'f'],
    bodies, layers, looks, ramps: PXM, gems: PXG, unique_looks: PXU};
  for (const k of ['__g', '__gm', '__x', '__n', '__d', '__dm']) { delete file.ramps[k] } delete file.gems.__g; delete file.gems.__x; delete file.gems.__n;
  await put('data/hero_layers.json', JSON.stringify(file, null, 1));
  delete PXM.__g; delete PXM.__gm; delete PXM.__x; delete PXG.__g; delete PXG.__x; delete PXM.__n; delete PXG.__n; delete PXM.__d; delete PXM.__dm; METAL.delete('__gm'); METAL.delete('__dm');
  return LOG.join('\n');
})()
