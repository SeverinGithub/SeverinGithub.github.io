/* ---------- names on the ground, the statue's arena, what others cast, the grindstone ---------- */
// Tab hides the names of what lies on the ground; Alt still shows them while held
const _drawLabelsT=drawLabels;drawLabels=function(){if(CFG.lblOff&&!altDown){G.labels=[];G.hoverLabelItem=null;return}return _drawLabelsT()};
// the statue only calls what you have already beaten. Every kind you fell is remembered with the hero;
// an old save starts with every kind of the families it has killed
function kvOf(){const S=stOf();if(!S.kv){S.kv={};const qc=P.qc||{};for(const v of Object.values(VAR))if((S.kills[v.base]||0)+(qc['k_'+v.base]||0)>0)S.kv[v.id]=1}return S.kv}
// the outermost hand on every kill: it remembers the kind; and from the arena nothing falls, not an item, not a grain of glut
const _killEnemyAr=killEnemy;killEnemy=function(e,a){const live=e&&!e.dead&&!e.dummy&&!e.wall;
  if(!live||!e.arena){_killEnemyAr(e,a);if(live&&e.dead&&P&&e.vid&&VAR[e.vid])kvOf()[e.vid]=1;return}
  const m=G.map,n0=m.items.length,g0=P.glut,di=dropItem;dropItem=()=>{};
  try{_killEnemyAr(e,a)}finally{dropItem=di;if(G.map===m&&m.items.length>n0)m.items.length=n0;if(P.glut>g0)P.glut=g0}
  if(e.dead&&e.vid&&VAR[e.vid])kvOf()[e.vid]=1};
// who asks decides the level and the kinds: you, or a companion on your map
summonArena=function(o,rq){const m=G.map,A=m.arena;if(!A)return false;const alive=m.enemies.filter(e=>!e.dead&&e.arena).length,tell=(t,c)=>{if(!rq)log(t,c)};
  if(((rq?rq.mf:G.maxFloor)||0)<20){tell('Die Statue schläft. Sie erwacht erst, wenn du Ebene 20 des Turms erreicht hast.','#a39b88');return false}
  if(alive>=12){if(rq)mpSend({t:'arx',to:rq.id,why:'full'});tell('Die Statue schweigt. Besiege zuerst, was in der Arena steht.','#a39b88');return false}if(G.t<(G.sumT||0))return false;
  const lvl=Math.max(1,rq?rq.lvl:P.lvl),kv=rq?rq.kv:kvOf(),VP=varPool(Math.max(1,Math.floor(lvl/2)+1)).filter(([id])=>kv[id]);
  if(!VP.length){if(rq)mpSend({t:'arx',to:rq.id,why:'none'});tell('Die Statue findet in dir keinen Gegner, den du schon bezwungen hast.','#a39b88');return false}
  G.sumT=G.t+1.2;const ml0=G.mlvl;G.mlvl=lvl;m.enemies=m.enemies.filter(e=>!e.dead||e.dieT<20);
  for(let k=0;k<3;k++){let x=A.x,y=A.y;for(let tr=0;tr<20;tr++){const a=rnd(0,6.28),r=rnd(2.5,6.5);x=A.x+Math.cos(a)*r;y=A.y+Math.sin(a)*r;if(free(x,y,.5))break}
    const roll=Math.random(),e=makeEnemy(wpick(VP),x,y,roll<.08?'unique':roll<.22?'champ':'normal');e.aggro=true;e.arena=true;e.ml=lvl;e.cd=rnd(.6,1.4);m.enemies.push(e);
    smoke(x,y,10,'rgba(60,40,70,',8,.6);flash(x,y,.8,40,'200,120,255',.3);shock(x,y,1.4,'200,150,255',.45,3);gore(x,y,0,10,GORE.rock,.2);voice(e)}
  if(rq)G.mlvl=ml0;
  G.statueT=1.6;G.shake=Math.max(G.shake,6);hitstop(.08);sfx('boom');sample('portal',.5,{rate:.7});log(rq?`${rq.nm||'Ein Mitspieler'} weckt den Wächter · drei Gegner auf Stufe ${lvl}`:`Der Wächter ruft drei Gegner herbei · Stufe ${lvl}`,'#e8c878');return true};
