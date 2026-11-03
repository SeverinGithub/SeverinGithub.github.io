/* ---------- the tower, second pass: cracked walls with a hidden room behind · rolling boulders · more lying about in tower and on the islands ---------- */
// a cracked wall takes blows like a foe; when it gives way, a small vault with a chest lies open behind it
function secretSpot(m){const{w,t}=m,T=(i,j)=>i<3||j<3||i>=w-3||j>=m.h-3?-1:t[j*w+i];
  const rooms=m.rooms.filter(r=>r!==m.startRoom&&!(m.boss&&r===m.endRoom)).sort(()=>R()-.5);
  for(const r of rooms)for(const dir of[[-1,0],[0,-1]]){const pr=dir[0]?[0,1]:[1,0];
    for(let off=-3;off<=3;off++){let fi=r.cx+pr[0]*off,fj=r.cy+pr[1]*off;if(T(fi,fj)!==1)continue;
      for(let k=0;k<20&&T(fi+dir[0],fj+dir[1])===1;k++){fi+=dir[0];fj+=dir[1]}
      if(T(fi+pr[0],fj+pr[1])!==1)continue;const A=(d,q)=>T(fi+dir[0]*d+pr[0]*q,fj+dir[1]*d+pr[1]*q);
      // the wall in front is one tile of masonry (2), behind it only the dark (0) – room for a chamber and its own walls
      let ok=true;for(let q=-1;q<=2&&ok;q++)if(A(1,q)!==2)ok=false;for(let d=2;d<=6&&ok;d++)for(let q=-2;q<=3;q++)if(A(d,q)!==0){ok=false;break}
      if(!ok)continue;const at=(d,q)=>[fi+dir[0]*d+pr[0]*q,fj+dir[1]*d+pr[1]*q],box=[],ring=[];for(let q=0;q<=1;q++)box.push(at(1,q));
      for(let d=2;d<=6;d++)for(let q=-2;q<=3;q++)(d<=5&&q>=-1&&q<=2?box:ring).push(at(d,q));for(const q of[-2,3])ring.push(at(1,q));
      return{fi,fj,dir,pr,box,ring}}}
  return null}
function secretWall(m,S){const f=m.floor||G.floor||1,x=S.fi+.5+S.dir[0]*.7+S.pr[0]*.5,y=S.fj+.5+S.dir[1]*.7+S.pr[1]*.5,e=makeEnemy('golem',x,y,'normal');
  Object.assign(e,{wall:true,name:'Rissige Wand',sub:'Schlag zu, um sie aufzubrechen',hp:(80+f*30)*DIFF[diff()].hp,dmg:[0,0],spd:0,xp:0,aff:[],r:.7,cd:1e9,scale:1,dmgTaken:1,role:null,elem:null,face:0,cracks:[]});e.max=e.hp;
  const R0=mulberry(f*977+S.fi*31+S.fj);for(let k=0;k<7;k++){const a=R0()*6.28,l=6+R0()*14;e.cracks.push([R0()*20-10,-10-R0()*44,a,l])}return e}
function secretOpen(m,e,quiet){const S=m.secret;if(!S||S.open)return;S.open=true;for(const[i,j]of S.box)m.t[j*m.w+i]=1;for(const[i,j]of S.ring||[])if(m.t[j*m.w+i]===0)m.t[j*m.w+i]=2;
  const cx=S.fi+.5+S.dir[0]*3.6+S.pr[0]*.5,cy=S.fj+.5+S.dir[1]*3.6+S.pr[1]*.5;m.objs.push({type:'chest',x:cx,y:cy,open:false,secret:true});
  for(const q of[-1.1,1.1])m.props.push({k:'dccand',x:cx+q*S.pr[0]+S.dir[0]*.9,y:cy+q*S.pr[1]+S.dir[1]*.9,v:0,ph:Math.random()*6});
  if(quiet||!e||m!==G.map){if(m===G.map){G.flowT=0;computeFlow()}return}
  for(let k=0;k<26;k++)fxp({k:'bone',x:e.x+rnd(-.6,.6),y:e.y+rnd(-.6,.6),z:rnd(.3,1.4),vx:rnd(-2,2)-S.dir[0],vy:rnd(-2,2)-S.dir[1],vz:rnd(1,4),life:rnd(.8,1.6),col:pick(['#6a6258','#8a8274','#4a443c','#a8a090']),s:rnd(1.5,3.5),g:7,rot:0,vr:rnd(-8,8)});
  smoke(e.x,e.y,14,'rgba(110,100,86,',7,.8);G.shake=Math.max(G.shake||0,7);syn('golem');sample('chest',.5,{rate:.6});G.flowT=0;computeFlow();
  banner('EIN GEHEIMER RAUM','Hinter der Wand liegt eine Kammer','',2400);log('Die Wand bricht. Dahinter liegt eine verborgene Kammer.','#ffd88a')}
