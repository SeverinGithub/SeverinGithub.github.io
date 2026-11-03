/* ---------- figures: shaded, pre-rendered look (quantized later) ---------- */
const RP={sand:['#3a2a10','#7a5a2a','#b08a48','#e0c080'],
 skin:['#2a160c','#6e4430','#a8765a','#d4a484'],cloth:['#0e1220','#232c44','#3c4a6c','#5c6c90'],pants:['#140e08','#2e2216','#4a3826','#62503a'],
 shoe:['#0e0804','#26180c','#40281a','#5a3c26'],cape:['#1c0504','#4a100c','#6e1c14','#8e3022'],hair:['#0e0804','#2a1a0e','#46301c','#5a4028'],
 bone:['#2e281c','#7a6e54','#b8ac8c','#e4dac0'],flesh:['#14180e','#323c24','#56603e','#7e8a5c'],robe:['#160302','#3a0a08','#62140e','#82241a'],
 dark:['#060608','#141418','#2a2a32','#565664'],stone:['#141416','#2c2c32','#4a4a52','#70707a'],rust:['#1e0e06','#4a2814','#7a4a28','#9a6a40'],
 wood:['#2c1a0c','#4f3017','#774a24','#a2703c'],iron:['#2a2c33','#4b4f59','#787d88','#acb1ba'],gold:['#5c3c06','#a87418','#e2b23c','#fff2a6'],
 ghost:['#2a3a5a','#7a9ac8','#c0d8f8','#ffffff'],ember:['#3a1204','#8a2c08','#e0661a','#ffc070'],flash:['#a0a0a0','#e8e8e8','#ffffff','#ffffff']};
const METAL=new Set(['steel','iron','dark','gold','bronze','moon','sky','blood','void','venom']);
function lgrad(x1,y1,x2,y2,r,metal){const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,r[metal?2:1]);g.addColorStop(.25,r[2]);if(metal){g.addColorStop(.4,r[3]);g.addColorStop(.52,r[2])}g.addColorStop(.75,r[1]);g.addColorStop(1,r[0]);return g}
function limb(x1,y1,x2,y2,w1,w2,r,metal){const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1;let nx=-dy/l,ny=dx/l;if(nx+ny>0){nx=-nx;ny=-ny}
  const mx=(x1+x2)/2,my=(y1+y2)/2,wm=Math.max(w1,w2);ctx.fillStyle=lgrad(mx+nx*wm,my+ny*wm,mx-nx*wm,my-ny*wm,r,metal);
  ctx.beginPath();ctx.moveTo(x1+nx*w1,y1+ny*w1);ctx.lineTo(x2+nx*w2,y2+ny*w2);ctx.lineTo(x2-nx*w2,y2-ny*w2);ctx.lineTo(x1-nx*w1,y1-ny*w1);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(x1,y1,w1,0,7);ctx.fill();ctx.beginPath();ctx.arc(x2,y2,w2,0,7);ctx.fill()}
function blob(cx,cy,rx,ry,r,metal){const g=ctx.createRadialGradient(cx-rx*.35,cy-ry*.45,0,cx,cy,Math.max(rx,ry)*1.15);g.addColorStop(0,r[metal?3:2]);g.addColorStop(.35,r[2]);g.addColorStop(.72,r[1]);g.addColorStop(1,r[0]);
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(cx,cy,Math.max(.1,rx),Math.max(.1,ry),0,0,7);ctx.fill()}
function poly(pts,r,metal){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[x,y]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  ctx.fillStyle=lgrad(x0,y0,x1,y0+(x1-x0)*.35,r,metal);ctx.beginPath();pts.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}
function itemRamps(it){const s=PXS[it.b]||PXS.Ring,u=itUq(it),sk=u&&PXU[u]||[],n=[sk[0]||s[1],sk[1]||s[2]||s[1],sk[2]||s[3]||s[1]];
  return{p:PXM[n[0]],s:PXM[n[1]],t:PXM[n[2]],pm:METAL.has(n[0]),sm:METAL.has(n[1]),gem:PXG[sk[3]||s[4]||'ruby']}}
// a person: feet at 0,0, about 50 px tall. o.R = ramps per part, o.f = facing side (1 right, -1 left), o.back = seen from behind
function humanoid(o){
  const R=o.R,f=o.f,back=o.back,mv=o.moving,ph=o.ph||0,sw=mv?Math.sin(ph):0,bob=mv?Math.abs(Math.cos(ph))*(o.bobA??1.1):0,St=o.stride??1,H=o.hunch||0,tw=o.tw||1,lw=o.lw||1,M=R.metal||{};
  const hipY=-23-bob+H*.3,shY=-38-bob+H,hipX=f*.5,shX=f*(1+H*.6);
  const armPos=(sd,weap)=>{const sx=shX+sd*7.6*tw,sy=shY+1.6;let hx,hy;
    if(weap&&o.atk!=null){hx=sx+Math.cos(o.atk)*12;hy=sy+5+Math.sin(o.atk)*8}else{hx=sx+sd*2.2+(sd<0?sw:-sw)*2.6*(o.armSwing??1);hy=sy+(o.armLen||15)}
    // set hands (o.hands = [weapon hand, other hand]) reach with a bent elbow and stop where the arm runs out
    const h=o.hands&&o.hands[weap?0:1];if(h){const k=rgIK(sx,sy,h[0],h[1],o.aL||9.5,o.aL||9.5,sd*f>0?-1:1);return{sx,sy,ex:k[0],ey:k[1],hx:k[2],hy:k[3]}}
    return{sx,sy,ex:(sx+hx)/2+sd*1.5,ey:(sy+hy)/2+1,hx,hy}};
  const aw=armPos(f,true),ao=armPos(-f,false);
  const drawArm=a=>{limb(a.sx,a.sy,a.ex,a.ey,2.6*lw,2.2*lw,R.sleeve||R.torso,M.sleeve);limb(a.ex,a.ey,a.hx,a.hy,2.2*lw,1.8*lw,R.fore||R.sleeve||R.torso,M.fore);if(o.armFx)o.armFx(a);blob(a.hx,a.hy+.8,2.1*lw,2.1*lw,R.hand||R.skin,M.hand)};
  if(back){if(o.weapon)o.weapon(aw.hx,aw.hy+.8);if(o.offhand)o.offhand(ao.hx,ao.hy,true)}
  if(!o.robe)for(const[sd,s]of[[-1,sw],[1,-sw]]){const dx=o.dir?o.dir[0]:1,dy=o.dir?o.dir[1]*.6:0,lx=hipX+sd*3.5*tw,kx=lx+s*2.4*St*dx+sd*.5,ky=hipY+11-(s<0?-s*(o.knee||0):0)+s*2.4*St*dy,ax=lx+s*4.4*St*dx,ay=-1.8-(s<0?-s*1.4*(o.lift??1):0)+s*4.4*St*dy;
    limb(lx,hipY,kx,ky,3.1*lw,2.6*lw,R.legs,M.legs);limb(kx,ky,ax,ay,2.6*lw,2*lw,R.shin||R.legs,M.shin);if(R.feet)blob(ax+f*1.5,-1.2,3.4*lw,1.8,R.feet,M.shin)}
  if(o.robe)poly([[shX-7.5*tw,shY],[shX+7.5*tw,shY],[hipX+10.5*tw,-.5],[hipX-10.5*tw,-.5]],R.torso,M.torso);
  else{poly([[shX-8.4*tw,shY-1],[shX+8.4*tw,shY-1],[hipX+6.4*tw,hipY+1],[hipX-6.4*tw,hipY+1]],R.torso,M.torso);if(R.skirt)poly([[hipX-6.6*tw,hipY-.5],[hipX+6.6*tw,hipY-.5],[hipX+7.6*tw,hipY+6],[hipX-7.6*tw,hipY+6]],R.skirt,M.skirt)}
  if(o.torsoFx)o.torsoFx(shX,shY,hipX,hipY,back);
  if(R.belt){poly([[hipX-6.8*tw,hipY-1.5],[hipX+6.8*tw,hipY-1.5],[hipX+6.8*tw,hipY+1],[hipX-6.8*tw,hipY+1]],R.belt,M.belt);if(!back&&R.buckle)blob(hipX,hipY-.2,1.4,1.3,R.buckle,true)}
  if(o.armsLate)o.arms={ao,aw,draw:drawArm};else{drawArm(ao);drawArm(aw)}
  if(R.pauldron)for(const sd of[-1,1])blob(shX+sd*8*tw,shY+.5,4.2*tw,3.4,R.pauldron,true);
  const hx=shX+f*H*.5,hy=shY-7.5+H*.3;o.head(hx,hy);
  if(!back){if(o.offhand)o.offhand(ao.hx,ao.hy,false);if(o.weapon)o.weapon(aw.hx,aw.hy+.8)}
  return aw}
