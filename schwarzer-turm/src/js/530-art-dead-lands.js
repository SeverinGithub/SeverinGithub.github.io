/* ---------- art of the dead lands: buildings painted over their footprint, lit from the left like the black tower ---------- */
const RGS={};
const rgEl=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.3,rx),Math.max(.3,ry),0,0,7);g.fill()};
function rgFace(g,pts,c1,c2,x0,x1){if(x0==null){x0=1e9;x1=-1e9;for(const[x]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x)}}const q=g.createLinearGradient(x0,0,x1+.01,0);q.addColorStop(0,c1);q.addColorStop(1,c2);g.fillStyle=q;g.beginPath();pts.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
function rgSpeck(g,pts,n,cols){g.save();g.beginPath();pts.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const[x,y]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
  for(let k=0;k<n;k++){g.fillStyle=cols[k%cols.length];g.fillRect(x0+Math.random()*(x1-x0)|0,y0+Math.random()*(y1-y0)|0,1,1)}g.restore()}
// a canvas whose anchor is the middle of a fw×fh footprint, with room for `top` pixels above it
function rgCanvas(fw,fh,top,f,side=0){const w=(fw+fh)*32+side*2+8,h=top+(fw+fh)*16+24,ax=w/2,ay=top+(fw+fh)*8+4;
  const c=mk(w,h,g=>withCtx(g,()=>{const Q=(x,y,z=0)=>[ax+(x-y)*32,ay+(x+y)*16-z];f(g,Q,fw/2,fh/2)}));c.ax=ax;c.ay=ay;return c}
// the two faces you can see of a box, plus its top, with windows and courses
function rgBox(g,Q,X,Y,H,o){const L=[Q(-X,Y,0),Q(X,Y,0),Q(X,Y,H),Q(-X,Y,H)],Rf=[Q(X,Y,0),Q(X,-Y,0),Q(X,-Y,H),Q(X,Y,H)];
  rgFace(g,L,o.l[0],o.l[1]);rgFace(g,Rf,o.r[0],o.r[1]);if(o.top)rgFace(g,[Q(-X,-Y,H),Q(X,-Y,H),Q(X,Y,H),Q(-X,Y,H)],o.top[0],o.top[1]);
  if(o.speck){rgSpeck(g,L,(X*2)*H*.5,o.speck);rgSpeck(g,Rf,(Y*2)*H*.5,o.speck)}
  if(o.courses){g.strokeStyle=o.courses;g.lineWidth=1;for(let z=o.cs||9;z<H;z+=o.cs||9){g.beginPath();g.moveTo(...Q(-X,Y,z));g.lineTo(...Q(X,Y,z));g.lineTo(...Q(X,-Y,z));g.stroke()}}
  return{L,Rf}}
function rgWin(g,Q,face,X,Y,t,z,w,h,col,arch){const P=(u,zz)=>face==='l'?Q(-X+u*2*X,Y,zz):Q(X,Y-u*2*Y,zz);const s=(face==='l'?X:Y)*2,du=w/(s*32)/2;
  const a=P(t-du,z),b=P(t+du,z),c=P(t+du,z+h),d=P(t-du,z+h);g.fillStyle=col;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.lineTo(...c);if(arch){const m=P(t,z+h+arch);g.lineTo(...m)}g.lineTo(...d);g.closePath();g.fill()}
function rgGable(g,Q,X,Y,H,rh,along,o){const ov=.25;
  if(along==='x'){rgFace(g,[Q(-X-ov,-Y-ov,H),Q(X+ov,-Y-ov,H),Q(X+ov,0,H+rh),Q(-X-ov,0,H+rh)],o.roof[2],o.roof[1]);
    rgFace(g,[Q(X,-Y,H),Q(X,Y,H),Q(X,0,H+rh)],o.r[0],o.r[1]);
    rgFace(g,[Q(-X-ov,Y+ov,H-3),Q(X+ov,Y+ov,H-3),Q(X+ov,0,H+rh),Q(-X-ov,0,H+rh)],o.roof[0],o.roof[1]);
    g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;for(let k=1;k<6;k++){const t=k/6;g.beginPath();g.moveTo(...Q(-X-ov,(Y+ov)*(1-t),H-3+(rh+3)*t));g.lineTo(...Q(X+ov,(Y+ov)*(1-t),H-3+(rh+3)*t));g.stroke()}
    g.strokeStyle=o.roof[3]||'rgba(255,255,255,.15)';g.beginPath();g.moveTo(...Q(-X-ov,0,H+rh));g.lineTo(...Q(X+ov,0,H+rh));g.stroke()}
  else{rgFace(g,[Q(-X-ov,-Y-ov,H),Q(-X-ov,Y+ov,H),Q(0,Y+ov,H+rh),Q(0,-Y-ov,H+rh)],o.roof[2],o.roof[1]);
    rgFace(g,[Q(-X,Y,H),Q(X,Y,H),Q(0,Y,H+rh)],o.l[0],o.l[1]);
    rgFace(g,[Q(X+ov,-Y-ov,H-3),Q(X+ov,Y+ov,H-3),Q(0,Y+ov,H+rh),Q(0,-Y-ov,H+rh)],o.roof[1],o.roof[2]);
    g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;for(let k=1;k<6;k++){const t=k/6;g.beginPath();g.moveTo(...Q((X+ov)*(1-t),-Y-ov,H-3+(rh+3)*t));g.lineTo(...Q((X+ov)*(1-t),Y+ov,H-3+(rh+3)*t));g.stroke()}
    g.strokeStyle=o.roof[3]||'rgba(255,255,255,.15)';g.beginPath();g.moveTo(...Q(0,-Y-ov,H+rh));g.lineTo(...Q(0,Y+ov,H+rh));g.stroke()}}
const RGROOF={red:['#8a3a24','#5a2214','#3a140a','rgba(255,190,150,.25)'],slate:['#5a6070','#3a3e4a','#24262e','rgba(200,220,255,.2)'],thatch:['#8a7440','#5e4c24','#3e3014','rgba(255,240,180,.2)'],moss:['#3a4a24','#26321a','#161e0e','rgba(180,220,120,.2)'],verd:['#6a9a8a','#3e6a5e','#24443a','rgba(220,255,240,.3)']};
const RGWALL={plaster:{l:['#d8c8a4','#b0a07c'],r:['#8a7a5a','#5e5038']},stone:{l:['#9a948a','#787268'],r:['#55504a','#3a3632']},dark:{l:['#5a524a','#463e38'],r:['#2e2824','#1e1a16']},pale:{l:['#e4dac4','#c4b8a0'],r:['#9a8e78','#6e6454']}};
function rgShadow(g,ax,ay,rx){rgEl(g,ax+6,ay+4,rx,rx*.45,'rgba(0,0,0,.4)')}

