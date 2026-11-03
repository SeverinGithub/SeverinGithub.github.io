/* ---------- the workshop below the camp: the anvil of joining melds two of the same piece into one,
   the glyph table sells enchantments at a dear price, three on offer per piece, new ones after every purchase ---------- */
const RRANK={normal:0,magic:1,rare:2,unique:3,runeword:4};
const canCraft=it=>!!it&&!!SLOTCODE[it.slot];
function craftItems(){const eq=Object.values(P.eq).filter(canCraft);return eq.concat(P.inv.filter(x=>canCraft(x)&&!eq.includes(x)))}
const mates=(a,list)=>list.filter(x=>x!==a&&x.b===a.b&&x.slot===a.slot);
const baseName=it=>it.name.replace(/ \+\d+$/,'');
// two of a kind become one: every property of both, the shared ones stronger, one step higher
function mergeOf(a,b){const[p,q]=RRANK[b.rar]>RRANK[a.rar]?[b,a]:[a,b],r=JSON.parse(JSON.stringify(p));r.mods={};
  for(const k of new Set([...Object.keys(p.mods),...Object.keys(q.mods)])){const x=p.mods[k]||0,y=q.mods[k]||0;r.mods[k]=x&&y?Math.max(x,y)+Math.max(1,Math.round(Math.min(x,y)*.25)):x||y}
  if(p.dmg&&q.dmg&&q.dmg[0]+q.dmg[1]>p.dmg[0]+p.dmg[1])r.dmg=q.dmg.slice();
  if((q.def||0)>(p.def||0))r.def=q.def;if((q.block||0)>(p.block||0))r.block=q.block;if((q.soc||0)>(p.soc||0))r.soc=q.soc;
  r.ilvl=Math.max(p.ilvl,q.ilvl);for(const k of['lvl','str','dex'])r.req[k]=Math.max(p.req[k]||0,q.req[k]||0);
  // enough properties make a rare, any make a magic piece
  const n=Object.keys(r.mods).filter(k=>!(k==='spell'&&r.cls==='staff')).length;let nm=baseName(p);
  if(RRANK[r.rar]<2&&n>=3){r.rar='rare';nm=q.rar==='rare'?baseName(q):pick(RARE1)+pick(RARE2[r.slot])}else if(r.rar==='normal'&&n){r.rar='magic';nm=r.b}
  r.name=nm;r.up=Math.min(UPMAX,Math.max(p.up||0,q.up||0)+1);upName(r);r.encN=Math.max(p.encN||0,q.encN||0);delete r.ench;return r}
function mergeCost(a,b){const u=Math.min(UPMAX,Math.max(a.up||0,b.up||0)+1),l=Math.max(a.ilvl,b.ilvl);return{gl:Math.round((30+l*6)*Math.pow(u,1.5)/10)*10,g:u>=6?u-5:0}}
// three glyphs per piece, far beyond what drops: each costs a fortune, and every purchase makes the next one dearer
// stats the game caps get a ceiling per glyph and per piece
const ECAP={ls:12,res:30,frw:25,crit:15,block:15,allsk:2,ias:40,dmgred:12},ETOP={ls:20,res:45,frw:35,crit:20,block:20,allsk:3,ias:60,dmgred:20};
function enchOffers(it){const pool=AFF.filter(a=>a.s.includes(SLOTCODE[it.slot])&&!(ETOP[a.k]&&(it.mods[a.k]||0)>=ETOP[a.k])),out=[],n=it.encN||0;
  while(out.length<3&&pool.length){const a=pool.splice(rint(0,pool.length-1),1)[0],hi=a.r(3)[1],q=rnd(1.8,3.2),f=q*Math.pow(1.22,n);
    out.push({k:a.k,v:Math.max(1,Math.min(ECAP[a.k]||1e9,ETOP[a.k]?ETOP[a.k]-(it.mods[a.k]||0):1e9,Math.round(hi*q))),q,gl:Math.round((1500+it.ilvl*150)*f/50)*50,g:Math.round(3+q*4+n),e:(q>2.7?1:0)+Math.floor(n/2)})}
  return out}