// a weapon along +x from the hand; m = ramps, cls = weapon class
function vWeapon(hx,hy,ang,cls,m,b){b=SH(b);if(b==='Henkersbeil')cls='axe';
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);
  const P_=m.p,S_=m.s,T_=m.t,curve=b==='Krummsäbel'||b==='Mondsichel'||b==='Nachtzahn'?1:0;
  if(cls==='sword'||cls==='dagger'||cls==='great'){const L=cls==='great'?30:cls==='dagger'?12:21,w=cls==='great'?2.8:cls==='dagger'?1.7:2,gw=cls==='great'?5:3.6;
    limb(-6,0,-1,0,1.2,1.2,T_);blob(-6.8,0,1.7,1.7,m.gemPom?m.gem3:S_,true);
    const g=ctx.createLinearGradient(0,-w,0,w);g.addColorStop(0,P_[3]);g.addColorStop(.35,P_[2]);g.addColorStop(.55,P_[1]);g.addColorStop(1,P_[0]);ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(1,-w);if(curve)ctx.quadraticCurveTo(L*.6,-w-1,L,-w-3.5);else{ctx.lineTo(L-4,-w*.85);ctx.lineTo(L,0)}ctx.lineTo(L-4,w*.6);if(curve)ctx.quadraticCurveTo(L*.5,w+1.5,1,w);else ctx.lineTo(1,w);ctx.closePath();ctx.fill();
    if(!curve&&cls!=='dagger'){ctx.fillStyle=P_[0];ctx.fillRect(2,-.35,L-8,.7)}
    limb(0,-gw,0,gw,1.1,1.1,S_,true)}
  else if(cls==='axe'){const L=21;limb(-7,0,L,0,1.1,1.1,T_);const head=sd=>{ctx.save();ctx.scale(1,sd);poly([[L-7,-.8],[L-5,-7],[L-1,-9.5],[L+2,-8],[L,-.8]],P_,true);ctx.restore()};head(1);if(b==='Kriegsaxt'||b==='Henkersbeil')head(-1)}
  else if(cls==='mace'){const L=19;limb(-7,0,L,0,1.1,1.1,T_);
    if(b==='Kriegshammer'){poly([[L-1,-6],[L+4,-6],[L+4,6],[L-1,6]],P_,true);limb(L+4,0,L+8,0,1,.2,S_,true)}
    else if(b==='Keule')limb(0,0,L+2,0,1.4,3.6,T_);
    else{if(b==='Morgenstern'){ctx.strokeStyle=P_[3];ctx.lineWidth=1;for(let k=0;k<8;k++){const a=k/8*6.283;ctx.beginPath();ctx.moveTo(L+Math.cos(a)*3,Math.sin(a)*3);ctx.lineTo(L+Math.cos(a)*6.5,Math.sin(a)*6.5);ctx.stroke()}}blob(L,0,4.2,4.2,P_,true)}}
  else if(cls==='spear'){const L=26;limb(-14,0,L,0,1,1,T_);poly([[L-1,-1.2],[L+4,-2.6],[L+10,0],[L+4,2.6],[L-1,1.2]],P_,true);if(b==='Hellebarde')poly([[L-4,-1],[L-2,-7],[L+3,-7.5],[L+2,-1]],P_,true);if(m.glow)blob(L+5,0,2,1.2,m.gem3,true)}
  else if(cls==='staff'){const L=24;limb(-14,0,L,0,1.1,1,T_);if(b==='Aschestab'){limb(L,0,L+3,-3,.8,.6,S_,true);limb(L,0,L+3,3,.8,.6,S_,true)}
    const gl=ctx.createRadialGradient(L+3,0,0,L+3,0,8);gl.addColorStop(0,m.gem3[2]+'aa');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(L+3,0,8,0,7);ctx.fill();blob(L+3,0,2.6,2.6,[m.gem3[0],m.gem3[0],m.gem3[1],m.gem3[2]],true)}
  ctx.restore()}
const wRampsOf=it=>{const m=itemRamps(it);m.gem3=[m.gem[0],m.gem[0],m.gem[1],m.gem[2]];m.gemPom=!!(PXS[it.b]&&PXS[it.b][4]);m.glow=SH(it.b)==='Seelenspieß';return m};
const RUSTY={p:RP.rust,s:RP.iron,t:RP.wood,gem3:RP.ember};
function vShield(it,x,y,back,f){const m=itemRamps(it),k=SH(it.b);ctx.save();ctx.translate(x-f*1.5,y-5);
  if(back){blob(0,0,6.5,8,RP.wood);ctx.restore();return}
  if(k==='Rundschild'){blob(0,0,7.5,7.5,m.s,true);blob(0,0,6,6,m.p);blob(0,0,1.8,1.8,m.s,true)}
  else if(k==='Turmschild'){poly([[-6,-9],[6,-9],[6,9],[-6,9]],m.s,true);poly([[-4.8,-7.8],[4.8,-7.8],[4.8,7.8],[-4.8,7.8]],m.p,true);limb(0,-6,0,6,.9,.9,m.s,true);limb(-3.5,-2,3.5,-2,.9,.9,m.s,true)}
  else if(k==='Wappenschild'){poly([[-6.5,-8],[6.5,-8],[6,1],[0,9],[-6,1]],m.s,true);poly([[-5.3,-6.8],[5.3,-6.8],[4.8,.6],[0,7.4],[-4.8,.6]],m.p);blob(0,-1.5,1.8,1.8,[m.gem[0],m.gem[0],m.gem[1],m.gem[2]],true)}
  else{poly([[-6,-3],[-4,-8],[4,-8],[6,-3],[6,9],[-6,9]],m.p);ctx.fillStyle=m.p[0];ctx.fillRect(-.6,-5,1.2,10);ctx.fillRect(-3,-2,6,1.2)}
  ctx.restore()}
const HELMT={'Lederkappe':'cap','Eisenhelm':'iron','Topfhelm':'great','Hornhelm':'horn','Totenkrone':'crown'};
function vHelm(it,hx,hy,back,f){const m=itemRamps(it),t=HELMT[SH(it.b)]||'iron';
  if(t==='cap'){ctx.save();ctx.beginPath();ctx.rect(hx-8,hy-9,16,9.2);ctx.clip();blob(hx,hy,5,5.4,m.p);ctx.restore();limb(hx-4.8,hy-.3,hx+4.8,hy-.3,.9,.9,m.s,m.sm)}
  else if(t==='iron'){ctx.save();ctx.beginPath();ctx.rect(hx-8,hy-9,16,9.6);ctx.clip();blob(hx,hy,5.3,5.8,m.p,true);ctx.restore();limb(hx-5,hy,hx+5,hy,1,1,m.s,true);if(!back)limb(hx+f*.4,hy,hx+f*.4,hy+3.6,.7,.6,m.s,true)}
  else if(t==='great'||t==='horn'){poly([[hx-5.2,hy-5.5],[hx+5.2,hy-5.5],[hx+5,hy+5],[hx-5,hy+5]],m.p,m.pm);blob(hx,hy-5.4,5.2,2,m.p,m.pm);
    if(!back){ctx.fillStyle='#050403';ctx.fillRect(hx-4,hy-1.2,8,1.2);ctx.fillRect(hx-.5+f,hy+1,1,3)}
    if(t==='horn')for(const sd of[-1,1]){limb(hx+sd*4.8,hy-3,hx+sd*8.5,hy-7,1.4,1,m.s);limb(hx+sd*8.5,hy-7,hx+sd*7.6,hy-12,1,.3,m.s)}}
  else{poly([[hx-5,hy-3],[hx+5,hy-3],[hx+5,hy-.5],[hx-5,hy-.5]],m.s,true);for(const dx of[-4,0,4])poly([[hx+dx-1.2,hy-3],[hx+dx,hy-7],[hx+dx+1.2,hy-3]],m.s,true);if(!back)blob(hx,hy-1.8,1,1,[m.gem[0],m.gem[0],m.gem[1],m.gem[2]],true)}}
function heroLook(fl){const g=k=>{const it=P.eq[k];return it&&P.d.okS.has(it)?it:null};
  const R={skin:RP.skin,torso:RP.cloth,sleeve:RP.cloth,fore:RP.cloth,hand:RP.skin,legs:RP.pants,shin:RP.pants,feet:RP.shoe,belt:RP.shoe,skirt:RP.cloth,metal:{}};
  for(const[k,v]of Object.entries(myCls().look)){const r=RMP[v]||RP[v];if(!r)continue;if(k==='torso'){R.torso=R.sleeve=R.fore=R.skirt=r}else if(k==='legs'){R.legs=R.shin=r}else R[k]=r}
  const ar=g('armor'),gl=g('gloves'),bo=g('boots'),be=g('belt');let fx=null;
  if(ar){const m=itemRamps(ar),ab=SH(ar.b),plate=ab==='Plattenharnisch'||ab==='Schwarzer Harnisch';R.torso=R.skirt=m.p;R.metal.torso=R.metal.skirt=m.pm;R.sleeve=m.p;R.metal.sleeve=m.pm;
    if(plate){R.pauldron=m.s;R.skirt=m.s;R.metal.skirt=true}
    if(ab==='Kettenhemd'||ab==='Schuppenpanzer'){const sc=ab==='Schuppenpanzer';fx=(sx,sy,hx,hy)=>{ctx.fillStyle=m.p[0];for(let y=sy;y<hy+5;y+=sc?2:1.5)for(let x=hx-8;x<hx+8;x+=sc?3:1.5)if(((x+y)|0)%(sc?3:2)===0)ctx.fillRect(x+((y|0)%2),y,1,.7)}}
    if(ab==='Schwarzer Harnisch')fx=(sx,sy)=>{for(const sd of[-1,1])limb(sx+sd*8,sy-1,sx+sd*10,sy-6,1.3,.2,m.s,true);blob(sx,sy+7,1.5,1.5,RP.robe,true)}}
  if(gl){const m=itemRamps(gl);R.fore=R.hand=m.p;R.metal.fore=R.metal.hand=m.pm}
  if(bo){const m=itemRamps(bo);R.shin=R.feet=m.p;R.metal.shin=m.pm}
  if(be){const m=itemRamps(be);R.belt=m.p;R.buckle=m.s;R.metal.belt=m.pm}
  if(fl)for(const k in R)if(Array.isArray(R[k]))R[k]=RP.flash;
  return{R,fx}}
