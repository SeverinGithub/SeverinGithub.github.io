/* ---------- UI ---------- */
const panels=['pChar','pSkill','pShop','pInv','pColl','pStash'];
function togglePanel(id){const el=$(id);const open=el.hidden;if(id==='pInv'&&!open)returnHand();if(id!=='pInv')for(const p of['pChar','pSkill','pShop','pColl','pStash'])$(p).hidden=true;el.hidden=!open;if(id==='pShop'&&!open)$('pShop').hidden=true;updatePanels();hideTip()}
function closeAll(){returnHand();for(const p of panels)$(p).hidden=true;closeDialog();hideTip()}
function closeDialog(){$('dialog').hidden=true}
function updatePanels(){if(!P||!P.d)return;updHand();recalc();if(!$('pChar').hidden)buildChar();if(!$('pInv').hidden)buildInv();if(!$('pSkill').hidden)buildSkills();if(!$('pShop').hidden)buildShop();if(!$('pColl').hidden)buildColl();if(!$('pStash').hidden)buildStash();buildBelt()}
function buildChar(){const d=P.d,s=d.s;
  const row=(k,n,desc)=>`<div class="statrow" title="${desc}"><span>${n}</span><b>${s[k]}${s[k]!==P.stats[k]?` <small style="color:var(--r-magic)">(${P.stats[k]})</small>`:''}</b><button data-stat="${k}" ${P.pts?'':'disabled'} aria-label="${n} erhöhen">+</button></div>`;
  $('pChar').innerHTML=`<h2>Wanderer <button data-close>Schließen</button></h2>
  <div class="derived"><span>Stufe</span><span>${P.lvl}</span><span>Erfahrung</span><span>${P.xp} / ${xpNext(P.lvl)}</span><span>Tiefste Ebene</span><span>${G.maxFloor}</span></div>
  <h3>Attribute${P.pts?` · <span style="color:var(--gold)">${P.pts} Punkte frei</span>`:''}</h3>
  ${row('str','Stärke','Erhöht Waffenschaden')}${row('dex','Geschick','Erhöht Krit, Verteidigung, Blocken, Ausdauer')}${row('vit','Vitalität','+4 Leben pro Punkt')}${row('ene','Energie','+2 Mana und +2% Zauberschaden pro Punkt')}
  <h3>Kampfwerte</h3>
  <div class="derived"><span>Waffenschaden</span><span>${d.dmin}–${d.dmax}${d.ele?` +${d.ele}`:''}</span><span>Angriffe pro Sekunde</span><span>${d.aspd.toFixed(2)}</span><span>Kritische Treffer</span><span>${d.crit.toFixed(1)}%</span>
  <span>Verteidigung</span><span>${d.def}</span><span>Blockchance</span><span>${d.block.toFixed(0)}%</span><span>Widerstände</span><span>${d.res}%</span>
  <span>Leben</span><span>${Math.round(P.hp)} / ${d.life}</span><span>Mana</span><span>${Math.round(P.mp)} / ${d.mana}</span><span>Ausdauer</span><span>${d.stam}</span>
  <span>Zauberschaden</span><span>+${Math.round((d.spellMul-1)*100)}%</span><span>Lebensraub</span><span>${d.ls}%</span><span>Laufgeschwindigkeit</span><span>+${d.frw}%</span><span>Magiefund</span><span>${d.mf}%</span>
  <span>Heilflakon</span><span>${P.flasks} / ${fMax()} · ${45+P.flaskPow*8+P.d.flaskH}%</span></div>
  <p class="hint">Gegenstände mit nicht erfüllten Anforderungen sind rot umrandet und wirken nicht.</p>`}
function buildSkills(){
  $('pSkill').innerHTML=`<h2>Fertigkeiten <button data-close>Schließen</button></h2><h3>${P.spts?`<span style="color:var(--gold)">${P.spts} Punkte frei</span>`:'Keine freien Punkte'} · Taste 1–6 wirkt, Rechtsklick wiederholt</h3><button data-tree style="margin:6px 0">Talentbaum öffnen (P)${tPts()?' · '+tPts()+' frei':''}</button>`+
  mySk().map(s=>{const l=P.sk[s.id]||0,eff=skLvl(s.id),can=P.spts>0&&P.lvl>=s.req&&l<20;return`<div class="skill"><div class="slot ${l?'':'locked'}">${skImg(s.id)}<span class="k">${s.key}</span></div><div><div class="t">${s.n}</div><div class="d">${l?s.desc(eff)+` Mana: ${s.mana(eff)}.`:`Erlernbar ab Stufe ${s.req}. `+s.desc(1)}</div></div><div><div class="lv">${l}${eff>l?`<small style="color:var(--r-magic)">+${eff-l}</small>`:''}</div><button data-skill="${s.id}" ${can?'':'disabled'} aria-label="${s.n} verbessern">+</button></div></div>`}).join('')}