const _itemTipC=itemTipHTML;itemTipHTML=function(it,c){let h=_itemTipC(it,c);if(it&&it.encN)h+=`<div class="mod" style="color:#7af0e0">Verzaubert ×${it.encN}</div>`;return h};

const CR={open:false,mode:'merge',a:null,b:null,it:null,res:null,anim:0,hit:false,pick:-1,parts:[],pop:null,shake:0,say:'',shown:0};
const CSAY={merge:'In den Amboss ist eine Inschrift geschlagen: »Zwei vom selben Guss werden eins, und das eine ist mehr als beide.«',
  mergeNone:'Der Amboss schweigt. Du trägst keine zwei Stücke vom selben Guss bei dir.',
  ench:'Die Seiten blättern sich von selbst um. Für jedes Stück leuchten drei Glyphen. Sie sind teuer, und sobald du eine nimmst, verlöschen die anderen.'};
function craftEl(){let el=$('craftUI');if(el)return el;
  document.body.insertAdjacentHTML('beforeend',`<div id="craftUI" hidden><div class="fbox" role="dialog" aria-label="Werkstatt">
    <div class="fhead"><canvas id="cPort" width="24" height="24"></canvas><div class="fsay"><b id="cWho"></b><p id="cSay"></p></div><button class="fx" data-cclose aria-label="Schließen">✕</button></div>
    <div class="fmain"><div class="fside"><h3 id="cH"></h3><div id="cList"></div><div id="cCur"></div></div>
      <div class="fanv"><canvas id="cCv" width="220" height="150"></canvas><div id="cInfo"></div><button id="cGo">Vereinen</button></div></div></div></div>`);
  el=$('craftUI');
  el.addEventListener('click',e=>{if(e.target===el||e.target.closest('[data-cclose]')){closeCraft();return}
    const t=e.target.closest('.fit');if(t){craftPick(+t.dataset.fid);return}
    const o=e.target.closest('[data-off]');if(o){enchBuy(+o.dataset.off);return}
    if(e.target.closest('#cGo'))mergeGo()});
  el.addEventListener('mouseover',e=>{const t=e.target.closest('.fit'),it=t&&craftItems().find(x=>x.id===+t.dataset.fid);if(!it){hideTip();return}const r=t.getBoundingClientRect();showTip(itemTipHTML(it,'Klick: auswählen'),r.right,r.top+20)});
  el.addEventListener('mouseleave',hideTip);
  return el}
function csay(t){CR.say=t;CR.shown=0;const p=$('cSay');if(p)p.textContent=''}
function openCraft(mode){G.openAt={x:P.x,y:P.y};closeDialog();const el=craftEl(),M=mode==='merge';el.hidden=false;el.dataset.mode=mode;
  Object.assign(CR,{open:true,mode,anim:0,parts:[],pop:null,res:null});const its=craftItems();for(const k of['a','b','it'])if(!its.includes(CR[k]))CR[k]=null;
  $('cWho').textContent=M?'Amboss der Vereinung':'Glyphentisch';$('cH').textContent=M?'Zwei gleiche Stücke':'Deine Ausrüstung';$('cGo').hidden=!M;
  paintCraftPort(mode);csay(M?(its.some(x=>mates(x,its).length)?CSAY.merge:CSAY.mergeNone):CSAY.ench);craftList();craftInfo();
  if(!CR.loop){CR.loop=true;CR.lt=0;requestAnimationFrame(craftFrame)}}
function closeCraft(){CR.open=false;hideTip();const el=$('craftUI');if(el)el.hidden=true}
function craftPick(id){if(CR.anim>0)return;const its=craftItems(),it=its.find(x=>x.id===id);if(!it)return;sfx('pick');
  if(CR.mode==='ench'){CR.it=it;if(!it.ench)it.ench=enchOffers(it);csay(`${baseName(it)} liegt auf dem Buch. Drei Glyphen leuchten auf. Wähle eine.`)}
  else{if(it===CR.a){CR.a=CR.b;CR.b=null}else if(it===CR.b)CR.b=null;
    else if(CR.a&&mates(CR.a,its).includes(it))CR.b=it;
    else if(!mates(it,its).length){csay(`Zu ${baseName(it)} fehlt dir ein Zwilling. Nur Gleiches lässt sich vereinen.`);return}
    else{CR.a=it;CR.b=null}
    csay(CR.a&&CR.b?`${baseName(CR.a)} und ${baseName(CR.b)}. Schlag zu, und sie werden eins.`:CR.a?`${baseName(CR.a)} liegt auf dem Amboss. Leg den Zwilling daneben.`:CSAY.merge)}
  craftList();craftInfo()}
