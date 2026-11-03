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
let BOWK=0,BOWHAND=null,XBOLT=1;
// in the hand: the bow is held across the aim, the crossbow along it, the wand is a twig with a stone at the tip
function vBow(m,sh){const T=m.t,lim=(sd)=>{const P0=[[2,0],[3.6,-4.6*sd],[2.8,-9.2*sd],[.2,-13*sd]];for(let k=1;k<P0.length;k++)limb(P0[k-1][0],P0[k-1][1],P0[k][0],P0[k][1],1.35-k*.22,1.2-k*.22,T,true);
    poly([[.9,-12*sd],[-.6,-14.2*sd],[.4,-13.6*sd]],m.p,true);if(sh==='Kompositbogen'||sh==='Drachenbogen')limb(.2,-13*sd,-1.4,-13.8*sd,.5,.3,m.p,true)};
  const nx=-.4-7*BOWK;ctx.strokeStyle='rgba(236,228,206,.85)';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(-.4,-13.3);ctx.lineTo(nx,0);ctx.lineTo(-.4,13.3);ctx.stroke();lim(1);lim(-1);
  limb(2.1,-1.9,2.1,1.9,1.55,1.55,m.s,true);if(sh==='Drachenbogen'||sh==='Knochenbogen')blob(3.2,0,1.1,1.1,m.gem3,true);
  // the nocked arrow: shaft over the grip, grey feathers at the string, a steel head beyond the bow
  if(BOWK>0){const hx=nx+17.5;limb(nx,0,hx-1.4,0,.42,.42,RP.wood,true);poly([[hx-1.6,-1.1],[hx+.8,0],[hx-1.6,1.1]],RP.iron,true);
    ctx.fillStyle='#d8d2c4';ctx.beginPath();ctx.moveTo(nx+.4,0);ctx.lineTo(nx+3.4,-1.2);ctx.lineTo(nx+3.8,0);ctx.lineTo(nx+3.4,1.2);ctx.closePath();ctx.fill();
    if(BOWHAND)blob(nx-.6,.2,1.5,1.4,BOWHAND,true)}}
function vXbow(m,sh){const heavy=sh==='Schwere Armbrust'||sh==='Belagerungsarmbrust';limb(-6,.6,15,0,heavy?1.9:1.5,1.2,m.t,true);limb(-1,1,-2.6,4.2,.8,.8,m.t,true);
  // spent, the string snaps forward against the limbs and the groove lies empty until the bolt is wound back in
  const hw=heavy?10:8.5,sx=XBOLT?7:12.4;ctx.strokeStyle='rgba(236,228,206,.8)';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(11,-hw);ctx.lineTo(sx,0);ctx.lineTo(11,hw);ctx.stroke();
  for(const sd of[-1,1]){limb(13.5,0,12.6,sd*hw*.55,1.1,.9,m.p,true);limb(12.6,sd*hw*.55,11,sd*hw,.9,.6,m.p,true)}if(XBOLT){limb(7,0,16.5,0,.45,.45,m.s,true);poly([[16,-.9],[18,0],[16,.9]],m.p,true)}if(heavy)blob(3,-1.2,.9,.9,m.gem3,true)}
function vWand(m){limb(-3,0,12,0,.85,.55,m.t,true);blob(4,0,.9,.9,m.t,true);const gl=ctx.createRadialGradient(13,0,0,13,0,5);gl.addColorStop(0,m.gem3[2]+'aa');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(13,0,5,0,7);ctx.fill();blob(13,0,1.6,1.6,m.gem3,true)}
const _vWeaponK=vWeapon;vWeapon=function(hx,hy,ang,cls,m,b){const sh=SH(b);if(cls!=='bow'&&cls!=='xbow'&&sh!=='Holzzauberstab')return _vWeaponK(hx,hy,ang,cls,m,b);
  ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);if(cls==='bow')vBow(m,sh);else if(cls==='xbow')vXbow(m,sh);else vWand(m);ctx.restore()};
const _iconWK=iconW;iconW=function(it){if(it.cls==='bow'){ctx.save();ctx.rotate(Math.PI/2);vWeapon(0,0,0,'bow',wRampsOf(it),it.b);ctx.restore();return}return _iconWK(it)};
const _invIconK=invIcon;invIcon=function(it){if(!isWandW(it))return _invIconK(it);const s=WEXT.staff;WEXT.staff=[-4,13,2,2.6];try{return _invIconK(it)}finally{WEXT.staff=s}};

