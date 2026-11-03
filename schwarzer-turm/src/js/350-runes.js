/* ---------- runes: carved stones with one word each, sockets in gear, runewords from the right order ---------- */
// w: in a weapon · a: in helm, armour or shield · g: glyph strokes on the 16er grid
const RUNES=[
 {k:'asch',n:'Asch',l:1,gem:'ember',w:{fire:6},a:{life:12},g:'6,4,6,12;6,6,10,4;6,8,10,6'},
 {k:'dorn',n:'Dorn',l:2,gem:'emerald',w:{poison:7},a:{thorns:6},g:'6,4,6,12;6,6,9,8;9,8,6,10'},
 {k:'frost',n:'Frost',l:3,gem:'frost',w:{cold:6},a:{res:4},g:'8,4,8,12;5,6,11,10;11,6,5,10'},
 {k:'funk',n:'Funk',l:5,gem:'topaz',w:{light:9},a:{mana:15},g:'9,4,6,7;6,7,10,9;10,9,7,12'},
 {k:'blut',n:'Blut',l:7,gem:'ruby',w:{ls:3},a:{regen:2},g:'6,4,6,12;6,4,9,6;9,6,6,8;6,8,9,10;9,10,6,12'},
 {k:'fels',n:'Fels',l:9,gem:'sapphire',w:{ed:15},a:{edef:20},g:'8,4,11,7;11,7,8,10;8,10,5,7;5,7,8,4;8,10,5,12;8,10,11,12'},
 {k:'wind',n:'Wind',l:11,gem:'soul',w:{ias:10},a:{frw:6},g:'6,4,6,12;6,4,9,6;9,6,6,8;6,8,10,12'},
 {k:'eule',n:'Eule',l:13,gem:'amethyst',w:{spell:12},a:{ene:6},g:'6,4,6,12;6,5,10,7;6,8,10,10'},
 {k:'baer',n:'Bär',l:16,gem:'life',w:{str:8},a:{vit:8},g:'5,12,5,4;5,4,10,7;10,7,10,12'},
 {k:'luchs',n:'Luchs',l:19,gem:'emerald',w:{crit:5},a:{dex:8},g:'10,4,6,8;6,8,10,12'},
 {k:'gold',n:'Gold',l:22,gem:'topaz',w:{glutf:25},a:{mf:15},g:'5,4,11,12;11,4,5,12'},
 {k:'mond',n:'Mond',l:26,gem:'mana',w:{mregen:3},a:{dmgred:4},g:'7,4,7,12;7,4,10,7'},
 {k:'kern',n:'Kern',l:31,gem:'ruby',w:{ed:35},a:{life:40},g:'8,5,11,8;11,8,8,11;8,11,5,8;5,8,8,5'},
 {k:'krone',n:'Krone',l:37,gem:'soul',w:{allsk:1},a:{allsk:1},g:'8,4,8,12;8,8,5,5;8,8,11,5'}];
const RBY={};RUNES.forEach((r,i)=>{r.i=i;RBY[r.k]=r});
// only plain (white) gear turns runes into a word: exact socket count, exact order
const RW=[
 {n:'Erster Funke',s:['weapon'],r:['asch','dorn'],m:{fire:10,poison:10,ed:20}},
 {n:'Steinhaut',s:['helm','armor','offhand'],r:['asch','fels'],m:{edef:30,life:25}},
 {n:'Zornsturm',s:['weapon'],r:['funk','wind'],m:{light:25,ias:20}},
 {n:'Dornenwall',s:['offhand','armor'],r:['dorn','fels'],m:{thorns:25,edef:50,block:6}},
 {n:'Stille',s:['helm'],r:['eule','mond'],m:{spell:25,mana:40,mregen:3}},
 {n:'Goldene Ernte',s:['helm','armor'],r:['gold','eule'],m:{mf:40,glutf:40,xp:10}},
 {n:'Glutherz',s:['weapon'],r:['asch','funk','asch'],m:{fire:30,ed:40}},
 {n:'Frostbiss',s:['weapon'],r:['frost','frost','wind'],m:{cold:35,crit:6}},
 {n:'Seelenfeuer',s:['weapon'],r:['eule','asch','eule'],m:{spell:40,fire:20,mana:30}},
 {n:'Rabenschwinge',s:['armor'],r:['wind','luchs','dorn'],m:{frw:12,dex:15,res:12}},
 {n:'Grabesruh',s:['offhand'],r:['frost','mond','dorn'],m:{res:25,block:10,thorns:20}},
 {n:'Blutschwur',s:['weapon'],r:['blut','baer','kern'],m:{ls:6,ed:90,life:40}},
 {n:'Aschenkrone',s:['helm'],r:['krone','asch','mond'],m:{allsk:1,life:60,res:15}},
 {n:'Wächterherz',s:['armor'],r:['fels','blut','mond','kern'],m:{dmgred:10,life:100,regen:6,edef:80}},
 {n:'Turmbrecher',s:['weapon'],r:['kern','fels','baer','krone'],m:{ed:150,str:20,allsk:1,crit:10}}];
