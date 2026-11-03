/* ---------- the smith: Brannoc's forge on the hill · grave slate and ember slate · weapons and armour up to +10 ---------- */
const UNDEAD=new Set(['skel','ghoul','wraith','archer']);
const SLATE={g:{n:'Grabschiefer',col:'#b8c8d8',d:'Ein schwarzer Splitter aus alten Gräbern. Die Toten tragen ihn bei sich, als hätten sie ihn nie loslassen wollen.'},
  e:{n:'Glutschiefer',col:'#ff9a3a',d:'Schiefer, durch den noch Glut läuft. Nur die Starken tragen ihn, und sie geben ihn nicht freiwillig her.'}};
function wSlate(k){const poly=k==='e'?[[4,6],[10,3],[13,8],[10,13],[4,12]]:[[3,7],[8,3],[13,6],[12,11],[7,13],[2,11]];
  const inside=(x,y)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const[xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
  const b=pfill((x,y)=>{if(!inside(x+.5,y+.5))return -1;const l=-(x-8)*.11-(y-8)*.15+((x*5+y*3)%7===0?-.35:0);return l>.55?3:l>.05?2:l>-.5?1:0});
  for(const[x1,y1,x2,y2]of k==='e'?[[5,8,8,7],[8,7,11,9],[8,7,9,11]]:[[4,9,8,6],[8,6,11,8]]){const n=Math.ceil(Math.hypot(x2-x1,y2-y1)*3);
    for(let q=0;q<=n;q++){const x=Math.round(x1+(x2-x1)*q/n),y=Math.round(y1+(y2-y1)*q/n);if(pget(b,x,y)>=0)pset(b,x,y,q%3?18:19)}}
  return b}
PXS['Slate:g']=[()=>wSlate('g'),'dark','stone','dark','frost'];PXS['Slate:e']=[()=>wSlate('e'),'dark','stone','dark','ember'];
const slateImg=(k,s=18)=>`<img class="px" src="${pxURL('Slate:'+k)}" width="${s}" height="${s}" alt="">`;
function makeSlate(k){return{id:UID++,slot:'slate',slate:k,b:'Slate:'+k,cls:'slate',rar:k==='e'?'rune':'normal',name:SLATE[k].n,ilvl:1,mods:{},req:{lvl:1,str:0,dex:0}}}
const _lootShownS=lootShown;lootShown=function(it){return it.slot==='slate'||_lootShownS(it)};
const _pickupS=pickup;pickup=function(gi){const it=gi&&gi.item;if(!it||it.slot!=='slate')return _pickupS(gi);
  const m=G.map,i=m.items.indexOf(gi);if(i<0)return;m.items.splice(i,1);const k=it.slate==='e'?'slateE':'slateG';P[k]=(P[k]||0)+1;
  sfx('pick');ftext(P.x,P.y-.5,'+1 '+it.name,SLATE[it.slate].col);sparks(P.x,P.y,.6,-1.57,6,it.slate==='e'?['#fff4d0','#ffc070','#ff7a1a']:['#ffffff','#c8e4ff','#7a8aa0'],3,3);slateHud()};
const _itemTipS=itemTipHTML;itemTipHTML=function(it,c){if(it&&it.slot==='slate')return`<div><img class="px" src="${pxURL(it.b)}" width="48" height="48" alt=""></div><div class="nm" style="color:${SLATE[it.slate].col}">${it.name}</div><div class="base">Schmiedewährung</div><div class="cmp">${SLATE[it.slate].d}</div><div class="act">Brannoc auf dem Hügel schmiedet damit.</div>`;
  let h=_itemTipS(it,c);if(it&&it.cls==='staff'&&it.elem)h+=`<div class="mod" style="color:${EL[it.elem].col}">Element: ${EL[it.elem].n} · formt die Zauber des Aschemagiers</div>`;if(it&&it.up)h+=`<div class="mod" style="color:#ffd88a">Geschmiedet +${it.up}</div>`;return h};

// drops: rare on the common dead, likelier on the undead, near certain on the strong
const _killEnemyS=killEnemy;killEnemy=function(e,a){const was=e.dead;_killEnemyS(e,a);if(was||!e.dead||e.thief||e.spirit||!G.map)return;
  const f=1+diff()*.4,r=e.rank;let g=0,x=0;
  if(r==='boss'){g=rint(3,5);x=rint(1,2)}else if(r==='unique'){g=rint(1,2);x=Math.random()<.35*f?1:0}
  else if(r==='champ'){g=Math.random()<.3*f?1:0;x=Math.random()<.04*f?1:0}
  else{g=Math.random()<(UNDEAD.has(e.type)?.06:.025)*f?1:0;x=Math.random()<.003*f?1:0}
  for(let i=0;i<g;i++)dropItem(makeSlate('g'),e.x,e.y);for(let i=0;i<x;i++)dropItem(makeSlate('e'),e.x,e.y)};

// upgrades: +8% damage or defence per step, the staff also gains spell power
const UPMAX=10;
const canForge=it=>!!it&&it.slot!=='potion'&&it.slot!=='rune'&&it.slot!=='slate'&&!!(it.dmg||it.def>0||it.block);
function forgeCost(it){const n=it.up||0;return{gl:Math.round((40+it.ilvl*7)*Math.pow(n+1,1.75)),g:n<5?n+1:3,e:n<5?0:n-4}}
const _itemDmgS=itemDmg;itemDmg=function(it){const r=_itemDmgS(it),u=it.up||0;return u?[Math.round(r[0]*(1+u*.08)),Math.round(r[1]*(1+u*.08)+u*.5)]:r};
const _itemDefS=itemDef;itemDef=function(it){const u=it.up||0,d=_itemDefS(it);return u?Math.round(d*(1+u*.08)+u*2):d};
const _itemValueS=itemValue;itemValue=function(it){return Math.round(_itemValueS(it)*(1+(it.up||0)*.15))};
const _recalcS=recalc;recalc=function(){_recalcS();const d=P.d,w=P.eq.weapon;
  if(w&&w.up&&d.okS.has(w)){const k=1+w.up*.08;d.dmin=Math.round(d.dmin*k+w.up*.25);d.dmax=Math.round(d.dmax*k+w.up*.5);if(w.cls==='staff')d.spellMul+=w.up*.03}
  // the mage's spells inherit the old +skill bonuses
  if(P.cls==='magier'){const m=d.m;m.sk_m_bolt=m.sk_fire||0;m.sk_m_ring=m.sk_nova||0;m.sk_m_storm=m.sk_chain||0}};
function upName(it){it.name=it.name.replace(/ \+\d+$/,'')+' +'+it.up}
function forgeItems(){const eq=Object.values(P.eq).filter(canForge);return eq.concat(P.inv.filter(x=>canForge(x)&&!eq.includes(x)))}
// Brannoc talks to you, and the forge is a big anvil: drag an item onto it, strike, and the hammer comes down
const SAY={
  open:['Na, da bist du ja. Leg mir auf den Amboss, was besser werden soll.','Komm her. Zeig mir, was du an Stahl mit dir rumschleppst.','Die Esse ist heiß. Was soll ich dir schmieden?','Du riechst nach Gräbern. Gut. Dann hast du hoffentlich Schiefer dabei.'],
  empty:'Du trägst nichts, was ich schmieden könnte. Komm wieder, wenn du Stahl am Leib hast.',
  rule:'Bis +5 reicht mir Grabschiefer. Ab +6 will ich Glutschiefer sehen. Den Grabschiefer holst du dir von den Toten, die nicht liegen bleiben wollen.',
  pick:it=>pick([`${it.name}. Gutes Stück. Daraus mach ich dir mehr.`,`${it.name}, hm? Das kriegen wir besser hin.`,`Leg ${it.name} schön flach hin. So. Jetzt schau zu.`]),
  ember:'Ab hier frisst das Eisen Glutschiefer. Ohne den kann ich dir nicht helfen.',
  poorG:n=>`Dir fehlt Grabschiefer. Bring mir noch ${n}, dann schlag ich zu.`,
  poorE:n=>`Dir fehlt Glutschiefer. Noch ${n} Stück, und das Eisen gehorcht.`,
  poorGl:n=>`Glut, Wanderer. Mir fehlen noch ${n} Glut. Auch ein Schmied muss essen.`,
  max:'Mehr geht nicht. Das ist ein Meisterstück. Ich bin stolz auf uns beide.',
  done:it=>pick([`Hörst du das? So klingt guter Stahl. +${it.up}.`,`Da hast du's. +${it.up}. Pass besser drauf auf als auf den letzten.`,`+${it.up}. Fühl mal, wie's jetzt in der Hand liegt.`,`Noch warm. +${it.up}. Geh und zeig's den Toten.`]),
  first:'Ich war Waffenmeister der Turmwache, bevor die Brücken fielen. Jetzt hau ich auf Eisen, bis es mir gehorcht. Leg was auf den Amboss.'};
const FG={open:false,it:null,anim:0,hit:false,parts:[],pop:null,say:'',shown:0,shake:0};
function forgeEl(){let el=$('forgeUI');if(el)return el;
  document.body.insertAdjacentHTML('beforeend',`<div id="forgeUI" hidden><div class="fbox" role="dialog" aria-label="Schmiede">
    <div class="fhead"><canvas id="fPort" width="24" height="24"></canvas><div class="fsay"><b>Brannoc</b><p id="fSay"></p></div><button class="fx" data-fclose aria-label="Schließen">✕</button></div>
    <div class="fmain"><div class="fside"><h3>Deine Ausrüstung</h3><div id="fList"></div><div id="fCur"></div></div>
      <div class="fanv"><canvas id="fAnv" width="220" height="150"></canvas><div id="fInfo"></div><button id="fGo">Schmieden</button></div></div></div></div>`);
  el=$('forgeUI');paintPortrait();
  el.addEventListener('click',e=>{if(e.target===el||e.target.closest('[data-fclose]'))closeForge();if(e.target.closest('#fGo'))strike()});
  // drag from the list onto the anvil; a plain tap places the item too
  let drag=null;
  el.addEventListener('pointerdown',e=>{const t=e.target.closest('.fit');if(!t)return;e.preventDefault();drag={id:+t.dataset.fid,x:e.clientX,y:e.clientY,g:null,src:t.querySelector('img').src}});
  addEventListener('pointermove',e=>{if(!drag)return;if(!drag.g&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6){drag.g=document.createElement('img');drag.g.src=drag.src;drag.g.className='px fghost';document.body.appendChild(drag.g)}
    if(drag.g){drag.g.style.left=e.clientX+'px';drag.g.style.top=e.clientY+'px';$('fAnv').classList.toggle('over',overAnvil(e))}});
  addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;if(d.g){d.g.remove();$('fAnv').classList.remove('over');if(!overAnvil(e))return}placeOnAnvil(d.id)});
  return el}