// on a companion's map the statue answers the host, who calls the foes for everyone
const _interactAr=interact;interact=function(o){if(o&&o.type==='colossus'&&mpOn()&&mpHostHere()){
    if((G.maxFloor||0)<20){log('Die Statue schläft. Sie erwacht erst, wenn du Ebene 20 des Turms erreicht hast.','#a39b88');return}
    if(G.t<(G.sumT||0))return;G.sumT=G.t+1.2;G.statueT=1.6;mpSend({t:'ar',id:NET.me,lvl:P.lvl,mf:G.maxFloor||0,kv:Object.keys(kvOf()),nm:CFG.mpName||''});return}
  return _interactAr(o)};
const _mpRecvAr=mpRecv;mpRecv=function(d,c){if(d&&d.t==='ar'){if(NET.role==='host'&&G.floor===0&&G.map&&G.map.arena){const r=NET.others.get(d.id);
      const kv={};for(const id of d.kv||[])if(VAR[id])kv[id]=1;summonArena(null,{id:d.id,lvl:+d.lvl||1,mf:+d.mf||0,kv,nm:d.nm||(r&&r.nm)})}return}
  if(d&&d.t==='arx'){if(d.to===NET.me)log(d.why==='none'?'Die Statue findet in dir keinen Gegner, den du schon bezwungen hast.':'Die Statue schweigt. Besiege zuerst, was in der Arena steht.','#a39b88');return}
  return _mpRecvAr(d,c)};

// what a companion casts plays out here as it does for them: the same shapes, colours and elements, harmless.
// The skill runs on a stand-in for that player, with every way to hurt, push or poison cut off, and what it leaves
// in the world (shots, burning ground, storms, rings) is moved to the eye-only lists
const MPOLD=new Set(['whirl','fire','nova','charge','ward','chain','slam','cry','leap','multi','pierce','trap','dash','rain','venom','meteor','blink']);
let VIS=0;
function visProxy(r){if(!r._px||Object.getPrototypeOf(r._px)!==P){r._px=Object.create(P);r._pd=null}const px=r._px;
  if(!r._pd||Object.getPrototypeOf(r._pd)!==P.d)r._pd=Object.create(P.d);
  const el=r._el||null,w=el?{cls:'staff',elem:el}:null;px.eq=Object.assign({},P.eq,{weapon:w});px.d=r._pd;px.d.okS=new Set(w?[w]:[]);
  px.dead=false;px.leap=null;px.path=[];px.target=null;px.interact=null;return px}
