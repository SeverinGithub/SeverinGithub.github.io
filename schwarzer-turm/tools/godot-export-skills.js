// Godot export, skills: names, level requirements, cooldowns, mana per level, descriptions and icons of every skill,
// the mage's names and icons per element, and which weapon brings which weapon set. Runs like tools/godot-export.js (test build, through __ev),
// best on a fresh page right after startNew('krieger'). Descriptions are taken with spell power 1 and no dexterity or potion bonus:
// Godot shows them as base values.
(async () => {
  const LOG = [], put = async (rel, body) => { const r = await fetch('/__export/' + rel, {method: 'PUT', body}); if (!r.ok) throw new Error(rel + ': ' + r.status) };
  const json = (rel, o) => put('data/' + rel, JSON.stringify(o, null, 1));
  const blob = async url => (await fetch(url)).blob();
  try { addSkillIcons() } catch (_) {}
  // neutral numbers for the descriptions
  const keep = {d: P.d, eq: P.eq};
  P.d = Object.assign({}, P.d, {spellMul: 1, potPow: 0, s: Object.assign({}, P.d.s, {dex: 0})});
  const out = {}, icons = {};
  const icon = async (key, url) => { if (!url) return; await put('assets/skills/' + key + '.png', await blob(url)); icons[key] = key + '.png' };
  try {
    for (const s of SKILLS) {
      const o = {n: s.n, req: s.req, cd: s.cd, mana: [], desc: []};
      for (let l = 0; l <= 30; l++) o.mana.push(s.mana ? s.mana(l) : 0);
      for (let l = 1; l <= 25; l++) o.desc.push(s.desc ? s.desc(l) : '');
      if (MNAME[s.id]) {
        o.byElem = {};
        for (const el of [...ELK, 'none']) {
          P.eq = Object.assign({}, keep.eq, {weapon: el === 'none' ? null : {b: 'Eichenstab', cls: 'staff', slot: 'weapon', elem: el, mods: {}, req: {lvl: 1, str: 0, dex: 0}}});
          P.d.okS = new Set([P.eq.weapon]);
          const d = []; for (let l = 1; l <= 25; l++) d.push(s.desc(l));
          o.byElem[el] = {n: MNAME[s.id][el], desc: d};
          await icon(s.id + '_' + el, SKIC[s.id + '_' + el]);
        }
        P.eq = keep.eq;
      } else await icon(s.id, Object.getOwnPropertyDescriptor(SKIC, s.id) ? SKIC[s.id] : null);
      out[s.id] = o;
    }
    await icon('flask', SKIC.flask);
  } finally { P.d = keep.d; P.eq = keep.eq }
  // weapon sets: what a weapon in hand brings, for whoever may wield it
  const wset = {};
  for (const [k, b] of Object.entries(BASE)) {
    if (b.slot !== 'weapon') continue;
    const sh = SH(k);
    const key = isDualB(k) ? 'dual' : (b.cls === 'great' || sh === 'Langschwert' || sh === 'Runenklinge') ? 'great' : b.cls === 'mace' ? 'hammer' : b.cls === 'spear' ? 'spear' : null;
    if (key) wset[k] = key;
  }
  await json('skill_info.json', {skills: out, icons, sets: Object.fromEntries(Object.entries(WSETS).map(([k, S]) => [k, {n: S.n, ids: S.ids, rgb: S.rgb}])), wset, elements: Object.fromEntries(ELK.map(k => [k, {n: EL[k].n, col: EL[k].col, rgb: EL[k].rgb, c: EL[k].c}])), undead: [...UNDEAD]});
  LOG.push('Fertigkeiten: ' + Object.keys(out).length + ', Symbole: ' + Object.keys(icons).length + ', Waffen mit Satz: ' + Object.keys(wset).length);
  console.log(LOG.join('\n'));
  return LOG.join('\n');
})()
