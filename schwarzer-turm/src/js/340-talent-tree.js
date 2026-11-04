/* ---------- talent tree: one point per level, more for beacons and bosses · view, tooltips, learning ---------- */
const TMOD={str:' Stärke',dex:' Geschick',vit:' Vitalität',ene:' Energie',ed:'% Waffenschaden',ias:'% Angriffstempo',crit:'% kritische Trefferchance',ls:'% Lebensraub',lok:' Leben pro Tötung',mok:' Mana pro Tötung',
  poison:' Giftschaden',fire:' Feuerschaden',cold:' Kälteschaden',light:' Blitzschaden',spell:'% Zauberschaden',mana:' Mana',mregen:' Manaregeneration',regen:' Lebensregeneration',life:' Leben',lifeP:'% maximales Leben',manaP:'% maximales Mana',
  tdef:'% Verteidigung',res:'% alle Widerstände',block:'% Blockchance',thorns:' Dornenschaden',dmgred:' Schadensreduktion',frw:'% Lauftempo',stam:' Ausdauer',glutf:'% mehr Glut',mf:'% magische Funde',xp:'% Erfahrung',
  cdr:'% schnellere Abklingzeiten',mcost:'% weniger Manakosten',potPow:'% stärkere Tränke',flask:' Flakon-Ladung',flaskH:'% Flakon-Heilung',potStack:' Tränke pro Stapel',invRows:' Inventarreihe',shopDisc:'% Rabatt bei Händlern',sellB:'% mehr Verkaufserlös'};
const tmodTxt=(k,v)=>k.startsWith('sk_')?`+${v} auf ${SKBY[k.slice(3)].n}`:(v>0?'+':'')+v+TMOD[k];
// the trees themselves are laid out by the talent path (920-talent-tree-path.js); each node knows its class and its price c
const TREE={},TEDGE=[];
const tHas=id=>id===clsStart()||(P.tree||[]).includes(id);
const tCost=id=>(TREE[id]&&TREE[id].c)||0,tSpent=()=>(P.tree||[]).reduce((a,id)=>a+tCost(id),0);
const tPts=()=>Math.max(0,P.lvl-1+(P.tbonus||0)-tSpent());
const tCan=id=>{const n=TREE[id];return!!n&&n.cls===P.cls&&!tHas(id)&&tPts()>=n.c&&n.adj.some(tHas)};
const tResetCost=()=>25*P.lvl;
let TV=null,TKEY='';
const tVH=()=>innerHeight-64,tSMin=.45,tSMax=()=>Math.max(1.2,(200-tTop())/tVH());
function toggleTree(){if(G.state==='tree')closeTree();else{ovClose();closeAll();G.state='tree';G.stepS=stopLoop(G.stepS);$('pTree').hidden=false;if(!TV||TV.cls!==P.cls)tCenter();TKEY='';buildTree()}}
function closeTree(){$('pTree').hidden=true;hideTip();G.state='play';buildBelt()}
// the view starts just above the highest talent you hold, wide enough to see both twigs
function tCenter(){let top=TREE[clsStart()];for(const id of P.tree||[]){const n=TREE[id];if(n&&n.cls===P.cls&&n.y<top.y)top=n}
  TV={cls:P.cls,x:0,y:top.y-tVH()*.2*clamp(1150/Math.min(innerWidth,tVH()*1.6),tSMin,tSMax()),s:clamp(1150/Math.min(innerWidth,tVH()*1.6),tSMin,tSMax())}}
function tSetVB(){const svg=$('tsvg');if(!svg||!TV)return;TV.s=clamp(TV.s,tSMin,tSMax());const vw=innerWidth,vh=tVH();
  // never scroll past the root or above the keystones; zoomed out fully the tree sits in the middle
  const hh=vh*TV.s/2,lo=tTop()-200+hh,hi=180-hh;TV.x=clamp(TV.x,-420,420);TV.y=lo<=hi?clamp(TV.y,lo,hi):(lo+hi)/2;
  svg.setAttribute('viewBox',[TV.x-vw*TV.s/2,TV.y-vh*TV.s/2,vw*TV.s,vh*TV.s].join(' '));svg.classList.toggle('far',TV.s>2.2);svg.classList.toggle('mid',TV.s>1.4)}