RW.forEach(w=>w.l=Math.max(...w.r.map(k=>RBY[k].l)));
const SOCK={weapon:4,armor:4,helm:3,offhand:3};
const sgrp=it=>it.slot==='weapon'?'w':'a';
const maxSoc=it=>{const[w,h]=isz(it);return Math.min(SOCK[it.slot]||0,w*h)};
const canSock=it=>!!(it&&it.soc&&(it.runes||[]).length<it.soc);
const runeTxt=(m)=>Object.keys(m).map(k=>MODTXT[k](m[k])).join(', ');
const SLOTPL={weapon:'Waffen',armor:'Rüstungen',helm:'Helme',offhand:'Schilde'};

// carved pebble, lit from the upper left, the glyph glowing in the rune's own colour
function wRune(gl){const b=pfill((x,y)=>{const dx=(x-7.5)/5.4,dy=(y-8.6)/6.3,d=dx*dx+dy*dy;if(d>1)return -1;const l=-(dx*.8+dy)*.9+(1-d)*.4;return l>.55?3:l>.05?2:l>-.45?1:0});
  for(const s of gl.split(';')){const[x1,y1,x2,y2]=s.split(',').map(Number),n=Math.ceil(Math.hypot(x2-x1,y2-y1)*3);
    for(let k=0;k<=n;k++){const x=x1+(x2-x1)*k/n,y=y1+(y2-y1)*k/n;if(pget(b,x+1,y+1)>=0&&pget(b,x+1,y+1)<16)pset(b,x+1,y+1,0);pset(b,x,y,18)}}
  for(let i=0;i<256;i++)if(b[i]===18){const x=i%16,y=i>>4;if(pget(b,x-1,y-1)!==18&&pget(b,x,y-1)!==18)b[i]=19}
  return b}
RUNES.forEach(r=>PXS['Rune:'+r.k]=[()=>wRune(r.g),'stone','stone','stone',r.gem]);

function makeRune(k){const r=RBY[k];return{id:UID++,slot:'rune',cls:'rune',b:'Rune',rune:k,rar:'rune',name:r.n+'-Rune',ilvl:r.l,mods:{},req:{lvl:r.l,str:0,dex:0}}}
// low runes are common, every step up is rarer; bosses roll as if deeper
function pickRune(lv,boss){const ok=RUNES.filter(r=>r.l<=lv+(boss?5:0));const ws=ok.map(r=>Math.pow(.6,r.i*(boss?.7:1)));let x=Math.random()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<ok.length;i++){x-=ws[i];if(x<=0)return ok[i].k}return ok[0].k}
function runeDrop(e){if(!runeOK())return;const ch=e.wb?1:e.rank==='boss'?1:e.rank==='unique'?.12:e.rank==='champ'?.035:.006;let n=Math.floor(ch)+(Math.random()<ch%1?1:0);
  if(G.night)n+=Math.random()<.04?1:0;for(let k=0;k<n;k++)dropItem(makeRune(pickRune(G.mlvl,e.boss||e.wb)),e.x,e.y)}