const _populateS5=populate;populate=function(m){_populateS5(m);if(m.kind!=='dungeon'||G.floor==='rift')return;const f=m.floor||1,R0=R;R=mulberry(G.seed*6151+f*92821);try{
  if(m.secret===undefined){m.secret=null;if(f>=2&&R()<.5){const S=secretSpot(m);if(S)m.secret=Object.assign(S,{open:false})}}
  if(m.secret&&!m.secret.open&&!m.enemies.some(e=>e.wall&&!e.dead))m.enemies.push(secretWall(m,m.secret));
  if(!m.boulders){m.boulders=1;if(f>=3)for(const r of m.rooms){if(r===m.startRoom||(m.boss&&r===m.endRoom)||R()>.2)continue;const b=boulderSpot(m,r);if(b){m.traps=m.traps||[];m.traps.push(b);m.props.push({k:'dcboulder',x:b.x,y:b.y,v:0,ph:0,trap:b})}}}
  if(!m.dc){m.dc=1;dungeonDecor(m)}}finally{R=R0}
  if(m.secret&&!m.secret.open&&G.secOpen&&G.secOpen.has(f)){const e=m.enemies.find(e=>e.wall&&!e.dead);if(e){e.dead=true;e.dieT=99}secretOpen(m,e,true)}};
// the wall: no will of its own, only cracks that widen with every blow
const _updEnemyS5=updEnemy;updEnemy=function(e,dt){if(!e.wall)return _updEnemyS5(e,dt);e.flash=Math.max(0,e.flash-dt);e.hitT=Math.max(0,(e.hitT||0)-dt);e.aggro=false;e.slow=0;e.kvx=e.kvy=0;e.dotT=0};
const _hitEnemyS5=hitEnemy;hitEnemy=function(e,dmg,o={}){if(!e||!e.wall)return _hitEnemyS5(e,dmg,o);if(o.ally&&!o.col)return;const r=_hitEnemyS5(e,dmg,{...o,kb:0});e.aggro=false;
  for(let k=0;k<5;k++)fxp({k:'bone',x:e.x+rnd(-.3,.3),y:e.y+rnd(-.3,.3),z:rnd(.4,1.4),vx:rnd(-1.5,1.5),vy:rnd(-1.5,1.5),vz:rnd(1,3),life:rnd(.5,1),col:pick(['#6a6258','#8a8274','#a8a090']),s:rnd(1,2.5),g:7,rot:0,vr:rnd(-8,8)});
  if(Math.random()<.5)sample('hit',.25,{rate:.6});return r};
