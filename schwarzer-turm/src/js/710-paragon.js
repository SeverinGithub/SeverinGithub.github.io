/* ---------- paragon: from level 60 on, experience keeps paying out in small points for lasting strength ---------- */
const PARA_LV=60,PARA_MAX=50;
const PARA=[{g:'Kraft',c:'#e8c878',k:[['str',3,' Stärke'],['dex',3,' Geschick'],['vit',3,' Vitalität'],['ene',3,' Energie']]},
  {g:'Angriff',c:'#ff8a6a',k:[['ed',2,'% Waffenschaden'],['spell',2,'% Zauberschaden'],['ias',1,'% Angriffstempo'],['crit',.5,'% Krit-Chance']]},
  {g:'Abwehr',c:'#9ac4ff',k:[['lifeP',1,'% Leben'],['tdef',2,'% Verteidigung'],['res',1,'% Widerstände'],['regen',2,' Lebensregeneration']]},
  {g:'Glück',c:'#c8f078',k:[['mf',2,'% magische Funde'],['glutf',2,'% mehr Glut'],['xp',1,'% Erfahrung'],['frw',.5,'% Lauftempo']]}];
const PARAK={};for(const g of PARA)for(const[k,v,n]of g.k)PARAK[k]={v,n};
function paraMods(){const p=P&&P.para;if(!p)return null;const m={};let any=0;for(const k in p)if(p[k]&&PARAK[k]){m[k]=Math.round(p[k]*PARAK[k].v*10)/10;any=1}return any?m:null}
const _recalcPa=recalc;recalc=function(){const pm=paraMods();if(!pm)return _recalcPa();TREE.__para={m:pm};P.tree.push('__para');try{_recalcPa()}finally{const i=P.tree.lastIndexOf('__para');if(i>=0)P.tree.splice(i,1)}};
const _gainXpPa=gainXp;gainXp=function(x){if(!P||P.lvl<PARA_LV)return _gainXpPa(x);x=Math.round(x*(1+((P.d&&P.d.xp)||0)/100));P.xp+=x;let up=0;
  while(P.xp>=xpNext(P.lvl)){P.xp-=xpNext(P.lvl);P.pl=(P.pl||0)+1;P.ppts=(P.ppts||0)+1;up++}
  if(up){banner('PARAGON '+P.pl,(up>1?up+' Paragonpunkte':'1 Paragonpunkt')+' · im Heldenfenster verteilen','',2400);sample('lvlup',.75,{rate:1.06});burst(P.x,P.y,'#c8f0ff',30,3);updatePanels()}};
function paraHTML(){const p=P.para||{},on=P.lvl>=PARA_LV;
  if(!on)return`<h3>Paragon</h3><p class="hint">Ab Stufe ${PARA_LV} füllt die Erfahrung keine Stufen mehr, sondern Paragonstufen. Jede bringt einen Punkt für kleine, dauerhafte Stärken.</p>`;
  return`<h3>Paragon ${P.pl||0}${P.ppts?` · <span style="color:var(--gold)">${P.ppts} ${P.ppts===1?'Punkt':'Punkte'} frei</span>`:''}</h3><div class="paras">${PARA.map(g=>`<div class="parag"><b style="color:${g.c}">${g.g}</b>${g.k.map(([k,v,n])=>{const c=p[k]||0;
    return`<div class="statrow"><span>+${Math.round(c*v*10)/10}${n}</span><b>${c}/${PARA_MAX}</b><button data-para="${k}" ${P.ppts&&c<PARA_MAX?'':'disabled'} aria-label="${n} erhöhen">+</button></div>`}).join('')}</div>`).join('')}</div>`}
const _buildCharPa=buildChar;buildChar=function(){_buildCharPa();const el=$('pChar'),c=el.querySelector('.tvcols');(c?c:el).insertAdjacentHTML('beforeend',c?'<div>'+paraHTML()+'</div>':paraHTML());
  const h=el.querySelector('h2');if(h&&!el.querySelector('[data-open="pStat"]'))h.querySelector('button')?.insertAdjacentHTML('beforebegin','<button data-open="pStat" class="stbtn">Statistik (O)</button>')};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-para]');if(!b||!P||!(P.ppts>0))return;const k=b.dataset.para;P.para=P.para||{};if((P.para[k]||0)>=PARA_MAX)return;P.para[k]=(P.para[k]||0)+1;P.ppts--;sfx('pick');updatePanels()});
const _saveDataPa=saveData;saveData=function(){const d=_saveDataPa();if(d&&P){d.p.pl=P.pl||0;d.p.ppts=P.ppts||0;d.p.para=P.para||{};d.p.hoard=P.hoard||{}}return d};

