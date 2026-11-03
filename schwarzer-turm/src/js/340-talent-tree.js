/* ---------- talent tree: six branches around one centre, fought for one point per level ---------- */
const TMOD={str:' Stärke',dex:' Geschick',vit:' Vitalität',ene:' Energie',ed:'% Waffenschaden',ias:'% Angriffstempo',crit:'% kritische Trefferchance',ls:'% Lebensraub',lok:' Leben pro Tötung',mok:' Mana pro Tötung',
  poison:' Giftschaden',fire:' Feuerschaden',cold:' Kälteschaden',light:' Blitzschaden',spell:'% Zauberschaden',mana:' Mana',mregen:' Manaregeneration',regen:' Lebensregeneration',life:' Leben',lifeP:'% maximales Leben',manaP:'% maximales Mana',
  tdef:'% Verteidigung',res:'% alle Widerstände',block:'% Blockchance',thorns:' Dornenschaden',dmgred:' Schadensreduktion',frw:'% Lauftempo',stam:' Ausdauer',glutf:'% mehr Glut',mf:'% magische Funde',xp:'% Erfahrung',
  cdr:'% schnellere Abklingzeiten',mcost:'% weniger Manakosten',potPow:'% stärkere Tränke',flask:' Flakon-Ladung',flaskH:'% Flakon-Heilung',potStack:' Tränke pro Stapel',invRows:' Inventarreihe',shopDisc:'% Rabatt bei Händlern',sellB:'% mehr Verkaufserlös'};
const tmodTxt=(k,v)=>k.startsWith('sk_')?`+${v} auf ${SKBY[k.slice(3)].n}`:(v>0?'+':'')+v+TMOD[k];
const TB=[
 {id:'kr',n:'Krieger',col:'#d0583a',spine:[{ed:6},{str:5},{ias:3}],key:{n:'Berserker',m:{ed:45,ias:15,tdef:-35}},cl:[
   {s:[{ed:5},{ed:5},{ias:4}],n:'Schlächter',m:{ed:18,sk_whirl:1}},{s:[{str:5},{ls:1},{ls:1}],n:'Blutdurst',m:{ls:3,lok:8}},{s:[{ias:4},{str:5},{ed:6}],n:'Sturmbrecher',m:{sk_charge:1,ed:12,ias:6}}]},
 {id:'ja',n:'Jäger',col:'#7ab04a',spine:[{dex:5},{crit:2},{frw:2}],key:{n:'Assassine',m:{crit:18,ed:20,lifeP:-15}},cl:[
   {s:[{crit:2},{dex:4},{crit:2}],n:'Scharfes Auge',m:{crit:8,dex:10}},{s:[{poison:4},{poison:4},{dex:4}],n:'Giftmischer',m:{poison:16,ias:6}},{s:[{frw:3},{stam:10},{frw:3}],n:'Windläufer',m:{frw:8,stam:25}}]},
 {id:'wa',n:'Wanderer',col:'#e3c04b',spine:[{frw:2},{glutf:5},{xp:3}],key:{n:'Weltenwanderer',m:{invRows:1,frw:12,xp:12}},cl:[
   {s:[{stam:10},{frw:3},{stam:10}],n:'Packesel',m:{invRows:1}},{s:[{glutf:6},{sellB:8},{shopDisc:4}],n:'Feilscher',m:{shopDisc:12,sellB:20}},{s:[{mf:6},{mf:6},{xp:3}],n:'Tiefe Taschen',m:{invRows:1,mf:10}}]},
 {id:'al',n:'Alchemist',col:'#e8903a',spine:[{regen:1},{potPow:6},{lifeP:2}],key:{n:'Meister der Elixiere',m:{flask:1,potPow:40,regen:4}},cl:[
   {s:[{potPow:8},{potPow:8},{regen:1}],n:'Trankgürtel',m:{potStack:2}},{s:[{flaskH:4},{regen:1},{flaskH:4}],n:'Tiefer Flakon',m:{flask:1,flaskH:8}},{s:[{potPow:8},{manaP:3},{mregen:2}],n:'Großer Trankgürtel',m:{potStack:2}}]},
 {id:'ma',n:'Magier',col:'#5a8ae8',spine:[{spell:6},{ene:5},{mana:10}],key:{n:'Glaskanone',m:{spell:60,lifeP:-20}},cl:[
   {s:[{spell:6},{fire:3},{spell:6}],n:'Glutherz',m:{sk_fire:1,spell:12}},{s:[{mregen:2},{mana:12},{mcost:4}],n:'Frostweber',m:{sk_nova:1,mcost:10}},{s:[{cdr:3},{spell:6},{cdr:3}],n:'Sturmrufer',m:{sk_chain:1,cdr:8}}]},
 {id:'wc',n:'Wächter',col:'#b8b0a0',spine:[{vit:5},{life:12},{tdef:8}],key:{n:'Unerschütterlich',m:{dmgred:10,lifeP:20,frw:-10}},cl:[
   {s:[{tdef:8},{block:2},{tdef:8}],n:'Bollwerk',m:{tdef:25,block:6}},{s:[{res:4},{dmgred:1},{res:4}],n:'Eisenhaut',m:{dmgred:4,res:10}},{s:[{life:15},{thorns:5},{vit:5}],n:'Knochenpanzer',m:{sk_ward:1,thorns:20,life:25}}]}];
