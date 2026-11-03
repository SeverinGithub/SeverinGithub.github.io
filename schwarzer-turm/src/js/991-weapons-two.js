/* ---------- new weapons, first batch: seven staves, seven swords and a rapier, three axes, six blunt weapons · each with its own look in the hand, a craft built in and something it does when it lands ---------- */
// [name, level, damage min, max, speed, str, dex, two-handed, kind, size in the bag]
const NW=[
  ['Knotenstab',1,2,6,1.25,0,0,1,'staff',[1,4]],['Kampfstab',5,5,13,1.55,18,18,1,'staff',[1,4]],['Zauberrute',8,3,9,1.5,0,0,0,'staff',[1,3]],
  ['Kristallstab',18,7,18,1.2,0,0,1,'staff',[2,4]],['Knochenstab',22,8,21,1.2,0,0,1,'staff',[2,4]],['Runenstab',30,11,27,1.25,0,0,1,'staff',[2,5]],['Weltenast',50,18,42,1.25,0,0,1,'staff',[2,5]],
  ['Gladius',1,2,6,1.6,6,4,0,'sword',[1,3]],['Falchion',6,5,14,1.3,26,8,0,'sword',[1,3]],['Rapier',10,4,12,1.85,10,40,0,'dagger',[1,4]],['Bastardschwert',12,7,19,1.2,40,16,0,'sword',[1,4]],
  ['Estoc',20,14,34,1,70,40,1,'great',[1,5]],['Katana',25,12,30,1.35,60,60,0,'sword',[1,4]],['Flamberge',30,26,62,.85,115,40,1,'great',[2,5]],['Claymore',35,30,68,.9,130,40,1,'great',[2,5]],
  ['Bartaxt',4,3,9,1.3,20,0,0,'axe',[1,3]],['Doppelaxt',20,14,34,1,75,0,1,'axe',[2,4]],['Breitaxt',40,30,70,.85,140,0,1,'axe',[2,4]],
  ['Flanschkolben',6,4,11,1.25,30,0,0,'mace',[1,3]],['Zepter',10,5,13,1.25,30,0,0,'mace',[1,3]],['Kettenflegel',14,7,20,1.15,50,10,0,'mace',[2,3]],['Kriegspicke',18,8,22,1.15,60,0,0,'mace',[1,3]],
  ['Großhammer',30,28,64,.78,140,0,1,'mace',[2,4]],['Riesenkeule',45,34,78,.75,165,0,1,'mace',[2,4]]];
// the picture on the ground: [shape, metal, second metal, grip, gem]
const NWPX={Knotenstab:[()=>wStaff({top:9,orb:1.2,knot:1}),'wood','moss','wood','ember'],Kampfstab:[()=>wStaff({top:11,orb:0}),'iron','iron','wood','topaz'],
  Zauberrute:[()=>wStaff({top:4,orb:1.4}),'wood','gold','wood','amethyst'],Kristallstab:[()=>wStaff({top:9,orb:2.4,prongs:1}),'moon','steel','wood','frost'],
  Knochenstab:[()=>wStaff({top:9,orb:2.2}),'bone','bone','dark','soul'],Runenstab:[()=>wStaff({top:9,orb:1.6,star:1}),'dark','gold','dark','sapphire'],
  Weltenast:[()=>wStaff({top:9,orb:2,knot:1,leaves:1}),'wood','moss','moss','emerald'],
  Gladius:[()=>wBlade({tip:8,g:-3,gw:2,grip:-7,taper:3}),'steel','bronze','leather'],Falchion:[()=>wBlade({tip:11,g:-4,gw:2,grip:-8,hw:3,curve:-1,taper:2}),'iron','iron','leather'],
  Rapier:[()=>wBlade({tip:13,g:-4,gw:3,grip:-8,hw:1,taper:9,gtip:1}),'steel','gold','leather'],Bastardschwert:[()=>wBlade({tip:13,g:-4,gw:3,grip:-10,fuller:1,taper:5}),'steel','iron','leather'],
  Estoc:[()=>wBlade({tip:13,g:-5,gw:4,grip:-11,hw:1,taper:10}),'steel','iron','leather'],Katana:[()=>wBlade({tip:13,g:-3,gw:2,grip:-10,curve:-2,taper:2}),'steel','dark','cloth'],
  Flamberge:[()=>wBlade({tip:13,g:-5,hw:3,gw:5,grip:-11,serr:1,taper:5}),'steel','iron','leather'],Claymore:[()=>wBlade({tip:13,g:-5,hw:3,gw:5,grip:-11,fuller:1,taper:4,gtip:1,pom:2}),'steel','steel','leather'],
  Bartaxt:[()=>wAxe({h:9,prof:[1,2,3,5,6,3],low:-11}),'iron','iron','wood'],Doppelaxt:[()=>wAxe({h:11,prof:[4,6,7,7,6,4],dbl:1}),'steel','steel','wood'],
  Breitaxt:[()=>wAxe({h:12,prof:[6,8,9,10,10,9,8,6]}),'iron','iron','wood'],Flanschkolben:[()=>wMace({hc:9,r:2.6,flange:1}),'steel','iron','wood'],
  Zepter:[()=>wMace({hc:10,r:1.8}),'gold','gold','wood','ruby'],Kettenflegel:[()=>wMace({hc:6,r:2.4,spikes:1}),'iron','iron','wood'],
  Kriegspicke:[()=>wHammer({h:10,W:3}),'steel','bronze','wood'],Großhammer:[()=>wHammer({h:10,W:6}),'iron','iron','wood'],Riesenkeule:[()=>wClub({h:12,studs:1}),'iron','iron','wood']};
