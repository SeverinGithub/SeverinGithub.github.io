// the living isles: grass that sways in the wind and gives way underfoot, trodden paths and patches of moss, clover, leaves, gravel and puddles,
// wind that carries leaves, seeds and ash, birds by day and bats by night, crows on the graves, gnats, bees and moths, fireflies after dark,
// stones crumbling off the edges, standing stones whose runes wake when you come near, and whispers by old places
const LVS={};
function lvSpr(){if(LVS.done)return;LVS.done=1;
  const blob=(g,cx,cy,rx,ry,col,n,Rr,a=1)=>{g.fillStyle=col;g.globalAlpha=a;for(let k=0;k<n;k++){const q=Rr()*6.28,d=Rr();g.beginPath();g.ellipse(cx+Math.cos(q)*rx*d*.55,cy+Math.sin(q)*ry*d*.55,rx*(.35+Rr()*.35),ry*(.35+Rr()*.35),0,0,7);g.fill()}g.globalAlpha=1};
  const dots=(g,cx,cy,rx,ry,cols,n,Rr,w=1,h=1)=>{for(let k=0;k<n;k++){const q=Rr()*6.28,d=Math.sqrt(Rr());g.fillStyle=cols[Math.floor(Rr()*cols.length)];g.fillRect(Math.round(cx+Math.cos(q)*rx*d),Math.round(cy+Math.sin(q)*ry*d),w,h)}};
  // worn grass for the paths: the same kind of tile, more yellow, fewer blades, earth and pebbles between
  LVS.path=[0,1,2,3,4,5].map(v=>mk(64,32,g=>{const Rr=mulberry(v*19+3);dia(g);g.fillStyle=['#9cb23a','#a2b640','#98ae36','#9fb43c','#a6b844','#9ab038'][v];g.fill();g.save();g.clip();
    for(let k=0;k<4;k++){g.fillStyle=`rgba(${128+Rr()*20|0},${104+Rr()*16|0},${56+Rr()*10|0},${(.3+Rr()*.18).toFixed(2)})`;g.beginPath();g.ellipse(14+Rr()*36,8+Rr()*16,4+Rr()*7,2+Rr()*3,0,0,7);g.fill()}
    for(let k=0;k<22;k++){const x=Rr()*64,y=Rr()*32;g.strokeStyle=Rr()<.55?'#62841c':'#c8dc66';g.globalAlpha=.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+(Rr()*2-1)*1.5,y-1-Rr()*2.5);g.stroke()}
    g.globalAlpha=1;for(let k=0;k<14;k++){g.fillStyle=['#6a5434','#a8946a','#5a4a2c','#c8b890'][Math.floor(Rr()*4)];g.fillRect(Rr()*60+2|0,Rr()*28+2|0,Rr()<.3?2:1,1)}g.restore()}));
  LVS.moss=[0,1,2].map(v=>mk(56,28,g=>{const Rr=mulberry(v*17+3);blob(g,28,14,24,11,'#24461a',8,Rr,.55);blob(g,28,14,16,7,'#36621f',6,Rr,.5);dots(g,28,14,16,7,['#5a8a2a','#6e9e34'],14,Rr)}));
  LVS.clover=[0,1,2].map(v=>mk(52,26,g=>{const Rr=mulberry(v*23+5);blob(g,26,13,22,10,'#3e7a22',7,Rr,.45);for(let k=0;k<12;k++){const x=6+Rr()*40,y=5+Rr()*16;g.fillStyle=Rr()<.5?'#5aa02c':'#4a8e26';g.fillRect(x|0,y|0,2,1);g.fillRect((x+1)|0,(y-1)|0,1,1);g.fillRect((x-1)|0,(y+1)|0,1,1)}dots(g,26,13,16,7,['#f0ecd8','#e8d8f0'],3+v,Rr,2,2)}));
  LVS.leaves=[0,1,2].map(v=>mk(56,28,g=>{const Rr=mulberry(v*41+9);for(let k=0;k<22;k++){const x=6+Rr()*44,y=4+Rr()*20;g.save();g.translate(x,y);g.rotate(Rr()*6.28);g.fillStyle=['#a0522a','#c07a2a','#d8a03a','#7a4a22','#8a6a2a'][Math.floor(Rr()*5)];g.beginPath();g.ellipse(0,0,2.6,1.2,0,0,7);g.fill();g.restore()}}));
  LVS.gravel=[0,1,2].map(v=>mk(48,24,g=>{const Rr=mulberry(v*13+1);blob(g,24,12,20,9,'#5a564e',5,Rr,.3);dots(g,24,12,18,8,['#8a867c','#6a665e','#a8a498','#4a4640'],26,Rr,2,1)}));
  LVS.mud=[0,1].map(v=>mk(60,30,g=>{const Rr=mulberry(v*7+11);blob(g,30,15,26,12,'#3a2e1e',7,Rr,.42)}));
  // standing stones with carved runes; the glow is a second picture laid over them when they wake
  const GLY=[[[0,0,0,1],[0,.5,.6,0]],[[0,0,.6,1],[.6,0,0,1]],[[.3,0,.3,1],[0,.3,.6,.3],[0,.7,.6,.7]],[[0,0,.6,0],[.6,0,0,1],[0,1,.6,1]],[[.3,0,0,.5],[0,.5,.3,1],[.3,0,.6,.5],[.6,.5,.3,1]],[[0,1,.3,0],[.3,0,.6,1],[.15,.6,.45,.6]]];
  const runes=(g,v,col,w)=>{const Rr=mulberry(v*53+2);g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';for(let r=0;r<3;r++){const G0=GLY[Math.floor(Rr()*GLY.length)],ox=10,oy=12+r*11;g.beginPath();for(const[a,b,c,d]of G0){g.moveTo(ox+a*9,oy+b*8);g.lineTo(ox+c*9,oy+d*8)}g.stroke()}};
  const stone=(g,v)=>{const Rr=mulberry(v*29+4),wob=()=>Rr()*2-1;g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(15,49,13,4,0,0,7);g.fill();
    g.beginPath();g.moveTo(3,48);g.lineTo(2+wob(),20);g.lineTo(6+wob(),6);g.lineTo(13+wob(),2);g.lineTo(22+wob(),5);g.lineTo(27+wob(),18);g.lineTo(27,48);g.closePath();
    const q=g.createLinearGradient(0,0,30,0);q.addColorStop(0,'#8a8a90');q.addColorStop(.45,'#6a6a72');q.addColorStop(1,'#3a3a42');g.fillStyle=q;g.fill();g.strokeStyle='#26262c';g.lineWidth=1;g.stroke();
    g.fillStyle='rgba(60,100,40,.55)';for(let k=0;k<5;k++)g.fillRect(3+Rr()*8|0,36+Rr()*11|0,3,2);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(5,8,4,34)};
  SPR.prop.lvrune=[0,1,2,3].map(v=>{const c=mk(30,54,g=>{stone(g,v);runes(g,v,'#2a2a30',1.6);g.save();g.translate(.6,.6);runes(g,v,'rgba(160,160,170,.35)',.8);g.restore()});c.ax=15;c.ay=49;return c});
  LVS.glow={};for(const[k,col]of[['c','150,230,255'],['g','160,255,190'],['v','200,160,255']])LVS.glow[k]=[0,1,2,3].map(v=>mk(30,54,g=>{g.filter='blur(2px)';runes(g,v,`rgba(${col},.9)`,3.4);g.filter='none';runes(g,v,`rgba(${col},1)`,1.4);runes(g,v,'rgba(255,255,255,.85)',.6)}))}