const TREE={},TEDGE=[];
(function(){const D=62,R0=110,add=(id,x,y,o)=>TREE[id]=Object.assign({id,x,y,adj:[]},o),link=(a,b)=>{TREE[a].adj.push(b);TREE[b].adj.push(a);TEDGE.push([a,b])};
  add('o',0,0,{k:'origin',n:'Ursprung',m:{},b:-1});
  TB.forEach((b,bi)=>{const th=-Math.PI/2+bi*Math.PI/3,ax=Math.cos(th),ay=Math.sin(th),px=-ay,py=ax;let prev='o';
    for(let k=0;k<7;k++){const r=R0+k*D,id=b.id+'s'+k;add(id,ax*r,ay*r,{k:'small',b:bi,m:b.spine[k%3]});link(prev,id);prev=id}
    const kr=R0+7*D+16;add(b.id+'K',ax*kr,ay*kr,{k:'key',b:bi,n:b.key.n,m:b.key.m});link(prev,b.id+'K');
    // side clusters hang off spine nodes 2, 4 and 6, alternating sides so neighbouring branches never touch
    b.cl.forEach((c,ci)=>{const s=[2,4,6][ci],side=ci===1?1:-1,r=R0+s*D;let pr=b.id+'s'+s;
      for(let j=1;j<=4;j++){const al=r+j*D*.5,pe=side*j*D*.42,id=b.id+'c'+ci+j;add(id,ax*al+px*pe,ay*al+py*pe,j<4?{k:'small',b:bi,m:c.s[j-1]}:{k:'not',b:bi,n:c.n,m:c.m});link(pr,id);pr=id}})});
  // a bridge between every pair of neighbours for hybrid builds
  TB.forEach((b,bi)=>{const c=TB[(bi+1)%6],th=-Math.PI/2+(bi+.5)*Math.PI/3,r=(R0+D)*Math.cos(Math.PI/6),id='br'+bi,m={};
    for(const mm of[b.spine[0],c.spine[0]])for(const k in mm)m[k]=(m[k]||0)+Math.ceil(mm[k]*.6);
    add(id,Math.cos(th)*r,Math.sin(th)*r,{k:'small',b:-1,m});link(b.id+'s1',id);link(c.id+'s1',id)})})();