// equipment around the figure: [slot, label, col, row, w, h] on a 10x7 board
const EQLAYOUT=[['helm','Helm',5,1,2,2],['amulet','Amulett',7,2,1,1],['weapon','Waffe',1,2,2,4],['armor','Rüstung',5,3,2,3],['offhand','Schild',9,2,2,4],['ring1','Ring',4,6,1,1],['belt','Gürtel',5,6,2,1],['ring2','Ring',7,6,1,1],['gloves','Handschuhe',1,6,2,2],['boots','Stiefel',9,6,2,2]];
function buildInv(){
  const ok=P.d.okS,shop=!$('pShop').hidden;
  $('pInv').innerHTML=`<h2>Inventar <button data-close>Schließen</button></h2>
  <div id="equip">${EQLAYOUT.map(([k,n,c,r,w,h])=>{const it=P.eq[k];return`<div class="eq ${it?'r-'+it.rar:''} ${it&&!ok.has(it)?'bad':''}" data-eq="${k}" style="grid-column:${c} / span ${w};grid-row:${r} / span ${h}">${it?`<img class="px" src="${invIcon(it)}" alt="">`:k==='offhand'&&P.eq.weapon&&P.eq.weapon.twoH?`<img class="px twoh" src="${invIcon(P.eq.weapon)}" alt=""><span class="lbl">Zweihändig</span>`:`<span class="lbl">${n}</span>`}</div>`}).join('')}</div>
  <div id="grid" style="height:calc(var(--cell) * ${IH});grid-template-rows:repeat(${IH},var(--cell))">${'<div class="cell"></div>'.repeat(IW*IH)}${P.inv.map((it,i)=>{const[w,h]=isz(it);return`<div class="iitem r-${it.rar} ${it.slot!=='potion'&&!canUse(it)?'bad':''}" data-inv="${i}" style="left:calc(var(--cell)*${it.gx});top:calc(var(--cell)*${it.gy});width:calc(var(--cell)*${w});height:calc(var(--cell)*${h})"><img class="px" src="${invIcon(it)}" alt="">${it.n>1?'<span class="n">'+it.n+'</span>':''}</div>`}).join('')}<div id="ghost" hidden></div></div>
  <div class="derived"><span style="color:var(--ember)">Glut</span><span style="color:var(--ember)">${P.glut}</span></div>
  <p class="hint">${shop?'Klick: verkaufen':'Klick: aufnehmen und ablegen'} · Rechtsklick: anlegen oder trinken · Shift+Klick: fallen lassen</p>`;updHand()}
function updHand(){const h=$('hand');if(!G.hand){h.hidden=true;return}const[w,hh]=isz(G.hand),cs=handCell();h.src=invIcon(G.hand);h.style.width=w*cs+'px';h.style.height=hh*cs+'px';h.hidden=false}
function handCell(){const g=$('grid')||$('sgrid');return g?g.clientWidth/IW:48}
function returnHand(){if(!G.hand)return;if(!invAdd(G.hand))dropItem(G.hand,P.x,P.y);G.hand=null;updHand()}
function gridCell(e){const g=$('grid'),r=g.getBoundingClientRect(),cs=r.width/IW;return[(e.clientX-r.left)/cs,(e.clientY-r.top)/cs]}
function handTarget(e){const[fx,fy]=gridCell(e),[w,h]=isz(G.hand);return[clamp(Math.round(fx-w/2),0,IW-w),clamp(Math.round(fy-h/2),0,IH-h),w,h]}
function gridClick(e){const[fx,fy]=gridCell(e);
  if(G.hand){const[x,y,w,h]=handTarget(e),hit=invAt(x,y,w,h);if(hit.length>1){log('Dort ist kein Platz.','#a39b88');return}
    const it=G.hand;it.gx=x;it.gy=y;P.inv.push(it);G.hand=null;if(hit.length){invDel(hit[0]);G.hand=hit[0]}sfx('pick');hideTip();updatePanels();return}
  const it=invAt(Math.floor(fx),Math.floor(fy),1,1)[0];if(!it)return;
  if(e.shiftKey){invDel(it);if(!$('pStash').hidden){stAdd(it);sfx('pick')}else dropItem(it,P.x,P.y);hideTip();updatePanels();return}
  if(!$('pShop').hidden){sellItem(it);return}
  invDel(it);G.hand=it;sfx('pick');hideTip();updatePanels()}
