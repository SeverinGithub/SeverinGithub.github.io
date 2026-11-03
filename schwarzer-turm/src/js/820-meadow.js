/* ---------- the meadow: richer ground, and tufts of standing grass in every green and height that lean in the wind and part around whoever walks through ---------- */
// one wind for the whole world: slow swells running across the islands, stronger in the rain
function windAt(x,y){const t=G.t,s=.5+(G.wx&&(G.wx.k==='rain'||G.wx.k==='ash')?(G.wx.i||0)*.55:0);
  return(Math.sin(t*1.05+x*.29+y*.17)*.55+Math.sin(t*2.2-x*.21+y*.38)*.22+Math.sin(t*.33+(x+y)*.045)*.4+Math.max(0,Math.sin(t*.21+x*.02))*.35)*s}
// grass tufts: blades as folded two-tone facets, painted once per kind
const GTK=[
  {n:[6,9],h:[7,12],w:[1.1,1.6],c:['#4f9a1c','#6cbc22','#3f7f0d','#8ad040'],k:.9},
  {n:[8,12],h:[12,20],w:[1,1.4],c:['#3f8a18','#5aa820','#2e6a10','#7cc838'],k:1.1},
  {n:[5,8],h:[16,26],w:[.9,1.2],c:['#6a9a2a','#8ab83a','#4e7a1a','#a8cc58'],k:1.3},
  {n:[6,10],h:[9,15],w:[1,1.4],c:['#2e7a3a','#3e9a4a','#205a2a','#5ab868'],k:1},
  {n:[6,9],h:[10,17],w:[1,1.3],c:['#a8a040','#c8bc58','#867c2a','#e0d47a'],k:1.15},
  {n:[7,11],h:[6,10],w:[1.2,1.7],c:['#5aaa20','#7ac828','#448a14','#a0e050'],k:.8},
  {n:[5,7],h:[18,28],w:[.8,1.1],c:['#7a8a3a','#9aa84a','#5a6a28','#c0c870'],k:1.4,seed:1},
  {n:[6,9],h:[8,14],w:[1,1.4],c:['#3a8a2a','#58b03a','#2a6a1e','#88d060'],k:1,fl:['#f4e060','#ffffff','#e8483a','#a868e0','#f070a0','#4a8ae8']}];
let GTS=null;
function grassSprites(){GTS=[];const R=mulberry(9091);
  GTK.forEach((K,ki)=>{for(let v=0;v<5;v++){const n=Math.round(K.n[0]+R()*(K.n[1]-K.n[0])),bl=[];let top=0;
    for(let k=0;k<n;k++){const h=K.h[0]+R()*(K.h[1]-K.h[0]),bx=(R()-.5)*12,by=(R()-.5)*4,lean=(R()-.5)*h*.5+bx*.25;bl.push({h,bx,by,lean,w:K.w[0]+R()*(K.w[1]-K.w[0]),c:R()});top=Math.max(top,h)}
    bl.sort((a,b)=>a.by-b.by);const W=Math.ceil(36),Hh=Math.ceil(top+8),ax=W/2,ay=Hh-4;
    const c=mk(W,Hh,g=>{for(const b of bl){const x0=ax+b.bx,y0=ay+b.by,tx=x0+b.lean,ty=y0-b.h,mx=x0+b.lean*.35,my=y0-b.h*.55,col=K.c[b.c<.5?0:b.c<.8?1:2];
      const gl=g.createLinearGradient(0,y0,0,ty);gl.addColorStop(0,shade(col,.62));gl.addColorStop(.6,col);gl.addColorStop(1,shade(K.c[3],b.c<.5?1:.95));
      g.fillStyle=gl;g.beginPath();g.moveTo(x0-b.w,y0);g.lineTo(mx-b.w*.55,my);g.lineTo(tx,ty);g.lineTo(mx,my+.6);g.lineTo(x0,y0);g.closePath();g.fill();
      const gd=g.createLinearGradient(0,y0,0,ty);gd.addColorStop(0,shade(col,.45));gd.addColorStop(.6,shade(col,.74));gd.addColorStop(1,shade(col,.92));
      g.fillStyle=gd;g.beginPath();g.moveTo(x0,y0);g.lineTo(mx,my+.6);g.lineTo(tx,ty);g.lineTo(mx+b.w*.5,my);g.lineTo(x0+b.w,y0);g.closePath();g.fill()}
      if(K.fl)for(let k=0;k<2+(R()*2|0);k++){const b=bl[R()*bl.length|0],x=ax+b.bx+b.lean,y=ay+b.by-b.h-1,fc=K.fl[R()*K.fl.length|0];
        for(let p=0;p<5;p++){const a0=p*1.2566+R(),a1=a0+1.2566;g.fillStyle=shade(fc,Math.sin(a0+.6)<0?1.06:.78);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a0)*2.4,y+Math.sin(a0)*1.7);g.lineTo(x+Math.cos(a1)*2.4,y+Math.sin(a1)*1.7);g.fill()}
        g.fillStyle='#fff0a0';g.fillRect(Math.round(x)-.5,Math.round(y)-.5,1,1)}});
    c.ax=ax;c.ay=ay;c.k=K.k;c.ki=ki;GTS.push(c)}})}
