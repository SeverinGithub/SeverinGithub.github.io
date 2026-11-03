/* ---------- the smithy in low poly: a stone hearth under a hood, bellows worked by a pole, an anvil on its block, a quench trough.
   Brannoc keeps a round of twelve seconds: he heats the bar and works the bellows, carries it over, hammers it out and turns it,
   quenches it in a cloud of steam and holds it up to the light, then walks back to the fire ---------- */
const SMC=12,SMA=[-10,6],SMF=[36,-16],SMT=[-50,-6],SMS={forge:[0,-4],anvil:[-14,-4],trough:[-30,-4]};
const smE=x=>{x=clamp(x,0,1);return x*x*(3-2*x)},smL=(a,b,q)=>[a[0]+(b[0]-a[0])*q,a[1]+(b[1]-a[1])*q];
// a point on screen relative to the smith (dy is where it shows, h how high it floats) back in the world
const smW=(o,dx,dy,h=0)=>{const u=dx/32,v=(dy+h)/16;return{x:o.x+(u+v)/2,y:o.y+(v-u)/2,z:h/30}};
// where he stands and what he does at time t of his round
function smithPose(t){const p={ph:'forge',pos:SMS.forge,f:1,mv:0,heat:0,pull:0,blow:0,q:0,s:-1,dip:0,look:0,carry:0};
  if(t<2.6){const q=t/.85%1;p.heat=smE(t/2.4);p.pull=q<.3?smE(q/.3):1-smE((q-.3)/.7);p.blow=q>.3?Math.sin((q-.3)/.7*Math.PI):0}
  else if(t<3.3){Object.assign(p,{ph:'walk',pos:smL(SMS.forge,SMS.anvil,smE((t-2.6)/.7)),f:-1,mv:1,heat:1,carry:1})}
  else if(t<7.5){const k=(t-3.3)/.7;Object.assign(p,{ph:'anvil',pos:SMS.anvil,heat:1-.55*(t-3.3)/4.2,s:Math.floor(k),q:k%1})}
  else if(t<8.1){Object.assign(p,{ph:'walk',pos:smL(SMS.anvil,SMS.trough,smE((t-7.5)/.6)),f:-1,mv:1,heat:.45,carry:1})}
  else if(t<9.5){const q=(t-8.1)/1.4;Object.assign(p,{ph:'quench',pos:SMS.trough,f:-1,q,dip:q<.2?smE(q/.2):q>.8?1-smE((q-.8)/.2):1,heat:q<.2?.45:.45*(1-smE((q-.2)/.35))})}
  else if(t<10.6){const q=(t-9.5)/1.1;Object.assign(p,{ph:'look',pos:SMS.trough,f:-1,q,look:q<.25?smE(q/.25):q>.8?1-smE((q-.8)/.2):1})}
  else if(t<11.6){Object.assign(p,{ph:'walk',pos:smL(SMS.trough,SMS.forge,smE((t-10.6)/1)),f:1,mv:1,carry:1})}
  return p}
// the hammer's swing at q of one blow: lifted slow, brought down hard, a small bounce off the bar; [hand, head]
function smithSwing(q){const R=[[12,-50],[2,-57]],S=[[11,-21],[5,-10]],Z=[[11,-25],[6,-15]];let a,b,e;
  if(q<.5){a=Z;b=R;e=smE(q/.5)}else if(q<.62){a=R;b=S;e=Math.pow((q-.5)/.12,2)}else if(q<.76){a=S;b=Z;e=Math.sin((q-.62)/.14*Math.PI/2)}else{a=Z;b=Z;e=0}
  const h=smL(a[0],b[0],e),d=smL(a[1],b[1],e),arc=q>=.5&&q<.62||q<.5?Math.sin(e*Math.PI)*7:0;return[[h[0]+arc*.4,h[1]],[d[0]+arc,d[1]]]}
