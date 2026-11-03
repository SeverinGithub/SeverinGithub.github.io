/* ---------- Odalinde's stall in low poly: shelves of bottles, a counter under a striped awning, a lantern, crates and a barrel.
   She keeps a round of sixteen seconds: polishes a bottle and puts it on the shelf, counts her glut, feeds Grimbart a crumb,
   writes in her ledger and looks about; when someone comes close she turns to them, waves and leans on the counter ---------- */
// u runs across the screen in pixels, v towards the eye (half a pixel down per unit), z up
const ODU=([u,v,z])=>[(u+v)/2,(v-u)/2,z],ODC=16,ODB=[0,-2];
const ODR={skin:['#3a2214','#8a5c40','#c0906c','#e4bc98'],coat:['#0a100c','#1e2a22','#34463a','#4a6050'],scarf:['#3a0806','#6a120e','#9a1a14','#c0322a'],
  hair:['#6a6460','#a8a29a','#d8d2c8','#f4f0e8'],lea:['#1a0e06','#3a2412','#5a3a1e','#7a5430'],crow:['#060508','#0e0c12','#1c1a24','#34303e']};
const ODBOT=['#c8281a','#2a50c8','#7ac83a','#c8a020','#a03ac8','#e0e0f0','#2aa0a0'];
function odaMesh(){if(LPA.odK)return;const R=mulberry(41),WD='#5a3a1e',WL='#7a5430',DK='#3a2614';
  LPA.odK=lpBake(M=>M.with(ODU,()=>{
    for(const u of[-32,29])M.box(u,-19,0,u+3,-16,82,DK,{sp:.3});
    M.box(-29,-19,6,29,-18,52,'#2e1e10',{sp:.5});
    for(const z of[22,34,46]){M.box(-28,-18,z-1.6,28,-12,z,WL);
      for(let k=0;k<7;k++){if(R()<.15)continue;const u=-24+k*8+R()*2-1,c=ODBOT[R()*ODBOT.length|0],h=4+R()*3,w=1.6+R()*1;
        M.lathe(u,-15,[[z,w],[z+h,w*1.08],[z+h+1.4,w*.5],[z+h+2.6,w*.5]],6,c,{bm:1.15,capCol:'#8a7a60'})}}
    M.box(-27,-18,52,-17,-13,57,'#6a4a2a',{sp:.4});M.box(12,-18,52,24,-12,55,'#4a3a2a')}));
  LPA.odF=lpBake(M=>M.with(ODU,()=>{
    M.box(-31,1,0,31,13,2,'#3a2614',{noTop:1});M.box(-30,2,2,30,12,21,WD,{sp:.4});
    for(let k=0;k<9;k++){const u=-28+k*7;M.box(u,12,2,u+.6,12.4,21,'#3e2814')}
    M.box(-32,0,21,32,14,24,WL,{sp:.3});
    // the cloth over the front with a gold hem, and a fringe
    M.face([[-15,14.3,24],[8,14.3,24],[8,14.3,9],[-15,14.3,9]],'#7a1a14',{n:[0,1,0],sp:.2});M.face([[-15,14.4,10.6],[8,14.4,10.6],[8,14.4,9],[-15,14.4,9]],'#c8a040',{n:[0,1,0]});
    for(let k=0;k<11;k++){const u=-14.5+k*2.1;M.face([[u,14.4,9],[u+1.4,14.4,9],[u+.7,14.4,6.4]],'#c8a040',{n:[0,1,0]})}
    // the ledger, an open book; a heap of coins; a red potion and a small chest
    M.box(-26,4,24,-14,10,25.2,'#4a1a10');M.face([[-25.5,4.5,25.6],[-20.2,4.5,26.2],[-20.2,9.5,26.2],[-25.5,9.5,25.6]],'#e8dcc0',{n:[0,0,1]});M.face([[-19.8,4.5,26.2],[-14.5,4.5,25.6],[-14.5,9.5,25.6],[-19.8,9.5,26.2]],'#f0e6cc',{n:[0,0,1]});
    for(let k=0;k<9;k++)M.ball(-10+R()*6,5+R()*4,24.6+R()*.8,1.2,6,k%3?'#e2b23c':'#fff2a6',{m:2,rz:.4});
    M.lathe(20,6,[[24,2.6],[28,2.8],[29.6,1.2],[31.2,1.2]],7,'#c8281a',{bm:1.15,capCol:'#8a7a60'});M.box(24,4,24,30,9,28,'#6a3a1a');M.box(24,4,28,30,9,29,'#c8a040');
    for(const u of[-33,30])M.box(u,13,0,u+3,16,74,DK,{sp:.3})}));
  LPA.odA=lpBake(M=>M.with(ODU,()=>{const z0=82,z1=73,v0=-19,v1=17,n=9,s=72/n;
    M.box(-33,14,71,33,16,73,DK);
    for(let k=0;k<n;k++){const u=-36+k*s;M.face([[u,v0,z0],[u+s,v0,z0],[u+s,v1,z1],[u,v1,z1]],k%2?'#d8c8a0':'#8a1e16',{n:[0,.24,1],sp:.15})}
    for(let k=0;k<n;k++){const u=-36+k*s;M.face([[u,v1,z1],[u+s,v1,z1],[u+s,v1+.2,z1-4],[u+s/2,v1+.2,z1-6.5],[u,v1+.2,z1-4]],k%2?'#c8b890':'#7a1a14',{n:[0,1,0]})}}));
  const pro=lpBarrel(false),cra=lpCrate(false);LPA.odX=[pro,cra]}