const overAnvil=e=>{const r=$('fAnv').getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom};
function say(t){FG.say=t;FG.shown=0;const p=$('fSay');if(p)p.textContent=''}
function openForge(){G.openAt={x:P.x,y:P.y};closeDialog();const el=forgeEl();el.hidden=false;FG.open=true;FG.anim=0;FG.parts=[];FG.pop=null;
  if(FG.it&&!forgeItems().includes(FG.it))FG.it=null;const its=forgeItems();
  say(!P.smithMet?SAY.first:!its.length?SAY.empty:pick(SAY.open));P.smithMet=1;forgeList();forgeInfo();if(!FG.loop){FG.loop=true;FG.lt=0;requestAnimationFrame(forgeFrame)}}
function closeForge(){FG.open=false;const el=$('forgeUI');if(el)el.hidden=true}
function forgeList(){const its=forgeItems(),eq=Object.values(P.eq);$('fList').innerHTML=its.map(it=>`<div class="fit r-${it.rar} ${it===FG.it?'sel':''} ${eq.includes(it)?'eqd':''}" data-fid="${it.id}" title="${it.name}"><img class="px" src="${pxURL(itKey(it),itUq(it))}" alt="${it.name}" draggable="false">${it.up?`<span>+${it.up}</span>`:''}</div>`).join('')||'<p class="hint">Nichts zum Schmieden.</p>';
  $('fCur').innerHTML=`<span style="color:var(--ember)">${P.glut} Glut</span><span>${slateImg('g',16)} ${P.slateG||0}</span><span>${slateImg('e',16)} ${P.slateE||0}</span>`}
