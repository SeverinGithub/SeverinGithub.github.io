/* ---------- combat fx: hit-stop, camera kick, particles, decals, light ---------- */
function hitstop(t){if(CFG.hitstop)G.hitstop=Math.max(G.hitstop||0,t)}
function kick(a,s){const[dx,dy]=scrDir(a);G.kx=(G.kx||0)+dx*s;G.ky=(G.ky||0)+dy*s}
function addLight(x,y,r,a,life){G.lights.push({x,y,r,a,life,t:0})}
function decal(k,x,y,s=1,life=40){const m=G.map;if(!m)return;(m.decals||(m.decals=[])).push({k,x,y,s,rot:rnd(0,6.28),t:0,life,seed:Math.random()*1e4|0});if(m.decals.length>160)m.decals.shift()}
function fxp(o){if(G.fx.length<900)G.fx.push(Object.assign({x:0,y:0,z:.5,vx:0,vy:0,vz:0,life:.5,t:0,col:'#fff',s:2,k:'dot',g:7},o))}
const GORE={bone:{k:'bone',cols:['#e4dac0','#b8ac8c','#7a6e54']},rock:{k:'rock',cols:['#4a4a52','#70707a','#2c2c32']},mote:{k:'mote',cols:['#c0d8f8','#ffffff','#7a9ac8']},
  ichor:{k:'blood',cols:['#3a5a10','#6a8a20','#24360a']},blood:{k:'blood',cols:['#7a0a06','#a3201a','#4a0404']},ember:{k:'ember',cols:['#ff9a30','#ffc070','#e0661a']}};
const goreOf=e=>{const l=e.look||e.type;if(l==='scorp')return GORE.ichor;return GORE[l==='skel'||l==='archer'?'bone':l==='golem'||l==='warden'?'rock':l==='wraith'?'mote':l==='spider'?'ichor':l==='weaver'?'ember':'blood']};
function sparks(x,y,z,ang,n,cols,sp=6,spread=1.1){for(let k=0;k<n;k++){const a=ang+rnd(-spread,spread),v=sp*rnd(.35,1);fxp({k:'spark',x,y,z,vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:rnd(-1,4),life:rnd(.12,.32),col:pick(cols),s:rnd(.8,1.6),g:5})}}
function gore(x,y,ang,n,g,z=.7){for(let k=0;k<n;k++){const a=ang+rnd(-.9,.9),v=rnd(1,4.5);fxp({k:g.k,x,y,z:z*rnd(.6,1.2),vx:Math.cos(a)*v,vy:Math.sin(a)*v,vz:rnd(1,4.5),life:g.k==='mote'||g.k==='ember'?rnd(.5,1.1):rnd(.7,1.6),col:pick(g.cols),s:rnd(1.1,2.6),g:g.k==='mote'||g.k==='ember'?-1.5:10,rot:rnd(0,6),vr:rnd(-14,14)})}}
function smoke(x,y,n,col='rgba(60,52,44,',sz=6,up=.6){for(let k=0;k<n;k++){const a=rnd(0,6.28);fxp({k:'smoke',x:x+Math.cos(a)*rnd(0,.3),y:y+Math.sin(a)*rnd(0,.3),z:rnd(0,.3),vx:Math.cos(a)*rnd(.2,1.2),vy:Math.sin(a)*rnd(.2,1.2),vz:up,life:rnd(.5,1.1),col,s:sz*rnd(.7,1.3),g:0})}}
function shock(x,y,r,col,life=.4,w=3){fxp({k:'shock',x,y,z:0,life,col,s:r,w,g:0})}
function flash(x,y,z,r,col,life=.18){fxp({k:'flash',x,y,z,life,col,s:r,g:0})}
function slashFx(x,y,ang,arc,rad,col,life=.16,z=.75,w=.38){fxp({k:'slash',x,y,z,ang,arc,rad,col,life,w,g:0})}
// explosions and impacts
function boom(x,y,sc=1,elem='fire'){
  const fire=elem==='fire',poi=elem==='poison',cols=fire?['#fff4d0','#ffc070','#ff9a30','#e0661a']:poi?['#f0ffd0','#c8f878','#8ae050','#4a8a2a']:['#ffffff','#e0fff8','#a8d0ff','#6ad0ff'];
  flash(x,y,.4,60*sc,fire?'255,190,90':poi?'170,240,110':'180,230,255',.22);fxp({k:'fireball',x,y,z:.35,life:.42,s:24*sc,col:fire?'fire':poi?'poison':'frost',g:0});
  shock(x,y,1.6*sc,fire?'255,150,60':poi?'150,230,90':'170,220,255',.38,3);sparks(x,y,.4,0,Math.round(22*sc),cols,7*sc,3.2);
  if(fire){gore(x,y,0,Math.round(10*sc),GORE.ember,.4);smoke(x,y,Math.round(6*sc),'rgba(40,30,24,',9*sc,.9);decal('scorch',x,y,sc)}
  else{for(let k=0;k<16*sc;k++){const a=k/(16*sc)*6.283;fxp({k:'shard',x,y,z:.3,vx:Math.cos(a)*rnd(3,6),vy:Math.sin(a)*rnd(3,6),vz:rnd(1,3),life:rnd(.3,.6),col:pick(cols),s:rnd(2,3.4),rot:a,g:6})}decal(poi?'ichor':'frost',x,y,sc)}
  gore(x,y,0,Math.round(5*sc),GORE.rock,.2);addLight(x,y,240*sc,.95,.5);G.shake=Math.max(G.shake,4*sc);hitstop(.04*sc)}