// what each weapon is good at, built in and growing with its level
const NWIMP={Knotenstab:L=>({spell:5}),Kampfstab:L=>({ias:15+L*.3}),Zauberrute:L=>({mregen:1+L*.05,spell:4+L*.3}),Kristallstab:L=>({cold:2+L*.3}),Knochenstab:L=>({life:10+L}),
  Runenstab:L=>({allsk:1}),Weltenast:L=>({poison:8+L*.3,regen:2+L*.05}),Gladius:L=>({crit:5+L*.15}),Falchion:L=>({ed:10+L*.5}),Rapier:L=>({ias:8+L*.2,crit:3}),
  Bastardschwert:L=>({str:4+L*.2}),Estoc:L=>({crit:4+L*.1}),Katana:L=>({crit:3+L*.1,ias:5}),Flamberge:L=>({ed:15+L*.6}),Claymore:L=>({life:15+L*1.2}),
  Bartaxt:L=>({str:3+L*.2}),Doppelaxt:L=>({ed:10+L*.4}),Breitaxt:L=>({ed:20+L*.5}),Zepter:L=>({spell:10+L*.8,light:2+L*.3}),Kriegspicke:L=>({crit:3+L*.1}),
  Großhammer:L=>({str:6+L*.25}),Riesenkeule:L=>({life:20+L*1.5})};
// what happens when it lands
const NWS={Kampfstab:{kb:.9},Falchion:{soft:1.25},Rapier:{line:.5},Estoc:{line:.6,hard:1.3},Katana:{bleed:.35,draw:1},Flamberge:{bleed:.6},Claymore:{kb:1.1,cleave:.4},
  Bartaxt:{hook:.25},Doppelaxt:{back:.6},Breitaxt:{sunder:.08},Flanschkolben:{hard:1.5},Kettenflegel:{shield:1.6,stun:.12},Kriegspicke:{hard:1.35},Großhammer:{quake:.45},Riesenkeule:{stun:1,kb:1.4}};
const NWT={Knotenstab:'Im Astloch glimmt eine Glut, die beim Zaubern aufflackert.',Kampfstab:'Schnelle Stockschläge, die zurückstoßen. 15 % weniger Zauberschaden.',
  Zauberrute:'Einhändig: Die zweite Hand bleibt frei für einen Schild.',Kristallstab:'Immer Frost. Verlangsamt deutlich länger.',Knochenstab:'Zauber stehlen 4 % ihres Schadens als Leben.',
  Runenstab:'Runen glühen nacheinander auf. +1 auf alle Fertigkeiten.',Weltenast:'Ein lebender Ast. Immer Gift.',Gladius:'Kurz und schnell, mehr kritische Treffer.',
  Falchion:'+25 % Schaden gegen Ungepanzerte.',Rapier:'Durchbohrt: trifft auch den Feind dahinter.',Bastardschwert:'Ohne Schild beidhändig geführt: +25 % Schaden.',
  Estoc:'Durchschlägt Rüstung (+30 % gegen Knochen und Stein) und trifft in einer Linie.',Katana:'Blutung. Der erste Hieb nach 2,5 s Ruhe trifft immer kritisch.',
  Flamberge:'Gewellte Klinge: starke Blutung.',Claymore:'Breiter Hieb: trifft Feinde neben dem Ziel und stößt zurück.',Bartaxt:'Hakt den Schild aus: Schildträger verlieren kurz die Abwehr, andere manchmal auch.',
  Doppelaxt:'Jeder zweite Hieb trifft auch Feinde hinter dir.',Breitaxt:'Spaltet Rüstung: jeder Treffer +8 % Schaden auf dasselbe Ziel (bis 3-mal, 5 s).',
  Flanschkolben:'+50 % gegen Skelette und Golems.',Zepter:'Halb Waffe, halb Fokus: Blitzschaden und Zauberbonus.',Kettenflegel:'Schlägt über Schilde hinweg (+60 % gegen Schildträger), betäubt manchmal.',
  Kriegspicke:'Durchschlägt Rüstung: +35 % gegen Knochen und Stein.',Großhammer:'Erschüttert den Boden: eine kleine Schockwelle trifft Feinde in der Nähe.',Riesenkeule:'Wirft Gegner um und schleudert sie zurück.'};