function placeOnAnvil(id){const it=forgeItems().find(x=>x.id===id);if(!it||FG.anim>0)return;FG.it=it;sfx('pick');say((it.up||0)>=UPMAX?SAY.max:SAY.pick(it));forgeList();forgeInfo()}
const statOf=it=>it.dmg?itemDmg(it).join('–')+' Schaden':itemDef(it)+' Verteidigung';
function forgeInfo(){const it=FG.it,box=$('fInfo'),go=$('fGo');
  if(!it){box.innerHTML='<p class="hint">Zieh einen Gegenstand auf den Amboss.</p>';go.disabled=true;return}
  const n=it.up||0,max=n>=UPMAX,c=forgeCost(it),cur=statOf(it);let nx='';if(!max){it.up=n+1;nx=statOf(it);it.up=n||undefined}
  const bad=(have,need)=>have<need?' class="no"':'';
  box.innerHTML=`<b class="c-${it.rar}">${it.name}</b><small>${cur}${max?'':` → <em>${nx}</em>`}</small>`+(max?'<small>Meisterstück</small>':`<small class="fc"><span${bad(P.glut,c.gl)}>${c.gl} Glut</span> · <span${bad(P.slateG||0,c.g)}>${slateImg('g',14)} ${c.g}</span>${c.e?` · <span${bad(P.slateE||0,c.e)}>${slateImg('e',14)} ${c.e}</span>`:''}</small>`);
  go.disabled=max||FG.anim>0;go.textContent=max?'Meisterstück':`Schmieden auf +${n+1}`}
