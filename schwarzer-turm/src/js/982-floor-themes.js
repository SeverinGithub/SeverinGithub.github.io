/* ---------- theme floors: every three floors the tower changes its face · floor curses · tower windows · a light well · lava, water and steam · light the braziers in the dark ---------- */
const FTH=[
  {id:'kerker',n:'Der Kerker',d:'Zellen, Ketten und feuchtes Stroh',tint:null,dark:'4,3,2',amb:'drip'},
  {id:'biblio',n:'Die Bibliothek',d:'Regale bis unter die Gewölbe',tint:'150,96,40',dark:'7,4,2',amb:'dust'},
  {id:'giess',n:'Die Gießerei',d:'Glut steht in offenen Becken',tint:'230,80,20',dark:'12,3,0',amb:'ember'},
  {id:'zist',n:'Die Zisterne',d:'Schwarzes Wasser unter tropfenden Bögen',tint:'40,110,170',dark:'0,4,10',amb:'drip'},
  {id:'uhr',n:'Das Uhrwerk',d:'Zahnräder mahlen in den Wänden',tint:'200,150,60',dark:'7,5,1',amb:'dust'},
  {id:'kath',n:'Die Kathedrale',d:'Bunte Fenster über kalten Bänken',tint:'140,90,210',dark:'5,2,9',amb:'mote'}];
const fthOf=f=>typeof f==='number'&&f>0?FTH[Math.floor((f-1)/3)%FTH.length]:null;
// a cursed floor is harder and pays better: more experience, more loot
const CURSE={blut:{n:'Blutmond',d:'Gegner schlagen härter und laufen schneller',col:'#ff5a4a',dark:'22,2,2',tint:'200,20,10'},
  nebel:{n:'Nebel',d:'Dichter Nebel schluckt dein Licht',col:'#c8d0d8',dark:'30,32,36',light:.62},
  frost:{n:'Frost',d:'Die Kälte bremst deine Schritte',col:'#9ad8ff',dark:'2,6,14',tint:'120,190,255',spd:.85},
  finster:{n:'Finsternis',d:'Entzünde die Feuerbecken, um wieder zu sehen',col:'#b8a8d8',light:.5,a:.985},
  raserei:{n:'Raserei',d:'Gegner greifen schneller an',col:'#ffa040'}};
let ftRift=0;
const _startRiftF=startRift;startRift=function(lv){ftRift=1;try{return _startRiftF(lv)}finally{ftRift=0}};
const _genDungeonF=genDungeon;genDungeon=function(f){const m=_genDungeonF(f);if(typeof f!=='number')return m;const R0=R;R=mulberry(G.seed*5153+f*7907+(ftRift?Math.floor(Math.random()*1e6):0));
  try{m.fth=fthOf(f);m.isRift=!!ftRift;if(!ftRift&&f>=3&&R()<.3)m.curse=pick(Object.keys(CURSE));ftDress(m)}finally{R=R0}return m};
// helpers for placing things on a fresh map (they use the seeded R)
function ftClear(m,x,y,rad){for(let j=Math.floor(y-rad);j<=Math.floor(y+rad);j++)for(let i=Math.floor(x-rad);i<=Math.floor(x+rad);i++)if(hyp(i+.5-x,j+.5-y)<=rad+.5&&m.t[j*m.w+i]!==1)return false;return true}
function ftFar(m,x,y,d){return!m.objs.some(o=>hyp(o.x-x,o.y-y)<d)&&hyp(m.start.x-x,m.start.y-y)>d+1}
function ftSpot(m,r,rad=1,away=2){for(let k=0;k<40;k++){const x=Math.floor(rnd(r.x+1,r.x+r.w-1))+.5,y=Math.floor(rnd(r.y+1,r.y+r.h-1))+.5;if(ftClear(m,x,y,rad)&&ftFar(m,x,y,away))return[x,y]}return null}
function ftWallSpots(m,n,gap){const{w,t}=m,T=(i,j)=>t[j*w+i],out=[];
  for(let g=0;g<n*80&&out.length<n;g++){const i=rint(3,w-4),j=rint(3,m.h-4);if(T(i,j)!==2)continue;const fy=T(i,j+1)===1&&T(i-1,j)===2&&T(i+1,j)===2&&T(i-1,j+1)===1&&T(i+1,j+1)===1,fx=!fy&&T(i+1,j)===1&&T(i,j-1)===2&&T(i,j+1)===2&&T(i+1,j-1)===1&&T(i+1,j+1)===1;if(!fy&&!fx)continue;
    const x=fy?i+.5:i+1,y=fy?j+1:j+.5;if(m.props.some(p=>p.face&&hyp(p.x-x,p.y-y)<Math.min(gap,2.2))||out.some(p=>hyp(p.x-x,p.y-y)<gap)||m.objs.some(o=>hyp(o.x-x,o.y-y)<1.5))continue;out.push({x,y,face:fy?'y':'x'})}return out}
