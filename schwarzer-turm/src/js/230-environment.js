/* ---------- environment: themed rooms, props, light shafts, critters ---------- */
const withCtx=(g,fn)=>{const prev=ctx;ctx=g;try{fn()}finally{ctx=prev}};
const THEMES=['crypt','moss','ossuary','ritual','flooded','mold','collapsed','storage'];
const TINT=[null,'30,64,12','96,84,62','90,0,0','4,14,30','58,66,14','70,60,46',null];
const CAPC={cyan:['#0e4a4a','#40e0d0','#c0fff8'],green:['#24400e','#9ae050','#e8ffc0'],violet:['#2e1a52','#b080ff','#f0e0ff']};
function buildEnvSprites(){
  const Rs=mulberry(777),rr=(a,b)=>a+Rs()*(b-a),pr=a=>a[Math.floor(Rs()*a.length)],D=SPR.deco,S=SPR.prop={};
  const el=(g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(.3,rx),Math.max(.3,ry),0,0,7);g.fill()};
  const flat=(k,n,w,h,f)=>{D[k]=[];for(let v=0;v<n;v++)D[k].push(mk(w,h,g=>f(g,w,h,v)))};
  // floor decals (already squashed to the floor plane)
  flat('moss',5,72,36,(g,w,h)=>{for(let k=0;k<34;k++){const t=k/34,x=w/2+(Rs()-.5)*w*.8*(1-t*.5),y=h/2+(Rs()-.5)*h*.7*(1-t*.5),r=rr(2.5,7)*(1-t*.4);el(g,x,y+1,r+1,(r+1)*.5,'#0a1206');el(g,x,y,r,r*.5,pr(['#1e2e0e','#2a3e14','#3a5418','#4a6820']))}
    for(let k=0;k<40;k++){g.fillStyle=pr(['#7a9a3a','#5e7a2a','#9ab848']);g.fillRect(w/2+(Rs()-.5)*w*.7|0,h/2+(Rs()-.5)*h*.6|0,1,1)}});
  flat('mold',4,56,28,(g,w,h)=>{for(let k=0;k<22;k++){const x=w/2+(Rs()-.5)*w*.75,y=h/2+(Rs()-.5)*h*.65,r=rr(2,6);el(g,x,y,r,r*.5,pr(['rgba(120,128,50,.75)','rgba(90,100,36,.8)','rgba(170,170,110,.6)']))}
    for(let k=0;k<14;k++){g.fillStyle=pr(['#6a3a7a','#d8d8b0','#4a5a20']);g.fillRect(w/2+(Rs()-.5)*w*.6|0,h/2+(Rs()-.5)*h*.5|0,1+(Rs()<.3),1)}});
  flat('puddle',4,80,40,(g,w,h)=>{for(let k=0;k<6;k++)el(g,w/2+(Rs()-.5)*w*.4,h/2+(Rs()-.5)*h*.3,rr(10,22),rr(5,10),'#0a1016');for(let k=0;k<4;k++)el(g,w/2+(Rs()-.5)*w*.3,h/2+(Rs()-.5)*h*.2,rr(6,14),rr(3,6),'#121c26');
    g.strokeStyle='rgba(120,160,190,.55)';g.lineWidth=1;g.beginPath();g.ellipse(w/2-6,h/2-3,16,5,0,Math.PI*1.1,Math.PI*1.8);g.stroke();g.fillStyle='rgba(220,236,255,.7)';g.fillRect(w/2-8,h/2-5,6,1)});
  flat('cobweb',3,48,30,(g,w,h)=>{g.strokeStyle='rgba(225,222,210,.5)';g.lineWidth=.8;const cx=6,cy=4;for(let k=0;k<6;k++){const a=k/5*1.4+.1;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*42,cy+Math.sin(a)*26);g.stroke()}
    for(let r=8;r<42;r+=7){g.beginPath();for(let k=0;k<6;k++){const a=k/5*1.4+.1,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.62;k?g.quadraticCurveTo(cx+Math.cos(a-.14)*(r-2),cy+Math.sin(a-.14)*(r-2)*.62,x,y):g.moveTo(x,y)}g.stroke()}});
  flat('roots',4,80,36,(g,w,h)=>{g.lineCap='round';for(let k=0;k<5;k++){let x=rr(4,20),y=rr(6,30);g.beginPath();g.moveTo(x,y);for(let s=0;s<4;s++){x+=rr(10,18);y+=rr(-6,6);g.lineTo(x,y)}g.strokeStyle='#120a04';g.lineWidth=rr(2.5,4);g.stroke();g.strokeStyle=pr(['#3a2414','#4f3017','#5a3a20']);g.lineWidth-=1.2;g.stroke()}});
  flat('leaves',3,50,26,(g,w,h)=>{for(let k=0;k<26;k++){g.fillStyle=pr(['#5a3010','#7a4a18','#3a2008','#8a5a20']);g.fillRect(rr(4,w-6)|0,rr(3,h-4)|0,2,1)}});
  flat('straw',3,56,28,(g,w,h)=>{for(let k=0;k<40;k++){const x=rr(6,w-6),y=rr(4,h-4),a=rr(-.6,.6);g.strokeStyle=pr(['#8a7a3a','#b0a050','#6a5a20']);g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*7,y+Math.sin(a)*2.5);g.stroke()}});
  flat('wax',3,30,16,(g,w,h)=>{for(let k=0;k<5;k++)el(g,rr(6,w-6),rr(4,h-4),rr(1.5,4),rr(1,2),pr(['#d8d0b0','#c8c098','#efe8cc']))});
  flat('smear',3,72,30,(g,w,h)=>{g.lineCap='round';for(let k=0;k<4;k++){g.strokeStyle=pr(['rgba(70,6,4,.8)','rgba(100,10,6,.7)']);g.lineWidth=rr(2,5);g.beginPath();g.moveTo(8,h/2+rr(-5,5));g.quadraticCurveTo(w/2,h/2+rr(-9,9),w-8,h/2+rr(-5,5));g.stroke()}});
  flat('pebbles',3,40,20,(g,w,h)=>{for(let k=0;k<9;k++){const x=rr(5,w-5),y=rr(4,h-4),r=rr(1.2,2.6);el(g,x,y+.7,r+.5,r*.6+.4,'#0c0a08');el(g,x,y,r,r*.6,pr(['#5a5248','#6a6258','#4a443c']));g.fillStyle='rgba(255,240,220,.25)';g.fillRect(x-r*.4|0,y-r*.3|0,1,1)}});
  flat('runes',1,120,60,(g,w,h)=>{g.strokeStyle='#5a0a06';g.lineWidth=2.4;g.beginPath();g.ellipse(w/2,h/2,52,24,0,0,7);g.stroke();g.lineWidth=1.4;g.beginPath();g.ellipse(w/2,h/2,42,19,0,0,7);g.stroke();
    g.beginPath();for(let k=0;k<6;k++){const a=k*2*Math.PI*2/5-Math.PI/2,x=w/2+Math.cos(a)*40,y=h/2+Math.sin(a)*18;k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
    for(let k=0;k<12;k++){const a=k/12*6.283,x=w/2+Math.cos(a)*47,y=h/2+Math.sin(a)*21.5;g.fillStyle='#7a1010';g.fillRect(x-1.5|0,y-1|0,3,2);g.fillRect(x|0,y-2|0,1,4)}});
  flat('flowers',5,44,24,(g,w,h,v)=>{const c=['#d0261c','#ffc020','#f0f0e0','#9a40e0','#ff8ab0'][v];for(let k=0;k<9;k++){const x=rr(5,w-5),y=rr(8,h-3);g.fillStyle='#2a5a10';g.fillRect(x|0,y-3|0,1,3);g.fillStyle=c;g.fillRect(x-1|0,y-5|0,3,2);g.fillStyle='#fff4a0';g.fillRect(x|0,y-5|0,1,1)}});
  flat('tuft',4,32,24,(g,w,h,v)=>{for(let k=0;k<16;k++){const x=w/2+rr(-9,9),a=rr(-.5,.5),l=rr(6,13);g.strokeStyle=pr(v%2?['#2f6a14','#4fa020','#1c3a0c']:['#3a7a18','#6cbc20','#24500c']);g.lineWidth=1;g.beginPath();g.moveTo(x,h-3);g.lineTo(x+Math.sin(a)*l,h-3-Math.cos(a)*l);g.stroke()}});
  flat('shrooms',2,30,22,(g,w,h)=>{for(let k=0;k<4;k++){const x=rr(6,w-6),y=rr(12,h-3);g.fillStyle='#e8e0c8';g.fillRect(x|0,y-4|0,1.5,4);el(g,x+.5,y-5,3.2,2,'#a3201a');g.fillStyle='#f6f0de';g.fillRect(x-1|0,y-6|0,1,1)}});
  // standing props: every canvas carries its anchor (ax, ay) = the point that sits on the floor
  const prop=(k,n,w,h,ax,ay,f)=>{S[k]=[];for(let v=0;v<n;v++){const c=mk(w,h,g=>withCtx(g,()=>f(g,w,h,v)));c.ax=ax;c.ay=ay;S[k].push(c)}};
  const shade=(g,pts,c1,c2)=>{let x0=1e9,x1=-1e9;for(const[x]of pts){x0=Math.min(x0,x);x1=Math.max(x1,x)}const q=g.createLinearGradient(x0,0,x1,0);q.addColorStop(0,c1);q.addColorStop(1,c2);g.fillStyle=q;g.beginPath();pts.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()};
  const box=(g,cx,cy,L,Wd,Hh,top,left,right)=>{const Q=(x,y,z)=>[cx+(x-y)*32,cy+(x+y)*16-z],a=[-L/2,-Wd/2],b=[L/2,-Wd/2],c=[L/2,Wd/2],d=[-L/2,Wd/2];
    shade(g,[Q(...d,0),Q(...c,0),Q(...c,Hh),Q(...d,Hh)],left[0],left[1]);shade(g,[Q(...b,0),Q(...c,0),Q(...c,Hh),Q(...b,Hh)],right[0],right[1]);shade(g,[Q(...a,Hh),Q(...b,Hh),Q(...c,Hh),Q(...d,Hh)],top[0],top[1]);return Q};
  const shadowE=(g,x,y,rx)=>el(g,x,y,rx,rx*.42,'rgba(0,0,0,.45)');
  const bone=(x1,y1,x2,y2)=>{limb(x1,y1,x2,y2,.9,.9,RP.bone);blob(x1,y1,1.3,1.1,RP.bone);blob(x2,y2,1.3,1.1,RP.bone)};
  const skull=(x,y,s=1)=>{blob(x,y,3.4*s,3.6*s,RP.bone);ctx.fillStyle='#0a0806';ctx.fillRect(x-2*s,y-.6*s,1.4*s,1.4*s);ctx.fillRect(x+.6*s,y-.6*s,1.4*s,1.4*s);ctx.fillRect(x-1*s,y+2*s,2*s,.8*s)};
  prop('barrel',2,36,48,18,42,(g,w,h,v)=>{shadowE(g,18,42,13);const q=g.createLinearGradient(6,0,30,0);q.addColorStop(0,RP.wood[3]);q.addColorStop(.35,RP.wood[2]);q.addColorStop(.8,RP.wood[1]);q.addColorStop(1,RP.wood[0]);g.fillStyle=q;
    g.beginPath();g.moveTo(8,40);g.quadraticCurveTo(4,26,8,12);g.lineTo(28,12);g.quadraticCurveTo(32,26,28,40);g.closePath();g.fill();el(g,18,40,10,4,RP.wood[0]);
    for(const y of[16,26,36]){g.strokeStyle='#1a1a1e';g.lineWidth=2;g.beginPath();g.moveTo(6+(y===26?-1.5:0),y);g.lineTo(30+(y===26?1.5:0),y);g.stroke();g.strokeStyle='rgba(180,180,190,.35)';g.lineWidth=.7;g.beginPath();g.moveTo(8,y-1);g.lineTo(14,y-1);g.stroke()}
    el(g,18,12,10,4,RP.wood[1]);el(g,18,12,8,3,v?'#1a0e06':RP.wood[2]);if(v){g.fillStyle='#3a1206';g.fillRect(14,10,8,3)}g.strokeStyle='rgba(0,0,0,.3)';for(let x=10;x<28;x+=4){g.beginPath();g.moveTo(x,14);g.lineTo(x+(x-18)*.15,38);g.stroke()}});
  prop('crate',3,56,52,28,40,(g,w,h,v)=>{shadowE(g,28,42,20);const Q=box(g,28,40,.62,.62,22,['#8a6a40','#6a4a24'],['#5a3a20','#3a2414'],['#3a2414','#24160a']);
    g.strokeStyle='rgba(10,6,2,.7)';g.lineWidth=1;for(const f of[.25,.5,.75]){const z=22*f;g.beginPath();g.moveTo(...Q(-.31,.31,z));g.lineTo(...Q(.31,.31,z));g.lineTo(...Q(.31,-.31,z));g.stroke()}
    g.strokeStyle='#2a1a0a';g.lineWidth=2;g.beginPath();g.moveTo(...Q(-.31,.31,0));g.lineTo(...Q(.31,.31,22));g.moveTo(...Q(.31,.31,0));g.lineTo(...Q(.31,-.31,22));g.stroke();
    if(v===2){const Q2=box(g,28,40-22,.42,.42,14,['#8a6a40','#6a4a24'],['#5a3a20','#3a2414'],['#3a2414','#24160a'])}});
  prop('sarcophagus',2,96,64,48,40,(g,w,h,v)=>{shadowE(g,48,44,34);const Q=box(g,48,40,1.4,.7,16,['#6c7078','#4a4c52'],['#45484e','#2c2e32'],['#2c2e32','#1a1c1e']);
    box(g,48,40-16,1.32,.62,4,['#7a7e86','#5a5e66'],['#4a4c52','#34363a'],['#34363a','#222426']);const T=(x,y)=>[48+(x-y)*32,40-20+(x+y)*16];
    if(v===0){g.strokeStyle='#2a2c30';g.lineWidth=1.6;g.beginPath();g.moveTo(...T(-.5,0));g.lineTo(...T(.5,0));g.moveTo(...T(-.2,-.18));g.lineTo(...T(-.2,.18));g.stroke()}
    else{g.save();g.translate(...T(0,0));g.scale(1,.5);g.rotate(Math.atan2(1,2));blob(-14,0,5,4.5,RP.stone);limb(-9,0,16,0,4.5,3,RP.stone);g.restore()}});
  prop('coffin',2,80,52,40,34,(g,w,h,v)=>{shadowE(g,40,36,28);const T=(x,y,z=0)=>[40+(x-y)*32,34+(x+y)*16-z],pts=[[-.6,0],[-.45,-.17],[.55,-.12],[.62,0],[.55,.12],[-.45,.17]];
    shade(g,pts.map(([x,y])=>T(x,y,8)),RP.wood[2],RP.wood[1]);g.fillStyle=RP.wood[0];g.beginPath();[[-.6,0],[-.45,.17],[.55,.12],[.62,0]].forEach(([x,y],k)=>{const p=T(x,y,0);k?g.lineTo(...p):g.moveTo(...p)});[[.62,0],[.55,.12],[-.45,.17],[-.6,0]].forEach(([x,y])=>g.lineTo(...T(x,y,8)));g.closePath();g.fill();
    if(v){g.fillStyle='#0a0604';g.beginPath();pts.forEach(([x,y],k)=>{const p=T(x*.85,y*.75,8);k?g.lineTo(...p):g.moveTo(...p)});g.closePath();g.fill();g.save();g.translate(...T(.1,-.05,8));skull(-8,0,.8);g.restore()}
    else{g.strokeStyle='#2a1a0a';g.lineWidth=1.4;g.beginPath();g.moveTo(...T(-.2,0,8));g.lineTo(...T(.4,0,8));g.moveTo(...T(0,-.12,8));g.lineTo(...T(0,.12,8));g.stroke()}});
  prop('pillar',2,40,92,20,84,(g,w,h,v)=>{shadowE(g,20,84,14);el(g,20,84,12,5,'#2c2c32');const top=v?30:46;const q=g.createLinearGradient(9,0,31,0);q.addColorStop(0,'#7a7e86');q.addColorStop(.35,'#5a5e66');q.addColorStop(.8,'#34363a');q.addColorStop(1,'#1e2024');g.fillStyle=q;
    g.beginPath();g.moveTo(9,82);g.lineTo(9,top+6);g.lineTo(13,top);g.lineTo(17,top+5);g.lineTo(21,top-3);g.lineTo(26,top+4);g.lineTo(31,top+1);g.lineTo(31,82);g.closePath();g.fill();
    g.strokeStyle='rgba(0,0,0,.35)';for(let x=13;x<30;x+=4){g.beginPath();g.moveTo(x,top+8);g.lineTo(x,80);g.stroke()}g.strokeStyle='#0a0a0c';g.lineWidth=1;g.beginPath();g.moveTo(15,50);g.lineTo(19,58);g.lineTo(16,66);g.stroke();
    for(let k=0;k<6;k++){blob(rr(4,36),rr(78,86),rr(2,4),rr(1.5,2.5),RP.stone)}});
  prop('statue',2,48,104,24,96,(g,w,h,v)=>{shadowE(g,24,96,16);box(g,24,96,.5,.5,14,['#6c7078','#4a4c52'],['#45484e','#2c2e32'],['#2c2e32','#1a1c1e']);
    shade(g,[[12,80],[36,80],[31,40],[17,40]],'#6c7078','#26282c');blob(24,36,8,8.5,RP.stone);el(g,24+(v?1:-1),38,4.5,5,'#0a0a0c');
    if(v){limb(14,52,8,30,2.4,2,RP.stone);limb(8,30,8,14,1.2,1,RP.iron,true)}else{limb(16,54,24,60,2.4,2,RP.stone);limb(32,54,24,60,2.4,2,RP.stone)}
    g.strokeStyle='rgba(0,0,0,.3)';for(let x=17;x<32;x+=4){g.beginPath();g.moveTo(x,46);g.lineTo(x-1,78);g.stroke()}});
  prop('stalagmite',3,40,64,20,58,(g,w,h,v)=>{shadowE(g,20,58,12);const hh=[44,34,52][v];shade(g,[[8,58],[20,58-hh],[32,58]],'#5a5248','#1e1a16');shade(g,[[22,58],[28,58-hh*.45],[36,58]],'#4a443c','#16120e');
    g.strokeStyle='rgba(255,240,220,.15)';g.beginPath();g.moveTo(16,58-hh*.2);g.lineTo(19,58-hh*.8);g.stroke()});
  prop('bonepile',4,56,36,28,28,(g,w,h,v)=>{shadowE(g,28,28,20);for(let k=0;k<14;k++){const x=rr(10,46),y=rr(18,30),a=rr(0,3.14),l=rr(4,8);bone(x-Math.cos(a)*l,y-Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l*.5)}for(let k=0;k<2+v%2;k++)skull(rr(16,40),rr(16,24))});
  prop('skullpile',2,48,44,24,38,(g,w,h,v)=>{shadowE(g,24,38,18);const rows=v?[5,4,3,2,1]:[4,3,2,1];rows.forEach((n,r)=>{for(let k=0;k<n;k++)skull(24+(k-(n-1)/2)*7,36-r*6,1)})});
  prop('candles',3,40,32,20,24,(g,w,h,v)=>{el(g,20,25,14,5,'rgba(216,208,176,.5)');const cs=[[10,6],[16,12],[22,8],[28,14],[33,5],[14,4]].slice(0,4+v);S.candlesTop=S.candlesTop||[];S.candlesTop[v]=[];
    for(const[x,hh]of cs){const y=24+((x*7)%5)-2;g.fillStyle='#2a2418';g.fillRect(x-1.6,y-hh-.5,3.2,hh+1);const q=g.createLinearGradient(x-1.4,0,x+1.4,0);q.addColorStop(0,'#f6f0de');q.addColorStop(1,'#a89e80');g.fillStyle=q;g.fillRect(x-1.4,y-hh,2.8,hh);el(g,x,y-hh,1.4,.6,'#fff8e0');S.candlesTop[v].push([x-20,y-hh-24])}});
  prop('mushrooms',3,40,34,20,28,(g,w,h,v)=>{const C=CAPC[['cyan','green','violet'][v]];S.shroomC=S.shroomC||[];S.shroomC[v]=C;for(let k=0;k<5;k++){const x=rr(8,32),y=rr(22,30),s=rr(.7,1.3);g.fillStyle='#d8d0b8';g.fillRect(x-.8,y-8*s,1.8,8*s);
    blob(x,y-8*s,4.5*s,2.6*s,[C[0],C[0],C[1],C[2]]);g.fillStyle=C[2];g.fillRect(x-1,y-9*s,1,1)}});
  prop('altar',1,80,64,40,44,(g,w,h)=>{shadowE(g,40,46,28);box(g,40,44,.9,.55,18,['#5a4e46','#3a302a'],['#3a302a','#221c18'],['#221c18','#120e0c']);box(g,40,44-18,1,.65,4,['#6a5e54','#4a3e36'],['#4a3e36','#2a221c'],['#2a221c','#18120e']);
    el(g,40,24,10,3.5,'#5a0806');el(g,38,23.5,6,2,'#8a1410');g.fillStyle='#5a0806';g.fillRect(30,26,1.5,10);g.fillRect(47,27,1.5,8);g.save();g.translate(40,22);skull(0,-4,1);g.restore()});
  prop('cage',1,44,72,22,64,(g,w,h)=>{shadowE(g,22,64,15);el(g,22,64,14,5,'#1a1a1e');el(g,22,14,14,5,'#1a1a1e');g.save();g.translate(22,60);bone(-2,-6,3,-14);skull(0,-20,.9);bone(-4,-4,6,-2);g.restore();
    for(let k=0;k<9;k++){const a=k/9*Math.PI,x=22-Math.cos(a)*13;g.strokeStyle=k%2?'#4b4f59':'#2a2c33';g.lineWidth=1.6;g.beginPath();g.moveTo(x,15+Math.sin(a)*4);g.lineTo(x,63+Math.sin(a)*4);g.stroke()}
    g.strokeStyle='#787d88';g.lineWidth=1;g.beginPath();g.ellipse(22,14,14,5,0,Math.PI,0);g.stroke();g.beginPath();g.moveTo(22,9);g.lineTo(22,0);g.stroke()});
  prop('stash',1,80,64,40,44,(g,w,h)=>{shadowE(g,40,46,30);const Q=box(g,40,44,.8,.5,18,['#5a3a20','#3e2614'],['#4a2c14','#2a180a'],['#2a180a','#160c04']);
    const T2=(x,y,z)=>[40+(x-y)*32,44+(x+y)*16-z];for(const z of[18,22,26]){}
    const lid=[[-.4,-.25],[.4,-.25],[.4,.25],[-.4,.25]];g.fillStyle='#4a2c14';g.beginPath();g.moveTo(...T2(-.4,.25,18));g.lineTo(...T2(.4,.25,18));g.lineTo(...T2(.4,.25,24));g.quadraticCurveTo(...T2(0,.25,32),...T2(-.4,.25,24));g.closePath();g.fill();
    g.fillStyle='#2a180a';g.beginPath();g.moveTo(...T2(.4,.25,18));g.lineTo(...T2(.4,-.25,18));g.lineTo(...T2(.4,-.25,24));g.quadraticCurveTo(...T2(.4,0,32),...T2(.4,.25,24));g.closePath();g.fill();
    g.fillStyle='#6a4426';g.beginPath();g.moveTo(...T2(-.4,.25,24));g.quadraticCurveTo(...T2(0,.25,32),...T2(.4,.25,24));g.lineTo(...T2(.4,-.25,24));g.quadraticCurveTo(...T2(0,-.25,32),...T2(-.4,-.25,24));g.closePath();g.fill();
    for(const x of[-.28,0,.28]){g.strokeStyle='#1a1a1e';g.lineWidth=2.4;g.beginPath();g.moveTo(...T2(x,.25,0));g.lineTo(...T2(x,.25,24));g.quadraticCurveTo(...T2(x,0,32),...T2(x,-.25,24));g.stroke();g.strokeStyle='rgba(200,200,210,.3)';g.lineWidth=.8;g.beginPath();g.moveTo(...T2(x,.25,2));g.lineTo(...T2(x,.25,22));g.stroke()}
    for(const[x,y]of[[-.4,.25],[.4,.25],[.4,-.25]]){g.fillStyle='#c8962a';const[a,b]=T2(x,y,0);g.fillRect(a-2,b-20,4,20)}
    const[lx,ly]=T2(0,.25,15);g.fillStyle='#c8962a';g.fillRect(lx-4,ly-5,8,9);g.fillStyle='#3a2406';g.fillRect(lx-1,ly-2,2,4);
    SPR.stashRunes=[];for(let k=0;k<14;k++){const x=-.36+k/13*.72,[a,b]=T2(x,.25,7+Math.sin(k*1.7)*3);g.fillStyle='#4a3a8a';g.fillRect(a,b,1.5,1.5);SPR.stashRunes.push([a-40,b-44])}});
  // overworld: trees, houses, burnt-out houses, tents, gravestones
  prop('tree',3,80,120,40,108,(g,w,h,v)=>{shadowE(g,40,108,22);
    if(v===0){limb(40,108,40,44,3.2,2,RP.wood);for(let k=0;k<4;k++){const y=34+k*17,wd=11+k*6.5;shade(g,[[40,y-22],[40+wd,y+6],[40-wd,y+6]],'#4a7a2a','#12240a');g.fillStyle='rgba(0,0,0,.25)';g.fillRect(40-wd,y+4,wd*2,2);for(let q=0;q<5;q++)el(g,40+rr(-wd*.6,wd*.6),y+rr(-8,4),1,1,'#7aaa3a')}}
    else if(v===1){limb(40,108,40,62,3.8,2.8,RP.wood);limb(40,74,28,58,1.7,1,RP.wood);limb(40,70,52,54,1.7,1,RP.wood);for(let k=0;k<11;k++)blob(40+rr(-20,20),50+rr(-20,12),rr(9,15),rr(7,12),['#12240a','#2a4a14','#4a7a24','#7aaa3a'])}
    else{limb(40,108,40,44,3,1.4,RP.dark);for(const[a,b,c2,d2]of[[40,70,24,52],[24,52,18,40],[40,62,56,46],[56,46,62,36],[40,52,32,38],[40,80,52,70]])limb(a,b,c2,d2,1.4,.5,RP.dark)}});
  const walls=(g,cx,cy,H,jag)=>{const Q=(x,y,z)=>[cx+(x-y)*32,cy+(x+y)*16-z],face=(a,b,c1,c2)=>{const n=8,top=[];for(let k=0;k<=n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;top.push(Q(x,y,jag?H*(.35+.65*Math.abs(Math.sin(k*1.7+x*3)))*(k%3===1?.6:1):H))}
      shade(g,[Q(...a,0),Q(...b,0),...top.reverse()],c1,c2)};return{Q,face}};
  prop('house',2,150,140,75,112,(g,w,h,v)=>{shadowE(g,78,116,58);const{Q,face}=walls(g,75,112,34),H2=34,L2=.9;
    face([-L2,L2],[L2,L2],'#c8b898','#9a8a6a');face([L2,L2],[L2,-L2],'#8a7a5a','#5a4a34');g.strokeStyle='#3a2414';g.lineWidth=2;for(const[a,b]of[[[-L2,L2],[L2,L2]],[[L2,L2],[L2,-L2]]]){for(let k=0;k<=4;k++){const t=k/4,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;g.beginPath();g.moveTo(...Q(x,y,0));g.lineTo(...Q(x,y,H2));g.stroke()}g.beginPath();g.moveTo(...Q(...a,H2*.55));g.lineTo(...Q(...b,H2*.55));g.stroke()}
    g.fillStyle='#2a1a0c';g.beginPath();g.moveTo(...Q(-.25,L2,0));g.lineTo(...Q(.15,L2,0));g.lineTo(...Q(.15,L2,22));g.lineTo(...Q(-.25,L2,22));g.fill();g.fillStyle='#ffd080';const[wx,wy]=Q(L2,.4,22);g.fillRect(wx-3,wy-4,5,6);
    const ro=v?['#9a8a4a','#5a4a1a','#7a6a30']:['#7a3020','#3a140a','#5a2214'],R1=Q(-1,0,64),R2=Q(1,0,64);shade(g,[Q(-1,-1,H2),Q(1,-1,H2),R2,R1],ro[2],ro[1]);shade(g,[Q(1,1,H2),Q(1,-1,H2),R2],ro[1],ro[1]);shade(g,[Q(-1,1,H2),Q(1,1,H2),R2,R1],ro[0],ro[1]);
    g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1;for(let k=1;k<6;k++){const t=k/6;g.beginPath();g.moveTo(...Q(-1,1-t,H2+30*t));g.lineTo(...Q(1,1-t,H2+30*t));g.stroke()}const[cx2,cy2]=Q(.5,-.3,58);shade(g,[[cx2-4,cy2+8],[cx2+4,cy2+8],[cx2+4,cy2-10],[cx2-4,cy2-10]],'#6a5e54','#3a302a')});
  prop('ruinhouse',2,150,130,75,108,(g,w,h,v)=>{shadowE(g,78,112,58);const{Q,face}=walls(g,75,108,30,true),L2=.9;
    face([-L2,-L2],[L2,-L2],'#2a2420','#1a1614');face([-L2,L2],[-L2,-L2],'#3a3028','#1e1a16');for(let k=0;k<10;k++)blob(75+rr(-30,30),100+rr(-14,8),rr(4,8),rr(3,5),['#0e0c0a','#1e1a16','#3a342c','#5a524a']);
    face([-L2,L2],[L2,L2],'#5a5048','#2a2420');face([L2,L2],[L2,-L2],'#3a3028','#1a1612');for(let k=0;k<30;k++)el(g,75+rr(-58,58),108-rr(0,30)+rr(-6,16),rr(1.5,4),rr(1,3),pr(['#0a0806','#14100c','#1e1814']));
    for(let k=0;k<3;k++){const[a,b]=Q(rr(-.8,.8),rr(-.8,.8),rr(10,26));limb(a,b,a+rr(-20,20),b-rr(10,24),1.6,1.2,RP.dark)}for(let k=0;k<10;k++){g.fillStyle=pr(['#ff6a1a','#ffb347','#c04008']);g.fillRect(75+rr(-50,50)|0,100+rr(-24,10)|0,1.5,1.5)}});
  prop('tent',2,72,60,36,50,(g,w,h,v)=>{shadowE(g,36,52,26);const Q=(x,y,z)=>[36+(x-y)*32,50+(x+y)*16-z],c=v?['#a83a2a','#5a1a10']:['#b8a888','#6a5a40'];
    shade(g,[Q(-.5,-.42,0),Q(.5,-.42,0),Q(.5,0,28),Q(-.5,0,28)],c[1],c[1]);shade(g,[Q(-.5,.42,0),Q(.5,.42,0),Q(.5,0,28),Q(-.5,0,28)],c[0],c[1]);shade(g,[Q(.5,.42,0),Q(.5,-.42,0),Q(.5,0,28)],c[1],'#1a120a');
    g.fillStyle='#0a0806';g.beginPath();g.moveTo(...Q(.5,.18,0));g.lineTo(...Q(.5,-.18,0));g.lineTo(...Q(.5,0,15));g.fill();g.strokeStyle='#3a2414';g.lineWidth=1.4;g.beginPath();g.moveTo(...Q(-.5,0,28));g.lineTo(...Q(-.5,0,34));g.moveTo(...Q(.5,0,28));g.lineTo(...Q(.5,0,34));g.stroke()});
  prop('grave',3,36,48,18,42,(g,w,h,v)=>{shadowE(g,18,42,9);el(g,18,42,9,3.5,'#3a362e');
    if(v===0){g.save();g.translate(18,40);shade(g,[[-7,0],[7,0],[7,-18],[0,-24],[-7,-18]],'#8a8276','#3a342c');g.restore();g.strokeStyle='rgba(20,16,12,.7)';g.beginPath();g.moveTo(15,26);g.lineTo(21,26);g.moveTo(18,22);g.lineTo(18,32);g.stroke()}
    else if(v===1){shade(g,[[16,40],[20,40],[20,16],[16,16]],'#7a7266','#3a342c');shade(g,[[10,24],[26,24],[26,20],[10,20]],'#7a7266','#3a342c')}
    else{g.save();g.translate(18,40);g.rotate(.28);shade(g,[[-7,0],[7,0],[6,-12],[2,-16],[-1,-11],[-7,-14]],'#6a6258','#2a2620');g.restore()}
    for(let k=0;k<8;k++)el(g,rr(10,26),rr(22,40),rr(1,2),rr(.8,1.6),pr(['#2a3e14','#3a5418']))});
  // wall pieces, drawn skewed onto the wall face
  prop('banner',3,22,44,11,42,(g,w,h,v)=>{const c=[['#4a0c0a','#7a1a12'],['#0e1a3a','#1c3a7a'],['#1a2a0e','#3a5a1c']][v];g.fillStyle='#3a2414';g.fillRect(0,0,22,2.5);const q=g.createLinearGradient(2,0,20,0);q.addColorStop(0,c[1]);q.addColorStop(1,c[0]);g.fillStyle=q;
    g.beginPath();g.moveTo(3,2);g.lineTo(19,2);g.lineTo(19,36);g.lineTo(16,32);g.lineTo(13,39);g.lineTo(10,33);g.lineTo(7,38);g.lineTo(3,34);g.closePath();g.fill();g.strokeStyle='#c8962a';g.lineWidth=1;g.strokeRect(5,5,12,12);g.fillStyle='#c8962a';g.fillRect(10,8,2,7);g.fillRect(7,10,8,2)});
  prop('chains',2,24,46,12,44,(g,w,h,v)=>{for(const x of v?[6,17]:[12]){const len=v?(x<10?30:38):40;for(let y=2;y<len;y+=4){g.strokeStyle=(y/4)%2?'#4b4f59':'#787d88';g.lineWidth=1.3;g.beginPath();g.ellipse(x,y,1.4,2.2,0,0,7);g.stroke()}g.strokeStyle='#2a2c33';g.lineWidth=2;g.beginPath();g.arc(x,len+3,3,0,Math.PI*1.2);g.stroke()}g.fillStyle='#2a2c33';g.fillRect(2,0,20,2)});
  prop('niche',2,26,30,13,30,(g,w,h,v)=>{g.fillStyle='#08060a';g.beginPath();g.moveTo(4,28);g.lineTo(4,10);g.quadraticCurveTo(13,0,22,10);g.lineTo(22,28);g.closePath();g.fill();g.strokeStyle='#4a4034';g.lineWidth=1.4;g.stroke();g.save();g.translate(13,20);skull(0,0,1.15);if(v)skull(-6,5,.7);g.restore()});
  prop('wallweb',2,40,40,20,40,(g,w,h,v)=>{g.strokeStyle='rgba(225,222,210,.5)';g.lineWidth=.7;const cx=v?2:38,cy=2,sd=v?1:-1;for(let k=0;k<6;k++){const a=k/5*1.5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+sd*Math.cos(a)*36,cy+Math.sin(a)*36);g.stroke()}
    for(let r=6;r<36;r+=6){g.beginPath();for(let k=0;k<6;k++){const a=k/5*1.5,x=cx+sd*Math.cos(a)*r,y=cy+Math.sin(a)*r;k?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}});
  // moss and mould creeping up the wall faces
  // overworld stonework: flagstones, the old bridge, parapets, colosseum wall, menhirs, the guardian
  const quad=(g,pts,c)=>{g.fillStyle=c;g.beginPath();pts.forEach(([u,v],k)=>{const X=(u-v)*32+32,Y=(u+v)*16;k?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.fill()};
  const stones=(g,n,base,var_,mortar)=>{dia(g);g.fillStyle=mortar;g.fill();g.save();g.clip();const cuts=[0];for(let k=1;k<n;k++)cuts.push(k/n+rr(-.08,.08));cuts.push(1);
    for(let a=0;a<n;a++)for(let b=0;b<n;b++){const off=(b%2)*.5/n,u0=cuts[a]+off,u1=cuts[a+1]+off,v0=cuts[b],v1=cuts[b+1],t=base+rr(-var_,var_)|0;for(const sh of[0,-1])quad(g,[[u0+.012+sh,v0+.012],[u1-.012+sh,v0+.012],[u1-.012+sh,v1-.012],[u0+.012+sh,v1-.012]],`rgb(${t+8},${t+3},${t-4})`)}
    for(let k=0;k<80;k++){g.fillStyle=Rs()<.5?'rgba(0,0,0,.18)':'rgba(255,240,215,.1)';g.fillRect(rr(0,64)|0,rr(0,32)|0,1,1)}g.restore()};
  SPR.flag=[];for(let v=0;v<4;v++)SPR.flag.push(mk(64,32,g=>{stones(g,2,118,14,'#3a342c');if(v===3){g.save();dia(g);g.clip();for(let k=0;k<20;k++)el(g,rr(10,54),rr(6,26),rr(1,3),rr(.6,1.6),pr(['#3a5418','#4a6820']));g.restore()}
    if(v===1){g.strokeStyle='rgba(20,16,12,.7)';g.lineWidth=1;g.beginPath();g.moveTo(20,10);g.lineTo(28,15);g.lineTo(26,21);g.lineTo(34,25);g.stroke()}}));
  SPR.bridge=[];for(let v=0;v<3;v++)SPR.bridge.push(mk(64,32,g=>{stones(g,3,88,16,'#221e1a');g.save();dia(g);g.clip();for(let k=0;k<(v===2?26:8);k++)el(g,rr(8,56),rr(4,28),rr(1,2.6),rr(.6,1.4),pr(['#2a3e14','#3a5418','#4a6820']));g.restore()}));
  SPR.bridgeSide=[];for(let v=0;v<2;v++)SPR.bridgeSide.push(mk(64,32+210,g=>{const H=30;g.beginPath();g.moveTo(0,16);g.lineTo(32,32);g.lineTo(32,32+H);g.lineTo(0,16+H);g.closePath();g.fillStyle='#4a443c';g.fill();
    g.save();g.clip();for(let r=0;r<4;r++)for(let k=0;k<3;k++){const x=k*11+(r%2)*5,y=16+x/2+r*7.5;g.fillStyle=`rgb(${60+rr(-10,10)|0},${55+rr(-10,10)|0},${48+rr(-10,10)|0})`;g.beginPath();g.moveTo(x+.6,y+.6);g.lineTo(x+10,y+5.3);g.lineTo(x+10,y+11.8);g.lineTo(x+.6,y+7);g.closePath();g.fill()}
    for(let k=0;k<30;k++){g.fillStyle=pr(['#2a3e14','#3a5418','rgba(0,0,0,.4)']);g.fillRect(rr(0,32)|0,rr(16,62)|0,1,rr(1,4)|0)}g.restore();
    if(v){const q=g.createLinearGradient(0,40,0,240);q.addColorStop(0,'#3e3830');q.addColorStop(.5,'rgba(46,40,34,.9)');q.addColorStop(1,'rgba(30,26,22,0)');g.fillStyle=q;g.beginPath();g.moveTo(6,16+3+H);g.lineTo(26,16+13+H);g.lineTo(24,240);g.lineTo(9,240);g.closePath();g.fill();
      g.strokeStyle='rgba(0,0,0,.35)';for(let y=70;y<230;y+=12){g.beginPath();g.moveTo(7,y);g.lineTo(25,y+3);g.stroke()}for(let k=0;k<14;k++)el(g,rr(8,24),rr(60,200),rr(1,3),rr(1,4),pr(['#2a3e14','#3a5418']))}
    else{g.fillStyle='rgba(0,0,0,0)';g.globalCompositeOperation='destination-out';g.beginPath();g.ellipse(16,16+8+H,14,9,.46,0,Math.PI);g.fill();g.globalCompositeOperation='source-over'}}));
  const blockS=(k,n,Hh,mat,broken)=>{S[k]=[];for(let v=0;v<n;v++){const isB=v===n-1&&broken,c=mk(64,32+Hh+14,g=>withCtx(g,()=>{const cy=16+Hh+14,hh=isB?Hh*.45:Hh;
      const Q=box(g,32,cy,1,1,hh,[mat[2],mat[1]],[mat[1],mat[0]],[mat[0],'#141210']);for(let r=1;r<hh/8;r++){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;g.beginPath();g.moveTo(...Q(-.5,.5,r*8));g.lineTo(...Q(.5,.5,r*8));g.lineTo(...Q(.5,-.5,r*8));g.stroke()}
      for(let k2=0;k2<24;k2++)el(g,rr(4,60),cy-rr(0,hh)+rr(0,10),rr(1,2.6),rr(.8,2),pr(['#2a3e14','#3a5418','#4a6820','rgba(0,0,0,.3)']));
      if(isB)for(let k2=0;k2<6;k2++)blob(rr(8,56),cy-hh-rr(-2,4)+8,rr(3,6),rr(2,4),RP.stone)}));c.ax=32;c.ay=16+Hh+14;S[k].push(c)}};
  const STN=['#3a362e','#5a5248','#7a7266'];blockS('ringwall',3,30,STN,true);blockS('parapet',3,14,STN,true);
  prop('menhir',3,52,124,26,112,(g,w,h,v)=>{shadowE(g,26,112,18);if(v===0){shade(g,[[12,112],[9,60],[14,22],[24,10],[36,18],[42,64],[40,112]],'#7a7266','#2a2620');g.strokeStyle='rgba(20,16,12,.8)';g.lineWidth=1.4;for(let k=0;k<4;k++){const y=40+k*15;g.beginPath();g.moveTo(20,y);g.lineTo(24,y-5);g.lineTo(28,y);g.moveTo(24,y-5);g.lineTo(24,y+5);g.stroke()}}
    else{const top=v===1?44:16,q=g.createLinearGradient(13,0,39,0);q.addColorStop(0,'#8a8276');q.addColorStop(.35,'#6a6258');q.addColorStop(.85,'#3a342c');q.addColorStop(1,'#24201a');g.fillStyle=q;
      g.beginPath();g.moveTo(13,110);g.lineTo(13,top+6);if(v===1){g.lineTo(18,top);g.lineTo(23,top+7);g.lineTo(29,top-4);g.lineTo(34,top+3);g.lineTo(39,top+1)}else g.lineTo(39,top+6);g.lineTo(39,110);g.closePath();g.fill();
      g.strokeStyle='rgba(0,0,0,.3)';for(let x=17;x<38;x+=5){g.beginPath();g.moveTo(x,top+8);g.lineTo(x,108);g.stroke()}if(v===2){shade(g,[[8,top+8],[44,top+8],[44,top-2],[8,top-2]],'#8a8276','#3a342c');shade(g,[[11,top-2],[41,top-2],[38,top-8],[14,top-8]],'#9a9286','#4a443c')}
      shade(g,[[8,110],[44,110],[44,102],[8,102]],'#6a6258','#2a2620')}
    for(let k=0;k<26;k++)el(g,rr(12,40),rr(60,110),rr(1,3),rr(.8,2.2),pr(['#2a3e14','#3a5418','#4a6820']))});
  {const ST=['#2a2824','#4a4640','#6e6a62','#94908a'],ST2=['#1a1816','#33302c','#4a4640','#6a6660'],c=mk(170,290,g=>withCtx(g,()=>{shadowE(g,85,268,62);
      box(g,85,268,1.5,1.5,30,['#6e6a62','#4a4640'],['#4a4640','#2a2824'],['#2a2824','#161412']);box(g,85,238,1.15,1.15,10,['#7a766e','#55514a'],['#55514a','#33302c'],['#33302c','#1e1c1a']);
      g.save();g.translate(85,226);g.scale(3.3,3.3);
      humanoid({R:{torso:ST,sleeve:ST,fore:ST,hand:ST,legs:ST,shin:ST,feet:ST,skirt:ST2,pauldron:ST,belt:ST2,metal:{}},f:1,back:false,moving:false,tw:1.15,lw:1.15,atk:Math.PI*.42,
        head:(hx,hy)=>{poly([[hx-5,hy-5],[hx+5,hy-5],[hx+4.6,hy+5],[hx-4.6,hy+5]],ST);blob(hx,hy-5,5,2,ST);ctx.fillStyle='#0a0908';ctx.fillRect(hx-3.6,hy-1,7.2,1.3);for(const sd of[-1,1]){limb(hx+sd*4.8,hy-3,hx+sd*8.5,hy-7,1.3,1,ST);limb(hx+sd*8.5,hy-7,hx+sd*7.6,hy-12,1,.3,ST)}SPR.colEyes=[[(hx-2)*3.3,(hy-.4)*3.3-24],[(hx+2)*3.3,(hy-.4)*3.3-24]]},
        weapon:(x,y)=>vWeapon(x,y,Math.PI*.5,'great',{p:ST,s:ST2,t:ST2},'Zweihänder')});g.restore();
      for(let k=0;k<140;k++){const y=rr(60,262),x=85+rr(-34,34)*(y<200?.7:1.2);el(g,x,y,rr(1,3),rr(.8,2.4),pr(['#2a3e14','#3a5418','#4a6820','rgba(0,0,0,.25)']))}
      g.strokeStyle='rgba(10,8,6,.8)';g.lineWidth=1;for(const[x,y]of[[70,120],[98,160],[80,200]]){let px=x,py=y;g.beginPath();g.moveTo(px,py);for(let k=0;k<5;k++){px+=rr(-4,4);py+=rr(4,8);g.lineTo(px,py)}g.stroke()}}));
    c.ax=85;c.ay=268;SPR.colossus=c}
  SPR.deco.arena=[mk(330,165,g=>{g.save();g.translate(165,82.5);g.scale(1,.5);for(const[r,w2,c]of[[150,6,'rgba(40,34,28,.55)'],[138,2,'rgba(150,140,120,.5)'],[96,4,'rgba(40,34,28,.5)'],[46,5,'rgba(40,34,28,.55)'],[40,2,'rgba(160,150,130,.45)']]){g.strokeStyle=c;g.lineWidth=w2;g.beginPath();g.arc(0,0,r,0,7);g.stroke()}
    for(let k=0;k<16;k++){const a=k/16*6.283;g.strokeStyle='rgba(40,34,28,.45)';g.lineWidth=2;g.beginPath();g.moveTo(Math.cos(a)*46,Math.sin(a)*46);g.lineTo(Math.cos(a)*96,Math.sin(a)*96);g.stroke()}
    g.fillStyle='rgba(60,10,8,.35)';g.beginPath();g.arc(0,0,30,0,7);g.fill();g.strokeStyle='rgba(150,140,120,.55)';g.lineWidth=2;g.beginPath();for(let k=0;k<6;k++){const a=k*2*Math.PI*2/5-Math.PI/2;k?g.lineTo(Math.cos(a)*26,Math.sin(a)*26):g.moveTo(Math.cos(a)*26,Math.sin(a)*26)}g.stroke();g.restore()})];
  SPR.wallMoss=[];for(let v=0;v<4;v++)SPR.wallMoss.push(mk(64,32+WH,g=>{for(let k=0;k<70;k++){const left=Rs()<.5,u=Rs(),z=Math.pow(Rs(),1.8)*WH*.9,x=left?u*32:32+u*32,y=left?16+u*16+WH-z:32-u*16+WH-z,r=rr(1.2,3.6)*(1-z/WH*.5);
    el(g,x,y,r,r*.8,pr(['#1e2e0e','#2a3e14','#3a5418','#4a6820','#22300c']))}for(let k=0;k<8;k++){const left=Rs()<.5,u=Rs(),x=left?u*32:32+u*32,y0=left?16+u*16:32-u*16;g.fillStyle='rgba(60,84,24,.8)';g.fillRect(x|0,y0+WH*.3|0,1,rr(4,12)|0)}}))}
// dress a finished dungeon: themes per room, blockers, wall pieces, light shafts, critters
function decorate(m,start,end,objs,T,n8,seen){
  const{w,h,t,rooms,deco,props}=m,theme=new Uint8Array(w*h),wov=new Uint8Array(w*h),drips=[],runes=[];
  const free8=(i,j)=>T(i,j)===1&&n8(i,j)===8,far=(x,y,d)=>objs.every(o=>hyp(o.x-x,o.y-y)>d)&&hyp(m.start.x-x,m.start.y-y)>d;
  const add=(k,x,y,o={})=>props.push(Object.assign({k,x,y,v:rint(0,(SPR.prop[k]||[0]).length-1),ph:rnd(0,6)},o));
  const flat=(k,x,y)=>deco.push({k,x,y,v:rint(0,SPR.deco[k].length-1)});
  // flood count to make sure a blocker never cuts the map
  const si=Math.floor(m.start.y)*w+Math.floor(m.start.x);let reach=0;{const s2=new Uint8Array(w*h),q=[si];s2[si]=1;while(q.length){const c=q.pop();reach++;for(const d of[1,-1,w,-w]){const n=c+d;if(!s2[n]&&t[n]===1){s2[n]=1;q.push(n)}}}}
  const block=(i,j,k,o,edge)=>{if(!(edge?T(i,j)===1&&n8(i,j)>=4:free8(i,j))||!far(i+.5,j+.5,2.6))return false;t[j*w+i]=6;const s2=new Uint8Array(w*h),q=[si];s2[si]=1;let n=0;while(q.length){const c=q.pop();n++;for(const d of[1,-1,w,-w]){const nn=c+d;if(!s2[nn]&&t[nn]===1){s2[nn]=1;q.push(nn)}}}
    if(n!==reach-1){t[j*w+i]=1;return false}reach=n;add(k,i+.5,j+.5,o);return true};
  const spot=(r,pad=1)=>{for(let k=0;k<30;k++){const i=rint(r.x+pad,r.x+r.w-1-pad),j=rint(r.y+pad,r.y+r.h-1-pad);if(T(i,j)===1)return[i,j]}return null};
  const edgeSpot=r=>{for(let k=0;k<40;k++){const i=rint(r.x,r.x+r.w-1),j=rint(r.y,r.y+r.h-1);if(T(i,j)===1&&n8(i,j)<8&&n8(i,j)>=4)return[i,j]}return null};
  const wallsOf=(r,pad=1)=>{const out=[];for(let j=r.y-pad;j<r.y+r.h+pad;j++)for(let i=r.x-pad;i<r.x+r.w+pad;i++){if(T(i,j)!==2)continue;const fy=T(i,j+1)===1,fx=T(i+1,j)===1;if(fy||fx)out.push({i,j,face:fy?'y':'x',x:fy?i+.5:i+1,y:fy?j+1:j+.5})}return out};
  const wallProp=(r,k,n)=>{const W2=wallsOf(r);for(let c=0;c<n&&W2.length;c++){const s=W2.splice(rint(0,W2.length-1),1)[0];if(props.some(p=>p.face&&hyp(p.x-s.x,p.y-s.y)<1.6))continue;add(k,s.x,s.y,{face:s.face})}};
  const many=(r,k,n,pad=1)=>{for(let c=0;c<n;c++){const p=spot(r,pad);if(p)flat(k,p[0]+rnd(.1,.9),p[1]+rnd(.1,.9))}};
  const shaft=r=>{const p=spot(r,3);if(p)add('shaft',p[0]+.5,p[1]+.5,{v:0})};
  rooms.forEach((r,idx)=>{
    const th=r===start?pick(['crypt','storage']):r===end&&m.boss?'ritual':pick(['crypt','crypt','moss','moss','ossuary','ritual','flooded','mold','collapsed','storage']);r.theme=th;const ti=THEMES.indexOf(th)+1;
    for(let j=r.y-1;j<=r.y+r.h;j++)for(let i=r.x-1;i<=r.x+r.w;i++){if(i<0||j<0||i>=w||j>=h)continue;if(t[j*w+i]===1)theme[j*w+i]=ti;if(t[j*w+i]===2&&(th==='moss'||th==='flooded'||th==='mold')&&R()<.8)wov[j*w+i]=rint(1,4)}
    const area=r.w*r.h,N=k=>Math.round(k*area/200),B=(k,n)=>{for(let c=0,tries=0;c<n&&tries<n*6;tries++){const p=spot(r,2);if(p&&block(p[0],p[1],k))c++}},EB=(k,n)=>{for(let c=0,tries=0;c<n&&tries<n*8;tries++){const p=edgeSpot(r);if(p&&block(p[0],p[1],k,undefined,true))c++}};
    const near=(k,n,o)=>{for(let c=0;c<n;c++){const p=spot(r,1);if(p&&far(p[0]+.5,p[1]+.5,1.4))add(k,p[0]+rnd(.2,.8),p[1]+rnd(.2,.8),o)}};
    if(th==='crypt'){B('sarcophagus',rint(1,3));EB('statue',rint(0,2));EB('coffin',rint(0,2));near('candles',N(3)+2);many(r,'bones',N(6));many(r,'skull',N(2));many(r,'wax',N(3));many(r,'cobweb',N(3));wallProp(r,'banner',rint(1,3));wallProp(r,'niche',rint(0,2));wallProp(r,'wallweb',2)}
    if(th==='moss'){many(r,'moss',N(26),0);many(r,'roots',N(5));many(r,'leaves',N(4));near('mushrooms',N(6)+2,{v:rint(0,2)});EB('stalagmite',rint(2,4));B('stalagmite',rint(0,2));for(let c=0;c<N(3)+1;c++){const p=spot(r);if(p){flat('puddle',p[0]+.5,p[1]+.5);drips.push({x:p[0]+.5,y:p[1]+.5})}}if(R()<.7)shaft(r);m.fireflies=(m.fireflies||[]).concat([[r.cx+.5,r.cy+.5,r.w/2]])}
    if(th==='ossuary'){near('bonepile',N(6)+2);near('skullpile',N(3)+1);many(r,'bones',N(14));many(r,'skull',N(6));wallProp(r,'niche',rint(4,8));EB('cage',rint(0,1));near('candles',rint(1,3))}
    if(th==='ritual'){const cx=r.cx+.5,cy=r.cy+.5;if(T(Math.floor(cx),Math.floor(cy))===1){deco.push({k:'runes',x:cx,y:cy,v:0});runes.push({x:cx,y:cy});if(!m.boss)block(Math.floor(cx),Math.floor(cy),'altar');for(let k=0;k<8;k++){const a=k/8*6.283,x=cx+Math.cos(a)*2.4,y=cy+Math.sin(a)*2.4;if(T(Math.floor(x),Math.floor(y))===1)add('candles',x,y)}}
      many(r,'blood',N(6));many(r,'smear',N(4));many(r,'skull',N(2));wallProp(r,'banner',rint(2,4));wallProp(r,'chains',rint(1,3));EB('statue',rint(1,2))}
    if(th==='flooded'){for(let c=0;c<N(12)+3;c++){const p=spot(r,1);if(p){flat('puddle',p[0]+rnd(.2,.8),p[1]+rnd(.2,.8));if(R()<.35)drips.push({x:p[0]+.5,y:p[1]+.5})}}many(r,'moss',N(8));many(r,'roots',N(3));many(r,'pebbles',N(5));shaft(r);if(R()<.5)shaft(r);EB('stalagmite',rint(0,2))}
    if(th==='mold'){many(r,'mold',N(22),0);many(r,'cobweb',N(5));many(r,'rubble',N(4));near('mushrooms',N(3),{v:2});many(r,'bones',N(3));wallProp(r,'wallweb',rint(2,4));m.spores=(m.spores||[]).concat([[r.cx+.5,r.cy+.5,r.w/2]])}
    if(th==='collapsed'){many(r,'rubble',N(14));many(r,'pebbles',N(8));B('pillar',rint(2,4));EB('stalagmite',rint(1,3));shaft(r);shaft(r);if(R()<.5)shaft(r);many(r,'bones',N(3));many(r,'leaves',N(3))}
    if(th==='storage'){EB('barrel',rint(3,6));EB('crate',rint(3,6));many(r,'straw',N(8));many(r,'wax',N(2));near('candles',rint(1,2));wallProp(r,'chains',rint(1,2));wallProp(r,'banner',rint(0,2));many(r,'cobweb',N(3))}
  });
  // passages: webs in the corners, puddles, a chain or two, moss creeping in
  for(let j=3;j<h-3;j++)for(let i=3;i<w-3;i++){if(t[j*w+i]!==1||theme[j*w+i])continue;const n=n8(i,j),x=i+rnd(.2,.8),y=j+rnd(.2,.8);
    if(n<=5&&R()<.06)flat('cobweb',x,y);else if(R()<.012)flat('puddle',x,y);else if(R()<.02)flat(pick(['rubble','pebbles','bones','moss','leaves']),x,y)}
  for(let j=3;j<h-3;j++)for(let i=3;i<w-3;i++){if(t[j*w+i]!==2||theme[j*w+i])continue;let corridor=true;for(const r of rooms)if(i>=r.x-1&&i<=r.x+r.w&&j>=r.y-1&&j<=r.y+r.h){corridor=false;break}if(!corridor)continue;
    if(R()<.08)wov[j*w+i]=rint(1,4);const fy=T(i,j+1)===1,fx=T(i+1,j)===1;if((fy||fx)&&R()<.03){const x=fy?i+.5:i+1,y=fy?j+1:j+.5;if(!props.some(p=>p.face&&hyp(p.x-x,p.y-y)<2))add(pick(['chains','wallweb','wallweb','banner']),x,y,{face:fy?'y':'x'})}}
  // rats
  const crit=[];for(let k=0;k<rint(6,11);k++){for(let tr=0;tr<20;tr++){const i=rint(3,w-4),j=rint(3,h-4);if(t[j*w+i]===1){crit.push({k:'rat',x:i+.5,y:j+.5,a:rnd(0,6.28),sp:0,t:rnd(0,3)});break}}}
  Object.assign(m,{theme,wov,drips,runes,crit})}
function decorateTown(m){const{w,h,t}=m,deco=[],c=22;R=mulberry(G.seed*13+5);
  for(let k=0;k<320;k++){const i=rint(2,w-3),j=rint(2,h-3);if(t[j*w+i]!==4||hyp(i-c,j-c)<4)continue;if(i>=c+1&&j>=c+1&&i<=c+8&&j<=c+9&&R()<.7)continue;
    deco.push({k:pick(['tuft','tuft','tuft','flowers','flowers','pebbles','shrooms']),x:i+rnd(.1,.9),y:j+rnd(.1,.9),v:rint(0,4)})}
  if(m.arena){const A=m.arena;deco.push({k:'arena',x:A.x,y:A.y,v:0});
    for(let k=0;k<70;k++){const a=rnd(0,6.28),r=rnd(0,11.5),x=A.x+Math.cos(a)*r,y=A.y+Math.sin(a)*r;if(t[Math.floor(y)*w+Math.floor(x)]===7)deco.push({k:pick(['pebbles','pebbles','moss','blood','bones','leaves','rubble']),x,y,v:rint(0,3)})}
    for(let i=0;i<w;i++)for(let j=0;j<h;j++)if(t[j*w+i]===8&&R()<.35)deco.push({k:pick(['moss','moss','pebbles','leaves']),x:i+rnd(.1,.9),y:j+rnd(.1,.9),v:rint(0,3)});
    m.props=[];for(const a of[.9,2.2,4.1,5.3])m.props.push({k:'brazier',x:A.x+Math.cos(a)*10.6,y:A.y+Math.sin(a)*10.6,ph:rnd(0,6)})}
  for(const d of deco)d.v=Math.min(d.v,SPR.deco[d.k].length-1);
  m.deco=deco;m.crit=[];for(let k=0;k<5;k++)m.crit.push({k:'crow',x:c,y:c,a:rnd(0,6.28),r:rnd(2.2,4),sp:rnd(.35,.6)*(Math.random()<.5?1:-1),z:rnd(360,470),t:rnd(0,9)});for(let k=0;k<7;k++)m.crit.push({k:'fly',x:c+rnd(-10,10),y:c+rnd(-10,10),a:rnd(0,6.28),t:rnd(0,9),col:pick(['#fff4a0','#ffffff','#ff9a30','#c8e4ff'])});R=Math.random}
const PLIGHT={torch:{r:170,a:.85,col:'255,120,40',f:8,h:WH*.5},brazier:{r:210,a:.85,col:'255,120,40',f:8,h:14},candles:{r:115,a:.7,col:'255,170,80',f:5,h:10},altar:{r:150,a:.6,col:'255,40,20',f:6,h:20},shaft:{r:150,a:.85,col:null,f:0}};
function propLight(p){if(p.k==='mushrooms'){const C=SPR.prop.shroomC[p.v];return{r:95,a:.55,col:C?hex3(C[1]).join(','):'64,224,208',f:2,h:8}}return PLIGHT[p.k]||null}
function drawProp(p){const[sx,sy]=iso(p.x,p.y);if(sx<-90||sx>W+90||sy<-140||sy>H+80)return;
  if(p.k==='torch'){const hx=sx,hy=sy-WH*.62;ctx.fillStyle='#0a0a0c';ctx.fillRect(hx-2,hy-2,4,12);ctx.fillStyle='#4a3420';ctx.fillRect(hx-1.5,hy-6,3,8);flame(hx,hy-6,6,p.ph);return}
  if(p.k==='brazier'){shadow(sx,sy,.32);ctx.fillStyle='#0d0d10';ctx.beginPath();ctx.moveTo(sx-9,sy);ctx.lineTo(sx-4,sy-16);ctx.lineTo(sx+4,sy-16);ctx.lineTo(sx+9,sy);ctx.closePath();ctx.fill();
    ctx.fillStyle='#2a2a30';ctx.beginPath();ctx.ellipse(sx,sy-18,12,5,0,0,7);ctx.fill();ctx.fillStyle='#ff6a1a';ctx.beginPath();ctx.ellipse(sx,sy-19,9,3.4,0,0,7);ctx.fill();flame(sx,sy-19,10,p.ph);
    if(Math.random()<.08)G.fx.push({x:p.x+rnd(-.1,.1),y:p.y+rnd(-.1,.1),z:.7,vx:0,vy:0,vz:1.6,life:.9,t:0,col:'#ffb060',s:1.6});return}
  if(p.k==='shaft'||p.k==='fog')return;
  if(p.k==='fire'){const s2=p.s||1,y0=sy-(p.h||0);if(!p.h){ctx.strokeStyle='#2a1a0c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx-7*s2,sy-1);ctx.lineTo(sx+6*s2,sy-3);ctx.moveTo(sx-5*s2,sy-4);ctx.lineTo(sx+7*s2,sy);ctx.stroke()}
    flame(sx,y0-2,8*s2,p.ph);flame(sx+4*s2,y0,5*s2,p.ph+1);flame(sx-4*s2,y0,5*s2,p.ph+2);ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,y0-6,0,sx,y0-6,46*s2);g.addColorStop(0,'rgba(255,150,50,.28)');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.fillRect(sx-46*s2,y0-52*s2,92*s2,92*s2);ctx.restore();return}
  const L=SPR.prop[p.k];if(!L)return;const c=L[p.v%L.length];
  if(p.face){const top={banner:-WH+3,chains:-WH+2,niche:-WH*.66,wallweb:-WH}[p.k]??-WH*.6;ctx.save();ctx.translate(sx,sy);ctx.transform(1,p.face==='y'?.5:-.5,0,1,0,0);ctx.drawImage(c,-c.ax,top);ctx.restore();return}
  ctx.drawImage(c,sx-c.ax,sy-c.ay);
  if(p.k==='candles'){const tops=SPR.prop.candlesTop[p.v]||[];for(const[x,y]of tops)flame(sx+x,sy+y,2.6,p.ph+x)}
  else if(p.k==='altar'){flame(sx-12,sy-30,3,p.ph);flame(sx+12,sy-30,3,p.ph+2)}}
function drawCritter(c){const[sx,sy]=iso(c.x,c.y);if(sx<-20||sx>W+20||sy<-60-(c.z||0)||sy>H+20)return;
  if(c.k==='rat'){const[dx,dy]=scrDir(c.a),b=c.sp>0?Math.sin(c.t*30)*.6:0;ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(sx,sy,5,2,0,0,7);ctx.fill();
    ctx.strokeStyle='#5a4038';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(sx-dx*4,sy-2-dy*2);ctx.quadraticCurveTo(sx-dx*9,sy-1-dy*4+Math.sin(c.t*8)*2,sx-dx*12,sy-dy*6);ctx.stroke();
    blob(sx-dx*1,sy-2.5+b,4,2.4,['#140e0a','#2a1e16','#4a3a2c','#6a5644']);blob(sx+dx*3.5,sy-2.5+dy*1.5+b,2,1.6,['#140e0a','#2a1e16','#4a3a2c','#6a5644']);ctx.fillStyle='#ff4a3a';ctx.fillRect(sx+dx*4.6,sy-3.2+dy*1.5,1,1)}
  else if(c.k==='crow'){const z=c.z+Math.sin(c.t*.8)*10,f=Math.sin(c.t*9),y=sy-z;ctx.strokeStyle='#08080a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx-6,y-f*3);ctx.lineTo(sx,y+1);ctx.lineTo(sx+6,y-f*3);ctx.stroke();ctx.fillStyle='#08080a';ctx.fillRect(sx-1,y-.5,3,2)}
  else{const z=26+Math.sin(c.t*1.3)*8,f=Math.abs(Math.sin(c.t*14));ctx.fillStyle=c.col;ctx.fillRect(sx-3*f-1,sy-z-1,3*f+1,2);ctx.fillRect(sx+1,sy-z-1,3*f+1,2);ctx.fillStyle='#1a1a1a';ctx.fillRect(sx,sy-z-1,1,2.5)}}
// ambient life: dust in light shafts, spores, fireflies, drips, rats and butterflies
function ambient(dt){const m=G.map;if(!m)return;const near=(x,y,r=14)=>Math.abs(x-P.x)<r&&Math.abs(y-P.y)<r;
  if(m.props)for(const p of m.props){if(!near(p.x,p.y))continue;
    if(p.k==='shaft'&&Math.random()<dt*7)fxp({k:'mote',x:p.x+rnd(-.6,.6),y:p.y+rnd(-.6,.6),z:rnd(.2,3.5),vx:rnd(-.08,.08),vy:rnd(-.08,.08),vz:rnd(-.12,.05),life:rnd(2,4),col:'#e8f0ff',s:rnd(.5,1),g:0});
    else if(p.k==='mushrooms'&&Math.random()<dt*1.5){const C=SPR.prop.shroomC[p.v];fxp({k:'mote',x:p.x+rnd(-.3,.3),y:p.y+rnd(-.3,.3),z:.2,vx:rnd(-.1,.1),vy:rnd(-.1,.1),vz:rnd(.15,.4),life:rnd(1.5,3),col:C?C[2]:'#c0fff8',s:rnd(.5,1),g:0})}
    else if(p.k==='altar'&&Math.random()<dt*2)fxp({k:'ember',x:p.x+rnd(-.3,.3),y:p.y+rnd(-.3,.3),z:.7,vz:rnd(.4,1),life:rnd(.8,1.5),col:'#ff4a2a',s:1,g:-.3});
    else if(p.k==='candles'&&Math.random()<dt*.6)smoke(p.x,p.y,1,'rgba(70,60,50,',2.5,.6);
    else if(p.k==='fire'){if(Math.random()<dt*5*(p.s||1))fxp({k:'smoke',x:p.x+rnd(-.2,.2),y:p.y+rnd(-.2,.2),z:(p.h||0)/30+.6,vx:rnd(-.2,.2),vy:rnd(-.2,.2),vz:rnd(.8,1.5),life:rnd(1.5,2.6),col:'rgba(30,26,24,',s:rnd(5,9),g:0});if(Math.random()<dt*4)fxp({k:'ember',x:p.x,y:p.y,z:(p.h||0)/30+.4,vx:rnd(-.5,.5),vy:rnd(-.5,.5),vz:rnd(1,2.2),life:rnd(.8,1.6),col:pick(['#ffc070','#ff9a30']),s:1,g:-.4})}
    else if(p.k==='fog'&&Math.random()<dt*3)fxp({k:'smoke',x:p.x+rnd(-p.r,p.r),y:p.y+rnd(-p.r,p.r),z:rnd(0,.3),vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:.05,life:rnd(3,5),col:'rgba(200,210,220,',s:rnd(10,18),g:0})}
  for(const[x,y,r]of m.fireflies||[])if(near(x,y,18)&&Math.random()<dt*2.5)fxp({k:'mote',x:x+rnd(-r,r),y:y+rnd(-r,r),z:rnd(.3,1.6),vx:rnd(-.3,.3),vy:rnd(-.3,.3),vz:rnd(-.1,.1),life:rnd(2,4),col:pick(['#c8f878','#e8ffc0']),s:rnd(.7,1.2),g:0});
  for(const[x,y,r]of m.spores||[])if(near(x,y,18)&&Math.random()<dt*4)fxp({k:'mote',x:x+rnd(-r,r),y:y+rnd(-r,r),z:rnd(0,1),vx:rnd(-.1,.1),vy:rnd(-.1,.1),vz:rnd(.05,.25),life:rnd(2.5,4.5),col:pick(['#c0c080','#a080c0','#d8d8b0']),s:rnd(.5,.9),g:0});
  for(const d of m.drips||[])if(near(d.x,d.y)&&Math.random()<dt*.45)fxp({k:'drip',x:d.x+rnd(-.2,.2),y:d.y+rnd(-.2,.2),z:4.5,vz:0,life:3,col:'#a8c8e0',s:1,g:14});
  for(const c of m.crit||[]){c.t+=dt;if(c.k==='rat'){const d=hyp(P.x-c.x,P.y-c.y);if(d<2.6){c.a=Math.atan2(c.y-P.y,c.x-P.x)+rnd(-.4,.4);c.sp=5}else if(Math.random()<dt*.6){c.sp=Math.random()<.5?0:rnd(1,2.2);c.a+=rnd(-1.5,1.5)}
      if(c.sp>0){const nx=c.x+Math.cos(c.a)*c.sp*dt,ny=c.y+Math.sin(c.a)*c.sp*dt;if(walkable(nx,ny)&&walkable(nx+Math.cos(c.a)*.2,ny+Math.sin(c.a)*.2)){c.x=nx;c.y=ny}else{c.a+=rnd(1.5,3);c.sp*=.7}c.sp=Math.max(0,c.sp-dt*1.2)}}
    else if(c.k==='crow'){c.a+=c.sp*dt;c.x=(c.cx??22.5)+Math.cos(c.a)*c.r;c.y=(c.cy??22.5)+Math.sin(c.a)*c.r}
    else{c.a+=Math.sin(c.t*.7)*dt*2;c.x+=Math.cos(c.a)*dt*.8;c.y+=Math.sin(c.a)*dt*.8;const hx=(c.cx??22.5)-.5,hy=(c.cy??22.5)-.5;if(hyp(c.x-hx,c.y-hy)>13)c.a=Math.atan2(hy-c.y,hx-c.x)}}}
// floor tint per theme, organic edges from a cheap noise
function themeTint(m,i,j,sx,sy){const th=m.theme&&m.theme[j*m.w+i];if(!th)return;const col=TINT[th-1];if(!col)return;const n=(Math.sin(i*.9+j*.4)+Math.sin(i*.37-j*.81+2)+Math.sin((i+j)*.23))/3,a=(th===2?.34:th===5?.4:.24)*(.55+n*.45);if(a<=.02)return;
  ctx.fillStyle=`rgba(${col},${a.toFixed(2)})`;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+32,sy+16);ctx.lineTo(sx,sy+32);ctx.lineTo(sx-32,sy+16);ctx.closePath();ctx.fill()}
function drawObj(o){const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-200||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o;
  if(o.type==='shrine'){const lit=o.ow?!!G.owFires[o.key]:G.lit[G.floor];shadow(sx,sy,.5);ctx.fillStyle='#1d1d21';ctx.beginPath();ctx.moveTo(sx-16,sy);ctx.lineTo(sx-11,sy-14);ctx.lineTo(sx+11,sy-14);ctx.lineTo(sx+16,sy);ctx.closePath();ctx.fill();ctx.fillStyle='#3a3a42';ctx.fillRect(sx-11,sy-17,22,4);
    const fl=Math.sin(G.t*9)*2;if(lit){const g=ctx.createRadialGradient(sx,sy-30,2,sx,sy-28,30);g.addColorStop(0,'rgba(255,248,220,.95)');g.addColorStop(.35,'rgba(255,190,90,.6)');g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy-28,30,0,7);ctx.fill();
      ctx.fillStyle='#fff1c8';ctx.beginPath();ctx.moveTo(sx-6,sy-17);ctx.quadraticCurveTo(sx,sy-44-fl,sx+6,sy-17);ctx.fill();ctx.strokeStyle='rgba(255,220,150,.35)';ctx.lineWidth=1;for(let k=0;k<6;k++){const a=G.t*.4+k;ctx.beginPath();ctx.moveTo(sx,sy-28);ctx.lineTo(sx+Math.cos(a)*40,sy-28+Math.sin(a)*24);ctx.stroke()}}
    else{ctx.fillStyle='#7a3010';ctx.fillRect(sx-5,sy-20,10,3)}
    if(hov)label(sx,sy-58,(o.name||'Leuchtfeuer')+(lit?'':' (erloschen)'),'#ffd88a')}
  else if(o.type==='stairs'){ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(sx,sy-14);ctx.lineTo(sx+30,sy+1);ctx.lineTo(sx,sy+16);ctx.lineTo(sx-30,sy+1);ctx.closePath();ctx.fill();ctx.strokeStyle='#4a4c58';ctx.lineWidth=1.5;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(sx-22+k*6,sy-3+k*3);ctx.lineTo(sx+2+k*6,sy-15+k*3+12);ctx.stroke()}
    ctx.strokeStyle=`rgba(122,164,255,${.4+Math.sin(G.t*3)*.2})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx,sy-14);ctx.lineTo(sx+30,sy+1);ctx.lineTo(sx,sy+16);ctx.lineTo(sx-30,sy+1);ctx.closePath();ctx.stroke();if(hov)label(sx,sy-30,'Hinab zu Ebene '+(G.floor+1),'#ece4cf')}
  else if(o.type==='colossus'){const c=SPR.colossus,pd=P.x+P.y,behind=pd<o.x+o.y&&Math.abs(iso(P.x,P.y)[0]-sx)<60&&iso(P.x,P.y)[1]<sy;if(behind)ctx.globalAlpha=.45;ctx.drawImage(c,sx-c.ax,sy-c.ay);ctx.globalAlpha=1;
    const gl=Math.max(G.statueT||0,0),pu=.25+Math.sin(G.t*2)*.1+gl*.6;ctx.save();ctx.globalCompositeOperation='lighter';for(const[x,y]of SPR.colEyes||[]){const g=ctx.createRadialGradient(sx+x,sy+y,0,sx+x,sy+y,6+gl*10);g.addColorStop(0,`rgba(255,60,30,${Math.min(1,pu)})`);g.addColorStop(1,'rgba(255,30,0,0)');ctx.fillStyle=g;ctx.fillRect(sx+x-20,sy+y-20,40,40)}ctx.restore();
    if(hov)label(sx,sy-c.ay-10,(G.maxFloor||0)<20?'Wächter der Arena · erwacht ab Ebene 20':'Wächter der Arena · ruft drei Gegner','#e8c878')}
  else if(o.type==='stash'){const c=SPR.prop.stash[0],pl=.5+Math.sin(G.t*2)*.25;ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(sx,sy-8,0,sx,sy-8,46);g.addColorStop(0,`rgba(120,90,255,${.28*pl})`);g.addColorStop(1,'rgba(80,60,200,0)');ctx.fillStyle=g;ctx.fillRect(sx-46,sy-54,92,92);ctx.restore();
    ctx.drawImage(c,sx-c.ax,sy-c.ay);ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.4+pl*.6;for(const[x,y]of SPR.stashRunes||[]){ctx.fillStyle='#b8a0ff';ctx.fillRect(sx+x,sy+y,1.5,1.5)}ctx.restore();
    if(Math.random()<.12)fxp({k:'mote',x:o.x+rnd(-.4,.4),y:o.y+rnd(-.4,.4),z:rnd(.3,.8),vz:rnd(.2,.6),life:rnd(1,2),col:pick(['#b8a0ff','#e0d8ff','#8a6ad0']),s:rnd(.6,1.1),g:0});
    if(hov)label(sx,sy-48,'Bodenlose Truhe','#c8b8ff')}
  else if(o.type==='chest'){shadow(sx,sy,.4);ctx.fillStyle='#2a1a0c';ctx.fillRect(sx-13,sy-16,26,14);ctx.fillStyle='#3e2814';if(o.open){ctx.fillRect(sx-13,sy-26,26,6)}else ctx.fillRect(sx-13,sy-21,26,6);ctx.strokeStyle='#c8a050';ctx.lineWidth=1.5;ctx.strokeRect(sx-13,sy-16,26,14);ctx.fillStyle='#c8a050';ctx.fillRect(sx-2,sy-13,4,5);if(hov&&!o.open)label(sx,sy-36,'Truhe','#ece4cf')}
  else if(o.type==='merchant'){shadow(sx,sy,.4);ctx.fillStyle='#2b1d12';ctx.beginPath();ctx.moveTo(sx,sy-40);ctx.lineTo(sx+11,sy-2);ctx.lineTo(sx-11,sy-2);ctx.closePath();ctx.fill();ctx.fillStyle='#e8dcc0';ctx.beginPath();ctx.arc(sx,sy-38,5,0,7);ctx.fill();ctx.fillStyle='#141210';ctx.beginPath();ctx.ellipse(sx,sy-42,13,3.5,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(sx-6,sy-43);ctx.lineTo(sx,sy-54);ctx.lineTo(sx+6,sy-43);ctx.fill();
    const g=ctx.createRadialGradient(sx+12,sy-20,1,sx+12,sy-20,14);g.addColorStop(0,'rgba(255,220,140,.9)');g.addColorStop(1,'rgba(255,180,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx+12,sy-20,14,0,7);ctx.fill();ctx.fillStyle='#ffe2a0';ctx.fillRect(sx+10,sy-23,4,6);
    label(sx,sy-66,'Odalinde, Händlerin','#ffd88a',hov)}
  else if(o.type==='door'){if(hov)label(sx,sy-120,topFloor()>1?'Den Turm betreten · Ebene '+topFloor():'Den Turm betreten','#ece4cf')}}
function drawGlutmal(){const g0=G.glutmal,[sx,sy]=iso(g0.x,g0.y),p=.6+Math.sin(G.t*4)*.25;const g=ctx.createRadialGradient(sx,sy-6,1,sx,sy-6,24);g.addColorStop(0,`rgba(255,200,120,${p})`);g.addColorStop(.4,`rgba(255,110,30,${p*.7})`);g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(sx,sy-6,24,0,7);ctx.fill();if(Math.random()<.3)G.fx.push({x:g0.x+rnd(-.2,.2),y:g0.y+rnd(-.2,.2),z:.1,vx:0,vy:0,vz:2,life:.8,t:0,col:'#ff9a3a',s:2})}
function label(x,y,txt,col,force=true){if(force)G.lq.push([x,y,txt,col])}
function drawLabel(x,y,txt,col){ctx.font=Math.round(15/ZM*1.2)+"px 'IM Fell English SC', Georgia, serif";ctx.textAlign='center';const w=ctx.measureText(txt).width+12;ctx.fillStyle='rgba(0,0,0,.78)';ctx.fillRect(x-w/2,y-12,w,18);ctx.fillStyle=col;ctx.fillText(txt,x,y+2)}
const RCOL={normal:'#ece4cf',magic:'#7aa4ff',rare:'#ffd94f',unique:'#e8973a',rune:'#f0b25a',runeword:'#cdbf94'};
function drawGroundItem(gi,sx,sy){const it=gi.item;ctx.save();ctx.translate(sx,sy);if(it.rar!=='normal'){ctx.fillStyle=RCOL[it.rar];ctx.globalAlpha=.25+Math.sin(gi.t*4)*.1;ctx.beginPath();ctx.ellipse(0,0,16,8,0,0,7);ctx.fill();ctx.globalAlpha=1}
  const c=pxCanvas(itKey(it),itUq(it)),hop=gi.t<.4?Math.sin(gi.t/.4*Math.PI)*14:0;ctx.drawImage(c,-17,-28-hop);ctx.restore()}
function drawLabels(){
  G.labels=[];ctx.font=Math.round(15/ZM*1.2)+"px 'IM Fell English', Georgia, serif";ctx.textAlign='center';const m=G.map;const hl=G.state==='play'?null:null;
  const sorted=m.items.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y));
  for(const gi of sorted){if(!lootShown(gi.item))continue;const[sx,sy]=iso(gi.x,gi.y);if(sx<-80||sx>W+80||sy<-40||sy>H+40)continue;const txt=gi.item.name,w=ctx.measureText(txt).width+10,h=18;let x=sx-w/2,y=sy-42;
    for(let g=0;g<12;g++){const hit=G.labels.find(l=>x<l.x+l.w&&x+w>l.x&&y<l.y+l.h&&y+h>l.y);if(!hit)break;y=hit.y-h-1}
    G.labels.push({x,y,w,h,gi})}
  const hov=G.state==='play'?hoverLabel():null;
  for(const l of G.labels){ctx.fillStyle=l===hov?'rgba(40,40,60,.95)':'rgba(0,0,0,.72)';ctx.fillRect(l.x,l.y,l.w,l.h);ctx.fillStyle=RCOL[l.gi.item.rar];ctx.fillText(l.gi.item.name,l.x+l.w/2,l.y+13)}
  G.hoverLabelItem=hov?hov.gi.item:null}
function drawMinimap(){
  const m=G.map,big=m.w>160,R=56,n=big?R*2+1:Math.max(m.w,m.h),s=big?1.7:Math.min(3.2,150/m.w),i0=big?Math.floor(P.x)-R:0,j0=big?Math.floor(P.y)-R:0,ox=W-20-n*s*1.5,oy=56;ctx.save();ctx.globalAlpha=.85;
  const X=(x,y)=>[ox+((x-i0)-(y-j0))*s+n*s*.5,oy+((x-i0)+(y-j0))*s*.5];
  for(let j=Math.max(0,j0);j<Math.min(m.h,j0+n);j++)for(let i=Math.max(0,i0);i<Math.min(m.w,i0+n);i++){if(!m.explored[j*m.w+i])continue;const t=m.t[j*m.w+i];if(!t)continue;const[x,y]=X(i,j);
    ctx.fillStyle=t===2||t===3||t===5||t===9?'rgba(236,228,207,.75)':t===7||t===8?'rgba(170,160,140,.45)':m.kind==='town'?'rgba(116,194,30,.35)':'rgba(120,130,160,.25)';ctx.fillRect(x,y,s*1.1,s*.6)}
  const pt=(x,y,c,r=3)=>{const[a,b]=X(x,y);ctx.fillStyle=c;ctx.beginPath();ctx.arc(a,b,r,0,7);ctx.fill()};
  for(const o of m.objs){const i=Math.floor(o.x),j=Math.floor(o.y);if(!m.explored[j*m.w+i])continue;pt(o.x,o.y,o.type==='shrine'?'#ffd88a':o.type==='stairs'?'#7aa4ff':o.type==='merchant'||o.type==='stash'?'#ffd88a':'#c8a050',3)}
  if(m.world)for(const k in G.owFires){const f=G.owFires[k];if(Math.abs(f.x-P.x)<R&&Math.abs(f.y-P.y)<R)pt(f.x,f.y,'#ffb347',3.4)}
  for(const e of m.enemies)if(!e.dead&&e.aggro)pt(e.x,e.y,e.boss?'#ff8a2a':'#c42a1c',e.boss?4:1.6);
  if(m.world&&G.qtgt&&Math.abs(G.qtgt.x-P.x)<R&&Math.abs(G.qtgt.y-P.y)<R){const[a,b]=X(G.qtgt.x,G.qtgt.y);ctx.strokeStyle='#ffd88a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(a,b,5+Math.sin(G.t*5),0,7);ctx.stroke()}
  for(const r of mpVis())if(Math.abs(r.x-P.x)<R&&Math.abs(r.y-P.y)<R)pt(r.x,r.y,'#6ad0ff',3.2);pt(P.x,P.y,'#ffffff',3.2);ctx.restore()}