const _killEnemyS5=killEnemy;killEnemy=function(e,a){if(e&&e.wall){if(e.dead)return;e.dead=true;e.dieT=99;secretOpen(G.map,e);if(mpOn())mpSend({t:'so',fl:G.floor});return}return _killEnemyS5(e,a)};
function drawWall(e){const[sx,sy]=iso(e.x,e.y);if(sx<-80||sx>W+80||sy<-120||sy>H+40)return;const p=1-e.hp/e.max,t=G.t;ctx.save();ctx.translate(Math.round(sx),Math.round(sy));
  if(e.hitT>0)ctx.translate(rnd(-1,1),0);
  ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-26,0,0,-26,30);g.addColorStop(0,`rgba(255,190,110,${.15+p*.2+Math.sin(t*2)*.05})`);g.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=g;ctx.fillRect(-32,-60,64,64);ctx.globalCompositeOperation='source-over';
  ctx.lineCap='round';const n=Math.ceil(3+p*4);for(let k=0;k<Math.min(n,e.cracks.length);k++){const[x,y,a,l]=e.cracks[k];ctx.strokeStyle=e.flash>0?'#fff4d0':'#120d08';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);
    let cx=x,cy=y;for(let s=0;s<4;s++){cx+=Math.cos(a+(s%2?.6:-.5))*l/4;cy+=Math.sin(a+(s%2?.6:-.5))*l/4;ctx.lineTo(cx,cy)}ctx.stroke();ctx.strokeStyle=`rgba(255,200,120,${.25+p*.5})`;ctx.lineWidth=.7;ctx.stroke()}
  for(let k=0;k<6;k++){ctx.fillStyle=k%2?'#5a544a':'#3e3a34';ctx.fillRect(-12+k*4.5,-2+(k%3),3+(k%2),2)}
  ctx.restore();if(hyp(e.x-P.x,e.y-P.y)<4.5&&p<.02)label(sx,sy-64,'Rissige Wand · schlag zu','#c8b898')}
const _drawEnemyS5=drawEnemy;drawEnemy=function(e){if(e.wall)return drawWall(e);return _drawEnemyS5(e)};
// a hidden vault's chest gives more
const _interactS5=interact;interact=function(o){const sc=o&&o.type==='chest'&&o.secret&&!o.open;_interactS5(o);if(sc){const ml=mlNow()+2;for(let k=0;k<2;k++)dropItem(makeItem(ml,{rarity:Math.random()<.6?'rare':'magic',boost:.4}),o.x,o.y);if(Math.random()<.25)dropItem(makeItem(ml,{rarity:'unique'}),o.x,o.y);const gl=Math.round(25*G.mlvl);P.glut+=gl;ftext(o.x,o.y-.4,'+'+gl+' Glut','#ff9a3a')}};

// rolling boulders: a stone sits in a niche at one end of a room; step into its lane and it comes
function boulderSpot(m,r){const{w,t}=m,T=(i,j)=>t[j*w+i];for(const dir of pick([[[1,0],[0,1]],[[0,1],[1,0]]])){let i=r.cx,j=r.cy;if(T(i,j)!==1)continue;
    while(T(i-dir[0],j-dir[1])===1){i-=dir[0];j-=dir[1]}let len=0;while(T(i+dir[0]*(len+1),j+dir[1]*(len+1))===1&&len<30)len++;if(len<8)continue;
    return{k:'boulder',x:i+.5,y:j+.5,x0:i+.5,y0:j+.5,ang:Math.atan2(dir[1],dir[0]),len:len+.2,st:0,t:0,cd:rnd(1,3),p:0,rot:0}}return null}