// Grimbart: a crow of black facets, the beak pale, an amber eye; wings up and down in flight
function odaCrow(x,y,d,flap,peck){const C=ODR.crow,T=(pts,c)=>{ctx.fillStyle=c;ctx.beginPath();pts.forEach(([a,b],k)=>k?ctx.lineTo(x+a*d,y+b):ctx.moveTo(x+a*d,y+b));ctx.closePath();ctx.fill()};
  const hy=peck*3;T([[-6,-2],[-1,-5],[3,-3],[2,0],[-3,1]],C[1]);T([[-6,-2],[-10,-1],[-9,1],[-3,1]],C[0]);T([[-1,-5],[3,-3],[-2,-1]],C[2]);
  T([[2,-4+hy],[4.5,-6.5+hy],[6,-4.5+hy],[4,-1.5+hy],[2,-1+hy]],C[1]);T([[2,-4+hy],[4.5,-6.5+hy],[4,-3.6+hy]],C[3]);T([[5.6,-5.4+hy],[8.4,-4.4+hy],[5.8,-3.8+hy]],'#8a8070');
  ctx.fillStyle='#ffd040';ctx.fillRect(x+4.4*d-.5,y-5+hy,1,1);
  if(flap!=null){const w=Math.sin(flap)*7;T([[-3,-3],[2,-3],[-1,-3-w],[-6,-2-w*.8]],C[2]);T([[-3,-3],[-1,-3-w],[-4,-3-w*1.2]],C[3])}
  else{ctx.strokeStyle=C[2];ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x-d,y+1);ctx.lineTo(x-d,y+3);ctx.moveTo(x+d,y+1);ctx.lineTo(x+d*1.2,y+3);ctx.stroke()}}
// what she is doing at t of her round
function odaPose(t){const p={k:'polish',f:1,back:false,q:0};
  if(t<4)p.q=t/4;else if(t<5.4)Object.assign(p,{k:'shelf',back:true,q:(t-4)/1.4});else if(t<8)Object.assign(p,{k:'coins',f:-1,q:(t-5.4)/2.6});
  else if(t<11)Object.assign(p,{k:'crow',q:(t-8)/3});else if(t<13.5)Object.assign(p,{k:'write',f:-1,q:(t-11)/2.5});else Object.assign(p,{k:'look',f:t<14.7?1:-1,q:(t-13.5)/2.5});return p}
// where Grimbart is: on the awning, flying down to her hand, pecking, flying back
function odaCrowAt(t,p){const perch=k=>[-18+((k*13)%30),-79],ph=Math.floor(t/3.3),hop=(t%3.3)<.25?Math.sin((t%3.3)/.25*Math.PI)*4:0,arc=(a,b,q)=>{const e=smE(q);return[a[0]+(b[0]-a[0])*e,a[1]+(b[1]-a[1])*e-Math.sin(q*Math.PI)*14]};
  const home=perch(ph),hand=[13,-27];
  if(p.k==='crow'){const q=p.q;if(q<.22)return{x:arc(home,hand,q/.22)[0],y:arc(home,hand,q/.22)[1],d:1,flap:G.t*24,peck:0};
    if(q<.78)return{x:hand[0],y:hand[1],d:-1,flap:null,peck:Math.max(0,Math.sin((q-.22)*30))*(q<.7?1:0)};const r=(q-.78)/.22,a=arc(hand,home,r);return{x:a[0],y:a[1],d:1,flap:G.t*24,peck:0}}
  return{x:home[0],y:home[1]-hop,d:ph%2?1:-1,flap:hop>0?G.t*20:null,peck:0}}