// the bottomless chest at the camp: 10 columns, rows without end
const SW=10;
function stAt(x,y,w,h,skip){return P.stash.filter(it=>{if(it===skip)return false;const[a,b]=isz(it);return x<it.gx+a&&x+w>it.gx&&y<it.gy+b&&y+h>it.gy})}
function stAdd(it){const[w,h]=isz(it);for(let y=0;y<9999;y++)for(let x=0;x<=SW-w;x++)if(!stAt(x,y,w,h).length){it.gx=x;it.gy=y;P.stash.push(it);return true}return false}
function stDel(it){const i=P.stash.indexOf(it);if(i>=0)P.stash.splice(i,1)}
const stRows=()=>Math.max(8,P.stash.reduce((m,it)=>Math.max(m,it.gy+isz(it)[1]),0)+4);
function openStash(){for(const p of['pChar','pSkill','pShop','pColl'])$(p).hidden=true;$('pStash').hidden=false;$('pInv').hidden=false;updatePanels()}
function buildStash(){const rows=stRows(),n=P.stash.length;
  $('pStash').innerHTML=`<h2>Bodenlose Truhe <button data-close>Schließen</button></h2>
  <div class="srow"><span class="hint" style="margin:0">${n} ${n===1?'Gegenstand':'Gegenstände'} · unten ist immer Platz</span><button id="stSort">Sortieren</button></div>
  <div id="sgrid" style="height:calc(var(--cell) * ${rows})">${'<div class="cell"></div>'.repeat(SW*rows)}${P.stash.map((it,i)=>{const[w,h]=isz(it);return`<div class="iitem r-${it.rar}" data-st="${i}" style="left:calc(var(--cell)*${it.gx});top:calc(var(--cell)*${it.gy});width:calc(var(--cell)*${w});height:calc(var(--cell)*${h})"><img class="px" src="${invIcon(it)}" alt=""></div>`}).join('')}<div id="sghost" hidden></div></div>
  <p class="hint">Klick: aufnehmen und ablegen · Shift+Klick oder Rechtsklick: ins Inventar · im Inventar legt Shift+Klick in die Truhe</p>`}
function stCell(e){const g=$('sgrid'),r=g.getBoundingClientRect(),cs=r.width/SW;return[(e.clientX-r.left)/cs,(e.clientY-r.top)/cs]}
function stTarget(e){const[fx,fy]=stCell(e),[w,h]=isz(G.hand);return[clamp(Math.round(fx-w/2),0,SW-w),Math.max(0,Math.round(fy-h/2)),w,h]}
function sgridClick(e){const[fx,fy]=stCell(e);
  if(G.hand){const[x,y,w,h]=stTarget(e),hit=stAt(x,y,w,h);if(hit.length>1){log('Dort ist kein Platz.','#a39b88');return}
    const it=G.hand;it.gx=x;it.gy=y;P.stash.push(it);G.hand=null;if(hit.length){stDel(hit[0]);G.hand=hit[0]}sfx('pick');hideTip();updatePanels();return}
  const it=stAt(Math.floor(fx),Math.floor(fy),1,1)[0];if(!it)return;
  if(e.shiftKey){stToInv(it);return}
  stDel(it);G.hand=it;sfx('pick');hideTip();updatePanels()}
function stToInv(it){stDel(it);if(!invAdd(it)){stAdd(it);log('Das Inventar ist voll.','#ff5a4a')}else sfx('pick');hideTip();updatePanels()}
function stSort(){const all=P.stash.slice().sort((a,b)=>{const[aw,ah]=isz(a),[bw,bh]=isz(b);return bw*bh-aw*ah||(a.slot>b.slot?1:a.slot<b.slot?-1:0)||(b.ilvl||0)-(a.ilvl||0)});P.stash=[];all.forEach(stAdd);sfx('pick');updatePanels()}
function sellItem(it){const v=sellP(it);qInc('sell');P.glut+=v;invDel(it);sfx('gold');log(`${it.name} für ${v} Glut verkauft.`,'#ff9a3a');hideTip();updatePanels()}
function eqClick(k){const cur=P.eq[k];
  if(G.hand){const it=G.hand,fits=it.slot===k||it.slot==='ring'&&(k==='ring1'||k==='ring2');if(!fits){log('Das passt hier nicht hin.','#a39b88');return}if(!canUse(it)){log('Anforderungen nicht erfüllt.','#ff5a4a');return}
    P.eq[k]=it;G.hand=cur||null;twoHandFix(k);sfx('pick');hideTip();updatePanels();return}
  if(cur){P.eq[k]=null;G.hand=cur;sfx('pick');hideTip();updatePanels()}}