const GHOSTR={skin:RP.ghost,torso:RP.ghost,sleeve:RP.ghost,fore:RP.ghost,hand:RP.ghost,legs:RP.ghost,shin:RP.ghost,feet:RP.ghost,metal:{}};
const WLEN={dagger:13,sword:22,great:31,axe:22,mace:22,spear:36,staff:30};
function drawPlayer(){
  const[sx,sy]=iso(P.x,P.y),[fx,fy]=scrDir(P.face),back=fy<0,f=fx>=0?1:-1;
  for(const g of P.ghosts||[]){const[gx,gy]=iso(g.x,g.y),[gfx,gfy]=scrDir(g.face);ctx.save();ctx.translate(gx,gy);ctx.globalAlpha=.32*(1-g.t/.3);humanoid({R:GHOSTR,f:gfx>=0?1:-1,back:gfy<0,moving:true,ph:G.t*9,head:(hx,hy)=>blob(hx,hy,4,4.6,RP.ghost)});ctx.restore()}
  shadow(sx,sy,.42);
  // gait: the real pace picks the step, from an easy walk to a hard run, and the feet keep time with the ground
  const dT=Math.min(.1,Math.max(0,G.t-(P.gT??G.t))),gm=P.gX==null?0:hyp(P.x-P.gX,P.y-P.gY);P.gT=G.t;P.gX=P.x;P.gY=P.y;
  if(dT>0&&gm<3)P.gV=(P.gV||0)+(Math.min(20,gm/dT)-(P.gV||0))*Math.min(1,dT*10);
  const go=P.moving||!!P.dash,run=P.dash?1:go?clamp(((P.gV||0)-4.8)/2.4,0,1):0;P.gPh=(P.gPh||0)+(go?dT*Math.max(2.5,P.gV||4.2)*2.15/(1+run*.45):0);
  if(go&&run>.25&&!P.roll){const q=Math.sign(Math.sin(P.gPh));if(q!==P.gS){P.gS=q;smoke(P.x,P.y,1,'rgba(90,78,62,',2.5+run*2.5,.25)}}
  // swing: wind up, snap through, settle; the body steps into the blow
  const sp=P.atkT>0?1-P.atkT/P.atkDur:0,sw=sp<.32?-2.3*(1-Math.pow(1-sp/.32,2)):sp<.55?-2.3+4.2*Math.pow((sp-.32)/.23,2):1.9-.7*(1-Math.pow(1-(sp-.55)/.45,2));
  // a bow is drawn, not swung: pull until the arrow leaves (the shot resolves at .45), then the body gives a little to the recoil
  const rgW=P.atkT>0&&P.eq.weapon&&P.d.okS.has(P.eq.weapon)&&isRangedW(P.eq.weapon)?P.eq.weapon.cls:null,rgK=rgW&&sp<.45?Math.pow(sp/.45,.6):0;
  const lunge=rgW?(sp>.45&&sp<.8?-Math.sin((sp-.45)/.35*Math.PI)*(rgW==='xbow'?2.4:1.6):0):P.atkT>0&&sp>.28&&sp<.75?Math.sin((sp-.28)/.47*Math.PI)*4.5:0,lx=fx*lunge,ly=fy*lunge*.6;
  const th=Math.atan2(fy,fx),an=P.atkT>0?null:heroAnim(P,th,f);
  ctx.save();ctx.translate(sx+lx,sy+ly+(an?an.dy:0));if(P.leap)ctx.translate(0,-Math.sin(Math.min(1,P.leap.t/P.leap.dur)*Math.PI)*34);
  const{R,fx:tfx}=heroLook(P.hurt>0),helm=P.eq.helm&&P.d.okS.has(P.eq.helm)?P.eq.helm:null,wpn=P.eq.weapon&&P.d.okS.has(P.eq.weapon)?P.eq.weapon:null,sh=P.eq.offhand&&P.d.okS.has(P.eq.offhand)?P.eq.offhand:null;
  const head=(hx,hy)=>{blob(hx,hy,4,4.6,R.skin);if(back)blob(hx,hy-.6,4.4,4.6,RP.hair);else{ctx.save();ctx.beginPath();ctx.rect(hx-6,hy-7,12,5.2);ctx.clip();blob(hx,hy-.6,4.5,4.8,RP.hair);ctx.restore();ctx.fillStyle='#140a04';ctx.fillRect(hx-2.2+f*.7,hy-.4,1.2,1);ctx.fillRect(hx+1+f*.7,hy-.4,1.2,1)}
    if(helm)vHelm(helm,hx,hy,back,f)};
  // the weapon trails lower behind a runner, sweeps round in a whirl, is lifted high in a leap
  let wang=Math.atan2(fy,fx)+(P.atkT>0?sw:.9+run*.7*Math.abs(fx))*f,atk=P.atkT>0?wang:null,lean=go?.05+run*.17:0,sq=0;
  if(an){atk=an.atk;wang=an.wang;lean+=an.lean;sq+=an.sq}
  if(rgW){const kick=sp>.45&&sp<.7?Math.sin((sp-.45)/.25*Math.PI)*(rgW==='xbow'?.22:.12):0;atk=th;wang=th-kick*f;lean=-.04-kick*.3}
  if(P.dash){atk=th;wang=th+.15*f;lean=.32}
  if(P.leap){const q=Math.min(1,P.leap.t/P.leap.dur);if(q<.7){atk=-Math.PI/2;wang=-Math.PI/2+f*(.3+q*.4)}else{const k=(q-.7)/.3;atk=th*(1-k)+Math.PI/2*k;wang=-Math.PI/2+f*(.6+k*2.4)}}
  let whirlA=null;if(P.whirl>0){whirlA=(1-P.whirl/.35)*Math.PI*4;atk=th+whirlA*f;wang=atk}
  if(go&&!P.roll){sq+=Math.pow(Math.abs(Math.sin(P.gPh)),8)*(.025+run*.05)}
  ctx.transform(1,0,-f*lean*(Math.abs(fx)*.7+.3),1,0,0);if(sq)ctx.scale(1+sq*.5,1-sq);
  const o={R,f,back,dir:[fx*f,fy],moving:go&&!P.leap,ph:P.gPh,head,torsoFx:tfx,atk,stride:1+run*.55,knee:run*3.4+(P.leap?4:0),lift:1+run*1.3,bobA:1.1+run*1.6,armSwing:1+run*1,armLen:15-run*3,
    weapon:(x,y)=>{if(!wpn)return;if(rgW){BOWK=rgK;BOWHAND=R.skin;XBOLT=rgW==='xbow'&&sp>.45&&sp<.88?0:1}try{vWeapon(x,y,wang,wpn.cls,wRampsOf(wpn),wpn.b)}finally{BOWK=0;BOWHAND=null;XBOLT=1}if(P.atkT>0&&sp>.3&&sp<.66&&!P.whirl&&!rgW){const L=WLEN[SH(wpn.b)==='Henkersbeil'?'axe':wpn.cls]||22,c=Math.cos(wang),s2=Math.sin(wang);P.trail.push({ox:lx+x+c*L,oy:ly+y+s2*L,ix:lx+x+c*L*.42,iy:ly+y+s2*L*.42,t:0})}
      if(an&&an.glow){const L=WLEN[wpn.cls]||22;ctx.save();ctx.globalCompositeOperation='lighter';const gx=x+Math.cos(wang)*L,gy=y+Math.sin(wang)*L,g=ctx.createRadialGradient(gx,gy,0,gx,gy,9*an.glow);g.addColorStop(0,`rgba(255,220,150,${.8*an.glow})`);g.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=g;ctx.fillRect(gx-10,gy-10,20,20);ctx.restore()}},
    offhand:sh?(x,y,b)=>vShield(sh,x,y,b,f):wpn&&isDualB(wpn.b)?(x,y)=>vWeapon(x,y,wang+(P.atkT>0?-.5:.35)*f,wpn.cls,wRampsOf(wpn),wpn.b):null};
  if(an&&an.hit&&P.anHit!==P.anS){P.anHit=P.anS;heroImpact(P,an.hit)}
  if(P.dead){o.moving=false;o.weapon=null;ctx.translate(0,-3);ctx.rotate(-Math.PI/2*f);ctx.translate(0,22);humanoid(o);ctx.restore();return}
  if(P.roll>0){heroRoll(o);ctx.restore();return}
  if(whirlA!=null){const c=Math.cos(whirlA);ctx.scale((c<0?-1:1)*Math.max(.35,Math.abs(c)),1)}
  if(an&&an.ground)an.ground();if(an&&an.alpha!=null)ctx.globalAlpha*=Math.max(0,an.alpha);if(P.veilT>0)ctx.globalAlpha*=.32+.08*Math.sin(G.t*9);
  const aw=humanoid(o);if(an&&an.fx){const L=wpn?(WLEN[wpn.cls]||22):6;an.fx(aw.hx+Math.cos(wang)*L,aw.hy+.8+Math.sin(wang)*L,aw.hx,aw.hy)}
  if(P.ward>0){for(let k=0;k<6;k++){const a=G.t*3+k*1.047,x=Math.cos(a)*17,y=-18+Math.sin(a)*8+Math.sin(G.t*4+k)*2;limb(x-2.6,y+.6,x+2.6,y-.6,.9,.9,RP.bone)}}
  ctx.restore()}
// the roll: a dive, a tight tuck over the shoulder with a blur of what was, and a crouch on landing
function heroRoll(o){const p=1-P.roll/.38,[dx,dy]=scrDir(P.rollA??P.face),rf=dx>=0?1:-1,E=x=>{x=clamp(x,0,1);return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2};
  const rot=q=>rf*E((q-.1)/.72)*Math.PI*2,tk=q=>Math.sin(clamp((q-.06)/.8,0,1)*Math.PI),hop=q=>Math.sin(clamp(q,0,1)*Math.PI)*7;
  o.weapon=null;o.offhand=null;o.moving=true;o.ph=p*14;o.stride=.5;o.knee=4*tk(p);o.atk=null;o.armLen=10;
  if(P.rfx!==P.rollA){P.rfx=P.rollA;smoke(P.x,P.y,5,'rgba(90,78,62,',5,.35)}
  if(p>.84&&P.rfl!==P.rollA){P.rfl=P.rollA;smoke(P.x,P.y,4,'rgba(90,78,62,',4,.25)}
  if(Math.random()<.5)smoke(P.x,P.y,1,'rgba(90,78,62,',3,.2);
  const one=(q,a)=>{const t=tk(q);ctx.save();ctx.globalAlpha*=a;ctx.translate(-dx*(p-q)*60,-dy*(p-q)*30-hop(q));ctx.translate(0,-13);ctx.rotate(rot(q));ctx.scale(1-.22*t,1-.34*t);ctx.translate(0,13);humanoid(o);ctx.restore()};
  for(const k of[2,1])if(p-k*.07>0)one(p-k*.07,.18/k);
  if(p>.86){const l=(p-.86)/.14;ctx.scale(1+.08*(1-l),1-.14*(1-l))}one(p,1);
  // a pale crescent where the body turned over
  if(p>.12&&p<.8){const r=rot(p);ctx.save();ctx.translate(0,-13-hop(p));ctx.strokeStyle='rgba(255,244,220,.35)';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,17,r-rf*2.2-Math.PI/2,r-Math.PI/2,rf<0);ctx.stroke();ctx.restore()}}
