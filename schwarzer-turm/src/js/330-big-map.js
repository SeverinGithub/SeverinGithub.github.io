/* ---------- the big map: everything explored, with fires, traders, bosses and the quest goal ---------- */
let MV=null,MP=null;
function toggleMap(){if(G.state==='map'){ovClose();return}ovClose();closeAll();G.state='map';G.stepS=stopLoop(G.stepS);$('pMap').hidden=false;
  MV={x:P.x,y:P.y,z:G.map.world?4:7};prepMap();$('pMap').querySelector('.thead h2').textContent=G.map.world?'Karte · Himmelsinseln':'Karte · '+floorTitle(G.floor);drawBigMap()}
const MCOL={1:[92,84,72],2:[170,158,132],3:[74,70,64],4:[58,92,36],5:[40,36,44],6:[30,26,24],7:[110,104,94],8:[122,92,56],9:[34,30,26]};
function prepMap(){const m=G.map;let cs;
  if(m.world){cs=[...G.owSeen].map(k=>k.split(',').map(Number));for(let cy=39;cy<=40;cy++)for(let cx=39;cx<=41;cx++)cs.push([cx,cy]);
    for(const[a,b]of cs){owIsland(m,a,b);owBridge(m,a,b,a+1,b);owBridge(m,a-1,b,a,b);owBridge(m,a,b,a,b+1);owBridge(m,a,b-1,a,b)}
    for(const[a,b]of cs){const k=a+','+b;if(!m.cdata.has(k))m.cdata.set(k,owContent(m,a,b))}
    const c0=Math.min(...cs.map(c=>c[0])),c1=Math.max(...cs.map(c=>c[0])),r0=Math.min(...cs.map(c=>c[1])),r1=Math.max(...cs.map(c=>c[1]));
    const i0=c0*CH,j0=r0*CH,w=(c1-c0+1)*CH,h=(r1-r0+1)*CH,cv2=document.createElement('canvas');cv2.width=w;cv2.height=h;const g=cv2.getContext('2d'),id=g.createImageData(w,h),D=id.data;
    for(const[a,b]of cs)for(let j=b*CH;j<b*CH+CH;j++)for(let i=a*CH;i<a*CH+CH;i++){const t=m.t[j*m.w+i];if(!t)continue;const c=MCOL[t===9&&m.under[j*m.w+i]===8?8:t]||MCOL[1],o=((j-j0)*w+(i-i0))*4;D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255}
    g.putImageData(id,0,0);MP={img:cv2,i0,j0}}
  else{const w=m.w,h=m.h,cv2=document.createElement('canvas');cv2.width=w;cv2.height=h;const g=cv2.getContext('2d'),id=g.createImageData(w,h),D=id.data;
    for(let k=0;k<w*h;k++){if(!m.explored[k]||!m.t[k])continue;const c=MCOL[m.t[k]]||MCOL[1],o=k*4;D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255}g.putImageData(id,0,0);MP={img:cv2,i0:0,j0:0}}}
