/* ---------- chests: barrels and crates for the small stuff, and real chests that grow rarer, finer and richer ---------- */
const CHT={
  barrel:{n:'Fass',junk:1},crate:{n:'Holzkiste',junk:1},
  wood:{n:'Truhe',b:['#4a2c14','#7a4a24','#a06a38'],t:['#5a4020','#8a6a3a','#b89058'],k:['#5a4020','#a88048','#d8b878']},
  iron:{n:'Eisenbeschlagene Truhe',col:'#c8ccd4',b:['#5a1410','#8a2418','#b83a28'],t:['#34343a','#64646c','#a0a0aa'],k:['#34343a','#8a8a94','#c8c8d0'],studs:1},
  royal:{n:'Königsblaue Truhe',col:'#8ab0ff',b:['#121a36','#22305a','#3a4a80'],t:['#8a5a08','#d8a020','#ffe080'],k:['#8a5a08','#e0b030','#fff0a0']},
  moss:{n:'Überwucherte Truhe',col:'#8ad06a',b:['#3a2410','#5a3a1a','#7a5228'],t:['#2a4a1a','#3a6a24','#5a8a34'],k:['#4a3a1a','#8a7a3a','#b8a858'],vines:1},
  crystal:{n:'Kristalltruhe',col:'#d8c8ff',b:['#2a1838','#4a2a5a','#6a4280'],t:['#7a5a30','#b08850','#e0c088'],k:['#7a5a30','#c8a060','#f0d8a0'],glass:1,glow:'200,180,255'},
  gold:{n:'Goldene Truhe',col:'#ffd040',b:['#8a5a08','#d8a020','#ffe070'],t:['#6a4006','#b07818','#fff0a0'],k:['#6a4006','#e8c040','#fff8c0'],gem:'#e02840',glow:'255,200,80',shine:1},
  emerald:{n:'Smaragdtruhe',col:'#50f0a0',b:['#063a24','#0e7a48','#30c880'],t:['#8a5a08','#d8a020','#ffe080'],k:['#8a5a08','#e0b030','#fff0a0'],gem:'#70ffc0',glow:'80,255,170',shine:1},
  vault:{n:'Verschlossene Truhe',col:'#e8b060',b:['#160808','#341212','#561c1c'],t:['#7a5008','#c89020','#ffe080'],k:['#7a5008','#d8a830','#fff0a0'],studs:1,lock:1},
  trial:{n:'Prüfungstruhe',col:'#f0e0b0',b:['#a89878','#e0d4b8','#fff8e8'],t:['#8a5a08','#d8a020','#ffe080'],k:['#8a5a08','#e0b030','#fff0a0'],crown:1,glow:'255,230,160'}};