function visRun(r,fn){if(VIS)return fn();if(!P||!G.map)return;const P0=P,px=visProxy(r),far=hyp(r.x-P0.x,r.y-P0.y),vol=Math.max(.15,1-far/MPSEE);
  px.x=r.x;px.y=r.y;px.fuseT=Math.max(0,(r.fuseU||0)-G.t);px.whirl=0;px.atemT=px.oathT=0;px.crossT=Math.max(0,(r.crossU||0)-G.t);px.crossN=r.crossN||0;
  const S={hitEnemy,weaponHit,wHit,eHit,killEnemy,leapTo,hitstop,kick,st:window.setTimeout,si:window.setInterval,v:SFXV},mL=[G.mLast,G.mImpact,G.mJumpFrom],sh0=G.shake,
    n0=G.proj.length,z0=G.zones.length,r0=G.rings.length;
  const wrap=f=>function(){const a=arguments;return visRun(r,()=>f.apply(null,a))};
  P=px;VIS=1;hitEnemy=weaponHit=wHit=eHit=killEnemy=hitstop=kick=()=>{};
  SFXV=vol;
  leapTo=(tx,ty,maxD,dur,l,f)=>{const a=Math.atan2(ty-px.y,tx-px.x),dd=Math.min(maxD,Math.max(1.5,hyp(tx-px.x,ty-px.y)));let x=px.x+Math.cos(a)*dd,y=px.y+Math.sin(a)*dd;if(!free(x,y,.3))[x,y]=nearWalk(x,y);
    px.face=a;smoke(px.x,px.y,4,'rgba(90,78,62,',5,.3);S.st.call(window,()=>visRun(r,()=>{px.x=x;px.y=y;slamFx(x,y,1.2,false);if(f)f()}),dur*1000)};
  window.setTimeout=(f,ms,...a)=>S.st.call(window,typeof f==='function'?wrap(()=>f(...a)):f,ms);window.setInterval=(f,ms,...a)=>S.si.call(window,typeof f==='function'?wrap(()=>f(...a)):f,ms);
  G.mLast=r._mL;G.mImpact=r._mI;G.mJumpFrom=r._mJ;
  try{fn()}catch(err){}finally{P=P0;VIS=0;({hitEnemy,weaponHit,wHit,eHit,killEnemy,leapTo,hitstop,kick}=S);SFXV=S.v;window.setTimeout=S.st;window.setInterval=S.si;
    r._mL=G.mLast;r._mI=G.mImpact;r._mJ=G.mJumpFrom;[G.mLast,G.mImpact,G.mJumpFrom]=mL;G.shake=sh0+Math.max(0,G.shake-sh0)*vol*.5;
    for(const p of G.proj.splice(n0)){delete p.onHit;delete p.onBoom;p.owner='v';p.dmg=0;G.vproj.push(p)}
    for(const z of G.zones.splice(z0)){z.dmg=0;z.vis=1;z.acc=z.acc||0;G.vzones.push(z)}
    for(let i=r0;i<G.rings.length;i++){const g=G.rings[i];g.dmg=0;g.onHit=null;g.slow=0}
    // a wall of blades and a dash stay on the friend for as long as they would last on you
    if(Object.hasOwn(px,'ward')){if(px.ward>0)r.wardU=G.t+(px.wardT||8);delete px.ward;delete px.wardT;delete px.wardMax}
    if(Object.hasOwn(px,'dash')){if(px.dash){r.dashA=px.dash.ang;r.dashU=G.t+px.dash.left/16}delete px.dash}
    if(px.whirl>0)r.whirl=Math.max(r.whirl||0,px.whirl);if(px.fuseT>0)r.fuseU=G.t+px.fuseT;if(px.atemT>0)r.atemU=G.t+px.atemT;if(px.oathT>0)r.oathU=G.t+px.oathT;
    // the friend's cross cut keeps its own count of sharpened cuts, apart from yours
    if(px.crossT>=4){r.crossU=G.t+4;r.crossN=px.crossN}}}
const _mpCastFxV=mpCastFx;mpCastFx=function(r,d){if(!d||MPOLD.has(d.sk)||!SKBY[d.sk]){const v0=SFXV;if(P)SFXV=Math.max(.15,1-hyp(r.x-P.x,r.y-P.y)/MPSEE);try{return _mpCastFxV(r,d)}finally{SFXV=v0}}
  if(r.floor!==G.floor||typeof G.floor!=='number'||hyp(r.x-P.x,r.y-P.y)>MPSEE)return;r.face=d.a||0;r._el=d.e||(r.eq&&r.eq.weapon&&r.eq.weapon.elem)||(d.sk.startsWith('m_')?'fire':null);
  visRun(r,()=>{P.face=d.a||0;castExt(d.sk,d.l||1,d.a||0,d.tx??r.x,d.ty??r.y)});if(ANK[d.sk]){r.anK=d.sk;r.anS=G.t}};
