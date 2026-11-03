/* ---------- skeletons with gear, skeleton horses and their riders ---------- */
const RGCOL={tunic:RP.pants,rags:RMP.ash,blue:RP.cloth,red:RP.cape,robe:RP.robe,green:RMP.robeG,straw:RMP.sand,black:RMP.black,iron:RP.iron,gold:RP.gold,royal:RMP.royal,wood:RP.wood,bone:RP.bone,pale:RMP.pale,darkbone:RMP.darkbone,char:RMP.char,ash:RMP.ash,shadow:RMP.shadow,blood:RMP.blood};
const rgC=k=>RGCOL[k]||RMP[k]||RP[k]||RP.iron;
function rgWeapon(x,y,ang,w,F,ph){const W=F(RP.wood),I=F(RP.iron),D=F(RP.dark),M={p:I,s:D,t:W};
  if(w==='sword')return vWeapon(x,y,ang,'sword',M,'');if(w==='great')return vWeapon(x,y,ang,'great',{p:I,s:F(RP.gold),t:D},'');if(w==='axe')return vWeapon(x,y,ang,'axe',M,'Kriegsaxt');
  if(w==='mace')return vWeapon(x,y,ang,'mace',M,'Morgenstern');if(w==='hammer')return vWeapon(x,y,ang,'mace',M,'Kriegshammer');if(w==='halberd')return vWeapon(x,y,ang,'spear',M,'Hellebarde');
  ctx.save();ctx.translate(x,y);ctx.rotate(ang);
  if(w==='pitchfork'){limb(-12,0,24,0,1,1,W);limb(24,-3.5,24,3.5,.7,.7,I);for(const o of[-3.5,0,3.5])limb(24,o,31,o,.6,.25,I)}
  else if(w==='scythe'){limb(-10,0,24,0,1,1,W);limb(4,0,4,-3,.7,.7,W);ctx.fillStyle=I[2];ctx.beginPath();ctx.moveTo(24,0);ctx.quadraticCurveTo(22,14,10,20);ctx.quadraticCurveTo(19,11,21,0);ctx.closePath();ctx.fill();ctx.fillStyle=I[3];ctx.fillRect(21,2,1,8)}
  else if(w==='flail'){limb(-4,0,9,0,1,1,W);const a=Math.sin(ph*.7)*.8,bx=9+Math.cos(a)*9,by=Math.sin(a)*9;ctx.strokeStyle=I[1];ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(bx,by);ctx.stroke();blob(bx,by,3,3,I,true);ctx.strokeStyle=I[3];for(let k=0;k<6;k++){const q=k/6*6.283;ctx.beginPath();ctx.moveTo(bx+Math.cos(q)*2.5,by+Math.sin(q)*2.5);ctx.lineTo(bx+Math.cos(q)*4.5,by+Math.sin(q)*4.5);ctx.stroke()}}
  else if(w==='cleaver'){limb(-5,0,4,0,1,1,W);poly([[3,-1.5],[15,-2],[15,6],[4,5]],I,true);ctx.fillStyle=F(RMP.blood)[1];ctx.fillRect(9,2,4,2)}
  else if(w==='club'){limb(-5,0,17,0,1.2,3.4,W);ctx.fillStyle=W[0];ctx.fillRect(10,-2,1,1);ctx.fillRect(14,1,1,1)}
  else if(w==='sickle'){limb(-5,0,5,0,1,1,W);ctx.strokeStyle=I[2];ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(10,-1,6,Math.PI*.9,Math.PI*2.2);ctx.stroke()}
  else if(w==='dagger'){limb(-4,0,1,0,.9,.9,W);poly([[1,-1.4],[11,0],[1,1.4]],I,true)}
  else if(w==='lance'){limb(-14,0,-2,0,1.2,1.2,W);poly([[-2,-4],[2,-1.2],[40,-.2],[40,.2],[2,1.2],[-2,4]],I,true);poly([[-3,-5],[1,-5],[1,5],[-3,5]],F(RP.gold),true)}
  else if(w==='torch'){limb(-4,0,12,0,1,1,W);ctx.restore();return}
  ctx.restore()}