function craftList(){const its=craftItems(),eq=Object.values(P.eq),M=CR.mode==='merge',has=it=>mates(it,its).length>0;
  if(M)its.sort((x,y)=>has(y)-has(x)||(x.b<y.b?-1:x.b>y.b?1:0));
  $('cList').innerHTML=its.map(it=>{const sel=M?it===CR.a||it===CR.b:it===CR.it,mate=M&&CR.a&&!CR.b&&!sel&&mates(CR.a,its).includes(it);
    return`<div class="fit r-${it.rar} ${sel?'sel':''} ${mate?'mate':''} ${M&&!has(it)?'lone':''} ${eq.includes(it)?'eqd':''}" data-fid="${it.id}"><img class="px" src="${pxURL(itKey(it),itUq(it))}" alt="${it.name}" draggable="false">${it.up?`<span>+${it.up}</span>`:''}${it.encN?`<i>✦${it.encN}</i>`:''}</div>`}).join('')||'<p class="hint">Du trägst nichts, was sich hier bearbeiten ließe.</p>';
  $('cCur').innerHTML=`<span style="color:var(--ember)">${P.glut} Glut</span><span>${slateImg('g',16)} ${P.slateG||0}</span><span>${slateImg('e',16)} ${P.slateE||0}</span>`}
const cBad=(have,need)=>have<need?' class="no"':'';
const cNum=n=>n.toLocaleString('de-DE');
function craftInfo(){const box=$('cInfo'),go=$('cGo');if(CR.mode==='ench')return enchInfo(box);
  const a=CR.a,b=CR.b;CR.res=null;go.textContent='Vereinen';
  if(!a||!b){box.innerHTML=`<p class="hint">${a?'Wähle den Zwilling. Gleiche Stücke leuchten in der Liste.':'Wähle zwei gleiche Stücke, etwa zwei Obsidianhelme.'}</p>`;go.disabled=true;return}
  const r=CR.res=mergeOf(a,b),c=mergeCost(a,b),st=r.dmg?itemDmg(r).join('–')+' Schaden':r.def?itemDef(r)+' Verteidigung':'',
    li=MODORDER.filter(k=>r.mods[k]).map(k=>`<li class="${r.mods[k]>Math.max(a.mods[k]||0,b.mods[k]||0)?'up':''}">${MODTXT[k](r.mods[k])}</li>`).join('');
  box.innerHTML=`<b class="c-${r.rar}">${r.name}</b>${st?`<small>${st}</small>`:''}${li?`<ul class="cmods">${li}</ul>`:''}<small class="fc"><span${cBad(P.glut,c.gl)}>${cNum(c.gl)} Glut</span>${c.g?` · <span${cBad(P.slateG||0,c.g)}>${slateImg('g',14)} ${c.g}</span>`:''}</small>`;
  go.disabled=CR.anim>0}
function enchInfo(box){const it=CR.it;if(!it){box.innerHTML='<p class="hint">Wähle einen Gegenstand. Jedes Stück hat seine eigenen drei Glyphen.</p>';return}
  if(!it.ench)it.ench=enchOffers(it);
  box.innerHTML=`<b class="c-${it.rar}">${it.name}</b>${it.encN?`<small style="color:#7af0e0">Bereits ${it.encN}× verzaubert</small>`:''}<div class="eoffs" lang="de">${it.ench.map((o,i)=>`<button class="eoff ${o.q>2.7?'top':''}" data-off="${i}" ${CR.anim>0?'disabled':''}><span class="et">${MODTXT[o.k](o.v)}</span><span class="ec"><span${cBad(P.glut,o.gl)}>${cNum(o.gl)} Glut</span><span${cBad(P.slateG||0,o.g)}>${slateImg('g',14)} ${o.g}</span>${o.e?`<span${cBad(P.slateE||0,o.e)}>${slateImg('e',14)} ${o.e}</span>`:''}</span></button>`).join('')}</div>`}
