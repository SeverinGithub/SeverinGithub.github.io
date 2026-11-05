// Godot export, the dead lands, part 2 (540/550): Ser Haldor on his horse, the bone horses at a gallop, and Gram, the hero's mount.
// The horse rig in 540 advances from how far the horse really moved since the last frame; a baked frame does not move, so the
// first export drew every horse standing and facing right. Here the rig is set by hand per frame (gait, stride phase, facing).
// Writes assets/figures/enemy_rg_ross|rg_reiter|rg_haldor.png (8 directions × gallop, attack, standing) and
// assets/mount/gram_back.png + gram_near.png (one side view, Godot mirrors it): the horse behind the rider and the near flank
// with its legs in front of him, as drawPlayer's wrapper in 550 layers them, plus where the saddle sits in every frame.
// Also the mount's bag and ground picture. Runs like tools/godot-export.js (test build, through __ev).
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const get = async rel => (await fetch('/schwarzer-turm/godot/data/' + rel + '?' + Date.now())).json();
  const figs = await get('figures.json'), icons = await get('icons.json'), ground = await get('ground.json'), LOG = [];
  const DIRS = 8, sv = {ctx, CX, CY, W, H, shadow, imp: IMP.on, t: G.t, tick: rgHorseTick, fxp};
  let rig = null;
  const fresh = o => Object.assign(rgHS(), {t: G.t, x: 0, y: 0, v: 0, ph: 0, tf: 1, rear: 0, pawT: 0, snort: 0, blink: 1, paw: 99, tail: null}, o);
  try {
    // the rig stays exactly as set: no movement measured, no time passing, no dust
    rgHorseTick = H => { if (rig) Object.assign(H, rig); return 0 };
    fxp = () => {}; shadow = () => {}; IMP.on = false; IMP.hz = 1e-9; W = H = 1e5; G.t = 1.3;
    const sheet = (w, h, cols, rows) => { const c = document.createElement('canvas'); c.width = w * cols; c.height = h * rows; return c };
    const cellAt = (g, S, col, row, x, y) => { g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(col * S, row * S, S, S); g.clip(); CX = col * S + S / 2 - (x - y) * 32; CY = row * S + Math.round(S * .85) - (x + y) * 16 };

    // ---------- horses as foes: gallop when they move, stand when they strike ----------
    // between two sheets (await) the game loop runs: it would set the screen size back and paint the world into our canvas,
    // so the game gets its own state back before every await and ours again after
    const unstage = () => { ctx = sv.ctx; CX = sv.CX; CY = sv.CY; W = sv.W; H = sv.H; shadow = sv.shadow; IMP.on = sv.imp; IMP.hz = 15; G.t = sv.t; fxp = sv.fxp };
    const stage = () => { fxp = () => {}; shadow = () => {}; IMP.on = false; IMP.hz = 1e-9; W = H = 1e5; G.t = 1.3 };
    const horse = async (key, e) => {
      stage();
      const S = Math.ceil(112 * (e.scale || 1)) + 16, cols = 13, c = sheet(S, S, cols, DIRS), g = c.getContext('2d');
      ctx = g;
      for (let r = 0; r < DIRS; r++) for (let col = 0; col < cols; col++) {
        cellAt(g, S, col, r, e.x, e.y);
        Object.assign(e, {face: r * Math.PI / 4, dead: false, flash: 0, hitT: 0, lungeT: 0, charge: 0, aggro: true, _at: G.t});
        const f = scrDir(e.face)[0] >= 0 ? 1 : -1;
        if (col < 8) { e.anim = col / 8 * 2 * Math.PI / 9; e._ar = 3; e._an = e.anim; rig = {v: 1, ph: col / 8} }
        else if (col < 12) { e.anim = 0; e._ar = 0; e._an = 0; e.lungeT = .22 * (1 - (col - 8 + .5) / 4); rig = {v: 0, ph: 0} }
        else { e.anim = 0; e._ar = 0; e._an = 0; rig = {v: 0, ph: 0} }
        e.hs = fresh({...rig, tf: f});
        try { drawEnemy(e) } catch (err) { LOG.push(key + ': ' + err.message) }
        g.restore();
      }
      unstage();
      await put('assets/figures/' + key + '.png', await png(c));
      // a full stride of the gallop takes as long as in the browser at full speed: 2.4 strides a second
      figs[key] = {cell: S, anchor: [S / 2, Math.round(S * .85)], dirs: DIRS, walk: [0, 8], attack: [8, 4], idle: [12, 1], fps: {walk: 19}, name: e.name, look: e.look || e.type};
      LOG.push(key + ' ' + S + 'px');
    };
    await horse('enemy_rg_ross', makeEnemy('rg_ross', 50, 50));
    await horse('enemy_rg_reiter', makeEnemy('rg_reiter', 50, 50));
    { const prev = G.mlvl; G.mlvl = 1; const e = makeRgBoss(50, 50); G.mlvl = prev; await horse('enemy_rg_haldor', e) }

    // ---------- Gram under the hero: one side view, the back (all of the horse but the near flank) and the near flank ----------
    // frames: 8 gallop, 1 standing, 6 pawing the ground, 10 rearing up when the hero mounts (H.rear runs 1 → 0 in 1.05 s)
    stage();
    const FR = [];
    for (let k = 0; k < 8; k++) FR.push({v: 1, ph: k / 8});
    FR.push({v: 0, ph: 0});
    for (let k = 0; k < 6; k++) FR.push({v: 0, ph: 0, pawT: 1 - k / 6});
    for (let k = 0; k < 10; k++) FR.push({v: 0, ph: 0, rear: 1 - k / 10});
    const CW = 176, CHh = 168, AX = 88, AY = 132, K = 1.32, back = sheet(CW, CHh, FR.length, 1), near = sheet(CW, CHh, FR.length, 1), saddle = [];
    const gB = back.getContext('2d'), gN = near.getContext('2d'), look = {hbone: 'pale', bard: 'royal', rider: 1, eye: '#ff7a2a'};
    const who = {x: 0, y: 0, face: 0, dead: false};
    FR.forEach((fr, i) => {
      rig = fr; const Hs = fresh({...fr, tf: 1});
      for (const g of [gB, gN]) { g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(i * CW, 0, CW, CHh); g.clip(); g.translate(i * CW + AX, AY); g.scale(K, K) }
      ctx = gB; let sd;
      try { sd = rgHorse({F: r => r, f: 1, late: 1, step: null}, look, who, Hs, 1) } catch (err) { LOG.push('Gram: ' + err.message) }
      ctx = gN; try { if (Hs.late) Hs.late() } catch (err) { LOG.push('Gram vorn: ' + err.message) }
      gB.restore(); gN.restore();
      // the rider sits the stride: where drawPlayer's wrapper puts him and how far it tips him (for f = 1; Godot mirrors)
      saddle.push(sd ? [+(sd.x * K).toFixed(2), +(sd.y * K + 23).toFixed(2), +(sd.a * .55 + (fr.v > .3 ? .06 * fr.v : 0)).toFixed(4)] : [0, 0, 0]);
    });
    unstage();
    await put('assets/mount/gram_back.png', await png(back));
    await put('assets/mount/gram_near.png', await png(near));
    await put('data/mount.json', JSON.stringify({cell: [CW, CHh], anchor: [AX, AY], gallop: [0, 8], idle: [8, 1], paw: [9, 6], rear: [15, 10], fps: {gallop: 19, paw: 6 / 1.1, rear: 10 / 1.05}, saddle}, null, 1));
    LOG.push('Gram: ' + FR.length + ' Bilder');
  } finally { ctx = sv.ctx; CX = sv.CX; CY = sv.CY; W = sv.W; H = sv.H; shadow = sv.shadow; IMP.on = sv.imp; IMP.hz = 15; G.t = sv.t; rgHorseTick = sv.tick; fxp = sv.fxp; rig = null }
  await put('data/figures.json', JSON.stringify(figs, null, 1));

  // ---------- the mount in the bag and on the ground ----------
  const it = makeMount(), url = invIcon(it), blob = await (await fetch(url)).blob();
  await put('assets/icons/knochenross.png', blob); icons['Knochenross'] = {file: 'knochenross.png', size: isz(it)};
  const c = pxCanvas('Knochenross'); await put('assets/ground/knochenross.png', await png(c)); ground['Knochenross'] = {file: 'knochenross.png', w: c.width, h: c.height};
  await put('data/icons.json', JSON.stringify(icons, null, 1)); await put('data/ground.json', JSON.stringify(ground, null, 1));
  return LOG.join(' · ');
})()