// the staff's element travels with every cast
const _mpSendV=mpSend;mpSend=function(o){if(o&&o.t==='k'&&o.id===NET.me&&o.e===undefined&&P&&o.sk&&o.sk.startsWith('m_'))o.e=mElem();return _mpSendV(o)};
// the eye-only storms and shots in their elements, and the glow of a companion's running buffs
const _mpFxTickV=mpFxTick;mpFxTick=function(dt){const pre=(G.vproj||[]).slice();_mpFxTickV(dt);const m=G.map;if(!m)return;
  for(const p of pre){const E=p.melem&&EL[p.melem];if(!E)continue;
    if(p.life<=0){if(p.melem!=='fire'){sparks(p.x,p.y,.5,Math.atan2(-p.vy,-p.vx),9,E.c.slice(0,3),4);flash(p.x,p.y,.6,26,E.rgb,.16)}if(p.melem==='poison')smoke(p.x,p.y,3,'rgba(90,140,50,',5,.3)}
    else if(Math.random()<dt*30)fxp({k:p.melem==='fire'?'ember':'mote',x:p.x,y:p.y,z:.55+rnd(-.1,.1),vx:rnd(-.5,.5),vy:rnd(-.5,.5),vz:rnd(.2,.8),life:rnd(.2,.4),col:pick(E.c.slice(0,3)),s:rnd(1,2),g:0})}
  for(const z of G.vzones){if(!z.vis)continue;z.acc+=dt;
    if(z.k==='hail'){for(let q=0;q<2;q++){const a=rnd(0,6.28),r=rnd(0,z.r);fxp({k:'shard',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:3,vx:1.5,vy:1.5,vz:-12,life:.25,col:pick(['#ffffff','#c8e4ff','#6ad0ff']),s:rnd(1.6,2.6),rot:1.2,g:0})}
      if(z.acc>=z.tick){z.acc=0;decal('frost',z.x+rnd(-1,1),z.y+rnd(-1,1),.6,8)}}
    if(z.k==='thunder'&&z.acc>=z.tick){z.acc=0;const c=m.enemies.filter(e=>!e.dead&&hyp(e.x-z.x,e.y-z.y)<z.r+e.r),t=c.length?pick(c):null,x=t?t.x:z.x+rnd(-z.r,z.r)*.7,y=t?t.y:z.y+rnd(-z.r,z.r)*.7;
      G.bolts.push({a:[x-1.6,y-1.6],b:[x,y],t:.25});G.bolts.push({a:[x-1.6,y-1.6],b:[x-.6,y-1.2],t:.18});flash(x,y,1.2,60,'200,215,255',.35);shock(x,y,1.2,'180,200,255',.3,3);addLight(x,y,260,1,.3);sparks(x,y,.3,0,12,['#ffffff','#cfe0ff','#7aa4ff'],7,3.2);if(hyp(x-P.x,y-P.y)<12)sfx('zap')}
    if(z.k==='mcloud'&&Math.random()<dt*(z.big?40:18)){const a=rnd(0,6.28),r=rnd(0,z.r);fxp({k:'mote',x:z.x+Math.cos(a)*r,y:z.y+Math.sin(a)*r,z:rnd(.1,.6),vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:rnd(.2,.6),life:rnd(.6,1.2),col:pick(['#9ae050','#c8f878','#4a8a2a']),s:rnd(1.5,3),g:0})}}
  if(typeof NET==='undefined'||!NET.others)return;
  for(const r of NET.others.values()){if(r.stale||r.floor!==G.floor||hyp(r.x-P.x,r.y-P.y)>MPSEE)continue;
    if(r.atemU>G.t&&Math.random()<dt*6)fxp({k:'mote',x:r.x+rnd(-.3,.3),y:r.y+rnd(-.3,.3),z:rnd(.2,1),vx:0,vy:0,vz:.8,life:.6,col:pick(['#ff7a6a','#ffb0a0']),s:1.2,g:0});
    if(r.oathU>G.t&&Math.random()<dt*8)fxp({k:'mote',x:r.x+rnd(-.35,.35),y:r.y+rnd(-.35,.35),z:rnd(.2,1.4),vx:0,vy:0,vz:.7,life:.7,col:pick(['#fff0a8','#ffd88a']),s:1.3,g:0});
    if(r.fuseU>G.t&&Math.random()<dt*14){const k=pick(ELK),a=rnd(0,6.28);fxp({k:'mote',x:r.x+Math.cos(a)*.6,y:r.y+Math.sin(a)*.6,z:rnd(.3,1.3),vx:-Math.sin(a)*1.5,vy:Math.cos(a)*1.5,vz:.3,life:.6,col:EL[k].c[1],s:1.6,g:0})}}};