function mergeGo(){const a=CR.a,b=CR.b;if(!a||!b||CR.anim>0)return;const c=mergeCost(a,b);
  if(P.glut<c.gl){csay(`Der Amboss will Glut sehen. Dir fehlen noch ${cNum(c.gl-P.glut)}.`);return}
  if((P.slateG||0)<c.g){csay(`Ab +6 trinkt der Amboss Grabschiefer. Dir fehlen noch ${c.g-(P.slateG||0)}.`);return}
  CR.anim=.001;CR.hit=false;$('cGo').disabled=true}
function enchBuy(i){const it=CR.it,o=it&&it.ench&&it.ench[i];if(!o||CR.anim>0)return;
  if(P.glut<o.gl){csay(`Die Glyphe verlangt ${cNum(o.gl)} Glut. Dir fehlen noch ${cNum(o.gl-P.glut)}.`);return}
  if((P.slateG||0)<o.g){csay(`Die Glyphe verlangt Grabschiefer. Dir fehlen noch ${o.g-(P.slateG||0)}.`);return}
  if((P.slateE||0)<o.e){csay(`Die Glyphe verlangt Glutschiefer. Dir fehlen noch ${o.e-(P.slateE||0)}.`);return}
  CR.anim=.001;CR.hit=false;CR.pick=i;for(const b of $('cInfo').querySelectorAll('.eoff'))b.disabled=true}
const cBurst=(cols,n)=>{for(let k=0;k<n;k++){const a=rnd(0,6.283),v=rnd(40,150);CR.parts.push({x:110,y:CR.mode==='merge'?50:36,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,l:rnd(.4,.9),t:0,c:pick(cols)})}};
const cWorld=type=>{const o=G.map.objs.find(o=>o.type===type);if(o){sparks(o.x,o.y,.7,-1.57,18,['#ffffff','#c8fff4','#7af0e0','#2ac8b0'],5,3.2);addLight(o.x,o.y,220,.9,.4)}};
// the moment the pieces touch: pay, the better one takes in the other, the other is gone
function mergeImpact(){const a=CR.a,b=CR.b,c=mergeCost(a,b),r=mergeOf(a,b),eqv=Object.values(P.eq),[keep,gone]=eqv.includes(b)&&!eqv.includes(a)?[b,a]:[a,b],{id,gx,gy}=keep;
  P.glut-=c.gl;P.slateG=(P.slateG||0)-c.g;for(const k of Object.keys(keep))delete keep[k];Object.assign(keep,r,{id,gx,gy});
  invDel(gone);for(const k in P.eq)if(P.eq[k]===gone)P.eq[k]=null;CR.a=keep;CR.b=null;
  cBurst(['#ffffff','#c8fff4','#7af0e0','#b48aff'],50);CR.pop={t:0,txt:'+'+keep.up};CR.shake=.35;anvilSnd()||sample('hit',.9,{rate:.7})||sfx('hit');sfx('boom');cWorld('anvil');
  recalc();slateHud();updatePanels();save();csay(`Vereint: ${keep.name}. ${mates(keep,craftItems()).length?'Und ein weiterer Zwilling wartet schon.':'Was einmal zwei war, ist jetzt eins.'}`);craftList()}
function enchImpact(){const it=CR.it,o=it.ench[CR.pick];P.glut-=o.gl;P.slateG=(P.slateG||0)-o.g;P.slateE=(P.slateE||0)-o.e;
  it.mods[o.k]=(it.mods[o.k]||0)+o.v;it.encN=(it.encN||0)+1;it.ench=enchOffers(it);
  cBurst(['#ffffff','#c8fff4','#7af0e0','#2ac8b0'],40);CR.pop={t:0,txt:MODTXT[o.k](o.v)};sample('chest',.4)||sfx('lvl');sfx('lvl');cWorld('enchant');
  recalc();slateHud();updatePanels();save();csay(`Die Glyphe brennt sich ein: ${MODTXT[o.k](o.v)}. Die anderen verlöschen, drei neue leuchten auf.`);craftList()}