function ftPool(m,r,arr,rad){for(let k=0;k<24;k++){const x=rnd(r.x+rad+1,r.x+r.w-rad-1),y=rnd(r.y+rad+1,r.y+r.h-rad-1);if(hyp(x-r.cx-.5,y-r.cy-.5)<2.6||!ftClear(m,x,y,rad+.6)||!ftFar(m,x,y,rad+2))continue;
    if([...(m.lava||[]),...(m.water||[])].some(p=>hyp(p.x-x,p.y-y)<p.r+rad+1.2))continue;const P0={x,y,r:rad,ph:rnd(0,6)};arr.push(P0);return P0}return null}
function ftDress(m){const th=m.fth,T=(i,j)=>m.t[j*m.w+i],rooms=m.rooms.filter(r=>r!==m.startRoom&&!(m.boss&&r===m.endRoom));m.lava=[];m.water=[];m.vents=[];
  // tower windows: the tower is a tower, and through its walls you see the sky and the islands
  for(const s of ftWallSpots(m,rint(3,5),9))m.props.push({k:th.id==='kath'?'ftglass':'ftwin',...s,v:rint(0,3),ph:rnd(0,6)});
  if(th.id==='kerker')for(const s of ftWallSpots(m,rint(8,12),4))m.props.push({k:'ftbars',...s,v:rint(0,2),ph:rnd(0,6)});
  if(th.id==='biblio'){for(const s of ftWallSpots(m,rint(24,32),2.1))m.props.push({k:'ftshelf',...s,v:rint(0,3),ph:0});for(const r of rooms)if(R()<.6)for(let k=rint(1,3);k--;){const p=ftSpot(m,r,1);if(p)m.props.push({k:'ftcandle',x:p[0],y:p[1],ph:rnd(0,6),v:0})}}
  if(th.id==='giess'){for(const r of rooms)if(R()<.75)for(let k=rint(1,3);k--;)ftPool(m,r,m.lava,rnd(1.1,2.1));for(const L of m.lava)m.props.push({k:'ftlavaL',x:L.x,y:L.y,ph:L.ph,r:L.r});
    for(const r of rooms)if(R()<.45){const p=ftSpot(m,r,1,2);if(p)m.props.push({k:'ftcruc',x:p[0],y:p[1],ph:rnd(0,6),v:0})}}
  if(th.id==='zist')for(const r of rooms)if(R()<.8)for(let k=rint(1,3);k--;)ftPool(m,r,m.water,rnd(1.4,2.7));
  if(th.id==='uhr'){for(const s of ftWallSpots(m,rint(10,16),5))m.props.push({k:'ftgear',...s,v:rint(0,2),ph:rnd(0,6)});for(const r of rooms)if(R()<.65)for(let k=rint(1,2);k--;){const p=ftSpot(m,r,1,2.5);if(p)m.vents.push({x:p[0],y:p[1],t:rnd(0,4),per:rnd(3.6,5.2)})}}
  if(th.id==='kath')for(const r of rooms)if(r.w>=14&&r.h>=14&&R()<.65)for(let row=-2;row<=2;row++)for(const s of[-1,1]){const x=r.cx+.5+s*2.4,y=r.cy+.5+row*1.7;if(ftClear(m,x,y,1)&&ftFar(m,x,y,1.6))m.props.push({k:'ftpew',x,y,v:0,ph:0})}
  // a light well: a round shaft through the middle of a great hall, light from above and the dark of the floors below
  if(R()<.45)for(const r of rooms.filter(r=>(r.shape==='hall'||r.shape==='round')&&r.w>=15&&r.h>=15).sort(()=>R()-.5))if(ftWell(m,r))break;
  if(m.curse==='finster')for(const p of m.props)if(p.k==='brazier')p.k='ftcold'}
function ftWell(m,r){const x=r.cx+.5,y=r.cy+.5,rad=2.6;if(!ftClear(m,x,y,5.4)||!ftFar(m,x,y,5.5))return false;
  for(let j=Math.floor(y-rad);j<=y+rad;j++)for(let i=Math.floor(x-rad);i<=x+rad;i++)if(hyp(i+.5-x,j+.5-y)<rad)m.t[j*m.w+i]=0;
  m.props=m.props.filter(p=>hyp(p.x-x,p.y-y)>rad+.9);m.deco=m.deco.filter(d=>hyp(d.x-x,d.y-y)>rad+.5);
  for(let k=0;k<12;k++){const a=k/12*6.283+.26;m.props.push({k:'ftpost',x:x+Math.cos(a)*(rad+.75),y:y+Math.sin(a)*(rad+.75),v:0,ph:0})}
  m.props.push({k:'shaft',x,y,ph:rnd(0,6)});m.well={x,y,r:rad,room:r};return true}
// a cursed floor's foes
const _populateF=populate;populate=function(m){_populateF(m);if(m.kind!=='dungeon'||!m.curse)return;const c=m.curse;
  for(const e of m.enemies){if(e.wall||e.cursed)continue;e.cursed=1;e.xp*=1.3;if(c==='blut'){e.dmg=e.dmg.map(v=>v*1.3);e.spd*=1.15}if(c==='raserei')e.spd*=1.15}};
