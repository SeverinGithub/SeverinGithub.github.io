/* ---------- bows, crossbows and the little wooden wand: added after the old armoury is laid out, so every old unique keeps its name ---------- */
const ALWB=[['Kurzbogen',1,2,6,1.3,0,0,1,'bow'],['Jagdbogen',5,3,10,1.3,0,20,1,'bow'],['Langbogen',10,5,15,1.15,10,32,1,'bow'],['Kompositbogen',16,7,20,1.25,15,46,1,'bow'],['Knochenbogen',22,9,27,1.2,20,62,1,'bow'],['Drachenbogen',30,12,35,1.25,25,85,1,'bow'],
  ['Leichte Armbrust',3,4,9,.95,12,8,1,'xbow'],['Armbrust',9,7,16,.9,26,14,1,'xbow'],['Schwere Armbrust',17,12,27,.8,46,20,1,'xbow'],['Belagerungsarmbrust',27,18,42,.75,72,30,1,'xbow'],
  ['Holzzauberstab',1,1,4,1.35,0,0,0,'staff']];
// pixel sprites for the ground and the shop: a bent limb with a string, a stock with a steel bow across
const pxBow=()=>pfill((x,y)=>{const a=x-y,p=x+y-15,pt=-3.4+3.4*(a/12)*(a/12);if(Math.abs(a)>12.5)return -1;const d=Math.abs(p-pt);
  if(Math.abs(a)<=1.5&&d<=1.4)return 5+(p<pt?1:0);if(d<=.9)return Math.abs(a)>=10.5?1+(p<pt?1:0):8+(p<pt?2:a>0?1:0);if(Math.abs(p)<=.45&&Math.abs(a)<=12)return 7;return -1});
const pxXbow=()=>pfill((x,y)=>{const a=x-y,p=x+y-15;if(Math.abs(p)<=1.1&&a>=-12&&a<=5)return 8+(p<0?2:1);
  const q=a-4.5-(p*p)/20;if(Math.abs(q)<=.8&&Math.abs(p)<=7.5)return 1+(p<0?1:0);if(Math.abs(p)<=.45&&a>5&&a<=11)return 6;if(Math.abs(a+5)<=.8&&p>1&&p<=4)return 9;return -1});
const _expandItemsK=expandItems;expandItems=function(){_expandItemsK();
  for(const w of ALWB){const b={n:w[0],slot:'weapon',lvl:w[1],dmg:[w[2],w[3]],speed:w[4],str:w[5],dex:w[6],twoH:!!w[7],cls:w[8]};BASE[b.n]=b;
    PXS[b.n]=w[8]==='bow'?[pxBow,'iron','leather',w[0]==='Knochenbogen'?'bone':'wood',w[0]==='Drachenbogen'?'ruby':'emerald']:w[8]==='xbow'?[pxXbow,'steel','leather','wood','ruby']:[()=>wStaff({top:5,orb:1.4,knot:1}),'wood','moss','wood','emerald'];
    ISZ[b.n]=w[8]==='staff'?[1,2]:[2,3];
    for(const M of MATS){const n=M.p+'-'+b.n,nb=Object.assign({},b,{n,shape:b.n,tier:M.p,lvl:b.lvl+M.l,str:Math.round(b.str*(1+M.l/80)),dex:Math.round(b.dex*(1+M.l/80)),dmg:b.dmg.map(v=>Math.max(1,Math.round(v*M.m)))});BASE[n]=nb;PXS[n]=[PXS[b.n][0],M.mat,PXS[b.n][2],PXS[b.n][3],PXS[b.n][4]]}}
  UNIQ.push({n:'Sehne des Morgens',b:'Jagdbogen',lvl:6,m:{ed:80,dex:10,ias:15,fire:5}},{n:'Kesselbrecher',b:'Leichte Armbrust',lvl:5,m:{ed:90,str:8,crit:6,life:15}},
    {n:'Ast der Alten Eiche',b:'Holzzauberstab',lvl:4,m:{spell:40,ene:10,mana:25,regen:2}},{n:'Nebelsänger',b:'Langbogen',lvl:12,m:{ed:130,poison:12,dex:15,mf:20}},
    {n:'Bolzenwerk des Meisters',b:'Armbrust',lvl:11,m:{ed:140,ias:20,crit:10,str:10}},{n:'Rabenschwinge',b:'Kompositbogen',lvl:18,m:{ed:160,cold:15,frw:15,dex:20}},
    {n:'Hornruf der Tiefe',b:'Knochenbogen',lvl:24,m:{ed:190,ls:6,crit:12,life:40}},{n:'Mauerfall',b:'Schwere Armbrust',lvl:20,m:{ed:200,str:20,light:18,res:15}},
    {n:'Zweig der Weisen',b:'Holzzauberstab',lvl:20,m:{spell:100,allsk:1,mana:50,mregen:4}},{n:'Vyrthrax\' Sehne',b:'Drachenbogen',lvl:32,m:{ed:240,fire:40,dex:30,allsk:1}},
    {n:'Belagerer',b:'Belagerungsarmbrust',lvl:30,m:{ed:250,crit:15,str:30,dmgred:6}})};