const gh=(a,b,c)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul(c+1,2246822519);h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0};
// where grass may stand: open meadow, not under things
function grassy(m,i,j){const t=m.t[j*m.w+i];return t===4||(t===9&&m.under&&m.under[j*m.w+i]===4)}
function grassOcc(m){const sig=(m.objs?m.objs.length:0)+'|'+(m.props?m.props.length:0)+'|'+(m.blocks?m.blocks.length:0);if(m._goS===sig)return m._go;
  const o=new Set(),add=(x,y,r)=>{for(let i=Math.floor(x-r);i<=Math.floor(x+r);i++)for(let j=Math.floor(y-r);j<=Math.floor(y+r);j++)o.add(i*100003+j)};
  for(const q of m.objs||[])add(q.x,q.y,q.type==='chest'?.4:.9);for(const p of m.props||[])add(p.x,p.y,p.k==='ydflower'?1:.5);for(const b of m.blocks||[])add(b.i+.5,b.j+.5,b.big?1.4:.8);
  if(m.tower)add(m.tower.x,m.tower.y,4);m._goS=sig;return m._go=o}
// the meadow's mood: lusher, drier and sunnier patches that run over many tiles
const meadow=(i,j)=>Math.sin(i*.19+j*.07)+Math.sin(i*.05-j*.23+2.1)*.8+Math.sin((i+j)*.11+4)*.6;
function grassTufts(m,i0,i1,j0,j1){const occ=grassOcc(m),out=[];
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(!grassy(m,i,j)||occ.has(i*100003+j))continue;const md=meadow(i,j),h=gh(i,j,77),n=md>1?3:md>.2?2:md>-.8?1:(h%3===0?1:0);
    for(let k=0;k<n;k++){const r=gh(i,j,k*31+5),x=i+((r&1023)/1023),y=j+(((r>>>10)&1023)/1023);
      let kind=md>1.3?(r>>>20)%3===0?2:1:md<-.6?(r>>>20)%2?4:0:((r>>>20)%8);if((r>>>23)%9===0)kind=7;if(md>.3&&md<.9&&(r>>>24)%5===0)kind=6;if(md<-1.1)kind=5;
      out.push({k:'gt',x,y,s:GTS[kind*5+((r>>>26)%5)],ph:(r%628)/100})}}
  return out}
function drawTuft(c){const s=c.s,[sx,sy]=iso(c.x,c.y);if(sx<-30||sx>W+30||sy<-40||sy>H+30)return;
  let k=windAt(c.x,c.y)*.32*s.k+Math.sin(G.t*3.1+c.ph)*.04,sq=1;
  // walkers part the grass: it leans away and is trodden flat for a moment
  const push=(x,y,r)=>{const dx=c.x-x,dy=c.y-y,d=hyp(dx,dy);if(d<r){const f=1-d/r,sd=(dx-dy)>=0?1:-1;k+=sd*f*.85;sq=Math.min(sq,1-f*.45)}};
  if(P)push(P.x,P.y,1.1);if(G.state==='play'&&G.map)for(const e of G.map.enemies)if(!e.dead&&Math.abs(e.x-c.x)<1.4&&Math.abs(e.y-c.y)<1.4)push(e.x,e.y,.9+(e.r||.3));
  for(const r of mpVis())if(Math.abs(r.x-c.x)<1.2&&Math.abs(r.y-c.y)<1.2)push(r.x,r.y,1.1);
  ctx.save();ctx.translate(Math.round(sx),Math.round(sy));ctx.transform(1,0,-k,sq,0,0);ctx.drawImage(s,-s.ax,-s.ay);ctx.restore()}
