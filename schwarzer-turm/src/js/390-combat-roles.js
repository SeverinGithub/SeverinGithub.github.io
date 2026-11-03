/* ---------- combat roles: shield bearers, healers, skirmishers · raging bosses · traps in the tower ---------- */
const ROLE={shield:'Schildträger',heal:'Heiler',kite:'Plänkler'};
const _makeEnemyC=makeEnemy;makeEnemy=function(vid,x,y,rank){const e=_makeEnemyC(vid,x,y,rank);if(e.boss||G.mlvl<3)return e;const r=Math.random();
  if((e.type==='skel'||e.type==='ghoul'||e.type==='scorp')&&r<.16)e.role='shield';
  else if(e.type==='cult'&&r<.35){e.role='heal';e.healT=rnd(1.5,3)}
  else if(e.type==='archer'&&r<.35)e.role='kite';
  if(e.role){e.sub=ROLE[e.role]+' · '+e.sub;if(e.role==='shield'){e.hp*=1.25;e.max=e.hp}}return e};
const tgtOf=e=>e.atgt&&!e.atgt.dead?e.atgt:P;
// a raised shield turns aside what comes from the front
const _hitEnemyC=hitEnemy;hitEnemy=function(e,dmg,o={}){if(e.role==='shield'&&!e.dead&&dmg>0&&!o.dot){const src=o.from!=null?o.from+Math.PI:Math.atan2(P.y-e.y,P.x-e.x);
  if(Math.abs(angDiff(src,e.face))<1.05&&!(e.stun>0)){dmg*=.2;sparks(e.x+Math.cos(e.face)*.35,e.y+Math.sin(e.face)*.35,.7,e.face,7,['#ffffff','#c8c0a8','#8a8478'],4);if(CFG.numbers&&Math.random()<.5)ftext(e.x,e.y-.2,'Geblockt','#c8c0a8');sample('hit',.2,{rate:1.6})||0;e.blockT=.25}}
  return _hitEnemyC(e,dmg,o)};
const _updEnemyC=updEnemy;updEnemy=function(e,dt){if(e.dead)return _updEnemyC(e,dt);
  e.stun=Math.max(0,(e.stun||0)-dt);e.blockT=Math.max(0,(e.blockT||0)-dt);const T=tgtOf(e),d=hyp(T.x-e.x,T.y-e.y);
  if(e.role==='heal'&&e.aggro){e.healT-=dt;if(e.healT<=0){e.healT=rnd(3.5,4.5);let w=null,wl=.92;for(const o of G.map.enemies){if(o.dead||o===e||hyp(o.x-e.x,o.y-e.y)>7)continue;const l=o.hp/o.max;if(l<wl){wl=l;w=o}}
    if(w){const h=w.max*(w.boss?.06:.28);w.hp=Math.min(w.max,w.hp+h);ftext(w.x,w.y-.3,'+'+Math.round(h),'#8fe36a');e.face=Math.atan2(w.y-e.y,w.x-e.x);e.lungeT=.22;
      for(let k=0;k<14;k++){const q=k/14;fxp({k:'mote',x:e.x+(w.x-e.x)*q,y:e.y+(w.y-e.y)*q,z:.8+Math.sin(q*3.14)*.5,vx:0,vy:0,vz:.4,life:.6,col:pick(['#8fe36a','#d8ffa0']),s:1.4,g:0})}flash(w.x,w.y,.8,26,'140,230,110',.3);sfx('cast')}}
    if(d<4.5&&e.cd>.4){const a=Math.atan2(e.y-T.y,e.x-T.x);moveEnt(e,Math.cos(a)*e.spd*.8*dt,Math.sin(a)*e.spd*.8*dt);e.anim+=dt*e.spd*.5;e.cd-=dt;return}}
  if(e.role==='kite'&&e.aggro&&d<3.8&&e.cd>.25&&e.charge<=0){e.kiteS=e.kiteS||(Math.random()<.5?1:-1);if(Math.random()<dt*.6)e.kiteS*=-1;const a=Math.atan2(e.y-T.y,e.x-T.x)+e.kiteS*.6;
    const ox=e.x,oy=e.y;moveEnt(e,Math.cos(a)*e.spd*1.25*dt,Math.sin(a)*e.spd*1.25*dt);if(hyp(e.x-ox,e.y-oy)<e.spd*dt*.3)e.kiteS*=-1;e.anim+=dt*e.spd*.7;e.face=Math.atan2(T.y-e.y,T.x-e.x);e.cd-=dt;return}
  if(e.boss)bossRage(e,dt,T);
  return _updEnemyC(e,dt)};