WEXT.bow=[-13,13,0,6.5];WEXT.xbow=[-6,17,0,10];WLEN.bow=WLEN.xbow=14;
// while shooting the hero hands in how far the string is drawn (BOWK, with the skin of the drawing hand) and whether a bolt lies in the crossbow (XBOLT)
let BOWK=0,BOWHAND=null,XBOLT=1,BOWVIB=0,XRL=0,BOWGLOW=null;
// in the hand: the bow is held across the aim, the crossbow along it, the wand is a twig with a stone at the tip
function vBow(m,sh){const T=m.t,K=BOWK,ty=13*(1-K*.06),tx=.2-K*2,lim=(sd)=>{const P0=[[2,0],[3.6+K*.6,-4.6*sd],[2.8-K*.5,-9.2*(1-K*.04)*sd],[tx,-ty*sd]];for(let k=1;k<P0.length;k++)limb(P0[k-1][0],P0[k-1][1],P0[k][0],P0[k][1],1.35-k*.22,1.2-k*.22,T,true);
    ctx.save();ctx.translate(tx-.2,(ty-13)*sd);poly([[.9,-12*sd],[-.6,-14.2*sd],[.4,-13.6*sd]],m.p,true);if(sh==='Kompositbogen'||sh==='Drachenbogen')limb(.2,-13*sd,-1.4,-13.8*sd,.5,.3,m.p,true);ctx.restore()};
  // the limbs bend as the string comes back to the jaw; after the loose the string hums (BOWVIB)
  const nx=-.4-11*K,sx=tx-.6,sy=ty+.3;ctx.strokeStyle='rgba(236,228,206,.85)';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(sx,-sy);ctx.lineTo(nx+BOWVIB,0);ctx.lineTo(sx,sy);ctx.stroke();lim(1);lim(-1);
  limb(2.1,-1.9,2.1,1.9,1.55,1.55,m.s,true);if(sh==='Drachenbogen'||sh==='Knochenbogen')blob(3.2,0,1.1,1.1,m.gem3,true);
  // the nocked arrow: shaft over the grip, grey feathers at the string, a steel head beyond the bow
  if(BOWK>0){const hx=nx+20;limb(nx,0,hx-1.4,0,.42,.42,RP.wood,true);poly([[hx-1.6,-1.1],[hx+.8,0],[hx-1.6,1.1]],RP.iron,true);
    ctx.fillStyle='#d8d2c4';ctx.beginPath();ctx.moveTo(nx+.4,0);ctx.lineTo(nx+3.4,-1.2);ctx.lineTo(nx+3.8,0);ctx.lineTo(nx+3.4,1.2);ctx.closePath();ctx.fill();
    if(BOWHAND)blob(nx-.6,.2,1.5,1.4,BOWHAND,true);bowGlint(hx+.4,0)}}