function boulderTick(b,dt){const ca=Math.cos(b.ang),sa=Math.sin(b.ang);b.cd-=dt;
  if(b.st===0){b.x=b.x0;b.y=b.y0;if(b.cd>0)return;const dx=P.x-b.x0,dy=P.y-b.y0,along=dx*ca+dy*sa,side=Math.abs(-dx*sa+dy*ca);if(along>1.5&&along<b.len&&side<.9&&!P.dead){b.st=1;b.t=0;sample('thunder',.35,{rate:1.6})||syn('quake');G.shake=Math.max(G.shake||0,2)}return}
  b.t+=dt;if(b.st===1){if(b.t>.85){b.st=2;b.t=0;b.p=0;b.hit=new Set()}return}
  b.p+=dt*8.5;b.rot+=dt*8.5/.45;b.x=b.x0+ca*b.p;b.y=b.y0+sa*b.p;if(Math.random()<.5)smoke(b.x-ca*.4,b.y-sa*.4,1,'rgba(110,100,86,',4,.25);G.shake=Math.max(G.shake||0,1.2);
  if(!b.hit.has(P)&&!P.dead&&!(P.iframe>0)&&hyp(P.x-b.x,P.y-b.y)<.85){b.hit.add(P);hurtPlayer(trapDmg()*1.9,null,null);P.kvx=(P.kvx||0)+(-sa)*6*Math.sign(-(P.x-b.x)*sa+(P.y-b.y)*ca||1);G.shake=6;syn('thud')}
  for(const e of G.map.enemies)if(!e.dead&&!e.wall&&!b.hit.has(e)&&hyp(e.x-b.x,e.y-b.y)<.75+e.r*.5){b.hit.add(e);hitEnemy(e,trapDmg()*3,{ally:true,col:'#c8b898'})}
  if(b.p>=b.len-.5){b.st=0;b.cd=rnd(6,9);smoke(b.x,b.y,12,'rgba(110,100,86,',7,.7);G.shake=Math.max(G.shake||0,5);syn('golem');
    for(let k=0;k<16;k++)fxp({k:'bone',x:b.x,y:b.y,z:.5,vx:rnd(-3,3),vy:rnd(-3,3),vz:rnd(1,4),life:rnd(.6,1.2),col:pick(['#6a6258','#8a8274','#4a443c']),s:rnd(2,4),g:7,rot:0,vr:rnd(-8,8)})}}
const _updTrapsS5=updTraps;updTraps=function(dt){_updTrapsS5(dt);const m=G.map;if(!m||!m.traps||G.state!=='play')return;for(const b of m.traps)if(b.k==='boulder'&&Math.abs(b.x0-P.x)<24&&Math.abs(b.y0-P.y)<24)boulderTick(b,dt)};
function drawBoulder(p){const b=p.trap;p.x=b.x;p.y=b.y;const[sx,sy]=iso(b.x,b.y);if(sx<-60||sx>W+60||sy<-80||sy>H+40)return;const re=b.st===0&&b.cd>0?Math.max(0,1-b.cd/1.2):1,sh=b.st===1?Math.sin(b.t*60)*1.5:0;
  if(b.st===1||b.st===0){const[ex,ey]=iso(b.x0+Math.cos(b.ang)*b.len,b.y0+Math.sin(b.ang)*b.len);if(b.st===1){ctx.strokeStyle=`rgba(255,90,60,${.25+b.t*.5})`;ctx.lineWidth=18;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke()}}
  if(re<=0)return;ctx.save();ctx.globalAlpha=re;ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(sx,sy,18,8,0,0,7);ctx.fill();ctx.translate(Math.round(sx+sh),Math.round(sy-15));
  const g=ctx.createRadialGradient(-5,-6,2,0,0,17);g.addColorStop(0,'#9a9284');g.addColorStop(.6,'#6a6258');g.addColorStop(1,'#3a362e');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,16,0,7);ctx.fill();
  ctx.strokeStyle='#2a2620';ctx.lineWidth=1.2;ctx.rotate(b.rot*(Math.cos(b.ang)>=0?1:-1));for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,9+k*2.5,k*2,k*2+1.6);ctx.stroke()}ctx.restore()}