// what each island gets, decided from the seed so every player sees the same
const _owContentLV=owContent;owContent=function(m,cx,cy){const c=_owContentLV(m,cx,cy);lvSpr();const lv=c.lv={tuft:[],path:[],patch:[],rune:[],crow:[],gnat:[],bee:[]};
  // tufts leave the flat ground and sway on their own
  c.deco=c.deco.filter(d=>{if(d.k!=='tuft')return true;lv.tuft.push({x:d.x,y:d.y,v:d.v,ph:hsh(Math.floor(d.x*7),Math.floor(d.y*7),173)*6.28});return false});
  for(const d of c.deco)if(d.k==='flowers'&&lv.bee.length<3&&hsh(Math.floor(d.x*5),Math.floor(d.y*5),174)<.5)lv.bee.push({x:d.x,y:d.y,ph:hsh(cx,cy,175+lv.bee.length)*6.28});
  const I=islandOf(cx,cy);if(!I||I.kind==='home'||I.kind==='boss'||(I.big&&!(cx===I.cx&&cy===I.cy)))return c;
  const Rg=mulberry(Math.floor(hsh(cx,cy,171)*1e9)),rr=(a,b)=>a+Rg()*(b-a),W0=m.w,t=m.t,T=(i,j)=>t[j*W0+i],SX=I.sx||1,SY=I.sy||1;
  // trodden paths from the middle to every bridge, a little crooked
  const path=new Set();
  if(!I.big){const ph=rr(0,6.28);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const on=dx>0||dy>0?linkOn(cx,cy,cx+dx,cy+dy):linkOn(cx+dx,cy+dy,cx,cy);if(!on)continue;
    let pi=null,pj=null;
    for(let s=1.5;s<I.r+3;s+=.5){const o=Math.sin(s*.45+ph+dx*2+dy)*.6,i=Math.floor(I.x+dx*s-dy*o),j=Math.floor(I.y+dy*s+dx*o);if(T(i,j)!==4){pi=null;continue}
      // a step to the side keeps the tiles joined edge to edge, never only at a corner
      if(pi!==null&&pi!==i&&pj!==j&&T(pi,j)===4)path.add(j*W0+pi);path.add(j*W0+i);pi=i;pj=j}}}
  for(const k of path){const i=k%W0,j=(k-i)/W0;if(T(i,j+1)&&T(i+1,j))lv.path.push({i,j,v:(i*7+j*13)%LVS.path.length})}
  if(path.size){const off=d=>!path.has(Math.floor(d.y)*W0+Math.floor(d.x));lv.tuft=lv.tuft.filter(off);c.deco=c.deco.filter(off)}
  // patches: what lies about depends on the island
  const spot=(ok=v=>v===4)=>{for(let k=0;k<20;k++){const a=rr(0,6.28),r=rr(1,I.r-1.2),i=Math.floor(I.x+Math.cos(a)*r*SX),j=Math.floor(I.y+Math.sin(a)*r*SY);if(ok(T(i,j))&&!path.has(j*W0+i))return[i+rr(.2,.8),j+rr(.2,.8)]}return null};
  const put=(k,n,ok)=>{for(let q=0;q<n;q++){const p=spot(ok);if(p)lv.patch.push({k,x:p[0],y:p[1],v:Math.floor(rr(0,LVS[k].length-.01)),f:Rg()<.5})}};
  const A=I.r*I.r*SX*SY/100,N=n=>Math.round(n*A*rr(.7,1.3)),K=I.kind;
  put('moss',N(K==='forest'?6:K==='ruins'?5:K==='grave'?4:2));put('clover',N(K==='wild'?5:K==='village'||K==='camp'?2:K==='forest'?2:1));
  put('gravel',N(K==='rock'?6:K==='ruins'?4:K==='village'||K==='camp'?3:1),v=>v===4||v===7);put('leaves',N(K==='forest'?3:K==='grave'?2:.5));put('mud',N(2.5),v=>v===4||v===7);
  for(const b of c.blocks){if(b.k==='tree'&&Rg()<.6)lv.patch.push({k:'leaves',x:b.i+.5+rr(-.6,.6),y:b.j+1.2+rr(-.3,.3),v:Math.floor(rr(0,2.99)),f:Rg()<.5});
    if(b.k==='tree'&&(K==='forest'||K==='wild'||K==='grave')&&lv.gnat.length<3&&Rg()<.35)lv.gnat.push({x:b.i+1.4,y:b.j+1.4,ph:rr(0,6)});
    if(b.k==='grave'&&lv.crow.length<3&&Rg()<.5){const L=SPR.prop.grave,s=L&&L[b.v%L.length];lv.crow.push({hx:b.i+.5,hy:b.j+.5,hz:s?Math.max(14,s.ay-8):22,x:b.i+.5,y:b.j+.5,z:0,st:0,a:0,t:rr(0,6)})}}
  for(const p of lv.patch)if(p.k==='mud'&&Rg()<.4)lv.gnat.push({x:p.x,y:p.y,ph:rr(0,6)});
  // standing stones with runes: often on ruins and grave islands, now and then out in the wild
  const nr=K==='ruins'?(Rg()<.85?2+(Rg()<.4):0):K==='grave'?(Rg()<.7?1+(Rg()<.3):0):K==='wild'||K==='forest'?(Rg()<.25?1:0):0,col=K==='ruins'?'c':K==='grave'?'g':'v';
  const taken=[...c.objs,...c.props],heads=[],RR=Math.ceil(I.r*Math.max(SX,SY))+4;
  for(let j=Math.floor(I.y)-RR;j<=I.y+RR;j++)for(let i=Math.floor(I.x)-RR;i<=I.x+RR;i++)if(T(i,j)===8&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const v=T(i+a,j+b);return v===4||v===7}))heads.push([i+.5,j+.5]);
  const segD=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy||1,q=clamp(((px-ax)*dx+(py-ay)*dy)/L,0,1);return hyp(px-ax-dx*q,py-ay-dy*q)};
  const onWay=(x,y)=>heads.some(([hx,hy])=>segD(x,y,hx,hy,I.x,I.y)<2.8||segD(x,y,hx,hy,I.x,hy)<2.8||segD(x,y,I.x,hy,I.x,I.y)<2.8||segD(x,y,hx,hy,hx,I.y)<2.8||segD(x,y,hx,I.y,I.x,I.y)<2.8);
  for(let q=0,tr=0;q<nr&&tr<80;tr++){const a=rr(0,6.28),r=rr(3.5,I.r-2),i=Math.floor(I.x+Math.cos(a)*r*SX),j=Math.floor(I.y+Math.sin(a)*r*SY);
    if(Math.abs(i+.5-I.x)<3||Math.abs(j+.5-I.y)<3)continue;const v0=T(i,j);let ok=v0===4||v0===7;for(const[a2,b2]of[[1,0],[-1,0],[0,1],[0,-1],[1,1]]){const v=T(i+a2,j+b2);if(!v||v===8)ok=false}
    if(!ok||onWay(i+.5,j+.5)||path.has(j*W0+i)||taken.some(o=>Math.abs(o.x-i-.5)<1.4&&Math.abs(o.y-j-.5)<1.4)||lv.rune.some(o=>Math.abs(o.x-i-.5)<4&&Math.abs(o.y-j-.5)<4))continue;
    const k=j*W0+i,v=Math.floor(rr(0,3.99));m.under[k]=t[k];t[k]=9;c.blocks.push({i,j,k:'lvrune',v});lv.rune.push({x:i+.5,y:j+.5,v,col,w:0,on:false});q++}
  lv.tuft=lv.tuft.filter(d=>T(Math.floor(d.x),Math.floor(d.y))!==9);
  return c};