// phase two: the boss shakes you off, then adds a second rhythm of attacks
function bossRage(e,dt,T){const p2=e.hp<e.max*.5;if(p2&&!e.rageOn){e.rageOn=true;e.p2T=2.5;shock(e.x,e.y,4.5,'255,90,60',1,6);hitstop(.2);
    const d=hyp(P.x-e.x,P.y-e.y);if(d<3.5){const a=Math.atan2(P.y-e.y,P.x-e.x);for(let k=0;k<10;k++)moveEnt(P,Math.cos(a)*.18,Math.sin(a)*.18);hurtPlayer(e.dmg[0]*.6,null,e)}}
  if(!e.rageOn||!e.aggro)return;e.p2T-=dt;if(e.p2T>0||G.tele.some(t=>t.owner===e&&!t.done))return;e.p2T=rnd(5,7);const dm=()=>rnd(e.dmg[0],e.dmg[1]);
  const mv=pick(['ring','ring','adds','lines']);
  if(mv==='ring'){const n=7;for(let k=0;k<n;k++){const a=k/n*6.283+G.t,x=T.x+Math.cos(a)*2.4,y=T.y+Math.sin(a)*2.4;if(walkable(x,y))G.tele.push({shape:'circle',x,y,r:1.1,t:-k*.06,dur:1.1,dmg:dm()*.8,elem:'fire',owner:e})}
    G.tele.push({shape:'circle',x:T.x,y:T.y,r:1,t:-.5,dur:1.6,dmg:dm(),elem:'fire',owner:e})}
  else if(mv==='adds'&&G.map.enemies.filter(x=>!x.dead&&x.summoned).length<5){for(let k=0;k<2;k++){const a=Math.random()*7,x=e.x+Math.cos(a)*2,y=e.y+Math.sin(a)*2;if(!free(x,y,.35))continue;const m=makeEnemy(pick(['dunkelgebein','skel','ghoul']),x,y,'minion');m.aggro=true;m.summoned=true;m.xp*=.3;G.map.enemies.push(m);smoke(x,y,6,'rgba(80,20,10,',6,.5);burst(x,y,'#ff5a2a',10,2)}banner('','Die Tiefe antwortet','boss',1200)}
  else{const a0=Math.atan2(T.y-e.y,T.x-e.x);for(const s of[-.5,0,.5])G.tele.push({shape:'line',x:e.x,y:e.y,ang:a0+s,len:9,w:1.1,t:0,dur:.95,dmg:dm()*.9,owner:e})}}
const _drawEnemyC=drawEnemy;drawEnemy=function(e){
  if(e.rageOn&&!e.dead){const[sx,sy]=iso(e.x,e.y),a=.22+Math.sin(G.t*6)*.08;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy,0,sx,sy,60*e.scale/2);g.addColorStop(0,`rgba(255,60,20,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.translate(sx,sy);ctx.scale(1,.5);ctx.fillRect(-70,-70,140,140);ctx.restore()}
  _drawEnemyC(e);if(e.dead||!e.role)return;const[sx,sy]=iso(e.x,e.y),s=e.scale||1;
  if(e.role==='shield'){const[fx,fy]=scrDir(e.face);if(fy<-.2)return;const x=sx+fx*7*s,y=sy-14*s+fy*3*s,b=e.blockT>0;ctx.save();ctx.translate(x,y);ctx.scale(fx>=0?1:-1,1);
    ctx.fillStyle=b?'#e8e0c8':'#3a2a1a';ctx.beginPath();ctx.moveTo(-3.5*s,-6*s);ctx.lineTo(3.5*s,-6*s);ctx.lineTo(3.5*s,2*s);ctx.lineTo(0,6*s);ctx.lineTo(-3.5*s,2*s);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#8a8478';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#8a8478';ctx.fillRect(-.6*s,-5*s,1.2*s,9*s);ctx.restore()}
  else if(e.role==='heal'){const a=.4+Math.sin(G.t*4+e.anim)*.25;ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(140,230,110,${a})`;ctx.beginPath();ctx.arc(sx,sy-34*s,2.2,0,7);ctx.fill();ctx.restore()}
  else if(e.role==='kite'){ctx.fillStyle='rgba(200,190,160,.7)';ctx.fillRect(sx-4,sy-31*s,8,1)}};

// traps: spike plates you can see and step around, fire spouts in the walls that breathe on a rhythm
const _populateC=populate;populate=function(m){_populateC(m);if(m.kind!=='dungeon')return;m.traps=[];const f=m.floor||1;if(f<2)return;const prev=G.map;G.map=m;
  for(const r of m.rooms){if(r===m.startRoom||(m.boss&&r===m.endRoom)||Math.random()>.32)continue;
    if(Math.random()<.6){const n=rint(2,4);for(let k=0;k<n;k++){const x=Math.floor(r.x+rnd(1,r.w-1))+.5,y=Math.floor(r.y+rnd(1,r.h-1))+.5;if(free(x,y,.4)&&!m.traps.some(t=>hyp(t.x-x,t.y-y)<1.2))m.traps.push({k:'spike',x,y,t:0,st:0})}}
    else{const dir=pick([[1,0],[-1,0],[0,1],[0,-1]]),cx=r.cx+.5,cy=r.cy+.5;let x=cx,y=cy;for(let k=0;k<20&&free(x-dir[0],y-dir[1],.3);k++){x-=dir[0];y-=dir[1]}
      if(hyp(x-cx,y-cy)>2)m.traps.push({k:'jet',x,y,ang:Math.atan2(dir[1],dir[0]),len:Math.min(6,hyp(x-cx,y-cy)*2),t:rnd(0,3),per:rnd(3.2,4.4)})}}
  G.map=prev};
