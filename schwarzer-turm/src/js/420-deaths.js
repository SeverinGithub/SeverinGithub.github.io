/* ---------- deaths that fit the blow: cut in two, beheaded, burnt to ash, frozen and shattered, fried, melted ---------- */
const DCOL={fire:['#ffb070','#ff9a50','#ff7a1a'],frost:['#cfe8ff','#a8e0ff'],shock:['#cfe0ff'],poison:['#b8e070','#a6e08a','#9ae050']};
let meleeNow=false;
const _weaponHitD=weaponHit;weaponHit=function(e,mult){meleeNow=true;try{return _weaponHitD(e,mult)}finally{meleeNow=false}};
// the death follows what actually landed the blow: a blade cuts, a spell burns, freezes, shocks or poisons
function blowKind(o){if(meleeNow||o.thorns)return o.crit?'behead':'cut';if(o.elem)return o.elem==='cold'?'frost':o.elem==='light'?'shock':o.elem;
  if(o.ally){if(o.col&&DCOL.fire.includes(o.col))return'fire';return o.from!=null?'cut':null}
  for(const k in DCOL)if(o.col&&DCOL[k].includes(o.col))return k;return null}
const _hitEnemyD=hitEnemy;hitEnemy=function(e,dmg,o={}){if(!e.dead&&dmg>0)e.lastBlow={t:performance.now(),k:blowKind(o),from:o.from!=null?o.from:Math.atan2(e.y-P.y,e.x-P.x)};return _hitEnemyD(e,dmg,o)};

// a still frame of the creature as it stood when the blow landed
function deathSnap(e){const[sx,sy]=iso(e.x,e.y);if(sx<-60||sx>W+60||sy<-80||sy>H+60)return null;const s=e.scale||1,S=Math.ceil(80*s)+16,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d',{willReadFrequently:true});
  const cp=Object.assign({},e,{dead:false,flash:0,hitT:0,lungeT:0,rageOn:false,role:null,dieT:0});const sv=ctx,sh=shadow;g.translate(S/2-sx,S*.85-sy);ctx=g;shadow=()=>{};try{_drawEnemyBase(cp)}catch(err){}finally{ctx=sv;shadow=sh}
  const d=g.getImageData(0,0,S,S).data;let top=S,bot=0,l=S,r=0;for(let y=0;y<S;y++)for(let x=0;x<S;x++)if(d[(y*S+x)*4+3]>40){if(y<top)top=y;if(y>bot)bot=y;if(x<l)l=x;if(x>r)r=x}
  if(top>=bot)return null;return{c,S,top,bot,l,r,ax:S/2,ay:S*.85}}
function tinted(sn,col,a){const c=document.createElement('canvas');c.width=c.height=sn.S;const g=c.getContext('2d');g.drawImage(sn.c,0,0);g.globalCompositeOperation='source-atop';g.globalAlpha=a;g.fillStyle=col;g.fillRect(0,0,sn.S,sn.S);return c}
const _drawEnemyBase=drawEnemy;
const _killEnemyD=killEnemy;killEnemy=function(e,a){let b=e.lastBlow;if(e.dotT>0&&(!b||performance.now()-b.t>120))b={k:'poison',from:b?b.from:0};_killEnemyD(e,a);if(!b||!b.k||e.thief||e.spirit)return;const fam=e.look||e.type;if(fam==='wraith'&&b.k!=='fire'&&b.k!=='frost')return;
  const sn=deathSnap(e);if(!sn)return;let k=b.k;if((k==='cut'||k==='behead')&&(fam==='golem'))k=Math.random()<.5?'cut':'shatterstone';
  e.ds={k,sn,dir:Math.cos(b.from)-Math.sin(b.from)>=0?1:-1,from:b.from,h:sn.bot-sn.top};
  if(k==='fire'||k==='shock')e.ds.dark=tinted(sn,'#140904',.88);if(k==='shock')e.ds.white=tinted(sn,'#ffffff',1);if(k==='frost')e.ds.ice=tinted(sn,'#9ad8ff',.6);if(k==='poison')e.ds.green=tinted(sn,'#3a6a1a',.6);
  if(k==='frost'){e.ds.shards=null;sample('hit',.3,{rate:1.7})}
  if(k==='cut'||k==='behead'){gore(e.x,e.y,b.from,k==='behead'?22:18,goreOf(e),1*(e.scale||1));hitstop(.07);G.shake=Math.max(G.shake,3)}
  if(k==='fire'){sample('fire',.35)}};