function paintCraftPort(mode){const g=$('cPort').getContext('2d'),R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};R(0,0,24,24,'#081012');
  if(mode==='merge'){R(4,17,16,7,'#5a3a1e');R(4,16,16,2,'#a8784a');R(9,12,6,4,'#24262c');R(3,8,16,4,'#2c2e34');R(3,8,16,1,'#8a8f9a');R(19,8,3,2,'#2c2e34');R(5,10,12,1,'#7af0e0')}
  else{R(2,15,20,3,'#9a6a3a');R(3,18,2,6,'#5a3a1e');R(19,18,2,6,'#5a3a1e');R(4,11,8,4,'#e8dcc0');R(12,11,8,4,'#d8ccb0');R(11,11,2,4,'#7a5230');R(5,12,5,1,'#7af0e0');R(14,13,4,1,'#7af0e0');
    for(const[x,y]of[[4,4],[11,2],[18,5]]){R(x,y,2,3,'#5ef0d8');R(x,y,1,1,'#ffffff')}}}
// the two scenes: stumps and the anvil, the table and its book, small and scaled up crisp
function craftFrame(){if(!CR.open){CR.loop=false;return}const g=$('cCv').getContext('2d'),t=performance.now()/1000,dt=Math.min(.05,t-(CR.lt||t)),M=CR.mode==='merge';CR.lt=t;g.imageSmoothingEnabled=false;
  const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
  if(CR.shown<CR.say.length){CR.shown=Math.min(CR.say.length,CR.shown+dt*80);$('cSay').textContent=CR.say.slice(0,Math.floor(CR.shown))}
  g.clearRect(0,0,220,150);const bg=g.createRadialGradient(110,110,8,110,90,150);bg.addColorStop(0,`rgba(${M?'90,60,150':'30,150,140'},${.5+Math.sin(t*3)*.06})`);bg.addColorStop(1,'rgba(4,6,8,0)');g.fillStyle=bg;g.fillRect(0,0,220,150);
  let k=0;if(CR.anim>0){CR.anim+=dt;k=CR.anim;if(k>=.55&&!CR.hit){CR.hit=true;M?mergeImpact():enchImpact()}if(k>=1.2){CR.anim=0;craftInfo()}}
  const glow=CR.pop?Math.max(0,1-CR.pop.t*1.4):0;
  const piece=(it,x,y,s=1)=>{const ic=pxCanvas(itKey(it),itUq(it));g.save();g.translate(Math.round(x),Math.round(y));g.scale(s,s);if(glow>0){g.shadowColor='rgba(122,240,224,.95)';g.shadowBlur=14*glow}g.drawImage(ic,-ic.width/2,-ic.height/2);g.restore()};
  const slot=(x,y)=>{g.strokeStyle=`rgba(122,240,224,${.35+Math.sin(t*3)*.15})`;g.setLineDash([3,3]);g.strokeRect(x-16,y-16,32,32);g.setLineDash([])};
  if(M)sceneAnvil(g,R,t,k,glow,piece,slot);else sceneTable(g,R,t,k,glow,piece,slot);
  for(const p of CR.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;g.globalAlpha=Math.max(0,1-p.t/p.l);R(p.x,p.y,2,2,p.c)}g.globalAlpha=1;CR.parts=CR.parts.filter(p=>p.t<p.l);
  if(CR.pop){CR.pop.t+=dt;const q=CR.pop.t;g.font=`bold ${M?22:12}px 'IM Fell English', Georgia, serif`;g.textAlign='center';g.globalAlpha=Math.max(0,1-Math.max(0,q-.9)/.5);g.fillStyle='#000';g.fillText(CR.pop.txt,111,19-q*8);g.fillStyle=M?'#c8fff4':'#7af0e0';g.fillText(CR.pop.txt,110,18-q*8);g.globalAlpha=1;if(q>1.4)CR.pop=null}
  const box=$('craftUI').querySelector('.fbox');if(CR.shake>0){CR.shake-=dt;const s=CR.shake*12;box.style.transform=`translate(${rnd(-s,s)}px,${rnd(-s,s)}px)`}else box.style.transform='';
  requestAnimationFrame(craftFrame)}