// two-handed weapon and shield exclude each other: the other piece goes to the bag, the cursor, or the floor
function twoHandFix(k){const other=k==='weapon'&&P.eq.weapon&&P.eq.weapon.twoH?'offhand':k==='offhand'&&P.eq.weapon&&P.eq.weapon.twoH?'weapon':null;if(!other||!P.eq[other])return;const it=P.eq[other];P.eq[other]=null;
  if(invAdd(it))return;if(!G.hand){G.hand=it;return}dropItem(it,P.x,P.y)}
const canUse=it=>P.lvl>=it.req.lvl&&P.d.s.str>=it.req.str&&P.d.s.dex>=it.req.dex;
function discover(it){if(!it||it.slot==='potion'||!P.found)return;const n=!P.found[it.b];P.found[it.b]=1;if(it.rar==='unique'){const u=itUq(it);if(!P.found['u:'+u])log('Neu in der Sammlung: '+u,'var(--r-unique)');P.found['u:'+u]=1}else if(n)log('Neu in der Sammlung: '+it.b,'#a39b88')}
function buildColl(){const f=P.found||{},tile=(key,uq,name,cls)=>{const ok=f[uq?'u:'+uq:key];return`<div class="${cls||''} ${ok?'':'no'}" title="${ok?name:'Noch nicht gefunden'}"><img class="px" src="${pxURL(key,uq,!ok)}" width="34" height="34" alt="${ok?name:'Unbekannt'}"></div>`};
  const by=sl=>Object.values(BASE).filter(b=>sl.includes(b.slot)).sort((a,b)=>a.lvl-b.lvl).map(b=>b.n);
  const groups=[['Waffen',by(['weapon'])],['Schilde',by(['offhand'])],['Helme',by(['helm'])],['Rüstungen',by(['armor'])],['Handschuhe, Stiefel, Gürtel',by(['gloves','boots','belt'])],['Schmuck',by(['ring','amulet'])]];
  const all=Object.keys(BASE).length,got=Object.keys(BASE).filter(k=>f[k]).length,ug=UNIQ.filter(u=>f['u:'+u.n]).length;
  $('pColl').innerHTML=`<h2>Sammlung <button data-close>Schließen</button></h2><p class="hint">${got} von ${all} Grundformen · ${ug} von ${UNIQ.length} einzigartigen Gegenständen entdeckt.</p>`+
  groups.map(([n,ks])=>`<h3>${n}</h3><div class="coll">${ks.map(k=>tile(k,'',k)).join('')}</div>`).join('')+
  `<h3 style="color:var(--r-unique)">Einzigartig</h3><div class="coll">${UNIQ.map(u=>tile(u.b,u.n,u.n+' · '+u.b,'u')).join('')}</div>`}