function strike(){const it=FG.it;if(!it||FG.anim>0||(it.up||0)>=UPMAX)return;const c=forgeCost(it);
  if(P.glut<c.gl){say(SAY.poorGl(c.gl-P.glut));return}if((P.slateG||0)<c.g){say(SAY.poorG(c.g-(P.slateG||0)));return}if((P.slateE||0)<c.e){say(c.e&&!(P.slateE>0)?SAY.ember:SAY.poorE(c.e-(P.slateE||0)));return}
  FG.anim=.001;FG.hit=false;$('fGo').disabled=true}
// the moment the hammer lands: pay, upgrade, sparks, a dull clang
function forgeImpact(){const it=FG.it,c=forgeCost(it);P.glut-=c.gl;P.slateG-=c.g;P.slateE-=c.e;it.up=(it.up||0)+1;upName(it);recalc();
  for(let k=0;k<46;k++){const a=-Math.PI*rnd(.05,.95),v=rnd(40,160);FG.parts.push({x:110,y:58,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(.4,.9),t:0,c:pick(['#ffffff','#fff4d0','#ffc070','#ff7a1a'])})}
  FG.pop={t:0,txt:'+'+it.up};FG.shake=.35;anvilSnd()||sample('hit',.9,{rate:.5})||sfx('hit');sfx('boom');
  const o=G.map.objs.find(o=>o.type==='smith');if(o){const w=smW(o,SMA[0]-1,SMA[1]-18,18);sparks(w.x,w.y,w.z,-1.57,20,['#ffffff','#fff4d0','#ffc070','#ff7a1a'],6,3.2);G.smithHit=.35}
  slateHud();updatePanels();save();say(it.up>=UPMAX?SAY.max:SAY.done(it));forgeList()}
// pixel portrait of Brannoc: bald, sooty, grey beard
function paintPortrait(){const g=$('fPort').getContext('2d'),R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};R(0,0,24,24,'#120c08');R(0,18,24,6,'#3a2414');R(4,17,16,7,'#5a3a22');
  R(6,4,12,13,'#c89a74');R(6,4,12,3,'#e0b48a');R(5,8,2,4,'#b0835e');R(17,8,2,4,'#b0835e');R(8,9,2,1,'#140c06');R(14,9,2,1,'#140c06');R(8,8,3,1,'#6a4a2a');R(13,8,3,1,'#6a4a2a');R(11,10,2,3,'#a87452');
  R(7,13,10,6,'#8a8478');R(8,13,8,1,'#b0a898');R(10,14,4,1,'#3a1a0a');R(9,18,6,2,'#6a6458');R(15,5,2,2,'#4a3a30');R(7,15,2,1,'#5a544a')}