// town houses: timber and plaster, stone, tall gabled ones, thatch; the gable runs along the long side
function paintHouse(v,fw,fh){const st=[['plaster','red',1],['plaster','slate',1],['stone','slate',0],['plaster','thatch',1],['stone','red',0],['pale','slate',0]][v%6],tall=v===3||v===1&&fw*fh>=16;
  const H=tall?62:40+((fw+fh)%3)*6,rh=Math.min(fw,fh)*11+8,along=fw>=fh?'x':'y',W=RGWALL[st[0]],RF=RGROOF[st[1]];
  return rgCanvas(fw,fh,H+rh+30,(g,Q,X,Y)=>{rgShadow(g,...Q(0,0),(X+Y)*30);const b=rgBox(g,Q,X,Y,H,{l:W.l,r:W.r,speck:['rgba(0,0,0,.18)','rgba(255,255,255,.1)'],courses:st[2]?null:'rgba(0,0,0,.18)',cs:8});
    if(st[2]){g.strokeStyle='#3a2414';g.lineWidth=2;for(const[f,L]of[['l',X],['r',Y]]){const n=Math.round(L*2);for(let k=0;k<=n;k++){const t=k/n,a=f==='l'?Q(-X+t*2*X,Y,0):Q(X,Y-t*2*Y,0),c=f==='l'?Q(-X+t*2*X,Y,H):Q(X,Y-t*2*Y,H);g.beginPath();g.moveTo(...a);g.lineTo(...c);g.stroke()}
      for(const z of tall?[H*.5,H-2]:[H*.55]){const a=f==='l'?Q(-X,Y,z):Q(X,Y,z),c=f==='l'?Q(X,Y,z):Q(X,-Y,z);g.beginPath();g.moveTo(...a);g.lineTo(...c);g.stroke()}
      if(!tall){g.lineWidth=1.4;for(let k=0;k<n;k+=2){const t0=k/n,t1=(k+1)/n,p0=f==='l'?Q(-X+t0*2*X,Y,H*.55):Q(X,Y-t0*2*Y,H*.55),p1=f==='l'?Q(-X+t1*2*X,Y,H):Q(X,Y-t1*2*Y,H);g.beginPath();g.moveTo(...p0);g.lineTo(...p1);g.stroke()}}}}
    // a door on the lit face, windows on both
    rgWin(g,Q,'l',X,Y,.3,0,13,22,'#1e120a',4);g.fillStyle='#4a2c14';{const a=Q(-X+.6*X-.18,Y,0);g.fillRect(a[0]-1,a[1]-12,1,2)}
    const wz=tall?[10,H*.5+8]:[H*.55-14];for(const z of wz){for(const t of[.66,.86])rgWin(g,Q,'l',X,Y,t,z,7,10,'#141016',3);for(const t of Y>1.6?[.25,.62]:[.45])rgWin(g,Q,'r',X,Y,t,z,6,10,'#0c0a0c',3)}
    if(v%2===0){g.fillStyle='rgba(120,90,50,.9)';const a=Q(-X+.86*2*X-.1,Y,wz[0]+10);g.fillRect(a[0]-6,a[1]-1,4,3)}
    rgGable(g,Q,X,Y,H,rh,along,{roof:RF,l:W.l,r:W.r});
    const[cx,cy]=Q(along==='x'?X*.5:-X*.3,along==='x'?-Y*.3:Y*.5,H+rh*.7);rgFace(g,[[cx-4,cy+10],[cx+4,cy+10],[cx+4,cy-12],[cx-4,cy-12]],'#6a5e54','#3a302a');rgEl(g,cx,cy-12,4,1.6,'#24201c')})}
// the cathedral of the town: a long nave, buttresses, tall glass, one great spire at the visible end
function paintChurch(fw,fh){const H=96,rh=70,along=fw>=fh?'x':'y',W=RGWALL.stone,RF=RGROOF.slate,top=H+rh+280;
  return rgCanvas(fw,fh,top,(g,Q,X,Y)=>{rgShadow(g,...Q(0,0),(X+Y)*28);const tw=2.6,TX=along==='x'?X-tw:0,TY=along==='x'?0:Y-tw;
    rgBox(g,Q,X,Y,H,{l:W.l,r:W.r,speck:['rgba(0,0,0,.2)','rgba(255,255,255,.08)'],courses:'rgba(0,0,0,.16)',cs:10});
    const glass=(f,t,z)=>{rgWin(g,Q,f,X,Y,t,z,10,40,'#120c18',10);rgWin(g,Q,f,X,Y,t,z+4,6,30,'rgba(140,40,30,.55)',8);rgWin(g,Q,f,X,Y,t,z+16,6,8,'rgba(60,80,160,.5)',4)};
    const longF=along==='x'?'l':'r',endF=along==='x'?'r':'l',n=Math.round((along==='x'?X:Y)*2/3.2);
    for(let k=0;k<n;k++){const t=(k+.5)/n;glass(longF,t,22);const p=longF==='l'?Q(-X+(k/n)*2*X,Y,0):Q(X,Y-(k/n)*2*Y,0);rgFace(g,[[p[0]-5,p[1]],[p[0]+5,p[1]],[p[0]+3,p[1]-H-6],[p[0]-1,p[1]-H-14]],'#8a847a','#4a4640')}
    rgGable(g,Q,X,Y,H,rh,along,{roof:RF,l:W.l,r:W.r});
    // the bell tower and its spire
    const tQ=(x,y,z)=>Q(TX+x,TY+y,z),TH=H+110;rgBox(g,tQ,tw,tw,TH,{l:W.l,r:W.r,speck:['rgba(0,0,0,.2)','rgba(255,255,255,.08)'],courses:'rgba(0,0,0,.16)',cs:10});
    for(const z of[30,80,TH-40]){rgWin(g,tQ,'l',tw,tw,.5,z,9,24,'#0c0a10',7);rgWin(g,tQ,'r',tw,tw,.5,z,9,24,'#08060a',7)}
    for(let k=0;k<5;k++){for(const f of['l','r']){const t=(k+.5)/5,P=f==='l'?tQ(-tw+t*2*tw,tw,TH):tQ(tw,tw-t*2*tw,TH);g.fillStyle=f==='l'?'#8a847a':'#4a4640';g.fillRect(P[0]-3,P[1]-7,6,7)}}
    const ap=tQ(0,0,TH+190);rgFace(g,[tQ(-tw,tw,TH),tQ(tw,tw,TH),ap],RF[0],RF[1]);rgFace(g,[tQ(tw,tw,TH),tQ(tw,-tw,TH),ap],RF[1],RF[2]);
    g.strokeStyle='#e2b23c';g.lineWidth=2;g.beginPath();g.moveTo(ap[0],ap[1]);g.lineTo(ap[0],ap[1]-16);g.moveTo(ap[0]-5,ap[1]-10);g.lineTo(ap[0]+5,ap[1]-10);g.stroke();
    // the great door in the foot of the tower
    rgWin(g,tQ,endF,tw,tw,.5,0,18,34,'#1a0e08',12);rgWin(g,tQ,endF,tw,tw,.5,2,12,26,'#3a2010',8)},0)}