function rgBow(x,y,ang,cross,F,charge){ctx.save();ctx.translate(x,y);ctx.rotate(ang);const W=F(RP.wood),I=F(RP.iron);
  if(cross){limb(-6,0,14,0,1.4,1.2,W);ctx.strokeStyle=I[2];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(12,-8);ctx.quadraticCurveTo(16,0,12,8);ctx.stroke();ctx.strokeStyle='#cfc6aa';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(12,-8);ctx.lineTo(charge?2:8,0);ctx.lineTo(12,8);ctx.stroke();if(charge){limb(2,0,16,0,.5,.5,I)}}
  else{ctx.strokeStyle=W[2];ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(-4,0,12,-1.25,1.25);ctx.stroke();ctx.strokeStyle='#cfc6aa';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-4+Math.cos(-1.25)*12,Math.sin(-1.25)*12);ctx.lineTo(charge?-9:-.5,0);ctx.lineTo(-4+Math.cos(1.25)*12,Math.sin(1.25)*12);ctx.stroke()}ctx.restore()}
function rgShield(x,y,kind,col,F,back){const C=F(rgC(col)),I=F(RP.iron);if(back){blob(x,y-1,5,7,F(RP.wood));return}
  if(kind==='kite')poly([[x-6,y-9],[x+6,y-9],[x+6,y+1],[x,y+10],[x-6,y+1]],C,true);else if(kind==='tower')poly([[x-7,y-12],[x+7,y-12],[x+7,y+10],[x-7,y+10]],C,true);else blob(x,y,7,7,C,true);
  blob(x,y-1,1.8,1.8,F(RP.gold),true);if(kind!=='round'){ctx.fillStyle=F(RP.gold)[2];ctx.fillRect(x-.6,y-8,1.2,14);ctx.fillRect(x-5,y-3.5,10,1.2)}}
function rgHat(hx,hy,g,F,f,back){const C=F(rgC(g.hatC||'iron'));
  if(g.hat==='straw'){blob(hx,hy-3.4,9,2.4,F(RMP.sand));blob(hx,hy-5.2,4.6,3,F(RMP.sand))}
  else if(g.hat==='hood'){blob(hx,hy-1,5.6,6.2,C);if(!back)blob(hx+f*.6,hy+.8,3.4,3.6,F(RP.dark))}
  else if(g.hat==='kettle'){blob(hx,hy-2.6,4.6,3.6,C,true);blob(hx,hy-1.6,8,1.8,C,true)}
  else if(g.hat==='cap'){blob(hx,hy-3,4.8,3,C)}
  else if(g.hat==='great'||g.hat==='crown'){poly([[hx-5,hy-6],[hx+5,hy-6],[hx+5,hy+5],[hx-5,hy+5]],C,true);if(!back){ctx.fillStyle='#0a0806';ctx.fillRect(hx-4+f,hy-1,8,1.4);ctx.fillStyle=g.eye||'#ff3a2a';ctx.fillRect(hx-3+f,hy-1,1.4,1.2);ctx.fillRect(hx+1+f,hy-1,1.4,1.2)}
    if(g.hat==='crown'){const G2=F(RP.gold);poly([[hx-5.5,hy-6],[hx+5.5,hy-6],[hx+5.5,hy-9],[hx+3,hy-7.5],[hx,hy-11],[hx-3,hy-7.5],[hx-5.5,hy-9]],G2,true)}
    if(g.plume){const c=F(rgC(g.plume));for(let k=0;k<5;k++)blob(hx-f*(1+k*1.4),hy-8-k*.8+k*k*.25,2.4,1.6,c)}}
  else if(g.hat==='barbute'){blob(hx,hy-1,5.2,5.8,C,true);if(!back){ctx.fillStyle='#0a0806';ctx.fillRect(hx-1+f*1.5,hy-2,2,6);ctx.fillRect(hx-3+f*1.5,hy-1,6,1.4)}}}