function slamFx(x,y,r,big){shock(x,y,r,'236,220,190',.45,4);if(big)shock(x,y,r*1.4,'200,170,120',.65,2);smoke(x,y,big?14:8,'rgba(90,78,62,',big?10:7,.4);
  gore(x,y,0,big?16:9,GORE.rock,.15);for(let k=0;k<(big?10:5);k++){const a=rnd(0,6.28);fxp({k:'rock',x:x+Math.cos(a)*r*.6,y:y+Math.sin(a)*r*.6,z:0,vx:Math.cos(a)*2,vy:Math.sin(a)*2,vz:rnd(3,6),life:rnd(.6,1),col:pick(GORE.rock.cols),s:rnd(2,3.5),g:12,rot:0,vr:rnd(-10,10)})}
  decal('crack',x,y,r/1.6);G.shake=Math.max(G.shake,big?11:6);hitstop(big?.12:.06);addLight(x,y,160,.5,.3)}
function updateFx(dt){
  for(const f of G.fx){f.t+=dt;if(f.k==='dot'){f.x+=f.vx*dt*.3;f.y+=f.vy*dt*.3;f.z+=f.vz*dt*.3;f.vz-=6*dt;if(f.z<0){f.z=0;f.vz*=-.3}continue}
    f.x+=f.vx*dt;f.y+=f.vy*dt;f.z+=f.vz*dt;f.vz-=f.g*dt;if(f.vr)f.rot+=f.vr*dt;
    if(f.k==='spark'){f.vx*=.9;f.vy*=.9}else if(f.k==='smoke'){f.vx*=.95;f.vy*=.95}
    if(f.z<0&&f.g>0){f.z=0;if(f.k==='drip'){shock(f.x,f.y,.22,'170,200,230',.5,1);f.t=f.life}else if(f.k==='blood'){if(Math.random()<.25)decal('drop',f.x,f.y,rnd(.4,.9),25);f.t=f.life}else{f.vz*=-.35;f.vx*=.55;f.vy*=.55;f.vr*=.5;if(Math.abs(f.vz)<.6)f.vz=0}}}
  G.fx=G.fx.filter(f=>f.t<f.life);
  for(const L of G.lights)L.t+=dt;G.lights=G.lights.filter(L=>L.t<L.life);
  for(const t of G.texts){t.t+=dt;t.z+=dt*(t.big?1.1:.9);t.x+=(t.vx||0)*dt}G.texts=G.texts.filter(t=>t.t<1);
  if(P.trail){for(const q of P.trail)q.t+=dt;P.trail=P.trail.filter(q=>q.t<.14)}
  if(P.ghosts){for(const q of P.ghosts)q.t+=dt;P.ghosts=P.ghosts.filter(q=>q.t<.3)}
  const m=G.map;if(m&&m.decals){for(const d of m.decals)d.t+=dt;m.decals=m.decals.filter(d=>d.t<d.life)}
  for(const e of m?m.enemies:[])if(e.dead)e.dieT=(e.dieT||0)+dt;
  G.kx=(G.kx||0)*Math.pow(.0005,dt);G.ky=(G.ky||0)*Math.pow(.0005,dt)}