function drawStall(o,sx,sy,hov){odaMesh();const t=(G.t+(o.off||0))%ODC,dr=(c,x,y)=>ctx.drawImage(c,Math.round(x-c.ax),Math.round(y-c.ay));
  // someone close: she turns to them and waves once when they arrive
  const d=hyp(P.x-o.x,P.y-o.y),near=G.state==='play'&&d<3.6;if(near&&!o.near)o.waveT=G.t;o.near=near;
  let p=odaPose(t);if(near){const[px]=iso(P.x,P.y);p={k:G.t-(o.waveT||0)<1.5?'wave':'lean',f:px<sx?-1:1,back:false,q:(G.t-(o.waveT||0))/1.5}}
  shadow(sx,sy+2,.85);shadow(sx-46,sy+5,.32);shadow(sx+45,sy+6,.35);
  dr(LPA.odK,sx,sy);
  const LT=G.t-(o.lt||0);if(LT>.15&&d<22){o.lt=G.t;const w=smW(o,31,-50,50);addLight(w.x,w.y,90,.5+Math.random()*.1,.18)}
  // Odalinde
  const B=[sx+ODB[0],sy+ODB[1]],f=p.f,br=Math.sin(G.t*1.7)*.5;let hands=[null,null],held=null;
  if(p.k==='polish'){hands=[[3+Math.cos(G.t*7)*2.2,-28+Math.sin(G.t*7)*1.4],[-3,-26]];held={bot:[-2,-28],c:ODBOT[1],rag:1}}
  else if(p.k==='shelf'){const r=Math.sin(Math.min(1,p.q/.7)*Math.PI);hands=[[5+r*2,-30-r*20],[-6,-27]];if(p.q<.5)held={bot:[5+r*2,-34-r*20],c:ODBOT[1]}}
  else if(p.k==='coins'){const c=(p.q*5)%1,sl=c<.6?smE(c/.6):1-smE((c-.6)/.4);hands=[[-14+sl*7,-21-Math.sin(c*Math.PI)*1.5],[7,-21]];held={coin:[-14+sl*7,-21],n:Math.floor(p.q*5)}}
  else if(p.k==='crow'){const r=p.q<.15?smE(p.q/.15):p.q>.85?1-smE((p.q-.85)/.15):1;hands=[[6+r*7,-24-r*3],[-7,-21]]}
  else if(p.k==='write'){hands=[[-16+Math.sin(G.t*16)*1.2+p.q*4,-22+Math.sin(G.t*23)*.6],[-6,-21]];held={quill:1}}
  else if(p.k==='look'){const fx=p.q>.68?Math.sin((p.q-.68)/.32*Math.PI):0;hands=[[8-fx*9,-21-fx*16],[-8,-21]]}
  else if(p.k==='wave'){const w=Math.sin(Math.min(1,p.q)*Math.PI);hands=[[f*(10+Math.sin(G.t*12)*3*w),-26-w*22],[-f*7,-21]]}
  else hands=[[8,-21],[-8,-21]];
  const head=(hx,hy)=>{const H=ODR.hair,sw=Math.sin(G.t*1.3)*.8;
    // the braid: a plaited rope of facets over one shoulder, tied off in red
    const braid=(x0,y0,dx)=>{let x=x0,y=y0;for(let k=0;k<6;k++){const nx=x0+dx*k*.35+sw*k*.3,ny=y0+(k+1)*2.3,w=1.9-k*.18;limb(x,y,nx,ny,w,w-.18,H);ctx.fillStyle=H[1];ctx.fillRect(Math.min(x,nx)-w*.4,(y+ny)/2,w*.9,.6);x=nx;y=ny}blob(x,y+.6,1.1,.9,ODR.scarf);limb(x,y+1,x+sw*.4,y+3.4,1,.4,H)};
    if(p.back){blob(hx,hy,4.2,4.8,ODR.skin);blob(hx,hy-.4,4.5,4.9,H);braid(hx+.3,hy+3,.2);return}
    braid(hx-f*3.6,hy+2.6,-f*.5);
    blob(hx,hy,4,4.6,ODR.skin);ctx.save();ctx.beginPath();ctx.rect(hx-6,hy-7,12,5.6);ctx.clip();blob(hx,hy-.5,4.4,4.8,H);ctx.restore();blob(hx-f*3.6,hy-1,1.3,2.6,H);
    ctx.fillStyle='#140a06';ctx.fillRect(hx-2.3+f*.7,hy-.5,1.2,1);ctx.fillStyle='#6ad0a0';ctx.fillRect(hx+1+f*.7,hy-.5,1.2,1);
    ctx.fillStyle='#8a3a2a';ctx.fillRect(hx+1.6+f*.7,hy-2.6,.7,3.4);ctx.fillStyle='#7a3a2a';ctx.fillRect(hx-.8+f*.7,hy+2.4,1.8,.6)};
  const scarf=(shX,shY,hx,hy,bk)=>{poly([[shX-5.5,shY-1.5],[shX+5.5,shY-1.5],[shX+4,shY+2.5],[shX-4,shY+2.5]],ODR.scarf);if(!bk){poly([[shX+f*2,shY+1],[shX+f*4.6,shY+1.4],[shX+f*4+Math.sin(G.t*2)*.6,shY+10],[shX+f*2.2,shY+9]],ODR.scarf);
    limb(shX-f*5,shY+1,hx+f*5,hy-1,.7,.7,ODR.lea);const V=[['#3a0806','#7a1a14','#c8281a','#ff8a6a'],['#0a1a4a','#1a3a8a','#2a50c8','#8ab0ff'],['#1a3a0a','#3a6a1a','#7ac83a','#c0f090']];for(let k=0;k<3;k++){const q=.3+k*.2;blob(shX-f*5+(hx+f*10-shX)*q,shY+2.2+(hy-shY-2)*q,.9,1.4,V[k])}}};
  const o2={R:{skin:ODR.skin,torso:ODR.coat,sleeve:ODR.coat,fore:ODR.coat,hand:ODR.skin,legs:ODR.coat,shin:ODR.coat,feet:RP.shoe,skirt:ODR.coat,belt:ODR.lea,buckle:RP.gold,metal:{}},
    f,back:p.back,moving:false,tw:.95,lw:.9,hunch:p.k==='lean'||p.k==='coins'||p.k==='write'?2:p.k==='crow'?1:0,armsLate:true,hands,aL:8.6,head,torsoFx:scarf};
  ctx.save();ctx.translate(B[0],B[1]+br*.4);humanoid(o2);ctx.restore();
  dr(LPA.odF,sx,sy);
  // arms over the counter, then what is in her hands
  ctx.save();ctx.translate(B[0],B[1]+br*.4);const A=o2.arms;
  if(held&&held.coin){for(let k=0;k<held.n+2;k++){ctx.fillStyle=k%2?'#e2b23c':'#fff2a6';ctx.beginPath();ctx.ellipse(-6,-20-k*1.1,2,.9,0,0,7);ctx.fill()}}
  A.draw(A.ao);A.draw(A.aw);
  if(held&&held.bot){const[x,y]=held.bot;poly([[x-1.8,y+3.5],[x+1.8,y+3.5],[x+2,y-1.5],[x+.8,y-2.6],[x+.8,y-4.4],[x-.8,y-4.4],[x-.8,y-2.6],[x-2,y-1.5]],[shade(held.c,.4),shade(held.c,.7),held.c,shade(held.c,1.4)]);
    ctx.fillStyle='rgba(255,250,230,.8)';ctx.fillRect(x-1.2,y-1,.8,3);if(held.rag){const h=A.aw;poly([[h.hx-2.4,h.hy-1],[h.hx+2.2,h.hy-1.6],[h.hx+2.6,h.hy+2],[h.hx-2,h.hy+2.4]],['#6a5a40','#a8946c','#d0bc90','#e8d8b0'])}}
  if(held&&held.coin){const h=A.aw;ctx.fillStyle='#fff2a6';ctx.beginPath();ctx.ellipse(h.hx,h.hy+1.6,2,.9,0,0,7);ctx.fill()}
  if(held&&held.quill){const h=A.aw;ctx.strokeStyle='#e8e2d6';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(h.hx,h.hy+1);ctx.lineTo(h.hx+4,h.hy-7);ctx.stroke();ctx.strokeStyle='#2a1a10';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(h.hx,h.hy+1);ctx.lineTo(h.hx-.6,h.hy+2.4);ctx.stroke()}
  for(const a of[A.ao,A.aw])blob(a.hx,a.hy+.6,1.9,1.9,ODR.skin);
  ctx.restore();
  dr(LPA.odX[0],sx-46,sy+5);dr(LPA.odX[1],sx+45,sy+6);
  dr(LPA.odA,sx,sy);
  // the lantern swings under the awning
  const sw=Math.sin(G.t*1.3)*.12,lx=sx+31.5+Math.sin(sw)*9,ly=sy+7.5-71+Math.cos(sw)*9;ctx.strokeStyle='#2a2a2a';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(sx+31.5,sy+7.5-71);ctx.lineTo(lx,ly);ctx.stroke();
  poly([[lx-3,ly],[lx+3,ly],[lx+3.4,ly+7],[lx-3.4,ly+7]],['#140c06','#2a2014','#3a2a14','#5a4020']);ctx.fillStyle=`rgba(255,200,110,${.85+Math.sin(G.t*9)*.1})`;ctx.fillRect(lx-2,ly+1.4,4,4.6);poly([[lx-3.6,ly],[lx,ly-2.6],[lx+3.6,ly]],['#140c06','#2a2014','#3a2a14','#5a4020']);
  ctx.save();ctx.globalCompositeOperation='lighter';const q=ctx.createRadialGradient(lx,ly+4,1,lx,ly+4,28);q.addColorStop(0,'rgba(255,190,100,.3)');q.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=q;ctx.fillRect(lx-28,ly-24,56,56);
  // glints wander over the bottles on the shelves
  for(let k=0;k<3;k++){const a=G.t*.7+k*2.1,u=-24+((Math.floor(a)*37+k*11)%7)*8,z=[22,34,46][(Math.floor(a)+k)%3],gl=Math.sin((a%1)*Math.PI);ctx.fillStyle=`rgba(255,250,230,${gl*.8})`;ctx.fillRect(sx+u-.5,sy-7.5-z-5,1,2.5)}
  ctx.restore();
  const c=odaCrowAt(t,p.k==='crow'?p:{k:''});odaCrow(sx+c.x,sy+c.y,c.d,c.flap,c.peck);
  if(hov)label(sx,sy-98,'Odalinde, Händlerin','#ffd88a')}