// the anvil scene, drawn small and scaled up crisp
function forgeFrame(){if(!FG.open){FG.loop=false;return}const cv2=$('fAnv'),g=cv2.getContext('2d'),t=performance.now()/1000,dt=Math.min(.05,t-(FG.lt||t));FG.lt=t;g.imageSmoothingEnabled=false;const R=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h)};
  // typewriter speech
  if(FG.shown<FG.say.length){FG.shown=Math.min(FG.say.length,FG.shown+dt*80);$('fSay').textContent=FG.say.slice(0,Math.floor(FG.shown))}
  g.clearRect(0,0,220,150);const bg=g.createRadialGradient(110,150,10,110,120,160);bg.addColorStop(0,`rgba(140,50,10,${.55+Math.sin(t*5)*.06})`);bg.addColorStop(1,'rgba(10,6,4,0)');g.fillStyle=bg;g.fillRect(0,0,220,150);
  // block, anvil body, horn
  R(80,104,60,34,'#3a2a1a');R(80,104,60,3,'#5a4028');R(84,112,52,1,'#24180e');R(84,124,52,1,'#24180e');
  R(92,86,36,18,'#24262c');R(96,82,28,6,'#2c2e34');R(64,64,92,22,'#2c2e34');R(64,64,92,3,'#8a8f9a');R(64,67,92,2,'#4b4f59');R(64,84,92,2,'#141518');
  g.fillStyle='#2c2e34';g.beginPath();g.moveTo(156,64);g.lineTo(190,70);g.lineTo(156,82);g.fill();g.fillStyle='#8a8f9a';g.fillRect(156,64,20,2);R(48,64,16,10,'#2c2e34');R(48,64,16,2,'#6b7076');
  const glow=FG.pop?Math.max(0,1-FG.pop.t*1.5):0;if(glow>0){g.fillStyle=`rgba(255,${160+glow*80|0},60,${glow*.8})`;g.fillRect(66,62,88,4)}
  // the item on the anvil
  if(FG.it){const ic=pxCanvas(itKey(FG.it),itUq(FG.it)),bob=FG.anim>0?0:Math.sin(t*2)*1;g.save();g.translate(110,48+bob);if(glow>0){g.shadowColor='rgba(255,200,100,.9)';g.shadowBlur=12*glow}g.drawImage(ic,-ic.width/2,-ic.height/2);g.restore()}
  else{g.strokeStyle=`rgba(255,216,138,${.35+Math.sin(t*3)*.15})`;g.setLineDash([3,3]);g.strokeRect(92,30,36,32);g.setLineDash([])}
  // the hammer: rests raised, winds up, falls hard, bounces
  let a=1.3+Math.sin(t*1.6)*.04;if(FG.anim>0){FG.anim+=dt;const k=FG.anim;a=k<.35?1.3+k/.35*.4:k<.47?1.7-(k-.35)/.12*1.22:k<.75?.48+(k-.47)/.28*.2:.68+Math.min(1,(k-.75)/.35)*.62;
    if(k>=.47&&!FG.hit){FG.hit=true;forgeImpact()}if(k>=1.1){FG.anim=0;forgeInfo()}}
  g.save();g.translate(196,96);g.rotate(a);R(-80,-3,80,6,'#5a3a1a');R(-80,-3,80,2,'#7a5430');R(-8,-4,8,8,'#3a2410');R(-100,-13,22,26,'#3a3c44');R(-100,-13,3,26,'#9aa0aa');R(-81,-13,3,26,'#1a1b20');R(-100,-13,22,2,'#6b7076');g.restore();
  // sparks and the +N
  for(const p of FG.parts){p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;g.globalAlpha=Math.max(0,1-p.t/p.l);R(p.x,p.y,2,2,p.c)}g.globalAlpha=1;FG.parts=FG.parts.filter(p=>p.t<p.l);
  if(FG.pop){FG.pop.t+=dt;const k=FG.pop.t;g.font="bold 22px 'IM Fell English', Georgia, serif";g.textAlign='center';g.globalAlpha=Math.max(0,1-Math.max(0,k-.8)/.5);g.fillStyle='#000';g.fillText(FG.pop.txt,111,29-k*14);g.fillStyle='#ffd88a';g.fillText(FG.pop.txt,110,28-k*14);g.globalAlpha=1;if(k>1.3)FG.pop=null}
  if(FG.shake>0){FG.shake-=dt;const s=FG.shake*14;$('forgeUI').querySelector('.fbox').style.transform=`translate(${rnd(-s,s)}px,${rnd(-s,s)}px)`}else $('forgeUI').querySelector('.fbox').style.transform='';
  requestAnimationFrame(forgeFrame)}
function openSmith(){openForge()}
const _escKeyF=escKey;escKey=function(){if(FG.open){closeForge();return}return _escKeyF()};
function forgeTick(){if(FG.open&&(!G.openAt||G.state!=='play'||hyp(P.x-G.openAt.x,P.y-G.openAt.y)>.6))closeForge()}

// the forge stands beside Odalinde: stone hearth, anvil, and Brannoc at work