// lying about: pixel props painted once and scattered through the tower and over the islands
const DCS={};
function dcSprites(){const S=(w,h,ax,ay,f)=>{const c=ydSprite(w,h,g=>{const r=(col,x,y,ww=1,hh=1)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh)};f(r,g)});c.ax=ax;c.ay=ay;return c};
  DCS.dcbones=S(26,12,13,10,r=>{r('#d8d0bc',2,8,14,2);r('#d8d0bc',1,7,2,4);r('#d8d0bc',15,7,2,4);r('#c8c0a8',8,5,12,2);r('#c8c0a8',19,4,2,4);r('#e8e2d0',17,2,7,6);r('#e8e2d0',18,1,5,1);r('#1a140c',18,4,2,2);r('#1a140c',21,4,2,2);r('#8a8270',19,7,3,1)});
  DCS.dcskulls=S(22,14,11,12,r=>{for(const[x,y]of[[2,6],[11,6],[6,1]]){r('#e0d8c4',x,y,8,6);r('#e0d8c4',x+1,y+6,6,2);r('#1a140c',x+1,y+2,2,2);r('#1a140c',x+5,y+2,2,2);r('#a8a090',x+3,y+5,2,1);r('#c8c0ac',x,y,8,1)}});
  DCS.dcurn=S(26,22,13,20,r=>{r('#6a3a1c',3,6,9,13);r('#8a5028',4,6,6,13);r('#a86a38',5,8,2,8);r('#4a2810',3,4,9,2);r('#6a3a1c',4,2,7,2);r('#3a200c',4,19,8,1);r('#8a5028',15,15,5,4);r('#6a3a1c',20,17,4,2);r('#a86a38',17,13,3,2);r('#5a3014',13,19,10,1)});
  DCS.dccand=S(16,16,8,14,(r,g)=>{for(const[x,h]of[[2,7],[6,10],[10,5],[13,8]]){r('#e8e0c8',x,14-h,2,h);r('#c8b898',x+1,14-h,1,h);r('#fff4b0',x,13-h,1,1)}r('#d8d0b0',0,14,16,2)});
  DCS.dcrubble=S(30,14,15,12,r=>{for(const[x,y,w,h,c]of[[2,8,8,5,'#5a544a'],[8,6,10,7,'#6a6458'],[17,8,9,5,'#4a443c'],[12,3,7,5,'#7a7468'],[24,10,4,3,'#5a544a'],[0,11,4,2,'#4a443c']]){r(c,x,y,w,h);r('#8a8478',x,y,w,1)}});
  DCS.dcsword=S(14,30,7,28,r=>{r('#8a7a68',6,8,2,19);r('#b0a490',6,8,1,19);r('#6a4a2a',2,6,10,2);r('#4a3018',6,1,2,5);r('#c8a040',6,0,2,1);r('#5a544a',3,27,8,2);r('#7a5a3a',5,13,1,3)});
  DCS.dcbook=S(24,10,12,8,r=>{r('#5a1a14',1,4,9,5);r('#e8dcc0',2,4,7,1);r('#2a3a5a',12,5,8,4);r('#e8dcc0',13,5,6,1);r('#d8ccac',8,1,8,3);r('#8a7a60',8,2,8,1);r('#3a2a1a',17,1,4,2)});
  DCS.dccage=S(26,40,13,38,r=>{r('#2a2622',2,36,22,3);r('#2a2622',2,4,22,2);for(let x=2;x<=22;x+=4)r('#3e3a34',x,6,2,30);r('#5a564e',2,4,22,1);r('#d8d0bc',9,26,6,6);r('#1a140c',10,28,1,1);r('#1a140c',13,28,1,1);r('#d8d0bc',8,32,8,3);r('#2a2622',12,0,2,4)});
  DCS.dcbanner=S(20,46,4,44,r=>{r('#3a2614',3,2,3,43);r('#5a3a1c',3,2,1,43);r('#2a1a0c',2,44,5,2);r('#7a1810',6,4,12,24);r('#a02418',6,4,12,2);r('#5a120c',6,26,4,4);r('#5a120c',13,26,5,6);r('#c8a040',10,10,4,4);r('#e8c868',11,11,2,2);r('#3a2614',3,2,15,2)});
  DCS.dclog=S(48,18,24,15,r=>{r('#4a2e18',4,5,38,9);r('#6a4424',4,5,38,2);r('#3a2210',4,12,38,2);for(let x=8;x<40;x+=6)r('#3a2210',x,7,2,1);r('#8a6a40',41,5,5,9);r('#a88858',42,7,3,5);r('#6a4a28',43,9,1,1);r('#3a6a24',10,3,6,2);r('#4a8a2a',22,4,5,1);r('#3a6a24',30,3,4,2)});
  DCS.dcstump=S(26,20,13,17,r=>{r('#4a2e18',5,6,16,11);r('#6a4424',5,6,16,2);r('#a88858',6,4,14,3);r('#8a6a40',9,5,8,1);r('#3a2210',2,15,6,3);r('#3a2210',18,15,6,3);r('#5a7a2a',14,2,3,2);r('#c8282a',15,1,2,1)});
  DCS.dcbush=S(30,22,15,19,r=>{r('#1e4a18',2,8,26,12);r('#2a6a20',4,5,22,12);r('#3a8a2a',8,3,14,8);r('#4aa034',10,4,4,3);r('#4aa034',18,6,4,2);for(const[x,y]of[[7,9],[12,12],[19,10],[23,13],[15,7]])r('#c8282a',x,y,2,2)});
  DCS.dcmush=S(26,22,13,20,r=>{for(const[x,y,s]of[[3,10,8],[12,5,11],[20,12,6]]){r('#e8dcc0',x+s/2-1,y+s/2,3,20-y-s/2);r('#a82818',x,y,s,s/2+1);r('#c83a24',x+1,y,s-2,2);r('#f0e8d8',x+2,y+1,2,1);r('#f0e8d8',x+s-3,y+2,1,1)}});
  DCS.dcsign=S(30,38,10,36,r=>{r('#3a2614',8,6,4,31);r('#5a3a1c',8,6,1,31);r('#6a4424',2,6,26,8);r('#8a5c30',2,6,26,2);r('#3a2210',4,9,18,1);r('#3a2210',4,11,14,1);r('#6a4424',4,16,20,7);r('#8a5c30',4,16,20,2);r('#3a2210',6,19,12,1);r('#5a7a2a',6,34,10,3)});
  DCS.dccart=S(52,32,26,28,r=>{r('#4a2e18',6,10,34,10);r('#6a4424',6,10,34,2);r('#3a2210',6,18,34,2);r('#6a4424',38,14,14,2);for(const cx of[12,32]){r('#2a1a0c',cx-6,18,12,12);r('#5a3a1c',cx-5,19,10,10);r('#2a1a0c',cx-1,23,2,2)}r('#8a6a40',10,6,8,4);r('#a88858',22,4,10,6);r('#6a4424',26,8,4,2)});
  DCS.dcwell=S(40,44,20,40,r=>{r('#5a544a',4,24,32,16);r('#7a7468',4,24,32,3);r('#4a443c',4,36,32,4);for(let x=6;x<34;x+=7)r('#3e3a34',x,28,1,8);r('#0a0806',8,26,24,2);r('#3a2614',6,4,3,22);r('#3a2614',31,4,3,22);r('#6a4424',4,2,32,4);r('#8a5c30',4,2,32,1);r('#8a8274',19,6,1,12);r('#5a3a1c',17,18,5,5)});
  DCS.dcscare=S(32,50,16,48,r=>{r('#5a3a1c',15,10,3,39);r('#5a3a1c',3,18,26,3);r('#7a5a3a',7,16,18,16);r('#9a7a4a',7,16,18,2);r('#3a6a8a',9,22,14,3);r('#e8c868',2,18,4,3);r('#e8c868',27,18,4,3);r('#d8c088',11,4,10,10);r('#1a140c',13,7,2,2);r('#1a140c',17,7,2,2);r('#1a140c',13,11,6,1);r('#4a3018',8,2,16,3);r('#4a3018',11,0,10,3);r('#e8c868',13,30,2,6);r('#e8c868',18,30,2,5)});
  DCS.dcstones=S(40,22,20,19,r=>{for(const[x,y,w,h]of[[2,8,14,12],[14,3,14,17],[26,10,12,10]]){r('#4a443c',x,y,w,h);r('#6a6458',x+1,y,w-2,h-3);r('#8a8478',x+2,y,w-4,2);r('#3a6a24',x+1,y,w-3,2);r('#4a8a2a',x+2,y,3,1)}})}