// a skill's own motion: stamp the staff into the ground, thrust, call down the sky, roar, kneel to set a trap
const ANK={nova:'nova',ward:'ward',slam:'stomp',trap:'kneel',fire:'fire',chain:'chain',pierce:'thrust',multi:'thrust',blink:'blink',meteor:'meteor',rain:'sky',cry:'roar',venom:'roar',
    m_bolt:'fire',m_ring:'nova',m_jump:'blink',m_storm:'meteor',m_fuse:'fuse',atem:'roar',schwur:'sky'},
  AND={stomp:.5,kneel:.5,thrust:.42,sky:.62,roar:.6,fire:.55,nova:.7,chain:.62,meteor:.95,blink:.5,ward:.7,fuse:1.05};
// the colours a spell burns in: the Aschemagier's follow the staff's element, the old spells keep their own
const ANPAL={fire:{c:'255,245,200',a:'255,200,90',b:'240,90,20',g:'255,120,30'},frost:{c:'240,250,255',a:'190,230,255',b:'90,170,255',g:'150,210,255'},
  light:{c:'245,248,255',a:'205,220,255',b:'120,150,255',g:'170,200,255'},poison:{c:'235,255,190',a:'170,235,90',b:'70,150,30',g:'140,220,80'}};
const anElem=id=>id&&id.startsWith('m_')?(typeof mElem==='function'&&mElem())||'fire':{nova:'frost',chain:'light'}[id]||'fire';
function heroAnim(Q,th,f){const k=Q.anK&&ANK[Q.anK];if(!k)return null;const el=anElem(Q.anK),C=Object.assign({el},ANPAL[el]);Q.anC=C;const d=AND[k],p=(G.t-Q.anS)/d;if(p<0||p>=1){Q.anK=null;return null}
  const E=x=>1-Math.pow(1-clamp(x,0,1),3),I=x=>{x=clamp(x,0,1);return x*x*x},L=(a,b,t)=>a+(b-a)*t,up=-Math.PI/2,idle=th+.9*f,o={atk:null,wang:idle,sq:0,dy:0,lean:0,glow:0,hit:null};
  const set=(atk,wang,sq,dy,lean)=>{o.atk=atk;o.wang=wang;o.sq=sq;o.dy=dy;o.lean=lean};
  const zig=(x1,y1,x2,y2,n,amp,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);for(let i=1;i<n;i++){const t=i/n;ctx.lineTo(x1+(x2-x1)*t+(Math.random()-.5)*amp,y1+(y2-y1)*t+(Math.random()-.5)*amp)}ctx.lineTo(x2,y2);ctx.stroke()};
  const glow=(x,y,r,c,a)=>{if(a<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore()};
  // Glutkugel: the ball leaves the staff at once, the body takes the kick, flames lick round the tip
  if(k==='fire'){const bkA=Math.atan2(-.5,-f*.9);
    if(p<.08){const q=I(p/.08);set(L(bkA,th,q),L(bkA,th,q),.04,0,L(-.06,.1,q))}
    else if(p<.32){const q=E((p-.08)/.24);set(th,th-f*.08*q,.05*(1-q),0,L(.1,-.14,q))}
    else{const q=E((p-.32)/.68);set(L(th,th*.6,q),L(th-f*.08,idle,q),0,0,-.14*(1-q))}
    o.fx=(tx,ty,hx,hy)=>{const a=1-E(p/.6);if(a<=.02)return;glow(tx,ty,14+16*a,C.g,.9*a);glow(hx,hy,9,C.g,.55*a);
      // flames thrown back off the tip, a white-hot core, and a coal glowing in the hand
      for(let i=0;i<7;i++){const fl=.55+.45*Math.sin(G.t*47+i*2.1),ln=(8+12*a)*fl,ang=th+Math.PI+(i-3)*.38+Math.sin(G.t*23+i)*.2;
        ctx.fillStyle=i%2?`rgba(${C.a},${a})`:`rgba(${C.b},${a})`;ctx.beginPath();ctx.ellipse(tx+Math.cos(ang)*ln*.45,ty+Math.sin(ang)*ln*.45-2*fl,ln*.5,2.4,ang,0,7);ctx.fill()}
      ctx.fillStyle=`rgba(${C.b},${a})`;ctx.beginPath();ctx.arc(tx,ty,2.5+3.5*a,0,7);ctx.fill();ctx.fillStyle=`rgba(${C.c},${a})`;ctx.beginPath();ctx.arc(tx,ty,1.2+2*a,0,7);ctx.fill();
      ctx.fillStyle=`rgba(${C.a},${.9*a})`;ctx.beginPath();ctx.arc(hx,hy,1.8,0,7);ctx.fill();
      if(el==='light'){ctx.save();ctx.globalCompositeOperation='lighter';zig(hx,hy,tx,ty,4,3,1.2,`rgba(${C.c},${a})`);zig(tx,ty,tx+Math.cos(th)*14,ty+Math.sin(th)*14,4,6,1.2,`rgba(${C.a},${a})`);ctx.restore()}
      if(el==='poison')for(let i=0;i<4;i++){const t=(G.t*1.4+i/4)%1;ctx.strokeStyle=`rgba(${C.a},${(1-t)*a})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(tx+Math.sin(i*2+G.t)*4,ty-t*14,1+t*2.5,0,7);ctx.stroke()}
      for(let i=0;i<3;i++){const t=(G.t*1.7+i/3)%1;ctx.fillStyle=`rgba(80,70,60,${.35*(1-t)*a})`;ctx.beginPath();ctx.arc(tx+Math.sin(G.t*3+i)*3,ty-t*16,1.5+t*3,0,7);ctx.fill()}};return o}
  // Frostring: up on the toes, the staff driven down, frost climbing the body and a ring of rime at the feet
  if(k==='nova'){const hiA=up,hiW=up+f*.2,loA=Math.atan2(.95,f*.35),loW=Math.PI/2-f*.1;
    if(p<.07){const q=E(p/.07);set(L(th,hiA,q),L(idle,hiW,q),-.08*q,-3*q,-.04*q)}
    else if(p<.13){const q=I((p-.07)/.06);set(L(hiA,loA,q),L(hiW,loW,q),L(-.08,.18,q),L(-3,3,q),.08*q)}
    else if(p<.5){set(loA,loW,.18-.06*E((p-.13)/.37),3,.08)}
    else{const q=E((p-.5)/.5);set(L(loA,th,q),L(loW,idle,q),.12*(1-q),3*(1-q),.08*(1-q))}
    if(p>=.13)o.hit='nova';
    o.ground=()=>{if(p<.13)return;const q=E((p-.13)/.6),a=1-q;ctx.save();ctx.strokeStyle=`rgba(${C.a},${.8*a})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,10+22*q,5+11*q,0,0,7);ctx.stroke();
      ctx.fillStyle=`rgba(${C.a},${.25*a})`;ctx.beginPath();ctx.ellipse(0,0,8+14*q,4+7*q,0,0,7);ctx.fill();ctx.restore()};
    o.fx=()=>{const a=p<.13?p/.13:1-E((p-.13)/.8);glow(0,-22,26,C.g,.45*a);
      for(let i=0;i<8;i++){const t=((p*1.6)+i/8)%1,ang=i*.785+G.t*.8,x=Math.cos(ang)*(10+4*Math.sin(i)),y=-t*44-2,s=2.4*(1-t)+.6;
        ctx.save();ctx.translate(x,y);ctx.rotate(G.t*3+i);ctx.fillStyle=`rgba(${C.c},${.9*a*(1-t)})`;ctx.beginPath();ctx.moveTo(0,-s*1.6);ctx.lineTo(s,0);ctx.lineTo(0,s*1.6);ctx.lineTo(-s,0);ctx.closePath();ctx.fill();ctx.restore()}};return o}
  // Kettenblitz: the staff thrust out and held while the hero shakes with it, sparks running up the arm and over the body
  if(k==='chain'){const jit=p>.06&&p<.6?(Math.random()-.5)*1.6:0;
    if(p<.06){const q=I(p/.06);set(L(th+f*1.2,th,q),L(th+f*1.2,th,q),.03,0,.1*q)}
    else if(p<.6){set(th,th+jit*.05,.03,jit,.14+jit*.02)}
    else{const q=E((p-.6)/.4);set(L(th,th*.6,q),L(th,idle,q),.03*(1-q),0,.14*(1-q))}
    o.fx=(tx,ty,hx,hy)=>{const a=p<.6?1:1-E((p-.6)/.3);if(a<=0)return;glow(tx,ty,18,'170,200,255',.9*a);glow(0,-24,24,'120,160,255',.3*a);
      ctx.fillStyle=`rgba(230,240,255,${a})`;ctx.beginPath();ctx.arc(tx,ty,2.2+Math.random()*1.2,0,7);ctx.fill();
      ctx.save();ctx.globalCompositeOperation='lighter';
      zig(hx,hy,tx,ty,5,3,1.4,`rgba(220,235,255,${a})`);zig(tx,ty,tx+Math.cos(th)*12,ty+Math.sin(th)*12,4,5,1.2,`rgba(200,220,255,${.9*a})`);
      for(let i=0;i<2;i++)if(Math.random()<.7){const ang=Math.random()*6.28,x0=(Math.random()-.5)*10,y0=-14-Math.random()*22;zig(x0,y0,x0+Math.cos(ang)*12,y0+Math.sin(ang)*9,4,4,1,`rgba(170,200,255,${.8*a})`)}
      ctx.restore()};return o}
  // Meteor: the hero rises off the ground with the staff to the sky, a ring of fire runes turns overhead, then the staff tears it down
  if(k==='meteor'){const hiW=up+f*.06,dn=th+f*.6;
    if(p<.2){const q=E(p/.2);set(L(th,up,q),L(idle,hiW,q),-.07*q,-8*q,-.05*q)}
    else if(p<.62){const b=Math.sin(G.t*6)*1.2;set(up,hiW+Math.sin(G.t*30)*.03,-.07,-8+b,-.05)}
    else if(p<.72){const q=I((p-.62)/.1);set(L(up,th,q),L(hiW,dn,q),L(-.07,.16,q),L(-8,2,q),L(-.05,.16,q))}
    else{const q=E((p-.72)/.28);set(L(th,th*.6,q),L(dn,idle,q),.16*(1-q),2*(1-q),.16*(1-q))}
    if(p>=.72)o.hit='meteor';
    o.fx=(tx,ty)=>{const a=p<.2?E(p/.2):p<.72?1:1-E((p-.72)/.15);if(a<=0)return;glow(tx,ty,20,C.g,.9*a);ctx.fillStyle=`rgba(${C.a},${a})`;ctx.beginPath();ctx.arc(tx,ty,2.6,0,7);ctx.fill();
      const cy=-66;ctx.save();ctx.strokeStyle=`rgba(${C.b},${.85*a})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,cy,15,5,0,0,7);ctx.stroke();
      for(let i=0;i<8;i++){const ang=G.t*2.4+i*.785,x=Math.cos(ang)*15,y=cy+Math.sin(ang)*5;ctx.fillStyle=`rgba(${i%2?C.a:C.c},${(.6+.4*Math.sin(G.t*9+i))*a})`;ctx.fillRect(x-1.5,y-2,3,4)}
      for(let i=0;i<4;i++){const t=(G.t*1.3+i/4)%1;ctx.fillStyle=`rgba(${C.b},${(1-t)*a})`;ctx.fillRect(Math.sin(i*2.3)*12-1,cy+t*30,2,2)}ctx.restore()};
    o.ground=()=>{const a=p<.72?Math.min(1,p/.2):1-E((p-.72)/.2);if(a<=0)return;ctx.save();ctx.fillStyle=`rgba(${C.b},${.2*a})`;ctx.beginPath();ctx.ellipse(0,0,18,9,0,0,7);ctx.fill();ctx.restore()};return o}
  // Aschesprung: the hero comes together out of a whirl of embers and ash, tall and thin first, then lands in a crouch
  if(k==='blink'){const loA=Math.atan2(.9,f*.5),loW=Math.PI/2-f*.4;
    if(p<.32){const q=E(p/.32);set(loA,loW,L(-.3,0,q),L(-6,0,q),0);o.alpha=Math.min(1,q*1.2)*(.75+.25*Math.sin(G.t*60))}
    else if(p<.46){const q=E((p-.32)/.14);set(loA,loW,.18*q,2*q,.1*q)}
    else{const q=E((p-.46)/.54);set(L(loA,th,q),L(loW,idle,q),.18*(1-q),2*(1-q),.1*(1-q))}
    if(p>=.32)o.hit='blink';
    o.fx=()=>{const a=p<.32?1:1-E((p-.32)/.4);if(a<=0)return;const sp=1-Math.min(1,p/.32);ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<14;i++){const ang=i*.449+G.t*7,r=4+22*sp*(.6+.4*Math.sin(i)),x=Math.cos(ang)*r,y=-20+Math.sin(ang)*r*.5-(i%4)*5*sp;ctx.fillStyle=i%3?`rgba(${C.b},${a})`:`rgba(${C.a},${a})`;ctx.fillRect(x-1,y-1,2,2)}ctx.restore();
      for(let i=0;i<6;i++){const t=(G.t*.9+i/6)%1;ctx.fillStyle=`rgba(60,55,50,${.5*a*(1-t)})`;ctx.fillRect(Math.sin(i*1.7)*14,-40+t*40,2,2)}};return o}
  // Verschmelzung: the hero rises with the staff overhead while the four elements circle closer and closer, then all burst out at once
  if(k==='fuse'){const hiW=up+f*.05;
    if(p<.18){const q=E(p/.18);set(L(th,up,q),L(idle,hiW,q),-.06*q,-10*q,-.04*q)}
    else if(p<.5){const b=Math.sin(G.t*30)*.8*(p-.18)/.32;set(up,hiW+b*.05,-.06,-10+Math.sin(G.t*5)*1.2+b,-.04)}
    else if(p<.6){const q=I((p-.5)/.1);set(up,hiW,L(-.06,.2,q),L(-10,2,q),0)}
    else{const q=E((p-.6)/.4);set(L(up,th,q),L(hiW,idle,q),.2*(1-q),2*(1-q),0)}
    if(p>=.6)o.hit='fuse';
    o.fx=(tx,ty)=>{const a=p<.6?Math.min(1,p/.15):1-E((p-.6)/.3);if(a<=0)return;const rr=p<.5?22-14*E((p-.05)/.45):8+30*E((p-.5)/.3);
      ELK.forEach((k2,i)=>{const P2=ANPAL[k2],ang=G.t*(4+p*6)+i*1.571,x=Math.cos(ang)*rr,y=-24+Math.sin(ang)*rr*.45;glow(x,y,10,P2.g,.8*a);ctx.fillStyle=`rgba(${P2.a},${a})`;ctx.beginPath();ctx.arc(x,y,2.6,0,7);ctx.fill();ctx.fillStyle=`rgba(${P2.c},${a})`;ctx.beginPath();ctx.arc(x,y,1.2,0,7);ctx.fill()});
      glow(tx,ty,16,'255,240,210',.9*a)};
    o.ground=()=>{const a=p<.6?Math.min(1,p/.18):1-E((p-.6)/.3);if(a<=0)return;ctx.save();ctx.lineWidth=1.5;ELK.forEach((k2,i)=>{ctx.strokeStyle=`rgba(${ANPAL[k2].b},${.6*a})`;ctx.beginPath();ctx.ellipse(0,0,14+i*3,7+i*1.5,0,i*1.57+G.t*2,i*1.57+G.t*2+3.6);ctx.stroke()});ctx.restore()};return o}
  // Knochenwall: the staff planted upright as a guard, a ring of bone runes on the ground, a pale shimmer over the body
  if(k==='ward'){const gA=Math.atan2(.25,f*.7),gW=up+f*.06;
    if(p<.14){const q=E(p/.14);set(L(th,gA,q),L(idle,gW,q),.1*q,1.5*q,-.04*q)}
    else if(p<.6){set(gA,gW,.1-.1*E((p-.14)/.2),1.5*(1-E((p-.14)/.2)),-.04)}
    else{const q=E((p-.6)/.4);set(L(gA,th,q),L(gW,idle,q),0,0,-.04*(1-q))}
    o.ground=()=>{const q=E(Math.min(1,p/.3)),a=p<.6?q:1-E((p-.6)/.4),r=26-6*q;if(a<=0)return;ctx.save();ctx.strokeStyle=`rgba(236,228,200,${.8*a})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,r,r*.5,0,0,7);ctx.stroke();
      for(let i=0;i<8;i++){const ang=i*.785-G.t*1.5,x=Math.cos(ang)*r,y=Math.sin(ang)*r*.5;ctx.fillStyle=`rgba(236,228,200,${.9*a})`;ctx.fillRect(x-1,y-2.5,2,5)}ctx.restore()};
    o.fx=(tx,ty)=>{const a=p<.6?Math.min(1,p/.14):1-E((p-.6)/.4);glow(0,-22,26,'236,228,200',.35*a);glow(tx,ty,12,'255,250,230',.7*a);ctx.fillStyle=`rgba(250,246,230,${a})`;ctx.beginPath();ctx.arc(tx,ty,2,0,7);ctx.fill()};return o}
  if(k==='stomp'){const hiA=up,hiW=up+f*.25,loA=Math.atan2(.95,f*.35),loW=Math.PI/2-f*.12;
    if(p<.16){const q=E(p/.16);set(L(th,hiA,q),L(idle,hiW,q),-.07*q,-3*q,-.05*q);o.glow=q}
    else if(p<.26){const q=I((p-.16)/.1);set(L(hiA,loA,q),L(hiW,loW,q),L(-.07,.16,q),L(-3,3,q),L(-.05,.1,q));o.glow=1}
    else{const q=E((p-.5)/.5);set(L(loA,th,q),L(loW,idle,q),.16*(1-E((p-.26)/.4)),3*(1-q),.1*(1-q));o.glow=1-E((p-.26)/.3);o.hit='stomp'}}
  else if(k==='kneel'){const q=p<.3?E(p/.3):p<.6?1:1-E((p-.6)/.4);set(L(th,Math.atan2(1,f*.6),q),L(idle,Math.PI/2-f*.5,q),.22*q,4*q,.12*q);if(p>.3)o.hit='kneel'}
  else if(k==='thrust'){const bkA=Math.atan2(-.5,-f*.9);
    if(p<.18){const q=E(p/.18);set(L(th,bkA,q),L(idle,bkA,q),.04*q,0,-.1*q);o.glow=q*.6}
    else if(p<.3){const q=I((p-.18)/.12);set(L(bkA,th,q),L(bkA,th,q),L(.04,-.03,q),0,L(-.1,.16,q));o.glow=.6+q*.4}
    else{const q=E((p-.55)/.45);set(th,L(th,idle,q),-.03*(1-q),0,.16*(1-q));o.glow=1-E((p-.3)/.3)}}
  else if(k==='sky'){const hiW=up+f*.1,thr=Math.atan2(-.2,f);
    if(p<.22){const q=E(p/.22);set(L(th,up,q),L(idle,hiW,q),-.08*q,-3*q,-.06*q);o.glow=q}
    else if(p<.62){const w=Math.sin(G.t*40)*.04;set(up,hiW+w,-.08,-3,-.06);o.glow=1}
    else if(p<.74){const q=I((p-.62)/.12);set(L(up,thr,q),L(hiW,thr,q),L(-.08,.06,q),L(-3,0,q),L(-.06,.14,q));o.glow=1}
    else{const q=E((p-.74)/.26);set(L(thr,th,q),L(thr,idle,q),.06*(1-q),0,.14*(1-q))}}
  else if(k==='roar'){const sh=p>.35&&p<.8?Math.sin(G.t*70)*.8:0;
    if(p<.3){const q=E(p/.3);set(L(th,Math.atan2(.6,-f*.8),q),L(idle,Math.PI/2+f*.9,q),.12*q,2*q,.1*q)}
    else if(p<.42){const q=I((p-.3)/.12);set(L(Math.atan2(.6,-f*.8),up,q),L(Math.PI/2+f*.9,up-f*.2,q),L(.12,-.1,q),L(2,-2,q),L(.1,-.12,q));o.hit=p>.38?'roar':null}
    else{const q=E((p-.7)/.3);set(L(up,th,q),L(up-f*.2,idle,q),-.1*(1-q),-2*(1-q)+sh,-.12*(1-q));o.hit='roar'}}
  return o}