const CHS={};
// one painter for every chest: lid, bands, plate and lock, closed or thrown open
function chestPaint(r,s,open){const B=s.b,T=s.t,K=s.k,IN='#140a04',row=(y,x0,x1,c)=>r(c,x0,y,x1-x0+1,1);
  for(let y=15;y<=26;y++)row(y,2,27,B[1]);row(19,2,27,B[0]);row(23,2,27,B[0]);row(26,2,27,B[0]);row(16,2,27,B[2]);
  if(!open){for(let y=6;y<=14;y++)row(y,y===6?4:y===7?3:2,y===6?25:y===7?26:27,B[1]);row(7,3,26,B[2]);row(10,2,27,B[0]);row(14,2,27,T[1]);row(13,2,27,T[0]);
    if(s.glass){const G=['#e8f8ff','#c8e8ff','#ffd8f0','#f0e8ff','#d8fff0'];for(let y=6;y<=12;y++)for(let x=(y===6?4:y===7?3:2);x<=(y===6?25:y===7?26:27);x++)r(G[Math.floor((x+y)/4)%5],x,y);for(let k=0;k<2;k++)for(let d=0;d<4;d++)r('#ffffff',9+k*9+d,11-d)}}
  else{for(let y=1;y<=11;y++)row(y,3,26,B[0]);row(1,4,25,T[1]);row(2,3,26,T[0]);for(let y=3;y<=11;y++){r(B[1],3,y);r(B[1],26,y)}row(6,4,25,'#2a1a0c');row(12,2,27,T[1]);row(13,3,26,IN);row(14,3,26,IN);
    if(s.glass){const G=['#9ab8d8','#b8a0d0','#a0c8c8'];for(let y=3;y<=10;y++)for(let x=5;x<=24;x++)r(G[Math.floor((x+y)/4)%3],x,y);for(let d=0;d<4;d++)r('#e8f8ff',10+d,9-d)}}
  for(const x of[4,24]){for(let y=open?1:7;y<=26;y++){if(open&&y>=12&&y<=14)continue;r(T[1],x,y);r(T[2],x,y);r(T[1],x+1,y)}r(T[0],x+1,26)}
  row(15,2,27,T[0]);if(s.studs)for(const x of[8,12,17,21])for(const y of[17,21,25])r(T[2],x,y);
  if(!open&&s.lock){r(K[1],12,10,6,1);r(K[1],12,10,1,4);r(K[1],17,10,1,4);r(K[1],11,13,8,7);r(K[2],11,13,8,1);r(K[0],11,19,8,1);r(IN,14,15,2,3)}
  else{const y0=open?15:12;r(K[1],13,y0,4,open?3:6);r(K[2],13,y0,4,1);r(K[0],13,y0+(open?2:5),4,1);if(!open)r(IN,14,y0+2,2,2)}
  if(s.gem&&!open){r(s.gem,14,8,2,2);r('#ffffff',14,8,1,1);r(s.gem,7,21,1,1);r(s.gem,22,21,1,1)}
  if(s.crown&&!open){r(T[1],11,8,8,2);r(T[1],11,6,1,2);r(T[1],14,5,2,3);r(T[1],18,6,1,2);r(T[2],12,8,6,1);r('#e02840',14,7,2,1)}
  if(s.vines){const V=['#2a5a1a','#3a7a2a','#5aa83a','#7ac84a'];const pts=open?[[3,12],[6,14],[9,13],[20,14],[25,12],[3,20],[26,18],[7,25],[18,24],[24,25],[12,1],[16,3]]:[[3,8],[6,7],[9,9],[13,11],[18,8],[22,7],[25,10],[3,18],[26,17],[6,24],[11,22],[20,25],[24,21],[16,13]];
    for(const[x,y]of pts){r(V[1],x,y,2,2);r(V[2],x+1,y-1);r(V[3],x,y-1);r(V[0],x+1,y+1)}for(let y=open?3:8;y<=25;y+=3)r(V[1],3,y,1,2)}
  if(open&&(s.shine||s.crown)){for(const[x,c]of[[6,'#ffd040'],[9,'#fff0a0'],[12,'#ffd040'],[17,'#ffe070'],[21,'#ffd040'],[24,'#fff0a0']])r(c,x,13);if(s.gem)r(s.gem,15,13,2,1)}}