// travelling traders: a coat, a hat, a heavy pack and a lantern on a stick
function drawTrader(o,sx,sy,hov){const t=trader(o),p=t.p,R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(sx+x,sy+y,w,h)},br=Math.sin(G.t*1.5+o.x)*.5;shadow(sx,sy,.45);
  R(-9,-30+br,12,20,'#4a3018');R(-9,-30+br,12,2,'#6a4a28');R(-10,-24+br,2,10,'#2a1a0c');R(-7,-35+br,4,5,'#7a5a3a');R(-2,-34+br,3,4,'#3a5a7a');
  R(-4,-12,3,12,'#2a1c12');R(2,-12,3,12,'#2a1c12');R(-5,-30+br,11,19,p.coat);R(-5,-30+br,11,2,shade(p.coat,1.35));if(p.scarf)R(-4,-29+br,9,2,p.scarf);
  R(-4,-39+br,9,9,p.skin);R(-4,-39+br,9,2,shade(p.skin,1.12));R(-2,-35+br,1,1,'#140c06');R(2,-35+br,1,1,'#140c06');if(p.beard)R(-3,-33+br,7,4,p.beard);
  if(p.hat==='wide'){R(-8,-41+br,17,2,p.hatC);R(-4,-46+br,9,5,p.hatC)}else if(p.hat==='cap'){R(-5,-42+br,11,4,p.hatC)}else if(p.hat==='hood'){R(-6,-42+br,13,4,p.hatC);R(-6,-40+br,2,9,p.hatC);R(5,-40+br,2,9,p.hatC)}else if(p.hs!=='bald'){R(-5,-41+br,11,3,p.hair);if(p.hs==='long'||p.hs==='braid')R(-5,-39+br,2,8,p.hair)}
  R(6,-30+br,3,9,shade(p.skin,.9));R(8,-50,1,30,'#4a3018');R(6,-52,5,6,'#2a2014');ctx.fillStyle=`rgba(255,200,110,${.85+Math.sin(G.t*8+o.y)*.1})`;ctx.fillRect(sx+7,sy-51,3,4);
  const q=ctx.createRadialGradient(sx+8,sy-49,1,sx+8,sy-49,20);q.addColorStop(0,'rgba(255,190,100,.25)');q.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=q;ctx.fillRect(sx-12,sy-69,40,40);
  if(hov)label(sx,sy-60,t.name,'#ffd88a')}