const SMH=t=>t>.85?'#fff4d0':t>.7?'#ffd070':t>.5?'#ff9a30':t>.3?'#e0561a':t>.12?'#8a2a10':'#5e626c';
function smithMesh(){if(LPA.smF)return;const R=mulberry(77),ST=['#5a5650','#4e4a45','#66615a'],WD='#6a4626';
  LPA.smF=lpBake(M=>{
    // the coal pit first, then the stone that hides its lower part
    M.face([[-9,-7,11],[9,-7,11],[9,7,11],[-9,7,11]],'#140a06',{n:[0,0,1]});
    M.face([[-9,-7,11],[9,-7,11],[9,-7,15],[-9,-7,15]],'#3a2a22',{n:[0,1,0]});M.face([[-9,-7,11],[-9,7,11],[-9,7,15],[-9,-7,15]],'#3a2a22',{n:[1,0,0]});
    M.box(-14,-12,0,14,12,2,'#3e3a36',{noTop:1});M.box(-13,-11,2,13,11,15,ST[0],{noTop:1,sp:.5,sw:1});
    for(let k=0;k<6;k++){const y=-9+k*3.6;M.box(13,y,3+(k%2)*5,13.4,y+3,6+(k%2)*5,ST[k%3])}
    for(let k=0;k<7;k++){const x=-11+k*3.4;M.box(x,11,4+(k%2)*5,x+3,11.4,7+(k%2)*5,ST[(k+1)%3])}
    const rim='#76706a';M.face([[-13,-11,15],[13,-11,15],[9,-7,15],[-9,-7,15]],rim,{n:[0,0,1]});M.face([[13,-11,15],[13,11,15],[9,7,15],[9,-7,15]],rim,{n:[0,0,1]});
    M.face([[-13,11,15],[13,11,15],[9,7,15],[-9,7,15]],rim,{n:[0,0,1]});M.face([[-13,-11,15],[-13,11,15],[-9,7,15],[-9,-7,15]],rim,{n:[0,0,1]});
    // back wall and corner posts carrying the hood, then the hood and the chimney
    M.box(-13,-12,15,13,-9,33,ST[1],{sp:.4,sw:1});
    for(const[x,y]of[[-13,11],[13,-11]])M.box(x-1.3,y-1.3,15,x+1.3,y+1.3,33,WD,{sp:.3});
    const hb=[[-15,-13],[15,-13],[15,13],[-15,13]],ht=[[-6,-10],[6,-10],[6,2],[-6,2]],HC='#2e2b28';
    for(let k=0;k<4;k++){const a=hb[k],b=hb[(k+1)%4],c=ht[(k+1)%4],d=ht[k];M.face([[a[0],a[1],32],[b[0],b[1],32],[c[0],c[1],44],[d[0],d[1],44]],HC,{c:[0,-4,36],sp:.3})}
    M.box(-15,-13,31,15,13,33,'#5a3a1e',{noTop:1});
    M.box(-6,-10,44,6,2,74,'#3a3632',{sp:.5,sw:1});M.box(-7,-11,72,7,3,76,'#4a4540');
    // a tub of coal and a rack of bars by the wall
    M.box(-12,-24,0,-2,-15,7,WD,{sp:.3});for(let k=0;k<9;k++)M.ball(-10.5+R()*7,-22.5+R()*6,7+R()*1.2,1.4+R()*.6,5,'#1c1a1a',{m:2,rz:.7});
    M.box(16,-12,0,18,-10,20,WD);M.box(16,10,0,18,12,20,WD);M.box(16,-12,17,18,12,19,WD);
    for(let k=0;k<5;k++){const y=-9+k*4.2;M.box(16.4,y,1,17.6,y+.9,17,k%2?'#5e626c':'#4b4f59')}
  });
  LPA.smA=lpBake(M=>{lpStump(M,0,0,7.5,8,R);lpAnvil(M,0,0,8,.8)});
  // the trough: inner walls, water, then the planks that face you
  LPA.smT=lpBake(M=>{M.face([[-10.5,-3.5,6.5],[10.5,-3.5,6.5],[10.5,-3.5,8],[-10.5,-3.5,8]],'#4a3018',{n:[0,1,0]});M.face([[-10.5,-3.5,6.5],[-10.5,3.5,6.5],[-10.5,3.5,8],[-10.5,-3.5,8]],'#4a3018',{n:[1,0,0]});
    M.face([[-10.5,-3.5,6.5],[10.5,-3.5,6.5],[10.5,3.5,6.5],[-10.5,3.5,6.5]],'#2c4c5c',{n:[0,0,1],bm:1.1});
    M.box(-12,-5,0,12,5,8,'#6a4626',{noTop:1,sp:.4});for(const x of[-12.3,11.5])M.box(x,-5.3,0,x+.8,5.3,8.3,'#3e2a16');
    const e=1.5,rim='#7a5430';M.face([[-12,-5,8],[12,-5,8],[10.5,-3.5,8],[-10.5,-3.5,8]],rim,{n:[0,0,1]});M.face([[12,-5,8],[12,5,8],[10.5,3.5,8],[10.5,-3.5,8]],rim,{n:[0,0,1]});
    M.face([[-12,5,8],[12,5,8],[10.5,3.5,8],[-10.5,3.5,8]],rim,{n:[0,0,1]});M.face([[-12,-5,8],[-12,5,8],[-10.5,3.5,8],[-10.5,-3.5,8]],rim,{n:[0,0,1]})})}