function paintFount(fw,fh){return rgCanvas(fw,fh,90,(g,Q,X,Y)=>{const[cx,cy]=Q(0,0);rgShadow(g,cx,cy,X*40);
  rgEl(g,cx,cy+2,X*40,X*20,'#3a3632');rgEl(g,cx,cy-6,X*40,X*20,'#8a847a');rgEl(g,cx,cy-8,X*35,X*17,'#3a4a5a');rgEl(g,cx,cy-8,X*31,X*15,'#4a6a8a');
  g.fillStyle='rgba(200,230,255,.5)';for(let k=0;k<20;k++){const a=Math.random()*6.28,r=Math.random()*X*28;g.fillRect(cx+Math.cos(a)*r,cy-8+Math.sin(a)*r*.48,2,1)}
  rgFace(g,[[cx-7,cy-8],[cx+7,cy-8],[cx+5,cy-44],[cx-5,cy-44]],'#a89e90','#5a544c');rgEl(g,cx,cy-46,12,5,'#8a847a');rgEl(g,cx,cy-48,9,3.5,'#4a6a8a');
  rgFace(g,[[cx-4,cy-48],[cx+4,cy-48],[cx+3,cy-72],[cx-3,cy-72]],'#c8bca8','#6a6050');rgEl(g,cx,cy-76,5,5,'#b0a694');g.fillStyle='rgba(255,255,255,.12)';g.fillRect(cx-2,cy-70,1,20)})}
function paintStall(v,fw,fh){const cl=[['#7a1a14','#d8c8a0'],['#1a3a6a','#c8b890'],['#3a5a1a','#d8c8a0']][v%3];
  return rgCanvas(fw,fh,70,(g,Q,X,Y)=>{rgShadow(g,...Q(0,0),X*34);for(const[x,y]of[[-X+.2,-Y+.2],[X-.2,-Y+.2],[-X+.2,Y-.2],[X-.2,Y-.2]]){const a=Q(x,y,0);g.fillStyle='#3a2614';g.fillRect(a[0]-1.5,a[1]-44,3,44)}
    rgBox(g,(x,y,z)=>Q(x,y,z),X*.9,Y*.5,14,{l:['#6a4a28','#4a3218'],r:['#3a2414','#24160a'],top:['#7a5a34','#5a3e20']});
    for(let k=0;k<5;k++){const a=Q(-X*.6+k*.35*X,Y*.2,14);rgEl(g,a[0],a[1]-3,3,3.5,['#8a2a1a','#c8a040','#3a5a2a','#5a3a6a','#a06a30'][k])}
    const n=6;for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n;g.fillStyle=k%2?cl[1]:cl[0];g.beginPath();g.moveTo(...Q(-X-.1+t0*(2*X+.2),Y+.3,36));g.lineTo(...Q(-X-.1+t1*(2*X+.2),Y+.3,36));g.lineTo(...Q(-X-.1+t1*(2*X+.2),-Y,48));g.lineTo(...Q(-X-.1+t0*(2*X+.2),-Y,48));g.fill()}
    g.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<n;k+=2){const a=Q(-X+(k+.5)/n*2*X,Y+.3,36);g.beginPath();g.moveTo(a[0]-5,a[1]);g.lineTo(a[0]+2,a[1]+7);g.lineTo(a[0]+5,a[1]);g.fill()}})}
// wall towers: v0 round with a cone, v1 square gate tower with crenels and a banner
function paintWT(v,fw,fh){const H=v?104:118;return rgCanvas(fw,fh,H+80,(g,Q,X,Y)=>{const[cx,cy]=Q(0,0),r=X*30;rgShadow(g,cx,cy,r*1.1);
  if(!v){const q=g.createLinearGradient(cx-r,0,cx+r,0);q.addColorStop(0,'#a49c90');q.addColorStop(.35,'#857e72');q.addColorStop(.8,'#4a4640');q.addColorStop(1,'#2e2a26');g.fillStyle=q;g.beginPath();g.moveTo(cx-r,cy);g.lineTo(cx-r,cy-H);g.lineTo(cx+r,cy-H);g.lineTo(cx+r,cy);g.ellipse(cx,cy,r,r*.5,0,0,Math.PI);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.2)';for(let y=cy-10;y>cy-H;y-=9){g.beginPath();g.ellipse(cx,y,r,r*.5,0,0,Math.PI);g.stroke()}
    for(const z of[30,70])rgEl(g,cx-r*.3,cy-z,2.5,6,'#0c0a0a');for(let k=0;k<7;k++){const a=Math.PI*(k+.5)/7,x=cx-Math.cos(a)*r,y=cy-H+Math.sin(a)*r*.5;g.fillStyle=k<3?'#9a948a':'#4a4640';g.fillRect(x-4,y-8,8,8)}
    rgEl(g,cx,cy-H,r,r*.5,'#2a2622');const ap=[cx,cy-H-74];rgFace(g,[[cx-r-4,cy-H],[cx+r+4,cy-H],ap],RGROOF.slate[0],RGROOF.slate[2]);g.strokeStyle='#e2b23c';g.lineWidth=1.5;g.beginPath();g.moveTo(...ap);g.lineTo(ap[0],ap[1]-10);g.stroke()}
  else{rgBox(g,Q,X*.85,Y*.85,H,{l:RGWALL.stone.l,r:RGWALL.stone.r,top:['#3a3632','#2a2622'],speck:['rgba(0,0,0,.2)','rgba(255,255,255,.08)'],courses:'rgba(0,0,0,.16)',cs:10});
    for(const f of['l','r'])for(let k=0;k<4;k++){const t=(k+.5)/4,P=f==='l'?Q(-X*.85+t*1.7*X,Y*.85,H):Q(X*.85,Y*.85-t*1.7*Y,H);g.fillStyle=f==='l'?'#8a847a':'#4a4640';g.fillRect(P[0]-4,P[1]-8,8,8)}
    rgWin(g,Q,'l',X*.85,Y*.85,.5,50,6,14,'#0c0a0a',4);rgWin(g,Q,'r',X*.85,Y*.85,.5,50,6,14,'#0c0a0a',4);
    const p=Q(0,0,H);g.fillStyle='#2a2a2a';g.fillRect(p[0],p[1]-60,2,60);g.fillStyle='#7a1a14';g.beginPath();g.moveTo(p[0]+2,p[1]-58);g.lineTo(p[0]+26,p[1]-52);g.lineTo(p[0]+2,p[1]-42);g.fill()}})}
