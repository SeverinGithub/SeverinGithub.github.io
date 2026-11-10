/* ---------- update ---------- */
function update(dt){
  G.t+=dt;const m=G.map;
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt*30);
  if(P.dead){G.deathT-=dt;if(G.deathT<=0)respawn();updateFx(dt);return}
  const d=P.d;
  P.iframe=Math.max(0,P.iframe-dt);P.hurt=Math.max(0,P.hurt-dt);P.flaskT=Math.max(0,P.flaskT-dt);P.chill=Math.max(0,(P.chill||0)-dt);P.whirl=Math.max(0,(P.whirl||0)-dt);
  for(const k in P.cds)P.cds[k]=Math.max(0,P.cds[k]-dt);
  if(P.heal>0){const h=Math.min(P.heal,dt*P.d.life*1.6);P.heal-=h;P.hp=Math.min(d.life,P.hp+h)}
  P.hp=Math.min(d.life,P.hp+d.regen*dt);P.mp=Math.min(d.mana,P.mp+(1+d.mana*.02+(d.mregen||0))*dt);
  if(P.poisonT>0){P.poisonT-=dt;P.hp-=P.poisonD*dt;if(Math.random()<dt*8)fxp({k:'mote',x:P.x+rnd(-.3,.3),y:P.y+rnd(-.3,.3),z:rnd(.4,1.4),vz:.5,life:.8,col:'#9ae050',s:.9,g:0});if(P.hp<=0&&!P.dead){P.hp=0;die();return}}
  P.stDelay-=dt;if(P.stDelay<=0)P.st=Math.min(d.stam,P.st+d.stam*.45*dt);
  if(P.wardT>0){P.wardT-=dt;if(P.wardT<=0)P.ward=0}
  const spd=4.2*(1+d.frw/100)*(P.chill>0?.65:1)*(P.flaskT>0?.4:1)*floorSpd();
  let moving=false;
  if(P.whirl>0)slashFx(P.x,P.y,G.t*22,1.5,1.9,'235,225,205',.12,.6,.38);
  if(P.leap){moving=true}
  else if(P.roll>0){P.roll-=dt;moveEnt(P,Math.cos(P.rollA)*8.5*dt,Math.sin(P.rollA)*8.5*dt);moving=true;if(Math.random()<.5)P.ghosts.push({x:P.x,y:P.y,face:P.rollA,t:.12});if(Math.random()<.4)smoke(P.x,P.y,1,'rgba(90,78,62,',4,.2)}
  else if(P.dash){const st=Math.min(P.dash.left,16*dt),ox=P.x,oy=P.y;moveEnt(P,Math.cos(P.dash.ang)*st,Math.sin(P.dash.ang)*st);P.dash.left-=st;P.ghosts.push({x:P.x,y:P.y,face:P.dash.ang,t:0});if(Math.random()<.6)smoke(P.x,P.y,1,'rgba(90,78,62,',5,.3);
    const hitE=m.enemies.find(e=>!e.dead&&hyp(e.x-P.x,e.y-P.y)<e.r+.5);
    if(P.dash.left<=0||hitE||(hyp(P.x-ox,P.y-oy)<st*.3)){for(const e of m.enemies)if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<1.7+e.r)weaponHit(e,1.5+P.dash.l*.2);slamFx(P.x,P.y,1.8,false);kick(P.dash.ang,6);hitstop(.1);sfx('boom');P.dash=null;P.iframe=.15}}
  else if(P.cast>0)P.cast-=dt;
  else if(P.atkT>0){P.atkT-=dt;if(!P.hitDone&&P.atkT<P.atkDur*.55){P.hitDone=true;resolveSwing()}}
  else if((P.standAtk!=null&&mouse.down)||(mouse.mid&&!P.target)){const[wx,wy]=scr2w(mouse.x,mouse.y);startAttack(Math.atan2(wy-P.y,wx-P.x))}
  else{
    if(P.target){const e=P.target;if(e.dead){P.target=null}else{const dd=hyp(e.x-P.x,e.y-P.y);if(dd<=P.d.reach+e.r){P.path=[];if(startAttack(Math.atan2(e.y-P.y,e.x-P.x))&&!mouse.down&&!mouse.mid)P.target=null}else{P.repath-=dt;if(P.repath<=0){P.repath=.25;P.path=los(P.x,P.y,e.x,e.y,P.r)?[[e.x,e.y]]:(findPath(P.x,P.y,e.x,e.y)||[])}}}}
    else if(mouse.down&&!P.interact&&!P.pickup){P.repath-=dt;if(P.repath<=0){P.repath=.12;setMove()}}
    if(P.interact&&hyp(P.interact.x-P.x,P.interact.y-P.y)<(P.interact.type==='colossus'?2.2:1.4)){const o=P.interact;P.interact=null;P.path=[];interact(o)}
    if(P.pickup&&hyp(P.pickup.x-P.x,P.pickup.y-P.y)<.9){const gi=P.pickup;P.pickup=null;P.path=[];pickup(gi)}
    if(P.path.length){const[tx,ty]=P.path[0],dx=tx-P.x,dy=ty-P.y,dd=hyp(dx,dy),st=spd*dt;
      if(P.target&&hyp(P.target.x-P.x,P.target.y-P.y)<=P.d.reach+P.target.r){P.path=[]}
      else if(dd<=st){P.x=tx;P.y=ty;P.path.shift()}else{P.face=Math.atan2(dy,dx);const ox=P.x,oy=P.y;moveEnt(P,dx/dd*st,dy/dd*st);moving=true;if(hyp(P.x-ox,P.y-oy)<st*.1)P.path.shift()}}
  }
  if(moving)P.anim+=dt*(P.roll>0?0:1);
  // footsteps loop while walking; heartbeat loops below 30% life
  if(moving&&!P.roll&&!P.dash){if(!G.stepS)G.stepS=sample('step',.32,{loop:true,rate:1})}else if(G.stepS)G.stepS=stopLoop(G.stepS,120);
  {const low=P.hp<P.d.life*.3;if(low&&!G.heartS)G.heartS=sample('heart',.65,{loop:true,rate:1});else if(!low&&G.heartS)G.heartS=stopLoop(G.heartS,600)}
  P.moving=moving;
  // explore
  const ei=Math.floor(P.x),ej=Math.floor(P.y);for(let j=ej-12;j<=ej+12;j++)for(let i=ei-12;i<=ei+12;i++)if(i>=0&&j>=0&&i<m.w&&j<m.h&&(i-ei)**2+(j-ej)**2<144)m.explored[j*m.w+i]=1;
  // glutmal
  if(G.glutmal&&G.glutmal.floor===G.floor&&hyp(G.glutmal.x-P.x,G.glutmal.y-P.y)<.9){P.glut+=G.glutmal.amt;ftext(P.x,P.y,'+'+G.glutmal.amt+' Glut zurückgewonnen','#ff9a3a',true);sfx('unique');G.glutmal=null;save()}
  // enemies
  G.flowT-=dt;if(G.flowT<=0){G.flowT=.3;computeFlow()}
  for(const e of m.enemies)if(!e.dead)updEnemy(e,dt);
  sepEnemies(m.enemies);
  for(const a of m.enemies){if(a.dead)continue;const dx=a.x-P.x,dy=a.y-P.y,dd=hyp(dx,dy),mn=a.r+P.r;if(dd<mn&&dd>.001&&!P.roll&&!P.dash)moveEnt(a,dx/dd*(mn-dd),dy/dd*(mn-dd))}
  if(m.enemies.length>140)m.enemies=m.enemies.filter(e=>!e.dead);
  // telegraphs
  for(const t of G.tele){t.t+=dt;if(t.follow&&t.owner){t.x=t.owner.x;t.y=t.owner.y}
    if(t.t>=t.dur){t.done=true;if(t.owner&&t.owner.dead)continue;if(inShape(t,P.x,P.y,P.r))hurtPlayer(t.dmg,t.elem,t.owner);allyTele(t);t.onDone&&t.onDone();const ow=t.owner;if(ow)ow.lungeT=.22;
      if(t.meteor){boom(t.x,t.y,1.1,'fire');sfx('boom')}else if(t.shape==='circle'){if(t.r>1.5)sfx('boom');t.elem==='fire'?boom(t.x,t.y,t.r/1.6,'fire'):slamFx(t.x,t.y,t.r,t.r>2.5)}
      else if(t.shape==='cone')slashFx(t.x,t.y,t.ang,t.arc,t.r*.85,t.elem==='fire'?'255,140,60':t.elem==='frost'?'160,215,255':'255,232,210',.2,.7*(ow?ow.scale:1),.45)}}
  G.tele=G.tele.filter(t=>!t.done&&!(t.owner&&t.owner.dead));
  // projectiles
  for(const p of G.proj){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    if(!walkable(p.x,p.y)){p.life=0;if(p.aoe)explode(p);else if(p.kind==='arrow')sparks(p.x,p.y,.5,Math.atan2(-p.vy,-p.vx),5,['#ffffff','#d8d0bc'],3);else boom(p.x,p.y,.35,p.kind==='glut'?'fire':p.kind)}
    else if(p.owner==='p'){for(const e of m.enemies){if(e.dead)continue;if(hyp(e.x-p.x,e.y-p.y)<e.r+p.r){if(p.aoe){p.life=0;explode(p);break}if(p.hit&&p.hit.has(e))continue;
      const cr=Math.random()*100<P.d.crit+(P.shadowT>0?P.shadowB:0);hitEnemy(e,p.dmg*rnd(.9,1.1)*(cr?1.9:1),{crit:cr,kb:p.big?.4:.12,from:Math.atan2(p.vy,p.vx),col:p.col,slow:p.slow});if(p.onHit)p.onHit(e,p);sparks(p.x,p.y,.6,Math.atan2(-p.vy,-p.vx),5,['#ffffff','#e8e0c8'],3);if(P.d.ls>0)P.hp=Math.min(P.d.life,P.hp+p.dmg*P.d.ls/200);
      if(p.pierce)(p.hit=p.hit||new Set()).add(e);else{p.life=0;break}}}}
    else if(allyProjHit(p)){}
    else if(hyp(P.x-p.x,P.y-p.y)<P.r+p.r&&!P.iframe&&!P.dash){p.life=0;hurtPlayer(p.dmg,p.kind==='arrow'?null:p.kind,{x:p.x-p.vx,y:p.y-p.vy});if(p.kind!=='arrow')boom(p.x,p.y,.45,p.kind==='glut'?'fire':p.kind)}
    if(p.kind==='glut'||p.kind==='fire'){fxp({k:'ember',x:p.x,y:p.y,z:.55+rnd(-.1,.1),vx:rnd(-.6,.6),vy:rnd(-.6,.6),vz:rnd(.3,1.2),life:rnd(.25,.5),col:pick(['#ffc070','#ff9a30','#e0661a']),s:rnd(1,2),g:-1});if(Math.random()<.35)smoke(p.x,p.y,1,'rgba(40,30,24,',4,.8)}
    else if(p.kind==='poison')fxp({k:'mote',x:p.x,y:p.y,z:.55,vx:rnd(-.5,.5),vy:rnd(-.5,.5),vz:rnd(-.3,.3),life:.4,col:pick(['#9ae050','#d8ff9a']),s:rnd(.8,1.4),g:0});
    else if(p.kind==='frost')fxp({k:'shard',x:p.x,y:p.y,z:.55,vx:rnd(-.8,.8),vy:rnd(-.8,.8),vz:rnd(-.5,.5),life:.3,col:pick(['#ffffff','#a8d0ff']),s:rnd(1,2),rot:rnd(0,6),g:0})}
  G.proj=G.proj.filter(p=>p.life>0);
  for(const r of G.rings){r.r+=r.v*dt;if(r.dmg>0)for(const e of m.enemies){if(e.dead||r.hit.has(e))continue;if(Math.abs(hyp(e.x-r.x,e.y-r.y)-r.r)<.5+e.r){r.hit.add(e);hitEnemy(e,r.dmg*rnd(.85,1.15),{col:r.hcol||'#cfe8ff',slow:r.slow});if(r.onHit)r.onHit(e)}}}
  G.rings=G.rings.filter(r=>r.r<r.max);
  for(const b of G.bolts)b.t-=dt;G.bolts=G.bolts.filter(b=>b.t>0);
  for(const gi of m.items)gi.t+=dt;
  if(G.clickFx){G.clickFx.t-=dt;if(G.clickFx.t<=0)G.clickFx=null}
  if(m.world){owTick();if(G.state==='play')G.mlvl=Math.max(1,lvlAt(P.x,P.y))}
  questTick(dt);updExt(dt);updAllies(dt);updWorld(dt);updEnd(dt);updTraps(dt);updComfort(dt);storyTick(dt);updMusicLayers();updDeaths(dt);updForge(dt);updTouch(dt);npcTick(dt);rgTick(dt);mpTick(dt);
  // walking away from a bonfire, trader or stash shuts every window at once
  if(G.openAt&&hyp(P.x-G.openAt.x,P.y-G.openAt.y)>.6){G.openAt=null;closeDialog();for(const p of['pShop','pStash','pInv','pChar','pSkill','pColl'])$(p).hidden=true;hideTip()}
  if(G.statueT>0)G.statueT-=dt;ambient(dt);updateFx(dt);
  // boss intro
  for(const e of m.enemies)if(e.boss&&!e.dead&&!G.bossSeen[e.wb||G.floor]&&hyp(e.x-P.x,e.y-P.y)<11){G.bossSeen[e.wb||G.floor]=true;banner(e.name.toUpperCase(),e.wb?(e.bsub||'Herr der Himmelsinseln'):'Hüter der Tiefe','boss',3000);e.aggro=true}
}
// foes push each other apart; a grid of cells twice the widest body keeps this cheap when hundreds crowd in
function sepEnemies(L){const A=[];let mr=.1;for(let i=0;i<L.length;i++){const e=L[i];if(!e.dead){A.push(i);if(e.r>mr)mr=e.r}}
  const cs=mr*2,cells=new Map(),key=(cx,cy)=>(cx+32768)*65536+cy+32768;
  for(const i of A){const e=L[i],k=key(Math.floor(e.x/cs),Math.floor(e.y/cs));let b=cells.get(k);if(!b)cells.set(k,b=[]);b.push(i)}
  for(const i of A){const a=L[i],cx=Math.floor(a.x/cs),cy=Math.floor(a.y/cs);
    for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const b=cells.get(key(cx+ox,cy+oy));if(!b)continue;
      for(const j of b){if(j<=i)continue;const c=L[j],dx=c.x-a.x,dy=c.y-a.y,dd=hyp(dx,dy),mn=a.r+c.r;if(dd<mn&&dd>.001){const p=(mn-dd)/2;moveEnt(a,-dx/dd*p,-dy/dd*p);moveEnt(c,dx/dd*p,dy/dd*p)}}}}}