// the ground answers a stamp: dust, a ring and a jolt for the one who stamped
function heroImpact(Q,k){const gx=Q.x+Math.cos(Q.face)*.45,gy=Q.y+Math.sin(Q.face)*.45;
  if(k==='stomp'){shock(gx,gy,1.5,'220,200,160',.35,3);smoke(gx,gy,6,'rgba(90,78,62,',5,.35);sparks(gx,gy,.1,0,8,['#fff0c8','#ffc070','#c8a070'],4,3.2);flash(gx,gy,.2,36,'255,220,160',.16);if(!Q.mpRemote)G.shake=Math.max(G.shake||0,3)}
  else if(k==='kneel')smoke(gx,gy,4,'rgba(70,80,50,',4,.25);
  else if(k==='nova'){const C=Q.anC||ANPAL.frost,hx=c=>'#'+c.split(',').map(v=>(+v).toString(16).padStart(2,'0')).join('');shock(gx,gy,1.2,C.a,.35,3);sparks(gx,gy,.1,0,10,[hx(C.c),hx(C.a),hx(C.b)],4,3.2);smoke(gx,gy,4,'rgba('+C.a+',',4,.4);if(!Q.mpRemote)G.shake=Math.max(G.shake||0,3)}
  else if(k==='meteor'){smoke(Q.x,Q.y,5,'rgba(90,78,62,',5,.3);shock(Q.x,Q.y,1.4,'255,140,60',.3,2)}
  else if(k==='blink'){smoke(Q.x,Q.y,4,'rgba(60,55,50,',5,.3)}
  else if(k==='fuse'){smoke(Q.x,Q.y,6,'rgba(90,78,62,',5,.35)}
  else if(k==='roar'){shock(Q.x,Q.y,2.2,'255,170,110',.35,2);smoke(Q.x,Q.y,5,'rgba(90,78,62,',5,.4);if(!Q.mpRemote)G.shake=Math.max(G.shake||0,2)}}
