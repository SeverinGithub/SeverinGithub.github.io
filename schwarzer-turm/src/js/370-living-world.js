/* ---------- living world: day and night over the islands, weather, chance encounters, bounties ---------- */
const DAYLEN=480;
const dayPhase=()=>((G.dayT||0)/DAYLEN)%1;
// 0–.5 day · .5–.6 dusk · .6–.9 night · .9–1 dawn
function nightA(){const p=dayPhase();return p<.5?0:p<.6?(p-.5)/.1:p<.9?1:1-(p-.9)/.1}
const dayName=()=>{const p=dayPhase();return p<.5?'Tag':p<.6?'Abend':p<.9?'Nacht':'Morgen'};
const WXN={clear:'',rain:'Regen',ash:'Ascheregen',fog:'Nebel'};

function updWorld(dt){if(!P||!G.map||G.state!=='play')return;const m=G.map;
  if(!G.wx)G.wx={k:'clear',t:rnd(60,120),i:0};
  if(m.world){G.dayT=(G.dayT||0)+dt;const was=!!G.night;G.night=nightA()>.6;
    if(G.night!==was){recalc();if(G.night){banner('DIE NACHT BRICHT HEREIN','Gegner sind stärker, die Beute ist besser','',3000);log('Nacht: Gegner +30% Leben, +20% Schaden · +50% Magiefund','#9ab0ff')}else{banner('DER MORGEN GRAUT','','',2200)}}
    const w=G.wx;w.t-=dt;if(w.t<=0){const ks=['clear','clear','clear','rain','rain','ash','fog','fog'];if(G.night)ks.push('fog');w.k=pick(ks.filter(k=>k!==w.k||k==='clear'));w.t=rnd(90,210);if(w.k!=='clear')log(WXN[w.k]+' zieht auf.','#8a9ab0')}
    w.i=clamp(w.i+(w.t>6&&w.k!=='clear'?dt/8:-dt/6),0,1);
    worldEvents(dt)}
  else{G.night=false}
  bountyTick();dayHUD()}
function dayHUD(){let el=$('dayt');if(!el){$('floorName').insertAdjacentHTML('afterend','<div id="dayt"></div><div id="btrack"></div>');el=$('dayt')}
  const t=G.map&&G.map.world?`${G.night?'☾':'☀'} ${dayName()}${G.wx&&G.wx.i>.3?' · '+WXN[G.wx.k]:''}${G.night?' · Nachtgestalten':''}`:'';if(el.dataset.t!==t){el.dataset.t=t;el.textContent=t}}
// night: harder foes on the islands, more magic in their pockets
const _makeEnemyN=makeEnemy;makeEnemy=function(vid,x,y,rank){const e=_makeEnemyN(vid,x,y,rank);if(G.night&&G.map&&G.map.world){e.hp*=1.3;e.max=e.hp;e.dmg=e.dmg.map(v=>v*1.2);e.xp*=1.35;e.sub+=' · Nachtgestalt'}return e};
const _recalcN=recalc;recalc=function(){_recalcN();if(G.night&&P&&P.d)P.d.mf+=50};