// the lists of the chunks around the hero, rebuilt whenever that set changes
const _owTickLV=owTick;owTick=function(){_owTickLV();const m=G.map;if(!m||!m.world||m.lvAc===m.ac)return;m.lvAc=m.ac;
  const L=[...m.active].map(k=>m.cdata.get(k)&&m.cdata.get(k).lv).filter(Boolean),f=k=>L.flatMap(q=>q[k]||[]);
  m.lv={tuft:f('tuft'),path:f('path'),patch:f('patch'),rune:f('rune'),crow:f('crow'),gnat:f('gnat'),bee:f('bee')}};

// one world-wide state for the moving things
const LV={wind:{a:0,s:.35},wet:0,birds:[],ffly:[],leaf:[],streak:[],peb:[],birdT:8,crT:1,whT:20,rustT:0,lx:0,ly:0};
const lvLand=(x,y)=>{const m=G.map,v=m.t[Math.floor(y)*m.w+Math.floor(x)];return v===4||v===7||v===9};
function lvTick(dt){const m=G.map;if(!m||!m.world||!P)return;const lv=m.lv,w=G.wx,t=G.t,nA=nightA();
  // wind follows the weather, with gusts
  const ws={clear:.35,rain:.8,ash:.6,fog:.15,snow:.75}[w&&w.i>.3?w.k:'clear']??.35,W2=LV.wind;W2.s+=(ws*(1+.35*Math.sin(t*.31)*Math.sin(t*.13))-W2.s)*Math.min(1,dt*.5);W2.a=hsh(3,7,177)*6.28+Math.sin(t*.011)*.7;
  LV.wet=clamp(LV.wet+(w&&w.k==='rain'&&w.i>.3?dt/20:-dt/120),0,1);
  // leaves, seeds and ash on the wind, and now and then a streak of air
  const I=islandOf(Math.floor(P.x/CH),Math.floor(P.y/CH)),kind=I?I.kind:'',want=Math.round(4+W2.s*22),wx=Math.cos(W2.a),wy=Math.sin(W2.a);
  if(LV.leaf.length<want&&Math.random()<dt*8){const ash=w&&w.k==='ash'&&w.i>.3,a=rnd(0,6.28),r=rnd(2,13);LV.leaf.push({x:P.x+Math.cos(a)*r-wx*4,y:P.y+Math.sin(a)*r-wy*4,z:rnd(.3,2.6),k:ash?'ash':kind==='forest'||Math.random()<.3?'leaf':'seed',c:pick(['#c07a2a','#d8a03a','#8aa030','#a0522a']),t:0,life:rnd(4,7),ph:rnd(0,6),r:rnd(0,6)})}
  for(const f of LV.leaf){f.t+=dt;const sp=W2.s*(f.k==='seed'?2.2:3);f.x+=(wx*sp+Math.sin(t*2+f.ph)*.3)*dt;f.y+=(wy*sp+Math.cos(t*1.7+f.ph)*.3)*dt;f.z+=Math.sin(t*1.3+f.ph)*dt*.4-(f.k==='leaf'?.08:0)*dt;f.r+=dt*(f.k==='leaf'?4:1)}
  LV.leaf=LV.leaf.filter(f=>f.t<f.life&&f.z>-.2);
  if(W2.s>.4&&Math.random()<dt*W2.s*.9&&LV.streak.length<4){const a=rnd(0,6.28),r=rnd(3,12);LV.streak.push({x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r,z:rnd(.8,3),t:0,life:rnd(1.4,2.2),ph:rnd(0,6)})}
  for(const s of LV.streak){s.t+=dt;s.x+=wx*W2.s*4*dt;s.y+=wy*W2.s*4*dt}LV.streak=LV.streak.filter(s=>s.t<s.life);
  // a flock now and then: birds by day, bats by night
  LV.birdT-=dt;if(LV.birdT<=0){LV.birdT=rnd(16,38);const bat=nA>.5,a=rnd(0,6.28),n=bat?Math.floor(rnd(4,8)):Math.floor(rnd(5,10)),ox=Math.cos(a),oy=Math.sin(a),sx0=P.x-ox*22+oy*rnd(-8,8),sy0=P.y-oy*22-ox*rnd(-8,8),z=bat?rnd(2,3.5):rnd(5,8);
    for(let k=0;k<n;k++){const row=Math.ceil(k/2),side=k%2?1:-1;LV.birds.push({x:sx0-ox*row*.9+oy*side*row*.7,y:sy0-oy*row*.9-ox*side*row*.7,z:z+rnd(-.3,.3),vx:ox*(bat?5.5:4.2),vy:oy*(bat?5.5:4.2),bat,ph:rnd(0,6),t:0})}}
  for(const b of LV.birds){b.t+=dt;const j=b.bat?Math.sin(t*9+b.ph)*1.5:0;b.x+=(b.vx-b.vy*j*.3)*dt;b.y+=(b.vy+b.vx*j*.3)*dt}LV.birds=LV.birds.filter(b=>b.t<14);
  // fireflies after dark, over grass; they shy away from the hero
  const ffW=nA>.4?(kind==='forest'?40:kind==='rock'?8:26):0;
  if(LV.ffly.length<ffW&&Math.random()<dt*6){const a=rnd(0,6.28),r=rnd(2,11),x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;if(lvLand(x,y))LV.ffly.push({x,y,z:rnd(.3,1.4),vx:0,vy:0,t:0,life:rnd(14,28),ph:rnd(0,6),sp:rnd(.9,1.6)})}
  for(const f of LV.ffly){f.t+=dt;const d=hyp(f.x-P.x,f.y-P.y);let ax=Math.sin(t*.7*f.sp+f.ph)*.6,ay=Math.cos(t*.53*f.sp+f.ph*1.3)*.6;if(d<1.6){ax+=(f.x-P.x)/d*3;ay+=(f.y-P.y)/d*3}
    f.vx+=(ax-f.vx)*dt*2;f.vy+=(ay-f.vy)*dt*2;const nx=f.x+f.vx*dt,ny=f.y+f.vy*dt;if(lvLand(nx,ny)){f.x=nx;f.y=ny}else{f.vx*=-1;f.vy*=-1}f.z=clamp(f.z+Math.sin(t*1.1+f.ph)*dt*.3,.2,1.8)}
  if(!ffW)for(const f of LV.ffly)f.life=Math.min(f.life,f.t+1.5);LV.ffly=LV.ffly.filter(f=>f.t<f.life&&hyp(f.x-P.x,f.y-P.y)<17);
  // stones work loose from the edges and fall into the deep
  LV.crT-=dt*(G.shake>3?4:1);if(LV.crT<=0){LV.crT=rnd(.7,2);for(let tr=0;tr<30;tr++){const i=Math.floor(P.x+rnd(-13,13)),j=Math.floor(P.y+rnd(-13,13)),v=m.t[j*m.w+i];if(v!==4&&v!==7)continue;const s=m.t[(j+1)*m.w+i]===0,e=m.t[j*m.w+i+1]===0;if(!s&&!e)continue;
    const x=s?i+rnd(.1,.9):i+1,y=s?j+1:j+rnd(.1,.9),n=Math.floor(rnd(1,4));for(let k=0;k<n;k++)LV.peb.push({x:x+rnd(-.1,.1),y:y+rnd(-.1,.1),z:-rnd(0,.2),vz:rnd(0,1),vx:s?0:rnd(.1,.4),vy:s?rnd(.1,.4):0,t:0,s:rnd(1,2.6),c:pick(['#5a4a3a','#6a5a48','#4a3e32','#7a6a56'])});
    if(Math.random()<.5)fxp({k:'smoke',x,y,z:-.1,vx:0,vy:0,vz:-.3,life:1.2,col:'rgba(120,104,84,',s:rnd(4,7),g:0});if(Math.random()<.25&&hyp(x-P.x,y-P.y)<9)lvNoise(.35,.012,260);break}}
  for(const p of LV.peb){p.t+=dt;p.vz-=9*dt;p.z+=p.vz*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}LV.peb=LV.peb.filter(p=>p.t<2.4);
  if(!lv)return;
  // runes wake when the hero comes near and fall asleep again slowly
  for(const r of lv.rune){const d=hyp(r.x-P.x,r.y-P.y),near=d<4.5;r.w=clamp(r.w+(near?dt*1.4:-dt/6),0,1);if(near&&!r.on){r.on=true;lvChime();for(let k=0;k<8;k++)fxp({k:'mote',x:r.x+rnd(-.3,.3),y:r.y+rnd(-.3,.3),z:rnd(.3,1.5),vz:rnd(.2,.6),vx:rnd(-.2,.2),vy:rnd(-.2,.2),life:rnd(1.2,2.2),col:r.col==='c'?'#a0e8ff':r.col==='g'?'#b0ffc8':'#d0b0ff',s:rnd(.6,1),g:0})}if(d>7)r.on=false;if(r.w>.1&&Math.random()<dt*8)addLight(r.x,r.y,120*r.w,.5*r.w,.3)}
  // crows sit on the graves, take off when you come close and come back when you have gone
  for(const c of lv.crow){c.t+=dt;const d=hyp(c.hx-P.x,c.hy-P.y);if(c.st===0&&d<3.4){c.st=1;c.a=Math.atan2(c.hy-P.y,c.hx-P.x);lvCaw()}
    if(c.st===1){c.a+=dt*.9;c.z=Math.min(c.z+dt*2.4,4);c.x=c.hx+Math.cos(c.a)*Math.min(4,c.z);c.y=c.hy+Math.sin(c.a)*Math.min(4,c.z);if(d>7.5){c.rt=(c.rt||0)+dt;if(c.rt>5){c.st=2;c.rt=0}}else c.rt=0}
    if(c.st===2){c.z=Math.max(0,c.z-dt*1.6);const q=Math.min(1,dt*2);c.x+=(c.hx-c.x)*q;c.y+=(c.hy-c.y)*q;if(c.z<=0){c.st=0;c.x=c.hx;c.y=c.hy}if(d<3.4)c.st=1}}
  // grass rustles under the hero's feet
  const mv=hyp(P.x-LV.lx,P.y-LV.ly);LV.lx=P.x;LV.ly=P.y;LV.rustT-=dt;if(mv>.02&&LV.rustT<=0&&lv.tuft.some(d=>Math.abs(d.x-P.x)<.7&&Math.abs(d.y-P.y)<.7)){LV.rustT=.28;lvNoise(.14,.02,2600,'bandpass')}
  // whispers by runes, crypts and graves
  LV.whT-=dt;if(LV.whT<=0){LV.whT=rnd(18,40);let src=null,bd=7;for(const r of lv.rune){const d=hyp(r.x-P.x,r.y-P.y);if(d<bd){bd=d;src=r}}
    for(const o of m.objs)if(o.type==='iscrypt'){const d=hyp(o.x-P.x,o.y-P.y);if(d<bd){bd=d;src=o}}
    if(!src&&nA>.5)for(const c of lv.crow){const d=hyp(c.hx-P.x,c.hy-P.y);if(d<bd){bd=d;src={x:c.hx,y:c.hy}}}
    if(src&&Math.random()<.7)lvWhisper(src.x,src.y)}}