function rollSockets(it){if(!SOCK[it.slot]||it.rar==='unique'||it.slot==='rune')return it;const ch={normal:.28,magic:.14,rare:.07}[it.rar]||0;if(Math.random()>=ch)return it;
  const mx=maxSoc(it);it.soc=it.rar==='normal'?rint(1,mx):it.rar==='magic'?rint(1,Math.min(2,mx)):1;it.runes=[];return it}
const _mkItem=makeItem;makeItem=function(ilvl,o){return rollSockets(_mkItem(ilvl,o))};

function insertRune(rn,it){if(!canSock(it))return false;const r=RBY[rn.rune];it.runes=it.runes||[];it.runes.push(r.k);
  const m=r[sgrp(it)];for(const k in m)it.mods[k]=(it.mods[k]||0)+m[k];it.req.lvl=Math.max(it.req.lvl,r.l);qInc('socket');
  sample('chest',.35)||sfx('pick');log(`${r.n} sitzt in ${it.name}: ${runeTxt(m)}.`,'#f0b25a');
  if(it.runes.length===it.soc&&it.rar==='normal'){const w=RW.find(w=>w.s.includes(it.slot)&&w.r.length===it.soc&&w.r.every((k,i)=>k===it.runes[i]));
    if(w){for(const k in w.m)it.mods[k]=(it.mods[k]||0)+w.m[k];it.rw=w.n;it.rar='runeword';it.name=w.n;it.req.lvl=Math.max(it.req.lvl,w.l);qInc('runeword');P.found['rw:'+w.n]=1;
      banner('RUNENWORT',w.n,'',3400);sfx('unique');burst(P.x,P.y,'#e8d8a0',40,3);log(`Die Runen erwachen: ${w.n}!`,'var(--r-runeword)')}}
  else if(it.runes.length===it.soc&&it.rar!=='normal'&&RW.some(w=>w.s.includes(it.slot)&&w.r.length===it.soc&&w.r.every((k,i)=>k===it.runes[i])))log('Die Runen flackern, doch nur in gewöhnlichen Gegenständen werden sie zum Wort.','#a39b88');
  return true}
function sockTry(it){if(!G.hand||G.hand.slot!=='rune'||!it||it===G.hand)return false;if(it.slot==='rune'||it.slot==='potion'){log('Eine Rune passt nur in einen Sockel.','#a39b88');return true}
  if(canSock(it)){insertRune(G.hand,it);G.hand=null;hideTip();updatePanels()}else log(it.soc?'Alle Sockel sind belegt.':'Dieser Gegenstand hat keine Sockel. Odalinde kann welche schlagen.','#a39b88');return true}
const _gridClick=gridClick;gridClick=function(e){if(G.hand&&G.hand.slot==='rune'){const[fx,fy]=gridCell(e);if(sockTry(invAt(Math.floor(fx),Math.floor(fy),1,1)[0]))return}return _gridClick(e)};
const _sgridClick=sgridClick;sgridClick=function(e){if(G.hand&&G.hand.slot==='rune'){const[fx,fy]=stCell(e);if(sockTry(stAt(Math.floor(fx),Math.floor(fy),1,1)[0]))return}return _sgridClick(e)};
const _eqClick=eqClick;eqClick=function(k){if(G.hand&&G.hand.slot==='rune'&&P.eq[k]){sockTry(P.eq[k]);return}if(G.hand&&G.hand.slot==='rune'){log('Leg die Rune auf einen Gegenstand mit freiem Sockel.','#a39b88');return}return _eqClick(k)};
const _invClick=invClick;invClick=function(it,shift){if(it&&it.slot==='rune'&&!shift&&$('pShop').hidden){invDel(it);G.hand=it;log('Klicke auf einen Gegenstand mit freiem Sockel.','#a39b88');hideTip();updatePanels();return}return _invClick(it,shift)};
const _killEnemy=killEnemy;killEnemy=function(e,a){_killEnemy(e,a);if(!e.arena)runeDrop(e)};
const _dropItem=dropItem;dropItem=function(it,x,y){_dropItem(it,x,y);if(it.slot==='rune'&&G.state!=='menu'){log('Rune: '+it.name,'var(--r-rune)');if(RBY[it.rune].i>=6)sfx('unique')}};
const _discover=discover;discover=function(it){if(it&&it.slot==='rune'){if(P.found&&!P.found['r:'+it.rune]){P.found['r:'+it.rune]=1;log('Neue Rune für die Sammlung: '+it.name,'var(--r-rune)')}return}return _discover(it)};