const _updEnemyF=updEnemy;updEnemy=function(e,dt){if(!e.dead&&!e.wall&&G.map&&G.map.curse==='raserei'&&e.cd>0&&e.cd<60)e.cd-=dt*.45;return _updEnemyF(e,dt)};
const _killEnemyF=killEnemy;killEnemy=function(e,a){const m=G.map,was=e&&e.dead;_killEnemyF(e,a);if(!was&&e&&!e.wall&&m&&m.curse&&Math.random()<.12)dropItem(makeItem(mlNow(),{mf:P.d.mf}),e.x,e.y)};
// what the renderer asks: how dark, how far the hero's own light reaches, how fast the hero walks
function dungDark(m){const c=m.curse&&CURSE[m.curse],col=(c&&c.dark)||(m.fth&&m.fth.dark)||'4,3,2';return`rgba(${col},${(c&&c.a)||.95})`}
function plLight(m){const c=m.curse&&CURSE[m.curse];if(!c||!c.light)return 1;if(m.curse==='finster'&&m.fires)return c.light+(1-c.light)*m.fires.lit/Math.max(1,m.fires.n);return c.light}
function floorSpd(){const m=G.map;if(!m||m.kind!=='dungeon')return 1;let s=1;const c=m.curse&&CURSE[m.curse];if(c&&c.spd)s*=c.spd;if(m.inWater)s*=.72;return s}
const _floorTitleF=floorTitle;floorTitle=function(f){const s=_floorTitleF(f),th=fthOf(f),m=G.maps&&G.maps[f];return th&&!(m&&m.isRift)?s+' · '+th.n.replace(/^(Der|Die|Das) /,''):s};
const _enterFloorF=enterFloor;enterFloor=function(f){_enterFloorF(f);const m=G.map;if(!m||m.kind!=='dungeon'||typeof f!=='number'||!m.fth)return;const c=m.curse&&CURSE[m.curse];
  if(!m.boss||G.bossDead[f])banner(floorTitle(f),(c?'Fluch: '+c.n+' · ':'')+m.fth.d,c?'boss':'',3000);
  if(c){$('floorName').textContent=floorTitle(f)+' · '+c.n;log(`Fluch der Ebene: ${c.n}. ${c.d}. Dafür gibt es mehr Erfahrung und Beute.`,c.col)}
  if(m.curse==='finster'){const n=m.props.filter(p=>p.k==='ftcold'||p.k==='brazier'&&p.lit).length;m.fires=m.fires||{n,lit:0};if(m.fires.lit<n)log(`Es ist finster. ${n-m.fires.lit} Feuerbecken warten darauf, entzündet zu werden.`,c.col)}};