const _drawCritterGT=drawCritter;drawCritter=function(c){if(c.k==='gt')return drawTuft(c);return _drawCritterGT(c)};
// the tufts in view join the sorted drawing for one frame, so the hero walks behind and through them
const _renderGT=render;render=function(){const m=G.map;if(!m||!m.world)return _renderGT();if(!GTS)grassSprites();
  const c1=scr2w(0,0),c2=scr2w(W,0),c3=scr2w(0,H+80),c4=scr2w(W,H+80),i0=Math.max(1,Math.floor(Math.min(c1[0],c3[0]))-1),i1=Math.min(m.w-2,Math.ceil(Math.max(c2[0],c4[0]))+1),
    j0=Math.max(1,Math.floor(Math.min(c1[1],c2[1]))-1),j1=Math.min(m.h-2,Math.ceil(Math.max(c3[1],c4[1]))+1),add=grassTufts(m,i0,i1,j0,j1),had=!!m.crit,base=m.crit||(m.crit=[]),n=base.length;
  for(const t of add)base.push(t);try{return _renderGT()}finally{base.length=n;if(!had&&!n)delete m.crit}};
// richer ground: the tiles get soft blotches and finer blades, and the meadow's mood tints them across many tiles
const GDK=[];
function groundSprites(){const R=mulberry(4711);const greens=['#6dbb1c','#76c522','#66b31a','#71bf20','#6ab71d','#7bc928'];
  for(let v=0;v<6;v++)SPR.grass[v]=mk(64,32,g=>{dia(g);g.fillStyle=greens[v];g.fill();g.save();g.clip();
    for(let k=0;k<7;k++){g.fillStyle=R()<.5?'rgba(40,90,10,.22)':'rgba(170,220,80,.18)';g.beginPath();g.ellipse(R()*64,R()*32,4+R()*10,2+R()*5,0,0,7);g.fill()}
    for(let k=0;k<90;k++){const x=R()*64,y=R()*32,c=R();g.strokeStyle=c<.4?'#3f7f0d':c<.7?'#a6e64e':c<.85?'#5a9a1a':'#c8f070';g.globalAlpha=.55+R()*.3;g.lineWidth=R()<.3?1.4:1;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*3,y-1.5-R()*4);g.stroke()}
    g.globalAlpha=1;for(let k=0;k<26;k++){g.fillStyle=['#1a2a08','#d8f59a','#2a4a10','#e8f8b0'][k%4];g.fillRect(R()*64|0,R()*32|0,1,1)}g.restore()});
  const S=(w,h,f)=>{const c=mk(w,h,f);GDK.push(c);return c},el=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill()};
  for(let v=0;v<3;v++)S(30,16,g=>{for(let k=0;k<9;k++){const x=6+R()*18,y=4+R()*8;for(let l=0;l<3;l++){const a=l*2.09+R();el(g,x+Math.cos(a)*1.6,y+Math.sin(a)*.9,1.7,1.1,l%2?'#4a9a22':'#5aae2a')}g.fillStyle='#2e6a10';g.fillRect(x|0,y|0,1,1)}});
  for(let v=0;v<3;v++)S(26,14,g=>{for(let k=0;k<6;k++){const x=4+R()*18,y=3+R()*8,r=.9+R()*1.4;el(g,x,y+.6,r+.4,r*.6+.3,'rgba(20,16,10,.6)');el(g,x,y,r,r*.62,['#8a8274','#a0988a','#6e675c'][k%3]);g.fillStyle='rgba(255,255,240,.5)';g.fillRect(x-r*.4|0,y-r*.3|0,1,1)}});
  for(let v=0;v<2;v++)S(36,18,g=>{for(let k=0;k<5;k++)el(g,18+(R()-.5)*16,9+(R()-.5)*7,4+R()*5,2+R()*2.5,'rgba(96,70,36,.45)');for(let k=0;k<14;k++){g.fillStyle=['#7a5a30','#5a4020','#9a7a48'][k%3];g.fillRect(6+R()*24|0,4+R()*10|0,1,1)}});
  for(let v=0;v<2;v++)S(28,14,g=>{for(let k=0;k<7;k++){const x=4+R()*20,y=3+R()*8;g.strokeStyle='#3a7a18';g.lineWidth=1;g.beginPath();g.moveTo(x,y+2);g.lineTo(x,y);g.stroke();
    for(let p=0;p<5;p++){const a=p*1.2566;el(g,x+Math.cos(a)*1.3,y+Math.sin(a)*.7,1,.6,'#f8f6ec')}el(g,x,y,.8,.6,'#f4c830')}});
  for(let v=0;v<2;v++)S(30,16,g=>{for(let k=0;k<10;k++){const x=5+R()*20,y=3+R()*10,a=R()*3.14;g.fillStyle=['#b8762a','#d89a3a','#8a5a1a','#c8682a'][k%4];g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(-2.4,0);g.lineTo(0,-1);g.lineTo(2.4,0);g.lineTo(0,1);g.closePath();g.fill();g.restore()}})}
