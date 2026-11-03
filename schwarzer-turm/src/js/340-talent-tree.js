/* ---------- talent tree: one point per level, more for beacons and bosses · view, tooltips, learning ---------- */
const TMOD={str:' Stärke',dex:' Geschick',vit:' Vitalität',ene:' Energie',ed:'% Waffenschaden',ias:'% Angriffstempo',crit:'% kritische Trefferchance',ls:'% Lebensraub',lok:' Leben pro Tötung',mok:' Mana pro Tötung',
  poison:' Giftschaden',fire:' Feuerschaden',cold:' Kälteschaden',light:' Blitzschaden',spell:'% Zauberschaden',mana:' Mana',mregen:' Manaregeneration',regen:' Lebensregeneration',life:' Leben',lifeP:'% maximales Leben',manaP:'% maximales Mana',
  tdef:'% Verteidigung',res:'% alle Widerstände',block:'% Blockchance',thorns:' Dornenschaden',dmgred:' Schadensreduktion',frw:'% Lauftempo',stam:' Ausdauer',glutf:'% mehr Glut',mf:'% magische Funde',xp:'% Erfahrung',
  cdr:'% schnellere Abklingzeiten',mcost:'% weniger Manakosten',potPow:'% stärkere Tränke',flask:' Flakon-Ladung',flaskH:'% Flakon-Heilung',potStack:' Tränke pro Stapel',invRows:' Inventarreihe',shopDisc:'% Rabatt bei Händlern',sellB:'% mehr Verkaufserlös'};
const tmodTxt=(k,v)=>k.startsWith('sk_')?`+${v} auf ${SKBY[k.slice(3)].n}`:(v>0?'+':'')+v+TMOD[k];
// the branches themselves are laid out by the great tree (920-talent-tree-eight.js)
const TB=[],TREE={},TEDGE=[];
const tHas=id=>id==='o'||id===clsStart()||(P.tree||[]).includes(id);
const tPts=()=>Math.max(0,P.lvl-1+(P.tbonus||0)-(P.tree||[]).length);
const tCan=id=>!tHas(id)&&tPts()>0&&TREE[id].adj.some(tHas);
const tResetCost=()=>25*P.lvl;
let TV=null,TKEY='';
const tVH=()=>innerHeight-64,tSMax=()=>7400/Math.min(innerWidth,tVH()),tSMin=.25;
function toggleTree(){if(G.state==='tree')closeTree();else{ovClose();closeAll();G.state='tree';G.stepS=stopLoop(G.stepS);$('pTree').hidden=false;if(!TV)tCenter();TKEY='';buildTree()}}
function closeTree(){$('pTree').hidden=true;hideTip();G.state='play';buildBelt()}
// the view starts on your own class's root, close enough to read the first ring
function tCenter(){const r=TREE[clsStart()]||TREE.o;TV={x:r.x*.6,y:r.y*.6,s:clamp(1300/Math.min(innerWidth,tVH()),tSMin,tSMax())}}
function tSetVB(){const svg=$('tsvg');if(!svg||!TV)return;TV.s=clamp(TV.s,tSMin,tSMax());const vw=innerWidth,vh=tVH();svg.setAttribute('viewBox',[TV.x-vw*TV.s/2,TV.y-vh*TV.s/2,vw*TV.s,vh*TV.s].join(' '));
  svg.classList.toggle('far',TV.s>3.2);svg.classList.toggle('mid',TV.s>1.6)}