const _updWorldLV=updWorld;updWorld=function(dt){_updWorldLV(dt);if(G.state==='play')lvTick(dt)};

// sounds made on the spot: rustle, rumble, chime, caw, whisper
function lvNoise(dur,vol,freq,type='lowpass'){if(!AC||G.muted||!noiseBuf)return;try{const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type=type;f.frequency.value=freq;if(type==='bandpass')f.Q.value=1.2;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.25);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(sfxOut());s.start(t);s.stop(t+dur+.05)}catch(e){}}
function lvChime(){if(!AC||G.muted)return;try{const t=AC.currentTime;for(const[f,d,v]of[[660,2.2,.025],[990,1.8,.018],[1320,1.4,.01]]){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(sfxOut());o.start(t);o.stop(t+d+.05)}}catch(e){}}
function lvCaw(){if(!AC||G.muted)return;try{const t0=AC.currentTime,n=1+Math.floor(Math.random()*2);for(let k=0;k<n;k++){const t=t0+k*.32,o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain();o.type='sawtooth';o.frequency.setValueAtTime(rnd(520,600),t);o.frequency.exponentialRampToValueAtTime(rnd(300,360),t+.22);
  f.type='bandpass';f.frequency.value=1400;f.Q.value=2.5;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.24);o.connect(f);f.connect(g);g.connect(sfxOut());o.start(t);o.stop(t+.26)}}catch(e){}}