// ---------- the bone horse: a rigged skeleton with a real four-beat gallop ----------
// every horse keeps a little state: gait blend, stride phase, lean, tail and mane springs, the rear-up when mounted
function rgHS(){return{t:-1,x:null,y:null,v:0,ph:0,lean:0,rear:0,tf:1,tail:null,tv:[0,0,0,0,0,0],was:[1,1,1,1],paw:3+Math.random()*4,pawT:0,snort:0,blink:0}}
const RGLEG=[ // name, root x, fore?, near?, gallop offset, walk offset
  ['hl',-12,0,0,0,0],['hr',-12,0,1,.1,.5],['fl',11,1,0,.42,.25],['fr',11,1,1,.53,.75]];
const rgSm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
function rgIK(ax,ay,bx,by,L1,L2,bend){let dx=bx-ax,dy=by-ay,d=Math.hypot(dx,dy)||.01;const m=L1+L2-.05;if(d>m){bx=ax+dx/d*m;by=ay+dy/d*m;dx=bx-ax;dy=by-ay;d=m}
  const c=Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))),a=Math.atan2(dy,dx)+bend*Math.acos(c);return[ax+Math.cos(a)*L1,ay+Math.sin(a)*L1,bx,by]}
// clip-clop: a dry knock of bone on stone with a soft thump under it
function rgClop(vol=.05,pit=1){if(!AC||G.muted)return;const t=AC.currentTime,g=AC.createGain();g.connect(SFXG);
  const s=AC.createBufferSource();s.buffer=noiseBuf;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1500*pit;bp.Q.value=2.2;s.connect(bp);bp.connect(g);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.06);s.start(t,Math.random()*.2);s.stop(t+.07);
  const o=AC.createOscillator(),og=AC.createGain();o.type='triangle';o.frequency.setValueAtTime(190*pit,t);o.frequency.exponentialRampToValueAtTime(70,t+.07);og.gain.setValueAtTime(vol*1.4,t);og.gain.exponentialRampToValueAtTime(.0001,t+.09);o.connect(og);og.connect(SFXG);o.start(t);o.stop(t+.1)}
// a hollow, ghostly whinny that climbs, shivers and falls away
function rgNeigh(vol=.045){if(!AC||G.muted)return;const t=AC.currentTime,g=AC.createGain();g.connect(SFXG);const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1100;bp.Q.value=3;bp.connect(g);
  for(const det of[1,1.012]){const o=AC.createOscillator();o.type='sawtooth';const f=o.frequency;f.setValueAtTime(420*det,t);f.exponentialRampToValueAtTime(980*det,t+.18);f.exponentialRampToValueAtTime(760*det,t+.55);f.exponentialRampToValueAtTime(380*det,t+1.05);
    const l=AC.createOscillator(),lg=AC.createGain();l.frequency.value=11;lg.gain.value=38;l.connect(lg);lg.connect(f);o.connect(bp);o.start(t);o.stop(t+1.1);l.start(t);l.stop(t+1.1)}
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.06);g.gain.setValueAtTime(vol,t+.6);g.gain.exponentialRampToValueAtTime(.0001,t+1.08);
  const s=AC.createBufferSource(),sg=AC.createGain(),lp=AC.createBiquadFilter();s.buffer=noiseBuf;lp.type='lowpass';lp.frequency.value=700;s.connect(lp);lp.connect(sg);sg.connect(SFXG);sg.gain.setValueAtTime(vol*.9,t+.9);sg.gain.exponentialRampToValueAtTime(.0001,t+1.25);s.start(t+.9,0);s.stop(t+1.25)}
function rgSnort(vol=.04){if(!AC||G.muted)return;const t=AC.currentTime,g=AC.createGain();g.connect(SFXG);const s=AC.createBufferSource(),lp=AC.createBiquadFilter();s.buffer=noiseBuf;lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(260,t+.3);s.connect(lp);lp.connect(g);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+.32);s.start(t);s.stop(t+.3)}