function chestSprites(){const S=(w,h,ax,ay,f)=>{const c=ydSprite(w,h,g=>{const r=(col,x,y,ww=1,hh=1)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};f(r,g)});c.ax=ax;c.ay=ay;return c};
  for(const[k,s]of Object.entries(CHT))if(s.b)CHS[k]={c:S(30,28,15,26,r=>chestPaint(r,s,false)),o:S(30,28,15,26,r=>chestPaint(r,s,true))};
  const W=['#4a2c14','#7a4a24','#a06a38','#c08850'],H=['#34343a','#64646c','#9a9aa4'];
  CHS.barrel={c:S(22,26,11,24,r=>{for(let y=3;y<=23;y++){const n=y<5||y>21?6:y<7||y>19?7:8;r(W[1],11-n,y,n*2,1)}for(let y=3;y<=23;y++){r(W[2],8,y);r(W[0],14,y);r(W[3],6,y)}
      for(const y of[6,7,18,19]){const n=y<7||y>19?7:8;r(H[1],11-n,y,n*2,1);r(H[2],11-n+1,y,3,1)}for(let x=5;x<=16;x++)r(W[2],x,3);r(W[3],6,3,8,1);r(W[0],5,23,12,1)}),
    o:S(26,22,13,20,r=>{for(let y=13;y<=19;y++)r(W[1],6,y,14,1);r(W[0],6,19,14,1);for(let x=6;x<=19;x++)r(W[2],x,13);r('#140a04',7,14,12,2);r(H[1],6,16,14,1);
      for(const[x,y,d]of[[1,18,1],[21,17,-1],[3,12,1],[20,11,-1]])for(let k=0;k<6;k++)r(k%2?W[2]:W[1],x+k*d*.6|0,y+(k>>1),2,1);r(H[1],2,20,7,1);r(H[2],17,20,6,1)})};
  CHS.crate={c:S(22,20,11,18,r=>{r(W[1],2,3,18,15);r(W[0],2,3,18,2);r(W[0],2,16,18,2);r(W[0],2,3,2,15);r(W[0],18,3,2,15);r(W[3],2,3,18,1);for(let k=0;k<12;k++){r(W[2],4+k*1.15|0,5+k*.95|0,2,1);r(W[2],16-k*1.15|0,5+k*.95|0,2,1)}for(const y of[8,12])r(W[0],4,y,14,1)}),
    o:S(24,20,12,18,r=>{r(W[1],2,6,16,12);r(W[0],2,16,16,2);r(W[0],2,6,2,12);r(W[0],16,6,2,12);r('#140a04',4,6,12,3);r(W[3],2,6,16,1);for(const y of[11,14])r(W[0],4,y,12,1);for(let k=0;k<10;k++)r(k%3?W[2]:W[1],18+(k>>2),1+k*1.6|0,2,2)})}}
