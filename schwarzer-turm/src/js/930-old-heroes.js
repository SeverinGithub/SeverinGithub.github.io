/* ---------- old heroes: the tree is replanted for everyone, the huntress learns her new blades, and a wanderer chooses a new way ---------- */
function skReset(){const sum=(Array.isArray(P.slv)?P.slv:Object.values(P.sk||{})).reduce((a,b)=>a+(b||0),0);P.slv=[1,0,0,0,0,0];P.sk={};P._ska=null;P.cds={};P.spts+=Math.max(0,sum-1);P.sel=CLS[P.cls].skills[0];return Math.max(0,sum-1)}
function clsSwitch(c){const C=CLS[c];let back=0;for(const k in OLDW){const s=(P.stats[k]||0)-OLDW[k];if(s>0)back+=s}
  P.pts+=back;P.stats={...C.stats};P.cls=c;const sb=skReset();P.tree=[];
  const w=P.eq.weapon;if(!wOK(w,c)){P.eq.weapon=null;if(w&&!invAdd(w))(P.stash||(P.stash=[])).push(w);P.eq.weapon=startWeapon(C.wc)}
  P.clv=1;recalc();P.hp=P.d.life;P.mp=P.d.mana;WSC_clear();updatePanels();
  log(`Du gehst jetzt als ${C.n}. ${back} Eigenschaftspunkte, ${sb} Fertigkeitspunkte und alle Talentpunkte stehen dir neu zur Verfügung (C, K, T).`,'#e8c878');try{save()}catch(e){}}
const WSC_clear=()=>{for(const k in WSC)delete WSC[k]};
function clsPick(){const d=$('dialog');G.clsPick=1;
  d.innerHTML='<h2>Der Wanderer geht</h2><p class="hint">Der Turm kennt jetzt vier Wege. Wähle deinen: Stufe, Erfahrung, Glut und alle Gegenstände bleiben, Eigenschafts-, Fertigkeits- und Talentpunkte bekommst du zurück.</p><div class="clsgrid">'
    +Object.entries(CLS).map(([k,c])=>`<button class="clscard" data-clspick="${k}"><b>${c.n}</b><span>${c.d}</span><span class="clsk">${c.skills.map(id=>skImg(id)).join('')}</span></button>`).join('')+'</div>';d.hidden=false}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-clspick]');if(!b||!P)return;e.stopPropagation();G.clsPick=0;closeDialog();clsSwitch(b.dataset.clspick)},true);
const _skMigrateK=skMigrate;skMigrate=function(){_skMigrateK();if(!P||G.state!=='play')return;
  if(!Object.keys(CLS).includes(P.cls)){if($('dialog').hidden||!G.clsPick)clsPick();return}
  // the great tree (eight branches, four rings): old nodes no longer exist, so every point comes back once
  if((P.tv||0)<2){const had=(P.tree||[]).length;P.tv=2;if(had){treeClear();log(`Der Talentbaum ist gewaltig gewachsen: acht Zweige, vier Ringe, Meilensteine. Deine ${had} Talentpunkte sind zurück (P).`,'#e8c878')}}
  if((P.clv||0)>=1)return;P.clv=1;let msg='Der Talentbaum ist neu gewachsen, alle Talentpunkte sind zurück (T).';if((P.tree||[]).length)P.tree=[];
  if(P.cls==='jaegerin'){const sb=skReset();msg+=` Die Jägerin kämpft jetzt mit Klingen: ${sb} Fertigkeitspunkte zurück (K).`}
  WSC_clear();recalc();updatePanels();log(msg,'#e8c878')};
// the mage still starts with his oak staff; the little wand is found, not given
const _startWeaponK=startWeapon;startWeapon=function(c){if(c==='staff'){const it=_startWeaponK(c);if(isWandW(it)&&BASE['Eichenstab']){const b=BASE['Eichenstab'];Object.assign(it,{b:b.n,name:b.n,dmg:b.dmg.slice(),speed:b.speed,twoH:b.twoH});it.mods.spell=10+b.lvl*2}return it}return _startWeaponK(c)};
const _startNewK=startNew;startNew=function(c){const r=_startNewK(c);if(P){P.clv=1;P.tv=2}return r};
const _saveDataK=saveData;saveData=function(){const d=_saveDataK();if(d&&P){d.p.clv=P.clv||0;d.p.tv=P.tv||0}return d};