// particles while the death plays out
function updDeaths(dt){if(!G.map)return;for(const e of G.map.enemies){const D=e.ds;if(!e.dead||!D||e.dieT>6)continue;const t=e.dieT,s=e.scale||1;
  if((D.k==='cut'||D.k==='behead')&&t<.7&&Math.random()<dt*30){const g=goreOf(e);if(g.k==='blood'||g.k==='ichor'){const z=D.k==='behead'?D.h/36*.95:D.h/36*.5;fxp({k:g.k,x:e.x,y:e.y,z:z*s,vx:rnd(-.6,.6),vy:rnd(-.6,.6),vz:rnd(2,4.5),life:rnd(.4,.8),col:pick(g.cols||['#a3201a','#651010']),s:rnd(1,2.2),g:9})}}
  if(D.k==='fire'&&t<2.4&&Math.random()<dt*40)fxp({k:'ember',x:e.x+rnd(-.25,.25),y:e.y+rnd(-.25,.25),z:rnd(.1,.9)*s,vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:rnd(.8,2),life:rnd(.3,.7),col:pick(['#ffc070','#ff7a1a','#ffe0a0','#e0661a']),s:rnd(1.5,3),g:-1.5});
  if(D.k==='fire'&&t>2.6&&!D.ash){D.ash=1;decal('scorch',e.x,e.y,.8*s,50);smoke(e.x,e.y,6,'rgba(50,44,40,',6,.5)}
  if(D.k==='shock'&&t<.6&&Math.random()<dt*20)sparks(e.x,e.y,.6*s,rnd(0,6.28),3,['#ffffff','#cfe0ff','#8ab0ff'],3);
  if(D.k==='frost'&&t<.9&&Math.random()<dt*12)fxp({k:'shard',x:e.x+rnd(-.3,.3),y:e.y+rnd(-.3,.3),z:rnd(.2,1)*s,vx:0,vy:0,vz:.3,life:.5,col:pick(['#ffffff','#cfe8ff']),s:rnd(1,2),rot:rnd(0,6),g:0});
  if((D.k==='frost'||D.k==='shatterstone')&&t>=(D.k==='frost'?.9:.25)&&!D.shards){const sn=D.sn,cols=3,rows=4,w=(sn.r-sn.l+1)/cols,h=(sn.bot-sn.top+1)/rows;D.shards=[];
    for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const cx=sn.l+(i+.5)*w-sn.ax,cy=sn.top+(j+.5)*h-sn.ay,a=Math.atan2(cy+10,cx)+rnd(-.4,.4);D.shards.push({sx:sn.l+i*w,sy:sn.top+j*h,w,h,x:cx,y:cy,vx:Math.cos(a)*rnd(20,60)+D.dir*15,vy:-rnd(30,90),gy:-(sn.bot-sn.top)*.12+rnd(-3,3),rot:0,vr:rnd(-8,8)})}
    sample('hit',.5,{rate:2.2})||sfx('hit');for(let k=0;k<18;k++)fxp({k:'shard',x:e.x,y:e.y,z:rnd(.3,1)*s,vx:rnd(-2,2),vy:rnd(-2,2),vz:rnd(1,3),life:rnd(.4,.8),col:pick(D.k==='frost'?['#ffffff','#cfe8ff','#6ad0ff']:['#8a8478','#5a544c']),s:rnd(1.5,3),rot:rnd(0,6),g:8})}
  if(D.shards)for(const p of D.shards){if(p.y<p.gy+0||p.vy<0){p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;if(p.y>=p.gy&&p.vy>0){p.y=p.gy;p.vy=-p.vy*.25;p.vx*=.5;p.vr*=.4;if(Math.abs(p.vy)<12)p.vy=0}}}
  if(D.k==='poison'&&t>1.4&&!D.pud){D.pud=1;decal('ichor',e.x,e.y,.9*s,40)}}}