// the bellows on their stand, the top board hinged at the nozzle; lift 0..1
function smBellows(M,lift){const WD='#6a4626',LE='#3a2414',a=.05+lift*.32,hz=6.2,top=M2=>M.with(lpRx(a,13,hz),M2);
  M.box(-11,13,0,3,22,5,WD,{sp:.3});M.box(-5.2,9,5.6,-2.8,13,7.2,'#4b4f59');
  const board=z=>[[-6,13,z],[-2,13,z],[2,22,z],[-10,22,z]];
  // leather between the boards: each side a fan of two folds
  const t=p=>{const q=lpRx(a,13,hz)(p);return q},b0=board(5.6),b1=board(6.6).map(t);
  M.face([b0[2],b0[3],b1[3],b1[2]],LE,{n:[0,1,0]});
  for(const[i,j]of[[1,2],[3,0]]){const m0=[(b0[i][0]+b0[j][0])/2,(b0[i][1]+b0[j][1])/2,b0[i][2]],m1=[(b1[i][0]+b1[j][0])/2,(b1[i][1]+b1[j][1])/2,(b1[i][2]+b1[j][2])/2],out=i===1?1.6:-1.6,mid=[(m0[0]+m1[0])/2+out*(1-lift*.6),(m0[1]+m1[1])/2,(m0[2]+m1[2])/2];
    M.face([b0[i],b0[j],mid],LE,{n:[out,0,0]});M.face([b1[i],b1[j],mid],'#4a2e18',{n:[out,0,0]});M.face([b0[i],mid,b1[i]],LE,{n:[out,0,0]});M.face([b0[j],mid,b1[j]],'#2e1c0e',{n:[out,0,0]})}
  M.face(board(5.6),'#5a3a1e',{n:[0,0,1]});top(()=>{M.box(-10,13,6.6,2,22,7.8,WD,{sp:.3});M.face([[-10,13,7.8],[2,13,7.8],[2,22,7.8],[-10,22,7.8]],'#7a5430',{n:[0,0,1]})})}