function sceneAnvil(g,R,t,k,glow,piece,slot){const E=(x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()};
  // the big stump, rings on its cut face
  E(110,140,40,9,'#3a2412');R(70,104,80,36,'#5a3a1e');R(70,104,4,36,'#7a5230');for(let i=1;i<6;i++)R(70+i*13,106,2,34,'#4a2e16');E(110,104,40,9,'#a8784a');
  g.strokeStyle='#7a5230';g.lineWidth=1;for(const r of[30,19,8]){g.beginPath();g.ellipse(110,104,r,r*.22,0,0,7);g.stroke()}
  // the small stump with the hammer leaning on it
  E(183,140,15,4,'#3a2412');R(168,120,30,20,'#5a3a1e');R(168,120,3,20,'#7a5230');E(183,120,15,4,'#a8784a');
  g.save();g.translate(180,118);g.rotate(.32);R(-2,-44,4,44,'#7a5430');R(-2,-44,1,44,'#9a7040');R(-10,-54,20,12,'#3a3c44');R(-10,-54,20,2,'#9aa0aa');R(-10,-54,2,12,'#6b7076');g.restore();
  // the anvil and the rune of joining on its face
  R(98,88,24,14,'#24262c');R(90,98,40,5,'#2c2e34');R(74,72,72,16,'#2c2e34');R(74,72,72,2,'#8a8f9a');R(74,74,72,2,'#4b4f59');R(74,86,72,2,'#141518');
  g.fillStyle='#2c2e34';g.beginPath();g.moveTo(146,72);g.lineTo(176,77);g.lineTo(146,86);g.fill();g.fillStyle='#8a8f9a';g.fillRect(146,72,16,2);R(60,72,14,8,'#2c2e34');R(60,72,14,2,'#6b7076');
  const ra=CR.a&&CR.b?.6+Math.sin(t*5)*.3:.22;for(let i=0;i<9;i++)R(80+i*7,79+(i%2),4,1,`rgba(122,240,224,${ra})`);
  if(glow>0)R(74,70,72,4,`rgba(200,255,244,${glow})`);
  // the two pieces float above it and fly together when struck
  const bob=Math.sin(t*2)*1.5;
  if(CR.anim>0&&!CR.hit&&CR.a&&CR.b){const e=Math.min(1,k/.55),ee=e*e,lift=Math.sin(e*Math.PI)*12;piece(CR.a,80+30*ee,50-lift,1+ee*.1);piece(CR.b,140-30*ee,50-lift,1+ee*.1)}
  else if(CR.hit&&CR.anim>0&&CR.a)piece(CR.a,110,50,1+glow*.3);
  else{if(CR.a)piece(CR.a,80,50+bob);else slot(80,50);if(CR.b)piece(CR.b,140,50-bob);else slot(140,50);
    g.fillStyle=`rgba(122,240,224,${CR.a&&CR.b?.9:.4})`;g.font="bold 16px Georgia, serif";g.textAlign='center';g.fillText('+',110,56)}}