function sockHTML(it){if(!it.soc)return'';const rs=it.runes||[];let h=`<div class="socks">`;for(let i=0;i<it.soc;i++){const r=rs[i]&&RBY[rs[i]];h+=r?`<span class="sk on" title="${r.n}"><img class="px" src="${pxURL('Rune:'+r.k)}" alt="">${r.n}</span>`:`<span class="sk"></span>`}
  h+=`</div><div class="base">Gesockelt (${it.soc})${rs.length<it.soc?` · ${it.soc-rs.length} frei`:''}</div>`;
  if(it.rw)h+=`<div class="c-rune">„${it.runes.map(k=>RBY[k].n).join('')}“</div>`;
  else if(it.rar==='normal'&&rs.length<it.soc)h+=`<div class="base">Gewöhnlich: die richtigen Runen in der richtigen Reihenfolge ergeben ein Runenwort.</div>`;
  if(G.hand&&G.hand.slot==='rune'&&canSock(it))h+=`<div class="act">Klick: ${G.hand.name} einsetzen</div>`;return h}
function runeTip(it){const r=RBY[it.rune];return`<div><img class="px" src="${pxURL('Rune:'+r.k)}" width="48" height="48" alt=""></div><div class="nm c-rune">${it.name}</div><div class="base">Rune · ${r.i+1}. von ${RUNES.length}</div>
  <div class="req ${P.lvl>=r.l?'':'bad'}">Benötigt Stufe ${r.l}</div><div class="base" style="margin-top:4px">In Waffen</div><div class="mod">${runeTxt(r.w)}</div><div class="base">In Helmen, Rüstungen, Schilden</div><div class="mod">${runeTxt(r.a)}</div>
  <div class="base" style="margin-top:4px">Wert: ${itemValue(it)} Glut</div>`}
const _itemTipHTML=itemTipHTML;itemTipHTML=function(it,ctxTxt){if(it.slot==='rune')return runeTip(it)+`<div class="act">${ctxTxt&&ctxTxt!=='equipped'?ctxTxt.replace('anlegen','in die Hand nehmen'):'Klick: aufnehmen, dann auf einen Sockel legen'}</div>`;
  let h=_itemTipHTML(it,ctxTxt);if(it.soc){const mk='<div class="base" style="margin-top:4px">Wert:',i=h.indexOf(mk);h=i>=0?h.slice(0,i)+sockHTML(it)+h.slice(i):h+sockHTML(it)}return h};

// sockets drawn into the icon: dark holes, set runes sitting in them
function drawSocks(g,it,W2,H2){const n=it.soc,rs=it.runes||[],cols=W2>=2*ICW&&n===4?2:1,rows=Math.ceil(n/cols),r=Math.max(4,Math.min(ICW*.34,H2/rows*.36));
  for(let i=0;i<n;i++){const c=cols===2?i%2:0,ro=cols===2?i>>1:i,x=cols===2?W2*(c*.5+.25):W2/2,y=H2*(ro+.5)/rows;
    g.fillStyle='#050403';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle='#7a6c5a';g.lineWidth=1;g.beginPath();g.arc(x,y,r-.5,2.4,5.6);g.stroke();g.strokeStyle='#1a1612';g.beginPath();g.arc(x,y,r-.5,5.6,8.7);g.stroke();
    if(rs[i]){const s=Math.round(r*2-2),src=pxCanvas('Rune:'+rs[i],'',false,Math.max(8,s));g.drawImage(src,Math.round(x-src.width/2),Math.round(y-src.height/2))}}}