const ease=t=>1-Math.pow(1-Math.min(1,Math.max(0,t)),3);
// draws the piece of the still frame on one side of a line through (0,y0) tilted by k
function piece(D,above,y0,k,draw){const sn=D.sn;ctx.save();ctx.beginPath();const L=sn.S;if(above){ctx.moveTo(-L,y0-k*L);ctx.lineTo(L,y0+k*L);ctx.lineTo(L,-L*2);ctx.lineTo(-L,-L*2)}else{ctx.moveTo(-L,y0-k*L);ctx.lineTo(L,y0+k*L);ctx.lineTo(L,L);ctx.lineTo(-L,L)}ctx.closePath();ctx.clip();draw();ctx.restore()}
drawEnemy=function(e){const D=e.ds;if(!e.dead||!D)return _drawEnemyBase(e);const[sx,sy]=iso(e.x,e.y);if(sx<-90||sx>W+90||sy<-140||sy>H+80)return;
  const t=e.dieT,sn=D.sn,img=(c)=>ctx.drawImage(c||sn.c,-sn.ax,-sn.ay),fade=t>18?Math.max(0,1-(t-18)/6):1,dir=D.dir,h=D.h,s=e.scale||1;
  ctx.save();ctx.translate(sx,sy);ctx.globalAlpha=fade;
  if(D.k==='cut'){const y0=-h*.5,k=dir*.3,p=ease(t/.55);if(t<.05){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,0,14*s,7*s,0,0,7);ctx.fill()}
    // lower half: stands a breath, then folds backwards
    const q=ease((t-.25)/.5);ctx.save();ctx.rotate(-dir*q*1.45);piece(D,false,y0,k,()=>img());ctx.restore();
    // upper half: slides off along the blow, drops and rolls onto the ground
    ctx.save();ctx.translate(dir*(10+h*.35)*p,h*.5*ease((t-.08)/.45)-Math.sin(Math.min(1,t/.35)*Math.PI)*6);ctx.translate(0,y0);ctx.rotate(dir*1.5*ease((t-.05)/.5));ctx.translate(0,-y0);piece(D,true,y0,k,()=>img());ctx.restore()}
  else if(D.k==='behead'){const neck=-h*.76,p=Math.min(1,t/.75);
    const q=ease((t-.35)/.5);ctx.save();ctx.rotate(-dir*q*1.5);piece(D,false,neck,0,()=>img());ctx.restore();
    const hx=dir*(18+h*.6)*ease(p),hy=-Math.sin(p*Math.PI)*h*.7+(-neck-h*.12)*ease(p);ctx.save();ctx.translate(hx,hy);ctx.translate(0,neck-h*.1);ctx.rotate(dir*p*7.5);ctx.translate(0,-(neck-h*.1));piece(D,true,neck,0,()=>img());ctx.restore()}
  else if(D.k==='fire'||D.k==='shock'){const ch=D.k==='fire'?ease(t/1):Math.min(1,t/.5),fall=ease((t-(D.k==='fire'?1:.55))/.5),crumble=ease((t-3)/2);
    if(D.k==='fire'&&t<1.1)ctx.translate(Math.sin(t*45)*1.2,0);ctx.rotate(dir*fall*1.5);ctx.scale(1+crumble*.25,1-crumble*.85);
    if(D.k==='shock'&&t<.55&&Math.floor(t*28)%2===0)img(D.white);else{ctx.globalAlpha=fade*(1-ch);img();ctx.globalAlpha=fade*ch;img(D.dark)}
    if(D.k==='fire'&&t<2.2){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade*(.35+Math.sin(t*30)*.15)*(1-t/2.2);img(tintCache(D,'or','#ff6a10'))}}
  else if(D.k==='frost'||D.k==='shatterstone'){if(!D.shards){img(D.ice||undefined);if(D.ice){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=fade*(.2+Math.sin(t*12)*.1);img(tintCache(D,'wh','#ffffff'))}}
    else{const src=D.ice||sn.c,a2=fade*(t>4?Math.max(0,1-(t-4)/2):1);ctx.globalAlpha=a2;for(const p of D.shards){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.drawImage(src,p.sx,p.sy,p.w,p.h,-p.w/2,-p.h/2,p.w,p.h);ctx.restore()}}}
  else if(D.k==='poison'){const m=ease(t/1.6);ctx.scale(1+m*.5,1-m*.88);ctx.globalAlpha=fade*(1-ease((t-2)/2));img(D.green)}
  ctx.restore()};
function tintCache(D,key,col){return D[key]||(D[key]=tinted(D.sn,col,1))}