// Eldrik, keeper of the chronicle: he knows what the tower wants from you next
const ELD={name:'Eldrik, der Chronist',p:{skin:'#c8a080',hair:'#d8d4cc',hs:'bald',coat:'#4a3e30',hat:'hood',hatC:'#3a3226',beard:'#e0dcd4',long:1,lamp:1,bg:'#100c08',glow:[2,16,'rgba(255,190,100,.4)']}};
const STORY={
 'Erstes Blut':'Bevor du in die Tiefe gehst, will ich sehen, dass deine Hand nicht zittert. Hinter der Brücke steht eine Statue. Schlag sie, und sie ruft dir Gegner. Fünf genügen mir.',
 'Der Turm ruft':'Hörst du das Pochen? Der Turm ruft jeden, der lange genug hier oben steht. Geh durch das Tor. Ich schreib mit, was du findest.',
 'Knochenbrecher':'Die Skelette da unten waren einmal Wächter wie du. Sie erinnern sich nicht mehr daran. Erlöse zehn von ihnen.',
 'Tiefer hinab':'Die erste Ebene ist nur die Schwelle. Steig eine Treppe tiefer, dann fängt die Chronik richtig an.',
 'Handel mit Odalinde':'Odalinde hat einen losen Mund und einen vollen Stand. Kauf ihr etwas ab, bevor du zu stolz dafür bist. Und lass den Vogel in Ruhe.',
 'Truhenjäger':'Die Wächter von damals haben ihr Gold nicht mitgenommen, als sie starben. Öffne zwei Truhen, dann weißt du, wovon ich rede.',
 'Der Hügeltyrann':'Morgrath. Ich habe ihn gekannt, als er noch ein Mensch war. Er hat zu lange in die Tiefe gehört. Auf Ebene drei sitzt er auf seinem Knochenthron. Bring es zu Ende.',
 'Über die Brücken':'Morgrath ist gefallen, und die Brücken schweigen nicht mehr. Da draußen treiben Inseln. Geh hinüber und sieh dir drei davon an.',
 'Brennende Dörfer':'Auf den Inseln brennen Dörfer, die noch niemand gelöscht hat. Kultisten der Asche. Finde eins, und sieh, was sie zurückgelassen haben.',
 'Ein Feuer im Dunkeln':'Jedes Leuchtfeuer, das du entzündest, ist ein Ort, an den du zurückkehren kannst. Die Lager haben immer eins. Zünde es an.',
 'Spinnenplage':'In den Wäldern weben die Spinnen. Ihre Netze reichen schon bis an die Brücken. Fünfzehn weniger, und die Händler atmen wieder.',
 'Wanderhändler':'Die Händler da draußen wandern von Insel zu Insel. Jeder hat einen anderen Kopf und andere Ware. Kauf dreimal bei ihnen, und du kennst den Himmel besser.',
 'Gemeißelte Worte':'Die Alten haben Worte in Stein gemeißelt, und die Worte haben Kraft behalten. Setz eine Rune in einen Sockel. Du wirst es spüren.',
 'Erste Talente':'Deine Leuchtfeuer geben dir mehr als Rast. Öffne den Talentbaum und lerne drei Knoten. Ein Körper, der nicht wächst, stirbt hier oben.',
 'Rußklaue':'Rußklaue. Ein Kultist, der so lange im Feuer gestanden hat, bis er selbst Rauch wurde. Er plündert die Dörfer nahe dem Hügel. Finde sein Revier.',
 'Die Gräberinseln':'Es gibt Inseln, auf denen nichts wächst außer Grabsteinen. Betritt eine. Und wenn du Grabschiefer findest, bring ihn zu Brannoc.',
 'Ghulfeuer':'Die Ghule fressen, was die Kultisten verbrennen. Fünfzehn von ihnen, dann wird es ruhiger auf den Gräbern.',
 'Ruinen der Alten':'Säulen ohne Dach, Treppen ins Nichts. Die Alten haben geglaubt, der Himmel würde halten. Erkunde zwei ihrer Ruinen.',
 'Die Ascheweberin':'Die Ascheweberin spinnt im Turm auf Ebene sechs. Jeder Faden ein Feuer. Zerreiß ihr Netz.',
 'Kartograph':'Ich habe keine vollständige Karte vom Himmel. Niemand hat das. Erkunde zwölf Inseln, und ich trage sie in die Chronik ein.',
 'Feuerkette':'Vier Leuchtfeuer, und du reist schneller als jeder Bote. Die Kette aus Licht hält die Nacht ein wenig auf Abstand.',
 'Die Nebelweberin':'Im Nebel weit draußen sitzt die Schwester der Ascheweberin. Wo ihr Nebel liegt, verlieren selbst Knochen die Richtung. Besiege sie.',
 'Pfeilregen':'Knochenschützen. Sie zielen besser tot als die meisten lebend. Zwanzig von ihnen, dann kannst du wieder aufrecht gehen.',
 'Das erste Wort':'Runen allein sind Buchstaben. In der richtigen Reihenfolge werden sie Worte. Schmiede dein erstes Runenwort. Die Rezepte stehen in deiner Sammlung.',
 'Die Mitte des Turms':'Ebene acht. Die Mitte. Dort hört man das Herz des Turms am lautesten. Steig hinab.',
 'Erfahren':'Du bist nicht mehr das, was vor ein paar Tagen auf diesen Hügel kam. Erreiche Stufe fünfzehn, dann schreib ich dich als Veteran ein.',
 'Sandstacheln':'Die Skorpione kriechen aus den Wäldern, seit die Spinnen weniger werden. Zwanzig von ihnen. Pass auf das Gift auf.',
 'Moosfaust':'Moosfaust, der Grabwächter. Er duldet niemanden auf seiner Insel, nicht einmal die Toten, die er bewacht. Geh hin und zeig ihm, dass er sich irrt.',
 'Graukeil':'Graukeil, Wächter der Tiefe, auf Ebene neun. Er war der Letzte, der die Tore hielt, als die Brücken fielen. Jetzt hält er sie gegen dich.',
 'Der Wächter der Statue':'Die Statue hinter der Brücke ist nicht nur Übungsplatz. Sie prüft, wer würdig ist. Besiege zehn ihrer Rufe.',
 'Weit gereist':'Fünfundzwanzig Inseln. Dann weißt du mehr über den Himmel als die meisten, die je hier lebten.',
 'Trödler':'Du schleppst zu viel mit dir herum. Verkauf zehn Dinge. Odalinde wird sich freuen, und dein Rücken auch.',
 'Ende des Kults':'Die Kultisten der Asche beten zur Aschemutter. Fünfundzwanzig weniger, und ihre Gebete werden leiser.',
 'Kaltherz':'An der Frostfurt wartet Kaltherz. Man sagt, er hat sein Herz eingefroren, damit es nicht mehr wehtut. Zerbrich es.',
 'Morgraths Rückkehr':'Ich habe es befürchtet. Morgrath ist zurück, tiefer und stärker, auf Ebene zwölf. Der Turm lässt seine Diener nicht gehen.',
 'Legenden':'Es gibt Waffen mit eigenen Namen und eigenen Geschichten. Finde drei davon, und ich schreibe ihre Geschichten neben deine.',
 'Meister der Talente':'Fünfzehn Knoten im Talentbaum. Dann bist du kein Wanderer mehr, sondern etwas, wovor sich die Tiefe fürchtet.',
 'Die Brutkönigin':'Weit draußen brütet die Brutkönigin neue Spinnen aus, schneller als du sie töten kannst. Also geh zur Quelle.',
 'Seelenruhe':'Die Klageseelen weinen um ein Leben, das sie nicht mehr haben. Dreißig von ihnen. Schenk ihnen Ruhe.',
 'Leuchtfeuer der Welt':'Acht Leuchtfeuer. Wenn sie alle brennen, sieht man sie vom Turm aus wie Sterne.',
 'Die zweite Weberin':'Die Ascheweberin ist zurück, auf Ebene fünfzehn. Diesmal hat sie mehr Fäden. Zerreiß sie alle.',
 'Glutkoloss Vharn':'Vharn glüht am Rand der Welt. Ein Koloss aus der ersten Glut, die je aus dem Turm stieg. Lösch ihn.',
 'Steinbrecher':'Die Kolosse auf den Felsinseln bewegen sich, seit Vharn erwacht ist. Fünfundzwanzig von ihnen.',
 'Held der Inseln':'Stufe dreißig. Die Händler erzählen schon Geschichten von dir. Mach sie wahr.',
 'Graukeil erwacht':'Graukeil steht wieder, auf Ebene achtzehn. Ich glaube, er wartet nur auf dich.',
 'Der Schattenkönig':'Der Schattenkönig herrscht über die fernen Inseln. Er hat keinen Namen mehr, nur einen Thron. Stoß ihn herunter.',
 'Die ganze Welt':'Sechzig Inseln. Die ganze Welt, oder was davon übrig ist. Geh und sieh sie dir an, bevor sie zerfällt.',
 'Ebene 21':'Ebene einundzwanzig. So tief war noch niemand und kam zurück. Sei der Erste.',
 'Aschemutter, die Letzte':'Am äußersten Rand wartet die Aschemutter. Sie hat jede Insel geboren, und sie kann jede zurücknehmen. Das ist das letzte Kapitel. Schreib es.'};
