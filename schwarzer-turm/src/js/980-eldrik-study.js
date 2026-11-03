/* ---------- Eldrik's study in low poly: a shelf of books behind him, a rug, a writing desk with the open chronicle, ink, a candle and stacks of books.
   He keeps a round of fifteen seconds: writes, dips the quill, turns the page, strokes his beard and thinks, puts a book back on the shelf;
   when someone comes close he looks up, lifts the quill in greeting and listens ---------- */
const ELC=15,ELR={skin:['#3a2214','#8a5c40','#c0906c','#e0b898'],robe:['#0c0a12','#1e1a2c','#342e48','#4c4466'],hood:['#08060c','#16121e','#262034','#383050'],
  trim:['#3a2a08','#7a5a18','#c09a38','#e8c860'],beard:['#6a6660','#a8a49c','#dcd8d0','#f8f6f0'],rope:['#2a1c0c','#5a4020','#8a6a3a','#b09060']};
const ELBK=['#5a1a14','#1a3a5a','#2a4a1a','#5a4a1a','#3a1a4a','#6a3a1a','#1a1a1a','#7a6a50'];
ELD.p.coat='#342e48';ELD.p.hatC='#262034';SOLID.chronist=.8;
function eldMesh(){if(LPA.elB)return;const R=mulberry(83),WD='#5a3a1e',WL='#7a5430',DK='#3a2614';
  const books=(M,u0,u1,v0,v1,z,hMin,hMax)=>{let u=u0;while(u<u1-1.5){const w=1.4+R()*1.6,h=hMin+R()*(hMax-hMin),c=ELBK[R()*ELBK.length|0];if(R()<.12){u+=w;continue}
      M.box(u,v0,z,Math.min(u1,u+w),v1,z+h,c,{top:shade(c,1.3)});if(R()<.5)M.box(u,v1,z+h*.7,Math.min(u1,u+w),v1+.1,z+h*.78,'#c8a040');u+=w+.15}};
  const stack=(M,u,v,n,rot)=>{let z=0;for(let k=0;k<n;k++){const w=8-k*.6+R()*1.5,d=5.5+R(),h=1.6+R()*1.2,c=ELBK[R()*ELBK.length|0],du=(R()-.5)*1.6*rot;
      M.box(u-w/2+du,v-d/2,z,u+w/2+du,v+d/2,z+h,c,{top:shade(c,1.25)});M.box(u-w/2+du+.4,v+d/2,z+.3,u+w/2+du-.3,v+d/2+.05,z+h-.3,'#e8dcc0');z+=h}return z};
  // behind him: the rug, the shelf full of books, a skull and a few scrolls on top
  LPA.elB=lpBake(M=>M.with(ODU,()=>{
    M.face([[-28,-15,.2],[44,-15,.2],[44,17,.2],[-28,17,.2]],'#c8a040',{n:[0,0,1]});M.face([[-26,-13,.3],[42,-13,.3],[42,15,.3],[-26,15,.3]],'#6a1a14',{n:[0,0,1],sp:.25});
    M.face([[-20,-8,.4],[36,-8,.4],[36,10,.4],[-20,10,.4]],'#8a2a1a',{n:[0,0,1]});
    for(const u of[-38,-5])M.box(u,-25,0,u+3,-17,66,DK,{sp:.3});
    M.box(-35,-25,2,-5,-24,64,'#2e1e10',{sp:.5});
    for(const z of[2,18,34,50]){M.box(-35,-24,z-1.6,-5,-17,z,WL);books(M,-34.5,-5.5,-23,-18.5,z,8,13)}
    M.box(-39,-26,64,-2,-16,67,DK,{sp:.3});
    M.ball(-30,-20,70.5,3.4,6,'#d8ccb0',{m:3,rz:.95});M.box(-31.6,-17,67.2,-28.4,-16.6,69.4,'#c8bca0');
    for(let k=0;k<3;k++)M.cyl(-18+k*3.4,-20+k*.8,67,67+7+k*1.5,1.3,6,'#e8dcc0',{capCol:'#c8a878'});
    M.cyl(-9,-21,67,73,1.2,6,'#d8c8a0',{capCol:'#a88a58'})}));
  // in front of him: the desk with the chronicle, ink and a candle, books on the desk and on the floor
  LPA.elF=lpBake(M=>M.with(ODU,()=>{
    for(const[u,v]of[[10,-9],[33,-9],[10,8],[33,8]])M.box(u,v,0,u+2,v+2,26,DK);
    M.box(11,-1,5,34,1,7,DK);M.box(9.5,-9.5,22,35.5,10.5,26,WD,{sp:.35});M.box(8,-11,26,37,12,28,WL,{sp:.3});
    M.box(12,-5,28,28,5,28.6,'#4a1a10');
    M.face([[12.5,-4.5,28.8],[20,-4.5,29.6],[20,4.5,29.6],[12.5,4.5,28.8]],'#e8dcc0',{n:[0,0,1]});M.face([[20,-4.5,29.6],[27.5,-4.5,28.8],[27.5,4.5,28.8],[20,4.5,29.6]],'#f0e6cc',{n:[0,0,1]});
    M.box(20,4.5,28.4,21,5.2,29.6,'#c8a040');
    M.lathe(28,6,[[28,2.1],[30.5,2.3],[31.6,1],[32.4,1]],7,'#1c1a2a',{bm:1.2,capCol:'#06060a'});
    M.lathe(11,-8,[[28,2.6],[28.8,2.6],[29.3,1.1]],8,'#b08a38',{bm:1.2});M.cyl(11,-8,29.3,37,1.05,6,'#ece4d2',{capCol:'#f4eee0'});
    M.with(lpMv(29.5,-6.5,28),()=>stack(M,0,0,3,1));
    M.with(lpMv(-20,13,0),()=>stack(M,0,0,5,1));M.with(lpMv(-9,17,0),()=>stack(M,0,0,2,1));
    M.with(lpMv(42,11,0),()=>{const z=stack(M,0,0,3,1);M.cyl(0,0,z,z+.1,.1,3,'#e8dcc0');M.box(-4,-1.4,z,4,1.4,z+2.6,'#e8dcc0',{top:'#f4ecd8'});M.box(-4.6,-1.6,z,-3.8,1.6,z+2.8,'#a88a58');M.box(3.8,-1.6,z,4.6,1.6,z+2.8,'#a88a58')})}))}