const NR={origin:16,root:13,small:9,not:15,mile:22,key:24};
const hexPts=(x,y,r)=>[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3;return(x+Math.cos(a)*r).toFixed(1)+','+(y+Math.sin(a)*r).toFixed(1)}).join(' ');
function buildTree(){if(!TV||$('pTree').hidden)return;
  // zooming and panning only move the view; the whole tree is drawn again only when something was learnt
  const key=(P.tree||[]).join(',')+'|'+tPts()+'|'+P.glut;if(key===TKEY&&$('tsvg')){tSetVB();return}TKEY=key;
  let s=`<svg id="tsvg" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tglow"><stop offset="0" stop-color="#ffd88a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd88a" stop-opacity="0"/></radialGradient></defs>`;
  TRING.forEach((n,t)=>{const r=tRing(t)+TG.steps*TG.D+20,a=-Math.PI/2+Math.PI/TB.length;s+=`<circle cx="0" cy="0" r="${r}" class="tring"/><text x="${Math.cos(a)*(r+34)}" y="${Math.sin(a)*(r+34)}" text-anchor="middle" class="tringl">${t+1}. Ring · ${n}</text>`});
  TB.forEach((b,bi)=>{const th=-Math.PI/2+bi*2*Math.PI/TB.length,r=tRing(3)+TG.steps*TG.D+380;s+=`<text x="${Math.cos(th)*r}" y="${Math.sin(th)*r+14}" text-anchor="${Math.cos(th)>.4?'start':Math.cos(th)<-.4?'end':'middle'}" class="tlab" fill="${b.col}">${b.n}</text>`});
  for(const[a,b]of TEDGE){const A=TREE[a],B=TREE[b],on=tHas(a)&&tHas(b),av=(tHas(a)&&tCan(b))||(tHas(b)&&tCan(a));s+=`<line x1="${A.x|0}" y1="${A.y|0}" x2="${B.x|0}" y2="${B.y|0}" class="te${on?' on':av?' av':''}"/>`}
  let lab='';
  for(const id in TREE){const n=TREE[id];if(id==='__para')continue;const r=NR[n.k]||9,has=tHas(id),can=tCan(id),col=n.b>=0?TB[n.b].col:'#c8b898',x=n.x|0,y=n.y|0,fill=has?col:'#1a140e';
    if(has&&n.k!=='small')s+=`<circle cx="${x}" cy="${y}" r="${r*2.4}" fill="url(#tglow)"/>`;
    s+=`<g data-tn="${id}" class="tn${has?' on':can?' av':''}"><circle cx="${x}" cy="${y}" r="${r+3}" class="tr"/>`+
      (n.k==='key'?`<rect x="${x-r*.62}" y="${y-r*.62}" width="${r*1.24}" height="${r*1.24}" transform="rotate(45 ${x} ${y})" fill="${fill}" stroke="${col}" stroke-width="3"/>`:
       n.k==='mile'?`<polygon points="${hexPts(x,y,r)}" fill="${has?'#e3b04b':'#1a140e'}" stroke="${has?'#fff2c0':'#e3b04b'}" stroke-width="3.5"/><polygon points="${hexPts(x,y,r*.55)}" fill="${has?'#fff2c0':col}" opacity="${has?1:.7}"/>`:
       `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${has||can?col:'#4a3a24'}" stroke-width="${n.k==='small'?2.5:4}"/>`)+'</g>';
    if(n.n&&n.k!=='origin')lab+=`<text x="${x}" y="${y+r+(n.k==='not'?17:24)}" text-anchor="middle" class="tnl ${n.k}${has?' on':''}">${n.n}</text>`}
  s+=lab+'</svg>';const p=tPts(),ml=tMiles();
  $('pTree').innerHTML=`<div class="thead"><h2>Talentbaum</h2><span class="tpts">${p?`<b>${p}</b> Talentpunkte frei`:'Keine freien Talentpunkte'} · ${(P.tree||[]).length} vergeben · <span class="tmls">Meilensteine <b>${ml}</b>/${TB.length*4}</span></span><span class="thint">Ziehen verschiebt · Mausrad oder zwei Finger zoomen · goldene Sechsecke sind Meilensteine: wer sie nimmt, betritt den nächsten Ring</span><button data-tzoom="1">+</button><button data-tzoom="-1">−</button><button data-tzoom="0">Mitte</button><button data-treset>Zurücksetzen · ${tResetCost()} Glut</button><button data-tclose>Schließen (P)</button></div>${s}`;
  tSetVB()}
function treeTip(id){const n=TREE[id],b=n.b>=0?TB[n.b]:null,name=n.n||(b?b.n:'Brücke');let h=`<div class="nm" style="color:${n.k==='key'?'#ffb347':n.k==='mile'?'#ffe08a':n.k==='not'?'var(--gold)':b?b.col:'#e8dcc0'}">${name}</div>`;
  if(n.k==='key')h+=`<div class="base">Schlussstein · ${b.n}</div>`;else if(n.k==='mile')h+=`<div class="base">Meilenstein · ${b.n} · Tor zum ${n.ring<3?(n.ring+2)+'. Ring ('+TRING[n.ring+1]+')':'Schlussstein'}</div>`;
  else if(n.k==='not')h+=`<div class="base">Großer Knoten · ${b.n} · ${n.th}</div>`;else if(n.k==='root')h+=`<div class="base">Wurzel des Zweigs ${b.n}${b.cls&&P.cls===b.cls?' · deine Klasse beginnt hier':''}</div>`;
  else if(b&&n.ring==null){const t=+((id.match(/t(\d)l/)||[])[1]);if(!isNaN(t))h+=`<div class="base">${b.n} · ${TRING[t]}</div>`}
  for(const k in n.m)h+=`<div style="color:${n.m[k]<0?'#ff7a5a':'#9ab8ff'}">${tmodTxt(k,n.m[k])}</div>`;
  if(n.m.potStack)h+='<div class="base">Gleiche Tränke stapeln sich im Inventar.</div>';if(n.m.invRows)h+='<div class="base">Das Inventar wächst um eine Reihe.</div>';
  h+=`<div class="act">${tHas(id)?(id==='o'?'Hier beginnt jeder Weg':'Erlernt'):tCan(id)?'Klick: erlernen':tPts()?'Nur neben erlernten Knoten':'Kein Talentpunkt frei'}</div>`;return h}
function stackPots(){if(!P.d||P.d.potStack<2)return;for(const it of P.inv.slice()){if(it.slot!=='potion'||!P.inv.includes(it))continue;for(const o of P.inv){if(o===it||o.slot!=='potion'||o.kind!==it.kind||!P.inv.includes(o))continue;if((o.n||1)+(it.n||1)<=P.d.potStack&&P.inv.indexOf(o)<P.inv.indexOf(it)){o.n=(o.n||1)+(it.n||1);o.amt=Math.max(o.amt,it.amt);invDel(it);break}}}}
function treeLearn(id){if(!tCan(id))return;P.tree=P.tree||[];P.tree.push(id);const n=TREE[id];const hp=P.hp/P.d.life;recalc();if(n.m.flask)P.flasks+=n.m.flask;if(n.m.lifeP)P.hp=Math.round(hp*P.d.life);if(n.m.potStack)stackPots();
  const big=n.k==='not'||n.k==='key'||n.k==='mile';sfx(big?'lvl':'pick');if(big)banner(n.n.toUpperCase(),n.k==='key'?'Schlussstein erlernt':n.k==='mile'?`Meilenstein ${tMiles()}/${TB.length*4} · ${n.ring<3?'der '+(n.ring+2)+'. Ring öffnet sich':'die Schlusssteine öffnen sich'}`:'Großer Knoten erlernt',n.k==='mile'?'boss':'',n.k==='mile'?2400:1600);buildTree();save()}
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
