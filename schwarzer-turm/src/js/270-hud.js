/* ---------- HUD ---------- */
let hudLast={};
function setW(id,v){if(hudLast[id]!==v){hudLast[id]=v;$(id).style[id.endsWith('Fill')&&(id==='lifeFill'||id==='manaFill')?'height':'width']=v}}
function setT(id,v){if(hudLast[id]!==v){hudLast[id]=v;$(id).textContent=v}}
function updHUD(){const d=P.d;
  paintOrb('L',P.hp/d.life);paintOrb('M',P.mp/d.mana);setT('lifeTxt',Math.ceil(P.hp)+' / '+d.life);setT('manaTxt',Math.floor(P.mp)+' / '+d.mana);
  setW('stamFill',(Math.max(0,P.st)/d.stam*100).toFixed(1)+'%');setW('xpFill',(P.xp/xpNext(P.lvl)*100).toFixed(1)+'%');
  $('wardbar').hidden=!(P.ward>0);if(P.ward>0)setW('wardFill',(P.ward/(P.wardMax||1)*100).toFixed(0)+'%');
  setT('glutTxt',P.glut+' Glut');for(const[k,id]of[['life','potLN'],['mana','potMN']]){const n=potCount(k),el=$(id);if(el&&el.textContent!=String(n)){el.textContent=n;el.parentNode.classList.toggle('empty',!n)}}const fn=$('flaskN');if(fn&&fn.textContent!=String(P.flasks))fn.textContent=P.flasks;
  for(const s of mySk()){const el=document.querySelector(`[data-cd="${s.id}"]`);if(el){const v=((P.cds[s.id]||0)/s.cd*100).toFixed(0)+'%';if(el.style.height!==v)el.style.height=v}}
  const he=G.hoverE||(P.target&&!P.target.dead?P.target:null);
  if(he&&!he.boss){$('target').hidden=false;setT('tName',he.name);$('tName').style.color=he.rank==='unique'?'var(--r-unique)':he.rank==='champ'?'var(--r-magic)':'var(--paper)';setT('tSub',he.sub||'');setW('tHp',(Math.max(0,he.hp)/he.max*100).toFixed(1)+'%')}else $('target').hidden=true;
  const boss=G.map.enemies.find(e=>e.boss&&!e.dead&&G.bossSeen[e.wb||G.floor]&&hyp(e.x-P.x,e.y-P.y)<18);
  if(boss){$('bossbar').hidden=false;setT('bName',boss.name);setW('bHp',(boss.hp/boss.max*100).toFixed(1)+'%')}else $('bossbar').hidden=true}