const trapDmg=()=>(6+G.mlvl*3)*DIFF[diff()].dmg;
function trapHitFoes(t){for(const e of G.map.enemies)if(!e.dead&&inShape(t,e.x,e.y,e.r))hitEnemy(e,t.dmg*1.5,{ally:true,col:'#ffb070'})}
function updTraps(dt){const m=G.map;if(!m||!m.traps||G.state!=='play')return;
  for(const t of m.traps){if(Math.abs(t.x-P.x)>14||Math.abs(t.y-P.y)>14)continue;
    if(t.k==='spike'){if(t.st===0){const on=hyp(P.x-t.x,P.y-t.y)<.5||G.map.enemies.some(e=>!e.dead&&hyp(e.x-t.x,e.y-t.y)<.45);if(on){t.st=1;t.t=0;sample('chest',.25,{rate:1.8})||0}}
      else if(t.st===1){t.t+=dt;if(t.t>=.45){t.st=2;t.t=0;const tl={shape:'circle',x:t.x,y:t.y,r:.62,t:0,dur:.01,dmg:trapDmg(),owner:null};G.tele.push(tl);trapHitFoes(tl);sparks(t.x,t.y,.3,-1.57,6,['#d8d0bc','#8a8478'],3)}}
      else{t.t+=dt;if(t.t>1.4){t.st=0;t.t=0}}}
    else{t.t+=dt;if(t.t>=t.per){t.t=0;const tl={shape:'line',x:t.x,y:t.y,ang:t.ang,len:t.len,w:.9,t:0,dur:.75,dmg:trapDmg()*1.2,elem:'fire',owner:null,jet:true};tl.onDone=()=>{trapHitFoes(tl);for(let k=0;k<18;k++){const q=Math.random()*t.len;fxp({k:'ember',x:t.x+Math.cos(t.ang)*q,y:t.y+Math.sin(t.ang)*q,z:rnd(.2,.8),vx:Math.cos(t.ang)*rnd(1,3),vy:Math.sin(t.ang)*rnd(1,3),vz:rnd(.5,2),life:rnd(.3,.6),col:pick(['#ffc070','#ff7a1a','#fff0b0']),s:rnd(1.5,3),g:-1})}addLight(t.x+Math.cos(t.ang)*t.len/2,t.y+Math.sin(t.ang)*t.len/2,160,.8,.4)};G.tele.push(tl)}}}}
function drawMapTraps(){const m=G.map;if(!m||!m.traps)return;for(const t of m.traps){const[sx,sy]=iso(t.x,t.y);if(sx<-40||sx>W+40||sy<-40||sy>H+40)continue;
  if(t.k==='spike'){ctx.fillStyle='#1c1a18';ctx.beginPath();ctx.moveTo(sx,sy-9);ctx.lineTo(sx+17,sy);ctx.lineTo(sx,sy+9);ctx.lineTo(sx-17,sy);ctx.closePath();ctx.fill();ctx.strokeStyle='#3e3a34';ctx.lineWidth=1;ctx.stroke();
    const up=t.st===2?Math.min(1,t.t/.06)*(t.t>1?Math.max(0,1-(t.t-1)/.4):1):t.st===1?.12:0;
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const x=sx+(i-j)*5,y=sy+(i+j)*2.5;ctx.fillStyle='#050403';ctx.fillRect(x-1,y-.5,2,1.2);if(up>0){ctx.fillStyle='#b8b0a0';ctx.beginPath();ctx.moveTo(x-1.2,y);ctx.lineTo(x,y-9*up);ctx.lineTo(x+1.2,y);ctx.fill()}}}
  else{const[fx,fy]=scrDir(t.ang),hot=t.t>t.per-.9;ctx.fillStyle='#24201c';ctx.fillRect(sx-5,sy-14,10,12);ctx.fillStyle=hot?`rgba(255,${120+Math.sin(G.t*30)*60|0},30,.95)`:'#4a2410';ctx.fillRect(sx-2.5+fx*3,sy-9+fy*2,5,4)}}}
const _drawExtGroundC=drawExtGround;drawExtGround=function(){_drawExtGroundC();drawMapTraps()};