// how long each one is in the hand, for its icon: [back end, front end, overhang, half width]
Object.assign(WEXT,{Knotenstab:[-14.5,24,2,4],Kampfstab:[-20.5,22,1,3],Zauberrute:[-6.5,13,2,3],Kristallstab:[-14.5,31,1,4],Knochenstab:[-14.5,28,1,4.5],Runenstab:[-14.5,27,0,4],Weltenast:[-14.5,27,1,6],
  Gladius:[-7.5,15,0,3.5],Falchion:[-6.5,19,0,4],Rapier:[-7,22,0,4.5],Bastardschwert:[-10.5,24,0,4],Estoc:[-12,30,0,5],Katana:[-10,24,0,3.6],Flamberge:[-12,31,0,6.5],Claymore:[-12,30,0,6.5],
  Bartaxt:[-7.5,21,2.5,10],Doppelaxt:[-10.5,24,3,11.5],Breitaxt:[-10.5,24,4,13.5],Flanschkolben:[-7.5,19,6,5.5],Zepter:[-7.5,17,4,4],Kettenflegel:[-7.5,24,1,10],Kriegspicke:[-7.5,20,2,7],
  Großhammer:[-10.5,29,0,8],Riesenkeule:[-8.5,25,1,5]});

const _expandItemsNW=expandItems;expandItems=function(){_expandItemsNW();
  for(const[n,lvl,a,b,sp,str,dex,two,cls,sz]of NW){const B={n,slot:'weapon',lvl,dmg:[a,b],speed:sp,str,dex,twoH:!!two,cls};BASE[n]=B;PXS[n]=NWPX[n];ISZ[n]=sz;
    for(const M of MATS){if(lvl+M.l>75)continue;const tn=M.p+'-'+n;BASE[tn]=Object.assign({},B,{n:tn,shape:n,tier:M.p,lvl:lvl+M.l,str:Math.round(str*(1+M.l/80)),dex:Math.round(dex*(1+M.l/80)),dmg:[a,b].map(v=>Math.max(1,Math.round(v*M.m)))});
      PXS[tn]=[NWPX[n][0],M.mat,NWPX[n][2],NWPX[n][3],NWPX[n][4]]}}
  UNIQ.push({n:'Glimmwurz',b:'Knotenstab',lvl:4,m:{spell:20,fire:4,mana:15}},{n:'Eisherz des Winters',b:'Kristallstab',lvl:22,m:{spell:60,cold:15,mana:40,res:15}},
    {n:'Der lachende Schädel',b:'Knochenstab',lvl:26,m:{spell:70,ls:4,life:50,allsk:1}},{n:'Wurzel der Welt',b:'Weltenast',lvl:55,m:{spell:150,poison:40,regen:10,life:120,allsk:2}},
    {n:'Zunge des Legionärs',b:'Gladius',lvl:5,m:{ed:70,crit:8,ias:10}},{n:'Morgentau',b:'Katana',lvl:30,m:{ed:180,crit:12,ias:20,dex:20}},
    {n:'Zorn des Feuerbergs',b:'Flamberge',lvl:36,m:{ed:220,fire:30,str:25,life:60}},{n:'Grimmbart',b:'Bartaxt',lvl:8,m:{ed:90,str:10,life:25}},
    {n:'Glockenschlag',b:'Kettenflegel',lvl:18,m:{ed:140,light:12,ias:15}},{n:'Erdbrecher',b:'Großhammer',lvl:36,m:{ed:240,str:30,dmgred:8,life:80}});
  Object.assign(PXU,{'Eisherz des Winters':['sky','moon',0,'frost'],'Der lachende Schädel':['bone','dark',0,'soul'],'Wurzel der Welt':['moss','gold',0,'emerald'],'Morgentau':['moon','dark',0,'sapphire'],
    'Zorn des Feuerbergs':['ember','gold',0,'ember'],'Erdbrecher':['dark','bronze',0,'topaz']})};