// what he is doing at t of his round
function eldPose(t){if(t<5)return{k:'write',q:t/5,n:0};if(t<6.2)return{k:'dip',q:(t-5)/1.2};if(t<7.6)return{k:'turn',q:(t-6.2)/1.4};
  if(t<10.2)return{k:'think',q:(t-7.6)/2.6};if(t<12.6)return{k:'shelf',q:(t-10.2)/2.4,back:true};return{k:'write',q:(t-12.6)/2.4,n:1}}
drawChron=function(o){const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-160||sy>H+80)return;eldMesh();const hov=G.state==='play'&&hoverObj()===o,t=(G.t+(o.off||0))%ELC,
    dr=(c,x,y)=>ctx.drawImage(c,Math.round(x-c.ax),Math.round(y-c.ay)),d=hyp(P.x-o.x,P.y-o.y),near=G.state==='play'&&d<3.6;
  if(near&&!o.near)o.waveT=G.t;o.near=near;
  let p=eldPose(t),f=1;if(near){const[px]=iso(P.x,P.y),w=G.t-(o.waveT||0);p={k:w<1.6?'greet':'listen',q:w/1.6};f=px<sx-4?-1:1}else if(p.back)f=-1;
  shadow(sx+6,sy+2,.7);dr(LPA.elB,sx,sy);
  const LT=G.t-(o.lt||0);if(LT>.15&&d<22){o.lt=G.t;const w=smW(o,11,-4,38);addLight(w.x,w.y,80,.45+Math.random()*.1,.18)}
  // Eldrik: a long indigo robe with a gold hem, the hood down on his shoulders, a bald head, spectacles and a beard to his chest
  const br=Math.sin(G.t*1.2)*.5,sw=Math.sin(G.t*1.1)*.4,wob=k=>Math.sin(G.t*k);let hands=[null,null],quill=true;
  if(p.k==='write'){hands=[[23+p.q*3+wob(15)*1.1,-29.4+wob(22)*.5],[13,-28.6]]}
  else if(p.k==='dip'){const e=smE(p.q<.5?p.q*2:2-p.q*2),dip=p.q>.4&&p.q<.6?Math.sin((p.q-.4)/.2*Math.PI)*1.5:0;hands=[[23+(28-23)*e,-29.4+(-32.5+29.4)*e-Math.sin(p.q*Math.PI)*3+dip],[13,-28.6]]}
  else if(p.k==='turn'){const e=smE(p.q);hands=[[27-14*e,-30-Math.sin(e*Math.PI)*5],[12,-28.6]];quill=false}
  else if(p.k==='think'||p.k==='listen'){hands=[[f*3.5+wob(2.6)*.6,-33+wob(3.3)*1.6],f>0?[12,-28]:null];quill=p.k==='listen'}
  else if(p.k==='shelf'){const r=Math.sin(Math.min(1,p.q/.8)*Math.PI);hands=[[-9-r*9,-34-r*12],null];quill=false}
  else if(p.k==='greet'){const w=Math.sin(Math.min(1,p.q)*Math.PI);hands=[[f*(9+wob(10)*2*w),-31-w*16],f>0?[12,-28.6]:null]}
  const head=(hx,hy)=>{const B=ELR.beard;
    if(p.back){blob(hx,hy,4.2,4.8,ELR.skin);for(const s of[-1,1])blob(hx+s*3.5,hy+.8,1.5,2.6,B);blob(hx,hy+2.6,3.8,1.8,B);return}
    blob(hx,hy,4.1,4.7,ELR.skin);ctx.fillStyle='rgba(255,240,220,.4)';ctx.fillRect(hx-1.8-f*.6,hy-3.8,1.8,1);
    blob(hx-f*3.6,hy+.4,1.5,2.7,B);blob(hx+f*3.9,hy+.2,.8,2,B);
    ctx.fillStyle=B[3];ctx.fillRect(hx-3+f*.7,hy-2.1,2.2,.9);ctx.fillRect(hx+.8+f*.7,hy-2.1,2.2,.9);
    const look=p.k==='write'||p.k==='dip'||p.k==='turn'?1:0;ctx.fillStyle='#140a06';ctx.fillRect(hx-2.2+f*.7+f*look*.3,hy-.5+look*.4,1.1,.9);ctx.fillRect(hx+1.2+f*.7+f*look*.3,hy-.5+look*.4,1.1,.9);
    // the spectacles catch the candle now and then
    ctx.strokeStyle='#c8a050';ctx.lineWidth=.45;for(const ex of[hx-1.65+f*.7,hx+1.75+f*.7]){ctx.beginPath();ctx.arc(ex,hy,1.35,0,7);ctx.stroke()}
    ctx.beginPath();ctx.moveTo(hx-.3+f*.7,hy-.2);ctx.lineTo(hx+.4+f*.7,hy-.2);ctx.stroke();if((G.t*.37+(o.x||0))%3<.25){ctx.fillStyle='rgba(255,250,220,.9)';ctx.fillRect(hx+1.6+f*.7,hy-1,.8,.8)}
    blob(hx+f*1.7,hy+1,1,1.2,ELR.skin);
    poly([[hx-3.7,hy+1.2],[hx+3.7,hy+1.2],[hx+3.2+sw,hy+7],[hx+1.6+sw*1.4,hy+12],[hx+sw*1.8,hy+14.5],[hx-1.6+sw*1.4,hy+12],[hx-3.2+sw,hy+7]],B);
    ctx.fillStyle=B[1];for(let k=0;k<4;k++)ctx.fillRect(hx-1.8+k*1.2+sw*1.2,hy+5+k%2*2,.5,4);
    blob(hx-1.2+f*.7,hy+2.3,1.9,.9,B);blob(hx+1.6+f*.7,hy+2.3,1.9,.9,B)};
  const robeFx=(shX,shY,hipX,hipY,bk)=>{poly([[shX-7.2,shY-1.8],[shX+7.2,shY-1.8],[shX+5.6,shY+3.6],[shX-5.6,shY+3.6]],ELR.hood);
    if(!bk){limb(shX+f*1.6,shY+3,hipX+f*2.6,-1.5,.8,.8,ELR.trim)}poly([[hipX-10.6,-2.2],[hipX+10.6,-2.2],[hipX+10.8,-.4],[hipX-10.8,-.4]],ELR.trim);
    limb(hipX-6.4,hipY,hipX+6.4,hipY,.9,.9,ELR.rope);if(!bk){limb(hipX+f*3,hipY,hipX+f*3.8,hipY+7,.5,.4,ELR.rope);blob(hipX+f*3.8,hipY+7.6,.8,.9,ELR.rope)}};
  const o2={R:{skin:ELR.skin,torso:ELR.robe,sleeve:ELR.robe,fore:ELR.robe,hand:ELR.skin,metal:{}},f,back:!!p.back,moving:false,robe:true,tw:.95,lw:.95,hunch:2.5,armsLate:true,hands,aL:9.5,head,torsoFx:robeFx};
  ctx.save();ctx.translate(sx,sy+br*.4);humanoid(o2);ctx.restore();
  dr(LPA.elF,sx,sy);
  // on the pages: the lines he has written so far, and the page he turns
  const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(sx+x,sy+y,w,h)};
  const lines=p.k==='write'?Math.floor(p.q*(p.n?3:6)):p.k==='dip'||p.k==='turn'?6:p.k==='think'||p.k==='shelf'?0:2;
  for(let k=0;k<lines;k++)R(21.2,-31.6+k*.75,4.4-(k*37%3)*.6,.35,'rgba(40,28,20,.75)');
  if(p.k!=='write'||p.n)for(let k=0;k<6;k++)R(13.6,-31.6+k*.75,4.6-(k*23%3)*.6,.35,'rgba(40,28,20,.6)');
  if(p.k==='turn'){const a=Math.PI*smE(p.q),ex=20+Math.cos(a)*7.5,ly=Math.sin(a)*5;ctx.fillStyle=a<Math.PI/2?'#f4ecd6':'#e0d4b8';
    ctx.beginPath();ctx.moveTo(sx+20,sy-31.6);ctx.lineTo(sx+ex,sy-31.4-ly);ctx.lineTo(sx+ex,sy-27-ly);ctx.lineTo(sx+20,sy-27.2);ctx.closePath();ctx.fill()}
  // the candle flame, its glow and the light on him
  const fl=Math.sin(G.t*11)*.4+Math.sin(G.t*17)*.3;ctx.fillStyle='#ff9a30';ctx.beginPath();ctx.moveTo(sx+10.2,sy-41.4);ctx.quadraticCurveTo(sx+10.4+fl*.3,sy-44.5,sx+11+fl*.5,sy-46+fl);ctx.quadraticCurveTo(sx+11.7,sy-44,sx+11.8,sy-41.4);ctx.fill();
  ctx.fillStyle='#fff0c0';ctx.fillRect(sx+10.6,sy-43.2,.9,1.8);
  ctx.save();ctx.globalCompositeOperation='lighter';const q=ctx.createRadialGradient(sx+11,sy-43,1,sx+11,sy-43,26);q.addColorStop(0,'rgba(255,190,100,.32)');q.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=q;ctx.fillRect(sx-15,sy-69,52,52);ctx.restore();
  // his arms over the desk, the quill in his hand or standing in the ink
  ctx.save();ctx.translate(sx,sy+br*.4);const A=o2.arms;A.draw(A.ao);A.draw(A.aw);
  const qd=(x,y,a)=>{const c=Math.cos(a),s=Math.sin(a);ctx.strokeStyle='#e8e2d6';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(x+c*1.5,y+s*1.5);ctx.lineTo(x+c*8,y+s*8);ctx.stroke();
    ctx.strokeStyle='#b8b0a0';ctx.lineWidth=.4;ctx.beginPath();ctx.moveTo(x+c*2,y+s*2);ctx.lineTo(x+c*8.5,y+s*8.5);ctx.stroke();ctx.strokeStyle='#1a1410';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-c*1.6,y-s*1.6);ctx.stroke()};
  if(quill){const h=A.aw;qd(h.hx+.4,h.hy+1.2,p.k==='greet'?-1.6:-1.05)}
  for(const a of[A.ao,A.aw])blob(a.hx,a.hy+.6,1.9,1.9,ELR.skin);
  if(p.k==='shelf'&&p.q>.25&&p.q<.75){const h=A.aw;R(h.hx-1.6,h.hy-4,3.2,5,'#3a1a4a');R(h.hx-1.6,h.hy-4,3.2,.6,'#c8a040')}
  ctx.restore();
  if(!quill)qd(sx+28,sy-30.2,-1.3);
  // a golden mark over his head when the chronicle has something new for you
  if((P.chrQ??-1)!==(P.qi||0)&&curQ()){const b=Math.sin(G.t*3)*2;ctx.font="bold 18px 'IM Fell English', Georgia, serif";ctx.textAlign='center';ctx.fillStyle='#000';ctx.fillText('!',sx+1,sy-60+b+1);ctx.fillStyle='#ffd040';ctx.fillText('!',sx,sy-60+b)}
  if(hov)label(sx,sy-76,'Eldrik, der Chronist','#ffd88a')};