// the ground: theme tint, lava, water, the light well, steam vents, coloured light from the windows
const _drawDecalsF=drawDecals;drawDecals=function(){_drawDecalsF();const m=G.map;if(m&&m.kind==='dungeon')ftGround(m)};
function ftGround(m){const c=m.curse&&CURSE[m.curse],tint=(c&&c.tint)||(m.fth&&m.fth.tint);
  if(tint){ctx.save();ctx.globalCompositeOperation='soft-light';ctx.fillStyle=`rgba(${tint},.5)`;ctx.fillRect(0,0,W,H);ctx.restore()}
  for(const L of m.water||[])ftWater(L);for(const L of m.lava||[])ftLava(L);if(m.well)ftWellDraw(m.well);
  for(const v of m.vents||[]){const[sx,sy]=iso(v.x,v.y);if(sx<-30||sx>W+30||sy<-30||sy>H+30)continue;const warn=v.t>v.per-.7;ctx.fillStyle='#14110c';ctx.beginPath();ctx.ellipse(sx,sy,15,7.5,0,0,7);ctx.fill();
    ctx.strokeStyle=warn?`rgba(255,240,220,${.5+Math.sin(G.t*30)*.3})`:'#4a4236';ctx.lineWidth=1.4;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(sx+k*5-3,sy-3+Math.abs(k));ctx.lineTo(sx+k*5+3,sy+3-Math.abs(k));ctx.stroke()}
    ctx.strokeStyle='#6a5a3a';ctx.beginPath();ctx.ellipse(sx,sy,15,7.5,0,0,7);ctx.stroke()}
  ctx.save();ctx.globalCompositeOperation='lighter';for(const p of m.props){if(p.k!=='ftglass'&&p.k!=='ftwin')continue;const[sx,sy]=iso(p.x,p.y);if(sx<-160||sx>W+160||sy<-60||sy>H+160)continue;
    const col=p.k==='ftglass'?GLASS[p.v%4]:'150,180,240',d=p.face==='y'?[0,1]:[1,0],q=[[-.45,0],[.45,0],[.9,3.2],[-.9,3.2]].map(([s,l])=>iso(p.x+(d[1]?s:0)+d[0]*l,p.y+(d[0]?s:0)+d[1]*l)),fl=.8+Math.sin(G.t*.6+p.ph)*.2;
    const g=ctx.createLinearGradient(sx,sy,(q[2][0]+q[3][0])/2,(q[2][1]+q[3][1])/2);g.addColorStop(0,`rgba(${col},${.2*fl})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();q.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()}ctx.restore()}
function ftLava(L){const[sx,sy]=iso(L.x,L.y),rx=L.r*45.25,ry=L.r*22.6;if(sx+rx<-10||sx-rx>W+10||sy+ry<-10||sy-ry>H+10)return;const t=G.t;
  ctx.fillStyle='#160804';ctx.beginPath();ctx.ellipse(sx,sy+1,rx+6,ry+4,0,0,7);ctx.fill();ctx.fillStyle='#3a1608';ctx.beginPath();ctx.ellipse(sx,sy,rx+3,ry+2,0,0,7);ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(sx,sy,rx,ry,0,0,7);ctx.clip();const g=ctx.createRadialGradient(sx,sy,0,sx,sy,rx);g.addColorStop(0,'#ffe890');g.addColorStop(.4,'#ff9a28');g.addColorStop(1,'#b0300a');ctx.fillStyle=g;ctx.fillRect(sx-rx,sy-ry,rx*2,ry*2);
  for(let k=0;k<11;k++){const a=L.ph+k*2.3+t*.06*(k%2?1:-1),d=.25+(k*.37%1)*.55,ox=Math.cos(a)*rx*d,oy=Math.sin(a*1.3)*ry*d,z=.07+(k%3)*.035;ctx.fillStyle=k%3?'rgba(70,18,4,.5)':'rgba(40,10,2,.65)';ctx.beginPath();ctx.ellipse(sx+ox,sy+oy,rx*z,ry*z*.8,a,0,7);ctx.fill()}
  for(let k=0;k<4;k++){const p=(t*.5+k*.29+L.ph)%1,a=L.ph*3+k*2.3,ox=Math.cos(a)*rx*.45,oy=Math.sin(a)*ry*.45;ctx.strokeStyle=`rgba(255,240,170,${1-p})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(sx+ox,sy+oy,1+p*6,.5+p*3,0,0,7);ctx.stroke()}
  ctx.restore();ctx.save();ctx.globalCompositeOperation='lighter';const h=ctx.createRadialGradient(sx,sy,0,sx,sy,rx*1.4);h.addColorStop(0,`rgba(255,120,30,${.22+Math.sin(t*2+L.ph)*.05})`);h.addColorStop(1,'rgba(255,60,10,0)');ctx.fillStyle=h;ctx.beginPath();ctx.ellipse(sx,sy,rx*1.4,ry*1.4,0,0,7);ctx.fill();ctx.restore()}
function ftWater(L){const[sx,sy]=iso(L.x,L.y),rx=L.r*45.25,ry=L.r*22.6;if(sx+rx<-10||sx-rx>W+10||sy+ry<-10||sy-ry>H+10)return;const t=G.t;
  ctx.fillStyle='#2a3238';ctx.beginPath();ctx.ellipse(sx,sy+1,rx+4,ry+3,0,0,7);ctx.fill();const g=ctx.createRadialGradient(sx-rx*.2,sy-ry*.3,0,sx,sy,rx);g.addColorStop(0,'#1e3a52');g.addColorStop(1,'#08141e');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(sx,sy,rx,ry,0,0,7);ctx.fill();
  ctx.save();ctx.clip();for(let k=0;k<3;k++){const p=(t*.25+k/3+L.ph)%1,a=L.ph+k*2.1,ox=Math.cos(a)*rx*.35,oy=Math.sin(a)*ry*.35;ctx.strokeStyle=`rgba(150,200,240,${(1-p)*.35})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(sx+ox,sy+oy,p*rx*.6,p*ry*.6,0,0,7);ctx.stroke()}
  ctx.fillStyle='rgba(200,230,255,.08)';ctx.beginPath();ctx.ellipse(sx-rx*.3,sy-ry*.35,rx*.35,ry*.12,-.2,0,7);ctx.fill();ctx.restore()}
function ftWellDraw(w){const[sx,sy]=iso(w.x,w.y),rx=(w.r-.2)*45.25,ry=(w.r-.2)*22.6;if(sx+rx<0||sx-rx>W||sy+ry<0||sy-ry>H+200)return;const t=G.t;ctx.save();ctx.beginPath();ctx.ellipse(sx,sy,rx,ry,0,0,7);ctx.clip();
  const g=ctx.createRadialGradient(sx,sy+ry*.3,0,sx,sy,rx);g.addColorStop(0,'#1a2440');g.addColorStop(.6,'#0a0e1c');g.addColorStop(1,'#020204');ctx.fillStyle=g;ctx.fillRect(sx-rx,sy-ry,rx*2,ry*2);
  // the floors below: far torches turning slowly in the deep
  for(let k=0;k<9;k++){const d=.25+(k%3)*.25,a=k*2.4+t*.05*(k%2?1:-1),x=sx+Math.cos(a)*rx*d*.8,y=sy+Math.sin(a)*ry*d*.8+ry*.2,b=.4+Math.sin(t*3+k)*.2;ctx.fillStyle=`rgba(255,${150+k*8},70,${b*(1-d*.6)})`;ctx.fillRect(x,y,1.5,1.5)}
  for(let k=0;k<3;k++){ctx.strokeStyle=`rgba(120,140,190,${.08+k*.03})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(sx,sy+ry*(.15+k*.12),rx*(.85-k*.22),ry*(.85-k*.22),0,0,7);ctx.stroke()}ctx.restore();
  ctx.strokeStyle='#2a2620';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(sx,sy,rx+2,ry+1,0,0,7);ctx.stroke()}