const NR={root:15,small:10,not:15,mile:22,key:24};
const hexPts=(x,y,r)=>[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3;return(x+Math.cos(a)*r).toFixed(1)+','+(y+Math.sin(a)*r).toFixed(1)}).join(' ');
// only your own class is drawn: about eighty nodes, no gradients, rebuilt only when something was learnt
function buildTree(){if(!TV||$('pTree').hidden)return;
  const key=P.cls+'|'+(P.tree||[]).join(',')+'|'+tPts()+'|'+P.glut;if(key===TKEY&&$('tsvg')){tSetVB();return}TKEY=key;
  const C=P.cls,cc=TREE[clsStart()].col;let s='<svg id="tsvg" xmlns="http://www.w3.org/2000/svg">';
  // the tiers as bands, each saying what a talent costs there
  for(let t=0;t<=4;t++){const y1=t<4?tY(t,0)+TG.D*.55:tY(3,TG.steps)-TG.D*.55,y0=t<4?tY(t,TG.steps)-TG.D*.55:tTop()-TG.D*.8,c=t<4?TCOST[t]:TKEYC;
    s+=`<rect x="-560" y="${y0}" width="1120" height="${y1-y0}" class="tband${t%2?' odd':''}"/><text x="-540" y="${y1-38}" class="tbandl">${t<4?(t+1)+'. '+TRING[t]:'Schlusssteine'}</text><text x="-540" y="${y1-14}" class="tbandc">${c} ${c>1?'Punkte':'Punkt'} je Talent</text>`}
  for(const[a,b,c]of TEDGE){if(c!==C)continue;const A=TREE[a],B=TREE[b],on=tHas(a)&&tHas(b),av=(tHas(a)&&tCan(b))||(tHas(b)&&tCan(a));s+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="te${on?' on':av?' av':''}"/>`}
  let lab='';
  for(const id in TREE){const n=TREE[id];if(n.cls!==C)continue;const r=NR[n.k]||10,has=tHas(id),can=tCan(id),x=n.x,y=n.y,col=n.k==='mile'||n.k==='key'?cc:n.col,fill=has?col:'#1a140e';
    if(has&&n.k!=='small')s+=`<circle cx="${x}" cy="${y}" r="${r*1.9}" fill="${col}" opacity=".22"/>`;
    s+=`<g data-tn="${id}" class="tn${has?' on':can?' av':''}"><circle cx="${x}" cy="${y}" r="${r+3}" class="tr"/>`+
      (n.k==='key'?`<rect x="${x-r*.62}" y="${y-r*.62}" width="${r*1.24}" height="${r*1.24}" transform="rotate(45 ${x} ${y})" fill="${fill}" stroke="${col}" stroke-width="3"/>`:
       n.k==='mile'?`<polygon points="${hexPts(x,y,r)}" fill="${has?'#e3b04b':'#1a140e'}" stroke="${has?'#fff2c0':'#e3b04b'}" stroke-width="3.5"/><polygon points="${hexPts(x,y,r*.55)}" fill="${has?'#fff2c0':col}" opacity="${has?1:.7}"/>`:
       `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${has||can?col:'#4a3a24'}" stroke-width="${n.k==='small'?2.5:4}"/>`)+'</g>';
    if(n.n)lab+=`<text x="${x}" y="${y+r+(n.k==='not'?19:26)}" text-anchor="middle" class="tnl ${n.k}${has?' on':''}">${n.n}</text>`}
  s+=lab+'</svg>';const p=tPts(),ml=tMiles();
  $('pTree').innerHTML=`<div class="thead"><h2>Talentbaum · ${CLS[C].n}</h2><span class="tpts">${p?`<b>${p}</b> Talentpunkte frei`:'Keine freien Talentpunkte'} · ${tSpent()} vergeben · <span class="tmls">Meilensteine <b>${ml}</b>/4</span></span><span class="thint">Der Pfad führt nach oben · je höher, desto teurer · goldene Sechsecke öffnen die nächste Stufe</span><button data-tzoom="1">+</button><button data-tzoom="-1">−</button><button data-tzoom="0">Mitte</button><button data-treset>Zurücksetzen · ${tResetCost()} Glut</button><button data-tclose>Schließen (P)</button></div>${s}`;
  tSetVB()}
function treeTip(id){const n=TREE[id],cn=TREE[clsStart()].n,tier=n.t>=0&&n.t<4?TRING[n.t]:'';
  let h=`<div class="nm" style="color:${n.k==='key'?'#ffb347':n.k==='mile'?'#ffe08a':n.k==='not'?'var(--gold)':n.col}">${n.n||n.th||cn}</div>`;
  if(n.k==='key')h+=`<div class="base">Schlussstein · ${cn}</div>`;else if(n.k==='mile')h+=`<div class="base">Meilenstein · ${tier} · Tor zur Stufe ${n.ring<3?'„'+TRING[n.ring+1]+'“':'der Schlusssteine'}</div>`;
  else if(n.k==='not')h+=`<div class="base">Großes Talent · ${n.th} · ${tier}</div>`;else if(n.k==='root')h+=`<div class="base">Wurzel · hier beginnt dein Weg</div>`;
  else h+=`<div class="base">${n.th||cn} · ${tier}</div>`;
  for(const k in n.m)h+=`<div style="color:${n.m[k]<0?'#ff7a5a':'#9ab8ff'}">${tmodTxt(k,n.m[k])}</div>`;
  if(n.m.potStack)h+='<div class="base">Gleiche Tränke stapeln sich im Inventar.</div>';if(n.m.invRows)h+='<div class="base">Das Inventar wächst um eine Reihe.</div>';
  const has=tHas(id),c=n.c||0;
  h+=`<div class="act">${has?(n.k==='root'?'Hier beginnt jeder Weg':'Erlernt'):tCan(id)?`Klick: erlernen · ${c} ${c>1?'Punkte':'Punkt'}`:!n.adj.some(tHas)?`Nur neben erlernten Talenten · kostet ${c}`:`Kostet ${c} Talentpunkte, frei: ${tPts()}`}</div>`;return h}