function buildShop(){
  const f=Math.max(1,G.maxFloor),pc=Math.round((15+f*6)*(1-P.d.shopDisc/100)),fc=Math.round((250*Math.pow(1.7,P.flaskMax-3))*(1-P.d.shopDisc/100)),pw=Math.round((300*Math.pow(1.8,P.flaskPow))*(1-P.d.shopDisc/100)),gc=Math.round((90+P.lvl*35)*(1-P.d.shopDisc/100));
  const sh=G.shop||{},st=stockFor(sh);
  $('pShop').innerHTML=`<h2>${sh.name||'Odalinde'} <button data-close>Schließen</button></h2><p class="hint">${sh.quote||'„Glut kauft alles hier oben, Wanderer. Selbst das Glück.“'}</p>
  ${st.length?'<h3>Ausrüstung</h3>'+st.map((it,i)=>{const pr=buyP(it);return'<div class="shoprow" data-shopit="'+i+'"><span class="c-'+it.rar+'">'+it.name+'</span><span class="c">'+pr+'</span><button data-buystock="'+i+'" data-cost="'+pr+'">Kaufen</button></div>'}).join(''):''}
  <h3>Waren · Du hast <span style="color:var(--ember)">${P.glut} Glut</span></h3>
  <div class="shoprow"><span>Heiltrank (+${40+f*14} Leben)</span><span class="c">${pc}</span><button data-buy="life" data-cost="${pc}">Kaufen</button></div>
  <div class="shoprow"><span>Manatrank (+${40+f*14} Mana)</span><span class="c">${pc}</span><button data-buy="mana" data-cost="${pc}">Kaufen</button></div>
  <div class="shoprow"><span>Flakon-Ladung (${P.flaskMax} → ${P.flaskMax+1})</span><span class="c">${P.flaskMax>=8?'–':fc}</span><button data-buy="flask" data-cost="${fc}" ${P.flaskMax>=8?'disabled':''}>Kaufen</button></div>
  <div class="shoprow"><span>Flakon verstärken (+8% Heilung)</span><span class="c">${P.flaskPow>=6?'–':pw}</span><button data-buy="pow" data-cost="${pw}" ${P.flaskPow>=6?'disabled':''}>Kaufen</button></div>
  <h3>Glücksspiel · ${gc} Glut pro Wurf</h3><p class="hint">Ein unbekannter Gegenstand deiner Stufe. Meist magisch, manchmal selten, ganz selten einzigartig.</p>
  <div class="gamble">${Object.keys(SLOTNAME).map(s=>`<button data-gamble="${s}" data-cost="${gc}">${SLOTNAME[s]}</button>`).join('')}</div>
  <h3>Verkaufen</h3><p class="hint">Öffne das Inventar und klicke Gegenstände an, um sie zu verkaufen.</p>`}
function buildBelt(){
  if(!P)return;$('belt').innerHTML=[['life','Y','potL','Heiltrank (Y)','potLN'],['mana','X','potM','Manatrank (X)','potMN']].map(([k,key,ic,tt,id])=>`<div class="slot pot" data-pot="${k}" title="${tt}"><img class="px" src="${pxURL(ic)}" alt=""><span class="k">${key}</span><span class="n" id="${id}"></span></div>`).join('')+'<div class="sep"></div>'+mySk().map(s=>`<div class="slot ${P.sel===s.id?'sel':''} ${P.sk[s.id]?'':'locked'}" data-cast="${s.id}" title="${s.n}">${skImg(s.id)}<span class="k">${s.key}</span><div class="cdv" data-cd="${s.id}"></div></div>`).join('')+
  `<div class="sep"></div><div class="slot" data-flask title="Heilflakon (F)">${skImg('flask')}<span class="k">F</span><span class="n" id="flaskN">${P.flasks}</span></div>
  <div class="sep"></div><button class="mini" data-open="pChar" title="Charakter (C)">C${P.pts?'<span style=color:var(--gold)>•</span>':''}</button><button class="mini" data-open="pInv" title="Inventar (I)">I</button><button class="mini" data-open="pSkill" title="Fertigkeiten (K)">K${P.spts?'<span style=color:var(--gold)>•</span>':''}</button><button class="mini" data-open="pColl" title="Sammlung (J)">J</button><button class="mini" data-quests title="Chronik (L)">L</button><button class="mini" data-bigmap title="Karte (M)">M</button><button class="mini" data-tree title="Talentbaum (P)">P${tPts()?'<span style=color:var(--gold)>•</span>':''}</button><button class="mini" id="btnReload" title="Grafik neu laden (R)">⟳</button>`}
function openShop(o){G.shop=o||null;for(const p of['pChar','pSkill'])$(p).hidden=true;$('pShop').hidden=false;$('pInv').hidden=false;updatePanels()}
function openShrine(o){
  const d=$('dialog'),here=o&&o.ow?o.key:G.floor===0?'home':null,lit=Object.keys(G.lit).map(Number).filter(f=>f>0&&f!==G.floor).sort((a,b)=>a-b);
  const fires=Object.entries(G.owFires).filter(([k])=>k!==here).sort((a,b)=>a[1].name.localeCompare(b[1].name));
  const btn=(attr,v,n)=>'<button '+attr+'="'+v+'">'+n+'</button>';
  const list=[...(here!=='home'?[btn('data-owtravel','home','Der Hügel')]:[]),...fires.map(([k,f])=>btn('data-owtravel',k,f.name.replace(/^Leuchtfeuer (am|an der) /,''))),...lit.map(f=>btn('data-travel',f,'Ebene '+f))];
  d.innerHTML='<h2>'+(o&&o.name?o.name:'Leuchtfeuer')+'</h2><p class="hint">Rasten heilt dich, füllt den Flakon und setzt hier deinen Wiedereinstieg. Alle Feinde '+(G.map.world?'der Himmelsinseln':'dieser Ebene')+' erheben sich erneut.</p>'
    +'<div class="opts"><button data-rest>Rasten</button></div>'+(list.length?'<h3 style="font-family:var(--f-sc);font-weight:400;margin:0;color:var(--paper-dim)">Reisen zu</h3><div class="travel">'+list.join('')+'</div>':'')+'<button data-close>Weitergehen</button>';d.hidden=false}