// props of the themes
const GLASS=['230,60,60','80,130,255','250,200,60','170,90,230'];
const FTL={ftwin:{r:120,a:.55,col:'140,170,230',f:2,h:WH*.6},ftcandle:{r:115,a:.65,col:'255,180,90',f:4,h:42},ftcruc:{r:160,a:.8,col:'255,120,40',f:7,h:16},ftcold:{r:40,a:.3,col:'255,80,30',f:1,h:14}};
const _propLightF=propLight;propLight=function(p){if(p.k==='ftglass')return{r:160,a:.75,col:GLASS[p.v%4],f:3,h:WH*.6};if(p.k==='ftlavaL')return{r:110+p.r*55,a:.85,col:'255,110,30',f:7,h:2};return FTL[p.k]||_propLightF(p)};
const _drawPropF=drawProp;drawProp=function(p){if(!p.k||p.k[0]!=='f'||p.k[1]!=='t')return _drawPropF(p);ftProp(p)};
const FTS={};
function ftShelf(v){if(FTS['s'+v])return FTS['s'+v];const Rr=mulberry(v*131+7),pal=['#6a1a14','#1a3a6a','#2a5a24','#6a5a1a','#4a2a5a','#8a6a3a','#3a2a1a','#7a3a1a'];
  return FTS['s'+v]=mk(30,52,g=>{g.fillStyle='#2a1a0e';g.fillRect(0,0,30,52);g.fillStyle='#120a04';g.fillRect(2,2,26,48);
    for(let s=0;s<4;s++){const y0=2+s*12;let x=3;while(x<27){const w=2+Math.floor(Rr()*3),h=7+Math.floor(Rr()*4);if(Rr()<.12){x+=w+1;continue}if(x+w>27)break;g.fillStyle=pal[Math.floor(Rr()*pal.length)];g.fillRect(x,y0+10-h,w,h);g.fillStyle='rgba(255,220,140,.35)';g.fillRect(x,y0+12-h,w,1);x+=w}
      g.fillStyle='#4a2e18';g.fillRect(1,y0+10,28,2)}g.fillStyle='#4a2e18';g.fillRect(0,0,30,2);g.fillRect(0,0,2,52);g.fillRect(28,0,2,52)})}