// a whisper: breath through shifting formants, a syllable at a time, from the side the place lies on, with a cold echo
function lvWhisper(x,y){if(!AC||G.muted||!noiseBuf)return;try{const t0=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),f2=AC.createBiquadFilter(),g=AC.createGain(),out=AC.createGain(),dl=AC.createDelay(1),fb=AC.createGain(),lp=AC.createBiquadFilter();
  s.buffer=noiseBuf;s.loop=true;f.type='bandpass';f.Q.value=9;f2.type='bandpass';f2.Q.value=6;f2.frequency.value=2600;
  const[sx]=iso(x,y),pan=AC.createStereoPanner?AC.createStereoPanner():null;if(pan)pan.pan.value=clamp((sx-W/2)/(W/2),-1,1)*.8;
  const n=Math.floor(rnd(6,12));let t=t0+.05;g.gain.setValueAtTime(0,t0);for(let k=0;k<n;k++){const d=rnd(.08,.17);f.frequency.setValueAtTime(rnd(500,2400),t);f.frequency.linearRampToValueAtTime(rnd(500,2400),t+d);g.gain.linearRampToValueAtTime(rnd(.04,.07),t+d*.35);g.gain.linearRampToValueAtTime(.002,t+d);t+=d+(Math.random()<.25?rnd(.12,.3):rnd(0,.05))}
  dl.delayTime.value=.23;fb.gain.value=.38;lp.type='lowpass';lp.frequency.value=1800;out.gain.value=1;
  s.connect(f);s.connect(f2);const sg=AC.createGain();sg.gain.value=.25;f2.connect(sg);sg.connect(g);f.connect(g);g.connect(out);out.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);
  const dest=sfxOut();if(pan){out.connect(pan);lp.connect(pan);pan.connect(dest)}else{out.connect(dest);lp.connect(dest)}s.start(t0);s.stop(t+1.2)}catch(e){}}