function sceneTable(g,R,t,k,glow,piece,slot){const Q=(pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))g.lineTo(p[0],p[1]);g.closePath();g.fill()};
  const L=[46,94],T=[110,66],Rt=[174,94],B=[110,122],lerp=(p,q,f)=>[p[0]+(q[0]-p[0])*f,p[1]+(q[1]-p[1])*f];
  // legs, the thick edge and the planked top
  R(48,96,6,40,'#4a2e16');R(166,96,6,40,'#3a2412');R(107,124,6,26,'#5a3a1e');R(107,124,2,26,'#7a5230');
  Q([L,B,[B[0],B[1]+7],[L[0],L[1]+7]],'#6a4424');Q([B,Rt,[Rt[0],Rt[1]+7],[B[0],B[1]+7]],'#4a2e16');Q([L,T,Rt,B],'#9a6a3a');
  g.strokeStyle='#6a4424';g.lineWidth=1;for(let i=1;i<6;i++){const a=lerp(L,T,i/6),b=lerp(B,Rt,i/6);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}
  g.strokeStyle='#c08a50';g.beginPath();g.moveTo(L[0],L[1]);g.lineTo(T[0],T[1]);g.lineTo(Rt[0],Rt[1]);g.stroke();
  // the open book, glyphs glowing on its pages
  Q([[82,96],[118,80],[140,92],[104,108]],'#2a4a48');Q([[86,94],[112,82],[100,76],[74,88]],'#e8dcc0');Q([[86,94],[112,82],[134,92],[108,104]],'#d8ccb0');
  g.strokeStyle='#7a5230';g.beginPath();g.moveTo(86,94);g.lineTo(112,82);g.stroke();
  const ga=.5+Math.sin(t*3)*.3;for(let i=0;i<4;i++){R(82+i*6,88-i*2.6,4,1,`rgba(26,154,138,${ga})`);R(98+i*7,96-i*3,4,1,`rgba(26,154,138,${ga})`)}
  // the light rising from the pages to the piece above
  const beam=g.createLinearGradient(0,30,0,92);beam.addColorStop(0,'rgba(122,240,224,0)');beam.addColorStop(1,`rgba(122,240,224,${.25+glow*.5})`);g.fillStyle=beam;g.fillRect(96,30,28,62);
  // the gems circle above and dive into the piece when a glyph is bought
  const e=CR.anim>0&&!CR.hit?Math.min(1,k/.55):0,rr=(1-e*e);
  for(let i=0;i<5;i++){const a=t*.8+i*1.2566,x=110+Math.cos(a)*44*rr,y=40+Math.sin(a)*12*rr+Math.sin(t*2+i)*2,front=Math.sin(a)>0;
    Q([[x,y-5],[x+3,y],[x,y+5],[x-3,y]],front?'#5ef0d8':'#1a9a8a');R(x-1,y-3,1,2,'#ffffff')}
  if(CR.it)piece(CR.it,110,36+Math.sin(t*2)*1.5,1+glow*.3);else slot(110,36)}

// out in the world: the anvil on its stump at the island's lower left, the glyph table beside it
function drawAnvilJ(o){const[sx,sy]=iso(o.x,o.y);if(sx<-80||sx>W+80||sy<-100||sy>H+60)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t;
  shadow(sx+4,sy,.5);ctx.save();ctx.translate(sx,sy);const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)},E=(x,y,rx,ry,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,7);ctx.fill()};
  E(0,0,14,4,'#3a2412');R(-14,-12,28,12,'#5a3a1e');R(-14,-12,2,12,'#7a5230');R(-4,-11,1,11,'#4a2e16');R(6,-11,1,11,'#4a2e16');E(0,-12,14,4,'#a8784a');
  ctx.strokeStyle='#7a5230';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,-12,8,2.2,0,0,7);ctx.stroke();
  R(-9,-17,18,3,'#24262c');R(-5,-21,10,5,'#24262c');R(-12,-26,24,5,'#2c2e34');R(-12,-26,24,1,'#8a8f9a');R(-15,-26,3,3,'#2c2e34');
  ctx.fillStyle='#2c2e34';ctx.beginPath();ctx.moveTo(12,-26);ctx.lineTo(20,-24);ctx.lineTo(12,-21);ctx.fill();
  R(-9,-24,18,1,`rgba(122,240,224,${.45+Math.sin(t*3)*.3})`);
  E(21,6,8,2.6,'#3a2412');R(13,-1,16,7,'#5a3a1e');E(21,-1,8,2.6,'#a8784a');
  ctx.save();ctx.translate(23,-2);ctx.rotate(.32);R(-1,-18,2,18,'#7a5430');R(-5,-23,10,6,'#3a3c44');R(-5,-23,10,1,'#9aa0aa');ctx.restore();
  ctx.restore();if(hov)label(sx,sy-48,'Amboss der Vereinung','#7af0e0')}