const ELDLORE=['Ich schreibe die Chronik seit dem Tag, an dem der Himmel brach. Damals hatte ich noch Haare.','Der Turm war vor uns da. Er wird nach uns da sein. Aber vielleicht nicht nach dir.','Brannoc schmiedet, Odalinde handelt, ich schreibe. Jeder hält auf seine Weise die Welt zusammen.',
  'Die Glut, die du sammelst, ist das, was von den Toten übrig bleibt. Gib sie mit Bedacht aus.','Jede Seite in diesem Buch ist ein Name. Die meisten enden mitten im Satz. Deine noch nicht.','Wenn die Nacht kommt, werden die Dinge da draußen stärker. Aber auch großzügiger.',
  'Grimbart, die Krähe, ist älter als Odalinde. Sag ihr nicht, dass ich das gesagt habe.','Die Leuchtfeuer sind älter als die Brücken. Manche sagen, sie haben die Inseln oben gehalten.'];
const PRAISE=[t=>`„${t}“ ist erledigt? Gut. Ich hab’s schon in die Chronik geschrieben.`,t=>`Ich hab gehört, was du getan hast. „${t}“. Die Tinte ist noch feucht.`,t=>`„${t}“. Ein weiteres Kapitel. Hier, lass uns weiterblättern.`];
function compass(x,y){const dx=x-P.x,dy=y-P.y,sx=dx-dy,sy=(dx+dy)/2,a=Math.atan2(sy,sx),d=hyp(dx,dy);const dirs=['Osten','Südosten','Süden','Südwesten','Westen','Nordwesten','Norden','Nordosten'];return{dir:dirs[(Math.round(a/(Math.PI/4))+8)%8],d}}
function openChron(){const d=$('dialog'),q=curQ();G.openAt={x:P.x,y:P.y};let line;
  if(!P.chrMet){P.chrMet=1;line='Ah. Ein neues Gesicht. Ich bin Eldrik, und das hier ist die Chronik des Turms. Setz dich nicht, wir haben keine Zeit. '+(q?STORY[q.t]||q.d:'')}
  else if(!q)line='Die Chronik ist vollendet. Ich hätte nicht gedacht, dass ich das noch erlebe. Danke, '+who()+'.';
  else if((P.chrQ??P.qi)<(P.qi||0)&&QUESTS[(P.qi||0)-1])line=pick(PRAISE)(QUESTS[(P.qi||0)-1].t)+' '+(STORY[q.t]||q.d);
  else line=STORY[q.t]||q.d;
  P.chrQ=P.qi||0;npcSay(line);chronHTML()}