const nwSh=it=>it&&BASE[it.b]?SH(it.b):null;
const _makeItemNW=makeItem;makeItem=function(l,o){const it=_makeItemNW(l,o),s=nwSh(it);if(it&&s&&NWIMP[s]&&!it.nwi){it.nwi=1;const im=NWIMP[s](BASE[it.b].lvl);for(const k in im)it.mods[k]=(it.mods[k]||0)+Math.round(im[k])}
  if(s==='Kristallstab')it.elem='frost';else if(s==='Weltenast')it.elem='poison';return it};
const _itemTipNW=itemTipHTML;itemTipHTML=function(it,c){let h=_itemTipNW(it,c);const t=it&&it.slot==='weapon'&&NWT[nwSh(it)];if(t){const d=`<div class="mod" style="color:#c8b8ff">${t}</div>`,i=h.indexOf('<div class="act">');h=i>=0?h.slice(0,i)+d+h.slice(i):h+d}return h};

// the weapon in hand, its own shape
const nwW=()=>{const w=P&&P.eq&&P.eq.weapon;return w&&P.d&&P.d.okS&&P.d.okS.has(w)&&wOK(w)?nwSh(w):null};
const _recalcNW=recalc;recalc=function(){_recalcNW();if(!P||!P.d)return;const s=nwW(),d=P.d;
  if(s==='Bastardschwert'&&!P.eq.offhand){d.dmin=Math.round(d.dmin*1.25);d.dmax=Math.round(d.dmax*1.25)}if(s==='Kampfstab')d.spellMul*=.85};
const nwHard=e=>['skel','archer','golem','warden'].includes(e.look||e.type)||e.role==='shield';
function nwStun(e,t){if(e.boss)t*=.3;e.stun=Math.max(e.stun||0,t);e.nwSt=Math.max(e.nwSt||0,t);e.slow=Math.max(e.slow||0,t*1.5);if(CFG.numbers&&t>.4)ftext(e.x,e.y-.3,'Betäubt','#ffe08a')}
const nwFoes=(f)=>G.map.enemies.filter(q=>!q.dead&&!q.wall&&f(q));
const _weaponHitNW=weaponHit;weaponHit=function(e,mult=1){const s=nwW(),S=s&&NWS[s];if(!S||e.dead)return _weaponHitNW(e,mult);
  const hard=nwHard(e);let m=mult;if(S.hard&&hard)m*=S.hard;if(S.soft&&!hard)m*=S.soft;if(S.shield&&e.role==='shield')m*=S.shield;if(S.sunder&&e.sunT>0)m*=1+S.sunder*(e.sunN||0);
  if(S.hook&&(e.role==='shield'||Math.random()<S.hook))nwStun(e,.5);
  // drawn and cut in one: after a pause the first stroke always finds its mark
  let c0=null;if(S.draw&&G.t-(P.nwLast||-9)>2.5){c0=P.d.crit;P.d.crit=100}
  try{_weaponHitNW(e,m)}finally{if(c0!=null)P.d.crit=c0}P.nwLast=G.t;
  const d=P.d,avg=(d.dmin+d.dmax)/2*m+d.ele,a=Math.atan2(e.y-P.y,e.x-P.x),ca=Math.cos(a),sa=Math.sin(a);
  if(S.bleed&&!e.dead){e.bleedT=3;e.bleedD=Math.max(e.bleedD||0,avg*S.bleed/3)}
  if(S.kb&&!e.dead&&!e.boss){const k=S.kb*16/(e.scale||1);e.kvx=(e.kvx||0)+ca*k;e.kvy=(e.kvy||0)+sa*k}
  if(S.stun&&!e.dead&&Math.random()<S.stun)nwStun(e,s==='Riesenkeule'?.8:.6);
  if(S.sunder&&!e.dead){e.sunN=Math.min(3,(e.sunT>0?e.sunN||0:0)+1);e.sunT=5}
  const de=hyp(e.x-P.x,e.y-P.y);
  if(S.line)for(const q of nwFoes(q=>q!==e)){const dx=q.x-P.x,dy=q.y-P.y,t=dx*ca+dy*sa;if(t>de&&t<de+2.6&&Math.abs(dy*ca-dx*sa)<.5+(q.r||.3)){hitEnemy(q,avg*S.line*(S.hard&&nwHard(q)?S.hard:1),{from:a});sparks(q.x,q.y,.8,a,5,['#ffffff','#e8f0ff'],5)}}
  if(S.cleave)for(const q of nwFoes(q=>q!==e&&hyp(q.x-e.x,q.y-e.y)<1.5+(q.r||.3)))hitEnemy(q,avg*S.cleave,{from:Math.atan2(q.y-P.y,q.x-P.x),kb:.5});
  if(S.back&&(P.nwN=(P.nwN||0)+1)%2===0){const r=(d.reach||1.6)+.5;for(const q of nwFoes(q=>{const dx=q.x-P.x,dy=q.y-P.y;return dx*ca+dy*sa<0&&hyp(dx,dy)<r+(q.r||.3)})){hitEnemy(q,avg*S.back,{from:Math.atan2(q.y-P.y,q.x-P.x),kb:.4});sparks(q.x,q.y,.8,a+Math.PI,6,['#ffffff','#fff0c0'],5)}}
  if(S.quake){shock(e.x,e.y,1.9,'210,190,150',.35,3);smoke(e.x,e.y,4,'rgba(120,104,84,',6,.6);G.shake=Math.max(G.shake,5);for(const q of nwFoes(q=>q!==e&&hyp(q.x-e.x,q.y-e.y)<1.9+(q.r||.3)))hitEnemy(q,avg*S.quake,{from:Math.atan2(q.y-e.y,q.x-e.x),kb:.6})}};