const _drawDecalsGT=drawDecals;drawDecals=function(){const m=G.map;if(m&&m.world){if(!GDK.length)groundSprites();
  const c1=scr2w(0,0),c2=scr2w(W,0),c3=scr2w(0,H+40),c4=scr2w(W,H+40),i0=Math.max(0,Math.floor(Math.min(c1[0],c3[0]))-1),i1=Math.min(m.w-1,Math.ceil(Math.max(c2[0],c4[0]))+1),
    j0=Math.max(0,Math.floor(Math.min(c1[1],c2[1]))-1),j1=Math.min(m.h-1,Math.ceil(Math.max(c3[1],c4[1]))+1);
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){if(!grassy(m,i,j))continue;const[sx,sy]=iso(i,j);if(sx<-40||sx>W+40||sy<-40||sy>H+40)continue;
    const md=meadow(i,j)+Math.sin(i*.6+j*.9)*.25,a=Math.min(.16,Math.abs(md)*.07);if(a>.02){ctx.fillStyle=md>0?`rgba(20,70,10,${a.toFixed(3)})`:`rgba(210,190,70,${(a*.9).toFixed(3)})`;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+32,sy+16);ctx.lineTo(sx,sy+32);ctx.lineTo(sx-32,sy+16);ctx.closePath();ctx.fill()}
    const h=gh(i,j,404);if(h%5===0){const c=GDK[(h>>>8)%GDK.length],[dx,dy]=iso(i+((h>>>12)&255)/300+.08,j+((h>>>20)&255)/300+.08);ctx.drawImage(c,Math.round(dx-c.width/2),Math.round(dy-c.height/2))}}}
  return _drawDecalsGT()};
// great islands: some 2×2 blocks of chunks carry one island up to six times the smallest, some pairs of chunks a long one.
// every chunk of it answers with the same island; the first chunk is its leader and gets the fire and the trader
const BIGK=[['wild',26],['forest',20],['village',18],['ruins',14],['grave',10],['camp',12]];
function bigIsland(cx,cy){const bx=cx>>1,by=cy>>1,x0=bx*2,y0=by*2;
  for(let a=0;a<2;a++)for(let b=0;b<2;b++){const X=x0+a,Y=y0+b;if(X<2||Y<2||X>=WS/CH-2||Y>=WS/CH-2||isHomeC(X,Y)||wbChunks().has(X+','+Y)||Math.hypot(X-40,Y-39.5)<3.4)return null}
  const h=hsh(bx,by,31),kindOf=s=>{let k=hsh(bx,by,s)*100;for(const[n,w]of BIGK){if(k<w)return n;k-=w}return'wild'};
  if(h<.13){const x=(x0+1)*CH+Math.round((hsh(bx,by,33)-.5)*6),y=(y0+1)*CH+Math.round((hsh(bx,by,34)-.5)*6),r=15+hsh(bx,by,35)*4.6;
    return{x:x+.5,y:y+.5,r,kind:kindOf(36),cx:x0,cy:y0,dist:Math.hypot(x0+.5-40,y0+.5-39.5),big:'mega',sx:1,sy:1,chunks:[[x0,y0],[x0+1,y0],[x0,y0+1],[x0+1,y0+1]]}}
  if(h<.36){const p=Math.floor(hsh(bx,by,37)*4),hor=p<2,ch=hor?[[x0,y0+p],[x0+1,y0+p]]:[[x0+p-2,y0],[x0+p-2,y0+1]];if(!ch.some(([a,b])=>a===cx&&b===cy))return null;
    const r=8+hsh(bx,by,38)*2,x=hor?(x0+1)*CH+Math.round((hsh(bx,by,39)-.5)*4):ch[0][0]*CH+16+Math.round((hsh(bx,by,39)-.5)*4),y=hor?ch[0][1]*CH+16+Math.round((hsh(bx,by,40)-.5)*4):(y0+1)*CH+Math.round((hsh(bx,by,40)-.5)*4);
    return{x:x+.5,y:y+.5,r,kind:kindOf(41),cx:ch[0][0],cy:ch[0][1],dist:Math.hypot(ch[0][0]-40,ch[0][1]-39.5),big:'long',sx:hor?1.75:1,sy:hor?1:1.75,chunks:ch}}
  return null}