function chronHTML(){const d=$('dialog'),q=curQ();let h=sayHTML(ELD.name,portrait(ELD.p));
  if(q){const[c,n]=qProg(q),f=Math.min(1,c/n);h+=`<div class="qcard"><small>${QACT[q.a]} · Quest ${(P.qi||0)+1} von ${QUESTS.length}</small><b>${q.t}</b><p>${q.d}</p><div class="qbar"><i style="width:${(f*100).toFixed(0)}%"></i></div><small>${Math.min(c,n)} / ${n} · Lohn: ${q.glut} Glut${q.tp?' · 1 Talentpunkt':''}</small></div>`}
  h+=`<div class="opts"><button data-chr="where">Wo finde ich das?</button><button data-chr="more">Erzähl mir mehr</button><button data-close>Gehen</button></div>`;d.innerHTML=h;d.hidden=false}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-chr]');if(!b||!P)return;const q=curQ();
  if(b.dataset.chr==='more')npcSay(pickNew(ELDLORE,'eld'));
  else if(q){const t=G.map&&G.map.world?qTarget(q):null;if(q.ty==='floor'||q.ty==='dboss')npcSay('Durch das Tor neben mir, und dann hinab. Die Treppen findest du selbst, das ist Teil der Prüfung.');
    else if(t){const c=compass(t.x,t.y);npcSay(c.d<6?`Du stehst fast davor. ${t.l}, gleich hier.`:`Geh nach ${c.dir}, etwa ${Math.round(c.d)} Schritte. ${t.l}. Auf deiner Karte ist es markiert.`)}
    else npcSay('Das findest du nicht an einem Ort. Das findet dich, wenn du lange genug draußen bist.')}});