function stackPots(){if(!P.d||P.d.potStack<2)return;for(const it of P.inv.slice()){if(it.slot!=='potion'||!P.inv.includes(it))continue;for(const o of P.inv){if(o===it||o.slot!=='potion'||o.kind!==it.kind||!P.inv.includes(o))continue;if((o.n||1)+(it.n||1)<=P.d.potStack&&P.inv.indexOf(o)<P.inv.indexOf(it)){o.n=(o.n||1)+(it.n||1);o.amt=Math.max(o.amt,it.amt);invDel(it);break}}}}
function treeLearn(id){if(!tCan(id))return;P.tree=P.tree||[];P.tree.push(id);const n=TREE[id];const hp=P.hp/P.d.life;recalc();if(n.m.flask)P.flasks+=n.m.flask;if(n.m.lifeP)P.hp=Math.round(hp*P.d.life);if(n.m.potStack)stackPots();
  const big=n.k==='not'||n.k==='key'||n.k==='mile';sfx(big?'lvl':'pick');if(big)banner(n.n.toUpperCase(),n.k==='key'?'Schlussstein erlernt':n.k==='mile'?`Meilenstein ${tMiles()}/4 · ${n.ring<3?'„'+TRING[n.ring+1]+'“ öffnet sich, '+TCOST[n.ring+1]+' Punkte je Talent':'die Schlusssteine öffnen sich'}`:'Großes Talent erlernt',n.k==='mile'?'boss':'',n.k==='mile'?2400:1600);buildTree();save()}
// clearing the tree: split stacked potions, move anything out of rows that vanish, give back no more flasks than fit
function treeClear(){P.tree=[];recalc();for(const it of P.inv.slice())if(it.slot==='potion'&&(it.n||1)>1){const extra=it.n-1;it.n=1;for(let k=0;k<extra;k++){const q=Object.assign({},it,{id:UID++,n:1});if(!invAdd(q))dropItem(q,P.x,P.y)}}
  const rows=5+(P.d.invRows||0);for(const it of P.inv.slice())if(it.gy+isz(it)[1]>rows){invDel(it);if(!invAdd(it))dropItem(it,P.x,P.y)}
  recalc();P.flasks=Math.min(P.flasks,fMax())}
function treeReset(){const c=tResetCost();if(!(P.tree||[]).length)return;if(P.glut<c){log('Nicht genug Glut zum Zurücksetzen.','#ff5a4a');return}
  P.glut-=c;treeClear();sfx('boom');log('Der Talentbaum ist zurückgesetzt.','#e8c878');TKEY='';buildTree();save()}
// one finger (or the mouse) drags, two fingers pinch, the wheel zooms towards the pointer
(function(){const pts=new Map();let drag=null,pinch=null;
  const toW=(cx,cy)=>{const svg=$('tsvg'),r=svg.getBoundingClientRect();return[TV.x+(cx-r.left-r.width/2)*TV.s,TV.y+(cy-r.top-r.height/2)*TV.s]};
  const zoomAt=(f,cx,cy)=>{const[wx,wy]=cx==null?[TV.x,TV.y]:toW(cx,cy),s0=TV.s;TV.s=clamp(TV.s*f,tSMin,tSMax());const k=TV.s/s0;TV.x=wx-(wx-TV.x)*k;TV.y=wy-(wy-TV.y)*k;tSetVB()};
  addEventListener('pointerdown',e=>{if(G.state!=='tree'||!e.target.closest('#tsvg'))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:hyp(a.x-b.x,a.y-b.y),s:TV.s};drag=null}else if(pts.size===1)drag={x:e.clientX,y:e.clientY,ox:TV.x,oy:TV.y,moved:false,tn:e.target.closest('[data-tn]')}});
  addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pts.size>=2){const[a,b]=[...pts.values()],d=hyp(a.x-b.x,a.y-b.y);if(d>10){const s1=clamp(pinch.s*pinch.d/d,tSMin,tSMax());zoomAt(s1/TV.s,(a.x+b.x)/2,(a.y+b.y)/2)}return}
    if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){TV.x=drag.ox-dx*TV.s;TV.y=drag.oy-dy*TV.s;tSetVB()}});
  const up=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(pinch){if(pts.size<2)pinch=null;drag=null;return}if(!drag)return;const d=drag;drag=null;if(!d.moved&&d.tn&&e.type==='pointerup')treeLearn(d.tn.dataset.tn)};
  addEventListener('pointerup',up);addEventListener('pointercancel',up);
  addEventListener('wheel',e=>{if(G.state!=='tree')return;e.preventDefault();zoomAt(e.deltaY>0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
  addEventListener('resize',()=>{if(G.state==='tree')tSetVB()});
  document.addEventListener('click',e=>{const z=e.target.closest('[data-tzoom]');if(z){const v=+z.dataset.tzoom;if(v)zoomAt(v>0?1/1.4:1.4);else{tCenter();tSetVB()}return}
    if(e.target.closest('[data-tclose]'))closeTree();else if(e.target.closest('[data-treset]'))treeReset()})})();