function explode(p){if(p.owner!=='p'||!p.aoe)return;sfx('boom');boom(p.x,p.y,p.aoe/1.3,p.boomE||'fire');if(p.onBoom)p.onBoom(p);
  for(const e of G.map.enemies){if(e.dead)continue;if(hyp(e.x-p.x,e.y-p.y)<p.aoe+e.r)hitEnemy(e,p.dmg*rnd(.85,1.15),{col:p.col||'#ffb070'})}}
function inShape(t,x,y,r){
  const dx=x-t.x,dy=y-t.y,d=hyp(dx,dy);
  if(t.shape==='circle')return d<t.r+r*.5;
  if(t.shape==='cone')return d<t.r+r*.5&&(d<.4||Math.abs(angDiff(Math.atan2(dy,dx),t.ang))<t.arc/2);
  if(t.shape==='line'){const c=Math.cos(t.ang),s=Math.sin(t.ang),along=dx*c+dy*s,perp=-dx*s+dy*c;return along>-.3&&along<t.len&&Math.abs(perp)<t.w/2+r*.5}return false}
function updEnemy(e,dt){
  if(e.dotT>0&&!e.dead){e.dotT-=dt;e.hp-=e.dotD*dt*e.dmgTaken;if(Math.random()<dt*6)fxp({k:'mote',x:e.x+rnd(-.2,.2),y:e.y+rnd(-.2,.2),z:.8,vx:0,vy:0,vz:.5,life:.5,col:'#9ae050',s:1,g:0});if(e.hp<=0){killEnemy(e);return}}
  e.flash=Math.max(0,e.flash-dt);e.slow=Math.max(0,e.slow-dt);e.hitT=Math.max(0,(e.hitT||0)-dt);e.lungeT=Math.max(0,(e.lungeT||0)-dt);
  if(e.kvx||e.kvy){moveEnt(e,e.kvx*dt,e.kvy*dt);const dm=Math.pow(.002,dt);e.kvx*=dm;e.kvy*=dm;if(Math.abs(e.kvx)+Math.abs(e.kvy)<.05)e.kvx=e.kvy=0}
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy),sp=e.spd*(e.slow>0?.5:1);
  // in the shadow after a shadow step the huntress is gone for anyone not close enough to touch her; bosses are not fooled
  if(P.veilT>0&&!e.boss&&d>1.4){if(e.aggro){e.aggro=false;e.charge=0;if(CFG.numbers)ftext(e.x,e.y-.3,'?','#b8b0d8')}e.anim+=dt*.3;return}
  if(!e.aggro&&d<(e.boss?9:7.5)&&eLos(e,0)){e.aggro=true;voice(e);if(e.pack)for(const p of e.pack)p.aggro=true}
  if(!e.aggro){e.anim+=dt*.3;return}
  if(d>26){e.aggro=false;return}
  e.cd-=dt;
  const busy=G.tele.some(t=>t.owner===e&&!t.done);
  if(e.boss){bossUpdate(e,dt,d,busy,sp);return}
  if(busy)return;
  if(e.charge>0){e.charge-=dt;if(e.charge<=0){fireProj(e)}return}
  const k=e.d.kind;
  if(k==='melee'){
    if(d<=e.d.range+e.r+P.r*.5&&e.cd<=0){e.face=Math.atan2(dy,dx);const dmg=rnd(e.dmg[0],e.dmg[1]);
      if(e.type==='golem')G.tele.push({shape:'circle',x:e.x,y:e.y,r:1.9*Math.sqrt(e.scale/1.5),t:0,dur:e.d.wind,dmg,owner:e,follow:true,elem:e.elem});
      else G.tele.push({shape:'cone',x:e.x,y:e.y,ang:e.face,arc:1.8,r:e.d.range+e.r+.45,t:0,dur:e.d.wind*(e.aff.includes('schnell')?.75:1),dmg,owner:e,follow:true,elem:e.elem||(e.aff.includes('kalt')?'frost':e.aff.includes('feuer')?'fire':null)});
      voice(e,.3);e.cd=e.d.cd+e.d.wind;return}
    if(d>e.d.range+e.r)chase(e,sp,dt,d)}
  else{
    const can=d<=e.d.range&&eLos(e,.1);
    if(can&&e.cd<=0){e.face=Math.atan2(dy,dx);e.charge=e.d.wind;e.cd=e.d.cd+e.d.wind;return}
    if(!can)chase(e,sp,dt,d);else if(d<3){const a=Math.atan2(-dy,-dx);moveEnt(e,Math.cos(a)*sp*.7*dt,Math.sin(a)*sp*.7*dt);e.anim+=dt*sp*.6;e.face=Math.atan2(dy,dx)}else e.face=Math.atan2(dy,dx)}}