function drawSmith(o){const[sx,sy]=iso(o.x,o.y);if(sx<-140||sx>W+140||sy<-160||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o,t=(G.t+(o.off||0))%SMC;
  smithMesh();const p=smithPose(t),fl=.75+Math.sin(G.t*7)*.12+Math.sin(G.t*13)*.08,hot=fl+p.blow*.5,B=[sx+p.pos[0],sy+p.pos[1]],dr=(c,x,y)=>ctx.drawImage(c,Math.round(x-c.ax),Math.round(y-c.ay));
  shadow(sx+SMF[0],sy+SMF[1]+2,.75);shadow(sx+SMT[0],sy+SMT[1]+1,.45);dr(LPA.smT,sx+SMT[0],sy+SMT[1]);dr(LPA.smF,sx+SMF[0],sy+SMF[1]);
  // the coals, clipped to the mouth of the pit, and the flames above them
  const fx=sx+SMF[0],fy=sy+SMF[1],pit=[[-9,-7],[9,-7],[9,7],[-9,7]].map(([x,y])=>[fx+x-y,fy+(x+y)/2-15]);
  ctx.save();ctx.beginPath();pit.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();
  const q=ctx.createRadialGradient(fx,fy-13,1,fx,fy-13,18);q.addColorStop(0,`rgba(255,${200+p.blow*50|0},120,${Math.min(1,hot)})`);q.addColorStop(.55,`rgba(240,90,20,${hot*.8})`);q.addColorStop(1,'rgba(90,20,0,.9)');ctx.fillStyle=q;ctx.fillRect(fx-20,fy-28,40,24);
  const CR=mulberry(5);for(let k=0;k<26;k++){const x=-8+CR()*16,y=-6+CR()*12,cx=fx+x-y,cy=fy+(x+y)/2-13-CR()*1.5,r=1.4+CR()*1.3,w=Math.sin(G.t*(2+CR()*3)+k)*.5+.5,h=w*hot;
    ctx.fillStyle=h>1?'#fff0b0':h>.75?'#ffc050':h>.45?'#f07020':'#6a1a08';ctx.beginPath();ctx.moveTo(cx-r,cy);ctx.lineTo(cx-r*.3,cy-r*.7);ctx.lineTo(cx+r,cy-r*.3);ctx.lineTo(cx+r*.4,cy+r*.6);ctx.closePath();ctx.fill()}
  ctx.restore();
  ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<5;k++){const x=fx-10+k*5+Math.sin(G.t*9+k)*1.5,h=(5+Math.sin(G.t*11+k*2.3)*2.5)*(1+p.blow*1.4),y=fy-15+Math.abs(k-2);
    ctx.fillStyle=k%2?'rgba(255,170,60,.55)':'rgba(255,110,30,.5)';ctx.beginPath();ctx.moveTo(x-2.4,y);ctx.lineTo(x+Math.sin(G.t*13+k)*1.5,y-h);ctx.lineTo(x+2.4,y);ctx.closePath();ctx.fill()}
  const hg=ctx.createRadialGradient(fx,fy-20,0,fx,fy-20,34);hg.addColorStop(0,`rgba(255,120,40,${.22*hot})`);hg.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=hg;ctx.fillRect(fx-34,fy-54,68,68);ctx.restore();
  // bellows: lifted while he pulls the pole up, let fall to blow
  lpDraw(M=>smBellows(M,p.ph==='forge'?p.pull:0),fx,fy);
  const ba=.05+(p.ph==='forge'?p.pull:0)*.32,pole0=[fx-25.5,fy+8.75-(6.2+8.5*Math.sin(ba)+1.6*Math.cos(ba))];
  // Brannoc
  shadow(B[0],B[1],.5);
  const LEA=['#1e1208','#3e2614','#5e3c20','#7a5230'],BRD=['#140a04','#3a2412','#5a3a1e','#74502c'],f=p.f;
  const R={skin:RP.skin,torso:LEA,sleeve:RP.skin,fore:RP.skin,hand:RP.skin,legs:RP.pants,shin:RP.pants,feet:RP.shoe,belt:RP.shoe,buckle:RP.iron,metal:{}};
  // hands: [the one on f's side, the other]; the tongs and the hammer hang off them
  let hands=[null,null],tong=null,ham=null,pole=null,bar=null;
  const bob=p.mv?Math.abs(Math.cos(G.t*9))*1.2:0;
  if(p.ph==='forge'){const st=Math.sin(G.t*2.3)*1.2;hands=[[12+st,-24],[-6,-26-p.pull*8]];tong={h:0,j:[30+st*.6,-26],d:[1,.12],L:7};pole={h:1}}
  else if(p.mv){hands=[[f*11,-25+bob],null];tong={h:0,j:[f*22,-27+bob],d:[f,0],L:9}}
  else if(p.ph==='anvil'){const[hh,hd]=smithSwing(p.q),fq=p.s===2?smE((p.q-.8)/.2):p.s===3?1-smE(p.q/.2):0;
    hands=[hh,[-8,-17-fq*2]];ham={h:0,d:hd};tong={h:1,j:[-1,-9-fq*3],d:[1,-.1-fq*.6],L:10-fq*4}}
  else if(p.ph==='quench'){const h=smL([-12,-26],[-16,-16],p.dip),sh=p.dip>.9?Math.sin(G.t*40)*.4:0;hands=[[h[0]+sh,h[1]],null];tong={h:0,j:[h[0]-4+sh,h[1]+9],d:[-.12,1],L:9,water:sy+SMT[1]-6.5-B[1]}}
  else if(p.ph==='look'){const h=smL([-12,-26],[-9,-41],p.look);hands=[h,[5,-26+p.look*2]];tong={h:0,j:[h[0]-1.5,h[1]-6],d:[-.35,-1],L:9}}
  else{hands=[[12,-24],[-6,-26]];tong={h:0,j:[30,-26],d:[1,.12],L:7};pole={h:1}}
  const head=(hx,hy)=>{const lx=p.look*-1,ly=p.look*.6;hx+=lx;hy+=ly;
    blob(hx,hy,4.4,4.8,RP.skin);ctx.fillStyle='rgba(255,236,210,.35)';ctx.beginPath();ctx.ellipse(hx-1.4,hy-3,1.6,1,0,0,7);ctx.fill();
    for(const sd of[-1,1])blob(hx+sd*4.3,hy+.6,1,1.5,RP.skin);
    poly([[hx-4.3,hy+.4],[hx+4.3,hy+.4],[hx+3.4,hy+5.6],[hx+f*.6,hy+8.6],[hx-3.4,hy+5.6]],BRD);
    limb(hx-2.6+f*.7,hy+1.6,hx+2.6+f*.7,hy+1.6,.9,.9,BRD);ctx.fillStyle='#d4a484';ctx.fillRect(hx-1+f*.7,hy+2.4,2,.8);
    ctx.fillStyle='#140c06';ctx.fillRect(hx-2.4+f*.8,hy-.6,1.2,1);ctx.fillRect(hx+1+f*.8,hy-.6,1.2,1);ctx.fillStyle=BRD[1];ctx.fillRect(hx-2.8+f*.8,hy-2,2,.7);ctx.fillRect(hx+.8+f*.8,hy-2,2,.7)};
  const apron=(shX,shY,hx,hy)=>{poly([[hx-6.4,hy-1],[hx+6.4,hy-1],[hx+5.6,hy+13],[hx-5.6,hy+13]],LEA);ctx.fillStyle=LEA[0];ctx.fillRect(hx-3,hy+4,6,.7);
    for(const sd of[-1,1])limb(shX+sd*5,shY+.5,shX+sd*4,shY+6,.6,.6,LEA)};
  const o2={R,f,back:false,moving:!!p.mv,ph:G.t*9,tw:1.28,lw:1.3,hunch:p.ph==='anvil'?1.5:p.ph==='quench'?2.5*p.dip:0,armsLate:true,hands,aL:10,head,torsoFx:apron,stride:.8};
  ctx.save();ctx.translate(B[0],B[1]);humanoid(o2);ctx.restore();
  // the anvil in front of his legs, and the hammer lying on it while he is away
  shadow(sx+SMA[0],sy+SMA[1],.4);dr(LPA.smA,sx+SMA[0],sy+SMA[1]);
  const gl=Math.max(0,G.smithHit||0);if(gl>0){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx-9,sy-13,0,sx-9,sy-13,14);g.addColorStop(0,`rgba(255,220,140,${gl*2})`);g.addColorStop(1,'rgba(255,120,30,0)');ctx.fillStyle=g;ctx.fillRect(sx-24,sy-28,30,30);ctx.restore()}
  const hammer=(x,y,hx,hy)=>{const a=Math.atan2(hy-y,hx-x),c=Math.cos(a),s2=Math.sin(a);limb(x,y,hx-c*1.5,hy-s2*1.5,.9,.9,RP.wood);
    poly([[hx-s2*3.2-c*1.8,hy+c*3.2-s2*1.8],[hx+s2*3.2-c*1.8,hy-c*3.2-s2*1.8],[hx+s2*2.6+c*1.8,hy-c*2.6+s2*1.8],[hx-s2*2.6+c*1.8,hy+c*2.6+s2*1.8]],RP.iron,true)};
  if(!ham)hammer(sx-2,sy-12.5,sx-11,sy-15.5);
  // arms over everything at the anvil; then the tongs, the bar in their jaws and the hammer
  ctx.save();ctx.translate(B[0],B[1]);const A=o2.arms;
  if(pole){const h=A.ao;ctx.strokeStyle='#4a2e14';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(pole0[0]-B[0],pole0[1]-B[1]);ctx.lineTo(h.hx-1,h.hy-1);ctx.stroke()}
  A.draw(A.ao);A.draw(A.aw);
  if(tong){const h=tong.h?A.ao:A.aw,[jx,jy]=tong.j,[dx,dy]=tong.d,ex=jx+dx*tong.L,ey=jy+dy*tong.L,heat=p.heat;
    if(tong.water!=null){ctx.save();ctx.beginPath();ctx.rect(-80,-80,160,80+tong.water);ctx.clip()}
    ctx.lineCap='round';ctx.strokeStyle=SMH(heat);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(jx,jy);ctx.lineTo(ex,ey);ctx.stroke();
    if(heat>.3){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient((jx+ex)/2,(jy+ey)/2,0,(jx+ex)/2,(jy+ey)/2,9);g.addColorStop(0,`rgba(255,170,70,${(heat-.3)*.7})`);g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.fillRect(jx-14,jy-14,28+dx*tong.L,28+dy*tong.L);ctx.restore()}
    if(tong.water!=null)ctx.restore();
    ctx.strokeStyle='#2a2c33';ctx.lineWidth=.9;for(const sd of[-1,1]){ctx.beginPath();ctx.moveTo(h.hx,h.hy+sd*.6);ctx.lineTo(jx-dx*2-dy*sd*.9,jy-dy*2+dx*sd*.9);ctx.lineTo(jx+dx*.6,jy+dy*.6);ctx.stroke()}
    blob(h.hx,h.hy+.6,2.4,2.3,RP.skin)}
  if(ham){const h=A.aw;hammer(h.hx,h.hy,ham.d[0],ham.d[1]);blob(h.hx,h.hy+.4,2.5,2.4,RP.skin)}
  // a ring on the water where the bar goes in
  if(p.ph==='quench'&&p.dip>.3){const wx=tong.j[0]-1,wy=tong.water;ctx.strokeStyle=`rgba(200,230,240,${.5*(1-p.q)})`;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(wx,wy,3+p.q*6,1.5+p.q*3,0,0,7);ctx.stroke()}
  ctx.restore();if(G.smithHit>0)G.smithHit-=1/60;
  if(hov)label(sx,sy-100,'Brannoc, der Schmied','#ffd88a')}