// advance the rig from how far the horse actually moved since the last frame
function rgHorseTick(H,e,player){const now=G.t;let dt=H.t<0?0:Math.min(.05,Math.max(0,now-H.t));H.t=now;
  if(H.x==null||dt<=0){H.x=e.x;H.y=e.y;return 0}
  let v=Math.hypot(e.x-H.x,e.y-H.y)/dt;H.x=e.x;H.y=e.y;if(v>30||e.dead)v=0;
  const tgt=Math.min(1,v/6.5),v0=H.v;H.v+=(tgt-H.v)*Math.min(1,dt*(tgt>H.v?4.5:3.2));if(H.v<.004)H.v=0;
  const acc=(H.v-v0)/Math.max(dt,.001);H.lean+=(Math.max(-.16,Math.min(.16,acc*.05))-H.lean)*Math.min(1,dt*6);
  if(H.v>.01)H.ph=(H.ph+dt*(.85+1.55*H.v))%1;else H.ph+=(Math.round(H.ph*2)/2-H.ph)*Math.min(1,dt*3);
  if(H.rear>0)H.rear=Math.max(0,H.rear-dt/1.05);
  // standing still: now and then paw the ground or toss the head
  if(H.v<.05){H.paw-=dt;if(H.paw<0){H.paw=4+Math.random()*6;H.pawT=1;if(player&&Math.random()<.5){H.snort=1;rgSnort(.03)}}}else H.paw=Math.max(H.paw,2);
  H.pawT=Math.max(0,H.pawT-dt/1.1);H.snort=Math.max(0,H.snort-dt*1.6);H.blink=(H.blink+dt)%3.7;
  return dt}