// placement and drawing
function npcTick(dt){twTick(dt);const m=G.map;if(!m||!m.world||!m.home||!P)return;
  if(!m.home.objs.some(o=>o.type==='chronist')){const door=m.home.objs.find(o=>o.type==='door');if(!door)return;const[x,y]=nearWalk(door.x-3.8,door.y+2.2);m.home.objs.push({type:'chronist',x,y,name:'Eldrik'});m.ac=null;owTick()}
  const od=m.objs.find(o=>o.type==='merchant'&&isHomeMerchant(o));if(od&&hyp(od.x-P.x,od.y-P.y)<5&&Math.random()<dt*.06)ftext(od.x+.3,od.y-1.4,pick(['Krah!','Krrah.','Kraa!']),'#a39b88')}
function drawChron(o){const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-160||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o,t=G.t,R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(sx+x,sy+y,w,h)},br=Math.sin(t*1.2)*.5;shadow(sx,sy,.55);
  // lectern with the open chronicle and a candle
  R(12,-22,4,22,'#3a2614');R(6,-26,18,5,'#4a3218');R(7,-30,16,4,'#e8dcc0');R(15,-30,1,4,'#a89878');R(8,-29,6,1,'#7a6a50');R(17,-29,5,1,'#7a6a50');R(8,-27,5,1,'#7a6a50');R(20,-35,2,5,'#e8e0d0');ctx.fillStyle=`rgba(255,210,120,${.85+Math.sin(t*11)*.12})`;ctx.fillRect(sx+20,sy-38,2,3);
  const q=ctx.createRadialGradient(sx+21,sy-36,1,sx+21,sy-36,22);q.addColorStop(0,'rgba(255,200,110,.3)');q.addColorStop(1,'rgba(255,160,60,0)');ctx.fillStyle=q;ctx.fillRect(sx-4,sy-60,50,50);
  // Eldrik: long robe, hood, white beard, a staff
  R(-10,-34+br,16,34,'#4a3e30');R(-10,-34+br,16,2,'#6a5a46');R(-12,-4,20,4,'#3a3026');R(-7,-44+br,10,10,'#c8a080');R(-9,-47+br,14,5,'#3a3226');R(-10,-44+br,3,12,'#3a3226');R(4,-44+br,3,12,'#3a3226');
  R(-6,-36+br,8,10,'#e0dcd4');R(-5,-27+br,6,4,'#d0ccc4');R(-5,-40+br,2,1,'#140c06');R(0,-40+br,2,1,'#140c06');R(5,-30+br,4,3,'#c8a080');R(-14,-56,2,56,'#5a4028');R(-15,-58,4,3,'#8a7a5a');
  // a golden mark over his head when the chronicle has something new for you
  if((P.chrQ??-1)!==(P.qi||0)&&curQ()){const b=Math.sin(t*3)*2;ctx.font="bold 18px 'IM Fell English', Georgia, serif";ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('!',sx-1,sy-60+b+1);ctx.fillStyle='#ffd040';ctx.fillText('!',sx-2,sy-60+b)}
  if(hov)label(sx,sy-74,'Eldrik, der Chronist','#ffd88a')}
const _drawObjN=drawObj;drawObj=function(o){if(o.type==='chronist')return drawChron(o);if(o.type==='merchant'){const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-160||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o;return isHomeMerchant(o)?drawStall(o,sx,sy,hov):drawTrader(o,sx,sy,hov)}return _drawObjN(o)};
const _interactN=interact;interact=function(o){if(o&&o.type==='chronist'){openChron();return}return _interactN(o)};
const _saveDataN=saveData;saveData=function(){const d=_saveDataN();if(d)for(const k of['odaMet','chrMet','chrQ'])d.p[k]=P[k];return d};

