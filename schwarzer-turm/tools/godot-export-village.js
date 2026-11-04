// Godot export, hill village (988): bakes the villagers into sheets like tools/godot-export.js does for foes and heroes.
// Per villager and per load it carries (none, ore, bucket, spear, basket): 8 rows of directions × 8 walk frames and 1 standing.
// Runs inside the test build through __ev and writes into godot/ via tools/godot-export-server.mjs.
(async () => {
  const put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const png = c => new Promise(ok => c.toBlob(ok, 'image/png'));
  const DIRS = 8, S = 96, cols = 9, LOG = [], anims = {}, loads = {lehrling: ['ore'], magd: ['bucket'], wache: ['spear'], gaertnerin: ['basket'], kind: [], kind2: []};
  const sv = {ctx, CX, CY, W, H, shadow, label, P, t: G.t};
  try {
    shadow = () => {}; label = () => {}; W = H = 1e5; P = {x: 1e4, y: 1e4};
    for (const id of Object.keys(HVLOOK)) for (const load of [null, ...loads[id]]) {
      const c = document.createElement('canvas'); c.width = S * cols; c.height = S * DIRS; const g = c.getContext('2d'); ctx = g;
      for (let r = 0; r < DIRS; r++) for (let col = 0; col < cols; col++) {
        g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.beginPath(); g.rect(col * S, r * S, S, S); g.clip();
        CX = col * S + S / 2 - (50 - 50) * 32; CY = r * S + Math.round(S * .85) - (50 + 50) * 16;
        const p = {x: 50, y: 50, id, face: r * Math.PI / 4, mv: col < 8, ph: col < 8 ? col / 8 * Math.PI * 2 : 0, seed: 0, run: id.startsWith('kind') ? 1 : 0, load};
        G.t = 0;
        try { hvFolk(p) } catch (err) { LOG.push(id + ': ' + err.message) }
        g.restore();
      }
      const key = 'folk_' + id + (load ? '_' + load : '');
      await put('assets/figures/' + key + '.png', await png(c));
      anims[key] = {cell: S, anchor: [S / 2, Math.round(S * .85)], dirs: DIRS, walk: [0, 8], idle: [8, 1], name: HVLOOK[id].n};
    }
  } finally { ctx = sv.ctx; CX = sv.CX; CY = sv.CY; W = sv.W; H = sv.H; shadow = sv.shadow; label = sv.label; P = sv.P; G.t = sv.t }
  await put('data/village_figures.json', JSON.stringify(anims, null, 1));
  LOG.push('Dorfbewohner-Bögen: ' + Object.keys(anims).length);
  return LOG.join('\n');
})()