// draw it. Returns where the saddle sits, so a rider can be put on top and rock with the stride
function rgHorse(o,g,e,H,player){H=H||e.hs||(e.hs=rgHS());if(H.t<0)H.tf=o.f;const dt=rgHorseTick(H,e,player);
  const{F}=o;let f=o.f;
  // a quick squash through the side view when it turns around, not a hard flip
  H.tf+=(f-H.tf)*Math.min(1,dt*14);const sq=Math.max(.18,Math.abs(H.tf));f=H.tf>=0?1:-1;ctx.save();ctx.scale(sq,1);
  const B=F(rgC(g.hbone||'bone')),D=F(RP.dark),v=H.v,ph=H.ph,T2=Math.PI*2,gal=rgSm(.25,.62,v),t=G.t,eye=g.eye||'#6ad0ff';
  const rearE=H.rear>0?Math.sin(Math.min(1,(1-H.rear)*1.25)*Math.PI):0;
  // body: one rise per stride at the gallop, two small ones at the walk, breathing at rest
  const bob=-gal*2.8*Math.cos(T2*(ph-.32))-(1-gal)*v*1.1*Math.abs(Math.sin(T2*ph))+(v<.05?Math.sin(t*1.9)*.35:0);
  const pitch=gal*.085*Math.sin(T2*(ph-.08))-H.lean-rearE*.78;
  const piv=rearE>0?[-12,-24]:[0,-26];
  // keep the transform readable: body-frame point (x right, y up from ground) -> screen
  const P_=(x,y)=>{const ox=x-piv[0],oy=y-piv[1],c=Math.cos(pitch),s=Math.sin(pitch);return[(piv[0]+ox*c-oy*s)*f,piv[1]+ox*s+oy*c+bob]};
  // legs
  const duty=.78-.42*v,stride=5+24*v,lift=2.5+8*v,legs=[];
  for(let i=0;i<4;i++){const[nm,rx,fore,near,go,wo]=RGLEG[i],off=wo+(go-wo)*gal,p=((ph+off)%1+1)%1;
    const hip=P_(fore?11:-12,-23);let hx,hy;
    if(v<.01&&!(fore&&near&&H.pawT>0)){hx=rx+(near?1.5:-1.5)*(fore?1:-1);hy=0}
    else if(fore&&near&&H.pawT>0&&v<.05){const w=Math.sin(H.pawT*Math.PI*2.5);hx=rx+2+Math.max(0,w)*5;hy=-Math.max(0,w)*6}
    else if(p<duty){const u=p/duty;hx=rx+stride*(.5-u);hy=0}
    else{const w=(p-duty)/(1-duty),s=w*w*(3-2*w);hx=rx+stride*(-.5+s)+(fore?Math.sin(w*Math.PI)*3*v:-Math.sin(w*Math.PI)*2*v);hy=-lift*Math.pow(Math.sin(w*Math.PI),fore?.7:1.3)*(fore?1:.8)}
    // rearing: the forelegs paddle the air under the chest
    if(rearE>.05&&fore){const fl=Math.sin(t*13+(near?0:1.9)),sh=P_(11,-23),rx2=sh[0]*f+6+fl*3,ry2=sh[1]+13+Math.cos(t*13+(near?0:1.9))*2.5;hx+=(rx2-hx)*Math.min(1,rearE*2);hy+=(ry2-hy)*Math.min(1,rearE*2)}
    // the foot plants: report the beat
    const on=hy>-.3&&v>.18;if(on&&!H.was[i]&&o.step)o.step(i,fore,near);H.was[i]=on?1:0;
    const L1=fore?11.5:12,L2=fore?12:12.5,bend=(fore?1:-1)*f;
    const k=rgIK(hip[0],hip[1],hx*f,hy,L1,L2,fore?-bend*.9:bend);legs.push({hip,k,hx:k[2],hy:k[3],near,fore})}
  const drawLeg=L=>{const c=L.near?B:D,w=L.near?1.9:1.6;limb(L.hip[0],L.hip[1],L.k[0],L.k[1],w+.4,w,c);
    // cannon bone, then the fetlock angling into the hoof
    const fx=L.hx,fy=L.hy,mx=L.k[0]+(fx-L.k[0])*.82,my=L.k[1]+(fy-L.k[1])*.82;limb(L.k[0],L.k[1],mx,my,w,w*.8,c);limb(mx,my,fx+f*1.4,fy-.4,w*.8,w*.75,c);
    blob(L.k[0],L.k[1],w*.95,w*.9,c);blob(fx+f*1.6,fy-.5,2.1,1.2,F(RP.dark))};
  // far side first
  for(const L of legs)if(!L.near)drawLeg(L);
  // tail: a spring chain that streams out behind at speed and swishes at rest
  {const root=P_(-17,-25),base=Math.PI*.62-gal*.55-v*.12;let x=root[0],y=root[1];
    for(let k=0;k<6;k++){const want=base+(k*.05)+Math.sin(t*(v>.1?9:2.2)-k*.7)*(.08+.06*k)*(v>.1?1:.6)-pitch*.6;
      if(!H.tail)H.tail=[];if(H.tail[k]==null)H.tail[k]=want;H.tv[k]+=((want-H.tail[k])*60-H.tv[k]*9)*dt;H.tail[k]+=H.tv[k]*dt;}
    const pts=[[x,y]];for(let k=0;k<6;k++){const a=H.tail[k];x+=-Math.cos(a)*f*3.2;y+=Math.sin(a)*3.2;pts.push([x,y])}
    for(let k=0;k<6;k++)limb(pts[k][0],pts[k][1],pts[k+1][0],pts[k+1][1],1.4-k*.15,1.2-k*.15,B);
    // the ghost hair: flickering strands of light that trail the bones
    ctx.save();ctx.globalCompositeOperation='lighter';for(let s=0;s<4;s++){ctx.strokeStyle=eye;ctx.globalAlpha=.16+.08*Math.sin(t*7+s);ctx.lineWidth=2.4-s*.4;ctx.beginPath();ctx.moveTo(...pts[1]);
      for(let k=2;k<pts.length;k++){const w=Math.sin(t*11+k+s*1.3)*(1.2+k*.5);ctx.lineTo(pts[k][0]-f*k*(1+v*1.2),pts[k][1]+w+s*.8)}ctx.stroke()}ctx.restore()}
  // spine, pelvis, ribs that breathe
  const sp=[];for(let k=0;k<9;k++){const x=-16+k*3.7;sp.push(P_(x,-27.5-Math.sin(k/8*Math.PI)*1.2))}
  const br=v<.05?1+Math.sin(t*1.9)*.05:1;
  if(g.bard){const C=F(rgC(g.bard)),q=[[-18,-28],[14,-30],[16,-14.5],[10,-11.5],[4,-14.5],[-3,-11.5],[-10,-14.5],[-18,-12.5]].map(([x,y])=>P_(x,y));poly(q,C);
    ctx.strokeStyle='rgba(232,200,100,.55)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(...P_(-17,-14));ctx.lineTo(...P_(15,-16));ctx.stroke()}
  else for(let k=0;k<6;k++){const x=-7+k*3.4,a=P_(x,-26),b=P_(x+1.6,-15+Math.abs(k-2.5)*.7-(br-1)*9);limb(a[0],a[1],(a[0]+b[0])/2+f*1.4,(a[1]+b[1])/2,.7,.6,B);limb((a[0]+b[0])/2+f*1.4,(a[1]+b[1])/2,b[0],b[1],.6,.45,B)}
  for(let k=0;k<8;k++)limb(sp[k][0],sp[k][1],sp[k+1][0],sp[k+1][1],1.8,1.8,B);
  for(let k=1;k<8;k+=2)blob(sp[k][0],sp[k][1]-1,1.1,1.6,B);
  {const pv=P_(-14,-24.5),sc=P_(9,-25);blob(pv[0],pv[1],4.4,3.3,B);blob(sc[0],sc[1],3.6,4,B)}
  // neck and head: low and reaching at the gallop, high and proud at rest, nodding against the body's rock
  const nb=P_(13,-28),na=-(1.08-.42*gal-.06*v)+Math.sin(T2*(ph+.18))*.09*v+(v<.05?Math.sin(t*1.3)*.04:0)-H.pawT*.12*Math.sin(t*9)-rearE*.25,nl=15;
  const hd=[nb[0]+Math.cos(na)*nl*f,nb[1]+Math.sin(na)*nl];
  {const n=5;let px=nb[0],py=nb[1];for(let k=1;k<=n;k++){const u=k/n,cx=nb[0]+(hd[0]-nb[0])*u-Math.sin(u*Math.PI)*2.2*f*(1-gal*.5),cy=nb[1]+(hd[1]-nb[1])*u-Math.sin(u*Math.PI)*1.5;limb(px,py,cx,cy,1.9-u*.4,1.7-u*.4,B);blob(cx,cy,1.8-u*.3,1.5,B);px=cx;py=cy}}
  // mane: tongues of spectral fire along the neck, combed back by the wind
  {ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<7;k++){const u=k/6,bx=nb[0]+(hd[0]-nb[0])*u-Math.sin(u*Math.PI)*2*f,by=nb[1]+(hd[1]-nb[1])*u-2.5,fl=Math.sin(t*13+k*1.9),len=4+3*v+fl*1.2;
      ctx.globalAlpha=.24+.12*Math.sin(t*9+k);ctx.fillStyle=eye;ctx.beginPath();ctx.moveTo(bx-1.4*f,by+1);ctx.quadraticCurveTo(bx-f*(len*.6),by-len*.6+fl,bx-f*(len*(.9+v*.6)),by-len*.3-v*2+fl);ctx.lineTo(bx+1.4*f,by+.5);ctx.fill()}ctx.restore()}
  // skull: long face, deep orbit, a jaw that snaps open on the stride and when it snorts
  {const ha=na+1.32+gal*.2+(v<.05?Math.sin(t*1.3+.6)*.05:0),c=Math.cos(ha),s=Math.sin(ha),Hp=(x,y)=>[hd[0]+(x*c-y*s)*f,hd[1]+x*s+y*c];
    const jaw=Math.max(H.snort,gal*Math.max(0,Math.sin(T2*(ph+.1)))*.8,rearE*.9)*.35;
    poly([Hp(-3,-3),Hp(3,-3.5),Hp(11,-1.5),Hp(12.5,1.2),Hp(4,2.2),Hp(-3,2.6)],B);
    {const jc=Math.cos(ha+jaw),js=Math.sin(ha+jaw),J=(x,y)=>[hd[0]+(x*jc-y*js)*f,hd[1]+x*js+y*jc];poly([J(-1.5,2),J(10.5,2.2),J(10,3.8),J(-.5,4.4)],B);
      ctx.fillStyle='#0a0806';for(let k=0;k<4;k++){const p=J(5+k*1.4,2.3);ctx.fillRect(p[0]-.4,p[1]-.8,.8,.9)}}
    const ey=Hp(1.2,-1),blink=H.blink<.12;ctx.fillStyle='#0a0806';ctx.beginPath();ctx.ellipse(ey[0],ey[1],2,1.6,0,0,7);ctx.fill();
    if(!blink){const gl=.75+.25*Math.sin(t*6);ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=eye;ctx.globalAlpha=.25*gl;ctx.beginPath();ctx.arc(ey[0],ey[1],4.5,0,7);ctx.fill();ctx.globalAlpha=1;ctx.fillRect(ey[0]-.7,ey[1]-.6,1.4,1.2);
      // the eye leaves a streak of light when it runs
      if(v>.3){ctx.strokeStyle=eye;ctx.globalAlpha=.35*v;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ey[0],ey[1]);ctx.lineTo(ey[0]-f*(6+10*v),ey[1]-1+Math.sin(t*20));ctx.stroke()}ctx.restore()}
    const no=Hp(11.5,.2);ctx.fillStyle='#0a0806';ctx.fillRect(no[0]-.6,no[1]-.6,1.2,1);
    for(const[ex,tw]of[[-2.6,0],[-1.4,.5]]){const e1=Hp(ex,-3),e2=Hp(ex-3.4-gal*1.5,-5.6+gal*1.2+Math.sin(t*3+tw)*.4);limb(e1[0],e1[1],e2[0],e2[1],.9,.3,B)}
    if(H.snort>.5&&Math.random()<.5)fxp({k:'smoke',x:e.x+rnd(-.1,.1),y:e.y+rnd(-.1,.1),z:1.1,vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:.2,life:.5,col:'rgba(220,220,230,',s:2.4,g:0})}
  // saddle for a rider
  const sad=P_(-1,-29);if(g.rider){const a=P_(-6,-28),b=P_(4,-29);limb(a[0],a[1],b[0],b[1],2.4,2.4,F(RP.rust));blob(sad[0],sad[1]+.5,4.5,2,F(RP.rust))}
  // near side over everything; with a rider this goes on after him, so his legs vanish behind the flank
  const near=()=>{ctx.save();ctx.scale(sq,1);
    if(g.rider&&o.late){const C=g.bard?F(rgC(g.bard)):F(RP.rust),q=[[-11,-21],[9,-22],[10,-13.5],[4,-15.5],[-3,-12.5],[-11,-15]].map(([x,y])=>P_(x,y));poly(q,C);
      if(g.bard){ctx.strokeStyle='rgba(232,200,100,.55)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(...P_(-11,-21));ctx.lineTo(...P_(9,-22));ctx.stroke()}
      const st=P_(1,-14);ctx.fillStyle='#2a2420';ctx.fillRect(st[0]-2,st[1]-1,4,1.6);ctx.fillStyle='#8a7a5a';ctx.fillRect(st[0]-.4,st[1]-6,.8,5)}
    for(const L of legs)if(L.near)drawLeg(L);ctx.restore()};
  ctx.restore();if(o.late)H.late=near;else near();
  return{x:sad[0]*sq,y:sad[1],a:pitch*f,f}}