function paintPillar(v){const H=v?150:118;return rgCanvas(1,1,H+20,(g,Q)=>{const[cx,cy]=Q(0,0);rgShadow(g,cx,cy,16);rgFace(g,[[cx-13,cy+2],[cx+13,cy+2],[cx+13,cy-12],[cx-13,cy-12]],'#6a645a','#2e2a26');
  rgFace(g,[[cx-8,cy-12],[cx+8,cy-12],[cx+8,cy-H+14],[cx-8,cy-H+14]],'#8a847a','#2a2622');g.strokeStyle='rgba(0,0,0,.3)';for(let x=-5;x<=5;x+=3.3){g.beginPath();g.moveTo(cx+x,cy-14);g.lineTo(cx+x,cy-H+16);g.stroke()}
  rgFace(g,[[cx-14,cy-H+14],[cx+14,cy-H+14],[cx+10,cy-H+2],[cx-10,cy-H+2]],'#9a948a','#3a3632');rgFace(g,[[cx-16,cy-H+2],[cx+16,cy-H+2],[cx+16,cy-H-6],[cx-16,cy-H-6]],'#7a746a','#2e2a26')})}
function paintBanner(){return rgCanvas(1,1,130,(g,Q)=>{const[cx,cy]=Q(0,0);g.fillStyle='#1a1a1e';g.fillRect(cx-1,cy-120,3,120);g.fillRect(cx-16,cy-118,34,3);
  rgFace(g,[[cx-14,cy-115],[cx+16,cy-115],[cx+16,cy-40],[cx+1,cy-28],[cx-14,cy-40]],'#8a1a14','#3a0806');g.strokeStyle='#c8962a';g.lineWidth=1.5;g.beginPath();g.moveTo(cx-12,cy-112);g.lineTo(cx-12,cy-41);g.lineTo(cx+1,cy-31);g.lineTo(cx+14,cy-41);g.lineTo(cx+14,cy-112);g.stroke();
  g.fillStyle='#e2b23c';g.beginPath();g.moveTo(cx-7,cy-90);g.lineTo(cx-7,cy-82);g.lineTo(cx+9,cy-82);g.lineTo(cx+9,cy-90);g.lineTo(cx+5,cy-86);g.lineTo(cx+1,cy-92);g.lineTo(cx-3,cy-86);g.closePath();g.fill();rgEl(g,cx+1,cy-72,6,6.5,'#d8ccb0');g.fillStyle='#3a0806';g.fillRect(cx-3,cy-74,3,3);g.fillRect(cx+2,cy-74,3,3)})}
function paintThrone(fw,fh){return rgCanvas(fw,fh,160,(g,Q,X,Y)=>{const[cx,cy]=Q(0,0);rgShadow(g,cx,cy,(X+Y)*28);
  for(let k=0;k<3;k++)rgBox(g,Q,X-k*.18,Y-k*.35,6+k*6,{l:['#5a524a','#3a342e'],r:['#2e2824','#1a1614'],top:['#6a1a14','#3a0a08']});
  const b=Q(0,0,24);rgFace(g,[[b[0]-22,b[1]],[b[0]+22,b[1]],[b[0]+24,b[1]-90],[b[0]+12,b[1]-112],[b[0],b[1]-130],[b[0]-12,b[1]-112],[b[0]-24,b[1]-90]],'#4a4440','#16141a');
  g.fillStyle='#e2b23c';for(const[x,y]of[[-22,-92],[22,-92],[0,-132],[-12,-114],[12,-114]]){g.beginPath();g.moveTo(b[0]+x-3,b[1]+y+4);g.lineTo(b[0]+x,b[1]+y-6);g.lineTo(b[0]+x+3,b[1]+y+4);g.fill()}
  rgFace(g,[[b[0]-16,b[1]-4],[b[0]+16,b[1]-4],[b[0]+16,b[1]-70],[b[0]-16,b[1]-70]],'#6a1a14','#2a0606');for(const[x,y]of[[-24,-6],[24,-6],[0,-100]]){rgEl(g,b[0]+x,b[1]+y,5,5.5,'#d8ccb0');g.fillStyle='#120806';g.fillRect(b[0]+x-3,b[1]+y-2,2,2);g.fillRect(b[0]+x+1,b[1]+y-2,2,2)}})}
function paintBell(v,fw,fh){const H=v?170:220,sp=v?90:150,W=RGWALL.stone;return rgCanvas(fw,fh,H+sp+30,(g,Q,X,Y)=>{rgShadow(g,...Q(0,0),(X+Y)*28);rgBox(g,Q,X,Y,H,{l:W.l,r:W.r,speck:['rgba(0,0,0,.2)','rgba(255,255,255,.08)'],courses:'rgba(0,0,0,.16)',cs:11});
  for(const z of[40,100]){rgWin(g,Q,'l',X,Y,.5,z,8,22,'#0c0a10',6);rgWin(g,Q,'r',X,Y,.5,z,8,22,'#08060a',6)}
  for(const f of['l','r'])for(const t of[.3,.7])rgWin(g,Q,f,X,Y,t,H-48,14,34,'#060406',10);{const c=Q(0,0,H-40);rgEl(g,c[0],c[1],8,9,'#a87418');rgEl(g,c[0]-2,c[1]-3,3,3,'#e2b23c')}
  const ap=Q(0,0,H+sp),RF=RGROOF.slate;rgFace(g,[Q(-X,Y,H),Q(X,Y,H),ap],RF[0],RF[1]);rgFace(g,[Q(X,Y,H),Q(X,-Y,H),ap],RF[1],RF[2]);g.strokeStyle='#c8a050';g.lineWidth=1.6;g.beginPath();g.moveTo(...ap);g.lineTo(ap[0],ap[1]-14);g.stroke()})}