// the grindstone, left of the glyph table: lay a socketed piece on it and the runes come out whole, the piece keeps its empty sockets
const _insertRuneG=insertRune;insertRune=function(rn,it){if(it&&canSock(it)&&!(it.runes||[]).length){it.req0=it.req.lvl;it.name0=it.name}return _insertRuneG(rn,it)};
function grindReq(it){if(it.req0!=null)return it.req0;const b=BASE[it.b];if(!b)return it.req.lvl;const u=it.rar==='unique'&&UNIQ.find(q=>q.n===it.name);return u?Math.max(b.lvl,u.lvl):it.rar==='normal'||it.rw?b.lvl:Math.max(b.lvl,Math.floor(it.ilvl*.7))}
function grindItem(it){const rs=(it.runes||[]).slice();if(!rs.length)return null;const g=sgrp(it),sub=m=>{for(const k in m){it.mods[k]=(it.mods[k]||0)-m[k];if(Math.abs(it.mods[k])<1e-6)delete it.mods[k]}};
  const rw=it.rw;if(rw){const w=RW.find(w=>w.n===rw);if(w)sub(w.m);delete it.rw;it.rar='normal';it.name=it.name0&&it.name0!==rw?it.name0:it.b}
  for(const k of rs){const r=RBY[k];if(r)sub(r[g])}
  it.req.lvl=grindReq(it);it.runes=[];delete it.req0;delete it.name0;
  const out=rs.map(k=>_makeRuneL(k)),o=G.map.objs.find(q=>q.type==='grind');for(const rn of out)if(!invAdd(rn))dropItem(rn,o?o.x:P.x,o?o.y:P.y);
  return{rs,rw}}
function grindList(){const L=[];for(const k in P.eq){const it=P.eq[k];if(it&&(it.runes||[]).length)L.push([it,'angelegt'])}for(const it of P.inv)if((it.runes||[]).length)L.push([it,'Inventar']);return L}
const grIcon=it=>{try{const c=invIcon(it);return typeof c==='string'?c:c.toDataURL()}catch(e){return''}};
function openGrind(res){const d=$('dialog'),L=grindList();G.grindAt={x:P.x,y:P.y};
  const row=([it,w])=>`<button class="grow" data-grind="${it.id}"><img class="px" src="${grIcon(it)}" alt=""><span><b style="color:${RCOL[it.rar]}">${it.name}</b><small>${it.runes.map(k=>RBY[k].n).join(' · ')} · ${w}</small></span></button>`;
  const got=res?`<div class="grres"><h3>Vom Stein</h3><div class="grout"><span class="grit"><img class="px" src="${grIcon(res.it)}" alt=""><b style="color:${RCOL[res.it.rar]}">${res.it.name}</b><small>${res.it.soc} Sockel frei</small></span>`
    +res.rs.map(k=>`<span class="grit"><img class="px" src="${pxURL('Rune:'+k)}" alt=""><b style="color:var(--r-rune)">${RBY[k].n}</b><small>Rune</small></span>`).join('')+`</div>${res.rw?`<p class="hint">Das Runenwort „${res.rw}“ ist verklungen.</p>`:''}</div>`:'';
  d.innerHTML=`<h2 data-grind-root>Schleifstein</h2>${got}<p class="hint">Leg einen gesockelten Gegenstand auf den Stein. Der Stein schleift die Runen heil heraus, die Sockel bleiben offen. Ein Runenwort zerfällt dabei.</p>`
    +(L.length?`<div class="grl">${L.map(row).join('')}</div>`:`<p class="hint" style="color:var(--paper-dim)">Du trägst nichts, in dem eine Rune sitzt.</p>`)+'<button data-close>Weitergehen</button>';d.hidden=false}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-grind]');if(!b||!P)return;e.stopPropagation();
  const id=+b.dataset.grind,hit=grindList().find(([it])=>it.id===id);if(!hit)return;const it=hit[0],r=grindItem(it);if(!r)return;hideTip();
  const o=G.map.objs.find(q=>q.type==='grind');if(o){G.grindFx=1.1;sparks(o.x,o.y,.8,-2.4,22,['#ffffff','#ffe8b0','#ffb050','#ff7a1a'],6,.9);flash(o.x,o.y,.8,30,'255,210,140',.2)}
  sample('sword',.55,{rate:.55});setTimeout(()=>sample('chest',.35)||sfx('pick'),260);if(r.rw)sfx('unique');
  log(`Der Schleifstein löst ${r.rs.length===1?'eine Rune':r.rs.length+' Runen'} aus ${it.name}: ${r.rs.map(k=>RBY[k].n).join(', ')}.`,'var(--r-rune)');
  updatePanels();openGrind({it,rs:r.rs,rw:r.rw})},true);