// decals sit on the floor under everything
function drawDecals(){const m=G.map;if(!m.decals)return;
  for(const d of m.decals){const[sx,sy]=iso(d.x,d.y);if(sx<-80||sx>W+80||sy<-50||sy>H+50)continue;const a=Math.min(1,(d.life-d.t)/4),R2=mulberry(d.seed);ctx.save();ctx.translate(sx,sy);ctx.scale(1,.5);ctx.globalAlpha=a;
    if(d.k==='blood'||d.k==='drop'||d.k==='ichor'){ctx.fillStyle=d.k==='ichor'?'rgba(40,60,10,.8)':'rgba(70,6,4,.82)';const n=d.k==='drop'?1:6;for(let k=0;k<n;k++){const r=(d.k==='drop'?3:7+R2()*9)*d.s,ox=d.k==='drop'?0:(R2()-.5)*20*d.s,oy=d.k==='drop'?0:(R2()-.5)*20*d.s;ctx.beginPath();ctx.arc(ox,oy,r,0,7);ctx.fill()}}
    else if(d.k==='scorch'){const g=ctx.createRadialGradient(0,0,0,0,0,46*d.s);g.addColorStop(0,'rgba(8,4,2,.85)');g.addColorStop(.6,'rgba(20,10,4,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,46*d.s,0,7);ctx.fill();
      if(d.t<3){ctx.globalAlpha=a*(1-d.t/3);ctx.fillStyle='#ff6a1a';for(let k=0;k<7;k++){ctx.fillRect((R2()-.5)*50*d.s,(R2()-.5)*50*d.s,2,2)}}}
    else if(d.k==='frost'){const g=ctx.createRadialGradient(0,0,0,0,0,52*d.s);g.addColorStop(0,'rgba(200,236,255,.55)');g.addColorStop(.7,'rgba(120,180,230,.25)');g.addColorStop(1,'rgba(120,180,230,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,52*d.s,0,7);ctx.fill();
      ctx.strokeStyle='rgba(230,248,255,.6)';ctx.lineWidth=1;for(let k=0;k<7;k++){const an=R2()*6.28;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*30*d.s,Math.sin(an)*30*d.s);ctx.lineTo(Math.cos(an+.3)*44*d.s,Math.sin(an+.3)*44*d.s);ctx.stroke()}}
    else if(d.k==='crack'){ctx.strokeStyle='rgba(6,4,2,.85)';ctx.lineWidth=2;for(let k=0;k<9;k++){let x=0,y=0,an=R2()*6.28;ctx.beginPath();ctx.moveTo(0,0);for(let s2=0;s2<4;s2++){an+=(R2()-.5)*.9;x+=Math.cos(an)*12*d.s;y+=Math.sin(an)*12*d.s;ctx.lineTo(x,y)}ctx.stroke()}
      const g=ctx.createRadialGradient(0,0,0,0,0,30*d.s);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,30*d.s,0,7);ctx.fill()}
    ctx.restore()}}
// solid particles in the world pass
function drawFxWorld(){
  for(const f of G.fx){const[sx,sy0]=iso(f.x,f.y),sy=sy0-f.z*30,a=1-f.t/f.life;if(sx<-60||sx>W+60||sy<-80||sy>H+60)continue;
    if(f.k==='dot'){ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.fillRect(sx-f.s/2,sy-f.s/2,f.s,f.s)}
    else if(f.k==='blood'){ctx.globalAlpha=Math.min(1,a*1.5);ctx.fillStyle=f.col;ctx.fillRect(sx-f.s/2,sy-f.s/2,f.s,f.s*1.2)}
    else if(f.k==='bone'||f.k==='rock'){ctx.globalAlpha=Math.min(1,a*2.5);ctx.save();ctx.translate(sx,sy);ctx.rotate(f.rot||0);ctx.fillStyle='#0a0806';ctx.fillRect(-f.s-.5,-f.s*.4-.5,f.s*2+1,f.s*.8+1);ctx.fillStyle=f.col;f.k==='bone'?ctx.fillRect(-f.s,-f.s*.35,f.s*2,f.s*.7):ctx.fillRect(-f.s*.6,-f.s*.6,f.s*1.2,f.s*1.2);ctx.restore()}
    else if(f.k==='drip'){ctx.globalAlpha=.9;ctx.fillStyle=f.col;ctx.fillRect(sx,sy-3,1,3)}
    else if(f.k==='smoke'){const r=Math.max(0,f.s*(1+f.t/f.life*1.6));ctx.globalAlpha=1;ctx.fillStyle=f.col+(a*.45).toFixed(2)+')';ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill()}}
  ctx.globalAlpha=1}