document.addEventListener('click',e=>{
  const gr=e.target.closest&&e.target.closest('#grid');if(gr&&P){gridClick(e);return}
  if(e.target.closest&&e.target.closest('#sgrid')&&P){sgridClick(e);return}
  if(e.target.id==='stSort'){stSort();return}
  if(e.target.closest&&e.target.closest('#btnReload')){reloadRes();return}
  const t=e.target.closest('button,[data-eq],[data-cast],[data-flask],[data-pot]');if(!t)return;
  if(t.dataset.pot){quickPotion(t.dataset.pot);return}
  if(t.matches('[data-close]')){if(t.closest('#dialog'))closeDialog();else t.closest('.panel').hidden=true;hideTip();return}
  if(t.dataset.open){togglePanel(t.dataset.open);return}
  if(t.matches('[data-tree]')){toggleTree();return}
  if(t.matches('[data-quests]')){toggleQuests();return}
  if(t.matches('[data-bigmap]')){toggleMap();return}
  if(t.dataset.stat&&P.pts>0){P.stats[t.dataset.stat]++;P.pts--;updatePanels();return}
  if(t.dataset.skill&&P.spts>0){P.sk[t.dataset.skill]=(P.sk[t.dataset.skill]||0)+1;P.spts--;if(P.sk[t.dataset.skill]===1)P.sel=t.dataset.skill;updatePanels();return}
  if(t.dataset.cast){P.sel=t.dataset.cast;buildBelt();return}
  if(t.matches('[data-flask]')){drinkFlask();return}
  if(t.matches('[data-rest]')){rest();closeDialog();return}
  if(t.dataset.travel!=null){closeDialog();enterFloor(+t.dataset.travel);return}
  if(t.dataset.owtravel!=null){closeDialog();owTravel(t.dataset.owtravel);return}
  if(t.dataset.buystock!=null){const c=+t.dataset.cost,st=stockFor(G.shop||{}),it=st[+t.dataset.buystock];if(!it)return;if(P.glut<c){log('Nicht genug Glut.','#ff5a4a');return}if(!invAdd(it)){log('Das Inventar ist voll.','#ff5a4a');return}st.splice(+t.dataset.buystock,1);P.glut-=c;qInc('buy');discover(it);sfx('gold');log('Gekauft: '+it.name,RCOL[it.rar]);updatePanels();return}
  if(t.dataset.buy){const c=+t.dataset.cost;if(P.glut<c){log('Nicht genug Glut.','#ff5a4a');return}const k=t.dataset.buy;
    if(k==='life'||k==='mana'){if(!invAdd(makePotion(k,Math.max(1,G.maxFloor)))){log('Das Inventar ist voll.','#ff5a4a');return}}
    if(k==='flask'){P.flaskMax++;P.flasks++}if(k==='pow')P.flaskPow++;P.glut-=c;qInc('buy');sfx('gold');updatePanels();return}
  if(t.dataset.gamble){const c=+t.dataset.cost;if(P.glut<c){log('Nicht genug Glut.','#ff5a4a');return}
    const r=Math.random(),rar=r<.008?'unique':r<.07?'rare':'magic';const it=makeItem(P.lvl+rint(0,3),{slot:t.dataset.gamble,rarity:rar});if(!invAdd(it)){log('Kein Platz im Inventar für diesen Gegenstand.','#ff5a4a');return}P.glut-=c;qInc('buy');discover(it);sfx(it.rar==='unique'?'unique':'gold');log('Erwürfelt: '+it.name,RCOL[it.rar]);updatePanels();return}
  if(t.dataset.eq){eqClick(t.dataset.eq);return}});
document.addEventListener('contextmenu',e=>{const st=e.target.closest('[data-st]');if(st&&!G.hand){e.preventDefault();stToInv(P.stash[+st.dataset.st]);return}const t=e.target.closest('[data-inv]'),q=e.target.closest('[data-eq]');if(t&&!G.hand){e.preventDefault();invClick(P.inv[+t.dataset.inv],false)}else if(q&&!G.hand){e.preventDefault();unequip(q.dataset.eq)}else if(e.target.closest('.panel'))e.preventDefault()});
function invClick(it,shift){if(!it)return;
  if(shift){invDel(it);dropItem(it,P.x,P.y);updatePanels();hideTip();return}
  if(!$('pShop').hidden){sellItem(it);return}
  if(it.slot==='potion'){usePotion(it);hideTip();return}
  equip(it);hideTip()}