// on the ground: paths, patches and puddles under everything, and tufts that sway
const _drawDecalsLV=drawDecals;drawDecals=function(){const m=G.map;if(m&&m.world&&m.lv)lvGround(m);return _drawDecalsLV()};
function lvGround(m){const lv=m.lv,vis=(x,y,mx=60)=>{const[sx,sy]=iso(x,y);return sx>-mx&&sx<W+mx&&sy>-mx&&sy<H+mx?[sx,sy]:null};
  // trodden paths: tiles of worn grass with earth showing through
  for(const p of lv.path){const[sx,sy]=iso(p.i,p.j);if(sx<-40||sx>W+40||sy<-40||sy>H+40)continue;ctx.drawImage(LVS.path[p.v],sx-32,sy)}
  const wet=LV.wet,nA=nightA();
  for(const p of lv.patch){const s=vis(p.x,p.y);if(!s)continue;const c=LVS[p.k][p.v];
    if(p.k==='mud'){ctx.drawImage(c,s[0]-30,s[1]-15);if(wet>.02){ctx.save();ctx.globalAlpha=wet*.85;ctx.translate(s[0],s[1]);ctx.scale(1,.5);const g=ctx.createRadialGradient(-4,-4,2,0,0,20);g.addColorStop(0,nA>.5?'#3a4a70':'#c8dcf4');g.addColorStop(.7,nA>.5?'#1a2440':'#7aa4d8');g.addColorStop(1,'rgba(60,80,110,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,20,0,7);ctx.fill();
      if(G.wx&&G.wx.k==='rain'&&G.wx.i>.3){const q=(G.t*1.3+p.x)%1;ctx.strokeStyle=`rgba(220,235,255,${(1-q)*.6})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(Math.sin(p.x*9+Math.floor(G.t*1.3))*8,Math.cos(p.y*7+Math.floor(G.t*1.3))*6,q*9,0,7);ctx.stroke()}ctx.restore()}continue}
    if(p.f){ctx.save();ctx.translate(s[0],s[1]);ctx.scale(-1,1);ctx.drawImage(c,-c.width/2,-c.height/2);ctx.restore()}else ctx.drawImage(c,s[0]-c.width/2,s[1]-c.height/2)}
  // tufts lean with the wind and away from whoever walks through them
  const W2=LV.wind,lean0=(Math.cos(W2.a)-Math.sin(W2.a))*.7,walk=[P,...m.enemies.filter(e=>!e.dead&&Math.abs(e.x-P.x)<14&&Math.abs(e.y-P.y)<14)];
  for(const d of lv.tuft){const s=vis(d.x,d.y,30);if(!s)continue;const c=SPR.deco.tuft[d.v%SPR.deco.tuft.length];let l=W2.s*lean0*(.22+.16*Math.sin(G.t*2.2+d.ph));
    for(const e of walk){const dx=d.x-e.x,dy=d.y-e.y,r=Math.abs(dx)+Math.abs(dy);if(r<1.1){const sd=dx-dy;l+=(sd>=0?1:-1)*.75*(1-r/1.1)}}
    ctx.save();ctx.translate(s[0],s[1]+c.height/2-3);ctx.transform(1,0,-clamp(l,-.9,.9),1,0,0);ctx.drawImage(c,-c.width/2,-(c.height-3));ctx.restore()}}

// in the air, after everything standing: wind, flocks, crows, gnats, bees, moths and falling stones
const _drawFxWorldLV=drawFxWorld;drawFxWorld=function(){_drawFxWorldLV();const m=G.map;if(m&&m.world)lvAir(m)};
function lvAir(m){const t=G.t,lv=m.lv,nA=nightA(),on=(sx,sy,mx=40)=>sx>-mx&&sx<W+mx&&sy>-mx-200&&sy<H+mx;ctx.save();
  for(const s of LV.streak){const[sx,sy0]=iso(s.x,s.y),sy=sy0-s.z*30;if(!on(sx,sy,200))continue;const p=s.t/s.life,a=Math.sin(p*Math.PI)*.22,[dx,dy]=scrDir(LV.wind.a);ctx.strokeStyle=`rgba(240,246,255,${a})`;ctx.lineWidth=1.2;ctx.beginPath();
    for(let k=0;k<=12;k++){const q=k/12,L=(q-.5)*120,x=sx+dx*L,y=sy+dy*L+Math.sin(q*6+s.ph+t*3)*4;k?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}
  for(const f of LV.leaf){const[sx,sy0]=iso(f.x,f.y),sy=sy0-f.z*30;if(!on(sx,sy))continue;const a=Math.min(1,f.t,f.life-f.t);ctx.globalAlpha=a;
    if(f.k==='leaf'){ctx.save();ctx.translate(sx,sy);ctx.rotate(f.r);ctx.scale(1,Math.abs(Math.sin(f.r*1.3))+.2);ctx.fillStyle=f.c;ctx.beginPath();ctx.ellipse(0,0,3,1.5,0,0,7);ctx.fill();ctx.restore()}
    else if(f.k==='ash'){ctx.fillStyle=f.ph>3?'#5a5652':'#8a8680';ctx.fillRect(sx,sy,2,2)}
    else{ctx.fillStyle='rgba(250,250,240,.85)';ctx.fillRect(sx-1,sy,3,1);ctx.fillRect(sx,sy-1,1,3)}}
  ctx.globalAlpha=1;
  for(const b of LV.birds){const[sx,sy0]=iso(b.x,b.y),sy=sy0-b.z*30;if(!on(sx,sy,60))continue;const a=Math.min(1,b.t,14-b.t);ctx.globalAlpha=a;
    if(lvLand(b.x,b.y)){ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(sx,sy0,b.bat?3:5,1.6,0,0,7);ctx.fill()}
    const f=Math.sin(t*(b.bat?22:9)+b.ph),w=b.bat?4:7;ctx.strokeStyle=b.bat?'#120e14':'#2a2a30';ctx.lineWidth=b.bat?1.4:1.6;ctx.beginPath();ctx.moveTo(sx-w,sy-f*3);ctx.quadraticCurveTo(sx-w*.4,sy-2-f*2,sx,sy);ctx.quadraticCurveTo(sx+w*.4,sy-2-f*2,sx+w,sy-f*3);ctx.stroke()}
  ctx.globalAlpha=1;
  if(lv){
    for(const c of lv.crow){const[sx,sy0]=iso(c.x,c.y);if(!on(sx,sy0))continue;const y=sy0-c.hz-c.z*30*(c.st?1:0)-(c.st?6:0);
      if(c.st===0){const pk=Math.sin(c.t*1.3)>.8?2:0;ctx.fillStyle='#0a0a0e';ctx.beginPath();ctx.ellipse(sx,y-3,3.4,2.4,0,0,7);ctx.fill();ctx.fillRect(sx+1,y-6+pk,3,3);ctx.fillStyle='#3a3a30';ctx.fillRect(sx+4,y-5+pk,2,1);ctx.fillStyle='#0a0a0e';ctx.fillRect(sx-5,y-3,3,1)}
      else{const f=Math.sin(c.t*10);ctx.strokeStyle='#0a0a0e';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx-6,y-f*3);ctx.lineTo(sx,y+1);ctx.lineTo(sx+6,y-f*3);ctx.stroke()}}
    if(nA<.6)for(const g of lv.gnat){const[sx,sy0]=iso(g.x,g.y);if(!on(sx,sy0))continue;ctx.fillStyle=`rgba(20,20,16,${.75*(1-nA)})`;for(let k=0;k<11;k++){const q=g.ph+k*1.9;ctx.fillRect(Math.round(sx+Math.sin(t*(3+k*.37)+q)*9),Math.round(sy0-26+Math.cos(t*(2.3+k*.29)+q*1.4)*6),1,1)}}
    if(nA<.4)for(const b of lv.bee){const[sx,sy0]=iso(b.x,b.y);if(!on(sx,sy0))continue;for(let k=0;k<2;k++){const q=t*(2.2+k*.5)+b.ph+k*3,x=sx+Math.sin(q)*8,y=sy0-8+Math.sin(q*2)*3;ctx.fillStyle='#e8c030';ctx.fillRect(Math.round(x),Math.round(y),2,1);ctx.fillStyle='#1a1408';ctx.fillRect(Math.round(x)+1,Math.round(y),1,1);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(Math.round(x),Math.round(y)-1-(Math.sin(t*60)>0?1:0),1,1)}}}
  // moths circle the lights after dark
  if(nA>.4&&m.props)for(const p of m.props){if(Math.abs(p.x-P.x)>12||Math.abs(p.y-P.y)>12)continue;const L=propLight(p);if(!L||!L.col||p.k==='shaft')continue;const[sx,sy0]=iso(p.x,p.y);if(!on(sx,sy0))continue;const cy=sy0-(L.h||14)-6;
    for(let k=0;k<3;k++){const q=t*(1.6+k*.4)+k*2.1+(p.ph||0),x=sx+Math.cos(q)*(8+k*3),y=cy+Math.sin(q*1.7)*(5+k);ctx.fillStyle='rgba(232,224,200,.85)';const f=Math.sin(t*30+k)>0?2:1;ctx.fillRect(Math.round(x)-f,Math.round(y),f,1);ctx.fillRect(Math.round(x)+1,Math.round(y),f,1)}}
  for(const p of LV.peb){const[sx,sy0]=iso(p.x,p.y),sy=sy0-p.z*30;if(!on(sx,sy,20))continue;ctx.globalAlpha=Math.min(1,(2.4-p.t)/1.2);ctx.fillStyle=p.c;ctx.fillRect(Math.round(sx),Math.round(sy),Math.ceil(p.s),Math.ceil(p.s*.8))}
  ctx.globalAlpha=1;ctx.restore()}

// in the glow pass, over the dark: fireflies and the waking runes
const _drawFxGlowLV=drawFxGlow;drawFxGlow=function(){const m=G.map;if(m&&m.world)lvGlow(m);return _drawFxGlowLV()};
function lvGlow(m){const t=G.t;ctx.save();ctx.globalCompositeOperation='lighter';
  for(const f of LV.ffly){const[sx,sy0]=iso(f.x,f.y),sy=sy0-f.z*30;if(sx<-20||sx>W+20||sy<-20||sy>H+20)continue;const b=Math.pow(Math.max(0,Math.sin(t*1.4*f.sp+f.ph)),2)*Math.min(1,f.t,f.life-f.t)*Math.min(1,nightA()*1.6);if(b<.03)continue;
    ctx.globalAlpha=b;ctx.drawImage(glowSpr('#c8f878'),sx-9,sy-9,18,18);ctx.fillStyle='#f4ffd0';ctx.fillRect(Math.round(sx),Math.round(sy),1,1)}
  if(m.lv)for(const r of m.lv.rune){if(r.w<.02)continue;const[sx,sy]=iso(r.x,r.y);if(sx<-40||sx>W+40||sy<-80||sy>H+40)continue;const fl=.8+.2*Math.sin(t*3+r.x),c=LVS.glow[r.col][r.v];
    ctx.globalAlpha=r.w*fl;ctx.drawImage(c,sx-15,sy-49);ctx.globalAlpha=r.w*.35*fl;ctx.drawImage(glowSpr(r.col==='c'?'#7ae0ff':r.col==='g'?'#8affb0':'#b08aff'),sx-28,sy-58,56,56)}
  ctx.restore()}