function drawEnemy(e){
  const[sx,sy]=iso(e.x,e.y);if(sx<-80||sx>W+80||sy<-140||sy>H+60)return;const s=e.scale;
  shadow(sx,sy,.38*s);
  ctx.save();ctx.translate(sx,sy);
  const[fx,fy]=scrDir(e.face),fl=e.flash>0&&!e.dead,F=r=>fl?RP.flash:(e.pal&&e.pal.get(r))||r,back=fy<0,f=fx>=0?1:-1,ph=e.anim*9;
  if(e.dead){const l0=e.look||e.type,p=Math.min(1,e.dieT/.45),ea=1-Math.pow(1-p,3);
    if(l0==='wraith'||l0==='golem'){if(e.dieT>.3){ctx.restore();return}ctx.globalAlpha=1-e.dieT/.3;ctx.scale(1+e.dieT,1-e.dieT*2)}
    else{ctx.globalAlpha=e.dieT>18?Math.max(0,1-(e.dieT-18)/6):1;const[ffx]=scrDir(e.fallA||0),fd=ffx>=0?1:-1,bounce=p<1?0:Math.sin(Math.min(1,(e.dieT-.45)/.3)*Math.PI)*.08*Math.max(0,1-(e.dieT-.45)/.3);ctx.rotate(fd*(ea*Math.PI/2-bounce))}}
  else{const h=e.hitT||0;if(h>0){const[rx,ry]=scrDir(Math.atan2(e.y-P.y,e.x-P.x)),q=h/.22;ctx.translate(rx*q*6,ry*q*3);ctx.scale(1+q*.14,1-q*.12)}
    if(e.lungeT>0){const l=Math.sin(e.lungeT/.22*Math.PI)*6;ctx.translate(fx*l,fy*l*.5)}}
  ctx.scale(s,s);
  const tel=G.tele.find(t=>t.owner===e),wind=tel?clamp(tel.t/tel.dur,0,1):0;
  if(!e.dead&&(e.rank==='champ'||e.rank==='unique')){ctx.fillStyle=e.rank==='unique'?'rgba(232,151,58,.3)':'rgba(122,164,255,.3)';ctx.beginPath();ctx.ellipse(0,0,16,8,0,0,7);ctx.fill()}
  const look=e.look||e.type,atk=wind?Math.atan2(fy,fx)-(1.7-wind*.5)*f:e.lungeT>0?Math.atan2(fy,fx)+(.1+(1-e.lungeT/.22)*1.1)*f:null,eyes=(hx,hy,c)=>{if(back)return;ctx.fillStyle=c;ctx.fillRect(hx-2.3+f*.7,hy-.6,1.3,1.2);ctx.fillRect(hx+1+f*.7,hy-.6,1.3,1.2)};
  const skull=(hx,hy)=>{blob(hx,hy,3.8,4.2,F(RP.bone));if(!back){ctx.fillStyle='#0a0806';ctx.fillRect(hx-2.4+f*.6,hy-1,1.6,1.6);ctx.fillRect(hx+.8+f*.6,hy-1,1.6,1.6);ctx.fillRect(hx-1.5+f*.6,hy+2.2,3,.8)}};
  const ribs=(sx_,sy_,hx,hy)=>{for(let k=0;k<4;k++)limb(sx_-5+k*.4,sy_+2.5+k*2.6,sx_+5-k*.4,sy_+2.5+k*2.6,.7,.7,F(RP.bone));limb(hx,hy,sx_,sy_+1,.8,.8,F(RP.bone))};
  if(e.gear)rgDrawGear(e,{F,f,back,ph,atk,fx,fy,wind});
  else if(look==='scorp'){const S=F(RP.sand),ux=fx,uy=fy*.6,lift=wind,at=e.lungeT>0?1-e.lungeT/.22:0;
    for(let k=0;k<3;k++)for(const sd of[-1,1]){const w2=Math.sin(ph*1.5+k*1.3+(sd>0?1.5:0))*2,kx=sd*(9+k*1.4),ky=-6+k*2.2+w2;limb(sd*2.5,-4.5+k*1.6,kx,ky,.9,.8,S);limb(kx,ky,sd*(12.5+k*1.6),-.3+k*.5,.8,.35,S)}
    for(let k=3;k>=0;k--)blob(-ux*(4+k*3.1),-6-uy*(4+k*2.8),4.6-k*.45,3.5-k*.3,S,true);blob(ux*3,-6+uy*2,4.3,3.4,S,true);
    for(const sd of[-1,1]){const ox=ux*6-uy*sd*5,oy=-6+uy*4+ux*sd*2.2,cx=ox+ux*5+lift*ux*2,cy=oy+uy*4-1;limb(ux*2-uy*sd*2,-6,ox,oy,1.3,1.1,S);limb(ox,oy,cx,cy,1.1,.9,S);blob(cx+ux*1.4,cy+uy,2.8,1.9,S,true);limb(cx+ux*2,cy+uy,cx+ux*4.5-uy*sd*1.5,cy+uy*2,.6,.2,S)}
    let tx=-ux*14,ty=-6-uy*12;for(let k=1;k<=5;k++){const t=k/5,nx=-ux*14+ux*t*(9+lift*7+at*6),ny=-6-uy*12-Math.sin(t*Math.PI*.85)*15-t*7-lift*5+at*t*10;limb(tx,ty,nx,ny,2.1-t*.9,1.9-t*.9,S,true);tx=nx;ty=ny}
    limb(tx,ty,tx+ux*4.5,ty+3+at*4,1.1,.2,F(RP.dark),true);if(e.elem&&!e.dead)blob(tx,ty,1.6,1.6,e.elem==='fire'?RP.ember:e.elem==='frost'?RP.ghost:RMP.venom,true);
    if(!back){ctx.fillStyle='#ff3a2a';ctx.fillRect(ux*5.5-1.6,-8+uy*2,1.1,1.1);ctx.fillRect(ux*5.5+.6,-8+uy*2,1.1,1.1)}}
  else if(look==='spider'){const wk=Math.sin(ph*1.6);for(let k=0;k<4;k++)for(const sd of[-1,1]){const w=Math.sin(ph*1.6+k+(sd>0?1.5:0))*2.5,kx=sd*(9+k*1.5),ky=-13+k*1.5+w;limb(sd*2,-7,kx,ky,1,.8,F(RP.dark));limb(kx,ky,sd*(14+k*2.2),-.5+k*.4,.8,.4,F(RP.dark))}
    blob(-fx*5,-8-fy*2,8,6.2,F(RP.dark),true);blob(fx*4,-7.5+fy*2,4.6,3.8,F(RP.dark),true);if(!back){ctx.fillStyle='#ff3a2a';ctx.fillRect(fx*6-2,-9+fy*2,1.2,1.2);ctx.fillRect(fx*6+1,-9+fy*2,1.2,1.2)}}
  else if(look==='wraith'){const fl2=Math.sin(G.t*3+e.anim)*2.5;ctx.translate(0,-4+fl2);ctx.globalAlpha=.78;
    humanoid({R:{torso:F(RP.ghost),sleeve:F(RP.ghost),hand:F(RP.ghost)},f,back,robe:true,moving:false,armLen:13,atk:e.charge>0?Math.atan2(fy,fx):null,head:(hx,hy)=>{blob(hx,hy,4.4,5,F(RP.ghost));eyes(hx,hy,'#0a1430')}});
    ctx.globalAlpha=1;if(e.charge>0){const g=ctx.createRadialGradient(fx*12,-24,0,fx*12,-24,6);g.addColorStop(0,'#ffffff');g.addColorStop(1,'rgba(140,200,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(fx*12,-24,6,0,7);ctx.fill()}}
  else if(look==='golem'){const ar=wind?-wind*12:Math.sin(ph)*2;poly([[-13,-2],[-15,-25],[-8,-36],[8,-38],[15,-25],[13,-2]],F(RP.stone));blob(0,-33,6,4.5,F(RP.stone));
    for(const sd of[-1,1]){limb(sd*14,-30,sd*18,-18+ar,4.2,3.8,F(RP.stone));blob(sd*18,-14+ar,5,4.6,F(RP.stone))}
    ctx.strokeStyle='#5aa8ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-6,-26);ctx.lineTo(-1,-18);ctx.lineTo(-4,-10);ctx.moveTo(5,-30);ctx.lineTo(8,-20);ctx.stroke();if(!back){ctx.fillStyle='#8cc8ff';ctx.fillRect(-3+fx*3,-35,2,1.5);ctx.fillRect(2+fx*3,-35,2,1.5)}}
  else if(look==='cult'){humanoid({R:{torso:F(RP.robe),sleeve:F(RP.robe),hand:F(RP.skin)},f,back,robe:true,moving:true,ph,atk:e.charge>0?Math.atan2(fy,fx)-.3*f:null,armSwing:.4,
      head:(hx,hy)=>{blob(hx,hy-.5,5,5.6,F(RP.robe));blob(hx+f*.6,hy+.8,3,3.2,RP.dark);eyes(hx,hy+.6,'#ff7a2a')},
      weapon:e.charge>0?(x,y)=>{const p=1-e.charge/e.d.wind,g=ctx.createRadialGradient(x,y,0,x,y,3+p*5);g.addColorStop(0,'#fff0c0');g.addColorStop(.5,'#ff8a2a');g.addColorStop(1,'rgba(255,90,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,3+p*5,0,7);ctx.fill()}:null})}
  else if(look==='knight'||look==='warden'){const stone=look==='warden',A=F(stone?RP.stone:RP.dark);
    humanoid({R:{torso:A,sleeve:A,fore:A,hand:A,legs:A,shin:A,feet:A,skirt:F(stone?RP.dark:RP.robe),pauldron:A,belt:F(RP.gold),metal:{torso:!stone,sleeve:!stone,shin:!stone,fore:!stone}},f,back,moving:true,ph,tw:1.15,lw:1.2,atk,
      head:(hx,hy)=>{poly([[hx-5,hy-5],[hx+5,hy-5],[hx+4.6,hy+5],[hx-4.6,hy+5]],A,!stone);if(!back){ctx.fillStyle=stone?'#8cc8ff':'#ff3a2a';ctx.fillRect(hx-3.5+f,hy-1,2.6,1.2);ctx.fillRect(hx+1+f,hy-1,2.6,1.2)}
        if(stone)for(const dx of[-4,0,4])poly([[hx+dx-1.3,hy-5],[hx+dx,hy-9],[hx+dx+1.3,hy-5]],F(RP.stone));else for(const sd of[-1,1]){limb(hx+sd*4.6,hy-3,hx+sd*9,hy-7,1.4,1,F(RP.bone));limb(hx+sd*9,hy-7,hx+sd*8,hy-12,1,.3,F(RP.bone))}},
      weapon:(x,y)=>vWeapon(x,y,atk??Math.atan2(fy,fx)+.8*f,stone?'mace':'great',stone?{p:RP.stone,s:RP.dark,t:RP.dark}:{p:RP.iron,s:RP.gold,t:RP.dark},stone?'Kriegshammer':'Zweihänder')})}
  else if(look==='weaver'){for(let k=0;k<6;k++){const sd=k%2?1:-1,a=Math.sin(G.t*2+k)*3;limb(0,-28,sd*(13+k*1.5),-38+a,1.4,1,F(RP.dark));limb(sd*(13+k*1.5),-38+a,sd*(19+k*2.4),-5+k,1,.4,F(RP.dark))}
    humanoid({R:{torso:F(RP.robe),sleeve:F(RP.robe),hand:F(RP.bone)},f,back,robe:true,moving:false,tw:1.2,atk,head:(hx,hy)=>{blob(hx,hy-.5,5.2,5.8,F(RP.robe));blob(hx+f*.5,hy+1,3,3,RP.dark);for(let k=0;k<3;k++)if(!back){ctx.fillStyle='#ff8a2a';ctx.fillRect(hx-3+k*2.4+f*.6,hy,1.2,1.2)}}});
    const gl=.5+Math.sin(G.t*6)*.3,g=ctx.createRadialGradient(0,-26,0,0,-26,7);g.addColorStop(0,`rgba(255,200,120,${gl})`);g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-26,7,0,7);ctx.fill()}
  else{const ghoul=look==='ghoul',B=F(ghoul?RP.flesh:RP.bone);
    humanoid({R:ghoul?{torso:B,sleeve:B,hand:B,legs:B,shin:B,feet:B,skirt:F(RP.rust)}:{torso:F(RP.dark),sleeve:B,fore:B,hand:B,legs:B,shin:B,feet:B,skirt:F(RP.rust)},
      f,back,moving:true,ph,hunch:ghoul?6:0,lw:ghoul?1.05:.62,tw:ghoul?1.05:.9,armLen:ghoul?18:15,atk,torsoFx:ghoul?null:(a,b,c,d)=>ribs(a,b,c,d),
      head:(hx,hy)=>{if(ghoul){blob(hx,hy,4,4.4,B);eyes(hx,hy,'#ffd040')}else skull(hx,hy)},
      weapon:look==='archer'?(x,y)=>{ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(fy,fx));ctx.strokeStyle=RP.wood[2];ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(-3,0,9,-1.2,1.2);ctx.stroke();ctx.strokeStyle='#cfc6aa';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(-3+Math.cos(-1.2)*9,Math.sin(-1.2)*9);ctx.lineTo(e.charge>0?-6:-3+Math.cos(1.2)*9*0+.5,0);ctx.lineTo(-3+Math.cos(1.2)*9,Math.sin(1.2)*9);ctx.stroke();ctx.restore()}
        :ghoul?(x,y)=>{for(let k=-1;k<=1;k++)limb(x,y,x+f*3,y+2+k*1.2,.5,.2,F(RP.bone))}:(x,y)=>vWeapon(x,y,atk??Math.atan2(fy,fx)+.8*f,'sword',RUSTY,'')})}
  ctx.restore();
  if(e.elem&&!e.dead&&Math.random()<.05)fxp({k:'mote',x:e.x+rnd(-.3,.3),y:e.y+rnd(-.3,.3),z:rnd(.3,1)*(e.scale||1),vz:.4,life:.8,col:{fire:'#ff9a30',frost:'#c8e4ff',poison:'#9ae050'}[e.elem],s:.8,g:0})}
function drawProj(p){const[sx,sy]=iso(p.x,p.y);
  if(p.kind==='arrow'){const[dx,dy]=scrDir(Math.atan2(p.vy,p.vx));ctx.strokeStyle='#e8e2d0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx-dx*10,sy-16-dy*10);ctx.lineTo(sx+dx*6,sy-16+dy*6);ctx.stroke()}
  else{const col=p.kind==='frost'?['#ffffff','#8cc8ff']:p.kind==='light'?['#ffffff','#9ab8ff']:p.kind==='poison'?['#e8ffc0','#6ad040']:['#fff3c0','#ff7a1a'];const g=ctx.createRadialGradient(sx,sy-16,1,sx,sy-16,p.kind==='glut'?11:8);g.addColorStop(0,col[0]);g.addColorStop(.5,col[1]);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy-16,12,0,7);ctx.fill()}}
function flame(x,y,sz,ph){const f=Math.sin(G.t*11+ph)*.15+Math.sin(G.t*17+ph*2)*.1;const g=ctx.createRadialGradient(x,y-sz*.4,1,x,y-sz*.3,sz*2.2);g.addColorStop(0,'rgba(255,200,110,.5)');g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-sz*.3,sz*2.2,0,7);ctx.fill();
  ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.moveTo(x-sz*.5,y);ctx.quadraticCurveTo(x-sz*.4,y-sz*(1.2+f),x,y-sz*(1.7+f));ctx.quadraticCurveTo(x+sz*.4,y-sz*(1.1-f),x+sz*.5,y);ctx.fill();ctx.fillStyle='#ffe2a0';ctx.beginPath();ctx.moveTo(x-sz*.22,y);ctx.quadraticCurveTo(x,y-sz*(1+f),x+sz*.22,y);ctx.fill()}

// the black tower: curved brick courses lit from the left, buttresses, ivy, slit windows, a broken crown, a studded gate
function paintTower(g){withCtx(g,()=>{const cx=150,B=556,rw=60,T=170,K=rw*.35,Rn=mulberry(4242),rr=(a,b)=>a+Rn()*(b-a);
  const el=(x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()};
  const bricks=(r,y0,y1,k,base,h=9)=>{for(let y=y0,row=0;y<y1;y+=h,row++){const off=(row%2)*.12;for(let a=-Math.PI/2-off;a<Math.PI/2;a+=.24){const a1=Math.max(-Math.PI/2,a),a2=Math.min(Math.PI/2,a+.24);if(a2<=a1)continue;
    const x1=cx+Math.sin(a1)*r,x2=cx+Math.sin(a2)*r,am=(a1+a2)/2,yy=y+Math.cos(am)*k,lam=.6-Math.sin(am)*.42+rr(-.07,.07),v=Math.round(base+lam*56);
    g.fillStyle=`rgb(${v+7},${v+2},${v-5})`;g.fillRect(x1+.6,yy+.6,x2-x1-1.2,h-1.4);g.fillStyle='rgba(255,236,200,.07)';g.fillRect(x1+.6,yy+.6,x2-x1-1.2,1);if(Rn()<.06){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x1+1,yy+2,x2-x1-2,h-4)}}}};
  const cyl=(r,y0,y1,k)=>{g.beginPath();g.moveTo(cx-r,y0);g.lineTo(cx+r,y0);g.lineTo(cx+r,y1);g.ellipse(cx,y1,r,k,0,0,Math.PI);g.closePath()};
  el(cx+34,586,160,36,'rgba(0,0,0,.35)');
  for(let k=0;k<16;k++)blob(cx+rr(-120,120),rr(560,598),rr(16,32),rr(9,16),k%3?RP.dark:RP.stone);
  for(const sd of[-1,1]){poly([[cx+sd*rw*.7,B-150],[cx+sd*(rw+4),B-150],[cx+sd*(rw+34),B+14],[cx+sd*rw*.6,B+14]],sd<0?RP.stone:RP.dark);g.fillStyle='rgba(0,0,0,.25)';for(let y=B-140;y<B+10;y+=10)g.fillRect(cx+sd*(rw+((y-B+150)/164)*30)-(sd>0?6:0),y,6,1)}
  cyl(rw,T,B,K);g.fillStyle='#0e0c0a';g.fill();bricks(rw,T,B,K,22);
  cyl(rw,T,B,K);let q=g.createLinearGradient(cx-rw,0,cx+rw,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(.55,'rgba(0,0,0,.12)');q.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=q;g.fill();
  q=g.createLinearGradient(0,B-80,0,B+K);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=q;g.fill();
  for(const yb of[T+46,B-190,B-60]){g.lineWidth=5;g.strokeStyle='#1a1612';g.beginPath();g.ellipse(cx,yb+2,rw+2,K,0,0,Math.PI);g.stroke();g.lineWidth=3;g.strokeStyle='#5a5048';g.beginPath();g.ellipse(cx,yb,rw+2,K,0,.1,Math.PI*.6);g.stroke();g.strokeStyle='#3a342c';g.beginPath();g.ellipse(cx,yb,rw+2,K,0,Math.PI*.6,Math.PI);g.stroke()}
  g.strokeStyle='#050404';g.lineWidth=1.2;for(const[x,y]of[[24,260],[-34,380],[30,470]]){let px=cx+x,py=y;g.beginPath();g.moveTo(px,py);for(let k=0;k<6;k++){px+=rr(-5,5);py+=rr(5,11);g.lineTo(px,py)}g.stroke()}
  for(let k=0;k<90;k++){const a=rr(-1.5,-.2),y=B+30-Math.pow(Rn(),1.6)*300,x=cx+Math.sin(a)*rw,yy=y+Math.cos(a)*K;if(yy>B+K)continue;el(x,yy,rr(1.5,4),rr(1.2,3),['#1e2e0e','#2a3e14','#3a5418','#4a6820'][k%4])}
  g.strokeStyle='#24360e';g.lineWidth=1.2;for(let k=0;k<5;k++){let x=cx-rw+rr(4,30),y=B+10;g.beginPath();g.moveTo(x,y);for(let s2=0;s2<9;s2++){x+=rr(-4,5);y-=rr(10,18);g.lineTo(x,y);if(Rn()<.7)el(x+rr(-3,3),y,2,1.4,'#3a5418')}g.stroke()}
  const wins=[[-22,262],[18,336],[-34,430],[24,214],[2,140-26]];SPR.towerWin=[];for(const[x,y]of wins.slice(0,4)){const X=cx+x;g.fillStyle='#030202';g.fillRect(X-3,y-12,6,22);g.beginPath();g.arc(X,y-12,3,Math.PI,0);g.fill();g.fillStyle='#ff9a30';g.fillRect(X-1,y-9,2,16);g.fillStyle='#ffd070';g.fillRect(X-.5,y-6,1,9);SPR.towerWin.push([x,y-580])}
  // crown: corbels, parapet, merlons (some broken)
  const rp=rw+10,K2=rp*.35,P0=T-46;for(let a=-Math.PI/2+.1;a<Math.PI/2;a+=.3){const x=cx+Math.sin(a)*(rw+3),y=T+Math.cos(a)*K;poly([[x-4,y-6],[x+4,y-6],[x+2,y+6],[x-2,y+6]],RP.stone)}
  el(cx,P0,rp,K2,'#141210');
  const merlon=(a,back,broken)=>{const a1=a-.11,a2=a+.11,x1=cx+Math.sin(a1)*rp,x2=cx+Math.sin(a2)*rp,y1=P0+Math.cos(a1)*K2,y2=P0+Math.cos(a2)*K2,hh=broken?rr(5,11):20;
    const lam=.6-Math.sin(a)*.42,v=Math.round((back?18:30)+lam*50);g.fillStyle=`rgb(${v+6},${v+1},${v-5})`;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineTo(x2,y2-hh+(broken?rr(-3,3):0));g.lineTo(x1,y1-hh);g.closePath();g.fill();
    g.fillStyle=`rgb(${v+30},${v+24},${v+16})`;g.fillRect(Math.min(x1,x2),Math.min(y1,y2)-hh-1.5,Math.abs(x2-x1),2.5)};
  for(let a=Math.PI/2+.2;a<Math.PI*1.5;a+=.36)merlon(a,true,false);
  cyl(rp,P0,T+6,K2);g.fillStyle='#0e0c0a';g.fill();bricks(rp,P0,T+6,K2,26,8);cyl(rp,P0,T+6,K2);q=g.createLinearGradient(cx-rp,0,cx+rp,0);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=q;g.fill();
  let n=0;for(let a=-Math.PI/2+.12;a<Math.PI/2;a+=.36,n++)merlon(a,false,n===5||n===6);
  // tattered banner on a pole
  g.strokeStyle='#2a1a0c';g.lineWidth=2.4;g.beginPath();g.moveTo(cx-34,P0-6);g.lineTo(cx-34,P0-110);g.stroke();
  q=g.createLinearGradient(cx-34,0,cx+16,0);q.addColorStop(0,'#8a2018');q.addColorStop(1,'#3a0806');g.fillStyle=q;g.beginPath();g.moveTo(cx-33,P0-108);g.quadraticCurveTo(cx-10,P0-112,cx+14,P0-104);g.lineTo(cx+6,P0-96);g.lineTo(cx+16,P0-86);g.quadraticCurveTo(cx-8,P0-82,cx-33,P0-84);g.closePath();g.fill();
  // gate: stone arch, studded double door, steps
  const dx=cx,dy=578,dw=19,dh=66;for(let k=0;k<9;k++){const a=Math.PI+k/8*Math.PI,a2=Math.PI+(k+1)/8*Math.PI;poly([[dx+Math.cos(a)*(dw+9),dy-dh+16+Math.sin(a)*(dw+9)],[dx+Math.cos(a2)*(dw+9),dy-dh+16+Math.sin(a2)*(dw+9)],[dx+Math.cos(a2)*dw,dy-dh+16+Math.sin(a2)*dw],[dx+Math.cos(a)*dw,dy-dh+16+Math.sin(a)*dw]],k<4?RP.stone:RP.dark)}
  for(const sd of[-1,1])poly([[dx+sd*dw,dy-dh+16],[dx+sd*(dw+9),dy-dh+16],[dx+sd*(dw+9),dy],[dx+sd*dw,dy]],sd<0?RP.stone:RP.dark);
  g.beginPath();g.moveTo(dx-dw,dy);g.lineTo(dx-dw,dy-dh+16);g.arc(dx,dy-dh+16,dw,Math.PI,0);g.lineTo(dx+dw,dy);g.closePath();q=g.createLinearGradient(dx-dw,0,dx+dw,0);q.addColorStop(0,'#5a3a20');q.addColorStop(.5,'#3e2614');q.addColorStop(1,'#1e120a');g.fillStyle=q;g.fill();
  g.strokeStyle='rgba(10,6,2,.8)';g.lineWidth=1;for(let x=dx-dw+5;x<dx+dw;x+=5){g.beginPath();g.moveTo(x,dy);g.lineTo(x,dy-dh+16-Math.sqrt(Math.max(0,dw*dw-(x-dx)**2))+2);g.stroke()}
  g.fillStyle='#0a0806';g.fillRect(dx-.8,dy-dh-2,1.6,dh+2);for(const y of[dy-14,dy-44]){g.fillStyle='#1a1a1e';g.fillRect(dx-dw,y,dw*2,3);for(let x=dx-dw+3;x<dx+dw;x+=6){g.fillStyle='#787d88';g.fillRect(x,y+.5,1.4,1.4)}}
  g.strokeStyle='#acb1ba';g.lineWidth=1.2;for(const sd of[-1,1]){g.beginPath();g.arc(dx+sd*6,dy-30,3,0,7);g.stroke()}
  for(let k=0;k<3;k++){const yy=dy+3+k*5,ww=dw+16+k*6;el(dx+2,yy+2,ww,4,'#0a0806');el(dx,yy,ww,4,['#5a524a','#4a443c','#3a342c'][k])}
  // torch brackets and skull pikes
  SPR.towerTorch=[];for(const sd of[-1,1]){const x=dx+sd*(dw+20),y=dy-48;g.fillStyle='#1a1a1e';g.fillRect(x-1.5,y,3,12);g.fillRect(x-4,y+10,8,2);g.fillStyle='#4a3420';g.fillRect(x-1.5,y-6,3,8);SPR.towerTorch.push([x-cx,y-6-580])}
  for(const[x,y]of[[cx-78,600],[cx+84,604]]){g.strokeStyle='#2a1a0c';g.lineWidth=2.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+2,y-58);g.stroke();blob(x+2,y-62,5,5.4,RP.bone);g.fillStyle='#0a0806';g.fillRect(x-1,y-63,2,2);g.fillRect(x+3,y-63,2,2);g.fillRect(x,y-59,4,1)}})}
function drawTowerFx(bx,by){for(const[x,y]of SPR.towerTorch||[]){flame(bx+x,by+y,6,x);const g=ctx.createRadialGradient(bx+x,by+y,0,bx+x,by+y,40);g.addColorStop(0,'rgba(255,150,60,.22)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(bx+x-40,by+y-40,80,80)}
  ctx.save();ctx.globalCompositeOperation='lighter';for(const[x,y]of SPR.towerWin||[]){const f=.5+Math.sin(G.t*3+x)*.15+Math.sin(G.t*7.3+y)*.1,g=ctx.createRadialGradient(bx+x,by+y,0,bx+x,by+y,16);g.addColorStop(0,`rgba(255,160,60,${.45*f})`);g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(bx+x-16,by+y-16,32,32)}ctx.restore()}