function equip(it){if(!canUse(it)){log('Anforderungen nicht erfüllt.','#ff5a4a');return}
  let slot=it.slot;if(slot==='ring')slot=!P.eq.ring1?'ring1':!P.eq.ring2?'ring2':'ring1';
  const prev=P.eq[slot];invDel(it);P.eq[slot]=it;if(prev&&!invAdd(prev)){if(!G.hand)G.hand=prev;else dropItem(prev,P.x,P.y)}
  twoHandFix(slot);sfx('pick');updatePanels()}
function unequip(k){const it=P.eq[k];if(!it)return;if(!invAdd(it)){log('Das Inventar ist voll.','#ff5a4a');return}P.eq[k]=null;sfx('pick');updatePanels();hideTip()}
// tooltips
function itemTipHTML(it,ctxTxt){
  if(it.slot==='potion')return`${invImg(it)}<div class="nm">${it.name}</div><div class="base">Stellt ${Math.round(it.amt*(1+P.d.potPow/100))} ${it.kind==='life'?'Leben':'Mana'} wieder her${it.n>1?' · Stapel: '+it.n+' / '+P.d.potStack:''}</div><div class="act">${ctxTxt||'Klick: trinken'}</div>`;
  const rarTxt={normal:'',magic:'Magisch',rare:'Selten',unique:'Einzigartig',runeword:'Runenwort'}[it.rar];
  let h=`${invImg(it)}<div class="nm c-${it.rar}">${it.name}</div>`;if(it.rar==='rare'||it.rar==='unique'||it.rar==='runeword')h+=`<div class="c-${it.rar}">${it.b}</div>`;
  h+=`<div class="base">${SLOTNAME[it.slot]}${rarTxt?' · '+rarTxt:''}${it.twoH?' · Zweihändig':''}</div>`;
  if(it.dmg){const[a,b]=itemDmg(it);h+=`<div>Schaden: <span class="${it.mods.ed?'mod':''}">${a}–${b}</span></div><div class="base">${it.speed.toFixed(2)} Angriffe/s</div>`}
  if(it.def)h+=`<div>Verteidigung: <span class="${it.mods.edef?'mod':''}">${itemDef(it)}</span></div>`;
  if(it.block)h+=`<div>Blockchance: ${it.block}%</div>`;
  const rq=(ok,t)=>`<div class="req ${ok?'':'bad'}">${t}</div>`;
  if(it.req.lvl>1)h+=rq(P.lvl>=it.req.lvl,'Benötigt Stufe '+it.req.lvl);if(it.req.str)h+=rq(P.d.s.str>=it.req.str,'Benötigt Stärke '+it.req.str);if(it.req.dex)h+=rq(P.d.s.dex>=it.req.dex,'Benötigt Geschick '+it.req.dex);
  for(const k of MODORDER)if(it.mods[k]&&k!=='ed'&&k!=='edef')h+=`<div class="mod">${MODTXT[k](it.mods[k])}</div>`;
  if(it.mods.ed)h+=`<div class="mod">${MODTXT.ed(it.mods.ed)}</div>`;if(it.mods.edef)h+=`<div class="mod">${MODTXT.edef(it.mods.edef)}</div>`;
  const cur=it.slot==='ring'?P.eq.ring1:P.eq[it.slot];
  if(ctxTxt!=='equipped'&&cur&&cur!==it){let c='';if(it.dmg&&cur.dmg){const a=itemDmg(it),b=itemDmg(cur),d=(a[0]+a[1])/2*it.speed-(b[0]+b[1])/2*cur.speed;c=`Schaden pro Sekunde ${d>=0?'+':''}${d.toFixed(1)} gegenüber angelegt`}else if(it.def!=null&&cur.def!=null){const d=itemDef(it)-itemDef(cur);c=`Verteidigung ${d>=0?'+':''}${d} gegenüber angelegt`}if(c)h+=`<div class="cmp" style="color:${c.includes('+')?'var(--good)':'var(--bad)'}">${c}</div>`}
  h+=`<div class="base" style="margin-top:4px">Wert: ${itemValue(it)} Glut</div>`;
  if(ctxTxt&&ctxTxt!=='equipped')h+=`<div class="act">${ctxTxt}</div>`;
  return h}