function paintHut(v,fw,fh){const wood=[['#3a2a1a','#24180e'],['#2a2a22','#18180e'],['#3a1e14','#20100a']][v%3];return rgCanvas(fw,fh,230,(g,Q,X,Y)=>{rgShadow(g,...Q(0,0),(X+Y)*26);
  for(const[x,y]of[[-X+.4,Y-.4],[X-.4,Y-.4],[X-.4,-Y+.4]]){const a=Q(x,y,0);g.fillStyle='#1a120a';g.fillRect(a[0]-2,a[1]-26,4,26)}
  const S=24,q=(x,y,z)=>{const p=Q(x*.82,y*.82,z+S);return[p[0]+(z/60)*(v%2?6:-5),p[1]]};
  rgFace(g,[q(-X,Y,0),q(X,Y,0),q(X,Y,46),q(-X,Y,50)],wood[0],wood[1]);rgFace(g,[q(X,Y,0),q(X,-Y,0),q(X,-Y,44),q(X,Y,46)],wood[1],'#0c0806');
  g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1;for(let z=6;z<46;z+=6){g.beginPath();g.moveTo(...q(-X,Y,z));g.lineTo(...q(X,Y,z));g.lineTo(...q(X,-Y,z));g.stroke()}
  for(const[f,t]of[['l',.3],['l',.75],['r',.5]]){const p=f==='l'?q(-X+t*2*X,Y,24):q(X,Y-t*2*Y,24);rgEl(g,p[0],p[1],5,6,'#0a1a08');rgEl(g,p[0],p[1],3.4,4,'#3a8a2a')}
  const d=q(-X+.5*2*X,Y,0);g.fillStyle='#0a0604';g.fillRect(d[0]-6,d[1]-22,12,22);const st=Q(-X+.5*2*X,Y+1.6,0);for(let k=0;k<4;k++){g.fillStyle='#2a1a0e';g.fillRect(st[0]-6+k*.8,st[1]-k*6-2,12,3)}
  const RF=RGROOF.moss,ap=q(.25,-.2,178);rgFace(g,[q(-X-.4,Y+.4,44),q(X+.4,Y+.4,42),ap],RF[0],RF[1]);rgFace(g,[q(X+.4,Y+.4,42),q(X+.4,-Y-.4,40),ap],RF[1],RF[2]);
  for(let k=0;k<30;k++){const t=Math.random(),u=Math.random()*.9;const a=q(-X-.4+t*(2*X+.8),Y+.4,44),p=[a[0]+(ap[0]-a[0])*u,a[1]+(ap[1]-a[1])*u];g.fillStyle=k%3?'#1e2a12':'#5a6a2a';g.fillRect(p[0],p[1],2,1)}
  const ch=q(X*.35,-Y*.35,104);rgFace(g,[[ch[0]-4,ch[1]+8],[ch[0]+5,ch[1]+6],[ch[0]+7,ch[1]-18],[ch[0]-2,ch[1]-16]],'#4a3a2a','#2a1e14');
  for(const[x,y]of[[-X-.6,Y+.2],[X+.3,Y+.6]]){const a=Q(x,y,0);g.fillStyle='#2a1e12';g.fillRect(a[0]-1,a[1]-34,2,34);rgEl(g,a[0],a[1]-36,4,4.4,'#d8ccb0');g.fillStyle='#120806';g.fillRect(a[0]-2,a[1]-37,1.5,1.5);g.fillRect(a[0]+1,a[1]-37,1.5,1.5)}})}
function paintFTower(v,fw,fh){const H=[200,240,170][v%3],W=RGWALL.dark;return rgCanvas(fw,fh,H+40,(g,Q,X,Y)=>{rgShadow(g,...Q(0,0),(X+Y)*26);const[cx,cy]=Q(0,0);
  if(v%3!==1){const r=X*27,q=g.createLinearGradient(cx-r,0,cx+r,0);q.addColorStop(0,'#5e564e');q.addColorStop(.4,'#463e38');q.addColorStop(1,'#16120e');g.fillStyle=q;g.beginPath();g.moveTo(cx-r,cy);
    const top=k=>cy-H+((k*37)%23)*(v%3===2?2:1);for(let k=0;k<=8;k++)g.lineTo(cx-r+k*r/4,top(k));g.lineTo(cx+r,cy);g.ellipse(cx,cy,r,r*.5,0,0,Math.PI);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.3)';for(let y=cy-8;y>cy-H+20;y-=10){g.beginPath();g.ellipse(cx,y,r,r*.5,0,0,Math.PI);g.stroke()}for(const z of[50,110,H-50])rgEl(g,cx-r*.35,cy-z,3,8,'#060404');}
  else{rgBox(g,Q,X*.8,Y*.8,H,{l:W.l,r:W.r,speck:['rgba(0,0,0,.25)','rgba(255,255,255,.06)'],courses:'rgba(0,0,0,.2)',cs:10});for(const z of[60,140])for(const f of['l','r'])rgWin(g,Q,f,X*.8,Y*.8,.5,z,7,18,'#060404',5)}
  for(let k=0;k<70;k++){const x=cx+(Math.random()-.5)*X*50,y=cy-Math.random()*H*.85;g.fillStyle=k%4?'#5a0e0e':'#8a1a14';g.fillRect(x,y,2,2+Math.random()*3)}})}