const DCLIGHT={dccand:{r:90,a:.6,col:'255,170,80',f:4,h:12}};
const _propLightS5=propLight;propLight=function(p){return DCLIGHT[p.k]||_propLightS5(p)};
const _drawPropS5=drawProp;drawProp=function(p){if(!p.k||p.k[0]!=='d'||p.k[1]!=='c')return _drawPropS5(p);if(p.k==='dcboulder')return drawBoulder(p);if(!DCS.dcbones)dcSprites();const c=DCS[p.k];if(!c)return;
  const[sx,sy]=iso(p.x,p.y);if(sx<-c.width||sx>W+c.width||sy<-c.height||sy>H+c.height)return;if(c.height>24)shadow(sx,sy,c.width/90);
  if(p.f){ctx.save();ctx.translate(Math.round(sx),0);ctx.scale(-1,1);ctx.drawImage(c,-c.ax,Math.round(sy-c.ay));ctx.restore()}else ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));
  if(p.k==='dccand')for(const[x,h]of[[2,7],[6,10],[10,5],[13,8]])flame(Math.round(sx-c.ax+x+1),Math.round(sy-c.ay+13-h),1.6,(p.ph||0)+x)};
function dungeonDecor(m){const{w,t}=m,T=(i,j)=>t[j*w+i],n8=(i,j)=>{let n=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if((a||b)&&T(i+a,j+b)===1)n++;return n};
  const used=[...m.objs,...(m.traps||[])],K=[['dcbones',5],['dcskulls',3],['dcurn',4],['dccand',3],['dcrubble',5],['dcsword',2],['dcbook',2],['dccage',1],['dcbanner',2]];
  const n=rint(26,38);for(let q=0,g=0;q<n&&g<600;g++){const i=rint(4,w-5),j=rint(4,m.h-5);if(T(i,j)!==1||n8(i,j)<8)continue;const x=i+rnd(.2,.8),y=j+rnd(.2,.8);
    if(hyp(x-m.start.x,y-m.start.y)<4||used.some(o=>hyp(o.x-x,o.y-y)<1.6))continue;const k=wpick(K);m.props.push({k,x,y,v:0,ph:rnd(0,6),f:R()<.5});used.push({x,y});q++}}