// weather, painted over the world in screen space
const WXP=[];let wxLast=0;
function drawWeather(){const m=G.map,w=G.wx;if(!m||!m.world){WXP.length=0;return}
  const dt=Math.min(.05,Math.max(0,G.t-wxLast));wxLast=G.t;const p=dayPhase(),dusk=p>.44&&p<.62?Math.sin((p-.44)/.18*Math.PI):p>.86&&p<.98?Math.sin((p-.86)/.12*Math.PI):0;
  if(dusk>0){ctx.fillStyle=`rgba(255,110,40,${(dusk*.13).toFixed(3)})`;ctx.fillRect(0,0,W,H)}
  if(!w||w.i<=0){WXP.length=0;return}const I=w.i;
  if(w.k==='rain'){ctx.fillStyle=`rgba(18,26,40,${(.2*I).toFixed(3)})`;ctx.fillRect(0,0,W,H);const want=Math.round(170*I);while(WXP.length<want)WXP.push({x:rnd(-40,W+40),y:rnd(-H,H),s:rnd(380,520),l:rnd(7,13)});WXP.length=Math.min(WXP.length,want);
    ctx.strokeStyle='rgba(170,195,230,.38)';ctx.lineWidth=1;ctx.beginPath();for(const d of WXP){d.y+=d.s*dt;d.x-=d.s*dt*.22;if(d.y>H+10){if(Math.random()<.3){ctx.fillStyle='rgba(190,210,240,.35)';ctx.fillRect(d.x,H*rnd(.2,1),2,1)}d.y=rnd(-60,-5);d.x=rnd(-20,W+80)}ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.l*.22,d.y-d.l)}ctx.stroke();
    for(let k=0;k<6*I;k++){const x=rnd(0,W),y=rnd(H*.15,H);ctx.strokeStyle='rgba(190,210,240,.3)';ctx.beginPath();ctx.ellipse(x,y,2.5,1,0,0,7);ctx.stroke()}}
  else if(w.k==='ash'){ctx.fillStyle=`rgba(50,22,12,${(.16*I).toFixed(3)})`;ctx.fillRect(0,0,W,H);const want=Math.round(120*I);while(WXP.length<want)WXP.push({x:rnd(0,W),y:rnd(-H,H),s:rnd(14,34),ph:rnd(0,7),e:Math.random()<.25});WXP.length=Math.min(WXP.length,want);
    for(const d of WXP){d.y+=d.s*dt;d.x+=Math.sin(G.t*1.3+d.ph)*12*dt-6*dt;if(d.y>H+4){d.y=-4;d.x=rnd(0,W)}if(d.e){ctx.fillStyle=`rgba(255,${130+Math.sin(G.t*6+d.ph)*60|0},40,.8)`;ctx.fillRect(d.x,d.y,1.4,1.4)}else{ctx.fillStyle='rgba(150,140,130,.55)';ctx.fillRect(d.x,d.y,2,1.4)}}}
  else if(w.k==='fog'){WXP.length=0;ctx.fillStyle=`rgba(150,158,170,${(.12*I).toFixed(3)})`;ctx.fillRect(0,0,W,H);
    for(let k=0;k<7;k++){const x=((G.t*(8+k*2)+k*233)%(W+500))-250,y=H*(.12+k*.13),r=150+k*20,g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(205,210,220,${(.16*I).toFixed(3)})`);g.addColorStop(1,'rgba(205,210,220,0)');ctx.fillStyle=g;ctx.save();ctx.translate(x,y);ctx.scale(1.8,.6);ctx.translate(-x,-y);ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()}}}

// chance encounters out on the islands
function evSpot(r0,r1){for(let k=0;k<30;k++){const a=Math.random()*7,r=rnd(r0,r1),x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;if(walkable(x,y)&&free(x,y,.4))return[x,y]}return null}
function evVid(){const ok=VARS.filter(v=>v[10]<=Math.max(1,G.mlvl)&&v[1]!=='golem');return pick(ok.length?ok:VARS)[0]}
function worldEvents(dt){const cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH),I=islandOf(cx,cy);
  for(const e of G.map.enemies)if(e.ev&&!e.dead&&hyp(e.x-P.x,e.y-P.y)>45&&!mpFriendNear(e.x,e.y,45))e.dead=true,e.dieT=99;
  if(G.ev&&G.ev.k==='merchant'){const v=G.ev;if(!G.map.objs.includes(v.o)){G.ev=null}else if(v.foes.every(e=>e.dead)){G.ev=null;v.o.quote='„Ich steh tief in deiner Schuld, Wanderer.“';const it=makeItem(G.mlvl+1,{rarity:Math.random()<.02?'unique':Math.random()<.25?'rare':'magic',mf:P.d.mf});dropItem(it,v.o.x+.6,v.o.y+.6);const gl=30*G.mlvl;P.glut+=gl;ftext(v.o.x,v.o.y,'+'+gl+' Glut','#ff9a3a');qInc('rescue');log(`${v.o.name} ist gerettet und schenkt dir ${it.name}.`,'#e8d8b0');sfx('gold')}}
  if(!I||I.kind==='home'||I.kind==='boss')return;
  const busy=G.map.enemies.some(e=>!e.dead&&e.aggro&&hyp(e.x-P.x,e.y-P.y)<11);if(busy||G.ev)return;
  G.evT=(G.evT??rnd(70,110))-dt;if(G.evT>0)return;G.evT=rnd(100,170);
  pick([evAmbush,evAmbush,evMerchant,evThief,evThief,evMeteor])()}
function evAmbush(){const id=evVid(),n=rint(3,5);let k=0;for(let i=0;i<n;i++){const s=evSpot(6,8);if(!s)continue;const e=makeEnemy(id,s[0],s[1],'champ');e.aggro=true;e.ev=true;G.map.enemies.push(e);smoke(s[0],s[1],5,'rgba(60,50,40,',6,.4);k++}
  if(k){banner('HINTERHALT!','Champions brechen aus dem Gebüsch','',2400);sfx('boom');G.shake=6}}
function evMerchant(){const s=evSpot(6,8);if(!s)return evAmbush();const o={type:'merchant',x:s[0],y:s[1],name:'Hausierer '+pick(['Jorek','Bertolt','Ansgar','Mechthild','Ruprecht','Gisela']),quote:'„Hilfe! Schafft sie mir vom Hals!“',lvl:Math.max(P.lvl,G.mlvl),ev:true};G.map.objs.push(o);
  const id=evVid(),foes=[];for(let i=0;i<rint(4,6);i++){const a=Math.random()*7,x=o.x+Math.cos(a)*rnd(1.4,2.6),y=o.y+Math.sin(a)*rnd(1.4,2.6);if(!walkable(x,y))continue;const e=makeEnemy(id,x,y,i===0?'champ':'normal');e.ev=true;e.face=Math.atan2(o.y-y,o.x-x);G.map.enemies.push(e);foes.push(e)}
  G.ev={k:'merchant',o,foes};banner('EIN HÄNDLER IN NOT',o.name+' wird überfallen','',2600);log(`Rette ${o.name}: besiege die Angreifer.`,'#e8d8b0')}
function evThief(){const s=evSpot(5,7);if(!s)return;const e=makeEnemy('wraith',s[0],s[1],'unique');Object.assign(e,{name:'Glutdieb',sub:'Flieht mit gestohlener Glut · Stufe '+G.mlvl,thief:true,thiefT:24,aff:[],spd:3.5,aggro:true,ev:true,dmgTaken:1});
  e.hp*=.8;e.max=e.hp;e.pal=new Map(Object.keys(RP).map(k=>[RP[k],RMP.char||RP[k]]));G.map.enemies.push(e);banner('EIN GLUTDIEB!','Fang ihn, bevor er verschwindet','',2400);sfx('unique')}
function evMeteor(){const s=evSpot(5,7);if(!s)return evThief();const[x,y]=s;banner('STERNSCHNUPPE','Etwas Glühendes stürzt vom Himmel','',2200);
  G.tele.push({shape:'circle',x,y,r:1.6,t:0,dur:2.4,dmg:P.d.life*.3,elem:'fire',owner:null,meteor:true,onDone:()=>{G.map.objs.push({type:'chest',x,y,ev:true,star:true});boom(x,y,2,'fire');shock(x,y,4,'255,180,90',.8,4);G.shake=10;addLight(x,y,300,1,1.5);decal('scorch',x,y,1.6,60)}})}
const _updEnemyN=updEnemy;updEnemy=function(e,dt){if(!e.thief||e.dead)return _updEnemyN(e,dt);
  e.flash=Math.max(0,e.flash-dt);e.hitT=Math.max(0,(e.hitT||0)-dt);e.thiefT-=dt;
  if(e.thiefT<=0){e.dead=true;e.dieT=99;smoke(e.x,e.y,10,'rgba(60,40,30,',8,.6);log('Der Glutdieb ist entkommen.','#a39b88');return}
  const d=hyp(P.x-e.x,P.y-e.y),a=Math.atan2(e.y-P.y,e.x-P.x)+Math.sin(G.t*1.7+e.anim)*.7,sp=e.spd*(e.slow>0?.5:1)*(d<4?1.15:.8);
  const ox=e.x,oy=e.y;moveEnt(e,Math.cos(a)*sp*dt,Math.sin(a)*sp*dt);if(hyp(e.x-ox,e.y-oy)<sp*dt*.3){const b=a+(Math.random()<.5?1.6:-1.6);moveEnt(e,Math.cos(b)*sp*dt,Math.sin(b)*sp*dt)}
  e.face=a;e.anim+=dt*sp*.6;if(Math.random()<dt*14)fxp({k:'ember',x:e.x,y:e.y,z:.5,vx:rnd(-.5,.5),vy:rnd(-.5,.5),vz:rnd(.3,1),life:.6,col:pick(['#ffc070','#ff9a30']),s:rnd(1,2),g:-1})};
const _killEnemyN=killEnemy;killEnemy=function(e,a){_killEnemyN(e,a);if(e.rank==='unique')qInc('uniq');if(e.rank==='champ')qInc('champ');
  if(e.thief){const gl=45*Math.max(1,G.mlvl);P.glut+=gl;ftext(e.x,e.y-.5,'+'+gl+' Glut','#ff9a3a');dropItem(makeItem(G.mlvl+1,{mf:P.d.mf,boost:.3}),e.x,e.y);for(let k=0;k<3;k++)dropItem(junkFor(e),e.x,e.y);if(runeOK())dropItem(makeRune(pickRune(G.mlvl,true)),e.x,e.y);banner('GLUTDIEB GESTELLT','Seine Beute gehört dir','',2400);qInc('thief')}};

// bounties from the traders: one at a time, paid out on the spot
const BFAM={skel:'Knochenwichte',ghoul:'Grabschänder',spider:'Spinnen',archer:'Knochenschützen',cult:'Aschekultisten',wraith:'Klageseelen',golem:'Steinkolosse',scorp:'Skorpione'};
function makeBounty(seed){const r=mulberry(seed),pk=a=>a[Math.floor(r()*a.length)],lv=Math.max(1,P.lvl),ty=pk(['fam','fam','fam','uniq','champ','chest','thief']);let b;
  if(ty==='fam'){const f=pk(Object.keys(BFAM).filter(k=>k!=='golem'||lv>=8)),n=10+Math.floor(r()*16);b={ty,key:'k_'+f,n,t:`Besiege ${n} ${BFAM[f]}`}}
  else if(ty==='uniq'){const n=2+Math.floor(r()*2);b={ty,key:'uniq',n,t:`Besiege ${n} einzigartige Gegner`}}
  else if(ty==='champ'){const n=6+Math.floor(r()*6);b={ty,key:'champ',n,t:`Besiege ${n} Champions`}}
  else if(ty==='chest'){const n=3+Math.floor(r()*3);b={ty,key:'chest',n,t:`Öffne ${n} Truhen`}}
  else b={ty,key:'thief',n:1,t:'Stelle einen Glutdieb'};
  b.glut=Math.round((40+lv*22)*(b.ty==='fam'?b.n/12:b.ty==='thief'?2.2:b.ty==='uniq'?b.n*.9:1.4));b.rune=r()<.5;return b}
function bountyOffers(o){if(!o.bo||o.boL!==P.lvl){o.boL=P.lvl;const s=Math.floor(Math.random()*1e9);o.bo=[makeBounty(s),makeBounty(s+77)]}return o.bo}
const bProg=b=>Math.min(b.n,qCnt(b.key)-b.base);
function bountyTick(){const b=P.bounty;if(!b)return;const t=`Kopfgeld: ${b.t} · ${bProg(b)}/${b.n}`,el=$('btrack');if(el&&el.dataset.t!==t){el.dataset.t=t;el.textContent=t}
  if(bProg(b)>=b.n){P.bounty=null;P.glut+=b.glut;const it=makeItem(Math.max(G.mlvl,P.lvl),{rarity:Math.random()<.2?'rare':'magic',mf:P.d.mf});if(!invAdd(it))dropItem(it,P.x,P.y);if(b.rune&&runeOK()){const r=makeRune(pickRune(Math.max(G.mlvl,P.lvl)));if(!invAdd(r))dropItem(r,P.x,P.y)}
    qInc('bounty');banner('KOPFGELD ERFÜLLT',`+${b.glut} Glut · ${it.name}${b.rune?' · eine Rune':''}`,'',3200);sfx('gold');log('Kopfgeld kassiert: '+b.t,'#ffd88a');if(el){el.dataset.t='';el.textContent=''}updatePanels()}}
function shopBountyHTML(){const o=G.shop||{},b=P.bounty;let h='<h3>Kopfgeld</h3>';
  if(b)return h+`<div class="shoprow"><span>${b.t} · ${bProg(b)}/${b.n}</span><span class="c">${b.glut}</span><button data-bounty="drop" data-cost="0">Aufgeben</button></div><p class="hint">Wird sofort ausgezahlt, sobald es erfüllt ist. Dazu ein seltener Gegenstand${b.rune?' und eine Rune':''}.</p>`;
  return h+'<p class="hint">Ein Auftrag zur Zeit. Belohnung in Glut, dazu ein seltener Gegenstand.</p>'+bountyOffers(o).map((x,i)=>`<div class="shoprow"><span>${x.t}${x.rune?' <small class="c-rune">+ Rune</small>':''}</span><span class="c">${x.glut}</span><button data-bounty="${i}" data-cost="0">Annehmen</button></div>`).join('')}
const _buildShopB=buildShop;buildShop=function(){_buildShopB();const gs=[...$('pShop').querySelectorAll('h3')].find(x=>x.textContent.startsWith('Glücksspiel'));if(gs)gs.insertAdjacentHTML('beforebegin',shopBountyHTML())};
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-bounty]');if(!t||!P)return;
  if(t.dataset.bounty==='drop'){log('Kopfgeld aufgegeben.','#a39b88');P.bounty=null;const el=$('btrack');if(el){el.dataset.t='';el.textContent=''}}
  else{const o=G.shop||{},x=bountyOffers(o)[+t.dataset.bounty];if(!x)return;P.bounty=Object.assign({},x,{base:qCnt(x.key)});o.bo=null;sfx('pick');log('Kopfgeld angenommen: '+x.t,'#ffd88a')}updatePanels()});
const _buildQuestsB=buildQuests;buildQuests=function(){_buildQuestsB();const b=P.bounty,h2=$('pQuest').querySelector('h2');if(b&&h2)h2.insertAdjacentHTML('afterend',`<div class="qbounty"><b>Kopfgeld</b> · ${b.t} <span>${bProg(b)}/${b.n}</span> · ${b.glut} Glut</div>`)};