function archP(x,y,w,h){ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w/2);ctx.arc(x+w/2,y+w/2,w/2,Math.PI,0);ctx.lineTo(x+w,y+h);ctx.closePath()}
function gearP(x,y,r,n,a){ctx.beginPath();for(let k=0;k<n*2;k++){const q=a+k/(n*2)*6.283,rr=k%2?r:r*.78;const q2=a+(k+1)/(n*2)*6.283;ctx.lineTo(x+Math.cos(q)*rr,y+Math.sin(q)*rr);ctx.lineTo(x+Math.cos(q2)*rr,y+Math.sin(q2)*rr)}ctx.closePath()}
function ftProp(p){const[sx,sy]=iso(p.x,p.y);if(sx<-90||sx>W+90||sy<-160||sy>H+80)return;const t=G.t;
  if(p.k==='ftlavaL')return;
  if(p.face){ctx.save();ctx.translate(sx,sy);ctx.transform(1,p.face==='y'?.5:-.5,0,1,0,0);
    if(p.k==='ftwin'){ctx.fillStyle='#3a3630';archP(-11,-47,22,32);ctx.fill();archP(-9,-45,18,30);ctx.save();ctx.clip();const g=ctx.createLinearGradient(0,-45,0,-15);g.addColorStop(0,'#0b1430');g.addColorStop(.7,'#2a4a86');g.addColorStop(1,'#b07a5a');ctx.fillStyle=g;ctx.fillRect(-9,-45,18,30);
        for(let k=0;k<6;k++){ctx.fillStyle=`rgba(255,255,255,${.4+Math.sin(t*2+k+p.ph)*.3})`;ctx.fillRect(-8+((k*7+p.v*5)%16),-43+((k*5)%12),1,1)}
        const cx=((t*1.5+p.ph*9)%34)-17;ctx.fillStyle='rgba(200,210,240,.35)';ctx.fillRect(cx-5,-26,10,2);ctx.fillRect(cx-3,-27,6,1);
        ctx.fillStyle='#141a2e';const ix=-3+(p.v%3)*3,iy=-22+Math.sin(t*.8+p.ph)*.8;ctx.beginPath();ctx.ellipse(ix,iy,5,1.6,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(ix-4,iy);ctx.lineTo(ix,iy+4);ctx.lineTo(ix+4,iy);ctx.fill();
        if(p.v===1){ctx.fillRect(ix-1,iy-6,2,5)}else if(p.v===2){ctx.fillStyle='#e8e4d0';ctx.beginPath();ctx.arc(5,-38,2.4,0,7);ctx.fill()}else if(p.v===3){ctx.fillStyle='#141a2e';ctx.beginPath();ctx.ellipse(-5,-19,3,1,0,0,7);ctx.fill()}
        ctx.restore();ctx.fillStyle='#2a2620';ctx.fillRect(-.7,-45,1.4,30);ctx.fillRect(-9,-31,18,1.2);ctx.fillStyle='#4a453c';ctx.fillRect(-12,-15,24,3)}
    else if(p.k==='ftglass'){ctx.fillStyle='#2a2430';archP(-12,-50,24,36);ctx.fill();archP(-10,-48,20,34);ctx.save();ctx.clip();const C=GLASS.map(c=>`rgb(${c})`);
        for(let y=0;y<6;y++)for(let x=0;x<4;x++){const q=(x+y+p.v)%4,b=.55+Math.sin(t*1.3+x+y*2+p.ph)*.12;ctx.globalAlpha=b;ctx.fillStyle=C[q];ctx.fillRect(-10+x*5,-48+y*6,5,6)}ctx.globalAlpha=1;
        ctx.strokeStyle='#14101a';ctx.lineWidth=1;for(let x=-5;x<=5;x+=5){ctx.beginPath();ctx.moveTo(x,-48);ctx.lineTo(x,-14);ctx.stroke()}for(let y=-42;y<-14;y+=6){ctx.beginPath();ctx.moveTo(-10,y);ctx.lineTo(10,y);ctx.stroke()}
        ctx.beginPath();ctx.arc(0,-38,4,0,7);ctx.stroke();ctx.restore();ctx.fillStyle='#4a4048';ctx.fillRect(-13,-14,26,3)}
    else if(p.k==='ftbars'){ctx.fillStyle='#050404';archP(-11,-40,22,40);ctx.fill();ctx.fillStyle='#2a2620';ctx.fillRect(-12,-42,24,3);
        if(p.v===2){const b=Math.sin(t*.7+p.ph)>.85?0:1;ctx.fillStyle=`rgba(255,60,30,${.8*b})`;ctx.fillRect(-4,-26,2,1);ctx.fillRect(2,-26,2,1)}
        if(p.v===1){ctx.fillStyle='#d8d0bc';ctx.fillRect(-6,-22,2,6);ctx.fillRect(-7,-17,4,2)}
        for(let x=-9;x<=9;x+=4.5){ctx.fillStyle='#34343a';ctx.fillRect(x-1,-38,2.2,38);ctx.fillStyle='#6a6a74';ctx.fillRect(x-1,-38,.8,38)}ctx.fillStyle='#34343a';ctx.fillRect(-11,-26,22,2);ctx.fillRect(-11,-9,22,2)}
    else if(p.k==='ftshelf'){ctx.drawImage(ftShelf(p.v),-15,-WH+3)}
    else if(p.k==='ftgear'){const a=t*.5+p.ph;ctx.fillStyle='#0c0a06';ctx.fillRect(-14,-46,28,36);for(const[x,y,r,n,s]of[[-4,-32,11,12,1],[8,-20,6.5,8,-12/8]]){gearP(x,y,r,n,a*s);ctx.fillStyle='#8a6a2a';ctx.fill();ctx.strokeStyle='#c8a050';ctx.lineWidth=.8;ctx.stroke();
          ctx.fillStyle='#4a3814';ctx.beginPath();ctx.arc(x,y,r*.5,0,7);ctx.fill();ctx.fillStyle='#2a1a08';ctx.beginPath();ctx.arc(x,y,r*.18,0,7);ctx.fill();ctx.strokeStyle='#6a5020';ctx.lineWidth=1.4;for(let k=0;k<4;k++){const q=a*s+k*1.571;ctx.beginPath();ctx.moveTo(x+Math.cos(q)*r*.18,y+Math.sin(q)*r*.18);ctx.lineTo(x+Math.cos(q)*r*.5,y+Math.sin(q)*r*.5);ctx.stroke()}}
        if(p.v===1){const sw=Math.sin(t*1.8+p.ph)*.5;ctx.strokeStyle='#8a6a2a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-8,-44);ctx.lineTo(-8+Math.sin(sw)*16,-44+Math.cos(sw)*16);ctx.stroke();ctx.fillStyle='#c8a050';ctx.beginPath();ctx.arc(-8+Math.sin(sw)*16,-44+Math.cos(sw)*16,2.5,0,7);ctx.fill()}}
    ctx.restore();return}
  if(p.k==='ftpost'){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(sx,sy,6,3,0,0,7);ctx.fill();ctx.fillStyle='#3e3a34';ctx.fillRect(sx-3,sy-13,6,13);ctx.fillStyle='#6a6458';ctx.fillRect(sx-3,sy-13,2,13);ctx.fillStyle='#5a544a';ctx.fillRect(sx-4,sy-16,8,3);return}
  if(p.k==='ftpew'){const C=[[-.85,-.22],[.85,-.22],[.85,.22],[-.85,.22]].map(([a,b])=>iso(p.x+a,p.y+b)),up=(q,h)=>q.map(([x,y])=>[x,y-h]),poly=(q,c)=>{ctx.fillStyle=c;ctx.beginPath();q.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill()};
    shadow(sx,sy,.6);const S=up(C,9);poly([C[3],C[2],S[2],S[3]],'#2a1a0e');poly([C[1],C[2],S[2],S[1]],'#1e1208');poly(S,'#5a3a1c');const B=up([C[0],C[1]],9),Bt=up([C[0],C[1]],22);poly([B[0],B[1],Bt[1],Bt[0]],'#4a2e16');ctx.fillStyle='#7a5228';ctx.fillRect(Math.min(Bt[0][0],Bt[1][0]),Math.min(Bt[0][1],Bt[1][1])-1,Math.abs(Bt[1][0]-Bt[0][0]),2);return}
  if(p.k==='ftcandle'){for(let k=0;k<3;k++){const ox=[-9,3,10][k],oy=[-2,4,-5][k],z=38+Math.sin(t*1.3+p.ph+k*2)*4+k*5,x=sx+ox,y=sy+oy-z;ctx.fillStyle='#e8e0c8';ctx.fillRect(x-1.5,y,3,7);ctx.fillStyle='#c8b898';ctx.fillRect(x+.5,y,1,7);flame(x,y,2.2,p.ph+k);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(sx+ox,sy+oy,3,1.5,0,0,7);ctx.fill()}return}
  if(p.k==='ftcruc'){shadow(sx,sy,.4);ctx.fillStyle='#14110c';for(const x of[-9,7])ctx.fillRect(sx+x,sy-10,2,10);ctx.fillStyle='#2a2620';ctx.beginPath();ctx.moveTo(sx-12,sy-22);ctx.lineTo(sx+12,sy-22);ctx.lineTo(sx+9,sy-8);ctx.lineTo(sx-9,sy-8);ctx.closePath();ctx.fill();
    ctx.fillStyle='#4a4236';ctx.fillRect(sx-12,sy-23,24,2);const g=ctx.createRadialGradient(sx,sy-23,0,sx,sy-23,11);g.addColorStop(0,'#fff0a0');g.addColorStop(1,'#ff6a10');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(sx,sy-23,10,3.2,0,0,7);ctx.fill();
    if(Math.random()<.12)fxp({k:'ember',x:p.x+rnd(-.15,.15),y:p.y+rnd(-.15,.15),z:.75,vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:rnd(1,2),life:rnd(.5,1),col:pick(['#ffc070','#ff7a1a']),s:1.6,g:-.5});return}
  if(p.k==='ftcold'){shadow(sx,sy,.32);ctx.fillStyle='#0d0d10';ctx.beginPath();ctx.moveTo(sx-9,sy);ctx.lineTo(sx-4,sy-16);ctx.lineTo(sx+4,sy-16);ctx.lineTo(sx+9,sy);ctx.closePath();ctx.fill();
    ctx.fillStyle='#2a2a30';ctx.beginPath();ctx.ellipse(sx,sy-18,12,5,0,0,7);ctx.fill();ctx.fillStyle='#4a4644';ctx.beginPath();ctx.ellipse(sx,sy-19,9,3.4,0,0,7);ctx.fill();
    for(let k=0;k<3;k++){ctx.fillStyle=`rgba(255,${80+k*30},30,${.3+Math.sin(t*3+k+p.ph)*.2})`;ctx.fillRect(sx-4+k*3,sy-20+(k%2),1.5,1)}
    if(hyp(p.x-P.x,p.y-P.y)<4)label(sx,sy-34,'Kaltes Feuerbecken · geh heran','#c8b898');return}}

// ticking: lava burns, water slows, steam vents hiss, the air of the theme moves, braziers catch fire, a draft betrays the hidden wall
const _updTrapsF=updTraps;updTraps=function(dt){_updTrapsF(dt);const m=G.map;if(!m||m.kind!=='dungeon'||G.state!=='play'||!P)return;ftTick(m,dt)};
function ftTick(m,dt){m.burnT=(m.burnT||0)-dt;const tick=m.burnT<=0;if(tick)m.burnT=.5;
  for(const L of m.lava||[]){if(Math.abs(L.x-P.x)>18||Math.abs(L.y-P.y)>18)continue;if(!P.dead&&hyp(L.x-P.x,L.y-P.y)<L.r-.1){if(tick&&!(P.iframe>0))hurtPlayer(trapDmg()*.5,'fire',null);if(Math.random()<.4)fxp({k:'ember',x:P.x+rnd(-.2,.2),y:P.y+rnd(-.2,.2),z:.2,vx:0,vy:0,vz:rnd(1,2.5),life:.6,col:pick(['#ffc070','#ff7a1a']),s:2,g:-.5})}
    if(tick)for(const e of m.enemies)if(!e.dead&&!e.wall&&!e.boss&&hyp(e.x-L.x,e.y-L.y)<L.r)hitEnemy(e,trapDmg()*.9,{ally:true,col:'#ff9a3a',dot:true});
    if(Math.random()<dt*L.r*1.2){const a=rnd(0,6.28),q=rnd(0,L.r*.8);fxp({k:'ember',x:L.x+Math.cos(a)*q,y:L.y+Math.sin(a)*q,z:.05,vx:0,vy:0,vz:rnd(.8,1.8),life:rnd(.6,1.2),col:pick(['#ffe080','#ff9a30']),s:rnd(1.2,2.2),g:-.3})}}
  m.inWater=false;for(const L of m.water||[]){if(Math.abs(L.x-P.x)>18||Math.abs(L.y-P.y)>18)continue;if(hyp(L.x-P.x,L.y-P.y)<L.r-.05){m.inWater=true;if(P.path&&P.path.length&&Math.random()<dt*8)fxp({k:'dot',x:P.x+rnd(-.2,.2),y:P.y+rnd(-.2,.2),z:.1,vx:rnd(-1,1),vy:rnd(-1,1),vz:rnd(1.5,2.5),life:.4,col:'#9ac8f0',s:1.4,g:9})}
    for(const e of m.enemies)if(!e.dead&&!e.wall&&hyp(e.x-L.x,e.y-L.y)<L.r)e.slow=Math.max(e.slow||0,.12)}
  for(const v of m.vents||[]){if(Math.abs(v.x-P.x)>16||Math.abs(v.y-P.y)>16)continue;v.t+=dt;if(v.t>v.per-.7&&Math.random()<dt*14)smoke(v.x,v.y,1,'rgba(220,220,230,',3,.4);
    if(v.t>=v.per){v.t=0;const tl={shape:'circle',x:v.x,y:v.y,r:1,t:0,dur:.05,dmg:trapDmg()*.8,owner:null};G.tele.push(tl);trapHitFoes(tl);smoke(v.x,v.y,14,'rgba(230,232,240,',9,1.4);sample('portal',.15,{rate:2.2})}}
  // the air of the theme, around the hero
  const amb=m.fth&&m.fth.amb;if(amb&&Math.random()<dt*(amb==='drip'?3:6)){const x=P.x+rnd(-9,9),y=P.y+rnd(-9,9);if(walkable(x,y)){
    if(amb==='dust')fxp({k:'mote',x,y,z:rnd(.4,2.4),vx:rnd(-.08,.08),vy:rnd(-.08,.08),vz:rnd(-.04,.04),life:rnd(2.5,4),col:pick(['#e8d0a0','#c8b088']),s:1,g:0});
    else if(amb==='ember')fxp({k:'ember',x,y,z:rnd(0,.5),vx:rnd(-.2,.2),vy:rnd(-.2,.2),vz:rnd(.5,1.1),life:rnd(1.5,3),col:pick(['#ffb050','#ff7a1a']),s:1.4,g:-.1});
    else if(amb==='mote')fxp({k:'mote',x,y,z:rnd(.6,2.6),vx:0,vy:0,vz:rnd(-.05,.05),life:rnd(2,3.5),col:pick(['#ff8a8a','#8ab0ff','#ffe08a','#d0a0ff']),s:1.1,g:0});
    else fxp({k:'dot',x,y,z:3.2,vx:0,vy:0,vz:-.5,life:.7,col:'#8ab8e0',s:1.3,g:9})}}
  if(m.curse==='finster'){const F=m.fires||(m.fires={n:m.props.filter(p=>p.k==='ftcold').length,lit:0});for(const p of m.props)if(p.k==='ftcold'&&hyp(p.x-P.x,p.y-P.y)<1.8){p.k='brazier';p.lit=1;F.lit++;burst(p.x,p.y,'#ffb060',14,2,.7);addLight(p.x,p.y,260,1,.8);sfx('cast');
      if(F.lit>=F.n){banner('DIE FINSTERNIS WEICHT','Alle Feuerbecken brennen','',2600);for(let k=0;k<m.t.length;k++)if(m.t[k])m.explored[k]=1;const gl=Math.round(12*G.mlvl);P.glut+=gl;ftext(P.x,P.y,'+'+gl+' Glut','#ff9a3a')}else log(`Feuerbecken entzündet: ${F.lit} von ${F.n}.`,'#ffd88a')}}
  const S=m.secret;if(S&&!S.open&&Math.random()<dt*3){const e=m.enemies.find(e=>e.wall&&!e.obj&&!e.dead);if(e&&hyp(e.x-P.x,e.y-P.y)<10)fxp({k:'mote',x:e.x+rnd(-.5,.5),y:e.y+rnd(-.5,.5),z:rnd(.2,1.6),vx:-S.dir[0]*rnd(.3,.8)+rnd(-.1,.1),vy:-S.dir[1]*rnd(.3,.8)+rnd(-.1,.1),vz:rnd(-.05,.08),life:rnd(1.6,2.6),col:pick(['#d8c8a8','#b8a888','#e8dcc0']),s:1.3,g:0})}}