const tHas=id=>id==='o'||id===clsStart()||(P.tree||[]).includes(id);
const tPts=()=>Math.max(0,P.lvl-1+(P.tbonus||0)-(P.tree||[]).length);
const tCan=id=>!tHas(id)&&tPts()>0&&TREE[id].adj.some(tHas);
const tResetCost=()=>25*P.lvl;
let TV=null;
function toggleTree(){if(G.state==='tree')closeTree();else{ovClose();closeAll();G.state='tree';G.stepS=stopLoop(G.stepS);$('pTree').hidden=false;if(!TV)TV={x:0,y:0,s:clamp(1350/Math.min(innerWidth,innerHeight-64),.5,4)};buildTree()}}
function closeTree(){$('pTree').hidden=true;hideTip();G.state='play';buildBelt()}
function buildTree(){if(!TV||$('pTree').hidden)return;
  const vw=innerWidth,vh=innerHeight-64,vb=[TV.x-vw*TV.s/2,TV.y-vh*TV.s/2,vw*TV.s,vh*TV.s];
  let s=`<svg id="tsvg" viewBox="${vb.join(' ')}" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="tglow"><stop offset="0" stop-color="#ffd88a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd88a" stop-opacity="0"/></radialGradient></defs>`;
  TB.forEach((b,bi)=>{const th=-Math.PI/2+bi*2*Math.PI/TB.length,r=R0T+7*62+80;s+=`<text x="${Math.cos(th)*r}" y="${Math.sin(th)*r+8}" text-anchor="${Math.cos(th)>.5?'start':Math.cos(th)<-.5?'end':'middle'}" class="tlab" fill="${b.col}">${b.n}</text>`});
  for(const[a,b]of TEDGE){const A=TREE[a],B=TREE[b],on=tHas(a)&&tHas(b),av=(tHas(a)&&tCan(b))||(tHas(b)&&tCan(a));s+=`<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="te${on?' on':av?' av':''}"/>`}
  for(const id in TREE){const n=TREE[id],r={origin:16,small:9,not:15,key:22}[n.k],has=tHas(id),can=tCan(id),col=n.b>=0?TB[n.b].col:'#c8b898';
    if(has&&n.k!=='small')s+=`<circle cx="${n.x}" cy="${n.y}" r="${r*2.4}" fill="url(#tglow)"/>`;
    s+=`<g data-tn="${id}" class="tn${has?' on':can?' av':''}"><circle cx="${n.x}" cy="${n.y}" r="${r+3}" class="tr"/>`+(n.k==='key'?`<rect x="${n.x-r*.62}" y="${n.y-r*.62}" width="${r*1.24}" height="${r*1.24}" transform="rotate(45 ${n.x} ${n.y})" fill="${has?col:'#1a140e'}" stroke="${col}" stroke-width="3"/>`:`<circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${has?col:'#1a140e'}" stroke="${has||can?col:'#4a3a24'}" stroke-width="${n.k==='not'?4:2.5}"/>`)+'</g>'}
  s+='</svg>';const p=tPts();
  $('pTree').innerHTML=`<div class="thead"><h2>Talentbaum</h2><span class="tpts">${p?`<b>${p}</b> Talentpunkte frei`:'Keine freien Talentpunkte'} · ${(P.tree||[]).length} vergeben</span><span class="thint">Ziehen zum Verschieben · Mausrad zoomt · je Stufe ein Punkt, je neues Leuchtfeuer der Inseln und je Boss mehr</span><button data-treset>Zurücksetzen · ${tResetCost()} Glut</button><button data-tclose>Schließen (P)</button></div>${s}`}