function paintCastle(fw,fh){const top=700;return rgCanvas(fw,fh,top,(g,Q,X,Y)=>{const[cx,cy]=Q(0,0),base=Q(X,Y)[1],Rn=mulberry(9091),rr=(a,b)=>a+Rn()*(b-a);
  const ST=['#efe6d2','#d4c8ae','#a89a80','#6e6250'],HAZE=a=>`rgba(214,216,226,${a})`;
  const cyl=(x,y,r,h,roof,haze=0,win=1)=>{const q=g.createLinearGradient(x-r,0,x+r,0);q.addColorStop(0,ST[0]);q.addColorStop(.3,ST[1]);q.addColorStop(.75,ST[2]);q.addColorStop(1,ST[3]);g.fillStyle=q;g.beginPath();g.moveTo(x-r,y);g.lineTo(x-r,y-h);g.lineTo(x+r,y-h);g.lineTo(x+r,y);g.ellipse(x,y,r,r*.35,0,0,Math.PI);g.closePath();g.fill();
    g.strokeStyle='rgba(60,50,40,.18)';for(let yy=y-8;yy>y-h;yy-=8){g.beginPath();g.ellipse(x,yy,r,r*.35,0,0,Math.PI);g.stroke()}
    if(win)for(let yy=y-30;yy>y-h+20;yy-=Math.max(28,r*1.4))for(const dx of r>18?[-r*.45,0,r*.45]:[0]){g.fillStyle='#2a2430';g.beginPath();g.moveTo(x+dx-2.5,yy);g.lineTo(x+dx-2.5,yy-9);g.lineTo(x+dx,yy-13);g.lineTo(x+dx+2.5,yy-9);g.lineTo(x+dx+2.5,yy);g.fill();if(Rn()<.4){g.fillStyle='rgba(255,200,110,.85)';g.fillRect(x+dx-1.5,yy-8,3,6)}}
    for(let k=0;k<Math.max(5,r/3);k++){const a=Math.PI*(k+.5)/Math.max(5,r/3),xx=x-Math.cos(a)*r,yy=y-h+Math.sin(a)*r*.35;g.fillStyle=k<3?ST[1]:ST[2];g.fillRect(xx-2.5,yy-6,5,6)}
    if(roof){const ap=[x,y-h-roof];rgFace(g,[[x-r-3,y-h],[x+r+3,y-h],ap],'#7a8494','#2e3440');g.strokeStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(x-r*.3,y-h);g.lineTo(...ap);g.stroke();g.strokeStyle='#e8c060';g.lineWidth=1.5;g.beginPath();g.moveTo(...ap);g.lineTo(ap[0],ap[1]-12);g.stroke();g.lineWidth=1}
    if(haze){g.fillStyle=HAZE(haze);g.fillRect(x-r-4,y-h-(roof||0)-14,r*2+8,h+(roof||0)+20)}};
  const box=(x,y,w,h,d=.5,haze=0)=>{rgFace(g,[[x-w,y],[x,y+w*d],[x,y+w*d-h],[x-w,y-h]],ST[0],ST[1]);rgFace(g,[[x,y+w*d],[x+w,y],[x+w,y-h],[x,y+w*d-h]],ST[2],ST[3]);
    g.strokeStyle='rgba(60,50,40,.16)';for(let z=8;z<h;z+=8){g.beginPath();g.moveTo(x-w,y-z);g.lineTo(x,y+w*d-z);g.lineTo(x+w,y-z);g.stroke()}
    for(let z=26;z<h-14;z+=30)for(const s of[-1,1])for(const u of[.35,.7]){const xx=x+s*w*u,yy=y+w*d*(1-u)-z;g.fillStyle='#2a2430';g.fillRect(xx-2,yy-12,4,12);if(Rn()<.35){g.fillStyle='rgba(255,200,110,.8)';g.fillRect(xx-1,yy-9,2,6)}}
    if(haze){g.fillStyle=HAZE(haze);g.beginPath();g.moveTo(x-w,y);g.lineTo(x,y+w*d);g.lineTo(x+w,y);g.lineTo(x+w,y-h);g.lineTo(x,y-h-w*d);g.lineTo(x-w,y-h);g.fill()}};
  const arches=(x0,x1,y,h,n,haze=0)=>{rgFace(g,[[x0,y],[x1,y],[x1,y-h],[x0,y-h]],ST[1],ST[2]);for(let k=0;k<n;k++){const a=x0+(k+.5)*(x1-x0)/n,w=(x1-x0)/n*.32;g.fillStyle='#4a4450';g.beginPath();g.moveTo(a-w,y);g.lineTo(a-w,y-h*.55);g.quadraticCurveTo(a,y-h*.85,a+w,y-h*.55);g.lineTo(a+w,y);g.fill()}if(haze){g.fillStyle=HAZE(haze);g.fillRect(x0,y-h,x1-x0,h)}};
  // the sky behind: a pale glow so the silhouette reads against any time of day
  {const q=g.createRadialGradient(cx,cy-560,40,cx,cy-560,620);q.addColorStop(0,'rgba(255,236,190,.35)');q.addColorStop(1,'rgba(255,236,190,0)');g.fillStyle=q;g.fillRect(0,0,g.canvas.width,g.canvas.height)}
  // rock foundation
  rgFace(g,[[cx-512,base-256],[cx-470,base-330],[cx-120,base-380],[cx+150,base-370],[cx+470,base-330],[cx+512,base-256],[cx,base]],'#6a6052','#2a2622');
  for(let k=0;k<40;k++){g.strokeStyle='rgba(0,0,0,.25)';const x=cx+rr(-480,480),yb=base-Math.abs(x-cx)*.5-rr(4,40);g.beginPath();g.moveTo(x,Math.min(yb-20,base-rr(260,360)));g.lineTo(x+rr(-10,10),yb);g.stroke()}
  // far towers in the haze
  for(const[dx,dy,r,h,rf]of[[-430,-330,16,330,70],[-300,-420,14,360,80],[300,-420,15,380,90],[440,-320,18,300,70],[-180,-470,12,300,60],[200,-480,12,320,70]])cyl(cx+dx,base+dy,r,h,rf,.45);
  arches(cx-460,cx+460,base-380,90,18,.35);
  // the keep and its great dome
  box(cx,base-420,190,320,.5,.12);
  {const y=base-760,r=150;const q=g.createLinearGradient(cx-r,0,cx+r,0);q.addColorStop(0,'#8ab4a8');q.addColorStop(.35,'#5e8a7e');q.addColorStop(1,'#1e3a32');g.fillStyle=q;g.beginPath();g.ellipse(cx,y,r,r*.95,0,Math.PI,0);g.fill();
    g.strokeStyle='rgba(20,40,34,.5)';g.lineWidth=2;for(let k=-3;k<=3;k++){g.beginPath();g.ellipse(cx,y,Math.abs(k)*r/3.5+.1,r*.95,0,Math.PI,0);g.stroke()}g.lineWidth=1;
    cyl(cx,y-r*.92,30,90,0,0);{const ap=[cx,y-r*.92-90-170];rgFace(g,[[cx-34,y-r*.92-90],[cx+34,y-r*.92-90],ap],'#7a8494','#2e3440');g.strokeStyle='#e8c060';g.lineWidth=2;g.beginPath();g.moveTo(...ap);g.lineTo(ap[0],ap[1]-20);g.moveTo(ap[0]-6,ap[1]-12);g.lineTo(ap[0]+6,ap[1]-12);g.stroke()}
    rgFace(g,[[cx-190,y+40],[cx+190,y+40],[cx+190,y+10],[cx-190,y+10]],ST[1],ST[3])}
  // mid towers and connecting walls
  for(const[dx,dy,r,h,rf]of[[-260,-300,34,440,150],[260,-300,34,460,160],[-120,-250,22,520,180],[120,-250,22,540,190]])cyl(cx+dx,base+dy,r,h,rf,0);
  arches(cx-250,cx-150,base-520,60,4);arches(cx+150,cx+250,base-520,60,4);
  box(cx-360,base-180,110,250,.5);box(cx+360,base-180,110,250,.5);
  for(const[dx,dy,r,h,rf]of[[-470,-170,30,260,110],[470,-170,30,260,110]])cyl(cx+dx,base+dy,r,h,rf);
  // the curtain wall and gatehouse, right in front of you
  arches(cx-420,cx+420,base-70,140,14);rgFace(g,[[cx-430,base-210],[cx+430,base-210],[cx+430,base-196],[cx-430,base-196]],ST[0],ST[2]);for(let k=0;k<40;k++){const x=cx-424+k*21.6;g.fillStyle=k<20?ST[0]:ST[2];g.fillRect(x,base-222,12,12)}
  box(cx,base-40,120,220,.4);for(const s of[-1,1])cyl(cx+s*150,base-30,40,300,170);
  {const gx=cx,gy=base-10;g.fillStyle='#120e10';g.beginPath();g.moveTo(gx-40,gy);g.lineTo(gx-40,gy-80);g.quadraticCurveTo(gx,gy-130,gx+40,gy-80);g.lineTo(gx+40,gy);g.fill();
    g.strokeStyle='#3a3438';g.lineWidth=3;for(let x=-32;x<=32;x+=10){g.beginPath();g.moveTo(gx+x,gy);g.lineTo(gx+x,gy-90-(32-Math.abs(x))*.8);g.stroke()}for(let y=10;y<100;y+=14){g.beginPath();g.moveTo(gx-38,gy-y);g.lineTo(gx+38,gy-y);g.stroke()}g.lineWidth=1;
    g.strokeStyle=ST[0];g.lineWidth=4;g.beginPath();g.moveTo(gx-46,gy);g.lineTo(gx-46,gy-82);g.quadraticCurveTo(gx,gy-140,gx+46,gy-82);g.lineTo(gx+46,gy);g.stroke();g.lineWidth=1;
    for(const s of[-1,1]){g.fillStyle='#7a1a14';g.fillRect(gx+s*80-12,gy-200,24,90);g.fillStyle='#e2b23c';g.fillRect(gx+s*80-6,gy-176,12,12)}}
  // mist curling round the foot of it all
  for(let k=0;k<14;k++){const x=cx+rr(-560,560),y=base-rr(0,260),r=rr(80,200),q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba(236,232,224,.35)');q.addColorStop(1,'rgba(236,232,224,0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2)}},220)}
