/* ---------- palette: limited dark-fantasy colours, ordered dithering ---------- */
const PAL_RAMPS=[[14,'#040302','#2a241e','#6a6052','#c8c0b0'],[12,'#04060a','#22283a','#5a6680','#b8c4d4'],[12,'#0a0602','#3a2414','#7a5232','#c8a070'],[10,'#100402','#4a1a0c','#9a4a28','#d89060'],
 [10,'#120000','#500806','#a01c14','#ff6a50'],[10,'#401000','#c04008','#ff9a30','#fff4d0'],[10,'#1a1000','#6a4a0a','#c8962a','#fff0a8'],[9,'#080a04','#2a3218','#5e6a3a','#b0c080'],
 [12,'#0a1a02','#2a6a10','#6cbc20','#c8f878'],[12,'#020818','#0e3a8a','#3a7ae0','#c8e4ff'],[8,'#080410','#2e1a52','#7a5ac0','#d8c8ff'],[8,'#021010','#0e4a4a','#40c0b8','#e0fff8'],[10,'#200e06','#6a3a24','#b4805c','#f4d0aa']];
let PALR,PALG,PALB,LUT;
function buildPalette(){const cols=[[0,0,0],[255,255,255]];const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  for(const[n,...ks]of PAL_RAMPS){const K=ks.map(hx);for(let i=0;i<n;i++){const t=i/(n-1)*(K.length-1),k=Math.min(K.length-2,Math.floor(t)),u=t-k;cols.push(K[k].map((v,c)=>Math.round(v+(K[k+1][c]-v)*u)))}}
  PALR=new Uint8Array(cols.map(c=>c[0]));PALG=new Uint8Array(cols.map(c=>c[1]));PALB=new Uint8Array(cols.map(c=>c[2]));LUT=new Uint8Array(32768);
  for(let r=0;r<32;r++)for(let g=0;g<32;g++)for(let b=0;b<32;b++){const R0=r*8+4,G0=g*8+4,B0=b*8+4;let best=0,bd=1e12;
    for(let i=0;i<cols.length;i++){const dr=R0-PALR[i],dg=G0-PALG[i],db=B0-PALB[i],rm=(R0+PALR[i])/2,d=(2+rm/256)*dr*dr+4*dg*dg+(2+(255-rm)/256)*db*db;if(d<bd){bd=d;best=i}}
    LUT[(r<<10)|(g<<5)|b]=best}}
const BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v-7.5)*1.6);
// pixel UI textures, painted once and snapped to the palette
let SKIC={};
const skImg=k=>`<img class="px sk" src="${SKIC[k]}" alt="">`;
function buildUI(){
  const Rn=mulberry(4711),root=document.documentElement.style;
  const mk2=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d',{willReadFrequently:true});f(g,w,h);quantize(g,w,h);return c.toDataURL()};
  const set=(k,u)=>root.setProperty(k,`url(${u})`);
  const bands=(g,sz,list)=>list.forEach(([lt,dk],k)=>{g.fillStyle=lt;g.fillRect(k,k,sz-2*k,1);g.fillRect(k,k,1,sz-2*k);g.fillStyle=dk;g.fillRect(k,sz-1-k,sz-2*k,1);g.fillRect(sz-1-k,k,1,sz-2*k)});
  const rivet=(g,x,y,r,cols)=>{const q=g.createRadialGradient(x-r*.4,y-r*.4,0,x,y,r*1.2);q.addColorStop(0,cols[0]);q.addColorStop(.5,cols[1]);q.addColorStop(1,cols[2]);g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,7);g.fill()};
  const GOLD=['#fff0a8','#c8962a','#3a2406'];
  set('--tx-stone',mk2(64,64,g=>{g.fillStyle='#14110e';g.fillRect(0,0,64,64);
    for(let row=0;row<4;row++){let x=-(row%2)*11;const y=row*16;while(x<64){const w=13+Math.floor(Rn()*15),t=30+Math.floor(Rn()*16);
      const blk=ox=>{g.fillStyle=`rgb(${t+8},${t+2},${t-4})`;g.fillRect(ox+1,y+1,w-2,14);g.fillStyle='rgba(255,236,200,.13)';g.fillRect(ox+1,y+1,w-2,1);g.fillRect(ox+1,y+1,1,14);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(ox+1,y+14,w-2,1);g.fillRect(ox+w-2,y+1,1,14)};
      blk(x);if(x+w>64)blk(x-64);x+=w}}
    for(let k=0;k<700;k++){g.fillStyle=Rn()<.55?'rgba(0,0,0,.28)':'rgba(255,230,190,.07)';g.fillRect(Rn()*64|0,Rn()*64|0,1+(Rn()<.2),1)}}));
  set('--tx-frame',mk2(24,24,g=>{bands(g,24,[['#030202','#030202'],['#8a5a20','#2a1606'],['#e2b23c','#6a4a0a'],['#c8962a','#4a2c08'],['#4a2c12','#120a04'],['#050302','#050302']]);
    for(const[x,y]of[[0,0],[16,0],[0,16],[16,16]]){g.fillStyle='#030202';g.fillRect(x,y,8,8);g.fillStyle='#6a4a20';g.fillRect(x+1,y+1,6,6);g.fillStyle='#a87418';g.fillRect(x+1,y+1,6,1);g.fillRect(x+1,y+1,1,6);rivet(g,x+4,y+4,2.3,GOLD)}}));
  set('--tx-sock',mk2(6,6,g=>bands(g,6,[['#020101','#6a5a46'],['#120e0a','#2e261e']])));
  set('--tx-sockg',mk2(6,6,g=>bands(g,6,[['#6a4a0a','#fff0a8'],['#2a1a06','#c8962a']])));
  const btn=(face,lt,dk)=>mk2(12,12,g=>{g.fillStyle=face;g.fillRect(0,0,12,12);for(let k=0;k<20;k++){g.fillStyle=Rn()<.5?'rgba(0,0,0,.2)':'rgba(255,230,190,.06)';g.fillRect(2+Rn()*8|0,2+Rn()*8|0,1,1)}bands(g,12,[['#030202','#030202'],[lt,dk],['rgba(255,230,190,.12)','rgba(0,0,0,.3)']])});
  set('--tx-btn',btn('#3e3428','#8a7656','#1a140e'));set('--tx-btnh',btn('#4e4232','#c8a870','#2a2016'));set('--tx-btnd',btn('#2a2219','#1a140e','#6a5a42'));
  set('--tx-tipf',mk2(12,12,g=>{bands(g,12,[['#030202','#030202'],['#c8962a','#6a4a0a'],['#0a0806','#0a0806']]);for(const[x,y]of[[1,1],[10,1],[1,10],[10,10]]){g.fillStyle='#fff0a8';g.fillRect(x,y,1,1)}}));
  set('--tx-div',mk2(120,8,g=>{const q=g.createLinearGradient(0,0,120,0);q.addColorStop(0,'rgba(200,150,42,0)');q.addColorStop(.2,'#c8962a');q.addColorStop(.8,'#c8962a');q.addColorStop(1,'rgba(200,150,42,0)');
    g.fillStyle='#030202';g.fillRect(0,3,120,3);g.fillStyle=q;g.fillRect(0,3,120,1);g.fillStyle='rgba(60,36,8,.9)';g.fillRect(6,4,108,1);
    g.fillStyle='#030202';g.beginPath();g.moveTo(60,0);g.lineTo(65,4);g.lineTo(60,8);g.lineTo(55,4);g.fill();g.fillStyle='#c8962a';g.beginPath();g.moveTo(60,1);g.lineTo(64,4);g.lineTo(60,7);g.lineTo(56,4);g.fill();rivet(g,60,4,1.8,['#ff9c88','#c41c14','#3a0404'])}));
  const ring=gem=>mk2(72,72,g=>{const img=g.createImageData(72,72),d=img.data;
    for(let y=0;y<72;y++)for(let x=0;x<72;x++){const dx=x+.5-36,dy=y+.5-36,r=Math.hypot(dx,dy),i=(y*72+x)*4;if(r<25.5||r>35.6)continue;const lam=-(dx+dy)/(r*1.41);let c;
      if(r<28.2){const t=(28.2-r)/2.7;c=lam>0?[200+t*40,150+t*30,42]:[106,74,10]}
      else if(r>34.6)c=[6,4,2];else{const n=(Math.sin(x*1.7+y*2.3)*Math.sin(x*.7-y*1.1))*10,v=58+lam*30+n;c=[v+8,v,v-8];if(r<29.2)c=[20,14,8]}
      d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255}
    g.putImageData(img,0,0);for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;rivet(g,36+Math.cos(a)*31.5,36+Math.sin(a)*31.5,2.2,GOLD)}
    g.fillStyle='#030202';g.beginPath();g.moveTo(36,-1);g.lineTo(42,6);g.lineTo(36,13);g.lineTo(30,6);g.fill();g.fillStyle='#a87418';g.beginPath();g.moveTo(36,0);g.lineTo(41,6);g.lineTo(36,12);g.lineTo(31,6);g.fill();rivet(g,36,6,3,gem)});
  // painted skill icons: dark square plate, bevel, a lit motif
  const plate=(g,a,b)=>{const q=g.createRadialGradient(16,14,2,16,16,24);q.addColorStop(0,a);q.addColorStop(1,b);g.fillStyle=q;g.fillRect(0,0,32,32);bands(g,32,[['#030202','#030202'],['rgba(255,230,190,.25)','rgba(0,0,0,.5)']])};
  const glow=(g,x,y,r,c)=>{const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,32,32)};
  const blade=(g,ang,len,cols)=>{g.save();g.translate(16,16);g.rotate(ang);const q=g.createLinearGradient(0,-2,0,2);q.addColorStop(0,cols[0]);q.addColorStop(.5,cols[1]);q.addColorStop(1,cols[2]);g.fillStyle=q;g.beginPath();g.moveTo(3,-1.6);g.lineTo(len-3,-1.4);g.lineTo(len,0);g.lineTo(len-3,1.4);g.lineTo(3,1.6);g.fill();g.fillStyle='#c8962a';g.fillRect(2,-3,1.6,6);g.restore()};
  const STEEL=['#eef2f8','#a7b1c2','#3a4252'];
  SKIC={
   whirl:mk2(32,32,g=>{plate(g,'#3a2a1a','#0a0604');g.strokeStyle='rgba(255,230,190,.55)';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.arc(16,16,7+k*3.2,k*2.1,k*2.1+2.2);g.stroke()}for(let k=0;k<3;k++)blade(g,k*2.094+.4,13,STEEL);rivet(g,16,16,2.4,GOLD)}),
   fire:mk2(32,32,g=>{plate(g,'#3a1206','#080200');glow(g,15,17,15,'rgba(255,140,40,.7)');for(let k=0;k<5;k++){g.fillStyle=['#8a2c08','#e0661a','#ff9a30','#ffc070','#fff4d0'][k];const r=10-k*1.8;g.beginPath();g.moveTo(15-r,18);g.quadraticCurveTo(15-r*.6,18-r*1.6,22-k*.6,5+k*2.2);g.quadraticCurveTo(15+r*.9,14-r*.4,15+r,18);g.arc(15,18,r,0,Math.PI);g.fill()}}),
   nova:mk2(32,32,g=>{plate(g,'#0e2238','#02060c');glow(g,16,16,15,'rgba(140,210,255,.55)');g.strokeStyle='#c8e4ff';g.lineWidth=2.2;g.beginPath();g.arc(16,16,10,0,7);g.stroke();g.strokeStyle='#3a7ae0';g.lineWidth=1;g.beginPath();g.arc(16,16,12.5,0,7);g.stroke();
     for(let k=0;k<8;k++){const a=k/8*6.283;g.save();g.translate(16+Math.cos(a)*10,16+Math.sin(a)*10);g.rotate(a);g.fillStyle=k%2?'#e0fff8':'#a8d0ff';g.beginPath();g.moveTo(-1.5,0);g.lineTo(0,-3.5);g.lineTo(1.5,0);g.lineTo(0,3.5);g.fill();g.restore()}g.fillStyle='#ffffff';g.fillRect(15,15,2,2)}),
   charge:mk2(32,32,g=>{plate(g,'#2a2a30','#060608');for(let k=0;k<4;k++){g.fillStyle=`rgba(236,228,207,${.15+k*.12})`;g.fillRect(3+k*2,9+k*4,10,1.4)}
     const q=g.createLinearGradient(12,6,28,26);q.addColorStop(0,'#acb1ba');q.addColorStop(.5,'#787d88');q.addColorStop(1,'#2a2c33');g.fillStyle=q;g.beginPath();g.moveTo(14,7);g.lineTo(26,7);g.lineTo(26,17);g.quadraticCurveTo(26,24,20,27);g.quadraticCurveTo(14,24,14,17);g.closePath();g.fill();
     g.strokeStyle='#c8962a';g.lineWidth=1.4;g.stroke();g.fillStyle='#a3201a';g.fillRect(19,10,2,12);g.fillRect(16,14,8,2)}),
   ward:mk2(32,32,g=>{plate(g,'#2a2418','#060504');glow(g,16,16,14,'rgba(236,228,200,.35)');g.lineCap='round';
     for(let k=0;k<5;k++){const y=8+k*4,w=11-Math.abs(k-2)*1.5;g.strokeStyle='#0a0806';g.lineWidth=3.4;g.beginPath();g.moveTo(16-w,y+2);g.quadraticCurveTo(16,y-2,16+w,y+2);g.stroke();g.strokeStyle=k%2?'#cfc5a5':'#f6f0de';g.lineWidth=1.8;g.stroke()}
     g.strokeStyle='#958a6e';g.lineWidth=2.2;g.beginPath();g.moveTo(16,5);g.lineTo(16,27);g.stroke()}),
   chain:mk2(32,32,g=>{plate(g,'#101a3a','#02030a');glow(g,16,16,15,'rgba(150,190,255,.5)');const pts=[[22,3],[13,13],[19,15],[9,29]];
     for(const[w,c]of[[4,'rgba(120,160,255,.5)'],[2.2,'#cfe0ff'],[1,'#ffffff']]){g.strokeStyle=c;g.lineWidth=w;g.lineJoin='miter';g.beginPath();pts.forEach(([x,y],k)=>k?g.lineTo(x,y):g.moveTo(x,y));g.stroke()}
     g.strokeStyle='#a8d0ff';g.lineWidth=1;g.beginPath();g.moveTo(13,13);g.lineTo(6,15);g.moveTo(19,15);g.lineTo(26,20);g.stroke()}),
   slam:mk2(32,32,g=>{plate(g,'#3a2a14','#080502');glow(g,16,22,13,'rgba(255,200,120,.35)');g.strokeStyle='#ffd88a';g.lineWidth=1.6;g.beginPath();g.moveTo(4,26);g.lineTo(10,22);g.lineTo(13,25);g.lineTo(18,18);g.lineTo(22,21);g.lineTo(28,12);g.stroke();
     for(const[x,y,r]of[[9,17,2.5],[16,12,3],[24,9,2],[20,26,2.2]]){g.fillStyle='#6a5a44';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='#a8957a';g.fillRect(x-r*.5,y-r*.6,r*.6,r*.5)}blade(g,-1.3,13,STEEL)}),
   cry:mk2(32,32,g=>{plate(g,'#4a1408','#0a0202');glow(g,12,16,12,'rgba(255,90,40,.6)');g.fillStyle='#e8c8a0';g.beginPath();g.arc(11,16,6,0,7);g.fill();g.fillStyle='#2a0a04';g.beginPath();g.ellipse(13,18,2.4,3,0,0,7);g.fill();
     g.strokeStyle='#ffb070';g.lineWidth=1.8;for(let k=0;k<3;k++){g.beginPath();g.arc(14,16,7+k*4,-.7,.7);g.stroke()}}),
   leap:mk2(32,32,g=>{plate(g,'#2a2a30','#060608');g.strokeStyle='rgba(236,228,207,.7)';g.setLineDash([2,2]);g.lineWidth=1.4;g.beginPath();g.moveTo(4,26);g.quadraticCurveTo(14,0,24,22);g.stroke();g.setLineDash([]);
     g.save();g.translate(24,22);g.rotate(1.9);g.translate(-16,-16);blade(g,-1.57,12,STEEL);g.restore();g.fillStyle='#c8a050';for(let k=0;k<5;k++)g.fillRect(18+k*2.2,27,1.4,2)}),
   multi:mk2(32,32,g=>{plate(g,'#1e2e14','#040802');for(let k=0;k<5;k++){const a=-1.1+k*.27;g.save();g.translate(5,27);g.rotate(a);g.strokeStyle='#d8ccb0';g.lineWidth=1.4;g.beginPath();g.moveTo(0,0);g.lineTo(22,0);g.stroke();g.fillStyle='#eef2f8';g.beginPath();g.moveTo(25,0);g.lineTo(21,-2.2);g.lineTo(21,2.2);g.fill();g.fillStyle='#a83a2a';g.fillRect(0,-1.5,3,3);g.restore()}}),
   pierce:mk2(32,32,g=>{plate(g,'#24242c','#050508');glow(g,20,12,10,'rgba(255,240,200,.4)');for(let k=0;k<4;k++){g.fillStyle=`rgba(255,240,200,${.1+k*.08})`;g.fillRect(3+k*3,24-k*3,6,1.2)}
     g.save();g.translate(5,27);g.rotate(-.78);g.strokeStyle='#e8dcc0';g.lineWidth=2.2;g.beginPath();g.moveTo(0,0);g.lineTo(28,0);g.stroke();g.fillStyle='#ffffff';g.beginPath();g.moveTo(32,0);g.lineTo(26,-3.5);g.lineTo(26,3.5);g.fill();g.restore()}),
   trap:mk2(32,32,g=>{plate(g,'#1a2a10','#040602');g.fillStyle='#3a3020';g.beginPath();g.ellipse(16,19,11,6,0,0,7);g.fill();g.strokeStyle='#8a7a4a';g.lineWidth=1.4;g.stroke();
     for(let k=0;k<8;k++){const a=k/8*6.283;g.fillStyle=k%2?'#c8b890':'#e8e0c8';g.beginPath();g.moveTo(16+Math.cos(a)*6,19+Math.sin(a)*3.3);g.lineTo(16+Math.cos(a)*9,19+Math.sin(a)*5-8);g.lineTo(16+Math.cos(a+.25)*7,19+Math.sin(a+.25)*3.8);g.fill()}glow(g,16,19,6,'rgba(150,230,80,.5)')}),
   dash:mk2(32,32,g=>{plate(g,'#1e1430','#04020a');for(let k=0;k<3;k++){g.fillStyle=`rgba(${120+k*50},${90+k*40},${200+k*20},${.25+k*.3})`;const x=6+k*8;g.beginPath();g.arc(x,10,3,0,7);g.fill();g.fillRect(x-2.5,13,5,9);g.fillRect(x-3,22,2,6);g.fillRect(x+1,22,2,6)}}),
   rain:mk2(32,32,g=>{plate(g,'#1a2418','#040604');glow(g,16,26,12,'rgba(232,226,208,.3)');for(let k=0;k<7;k++){const x=5+k*3.6,y=3+(k*7)%10;g.strokeStyle='#d8ccb0';g.lineWidth=1.2;g.beginPath();g.moveTo(x-2,y);g.lineTo(x+1,y+13);g.stroke();g.fillStyle='#ffffff';g.beginPath();g.moveTo(x+1.6,y+16);g.lineTo(x-.6,y+12);g.lineTo(x+2.6,y+12);g.fill()}
     g.strokeStyle='rgba(232,226,208,.5)';g.beginPath();g.ellipse(16,27,12,3,0,0,7);g.stroke()}),
   venom:mk2(32,32,g=>{plate(g,'#16280c','#030602');glow(g,16,18,13,'rgba(140,230,80,.45)');blade(g,-.8,15,['#e8ffc0','#7ac040','#2a4a10']);for(const[x,y,r]of[[22,22,2],[19,27,1.5],[26,27,1.2]]){g.fillStyle='#9ae050';g.beginPath();g.arc(x,y,r,0,7);g.fill()}}),
   meteor:mk2(32,32,g=>{plate(g,'#3a1206','#080200');for(let k=0;k<6;k++){g.strokeStyle=`rgba(255,${120+k*20},40,${.15+k*.1})`;g.lineWidth=7-k;g.beginPath();g.moveTo(4+k*2,4+k*2);g.lineTo(18,18);g.stroke()}
     glow(g,20,20,10,'rgba(255,160,60,.8)');g.fillStyle='#5a2a14';g.beginPath();g.arc(20,20,5.5,0,7);g.fill();g.fillStyle='#ffb050';g.beginPath();g.arc(18.5,18.5,3,0,7);g.fill();g.fillStyle='#fff0c0';g.fillRect(17,17,2,2)}),
   blink:mk2(32,32,g=>{plate(g,'#2a1020','#060204');glow(g,10,22,9,'rgba(255,120,40,.6)');glow(g,23,10,9,'rgba(255,160,80,.6)');g.strokeStyle='#ffd0a0';g.lineWidth=1.4;g.setLineDash([3,2]);g.beginPath();g.moveTo(10,22);g.quadraticCurveTo(12,8,23,10);g.stroke();g.setLineDash([]);
     for(const[x,y]of[[10,22],[23,10]]){g.strokeStyle='#ff9a40';g.beginPath();g.arc(x,y,4,0,7);g.stroke()}}),
   flask:mk2(32,32,g=>{plate(g,'#2a1e08','#060402');glow(g,16,19,13,'rgba(255,190,80,.45)');g.fillStyle='#4a2c12';g.fillRect(13,4,6,3);g.fillStyle='#8a5624';g.fillRect(13,4,6,1);
     const q=g.createLinearGradient(9,8,24,28);q.addColorStop(0,'#fff0a8');q.addColorStop(.35,'#e2b23c');q.addColorStop(.8,'#8a5624');q.addColorStop(1,'#3a2406');g.fillStyle=q;g.beginPath();g.moveTo(13,7);g.lineTo(19,7);g.lineTo(19,11);g.quadraticCurveTo(25,14,25,20);g.arc(16,20,9,0,Math.PI);g.quadraticCurveTo(7,14,13,11);g.closePath();g.fill();
     const l=g.createLinearGradient(0,16,0,29);l.addColorStop(0,'#ffc070');l.addColorStop(1,'#c04008');g.fillStyle=l;g.beginPath();g.arc(16,21,7,0,Math.PI);g.lineTo(9,20);g.quadraticCurveTo(16,17,23,20);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(11,13,1.5,5)})};
  set('--tx-ringL',ring(['#ffb0a0','#d0261c','#3a0404']));set('--tx-ringM',ring(['#c8e4ff','#2a60e0','#020818']))}