// light, sparks, steam and sound keep time with his round
function smithTick(dt){const m=G.map;if(!m||!m.world||!m.home)return;
  if(!m.home.objs.some(o=>o.type==='smith')){const od=m.home.objs.find(o=>o.type==='merchant');if(!od)return;const[x,y]=nearWalk(od.x+4.6,od.y+3.8);m.home.objs.push({type:'smith',x,y,name:'Brannoc'});m.ac=null;owTick()}
  const o=m.objs.find(o=>o.type==='smith');if(!o)return;const d=hyp(o.x-P.x,o.y-P.y);if(d>22)return;const v=clamp(1-d/10,0,1),au=AC&&!G.muted&&v>0,t=(G.t+(o.off||0))%SMC,t0=o.smT??t;o.smT=t;
  const p=smithPose(t),cross=a=>t0<=t?t0<a&&t>=a:t0<a||t>=a,F=smW(o,SMF[0]-2,SMF[1]-13,13);
  G.smLt=(G.smLt||0)-dt;if(G.smLt<=0){G.smLt=.12;addLight(F.x,F.y,150+p.blow*60,.7+Math.random()*.15+p.blow*.25,.16);if(p.heat>.3&&p.ph!=='forge'){const b=smW(o,p.pos[0],p.pos[1]-20,20);addLight(b.x,b.y,60,.4*p.heat,.16)}}
  if(Math.random()<dt*(3+p.blow*14))fxp({k:'ember',x:F.x+rnd(-.15,.15),y:F.y+rnd(-.15,.15),z:F.z,vx:rnd(-.2,.2),vy:rnd(-.2,.2),vz:rnd(.8,1.8)*(1+p.blow),life:rnd(.5,1),col:pick(['#ffc070','#ff7a1a','#fff0b0']),s:rnd(.8,1.5),g:-.4});
  if(Math.random()<dt*1.6){const c=smW(o,SMF[0]+2,SMF[1]-1-76,76);smoke(c.x,c.y,1,'rgba(110,104,98,',3.5,1.2);G.fx[G.fx.length-1].z=c.z}
  // each pump: a breath of air through the coals
  for(const a of[.255,1.105,1.955])if(cross(a)){for(let k=0;k<6;k++)fxp({k:'ember',x:F.x,y:F.y,z:F.z,vx:rnd(-.6,.6),vy:rnd(-.6,.6),vz:rnd(1.5,3),life:rnd(.4,.8),col:pick(['#fff0b0','#ffc070']),s:rnd(.8,1.4),g:-.2});if(au)syN(AC.currentTime,{dur:.55,vol:.05*v,f0:220,f1:640,at:.18})}
  // the blows: fewer sparks as the iron cools
  for(let s=0;s<6;s++)if(cross(3.3+s*.7+.62*.7)){const hp=smithPose(t),hd=smithSwing(.62)[1],w=smW(o,SMS.anvil[0]+hd[0],SMS.anvil[1]+hd[1],20);
    sparks(w.x,w.y,w.z,-1.57,Math.round(4+hp.heat*12),['#fff4d0','#ffc070','#ff7a1a'],4.5,3);addLight(w.x,w.y,70,.6*hp.heat+.2,.12);
    if(au){anvilSnd&&sample('anvil',.32*v,{rate:rnd(1.08,1.22)})||sample('hit',.14*v,{rate:1.9})}}
  // the quench: a hiss and a cloud of steam
  if(cross(8.38)&&au){syN(AC.currentTime,{dur:1.3,vol:.07*v,ft:'highpass',f0:5200,f1:1600,at:.02});syN(AC.currentTime,{dur:.5,vol:.05*v,ft:'bandpass',f0:2400,f1:900,q:2})}
  if(p.ph==='quench'&&p.q>.16&&p.q<.85&&Math.random()<dt*22){const w=smW(o,SMT[0]+8,SMT[1]-7,7);fxp({k:'smoke',x:w.x+rnd(-.1,.1),y:w.y+rnd(-.1,.1),z:w.z,vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:rnd(.8,1.4),life:rnd(.7,1.3),col:'rgba(235,240,245,',s:rnd(2.5,4),g:-.3})}}
const _drawObjS=drawObj;drawObj=function(o){if(o.type==='smith')return drawSmith(o);return _drawObjS(o)};
const _interactS=interact;interact=function(o){if(o&&o.type==='smith'){openSmith();return}return _interactS(o)};
TALES.smith=['Die Schmiede','Brannoc war Waffenmeister der Turmwache, bevor die Brücken fielen. Er sagt, Schiefer aus Gräbern macht das Eisen geduldig. Er sagt nicht, woher er das weiß.'];

// the slate count sits under the glut
function slateHud(){let el=$('slateTxt');if(!el){$('glutTxt').insertAdjacentHTML('afterend','<div id="slateTxt"></div>');el=$('slateTxt')}const g=P.slateG||0,e=P.slateE||0,k=g+'|'+e;if(el.dataset.k===k)return;el.dataset.k=k;el.hidden=!g&&!e;el.innerHTML=`${slateImg('g',16)} ${g} ${e?` ${slateImg('e',16)} ${e}`:''}`}
const _saveDataS=saveData;saveData=function(){const d=_saveDataS();if(d){d.p.slateG=P.slateG||0;d.p.slateE=P.slateE||0;d.p.skv=P.skv||0;d.p.smithMet=P.smithMet||0}return d};