function rgSprite(k,v,fw,fh){const key=k+'|'+v+'|'+fw+'x'+fh;if(RGS[key])return RGS[key];let c=null;
  if(k==='rghouse')c=paintHouse(v,fw,fh);else if(k==='rgchurch')c=paintChurch(fw,fh);else if(k==='rgfount')c=paintFount(fw,fh);else if(k==='rgstall')c=paintStall(v,fw,fh);else if(k==='rgwt')c=paintWT(v,fw,fh);
  else if(k==='rgpillar')c=paintPillar(v);else if(k==='rgbanner')c=paintBanner();else if(k==='rgthrone')c=paintThrone(fw,fh);else if(k==='rgbell')c=paintBell(v,fw,fh);else if(k==='rghut')c=paintHut(v,fw,fh);
  else if(k==='rgtower')c=paintFTower(v,fw,fh);else if(k==='rgcastle')c=paintCastle(fw,fh);return RGS[key]=c}

// forest trees with crimson crowns, dead black ones, and a red carpet for the church floor
function rgBuildSprites(){if(SPR.prop.rgtree)return;const Rs=mulberry(4242),rr=(a,b)=>a+Rs()*(b-a);
  const RED=[['#1a0404','#4a0a0a','#7a1410','#b0301e'],['#140206','#3a0612','#62101e','#94223a'],['#1e0806','#501a0c','#842c14','#b8502a']];
  SPR.prop.rgtree=[];for(let v=0;v<4;v++){const c=mk(96,150,g=>withCtx(g,()=>{rgEl(g,48,138,24,9,'rgba(0,0,0,.45)');limb(48,138,48+(v-1.5)*3,62,4.2,2.4,RP.dark);limb(48,96,30,74,1.8,1,RP.dark);limb(48,88,66,68,1.8,1,RP.dark);
    const C=RED[v%3];for(let k=0;k<16;k++)blob(48+rr(-26,26),58+rr(-30,16)-(v===3?14:0),rr(10,17),rr(8,13),C);for(let k=0;k<26;k++){g.fillStyle=k%2?C[3]:'#d06a3a';g.fillRect(48+rr(-28,28)|0,48+rr(-34,22)|0,1,1)}
    for(let k=0;k<5;k++){g.fillStyle='rgba(60,4,4,.7)';g.fillRect(48+rr(-20,20)|0,rr(80,130)|0,2,2)}}));c.ax=48;c.ay=138;SPR.prop.rgtree.push(c)}
  SPR.prop.rgdead=[];for(let v=0;v<3;v++){const c=mk(90,140,g=>withCtx(g,()=>{rgEl(g,45,128,18,7,'rgba(0,0,0,.45)');limb(45,128,45+(v-1)*4,40,3.6,1.2,RP.dark);
    for(let k=0;k<7;k++){const y=rr(46,100),s=k%2?1:-1,l=rr(16,30);limb(45,y,45+s*l,y-rr(10,24),1.4,.4,RP.dark);limb(45+s*l,y-rr(10,24),45+s*(l+8),y-rr(24,36),.8,.2,RP.dark)}}));c.ax=45;c.ay=128;SPR.prop.rgdead.push(c)}
  SPR.deco.rgcarpet=[mk(64,32,g=>{g.beginPath();g.moveTo(32,1);g.lineTo(63,16);g.lineTo(32,31);g.lineTo(1,16);g.closePath();g.fillStyle='#4a0808';g.fill();g.strokeStyle='#8a5a14';g.lineWidth=1.2;g.stroke();g.save();g.clip();specks(g,64,32,40,['#2a0404','#6a1010'])})]}