// glowing things after the darkness: sparks, flashes, fire, slashes, trails, bolts
// motes and embers share one soft glow per colour instead of a new gradient for every speck
const GLOWS={};function glowSpr(col){let c=GLOWS[col];if(c)return c;c=GLOWS[col]=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),q=g.createRadialGradient(16,16,0,16,16,16);q.addColorStop(0,col);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,32,32);return c}
function drawFxGlow(){ctx.save();ctx.globalCompositeOperation='lighter';
  for(const f of G.fx){if(f.k==='dot'||f.k==='blood'||f.k==='bone'||f.k==='rock'||f.k==='smoke')continue;const[sx,sy0]=iso(f.x,f.y),sy=sy0-f.z*30,p=f.t/f.life,a=1-p;if(f.k!=='shock'&&f.k!=='slash'&&(sx<-160||sx>W+160||sy<-160||sy>H+160))continue;
    if(f.k==='spark'){const[vx,vy]=[(f.vx-f.vy)*32,(f.vx+f.vy)*16-f.vz*30];ctx.strokeStyle=f.col;ctx.globalAlpha=a;ctx.lineWidth=f.s;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-vx*.035,sy-vy*.035);ctx.stroke()}
    else if(f.k==='mote'||f.k==='ember'){const r=f.s*1.6;ctx.globalAlpha=a;ctx.drawImage(glowSpr(f.col),sx-r*2,sy-r*2,r*4,r*4)}
    else if(f.k==='shard'){ctx.save();ctx.translate(sx,sy);ctx.rotate(f.rot||0);ctx.globalAlpha=a;ctx.fillStyle=f.col;ctx.beginPath();ctx.moveTo(-f.s*1.6,0);ctx.lineTo(0,-f.s*.5);ctx.lineTo(f.s*1.6,0);ctx.lineTo(0,f.s*.5);ctx.fill();ctx.restore()}
    else if(f.k==='flash'){const r=f.s*(.6+p*.6),g=ctx.createRadialGradient(sx,sy,0,sx,sy,r);g.addColorStop(0,`rgba(${f.col},${a})`);g.addColorStop(.35,`rgba(${f.col},${a*.5})`);g.addColorStop(1,`rgba(${f.col},0)`);ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(sx-r,sy-r,r*2,r*2)}
    else if(f.k==='fireball'){const r=f.s*(.5+Math.sqrt(p)*.9),g=ctx.createRadialGradient(sx,sy,0,sx,sy,r),fi=f.col==='fire';g.addColorStop(0,`rgba(255,250,220,${a})`);const po=f.col==='poison';g.addColorStop(.3,fi?`rgba(255,170,60,${a*.9})`:po?`rgba(170,240,90,${a*.9})`:`rgba(170,230,255,${a*.9})`);g.addColorStop(.7,fi?`rgba(200,60,10,${a*.5})`:po?`rgba(40,120,20,${a*.5})`:`rgba(60,120,220,${a*.5})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy,r,0,7);ctx.fill()}
    else if(f.k==='shock'){const e2=Math.max(0,1-Math.pow(1-p,3)),rx=f.s*45*e2,ry=f.s*22.6*e2;ctx.globalAlpha=1;ctx.strokeStyle=`rgba(${f.col},${a*.9})`;ctx.lineWidth=Math.max(.5,f.w*a*1.6);ctx.beginPath();ctx.ellipse(sx,sy0,rx,ry,0,0,7);ctx.stroke();ctx.lineWidth=Math.max(.5,f.w*a*3.5);ctx.strokeStyle=`rgba(${f.col},${a*.25})`;ctx.stroke()}
    else if(f.k==='slash'){const n=12,pts=[];for(let k=0;k<=n;k++){const an=f.ang-f.arc/2+f.arc*k/n,cut=Math.sin(k/n*Math.PI);pts.push([an,cut])}
      ctx.globalAlpha=a;const g2=(an,r)=>{const[xx,yy]=iso(f.x+Math.cos(an)*r,f.y+Math.sin(an)*r);return[xx,yy-f.z*30]};
      ctx.beginPath();pts.forEach(([an],k)=>{const[xx,yy]=g2(an,f.rad);k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});for(let k=pts.length-1;k>=0;k--){const[an,cut]=pts[k],[xx,yy]=g2(an,f.rad*(1-f.w*cut));ctx.lineTo(xx,yy)}ctx.closePath();
      ctx.fillStyle=`rgba(${f.col},${a*.75})`;ctx.fill();ctx.strokeStyle=`rgba(255,255,255,${a*.8})`;ctx.lineWidth=1;ctx.beginPath();pts.forEach(([an],k)=>{const[xx,yy]=g2(an,f.rad);k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.stroke()}}
  ctx.globalAlpha=1;
  // weapon trail of the hero's swing
  if(P.trail&&P.trail.length>1){const[px,py]=iso(P.x,P.y),T=P.trail;ctx.beginPath();T.forEach((q,k)=>k?ctx.lineTo(px+q.ox,py+q.oy):ctx.moveTo(px+q.ox,py+q.oy));for(let k=T.length-1;k>=0;k--)ctx.lineTo(px+T[k].ix,py+T[k].iy);ctx.closePath();
    const c=P.d.ele>0?(P.d.cold>0?'150,210,255':'255,150,70'):'235,225,205';ctx.fillStyle=`rgba(${c},.55)`;ctx.fill();ctx.strokeStyle=`rgba(255,255,255,.7)`;ctx.lineWidth=1;ctx.beginPath();T.forEach((q,k)=>k?ctx.lineTo(px+q.ox,py+q.oy):ctx.moveTo(px+q.ox,py+q.oy));ctx.stroke()}
  // projectile glow
  for(const p of G.proj){if(p.kind==='arrow')continue;const[sx,sy0]=iso(p.x,p.y),sy=sy0-16,pc=p.kind==='frost'?['240,250,255','140,200,255']:p.kind==='light'?['255,255,255','150,180,255']:p.kind==='poison'?['230,255,200','110,210,60']:['255,240,200','255,140,40'],r=p.kind==='glut'?16:12,[dx,dy]=scrDir(Math.atan2(p.vy,p.vx));
    for(let k=5;k>=0;k--){const tx=sx-dx*k*4.5,ty=sy-dy*k*4.5,rr=r*(1-k*.13),g=ctx.createRadialGradient(tx,ty,0,tx,ty,rr);g.addColorStop(0,`rgba(${pc[0]},.9)`);g.addColorStop(.35,`rgba(${pc[1]},.55)`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=1-k*.15;ctx.fillStyle=g;ctx.fillRect(tx-rr,ty-rr,rr*2,rr*2)}}
  ctx.globalAlpha=1;for(const b of G.bolts)drawBolt(b);
  ctx.restore()}
// lightning: a jagged spine with forks, re-rolled every few frames so it crackles
function drawBolt(b){const[ax,ay]=iso(b.a[0],b.a[1]),[bx,by]=iso(b.b[0],b.b[1]);if(!b.pts||G.t-(b.tt||0)>.05){b.tt=G.t;const n=9,pts=[[ax,ay-20]];for(let k=1;k<n;k++){const u=k/n,j=Math.sin(u*Math.PI)*11;pts.push([ax+(bx-ax)*u+rnd(-j,j),ay-20+(by-ay)*u+rnd(-j,j)])}pts.push([bx,by-20]);
    b.forks=[];for(let k=2;k<n-1;k+=3){const[x,y]=pts[k];let fx2=x,fy2=y;const f2=[[x,y]];for(let s2=0;s2<3;s2++){fx2+=rnd(-12,12);fy2+=rnd(-10,10);f2.push([fx2,fy2])}b.forks.push(f2)}b.pts=pts}
  const path=pp=>{ctx.beginPath();pp.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke()};
  for(const[w,c]of[[7,'rgba(90,140,255,.25)'],[3.2,'rgba(160,200,255,.7)'],[1.3,'#ffffff']]){ctx.strokeStyle=c;ctx.lineWidth=w;path(b.pts);ctx.lineWidth=w*.5;for(const f2 of b.forks)path(f2)}}