function chase(e,sp,dt,d){
  let tx=P.x,ty=P.y;if(d>1.5&&!eLos(e,e.r*.8)){const f=flowDir(e);if(!f)return;[tx,ty]=f}
  const a=Math.atan2(ty-e.y,tx-e.x);e.face=a;moveEnt(e,Math.cos(a)*sp*dt,Math.sin(a)*sp*dt);e.anim+=dt*sp*.6}
function fireProj(e){const k=e.proj||e.d.proj;if(k==='fire')sample('fire',.3);else if(k==='arrow')voice(e,.25);
  const a=Math.atan2(P.y-e.y,P.x-e.x),sp=k==='arrow'?11:k==='frost'?6.5:7.5;const dmg=rnd(e.dmg[0],e.dmg[1]);
  const shots=e.rank==='unique'||e.rank==='champ'?3:1;
  for(let s=0;s<shots;s++){const aa=a+(s-(shots-1)/2)*.22;G.proj.push({x:e.x+Math.cos(aa)*.4,y:e.y+Math.sin(aa)*.4,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,owner:'e',dmg,kind:k,r:.25,life:2})}}
function bossUpdate(e,dt,d,busy,sp){
  const p2=e.hp<e.max*.5,f=p2?.72:1;
  if(p2&&!e.p2){e.p2=true;banner(e.name.toUpperCase(),'erhebt sich in Raserei','boss',2000);G.shake=10;sfx('boom')}
  if(busy)return;
  if(e.cd>0||d>9){if(d>2.2)chase(e,sp*(p2?1.25:1),dt,d);return}
  const a=Math.atan2(P.y-e.y,P.x-e.x);e.face=a;
  let opts=e.d.moves.filter(m=>(m!=='slam'||d<3.6)&&(m!=='sweep'||d<4.6)&&(m!=='summon'||G.map.enemies.filter(x=>!x.dead&&x.summoned).length<6));
  if(!opts.length){chase(e,sp,dt,d);return}
  const mv=pick(opts),[a0,a1]=e.dmg,dmg=()=>rnd(a0,a1);let dur=.9;
  if(mv==='slam'){dur=.95*f;G.tele.push({shape:'circle',x:e.x,y:e.y,r:2.9,t:0,dur,dmg:dmg()*1.6,owner:e});if(p2)G.tele.push({shape:'circle',x:e.x,y:e.y,r:4.8,t:-.45,dur:dur+.9,dmg:dmg()*1.1,owner:e})}
  if(mv==='sweep'){dur=.75*f;G.tele.push({shape:'cone',x:e.x,y:e.y,ang:a,arc:2.7,r:3.8,t:0,dur,dmg:dmg()*1.3,owner:e,follow:true})}
  if(mv==='charge'){dur=.85*f;const t={shape:'line',x:e.x,y:e.y,ang:a,len:9,w:1.7,t:0,dur,dmg:dmg()*1.4,owner:e};t.onDone=()=>{for(let k=0;k<45;k++){const nx=e.x+Math.cos(t.ang)*.2,ny=e.y+Math.sin(t.ang)*.2;if(!free(nx,ny,e.r*.7))break;e.x=nx;e.y=ny;if(k%3===0)burst(e.x,e.y,'#9a9a9a',2,2,.2)}G.shake=8;sfx('boom')};G.tele.push(t)}
  if(mv==='nova'){dur=.8*f;const n=p2?22:14;G.tele.push({shape:'circle',x:e.x,y:e.y,r:1.4,t:0,dur,dmg:dmg(),elem:'fire',owner:e,onDone:()=>{for(let k=0;k<n;k++){const aa=k/n*Math.PI*2;G.proj.push({x:e.x,y:e.y,vx:Math.cos(aa)*5,vy:Math.sin(aa)*5,owner:'e',dmg:dmg()*.8,kind:'fire',r:.3,life:2.4})}sfx('boom')}})}
  if(mv==='meteor'){dur=1.3*f;const n=p2?6:3;for(let k=0;k<n;k++){const ox=k?rnd(-2.5,2.5):0,oy=k?rnd(-2.5,2.5):0;G.tele.push({shape:'circle',x:P.x+ox,y:P.y+oy,r:1.6,t:-k*.12,dur,dmg:dmg()*1.3,elem:'fire',owner:e,meteor:true})}}
  if(mv==='summon'){dur=.6;for(let k=0;k<3;k++){const aa=Math.random()*7,x=e.x+Math.cos(aa)*1.6,y=e.y+Math.sin(aa)*1.6;if(free(x,y,.3)){const m=makeEnemy(pick(e.sumP||['spider','skel']),x,y);m.aggro=true;m.summoned=true;m.xp*=.3;G.map.enemies.push(m);burst(x,y,'#ff7a2a',10,2)}}}
  e.cd=dur+rnd(.6,1.3)*f}