// bleeding runs red, a little every moment, for three seconds
const _updEnemyNW=updEnemy;updEnemy=function(e,dt){
  // stunned: stands still and dazed, only knockback moves it
  if(!e.dead&&e.nwSt>0){e.nwSt-=dt;e.stun=Math.max(e.stun||0,e.nwSt);e.flash=Math.max(0,(e.flash||0)-dt);e.hitT=Math.max(0,(e.hitT||0)-dt);
    if(e.kvx||e.kvy){moveEnt(e,e.kvx*dt,e.kvy*dt);const dm=Math.pow(.002,dt);e.kvx*=dm;e.kvy*=dm}if(Math.random()<dt*6)fxp({k:'spark',x:e.x+rnd(-.2,.2),y:e.y+rnd(-.2,.2),z:1.3*(e.scale||1),vz:rnd(0,.6),life:.4,col:pick(['#fff0a0','#ffe08a']),s:1.2,g:0})}
  else _updEnemyNW(e,dt);if(e.dead)return;if(e.sunT>0)e.sunT-=dt;
  if(e.bleedT>0){e.bleedT-=dt;e.hp-=e.bleedD*dt*(e.dmgTaken||1);if(Math.random()<dt*8)fxp({k:'blood',x:e.x+rnd(-.15,.15),y:e.y+rnd(-.15,.15),z:.7*(e.scale||1),vx:rnd(-.4,.4),vy:rnd(-.4,.4),vz:rnd(0,1),life:.6,col:pick(['#7a0a06','#a3201a']),s:1.4,g:7});
    if(e.hp<=0){e.lastBlow={k:'cut',from:0,t:performance.now()};killEnemy(e,0)}}};
// the crystal staff makes frost bite longer, the bone staff drinks from every spell
const _hitEnemyNW=hitEnemy;hitEnemy=function(e,dmg,o={}){if(o.slow&&nwW()==='Kristallstab')o=Object.assign({},o,{slow:o.slow*1.6});return _hitEnemyNW(e,dmg,o)};
const _eHitNW=eHit;eHit=function(el,e,dmg,o){const was=!e.dead;_eHitNW(el,e,dmg,o);if(was&&nwW()==='Knochenstab'&&P.d)P.hp=Math.min(P.d.life,P.hp+dmg*.04)};

// drawing: along +x from the hand, ramps dark to light
function nwGlow(x,y,r,rgb,a){if(a<=0||r<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${rgb},${a})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore()}
// a blade from its profile: wf(t) gives the half widths above and below the line, curve bends it, wave makes it ripple
function nwBlade(m,L,wf,o={}){const n=18,top=[],bot=[];for(let i=0;i<=n;i++){const t=i/n,x=1+t*(L-1),c=(o.curve||0)*t*t+(o.wave?Math.sin(t*o.wave)*.8*(1-t*.4):0),[a,b]=wf(t);top.push([x,c-a]);bot.push([x,c+b])}
  let y0=1e9,y1=-1e9;for(const[,y]of[...top,...bot]){y0=Math.min(y0,y);y1=Math.max(y1,y)}const P_=m.p,g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,P_[3]);g.addColorStop(.35,P_[2]);g.addColorStop(.55,P_[1]);g.addColorStop(1,P_[0]);
  ctx.fillStyle=g;ctx.beginPath();top.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));for(let i=bot.length-1;i>=0;i--)ctx.lineTo(bot[i][0],bot[i][1]);ctx.closePath();ctx.fill();
  if(o.fuller){ctx.strokeStyle=P_[0];ctx.lineWidth=.6;ctx.beginPath();for(let i=1;i<n*o.fuller;i++){const[x,y]=top[i],[,yb]=bot[i];i>1?ctx.lineTo(x,(y+yb)/2):ctx.moveTo(x,(y+yb)/2)}ctx.stroke()}}