function vXbow(m,sh){const heavy=sh==='Schwere Armbrust'||sh==='Belagerungsarmbrust';limb(-6,.6,15,0,heavy?1.9:1.5,1.2,m.t,true);limb(-1,1,-2.6,4.2,.8,.8,m.t,true);
  // spent, the string snaps forward against the limbs and the groove lies empty until the bolt is wound back in
  const hw=heavy?10:8.5,sx=XBOLT?7:12.4-5.4*XRL;ctx.strokeStyle='rgba(236,228,206,.8)';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(11,-hw);ctx.lineTo(sx,0);ctx.lineTo(11,hw);ctx.stroke();
  for(const sd of[-1,1]){limb(13.5,0,12.6,sd*hw*.55,1.1,.9,m.p,true);limb(12.6,sd*hw*.55,11,sd*hw,.9,.6,m.p,true)}if(XBOLT){limb(7,0,16.5,0,.45,.45,m.s,true);poly([[16,-.9],[18,0],[16,.9]],m.p,true);bowGlint(18.4,0)}if(heavy)blob(3,-1.2,.9,.9,m.gem3,true)}
function vWand(m){limb(-3,0,12,0,.85,.55,m.t,true);blob(4,0,.9,.9,m.t,true);const gl=ctx.createRadialGradient(13,0,0,13,0,5);gl.addColorStop(0,m.gem3[2]+'aa');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(13,0,5,0,7);ctx.fill();blob(13,0,1.6,1.6,m.gem3,true)}
const _vWeaponK=vWeapon;vWeapon=function(hx,hy,ang,cls,m,b){const sh=SH(b);if(cls!=='bow'&&cls!=='xbow'&&sh!=='Holzzauberstab')return _vWeaponK(hx,hy,ang,cls,m,b);
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);if(cls==='bow')vBow(m,sh);else if(cls==='xbow')vXbow(m,sh);else vWand(m);ctx.restore()};
const _iconWK=iconW;iconW=function(it){if(it.cls==='bow'){ctx.save();ctx.rotate(Math.PI/2);vWeapon(0,0,0,'bow',wRampsOf(it),it.b);ctx.restore();return}return _iconWK(it)};
const _invIconK=invIcon;invIcon=function(it){if(!isWandW(it))return _invIconK(it);const s=WEXT.staff;WEXT.staff=[-4,13,2,2.6];try{return _invIconK(it)}finally{WEXT.staff=s}};


/* ---------- the archer: both hands on the weapon, for the hero and for every bowman of the tower ---------- */
// how far the string is drawn at p of the shot that looses at q: nock, a long pull that slows toward the jaw, a held breath at full draw, then the string is empty
const bowDraw=(p,q)=>p<q*.12?0:p<q*.8?1-Math.pow(1-(p-q*.12)/(q*.68),2.2):p<q?1:0;
// after the loose the string hums and dies away
const bowVib=fo=>fo>0&&fo<1?Math.sin(fo*46)*2.4*Math.pow(1-fo,2):0;
function withBow(st,fn){BOWK=st.k||0;BOWHAND=st.hand||null;BOWVIB=st.vib||0;XBOLT=st.bolt??1;XRL=st.rl||0;BOWGLOW=st.glow||null;
  try{fn()}finally{BOWK=0;BOWHAND=null;BOWVIB=0;XBOLT=1;XRL=0;BOWGLOW=null}}