document.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('[data-grind]');if(!b||!P)return;const h=grindList().find(([it])=>it.id===+b.dataset.grind);if(h)showTip(itemTipHTML(h[0]),e.clientX,e.clientY)});
document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('[data-grind]'))hideTip()});
// the stone on its frame: a grey wheel turning in a wooden trestle, its foot in a trough of water, a crank on the axle
function drawGrind(o){const[sx,sy]=iso(o.x,o.y);if(sx<-80||sx>W+80||sy<-100||sy>H+60)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t,fx=G.grindFx||0;
  o.rot=(o.rot||0)+(.4+fx*14)*(1/60);const rot=o.rot;
  shadow(sx,sy-1,.55);ctx.save();ctx.translate(sx,sy);const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)},Q=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))ctx.lineTo(p[0],p[1]);ctx.closePath();ctx.fill()};
  // the trough: a plank box with water in it
  Q([[-18,-6],[0,-15],[18,-6],[0,3]],'#2a1a0c');Q([[-18,-6],[0,3],[0,8],[-18,-1]],'#6a4424');Q([[0,3],[18,-6],[18,-1],[0,8]],'#4a2e16');
  Q([[-15,-6],[0,-13.5],[15,-6],[0,1.5]],'#1e3a48');Q([[-11,-6],[0,-11.5],[6,-8.5],[-5,-3]],`rgba(140,200,220,${.18+Math.sin(t*1.7)*.06})`);
  ctx.strokeStyle='#3a2412';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-18,-3.5);ctx.lineTo(0,5.5);ctx.lineTo(18,-3.5);ctx.stroke();
  // the trestle behind the wheel
  R(9,-34,3,30,'#3a2412');Q([[9,-34],[12,-34],[16,-6],[13,-6]],'#3a2412');
  // the wheel: a thick stone disc, its rim catching the light, marks on its face that turn
  const cx=0,cy=-24,rx=10,ry=14;
  ctx.fillStyle='#3e3e44';ctx.beginPath();ctx.ellipse(cx+3,cy+1,rx,ry,0,0,7);ctx.fill();
  const gr=ctx.createLinearGradient(cx-rx,cy-ry,cx+rx,cy+ry);gr.addColorStop(0,'#a8a49a');gr.addColorStop(.55,'#7a766e');gr.addColorStop(1,'#4e4c48');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.fill();
  ctx.strokeStyle='rgba(30,28,26,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,rx-2.6,ry-3.6,0,0,7);ctx.stroke();
  for(let k=0;k<6;k++){const a=rot+k*1.047,c=Math.cos(a),s=Math.sin(a);ctx.fillStyle=k%2?'rgba(40,38,36,.55)':'rgba(230,224,210,.4)';ctx.fillRect(cx+c*(rx-4.6)-.5,cy+s*(ry-6)-.5,1.2,1.2)}
  ctx.strokeStyle='rgba(255,250,235,.45)';ctx.beginPath();ctx.ellipse(cx,cy,rx-.6,ry-.6,0,3.5,4.9);ctx.stroke();
  // wet where it dips into the water
  ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.clip();R(cx-rx,cy+ry-6,rx*2,6,'rgba(20,40,52,.45)');ctx.restore();
  // the trestle in front, the axle and the crank
  R(-13,-34,3,30,'#6a4424');Q([[-13,-34],[-10,-34],[-14,-6],[-17,-6]],'#7a5230');R(-13,-34,3,1,'#9a6a3a');
  R(-13,-26,26,3,'#5a3a1e');R(-13,-26,26,1,'#8a5a30');
  ctx.fillStyle='#24262c';ctx.beginPath();ctx.arc(cx,cy-1,2.4,0,7);ctx.fill();ctx.fillStyle='#8a8f9a';ctx.fillRect(cx-1,cy-2,1,1);
  R(cx,cy-2,17,2,'#2c2e34');const ca=rot*1.2,kx=17+Math.cos(ca)*5,ky=cy-1+Math.sin(ca)*5;ctx.strokeStyle='#3a3c44';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(17,cy-1);ctx.lineTo(kx,ky);ctx.stroke();R(kx-1.5,ky-5,3,6,'#7a5430');R(kx-1.5,ky-5,1,6,'#9a7448');
  if(fx>0){const q=ctx.createRadialGradient(cx-6,cy+8,1,cx-6,cy+8,18);q.addColorStop(0,`rgba(255,200,120,${.5*fx})`);q.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=q;ctx.fillRect(cx-26,cy-12,40,40)}
  ctx.restore();if(hov)label(sx,sy-52,'Schleifstein','#e8c878')}