const nwTip=(t,k=.85)=>t>k?(1-t)/(1-k):1;
const nwGrip=(m,g0,pom=1.7)=>{limb(g0,0,-1,0,1.15,1.15,m.t);blob(g0-.8,0,pom,pom,m.gemPom?m.gem3:m.s,true)};
const NWD={
  // staves
  Knotenstab:m=>{const P2=[[-14,0],[-4,.8],[6,-.6],[15,.9],[22,-.4]];for(let i=1;i<P2.length;i++)limb(P2[i-1][0],P2[i-1][1],P2[i][0],P2[i][1],1.3,1.1,m.t);blob(10,.2,1.7,1.5,m.t);blob(23,-.5,2.3,2.1,m.t);
    const f=.55+.3*Math.sin(G.t*5.3)+(P&&P.atkT>0?.5:0);nwGlow(23.3,-.5,7*f,'255,140,50',.75);blob(23.4,-.5,1,1,m.gem3,true)},
  Kampfstab:m=>{limb(-20,0,22,0,1.2,1.2,m.t);limb(-20,0,-17,0,1.5,1.5,m.p,true);limb(19,0,22,0,1.5,1.5,m.p,true);limb(-3,0,3,0,1.45,1.45,m.s)},
  Zauberrute:m=>{limb(-6,0,11,0,.95,.7,m.t);limb(9.5,0,11.2,0,1.3,1.3,m.s,true);nwGlow(13.4,0,6,'210,150,255',.5+.2*Math.sin(G.t*3));blob(13.4,0,1.9,1.9,m.gem3,true)},
  Kristallstab:m=>{limb(-14,0,22,0,1.1,1,m.t);limb(21,0,24.5,-3,.6,.35,m.s,true);limb(21,0,24.5,3,.6,.35,m.s,true);nwGlow(26,0,9+(P&&P.atkT>0?4:0),'160,220,255',.55);
    poly([[22,0],[25.5,-2.5],[31,0],[25.5,2.5]],['#2a4a6a','#5a9ac8','#a8d8f8','#f0faff'],true);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fillRect(25,-1.6,2.5,.6)},
  Knochenstab:m=>{limb(-14,0,21,0,1.1,1,m.t);for(const x of[3,8,13,18])blob(x,0,1.5,1.35,m.p);const j=P&&P.atkT>0?Math.abs(Math.sin(G.t*28))*1.1:0;
    poly([[21.5,1.4],[27,1.6+j],[27,3.2+j],[22.5,3]],m.p);blob(24.5,-.4,3.5,3.1,m.p);ctx.fillStyle='#120a08';ctx.beginPath();ctx.ellipse(25.6,-1.6,.9,.75,0,0,7);ctx.ellipse(25.6,1.1,.9,.75,0,0,7);ctx.fill();
    nwGlow(25.6,-.2,5,'150,255,220',.35+.15*Math.sin(G.t*4))},
  Runenstab:m=>{limb(-14,0,23,0,1.15,1.05,m.t);for(let k=0;k<4;k++){const x=4+k*4.6,on=Math.floor(G.t*2.5)%4===k;ctx.fillStyle=on?m.gem3[3]:m.s[1];ctx.fillRect(x-.6,-.5,1.2,1);if(on)nwGlow(x,0,3.5,'120,170,255',.6)}
    poly([[22,-1.4],[24,-3.2],[26.8,0],[24,3.2],[22,1.4]],m.s,true);nwGlow(24.6,0,6,'120,170,255',.45);blob(24.6,0,1.5,1.5,m.gem3,true)},
  Weltenast:m=>{limb(-14,0,20,0,1.35,1,m.t);limb(15,0,24,-4.5,.85,.4,m.t);limb(18,0,25.5,3.5,.75,.35,m.t);limb(19,0,27,0,.8,.45,m.t);const L2=['#16300c','#2f6a1a','#5aa030','#a0e060'];
    for(const[x,y,r]of[[24,-5,1.6],[26,3.8,1.4],[27.4,-.4,1.5],[21.5,-2.6,1.1],[22.6,2.2,1.1]]){blob(x,y+Math.sin(G.t*2+x)*.25,r,r*.8,L2)}nwGlow(22,0,6,'140,240,110',.4);blob(22,0,1.2,1.2,m.gem3,true)},
  // swords
  Gladius:m=>{nwBlade(m,15,t=>{const w=1.9*(1+.3*Math.sin(t*Math.PI*.85))*nwTip(t,.8);return[w,w]},{fuller:.7});limb(0,-2.8,0,2.8,1,1,m.s,true);nwGrip(m,-5)},
  Falchion:m=>{nwBlade(m,19,t=>[1.5*nwTip(t,.8),(1.6+t*1.9)*nwTip(t,.9)]);limb(0,-3.2,0,3.2,1,1,m.s,true);nwGrip(m,-5.5)},
  Rapier:m=>{nwBlade(m,22,t=>{const w=.85*(1-t*.55);return[w,w]});ctx.strokeStyle=m.s[2];ctx.lineWidth=.9;ctx.beginPath();ctx.arc(-.4,0,3.4,-1.35,1.35);ctx.stroke();
    ctx.beginPath();ctx.moveTo(.4,3.2);ctx.quadraticCurveTo(-3,4.4,-6.2,1.4);ctx.stroke();limb(0,-4.2,0,4.2,.55,.55,m.s,true);nwGrip(m,-6,1.4)},
  Bastardschwert:m=>{nwBlade(m,24,t=>{const w=2.1*(1-t*.25)*nwTip(t,.86);return[w,w]},{fuller:.75});limb(0,-3.9,0,3.9,1.1,1.1,m.s,true);nwGrip(m,-9.5)},
  Estoc:m=>{nwBlade(m,30,t=>{const w=1.25*(1-t*.55)*nwTip(t,.9);return[w,w]});limb(0,-4.6,0,4.6,1,1,m.s,true);blob(0,-4.8,.9,.9,m.s,true);blob(0,4.8,.9,.9,m.s,true);nwGrip(m,-11)},
  Katana:m=>{nwBlade(m,24,t=>[1.1*nwTip(t,.9),1.6*nwTip(t,.94)],{curve:-2.6});blob(0,0,1.1,3.3,m.s,true);limb(-9.5,0,-1,0,1.15,1.15,m.t);ctx.fillStyle=m.s[3];for(let x=-8.5;x<-1;x+=1.6){ctx.save();ctx.translate(x,0);ctx.rotate(.785);ctx.fillRect(-.45,-.45,.9,.9);ctx.restore()}
    blob(-10,0,1.1,1.2,m.s,true)},
  Flamberge:m=>{limb(1,0,6,0,1.4,1.4,m.p,true);nwBlade(m,31,t=>{const w=(t<.17?1.3:2.3)*nwTip(t,.88);return[w,w]},{wave:28});limb(0,-5.6,0,5.6,1.1,1.1,m.s,true);blob(0,-6,1,1,m.s,true);blob(0,6,1,1,m.s,true);
    limb(4,-2.4,4,2.4,.6,.6,m.s,true);nwGrip(m,-11,2)},
  Claymore:m=>{nwBlade(m,30,t=>{const w=2.6*(1-t*.3)*nwTip(t,.87);return[w,w]},{fuller:.6});limb(0,0,2.8,-5.8,.9,.7,m.s,true);limb(0,0,2.8,5.8,.9,.7,m.s,true);
    for(const sd of[-1,1]){blob(3.2,sd*6.2,1.1,1.1,m.s,true);blob(2.4,sd*5.4,.6,.6,m.s)}nwGrip(m,-11,2.2)},
  // axes
  Bartaxt:m=>{const L=21;limb(-7,0,L,0,1.1,1.1,m.t);poly([[L-2,-.8],[L-9,-6],[L-8,-9.2],[L-2,-9.6],[L+2,-8.4],[L+1.5,-.8]],m.p,true);limb(L,0,L+1.6,0,1.2,1,m.p,true)},
  Doppelaxt:m=>{const L=24;limb(-10,0,L+2,0,1.2,1.1,m.t);for(const sd of[1,-1]){ctx.save();ctx.scale(1,sd);poly([[L-8,-.8],[L-6,-8.5],[L-1,-11.3],[L+3,-9.2],[L+1,-.8]],m.p,true);ctx.restore()}limb(L+1,0,L+3.5,0,1,.2,m.s,true)},
  Breitaxt:m=>{const L=24;limb(-10,0,L+1,0,1.3,1.2,m.t);poly([[L-9,-.9],[L-11,-9],[L-6,-13.4],[L+2,-12.8],[L+4,-8],[L+1,-.9]],m.p,true);ctx.strokeStyle=m.p[0];ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(L-8,-8.6);ctx.quadraticCurveTo(L-3,-11,L+2.6,-8.4);ctx.stroke();
    poly([[L-3,.9],[L-2,3.4],[L+.5,3.4],[L+1,.9]],m.s,true)},
  // blunt
  Flanschkolben:m=>{const L=19;limb(-7,0,L,0,1.1,1.1,m.t);for(const a of[-1.57,-.65,.65,1.57,0])poly([[L+Math.cos(a+.35)*1.8,Math.sin(a+.35)*1.8],[L+Math.cos(a)*5.4,Math.sin(a)*5.4],[L+Math.cos(a-.35)*1.8,Math.sin(a-.35)*1.8]],m.p,true);blob(L,0,2.3,2.3,m.p,true)},
  Zepter:m=>{const L=17;limb(-7,0,L,0,.9,.9,m.s,true);limb(-2,0,1,0,1.2,1.2,m.t);blob(L,0,2,2,m.p,true);limb(L,0,L+3.6,-2.8,.6,.3,m.p,true);limb(L,0,L+3.6,2.8,.6,.3,m.p,true);
    nwGlow(L+2.8,0,6,'255,220,140',.5+.2*Math.sin(G.t*3));blob(L+2.8,0,1.6,1.6,m.gem3,true)},
  Kettenflegel:m=>{limb(-7,0,9,0,1.15,1,m.t);blob(9.6,0,.9,.9,m.s,true);const sw=Math.sin(G.t*4.6)*.65+(P&&P.atkT>0?Math.sin(G.t*14)*.5:0);let x=10,y=0;
    for(let k=0;k<6;k++){const a=sw*(k+1)/6,nx=x+Math.cos(a)*2.1,ny=y+Math.sin(a)*2.1+k*.12;ctx.strokeStyle=m.s[k%2?1:2];ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse((x+nx)/2,(y+ny)/2,1.1,.55,a,0,7);ctx.stroke();x=nx;y=ny}
    ctx.strokeStyle=m.p[3];ctx.lineWidth=.9;for(let k=0;k<8;k++){const a=k/8*6.283;ctx.beginPath();ctx.moveTo(x+2+Math.cos(a)*2.4,y+Math.sin(a)*2.4);ctx.lineTo(x+2+Math.cos(a)*4.4,y+Math.sin(a)*4.4);ctx.stroke()}blob(x+2,y,2.8,2.8,m.p,true)},
  Kriegspicke:m=>{const L=20;limb(-7,0,L+1,0,1.1,1.1,m.t);poly([[L-1.6,-2],[L+1.6,-2],[L+1.6,2],[L-1.6,2]],m.s,true);poly([[L-1.3,-2],[L-1.7,-5.2],[L+1.7,-5.2],[L+1.3,-2]],m.p,true);poly([[L-1.2,2],[L+.6,7.6],[L+1.2,2]],m.p,true);limb(L+1.6,0,L+3,0,.8,.2,m.p,true)},
  Großhammer:m=>{limb(-10,0,24,0,1.3,1.3,m.t);poly([[22,-7.6],[29,-7.6],[29,7.6],[22,7.6]],m.p,true);for(const x of[22.4,28.6])limb(x,-7.6,x,7.6,.55,.55,m.s,true);blob(25.5,0,1.4,1.4,m.s,true)},
  Riesenkeule:m=>{limb(-8,0,25,0,1.6,4.8,m.t);for(const[x,w]of[[9,2.9],[16,3.8],[22,4.5]])limb(x,-w,x,w,.75,.75,m.p,true);ctx.fillStyle=m.p[3];for(const[x,y]of[[12.5,-3],[19,3.6],[19.5,-3.8],[24,1.2],[13,3]])ctx.fillRect(x-.5,y-.5,1,1)}};
const _vWeaponNW=vWeapon;vWeapon=function(hx,hy,ang,cls,m,b){const d=NWD[SH(b)];if(!d)return _vWeaponNW(hx,hy,ang,cls,m,b);ctx.save();ctx.translate(hx,hy);ctx.rotate(ang);d(m);ctx.restore()};