function drawBigMap(){const cv2=$('mapc'),W2=cv2.clientWidth,H2=cv2.clientHeight;if(cv2.width!==W2||cv2.height!==H2){cv2.width=W2;cv2.height=H2}const g=cv2.getContext('2d'),m=G.map,z=MV.z;
  g.setTransform(1,0,0,1,0,0);g.fillStyle='#07080c';g.fillRect(0,0,W2,H2);g.imageSmoothingEnabled=false;
  const ox=W2/2-(MV.x-MV.y)*z,oy=H2/2-(MV.x+MV.y)*z/2,S=(x,y)=>[ox+(x-y)*z,oy+(x+y)*z/2];
  g.setTransform(z,z/2,-z,z/2,ox+(MP.i0-MP.j0)*z,oy+(MP.i0+MP.j0)*z/2);g.drawImage(MP.img,0,0);g.setTransform(1,0,0,1,0,0);
  g.font='14px "IM Fell English SC", Georgia, serif';g.textAlign='center';
  const lab=(x,y,t,c,dy=-12)=>{g.lineWidth=3;g.strokeStyle='#000';g.strokeText(t,x,y+dy);g.fillStyle=c;g.fillText(t,x,y+dy)};
  const dot=(x,y,r,c,ring)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.lineWidth=2;g.strokeStyle=ring||'#000';g.stroke()};
  const dia=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r,y);g.lineTo(x,y+r);g.lineTo(x-r,y);g.closePath();g.fill();g.lineWidth=2;g.strokeStyle='#000';g.stroke()};
  const names=z>=3;
  if(m.world){const tw=S(m.tower.x,m.tower.y);g.fillStyle='#14121a';g.fillRect(tw[0]-5,tw[1]-26,10,26);g.strokeStyle='#8a7aa0';g.lineWidth=1.5;g.strokeRect(tw[0]-5,tw[1]-26,10,26);lab(tw[0],tw[1],'Der Schwarze Turm','#c8b8e8',-32);
    for(const k of G.owSeen){const c=m.cdata.get(k);if(!c)continue;for(const o of c.objs){const[x,y]=S(o.x,o.y);if(o.type==='shrine'&&!G.owFires[o.key])dot(x,y,4,'#5a5248');if(o.type==='merchant'){dia(x,y,6,'#e3b04b');if(names)lab(x,y,o.name,'#e8d090',-10)}}}
    for(const o of m.home.objs){const[x,y]=S(o.x,o.y);if(o.type==='merchant'){dia(x,y,6,'#e3b04b');if(names)lab(x,y,'Odalinde','#e8d090',-10)}if(o.type==='shrine')dot(x,y,5,'#ffb347','#ffe0a0')}
    for(const k in G.owFires){const f=G.owFires[k],[x,y]=S(f.x,f.y);dot(x,y,5,'#ff9a30','#ffe0a0');if(names)lab(x,y,f.name.replace(/^Leuchtfeuer (am|an der) /,''),'#ffc070')}
    const tq=curQ();WB.forEach((b,i)=>{const p=wbPos(b),seen=G.owSeen.has(b.cx+','+b.cy),dead=G.owBoss[b.id],isQ=tq&&tq.ty==='wboss'&&tq.wb===i;if(!seen&&!isQ&&!dead)return;const[x,y]=S(p.x,p.y);
      g.font='20px serif';g.lineWidth=3;g.strokeStyle='#000';g.strokeText('☠',x,y+7);g.fillStyle=dead?'#6a6258':'#ff4a3a';g.fillText('☠',x,y+7);g.font='14px "IM Fell English SC", Georgia, serif';lab(x,y,b.n+(dead?' · besiegt':''),dead?'#8a8276':'#ff8a6a',-16)})}
  else{for(const o of m.objs){const i=Math.floor(o.x),j=Math.floor(o.y);if(!m.explored[j*m.w+i])continue;const[x,y]=S(o.x,o.y);if(o.type==='stairs'){dot(x,y,6,'#7aa4ff');lab(x,y,'Treppe hinab','#9ac4ff')}else if(o.type==='shrine')dot(x,y,5,'#ffb347','#ffe0a0');else if(o.type==='chest'&&!o.open)dia(x,y,4,'#c8a050')}
    for(const e of m.enemies)if(e.boss&&!e.dead&&m.explored[Math.floor(e.y)*m.w+Math.floor(e.x)]){const[x,y]=S(e.x,e.y);lab(x,y,'☠ '+e.name,'#ff6a5a',4)}}
  const t=G.qtgt;if(t&&m.world){const[x,y]=S(t.x,t.y),p=.6+Math.sin(performance.now()/300)*.4;g.lineWidth=3;g.strokeStyle=`rgba(255,216,138,${p})`;g.beginPath();g.arc(x,y,14,0,7);g.stroke();lab(x,y,'Quest: '+t.l,'#ffd88a',30)}
  const[px,py]=S(P.x,P.y);dot(px,py,6,'#ffffff','#000');lab(px,py,'Du','#ffffff',-10);
  if(G.state==='map'&&!mapRaf)mapRaf=requestAnimationFrame(()=>{mapRaf=0;if(G.state==='map')drawBigMap()})}
let mapRaf=0;
(function(){let drag=null;
  addEventListener('pointerdown',e=>{if(G.state!=='map'||e.target.id!=='mapc')return;drag={x:e.clientX,y:e.clientY,mx:MV.x,my:MV.y}});
  addEventListener('pointermove',e=>{if(!drag)return;const z=MV.z,dx=(e.clientX-drag.x)/z,dy=(e.clientY-drag.y)*2/z;MV.x=drag.mx-(dx+dy)/2;MV.y=drag.my-(dy-dx)/2});
  addEventListener('pointerup',()=>{drag=null});
  addEventListener('wheel',e=>{if(G.state!=='map')return;e.preventDefault();MV.z=clamp(MV.z*(e.deltaY>0?1/1.15:1.15),1,18)},{passive:false});
  document.addEventListener('click',e=>{if(e.target.closest('[data-ovclose]'))ovClose();else if(e.target.closest('[data-mapme]')&&MV){MV.x=P.x;MV.y=P.y}})})();