function showTip(html,x,y){const t=$('tip');t.innerHTML=html;t.hidden=false;const r=t.getBoundingClientRect();let px=x+18,py=y-r.height-10;if(px+r.width>innerWidth-8)px=x-r.width-18;if(py<8)py=y+20;if(py+r.height>innerHeight-8)py=innerHeight-r.height-8;t.style.left=Math.max(8,px)+'px';t.style.top=py+'px'}
function hideTip(){$('tip').hidden=true}
document.addEventListener('mousemove',e=>{
  const c=e.target.closest&&e.target.closest('[data-tn],[data-shopit],[data-inv],[data-st],[data-eq],[data-cast],[data-flask],[data-pot]');
  if(P&&G.hand){const h=$('hand'),r=h.getBoundingClientRect();h.style.left=e.clientX-r.width/2+'px';h.style.top=e.clientY-r.height/2+'px';const sg=$('sghost');if(sg){if(e.target.closest('#sgrid')){const[x,y,w,hh]=stTarget(e);sg.hidden=false;sg.className=stAt(x,y,w,hh).length>1?'bad':'';Object.assign(sg.style,{left:`calc(var(--cell)*${x})`,top:`calc(var(--cell)*${y})`,width:`calc(var(--cell)*${w})`,height:`calc(var(--cell)*${hh})`})}else sg.hidden=true}const gh=$('ghost');if(gh){if(e.target.closest('#grid')){const[x,y,w,hh]=handTarget(e);gh.hidden=false;gh.className=invAt(x,y,w,hh).length>1?'bad':'';Object.assign(gh.style,{left:`calc(var(--cell)*${x})`,top:`calc(var(--cell)*${y})`,width:`calc(var(--cell)*${w})`,height:`calc(var(--cell)*${hh})`})}else gh.hidden=true}return hideTip()}
  if(c&&P){if(c.dataset.tn!=null)return showTip(treeTip(c.dataset.tn),e.clientX,e.clientY);
    if(c.dataset.shopit!=null){const it=stockFor(G.shop||{})[+c.dataset.shopit];if(it)return showTip(itemTipHTML(it,'Klick auf Kaufen: '+buyP(it)+' Glut'),e.clientX,e.clientY)}
    else if(c.dataset.st!=null){const it=P.stash[+c.dataset.st];if(it)return showTip(itemTipHTML(it,'Klick: aufnehmen · Rechtsklick: ins Inventar'),e.clientX,e.clientY)}
    else if(c.dataset.inv!=null){const it=P.inv[+c.dataset.inv];if(it)return showTip(itemTipHTML(it,!$('pShop').hidden?`Klick: für ${sellP(it)} Glut verkaufen`:it.slot==='potion'?'Klick: aufnehmen · Rechtsklick: trinken':'Klick: aufnehmen · Rechtsklick: anlegen'),e.clientX,e.clientY)}
    else if(c.dataset.eq){const it=P.eq[c.dataset.eq];if(it)return showTip(itemTipHTML(it,'equipped')+'<div class="act">Klick: abnehmen · Rechtsklick: ins Inventar</div>',e.clientX,e.clientY)}
    else if(c.dataset.cast){const s=SKBY[c.dataset.cast],l=skLvl(s.id);return showTip(`<div class="nm">${s.n}</div><div class="base">${l?'Stufe '+l+' · Mana '+s.mana(l):'Ab Stufe '+s.req+' erlernbar'}</div><div>${s.desc(Math.max(1,l))}</div>`,e.clientX,e.clientY)}
    else if(c.dataset.pot){const L=c.dataset.pot==='life',n=potCount(c.dataset.pot);return showTip(`<div class="nm" style="color:${L?'#ff8a6a':'#9ac4ff'}">${L?'Heiltrank':'Manatrank'}</div><div>${n} im Inventar</div><div class="base">Taste ${L?'Y':'X'} oder Klick zum Trinken</div>`,e.clientX,e.clientY)}
    else if(c.matches('[data-flask]'))return showTip(`<div class="nm" style="color:var(--gold)">Heilflakon</div><div>${P.flasks} von ${fMax()} Ladungen</div><div class="base">Heilt ${45+P.flaskPow*8}% des Lebens. Füllt sich am Leuchtfeuer.</div>`,e.clientX,e.clientY)}
  if(e.target===cv&&G.hoverLabelItem)return showTip(itemTipHTML(G.hoverLabelItem,'Klick: aufheben'),e.clientX,e.clientY);
  hideTip()});