const ORBR={P:['#0e1a04','#3a6a10','#7ab030','#c8f878'],L:['#200000','#7a0a06','#c42a1c','#ff8a6a'],M:['#020820','#0e2a7a','#2a64e0','#9ac4ff']};
// the orbs are read back and dithered, so they are painted at most 30 times a second, or at once when the level moves
const ORBT={};
function paintOrb(k,frac){const pz=k==='L'&&P&&P.poisonT>0,o=ORBT[k]||(ORBT[k]={f:-1,t:-9,p:0});if(Math.abs(o.f-frac)<.002&&o.p===pz&&G.t-o.t<1/30&&G.t>=o.t)return;o.f=frac;o.t=G.t;o.p=pz;
  const c=$('orb'+k),g=c.getContext('2d',{willReadFrequently:true}),r=k==='L'&&P&&P.poisonT>0?ORBR.P:ORBR[k],t=G.t;g.clearRect(0,0,52,52);g.save();g.beginPath();g.arc(26,26,26,0,7);g.clip();
  const bg=g.createRadialGradient(20,18,2,26,26,30);bg.addColorStop(0,'#1c1610');bg.addColorStop(1,'#020101');g.fillStyle=bg;g.fillRect(0,0,52,52);
  frac=clamp(frac,0,1);const lv=52-frac*52;
  if(frac>0){const wave=x=>lv+Math.sin(x*.24+t*2.6)*1.1+Math.sin(x*.5-t*1.7)*.5;g.beginPath();g.moveTo(0,52);for(let x=0;x<=52;x+=2)g.lineTo(x,wave(x));g.lineTo(52,52);g.closePath();
    const q=g.createRadialGradient(17,Math.max(14,lv+6),1,26,34,36);q.addColorStop(0,r[3]);q.addColorStop(.28,r[2]);q.addColorStop(.7,r[1]);q.addColorStop(1,r[0]);g.fillStyle=q;g.fill();
    g.strokeStyle=r[3];g.globalAlpha=.55;g.beginPath();for(let x=0;x<=52;x+=2)x?g.lineTo(x,wave(x)):g.moveTo(x,wave(x));g.stroke();g.globalAlpha=.7;g.fillStyle=r[3];
    for(let k2=0;k2<5;k2++){const h=52-lv;if(h<4)break;const x=(k2*11+7+Math.sin(t+k2)*3)%48+2,y=52-((t*9+k2*13)%h);g.fillRect(x|0,y|0,1,1)}g.globalAlpha=1}
  const hl=g.createRadialGradient(17,14,0,17,14,12);hl.addColorStop(0,'rgba(255,255,255,.38)');hl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(0,0,52,52);
  g.restore();quantize(g,52,52)}
function quantize(c2,w,h){const img=c2.getImageData(0,0,w,h),d=img.data;
  for(let y=0;y<h;y++){const by=(y&3)*4;for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]<8)continue;const t=BAYER[by+(x&3)];
    let r=d[i]+t,g=d[i+1]+t,b=d[i+2]+t;r=r<0?0:r>255?255:r;g=g<0?0:g>255?255:g;b=b<0?0:b>255?255:b;
    const k=LUT[((r>>3)<<10)|((g>>3)<<5)|(b>>3)];d[i]=PALR[k];d[i+1]=PALG[k];d[i+2]=PALB[k];d[i+3]=255}}
  c2.putImageData(img,0,0)}