const DCOW={wild:[['dclog',2],['dcstump',2],['dcbush',3],['dcmush',2],['dcstones',2],['dcsign',.5]],forest:[['dclog',3],['dcstump',3],['dcmush',3],['dcbush',2]],village:[['dccart',2],['dcwell',1],['dcurn',2],['dcbones',2],['dcbanner',1],['dcsign',1]],
  ruins:[['dcstones',3],['dcrubble',3],['dcskulls',1],['dcbanner',1],['dcsword',1]],grave:[['dcskulls',2],['dcbones',3],['dccand',2],['dcstump',1]],camp:[['dcwell',1],['dcscare',1],['dcsign',1],['dccart',1],['dcbanner',2],['dcbush',2]],
  rock:[['dcstones',3],['dcbush',1]],boss:[['dcbones',3],['dcskulls',2],['dcsword',2],['dcbanner',2]]};
const _owContentS5=owContent;owContent=function(m,cx,cy){const c=_owContentS5(m,cx,cy),I=islandOf(cx,cy);if(!I||I.kind==='home'||!DCOW[I.kind])return c;
  const Rg=mulberry(Math.floor(hsh(cx,cy,77)*1e9)),W0=m.w,t=m.t,K=DCOW[I.kind],n=Math.round(I.r*.9)+(I.kind==='forest'||I.kind==='wild'?2:0),taken=[...c.objs,...c.props,...c.blocks.map(b=>({x:b.i+.5,y:b.j+.5}))];
  for(let q=0,g=0;q<n&&g<120;g++){const a=Rg()*6.283,r=2.8+Rg()*(I.r-4),x=I.x+Math.cos(a)*r,y=I.y+Math.sin(a)*r,i=Math.floor(x),j=Math.floor(y),v=t[j*W0+i];
    if(!(v===4||v===7)||Math.abs(x-I.x)<2.8||Math.abs(y-I.y)<2.8||taken.some(o=>hyp(o.x-x,o.y-y)<2))continue;
    let s=Rg()*K.reduce((a,b)=>a+b[1],0),k=K[0][0];for(const[kk,ww]of K){if(s<ww){k=kk;break}s-=ww}
    c.props.push({k,x,y,v:0,ph:Rg()*6,f:Rg()<.5});taken.push({x,y});q++}
  return c};