const R0T=110;
function treeTip(id){const n=TREE[id],b=n.b>=0?TB[n.b]:null,name=n.n||(b?b.n:'Brücke');let h=`<div class="nm" style="color:${n.k==='key'?'#ffb347':n.k==='not'?'var(--gold)':b?b.col:'#e8dcc0'}">${name}</div>`;
  if(n.k==='key')h+='<div class="base">Schlussstein</div>';else if(n.k==='not')h+='<div class="base">Großer Knoten</div>';
  for(const k in n.m)h+=`<div style="color:${n.m[k]<0?'#ff7a5a':'#9ab8ff'}">${tmodTxt(k,n.m[k])}</div>`;
  if(n.m.potStack)h+='<div class="base">Gleiche Tränke stapeln sich im Inventar.</div>';if(n.m.invRows)h+='<div class="base">Das Inventar wächst um eine Reihe.</div>';
  h+=`<div class="act">${tHas(id)?(id==='o'?'Hier beginnt jeder Weg':'Erlernt'):tCan(id)?'Klick: erlernen':tPts()?'Nur neben erlernten Knoten':'Kein Talentpunkt frei'}</div>`;return h}
function stackPots(){if(!P.d||P.d.potStack<2)return;for(const it of P.inv.slice()){if(it.slot!=='potion'||!P.inv.includes(it))continue;for(const o of P.inv){if(o===it||o.slot!=='potion'||o.kind!==it.kind||!P.inv.includes(o))continue;if((o.n||1)+(it.n||1)<=P.d.potStack&&P.inv.indexOf(o)<P.inv.indexOf(it)){o.n=(o.n||1)+(it.n||1);o.amt=Math.max(o.amt,it.amt);invDel(it);break}}}}
function treeLearn(id){if(!tCan(id))return;P.tree=P.tree||[];P.tree.push(id);const n=TREE[id];const hp=P.hp/P.d.life;recalc();if(n.m.flask)P.flasks+=n.m.flask;if(n.m.lifeP)P.hp=Math.round(hp*P.d.life);if(n.m.potStack)stackPots();
  sfx(n.k==='small'?'pick':'lvl');if(n.k!=='small')banner(n.n.toUpperCase(),n.k==='key'?'Schlussstein erlernt':'Großer Knoten erlernt','',1600);buildTree();save()}
function treeReset(){const c=tResetCost();if(!(P.tree||[]).length)return;if(P.glut<c){log('Nicht genug Glut zum Zurücksetzen.','#ff5a4a');return}
  if(P.inv.some(it=>it.gy+isz(it)[1]>5)){log('Leere zuerst die zusätzlichen Inventarreihen.','#ff5a4a');return}
  P.glut-=c;P.tree=[];recalc();for(const it of P.inv.slice())if(it.slot==='potion'&&(it.n||1)>1){const extra=it.n-1;it.n=1;for(let k=0;k<extra;k++){const q=Object.assign({},it,{id:UID++,n:1});if(!invAdd(q))dropItem(q,P.x,P.y)}}
  recalc();P.flasks=Math.min(P.flasks,fMax());sfx('boom');log('Der Talentbaum ist zurückgesetzt.','#e8c878');buildTree();save()}
(function(){let drag=null;
  addEventListener('pointerdown',e=>{if(G.state!=='tree'||!e.target.closest('#tsvg'))return;drag={x:e.clientX,y:e.clientY,ox:TV.x,oy:TV.y,moved:false,tn:e.target.closest('[data-tn]')}});
  addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(drag.moved){const svg=$('tsvg'),k=svg.viewBox.baseVal.width/svg.clientWidth;TV.x=drag.ox-dx*k;TV.y=drag.oy-dy*k;svg.setAttribute('viewBox',[TV.x-svg.viewBox.baseVal.width/2,TV.y-svg.viewBox.baseVal.height/2,svg.viewBox.baseVal.width,svg.viewBox.baseVal.height].join(' '))}});
  addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(!d.moved&&d.tn)treeLearn(d.tn.dataset.tn);else if(d.moved)buildTree()});
  addEventListener('wheel',e=>{if(G.state!=='tree')return;e.preventDefault();TV.s=clamp(TV.s*(e.deltaY>0?1.12:1/1.12),.5,4);buildTree()},{passive:false});
  document.addEventListener('click',e=>{if(e.target.closest('[data-tclose]'))closeTree();else if(e.target.closest('[data-treset]'))treeReset()})})();