// the tip gathers light as the draw comes full and pulses while the archer holds it
function bowGlint(x,y){if(!BOWGLOW)return;const g0=clamp((BOWK-.55)/.45,0,1);if(g0<=0)return;const pu=BOWK>.97?.75+.25*Math.sin(G.t*22):.6,a=g0*pu,r=2.5+g0*4.5;
  ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${BOWGLOW},${a})`);g.addColorStop(1,`rgba(${BOWGLOW},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
  if(BOWK>.97){ctx.strokeStyle=`rgba(255,250,235,${.7*pu})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(x-r*.9,y);ctx.lineTo(x+r*.9,y);ctx.moveTo(x,y-r*.6);ctx.lineTo(x,y+r*.6);ctx.stroke()}ctx.restore()}
// the archer turns side-on, the bow arm pushes out while the other hand pulls the string back to the jaw; after the loose that hand flies on past the ear
// and comes back to nock the next arrow. A crossbow lies on the other hand and is wound back after the shot.
// a: th aim, wang weapon angle, k draw, fo follow-through 0..1, xb crossbow, rl how far the crossbow is wound back
function archRig(o,a){const c=Math.cos(a.th),s=Math.sin(a.th);o.tw=(o.tw||1)*(1-.42*Math.abs(c));o.atk=null;
  o.handsAt=(wx,wy)=>{const e=a.xb?10:9+7*Math.min(1,a.k*1.5+(a.fo>0?1:0)),gx=wx+c*e,gy=wy+2+s*e*.66,wc=Math.cos(a.wang),ws=Math.sin(a.wang);let d,n=0;
    if(a.xb)d=a.rl>0?12.4-5.4*a.rl:8;
    else if(a.fo>0){const f1=Math.min(1,a.fo/.22),bk=-11.4-3.5*Math.sin(f1*Math.PI/2),q=clamp((a.fo-.4)/.6,0,1),r2=q*q*(3-2*q);d=bk+(-.4-bk)*r2;n=1.8*(1-r2)*f1}
    else d=-.4-11*a.k+(a.k>.97?Math.sin(G.t*57)*.35:0);
    return[[gx,gy],[gx+wc*d-ws*n,gy+.8+ws*d+wc*n]]}}
// a bowman of the tower: at rest the bow hangs in the hand, in the wind-up comes the same draw as the hero's, after the shot the same follow-through
function archEnemy(o,e,fx,fy,f,F,xb){const th=Math.atan2(fy,fx),w=e.d&&e.d.wind||.6,ch=e.charge>0&&!e.dead?1-e.charge/w:-1,fo=!e.dead&&e.relT!=null&&G.t-e.relT>=0&&G.t-e.relT<.6?(G.t-e.relT)/.6:0,
    m={p:F(RP.iron),s:F(RP.rust),t:F(RP.wood),gem3:F(RP.ember)},cls=xb?'xbow':'bow';
  if(ch<0&&!fo){o.weapon=(x,y)=>vWeapon(x,y,th+(xb?.6:1)*f,cls,m,'');return}
  const k=ch>=0?bowDraw(ch,1):0,kick=fo>0&&fo<.45?Math.sin(fo/.45*Math.PI)*(xb?.22:.12):0,wang=th-kick*f,rl=xb&&fo>.35?Math.min(1,(fo-.35)/.6):0,
    glow=e.elem==='fire'?'255,150,60':e.elem==='frost'?'170,215,255':e.elem==='poison'?'160,240,90':'255,226,160';
  archRig(o,{th,wang,k,fo,xb,rl});o.weapon=(x,y)=>withBow({k,hand:o.R.hand,vib:xb?0:bowVib(fo),bolt:xb&&fo>0&&fo<.95?0:1,rl,glow},()=>vWeapon(x,y,wang,cls,m,''))}
// the loose and the creak of the draw are heard near the bowman, fading with the distance
function bowSfx(e,k,v){if(!P)return;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d>12)return;const s=SFXV;SFXV=v*(1-d/12);try{sfx(k)}finally{SFXV=s}}
const isBowE=e=>(e.proj||e.d&&e.d.proj)==='arrow',isXbowE=e=>!!(e.gear&&e.gear.wep==='crossbow');
const _fireProjB=fireProj;fireProj=function(e){e.relT=G.t;const r=_fireProjB(e);if(isBowE(e))bowSfx(e,isXbowE(e)?'bolt':'twang',.6);return r};
const _updEnemyB=updEnemy;updEnemy=function(e,dt){const c0=e.charge;_updEnemyB(e,dt);if(!(c0>0)&&e.charge>0&&isBowE(e)&&!isXbowE(e))bowSfx(e,'draw',.8)};