// dust where a hoof comes down, and the sound of it for horses you can hear
function rgHoofFx(e,H,fore,near,vol){const a=e.face||0,bx=-Math.cos(a),by=-Math.sin(a),s=fore?.25:-.3;
  const x=e.x+Math.cos(a)*s+(near?.12:-.12)*by,y=e.y+Math.sin(a)*s-(near?.12:-.12)*bx;
  for(let k=0;k<(H.v>.6?3:1);k++)fxp({k:'smoke',x:x+rnd(-.08,.08),y:y+rnd(-.08,.08),z:.05,vx:bx*rnd(.4,1.4)+rnd(-.4,.4),vy:by*rnd(.4,1.4)+rnd(-.4,.4),vz:rnd(.15,.45),life:rnd(.35,.7),col:'rgba(150,138,118,',s:rnd(2.2,3.6),g:0});
  if(vol>0)rgClop(vol*(near?1:.8),(fore?1.08:.94)*(near?1:.97)*rnd(.97,1.03))}
// enemy hooves are heard only close by, and never too many at once
function rgEarVol(e){if(!P)return 0;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d>8)return 0;const n=G.t|0;if(G.rgEarS!==n){G.rgEarS=n;G.rgEarN=0}if(++G.rgEarN>10)return 0;return .03*(1-d/8)}
function rgDrawGear(e,o){const g=e.gear,{F,f,back,ph,atk,fx,fy}=o,eg=o.eg||{};
  if(g.horse){ctx.save();ctx.scale(1.2,1.2);const sd=rgHorse({F,f,late:g.rider,step:(i,fo,ne)=>rgHoofFx(e,e.hs,fo,ne,rgEarVol(e))},g,e);ctx.restore();if(!g.rider)return;ctx.save();ctx.translate(sd.x*1.2,sd.y*1.2+9);ctx.rotate(sd.a*.6);ctx.scale(.8,.8)}
  const B=F(rgC(g.bone||'bone')),body=g.body,C=F(rgC(g.bodyC||'tunic')),A=F(rgC(g.armor||'iron')),plate=body==='plate'||body==='royal',mail=body==='gambeson';
  const R=plate?{torso:A,sleeve:A,fore:A,hand:A,legs:A,shin:A,feet:A,skirt:F(rgC(g.bodyC||'black')),pauldron:A,belt:F(RP.gold),buckle:F(RP.gold),metal:{torso:1,sleeve:1,fore:1,shin:1,legs:1}}
    :body?{torso:C,sleeve:mail?C:B,fore:B,hand:B,legs:B,shin:B,feet:B,skirt:body==='apron'?F(RMP.ash):C,belt:body==='rags'?null:F(RP.rust)}
    :{torso:F(RP.dark),sleeve:B,fore:B,hand:B,legs:B,shin:B,feet:B,skirt:F(RP.rust)};
  if(g.rider){R.torso=F(rgC(g.bodyC||'red'));if(R.metal)R.metal.torso=0}
  const ranged=g.wep==='crossbow'||g.wep==='longbow',aim=Math.atan2(fy,fx),wa=ranged?aim:g.wep==='lance'?(atk??aim+.15*f):(atk??aim+.8*f);
  const oh={R,f,back,robe:!!g.rider,moving:!g.rider&&!e.dead&&eg.moving!==false,run:eg.run,seed:eg.seed,dir:eg.dir,ph,tw:(plate?1.1:.92)*(g.tw||1),lw:plate?1.05:.66,armLen:15,atk:ranged?null:atk,
    torsoFx:plate||body?null:(a,b,c,d)=>{for(let k=0;k<4;k++)limb(a-5+k*.4,b+2.5+k*2.6,a+5-k*.4,b+2.5+k*2.6,.7,.7,B);limb(c,d,a,b+1,.8,.8,B)},
    head:(hx,hy)=>{if(!(g.hat==='great'||g.hat==='crown'||g.hat==='barbute')){blob(hx,hy,3.8,4.2,B);if(!back){ctx.fillStyle='#0a0806';ctx.fillRect(hx-2.4+f*.6,hy-1,1.6,1.6);ctx.fillRect(hx+.8+f*.6,hy-1,1.6,1.6);ctx.fillRect(hx-1.5+f*.6,hy+2.2,3,.8);ctx.fillStyle=g.eye||'#ffb040';ctx.fillRect(hx-2+f*.6,hy-.6,.8,.8);ctx.fillRect(hx+1.2+f*.6,hy-.6,.8,.8)}}rgHat(hx,hy,g,F,f,back)},
    weapon:(x,y)=>rgWeapon(x,y,wa,g.wep,F,ph),
    offhand:g.shield?(x,y,bk)=>rgShield(x+f*1,y-2,g.shield,g.shC||'red',F,bk):null};
  if(ranged)archEnemy(oh,e,fx,fy,f,F,g.wep==='crossbow');humanoid(oh);
  if(g.rider&&!back){blob(4*f,-4,2.6,1.8,F(RP.dark))}
  if(g.horse&&g.rider){ctx.restore();ctx.save();ctx.scale(1.2,1.2);if(e.hs&&e.hs.late)e.hs.late();ctx.restore()}}