function grindTick(dt){const m=G.map;if(!m||!m.world||!m.home)return;
  if(!m.home.objs.some(o=>o.type==='grind')&&m.home.objs.some(o=>o.type==='enchant')){const cx=HOX+22.5,cy=HOY+22.5,[x,y]=nearWalk(cx-4.8,cy+12.9);m.home.objs.push({type:'grind',x,y,name:'Schleifstein'});m.ac=null;owTick()}
  if(G.grindFx>0){G.grindFx=Math.max(0,G.grindFx-dt);const o=m.objs.find(q=>q.type==='grind');if(o&&Math.random()<dt*40)sparks(o.x-.2,o.y+.2,.6,-2.2+rnd(-.5,.5),2,['#ffffff','#ffe0a0','#ffb050'],5,.5)}
  const d=$('dialog');if(!d.hidden&&d.querySelector('[data-grind-root]')&&(!G.grindAt||G.state!=='play'||hyp(P.x-G.grindAt.x,P.y-G.grindAt.y)>.8))closeDialog()}
const _updForgeGr=updForge;updForge=function(dt){_updForgeGr(dt);if(P&&G.map&&G.state!=='title')grindTick(dt)};
const _drawObjG=drawObj;drawObj=function(o){if(o.type==='grind')return drawGrind(o);return _drawObjG(o)};
const _interactG=interact;interact=function(o){if(o&&o.type==='grind'){sample('chest',.3)||sfx('pick');openGrind();return}return _interactG(o)};
TALES.grind=['Der Schleifstein','Ein grauer Stein aus dem Bruch unter dem Hügel, im Trog darunter steht immer Wasser. Was eine Rune festhält, gibt er wieder her, ohne Kratzer an ihr. Nur die Worte, die Runen zusammen sprachen, hört man danach nicht mehr.'];