const PLIGHT_RG={rglamp:{r:150,a:.8,col:'255,170,80',f:6,h:46},rgcaul:{r:150,a:.75,col:'90,255,90',f:8,h:16},rghut:{r:120,a:.55,col:'90,220,80',f:4,h:40}};
const _propLightR=propLight;propLight=function(p){return PLIGHT_RG[p.k]||_propLightR(p)};
// dynamic bits and the big painted sprites
const _drawPropR=drawProp;drawProp=function(p){if(!p.k||p.k.slice(0,2)!=='rg')return _drawPropR(p);const[sx,sy]=iso(p.x,p.y);const big=p.k==='rgcastle'?1700:p.k==='rgchurch'||p.k==='rgbell'?520:300;
  if(sx<-big||sx>W+big||sy<-big*.6||sy>H+big)return;const t=G.t;
  if(p.k==='rglamp'){shadow(sx,sy,.2);ctx.fillStyle='#16161a';ctx.fillRect(sx-1.5,sy-48,3,48);ctx.fillRect(sx-6,sy-50,12,2);ctx.fillStyle='#2a2a30';ctx.fillRect(sx+3,sy-50,6,10);flame(sx+6,sy-42,4,p.ph);return}
  if(p.k==='rgcaul'){shadow(sx,sy,.32);for(let k=0;k<3;k++){const a=k*2.1+t*.2;ctx.fillStyle='#1a1410';ctx.fillRect(sx+Math.cos(a)*10-1,sy-4+Math.sin(a)*4,2,6)}
    ctx.fillStyle='rgba(120,255,110,.45)';ctx.beginPath();ctx.ellipse(sx,sy-4,10,4,0,0,7);ctx.fill();ctx.fillStyle='#0c0c10';ctx.beginPath();ctx.ellipse(sx,sy-14,13,10,0,0,Math.PI);ctx.fill();ctx.beginPath();ctx.ellipse(sx,sy-14,13,4,0,0,7);ctx.fill();
    ctx.fillStyle='#3ac83a';ctx.beginPath();ctx.ellipse(sx,sy-15,10,3,0,0,7);ctx.fill();for(let k=0;k<3;k++){const b=(t*1.4+k*.33)%1;ctx.fillStyle=`rgba(180,255,150,${1-b})`;ctx.beginPath();ctx.arc(sx-6+k*6,sy-16-b*14,1.5+b*2,0,7);ctx.fill()}
    if(Math.random()<.06)G.fx.push({x:p.x+rnd(-.2,.2),y:p.y+rnd(-.2,.2),z:.6,vx:0,vy:0,vz:1,life:1.2,t:0,col:'#8aff7a',s:1.4});return}
  if(p.k==='rgrock'){const z=70+(p.v*37)%90+Math.sin(t*.6+p.ph)*8,s=[1,1.4,.8,1.8][p.v];ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(sx,sy+30,16*s,6*s,0,0,7);ctx.fill();
    ctx.save();ctx.translate(sx,sy-z);ctx.scale(s,s);ctx.fillStyle='#2e2a26';ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-10,14);ctx.lineTo(-2,26);ctx.lineTo(6,16);ctx.lineTo(15,2);ctx.closePath();ctx.fill();ctx.fillStyle='#4a443c';ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-10,14);ctx.lineTo(-2,26);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();
    ctx.fillStyle='#4a7a2a';ctx.beginPath();ctx.ellipse(0,0,16,6,0,0,7);ctx.fill();ctx.fillStyle='#6a9a3a';ctx.beginPath();ctx.ellipse(-3,-1,10,3.5,0,0,7);ctx.fill();ctx.restore();return}
  if(p.k==='rgportc'){const open=G.owBoss&&G.owBoss.rgk,lift=open?Math.min(1,(G.rgOpenT||1)):0,c=rgSprite('rgpillar',0,1,1),ax=p.fw>p.fh,L=(ax?p.fw:p.fh)/2;
    for(const s of[-1,1]){const[px,py]=iso(p.x+(ax?s*L:0),p.y+(ax?0:s*L));ctx.drawImage(c,px-c.ax,py-c.ay)}
    const a=iso(p.x+(ax?-L:0),p.y+(ax?0:-L)),b=iso(p.x+(ax?L:0),p.y+(ax?0:L)),h=WH+10,off=lift*(h-6);ctx.save();ctx.beginPath();ctx.moveTo(a[0],a[1]-h-4);ctx.lineTo(b[0],b[1]-h-4);ctx.lineTo(b[0],b[1]);ctx.lineTo(a[0],a[1]);ctx.closePath();ctx.clip();
    ctx.strokeStyle='#2a2c33';ctx.lineWidth=3;for(let k=0;k<=8;k++){const u=k/8,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u-off;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-h);ctx.stroke()}for(let z=6;z<h;z+=10){ctx.beginPath();ctx.moveTo(a[0],a[1]-z-off);ctx.lineTo(b[0],b[1]-z-off);ctx.stroke()}
    ctx.strokeStyle='#787d88';ctx.lineWidth=1;for(let k=0;k<=8;k++){const u=k/8,x=a[0]+(b[0]-a[0])*u,y=a[1]+(b[1]-a[1])*u-off;ctx.beginPath();ctx.moveTo(x-1,y);ctx.lineTo(x-1,y-h);ctx.stroke()}ctx.restore();return}
  const c=rgSprite(p.k,p.v,p.fw||1,p.fh||1);if(!c)return;if(sx-c.ax>W||sx-c.ax+c.width<0||sy-c.ay>H||sy-c.ay+c.height<0)return;const pd=P.x+P.y,d=p.x+p.y,[psx,psy]=iso(P.x,P.y);
  const fade=p.k!=='rgcastle'&&d>pd+.4&&Math.abs(sx-psx)<(p.fw+p.fh)*18&&psy<sy+10&&psy>sy-c.ay+20;if(fade)ctx.globalAlpha=.42;ctx.drawImage(c,sx-c.ax,sy-c.ay);ctx.globalAlpha=1;
  if(p.k==='rghut'){for(let k=0;k<2;k++){const ph=(t*.5+k*.5+p.ph)%1;ctx.fillStyle=`rgba(90,90,80,${.35*(1-ph)})`;ctx.beginPath();ctx.arc(sx+(p.v%2?10:-6)+ph*8,sy-c.ay+40-ph*40,4+ph*8,0,7);ctx.fill()}}
  if(p.k==='rgfount'&&Math.random()<.2)G.fx.push({x:p.x+rnd(-.4,.4),y:p.y+rnd(-.4,.4),z:1.4,vx:rnd(-.5,.5),vy:rnd(-.5,.5),vz:1.2,life:.6,t:0,col:'#c8e4ff',s:1.2})};