// Odalinde: a rune pouch and a hammer for sockets
const sockCost=it=>Math.round((120+it.ilvl*22)*(1-((P.d&&P.d.shopDisc)||0)/100));
const runeBagCost=()=>Math.round((60+Math.max(1,G.mlvl)*14)*(1-((P.d&&P.d.shopDisc)||0)/100));
function sockList(){const out=[];P.inv.forEach((it,i)=>{if(SOCK[it.slot]&&it.rar==='normal'&&!it.soc)out.push(['i'+i,it])});for(const k in P.eq){const it=P.eq[k];if(it&&SOCK[it.slot]&&it.rar==='normal'&&!it.soc)out.push(['e'+k,it])}return out}
function shopRuneHTML(){const sl=sockList(),bc=runeBagCost();
  return`<h3>Runen und Sockel</h3><div class="shoprow"><span class="c-rune">Runenbeutel (eine Rune deiner Tiefe)</span><span class="c">${bc}</span><button data-runebag data-cost="${bc}">Kaufen</button></div>
  <p class="hint">Odalinde schlägt Sockel in gewöhnliche Gegenstände ohne Sockel. Wie viele es werden, entscheidet der Stein.</p>
  ${sl.length?sl.map(([id,it])=>{const c=sockCost(it);return`<div class="shoprow"><span>${it.name}${id[0]==='e'?' <small class="base">(angelegt)</small>':''}</span><span class="c">${c}</span><button data-sock="${id}" data-cost="${c}">Sockeln</button></div>`}).join(''):'<p class="hint">Kein gewöhnlicher Gegenstand ohne Sockel dabei.</p>'}`}
const _buildShop=buildShop;buildShop=function(){_buildShop();const gs=[...$('pShop').querySelectorAll('h3')].find(x=>x.textContent.startsWith('Glücksspiel'));if(gs)gs.insertAdjacentHTML('beforebegin',shopRuneHTML());else $('pShop').insertAdjacentHTML('beforeend',shopRuneHTML())};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-runebag],[data-sock]');if(!t||!P)return;const c=+t.dataset.cost;if(P.glut<c){log('Nicht genug Glut.','#ff5a4a');return}
  if(t.dataset.runebag!=null){const it=makeRune(pickRune(Math.max(1,G.mlvl)));if(!invAdd(it)){log('Das Inventar ist voll.','#ff5a4a');return}P.glut-=c;qInc('buy');discover(it);sfx('gold');log('Aus dem Beutel: '+it.name,'var(--r-rune)');updatePanels();return}
  const id=t.dataset.sock,it=id[0]==='i'?P.inv[+id.slice(1)]:P.eq[id.slice(1)];if(!it||it.soc)return;P.glut-=c;it.soc=rint(1,maxSoc(it));it.runes=[];sample('chest',.6)||sfx('boom');log(`Odalinde schlägt ${it.soc} ${it.soc===1?'Sockel':'Sockel'} in ${it.name}.`,'#f0b25a');updatePanels()});

// the collection learns runes and runeword recipes
const _buildColl=buildColl;buildColl=function(){_buildColl();const f=P.found||{},rg=RUNES.filter(r=>f['r:'+r.k]).length,wg=RW.filter(w=>f['rw:'+w.n]).length;
  $('pColl').insertAdjacentHTML('beforeend',`<h3 style="color:var(--r-rune)">Runen · ${rg} von ${RUNES.length}</h3><div class="coll">${RUNES.map(r=>{const ok=f['r:'+r.k];return`<div class="${ok?'':'no'}" title="${ok?r.n+'-Rune · Waffe: '+runeTxt(r.w)+' · Rüstung: '+runeTxt(r.a):'Noch nicht gefunden'}"><img class="px" src="${pxURL('Rune:'+r.k,'',!ok)}" width="34" height="34" alt=""></div>`}).join('')}</div>
  <h3 style="color:var(--r-runeword)">Runenwörter · ${wg} von ${RW.length} geschmiedet</h3><p class="hint">Nur in gewöhnlichen Gegenständen mit genau so vielen Sockeln, Runen in dieser Reihenfolge.</p>
  <div class="rwlist">${RW.map(w=>`<div class="rw ${f['rw:'+w.n]?'got':''}"><b>${w.n}</b><span class="base">${w.s.map(s=>SLOTPL[s]).join(', ')} · ${w.r.length} Sockel · ab Stufe ${w.l}</span><span class="c-rune">${w.r.map(k=>RBY[k].n).join(' + ')}</span><span class="mod">${runeTxt(w.m)}</span></div>`).join('')}</div>`)};