function drawEnchT(o){const[sx,sy]=iso(o.x,o.y);if(sx<-80||sx>W+80||sy<-110||sy>H+60)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t;
  shadow(sx,sy-2,.55);ctx.save();ctx.translate(sx,sy);const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)},Q=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);ctx.closePath();ctx.fill()};
  R(-25,-19,3,14,'#4a2e16');R(22,-19,3,14,'#3a2412');R(-1,-8,3,13,'#5a3a1e');
  Q([[-26,-20],[0,-8],[0,-5],[-26,-17]],'#6a4424');Q([[0,-8],[26,-20],[26,-17],[0,-5]],'#4a2e16');Q([[-26,-20],[0,-32],[26,-20],[0,-8]],'#9a6a3a');
  ctx.strokeStyle='#6a4424';ctx.lineWidth=1;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(-26+i*6.5,-20-i*3);ctx.lineTo(i*6.5,-8-i*3);ctx.stroke()}
  Q([[-10,-18],[6,-25],[14,-21],[-2,-14]],'#2a4a48');Q([[-8,-18],[4,-24],[-2,-27],[-14,-21]],'#e8dcc0');Q([[-8,-18],[4,-24],[11,-21],[-1,-15]],'#d8ccb0');
  const ga=.5+Math.sin(t*3)*.3;R(-9,-22,4,1,`rgba(26,154,138,${ga})`);R(1,-20,4,1,`rgba(26,154,138,${ga})`);
  const q=ctx.createRadialGradient(0,-30,1,0,-30,22);q.addColorStop(0,`rgba(122,240,224,${.35+Math.sin(t*2)*.08})`);q.addColorStop(1,'rgba(122,240,224,0)');ctx.fillStyle=q;ctx.fillRect(-22,-52,44,44);
  for(let i=0;i<4;i++){const a=t*.9+i*1.5708,x=Math.cos(a)*13,y=-42+Math.sin(a)*4+Math.sin(t*2+i)*1.5;Q([[x,y-4],[x+2.5,y],[x,y+4],[x-2.5,y]],Math.sin(a)>0?'#5ef0d8':'#1a9a8a');R(x-1,y-2,1,2,'#ffffff')}
  ctx.restore();if(hov)label(sx,sy-58,'Glyphentisch','#7af0e0')}
function craftTick(dt){const m=G.map;if(!m||!m.world||!m.home)return;
  if(!m.home.objs.some(o=>o.type==='anvil')){const cx=HOX+22.5,cy=HOY+22.5;let[x,y]=nearWalk(cx+.5,cy+10.5);m.home.objs.push({type:'anvil',x,y,name:'Amboss der Vereinung'});
    [x,y]=nearWalk(cx-2.2,cy+11.6);m.home.objs.push({type:'enchant',x,y,name:'Glyphentisch'});m.ac=null;owTick()}
  if(CR.open&&(!G.openAt||G.state!=='play'||hyp(P.x-G.openAt.x,P.y-G.openAt.y)>.6))closeCraft();
  const e=m.objs.find(o=>o.type==='enchant');if(!e||hyp(e.x-P.x,e.y-P.y)>22)return;G.enLt=(G.enLt||0)-dt;if(G.enLt<=0){G.enLt=.15;addLight(e.x,e.y,120,.45+Math.random()*.1,.2)}
  if(Math.random()<dt*4)fxp({k:'mote',x:e.x+rnd(-.4,.4),y:e.y+rnd(-.4,.4),z:1.1,vx:0,vy:0,vz:rnd(.3,.8),life:rnd(.8,1.4),col:pick(['#7af0e0','#c8fff4','#2ac8b0']),s:rnd(1,1.6),g:-.2})}
const _updForgeC=updForge;updForge=function(dt){_updForgeC(dt);if(P&&G.map&&G.state!=='title')craftTick(dt)};
const _drawObjC=drawObj;drawObj=function(o){if(o.type==='anvil')return drawAnvilJ(o);if(o.type==='enchant')return drawEnchT(o);return _drawObjC(o)};
const _interactC=interact;interact=function(o){if(o&&(o.type==='anvil'||o.type==='enchant')){openCraft(o.type==='anvil'?'merge':'ench');return}return _interactC(o)};
const _escKeyC=escKey;escKey=function(){if(CR.open){closeCraft();return}return _escKeyC()};
TALES.anvil=['Der Amboss der Vereinung','Niemand weiß, wer ihn auf den Stumpf gesetzt hat. Wer zwei Stücke vom selben Guss darauf legt und zuschlägt, behält nur eines, und das eine trägt alles, was beide hatten.'];
TALES.enchant=['Der Glyphentisch','Das Buch auf dem Tisch hat keinen Titel und keine letzte Seite. Seine Glyphen verlangen Glut und Schiefer, viel davon, und sie geben dafür mehr, als irgendein Toter je fallen ließ.'];
