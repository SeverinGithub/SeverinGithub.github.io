// Godot export, the bosses: the three guardians of the deep (makeBoss in 080: Morgrath the knight, the Ash Weaver, Graukeil
// the stone warden) and the eight lords of the sky islands (makeWBoss in 310: the same three looks, each in its own colours
// and size). The first export baked only the kinds of VAR, so Godot stood a grave knight, a brood mother or a golem in for them.
// Writes assets/figures/boss_<n>.png and boss_wb0…wb7.png: 8 directions × 8 walk, 4 attack, 1 standing, at the boss's own
// scale (2.3 for the guardians, 2.1–2.7 for the lords), and their entries in data/figures.json.
// The weaver floats and her legs and glow run on G.t, so the walk frames step G.t along with the stride.
// Runs like tools/godot-export.js (test build, through __ev).
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const figs = await (await fetch('/schwarzer-turm/godot/data/figures.json?' + Date.now())).json(), LOG = [];
  const DIRS = 8, sv = {ctx, CX, CY, W, H, shadow, imp: IMP.on, t: G.t, tele: G.tele};
  // between two sheets (await) the game loop runs: the game gets its own state back before every await and ours after
  const unstage = () => { ctx = sv.ctx; CX = sv.CX; CY = sv.CY; W = sv.W; H = sv.H; shadow = sv.shadow; IMP.on = sv.imp; IMP.hz = 15; G.t = sv.t; G.tele = sv.tele };
  const stage = () => { shadow = () => {}; IMP.on = false; IMP.hz = 1e-9; W = H = 1e5; G.t = 1.3; G.tele = [] };
  const sheet = (S, cols) => { const c = document.createElement('canvas'); c.width = S * cols; c.height = S * DIRS; return c };
  const cellAt = (g, S, col, row, x, y) => { g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(col * S, row * S, S, S); g.clip(); CX = col * S + S / 2 - (x - y) * 32; CY = row * S + Math.round(S * .85) - (x + y) * 16 };
  const bake = async (key, e) => {
    stage();
    const S = Math.ceil(96 * (e.scale || 1)) + 24, cols = 13, c = sheet(S, cols), g = c.getContext('2d');
    ctx = g;
    try {
      for (let r = 0; r < DIRS; r++) for (let col = 0; col < cols; col++) {
        cellAt(g, S, col, r, e.x, e.y);
        Object.assign(e, {face: r * Math.PI / 4, dead: false, flash: 0, hitT: 0, lungeT: 0, charge: 0, aggro: true, _at: G.t});
        if (col < 8) { G.t = 1.3 + col / 8 * Math.PI; e.anim = col / 8 * 2 * Math.PI / 9; e._ar = 3; e._an = e.anim; e._at = G.t }
        else if (col < 12) { G.t = 1.3; e.anim = 0; e._ar = 0; e._an = 0; e.lungeT = .22 * (1 - (col - 8 + .5) / 4) }
        else { G.t = 1.3; e.anim = 0; e._ar = 0; e._an = 0 }
        try { drawEnemy(e) } catch (err) { LOG.push(key + ': ' + err.message) }
        g.restore();
      }
    } finally { unstage() }
    await put('assets/figures/' + key + '.png', await png(c));
    figs[key] = {cell: S, anchor: [S / 2, Math.round(S * .85)], dirs: DIRS, walk: [0, 8], attack: [8, 4], idle: [12, 1], name: e.name, look: e.look};
    LOG.push(key + ' ' + S + 'px');
  };
  const prev = G.mlvl;
  try {
    G.mlvl = 1;
    for (let i = 0; i < BOSSES.length; i++) await bake('boss_' + BOSSES[i].look, makeBoss(3 * (i + 1), 50, 50));
    for (let i = 0; i < WB.length; i++) await bake('boss_' + WB[i].id, makeWBoss(i, 50, 50));
  } finally { G.mlvl = prev }
  await put('data/figures.json', JSON.stringify(figs, null, 1));
  return LOG.join(' · ');
})()