const chestLook=o=>o.ct||(o.star||o.secret?'royal':'wood');
// the trial chest: sealed while a guard still lives in its room
function trialLeft(o){const m=G.map;let n=0;for(const e of m.enemies)if(!e.dead&&!e.wall&&!e.dummy&&e.x>=o.rx-.5&&e.x<=o.rx+o.rw+.5&&e.y>=o.ry-.5&&e.y<=o.ry+o.rh+.5)n++;return n}
function drawChest(o,hov){const[sx,sy]=iso(o.x,o.y);if(sx<-60||sx>W+60||sy<-80||sy>H+40)return;if(!CHS.wood)chestSprites();const lk=chestLook(o),S=CHS[lk]||CHS.wood,s=CHT[lk]||CHT.wood,c=o.open?S.o:S.c,t=G.t;
  shadow(sx,sy,s.junk?.3:.42);
  if(s.glow&&!o.open){ctx.save();ctx.globalCompositeOperation='lighter';const p=.22+Math.sin(t*2.4+o.x)*.08+(s.shine?.12:0),g=ctx.createRadialGradient(sx,sy-12,0,sx,sy-12,s.shine?44:30);g.addColorStop(0,`rgba(${s.glow},${p})`);g.addColorStop(1,`rgba(${s.glow},0)`);ctx.fillStyle=g;ctx.fillRect(sx-46,sy-58,92,92);ctx.restore();
    if(s.shine&&Math.random()<.18)fxp({k:'mote',x:o.x+rnd(-.5,.5),y:o.y+rnd(-.5,.5),z:rnd(.2,.8),vz:rnd(.3,.8),life:rnd(.8,1.6),col:pick(lk==='gold'?['#ffd040','#fff0a0','#ffffff']:['#50f0a0','#c0ffe0','#ffffff']),s:rnd(.7,1.3),g:0})}
  if(lk==='trial'&&!o.open){const sealed=o.sealed!==false,pu=.5+Math.sin(t*3)*.5;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=sealed?`rgba(190,120,255,${.35+pu*.3})`:`rgba(255,220,140,${.4+pu*.3})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(sx,sy-2,24,12,0,0,7);ctx.stroke();
    for(let k=0;k<8;k++){const a=k/8*6.283+t*.4;ctx.fillStyle=ctx.strokeStyle;ctx.fillRect(sx+Math.cos(a)*24-1,sy-2+Math.sin(a)*12-1,2,2)}ctx.restore()}
  ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));
  // a shine runs across the finest chests now and then
  if(s.shine&&!o.open){const ph=(t*.55+o.x*.13)%1;if(ph<.35){const x0=sx-c.ax-8+ph/.35*(c.width+16);ctx.save();ctx.beginPath();ctx.rect(sx-c.ax+2,sy-c.ay+5,c.width-4,c.height-6);ctx.clip();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(x0,sy-c.ay+5);ctx.lineTo(x0+4,sy-c.ay+5);ctx.lineTo(x0-6,sy);ctx.lineTo(x0-10,sy);ctx.closePath();ctx.fill();ctx.restore()}}
  if(lk==='trial'&&!o.open&&o.sealed!==false){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(200,140,255,${.55+Math.sin(t*5)*.2})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx-14,sy-20);ctx.lineTo(sx+14,sy-3);ctx.moveTo(sx+14,sy-20);ctx.lineTo(sx-14,sy-3);ctx.stroke();ctx.restore()}
  if(hov&&!o.open){let tx=s.n,col=s.col||'#ece4cf';if(lk==='vault')tx+=' · Schlüssel nötig (du hast '+(P.keys||0)+')';if(lk==='trial')tx+=o.sealed!==false?' · versiegelt, besiege die Wächter des Raums':' · bereit';label(sx,sy-c.ay-8,tx,col)}}
const _drawObjCh=drawObj;drawObj=function(o){if(o.type!=='chest')return _drawObjCh(o);drawChest(o,G.state==='play'&&hoverObj()===o)};

// what each chest holds
function chestLoot(o){const lk=chestLook(o),cl=mlNow(),mf=(P.d.mf||0),out=[],it=(opt)=>out.push(makeItem(cl+(opt.up||0),opt));let gl=0,rn=0,pot=0;
  switch(lk){
    case'barrel':case'crate':for(let k=rint(1,lk==='crate'?3:2);k--;)out.push(junkFor(null,cl));if(Math.random()<.18)it({mf});pot=Math.random()<.25?1:0;rn=.03;gl=rint(3,8)*cl;break;
    case'wood':for(let k=rint(1,2);k--;)out.push(junkFor(null,cl));it({mf:mf+40});if(Math.random()<.3)it({mf});pot=Math.random()<.4?1:0;rn=.05;gl=rint(6,12)*cl;break;
    case'iron':it({mf:mf+100});it({mf:mf+100});if(Math.random()<.25)it({rarity:'rare'});pot=1;rn=.08;gl=rint(10,18)*cl;break;
    case'moss':it({mf:mf+150});it({mf:mf+150});if(Math.random()<.45)it({rarity:'rare'});pot=2;rn=.1;gl=rint(10,18)*cl;break;
    case'royal':it({rarity:'rare',up:1});it({rarity:Math.random()<.5?'rare':'magic'});pot=1;rn=.12;gl=rint(15,25)*cl;break;
    case'crystal':it({rarity:'rare',up:1});it({mf:mf+150});rn=1;pot=1;gl=rint(15,25)*cl;break;
    case'gold':it({rarity:'unique',up:2});it({rarity:'rare',up:2});it({rarity:'rare',boost:.3});rn=.4;pot=2;gl=60*cl;break;
    case'emerald':it({rarity:'unique',up:2});it({rarity:'rare',up:2});rn=1;pot=2;gl=45*cl;break;
    case'vault':it({rarity:'unique',up:2});it({rarity:'rare',up:2});it({rarity:'rare',boost:.4});rn=.6;pot=1;gl=40*cl;break;
    case'trial':it({rarity:'rare',up:2,boost:.3});for(let k=rint(2,3);k--;)it({rarity:Math.random()<.4?'rare':'magic',up:1});if(Math.random()<.2)it({rarity:'unique',up:2});rn=.35;pot=2;gl=30*cl;break}
  if(runeOK()&&Math.random()<rn)out.push(makeRune(pickRune(cl,lk==='emerald'||lk==='vault')));for(let k=0;k<pot;k++)out.push(makePotion(Math.random()<.65?'life':'mana',G.floor));return{out,gl}}
const LOOTQ=[];
function openChest(o){const lk=chestLook(o),s=CHT[lk]||CHT.wood;
  if(lk==='vault'){if(!(P.keys>0)){log('Verschlossen. Ein Truhenschlüssel öffnet sie – Odalinde und die fahrenden Händler verkaufen welche.','#e8b060');sample('chest',.3,{rate:1.8});return}
    P.keys--;log('Der Schlüssel dreht sich. Noch '+P.keys+' Schlüssel übrig.','#e8b060');sample('chest',.5,{rate:.7})}
  if(lk==='trial'&&o.sealed!==false){const n=trialLeft(o);log('Die Truhe ist versiegelt. Besiege die Wächter dieses Raums'+(n?' ('+n+' übrig)':'')+'.','#c8a0ff');return}
  o.open=true;if(!s.junk)qInc('chest');
  if(s.junk){sample('chest',.45,{rate:1.5})||sfx('pick');smoke(o.x,o.y,5,'rgba(120,96,64,',5,.4);for(let k=0;k<10;k++)fxp({k:'bone',x:o.x,y:o.y,z:.4,vx:rnd(-2,2),vy:rnd(-2,2),vz:rnd(1,3),life:rnd(.6,1.1),col:pick(['#7a4a24','#a06a38','#5a3418']),s:rnd(1.5,2.5),g:7,rot:0,vr:rnd(-8,8)})}
  else{sample('chest',lk==='wood'?.75:.9,{rate:s.shine?.85:1})||sfx('boom');sparks(o.x,o.y,.5,-1.57,s.shine?24:10,s.shine?['#ffffff','#fff0a0',s.col]:['#ffe0a0','#c8a050'],5,1.2);if(s.glow)addLight(o.x,o.y,220,.9,.8)}
  if(s.shine){banner((lk==='gold'?'EINE GOLDENE TRUHE':'EINE SMARAGDTRUHE'),'Ein seltener Fund','boss',2400);G.shake=Math.max(G.shake||0,4)}
  if(lk==='trial')banner('DIE PRÜFUNGSTRUHE','Deine Belohnung','',2000);
  const{out,gl}=chestLoot(o);
  // the finer the chest, the slower and grander it gives up its treasure
  const step=lk==='trial'||s.shine||lk==='vault'?.32:0;out.forEach((it,i)=>{if(!step)dropItem(it,o.x,o.y);else LOOTQ.push({t:.25+i*step,it,x:o.x,y:o.y,m:G.map})});
  P.glut+=gl;ftext(o.x,o.y-.3,'+'+gl+' Glut','#ff9a3a',!!step)}
function lootQTick(dt){for(let i=LOOTQ.length-1;i>=0;i--){const q=LOOTQ[i];if(q.m!==G.map){LOOTQ.splice(i,1);continue}if((q.t-=dt)>0)continue;LOOTQ.splice(i,1);dropItem(q.it,q.x,q.y);
  const col=q.it.rar==='unique'?['#ffd040','#fff0a0']:q.it.rar==='rare'?['#ffff60','#ffffc0']:q.it.rar==='magic'?['#6a8aff','#c0d0ff']:['#e8e0d0','#ffffff'];sparks(q.x,q.y,.6,-1.57,14,col,7,.5);flash(q.x,q.y,.6,26,q.it.rar==='unique'?'255,200,80':'220,220,255',.2);sample('picku',.35,{rate:1+Math.random()*.2})}}
const _interactCh=interact;interact=function(o){if(o&&o.type==='chest'&&o.ct&&!o.open){G.openAt={x:P.x,y:P.y};return openChest(o)}return _interactCh(o)};

// trial rooms: sealed until their guards fall
function trialTick(){const m=G.map;if(!m||m.kind!=='dungeon'||!P)return;for(const o of m.objs){if(o.ct!=='trial'||o.open||o.sealed===false)continue;
  if(P.x<o.rx-3||P.x>o.rx+o.rw+3||P.y<o.ry-3||P.y>o.ry+o.rh+3)continue;if(trialLeft(o))continue;
  o.sealed=false;banner('PRÜFUNG BESTANDEN','Die Prüfungstruhe öffnet ihr Siegel','',2600);sample('lvl',.5)||sfx('lvl');shock(o.x,o.y,3,'255,220,140',.7,3);addLight(o.x,o.y,260,1,1)}}

// where they stand: many barrels and crates, now and then something finer
function chestTier(r,deep){const x=r();return x<.005?'gold':x<.01?'emerald':x<.035?'crystal':x<.09?'royal':x<(deep?.27:.24)?'iron':'wood'}
function dungeonChests(m){const{w,t}=m,T=(i,j)=>t[j*w+i],f=m.floor||1,n8=(i,j)=>{let n=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if((a||b)&&T(i+a,j+b)===1)n++;return n};
  for(const o of m.objs)if(o.type==='chest'&&!o.ct&&!o.secret&&!o.star)o.ct=chestTier(R,f>=6);
  const busy=[...m.objs],ok=(x,y,d=1.4)=>!busy.some(o=>hyp(o.x-x,o.y-y)<d)&&hyp(x-m.start.x,y-m.start.y)>3;
  // barrels and crates along the walls, often two or three together
  for(let q=0,g=0,n=rint(12,18);q<n&&g<800;g++){const i=rint(4,w-5),j=rint(4,m.h-5);if(T(i,j)!==1){continue}const k=n8(i,j);if(k<4||k>6)continue;const x=i+.5,y=j+.5;if(!ok(x,y))continue;
    const ct=R()<.55?'barrel':'crate';m.objs.push({type:'chest',ct,x,y,open:false});busy.push({x,y});q++;
    for(let c=rint(0,2);c--;){const x2=x+rnd(-1,1),y2=y+rnd(-1,1),i2=Math.floor(x2),j2=Math.floor(y2);if(T(i2,j2)===1&&ok(x2,y2,.8)){m.objs.push({type:'chest',ct:R()<.5?'barrel':'crate',x:x2,y:y2,open:false});busy.push({x:x2,y:y2});q++}}}
  const rooms=m.rooms.filter(r=>r!==m.startRoom&&!(m.boss&&r===m.endRoom)),spot=r=>{for(let k=0;k<40;k++){const i=rint(r.x+2,r.x+r.w-3),j=rint(r.y+2,r.y+r.h-3);if(T(i,j)===1&&n8(i,j)===8&&ok(i+.5,j+.5,2))return[i+.5,j+.5]}return null};
  if(f>=2&&R()<.35&&rooms.length){const s=spot(pick(rooms));if(s){m.objs.push({type:'chest',ct:'vault',x:s[0],y:s[1],open:false});busy.push({x:s[0],y:s[1]})}}
  if(f>=2&&R()<.5&&rooms.length>1){const r=pick(rooms.filter(r=>r!==m.endRoom)),cx=r.cx+.5,cy=r.cy+.5;let s=T(r.cx,r.cy)===1&&ok(cx,cy,2)?[cx,cy]:spot(r);
    if(s){r.trial=1;m.objs.push({type:'chest',ct:'trial',x:s[0],y:s[1],open:false,rx:r.x,ry:r.y,rw:r.w,rh:r.h});busy.push({x:s[0],y:s[1]})}}}
const _populateCh=populate;populate=function(m){_populateCh(m);if(m.kind!=='dungeon'||G.floor==='rift')return;const f=m.floor||1;
  if(!m.chx){m.chx=1;const R0=R;R=mulberry(G.seed*4409+f*55331);try{dungeonChests(m)}finally{R=R0}}
  // every visit the guards of an unfinished trial stand ready again
  for(const o of m.objs)if(o.ct==='trial'&&!o.open){const pool=m.enemies.filter(e=>!e.dead&&!e.boss&&!e.wall&&!e.dummy&&!e.mir);if(!pool.length)continue;const kind=pool[Math.floor(Math.random()*pool.length)];
    for(let k=rint(3,4);k--;){const x=o.rx+rnd(2,o.rw-2),y=o.ry+rnd(2,o.rh-2);if(!walkable(x,y))continue;const e=makeEnemy(kind.vid||kind.type,x,y,k===0?'champ':Math.random()<.4?'champ':'normal');e.trialG=1;m.enemies.push(e)}o.sealed=undefined}};
const CHOW={village:[4,8],camp:[3,6],ruins:[2,4],wild:[1,3],forest:[1,3],grave:[1,2],rock:[0,2],boss:[1,3]};
const _owContentCh=owContent;owContent=function(m,cx,cy){const c=_owContentCh(m,cx,cy),I=islandOf(cx,cy);if(!I||I.kind==='home')return c;
  const Rg=mulberry(Math.floor(hsh(cx,cy,131)*1e9)),W0=m.w,t=m.t,taken=[...c.objs,...c.props,...c.blocks.map(b=>({x:b.i+.5,y:b.j+.5}))];
  for(const o of c.objs)if(o.type==='chest'&&!o.ct){const x=Rg();o.ct=x<.006?'gold':x<.012?'emerald':x<.04?'crystal':x<.1?'royal':x<.27?'iron':'wood'}
  const place=(ct)=>{for(let g=0;g<30;g++){const a=Rg()*6.283,r=2.5+Rg()*(I.r-3.5),x=I.x+Math.cos(a)*r,y=I.y+Math.sin(a)*r,v=t[Math.floor(y)*W0+Math.floor(x)];
    if(!(v===4||v===7)||taken.some(o=>hyp(o.x-x,o.y-y)<1.6))continue;c.objs.push({type:'chest',ct,x,y,open:false});taken.push({x,y});return[x,y]}return null};
  const[n0,n1]=CHOW[I.kind]||[0,1];for(let k=n0+Math.floor(Rg()*(n1-n0+1));k--;){const p=place(Rg()<.5?'barrel':'crate');if(p&&Rg()<.4){const q=place(Rg()<.5?'barrel':'crate')}}
  if((I.kind==='wild'||I.kind==='forest')&&Rg()<.12)place('moss');
  if((I.kind==='ruins'||I.kind==='grave')&&Rg()<.25)place('vault');
  if(I.kind!=='boss'&&Rg()<.025)place(Rg()<.5?'gold':'emerald');
  return c};

// keys: every trader keeps a few for the locked chests
const keyCost=()=>Math.round((200+P.lvl*80)*(1-((P.d&&P.d.shopDisc)||0)/100));
const _buildShopCh=buildShop;buildShop=function(){_buildShopCh();const el=$('pShop'),h=[...el.querySelectorAll('h3')].find(x=>x.textContent.startsWith('Glücksspiel'));if(!h)return;
  h.insertAdjacentHTML('beforebegin',`<div class="shoprow"><span>Truhenschlüssel · du hast ${P.keys||0}</span><span class="c">${keyCost()}</span><button data-buykey data-cost="${keyCost()}">Kaufen</button></div><p class="hint">Öffnet eine verschlossene Truhe. Darin liegt immer etwas Einzigartiges.</p>`)};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-buykey]');if(!b||!P)return;const c=keyCost();if(P.glut<c){log('Nicht genug Glut.','#ff5a4a');return}P.glut-=c;P.keys=(P.keys||0)+1;qInc('buy');sfx('gold');log('Gekauft: Truhenschlüssel ('+P.keys+')','#e8b060');updatePanels()});
const _saveDataCh=saveData;saveData=function(){const d=_saveDataCh();if(d&&P)d.p.keys=P.keys||0;return d};
const _updForgeCh=updForge;updForge=function(dt){_updForgeCh(dt);if(P&&G.state==='play'){lootQTick(dt);trialTick()}};