const sameIsl=(A,B)=>A&&B&&A.big&&B.big&&A.cx===B.cx&&A.cy===B.cy;
// bridges come in three kinds: the old stone one, a narrow plank bridge on rope posts, and a natural land bridge of earth and grass
function bridgeKind(ax,ay,bx,by){const A=islandOf(ax,ay),B=islandOf(bx,by);if(A&&A.kind==='home'||B&&B.kind==='home')return'stone';const h=hsh(ax*3+bx,ay*3+by,43);return h<.4?'stone':h<.72?'wood':'land'}
// planks across the way, posts with a sagging rope, and an underside of beams
function bridgeSprites(){const plank=(dir,v)=>mk(64,32,g=>{const R=mulberry(300+v*7+dir*3);g.save();g.beginPath();g.moveTo(32,0);g.lineTo(64,16);g.lineTo(32,32);g.lineTo(0,16);g.closePath();g.clip();
    g.fillStyle='#1a120a';g.fillRect(0,0,64,32);const n=6;
    for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n-.03,base=['#7a5430','#8a6038','#6a4828'][Math.floor(R()*3)],P=(u,w)=>dir?[(u-w)*32+32,(u+w)*16]:[(w-u)*32+32,(w+u)*16];
      if(R()<.08&&v===2)continue;const q=[P(a,0),P(b,0),P(b,1),P(a,1)];g.fillStyle=base;g.beginPath();q.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();
      g.strokeStyle='rgba(255,230,190,.12)';g.lineWidth=.7;g.beginPath();g.moveTo(...q[0]);g.lineTo(...q[3]);g.stroke();
      g.fillStyle='rgba(30,20,10,.5)';for(let s=0;s<4;s++){const[x,y]=P(a+R()*(b-a),R());g.fillRect(x|0,y|0,1,1)}
      g.fillStyle='#2a2a2e';for(const w of[.12,.88]){const[x,y]=P((a+b)/2,w);g.fillRect(x|0,y|0,1,1)}}
    g.restore()});
  SPR.bridgeW=[[0,1,2].map(v=>plank(0,v)),[0,1,2].map(v=>plank(1,v))];
  // the post: a squared log, its rope sagging to the next post along the bridge
  const post=dir=>{let P0;const c=lpBake(M=>{M.box(-1.6,-1.6,0,1.6,1.6,15,'#6a4626',{sp:.4});M.box(-2,-2,13.5,2,2,15.5,'#4a3018')},3),W2=c.width+134,H2=c.height+46,out=mk(W2,H2,g=>{const ox=dir?128:6,oy=8;g.drawImage(c,ox,oy);
      const ax=ox+c.ax,ay=oy+c.ay-13,bx=ax+(dir?-64:64),by=ay+32;g.strokeStyle='#8a7a58';g.lineWidth=1;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo((ax+bx)/2,(ay+by)/2+12,bx,by);g.stroke();
      g.strokeStyle='rgba(40,30,20,.6)';g.lineWidth=.5;g.beginPath();g.moveTo(ax,ay+.8);g.quadraticCurveTo((ax+bx)/2,(ay+by)/2+12.8,bx,by+.8);g.stroke();P0=[ox+c.ax,oy+c.ay]});out.ax=P0[0];out.ay=P0[1];return out};
  SPR.prop.ropepost=[post(0),post(1)];
  // underneath: the plank ends, two beams and a few hanging ropes
  const side=left=>mk(64,32+60,g=>{const P=(u,d)=>left?[u*32,16+u*16+d]:[32+u*32,32-u*16+d];const q=[P(0,0),P(1,0),P(1,3),P(0,3)];
    g.fillStyle=left?'#5a3c20':'#3a2614';g.beginPath();q.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.35)';for(let k=1;k<6;k++){const[x,y]=P(k/6,0);g.fillRect(x|0,y|0,1,3)}
    for(const u of[.25,.75]){const[a,b]=P(u,3),[c2,d]=P(u+(left?.12:-.12),16);g.strokeStyle=left?'#4a3018':'#2e1e10';g.lineWidth=2;g.beginPath();g.moveTo(a,b);g.lineTo(c2,d);g.stroke()}
    const R=mulberry(left?5:9);for(let k=0;k<3;k++){const[x,y]=P(.1+R()*.8,3);g.strokeStyle='#8a7a58';g.lineWidth=.7;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+2,y+8,x+R()*3-1,y+10+R()*14);g.stroke()}});
  SPR.bridgeSideW=[side(true),side(false)]}
const _buildEnvB=buildEnvSprites;buildEnvSprites=function(){_buildEnvB();bridgeSprites()};

