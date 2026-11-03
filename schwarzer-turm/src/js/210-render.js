/* ---------- render ---------- */
let grain=null;
function buildGrain(){grain=mk(256,256,g=>{const d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}g.putImageData(d,0,0)})}
let RF=0;
// one soft disc (full, 70% at 0.6, gone at the rim) stands in for every light cut into the darkness
let LSPR=null;function lightSpr(){if(LSPR)return LSPR;const c=LSPR=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),q=g.createRadialGradient(128,128,0,128,128,128);q.addColorStop(0,'rgba(0,0,0,1)');q.addColorStop(.6,'rgba(0,0,0,.7)');q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(0,0,256,256);return c}
const VIG={c:null,w:0,h:0};function vignette(w,h){if(VIG.c&&VIG.w===w&&VIG.h===h)return VIG.c;const c=VIG.c=document.createElement('canvas');c.width=Math.ceil(w);c.height=Math.ceil(h);VIG.w=w;VIG.h=h;const g=c.getContext('2d'),q=g.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.75);q.addColorStop(0,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=q;g.fillRect(0,0,w,h);return c}
function render(){RF++;
  const m=G.map;G.lq=[];
  camX+=(P.x-camX)*.15;camY+=(P.y-camY)*.15;
  const sh=CFG.shake?G.shake:0,kx=CFG.shake?G.kx||0:0,ky=CFG.shake?G.ky||0:0;CX=W/2-(camX-camY)*32+(sh?rnd(-sh,sh):0)+kx;CY=H/2-(camX+camY)*16-40+(sh?rnd(-sh,sh):0)+ky;
  ctx.save();
  if(m.kind==='town'){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#08306f');g.addColorStop(.55,'#1356b0');g.addColorStop(1,'#1d6bcc');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);drawClouds(m,true)}
  else{ctx.fillStyle='#050302';ctx.fillRect(0,0,W,H)}
  // visible bounds
  const c1=scr2w(0,0),c2=scr2w(W,0),c3=scr2w(0,H+200),c4=scr2w(W,H+200);
  const i0=Math.max(0,Math.floor(Math.min(c1[0],c3[0]))-2),i1=Math.min(m.w-1,Math.ceil(Math.max(c2[0],c4[0]))+2),j0=Math.max(0,Math.floor(Math.min(c1[1],c2[1]))-2),j1=Math.min(m.h-1,Math.ceil(Math.max(c3[1],c4[1]))+2);
  // floors
  for(let s=i0+j0;s<=i1+j1;s++)for(let i=Math.max(i0,s-j1);i<=Math.min(i1,s-j0);i++){const j=s-i,t=m.t[j*m.w+i];if(!t)continue;const[sx,sy]=iso(i,j);if(sx<-70||sx>W+70||sy<-40||sy>H+120)continue;
    if(t===7||t===8||t===9){const u=t===9?m.under[j*m.w+i]:t;if(u===4)ctx.drawImage(SPR.grass[(i*7+j*13)%6],sx-32,sy);else if(u===8){const bw=m.bw&&m.bw.get(j*m.w+i);ctx.drawImage(bw?SPR.bridgeW[bw-1][(i*7+j*13)%3]:SPR.bridge[(i*7+j*13)%3],sx-32,sy)}else{if(m.world)ctx.drawImage(SPR.grass[(i*7+j*13)%6],sx-32,sy);ctx.drawImage(SPR.flag[(i*7+j*13)%4],sx-32,sy)}
      const v0=m.t[(j+1)*m.w+i]===0,v1=m.t[j*m.w+i+1]===0;if(u===8){const bw=m.bw&&m.bw.get(j*m.w+i);if(bw){if(v0)ctx.drawImage(SPR.bridgeSideW[0],sx-32,sy);if(v1)ctx.drawImage(SPR.bridgeSideW[1],sx-32,sy)}else{if(v0)ctx.drawImage(SPR.bridgeSide[i%4===1?1:0],sx-32,sy);if(v1)ctx.drawImage(CLV(1,i,j),sx-32,sy)}}else{if(v0)ctx.drawImage(CLV(0,i,j),sx-32,sy);if(v1)ctx.drawImage(CLV(1,i,j),sx-32,sy)}}
    else if(t===4||t===3||t===5){ctx.drawImage(SPR.grass[(i*7+j*13)%6],sx-32,sy);if(m.t[(j+1)*m.w+i]===0)ctx.drawImage(CLV(0,i,j),sx-32,sy);if(m.t[j*m.w+i+1]===0)ctx.drawImage(CLV(1,i,j),sx-32,sy)}
    else if(t===1||t===2||t===6){ctx.drawImage(SPR.floor[(i*7+j*13)%6],sx-32,sy);themeTint(m,i,j,sx,sy);const sh=(Math.sin(i*.27+j*.11)+Math.sin(i*.09-j*.23+1.7)+2)*.1;if(sh>.04){ctx.fillStyle=`rgba(0,0,6,${sh.toFixed(2)})`;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+32,sy+16);ctx.lineTo(sx,sy+32);ctx.lineTo(sx-32,sy+16);ctx.closePath();ctx.fill()}}}
  if(m.deco)for(const d of m.deco){const[sx,sy]=iso(d.x,d.y);if(sx<-40||sx>W+40||sy<-30||sy>H+30)continue;const c=SPR.deco[d.k][d.v];ctx.drawImage(c,sx-c.width/2,sy-c.height/2)}
  drawDecals();
  // telegraphs
  for(const t of G.tele)if(t.t>=0)drawTele(t);drawExtGround();
  if(G.clickFx){const[sx,sy]=iso(G.clickFx.x,G.clickFx.y);ctx.strokeStyle=`rgba(236,228,207,${G.clickFx.t*2})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(sx,sy,14*(1.4-G.clickFx.t),7*(1.4-G.clickFx.t),0,0,7);ctx.stroke()}
  for(const r of G.rings){ctx.strokeStyle=r.col;ctx.globalAlpha=Math.max(0,1-r.r/r.max);ctx.lineWidth=3;const[sx,sy]=iso(r.x,r.y);ctx.beginPath();ctx.ellipse(sx,sy,r.r*45.25,r.r*22.6,0,0,7);ctx.stroke();ctx.globalAlpha=1}
  // ground items
  for(const gi of m.items){const[sx,sy]=iso(gi.x,gi.y);if(sx<-40||sx>W+40||sy<-40||sy>H+40)continue;drawGroundItem(gi,sx,sy)}
  // sorted drawables
  const dl=[];
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const t=m.t[j*m.w+i];if(t===2||t===3)dl.push({d:i+j+1,k:t,i,j})}
  if(m.tower)dl.push({d:m.tower.x+m.tower.y+1.2,k:'tower'});
  for(const o of m.objs)dl.push({d:o.x+o.y-(o.type==='stairs'?1:0),k:'obj',o});
  if(m.props)for(const p of m.props)dl.push({d:p.x+p.y+(p.face?.02:0),k:'prop',p});
  if(m.crit)for(const c of m.crit)dl.push({d:c.x+c.y,k:'crit',c});
  if(m.blocks)for(const b of m.blocks)if(b.i>=i0-2&&b.i<=i1+2&&b.j>=j0-2&&b.j<=j1+2)dl.push({d:b.i+b.j+(b.big?2:1),k:'blk',b});
  if(G.glutmal&&G.glutmal.floor===G.floor)dl.push({d:G.glutmal.x+G.glutmal.y,k:'glutmal'});
  for(const e of m.enemies)if(!e.dead||e.dieT<24)dl.push({d:e.x+e.y-(e.dead?.6:0),k:'en',e});
  dl.push({d:P.x+P.y,k:'pl'});for(const r of mpVis())dl.push({d:r.x+r.y,k:'mp',r});for(const a of G.allies||[])dl.push({d:a.x+a.y-(a.dead?.6:0),k:'al',a});for(const p of G.aproj||[])dl.push({d:p.x+p.y,k:'pr',p});
  for(const p of G.proj)dl.push({d:p.x+p.y,k:'pr',p});
  dl.sort((a,b)=>a.d-b.d);
  const pd=P.x+P.y,[psx,psy]=iso(P.x,P.y);
  for(const x of dl){
    if(x.k===2){const[sx,sy]=iso(x.i,x.j);if(sx<-70||sx>W+70||sy<-80||sy>H+40)continue;const near=x.d>pd+.5&&Math.abs(sx-psx)<70&&sy-psy<90&&sy-psy>-10;if(near)ctx.globalAlpha=.32;ctx.drawImage(SPR.wall[(x.i*3+x.j*5)%4],sx-32,sy-WH);const wv=m.wov&&m.wov[x.j*m.w+x.i];if(wv)ctx.drawImage(SPR.wallMoss[wv-1],sx-32,sy-WH);ctx.globalAlpha=1}
    else if(x.k===3){const[sx,sy]=iso(x.i+.5,x.j+.5);ctx.drawImage(SPR.rock[(x.i*3+x.j*7)%5],sx-36,sy-52)}
    else if(x.k==='tower'){const[sx,sy]=iso(m.tower.x,m.tower.y);const behind=pd<x.d&&Math.abs(psx-sx)<75&&psy<sy+20&&psy>sy-520;if(behind)ctx.globalAlpha=.45;ctx.drawImage(SPR.tower,sx-150,sy+30-580);drawTowerFx(sx,sy+30);ctx.globalAlpha=1}
    else if(x.k==='obj')drawObj(x.o);
    else if(x.k==='prop')drawProp(x.p);
    else if(x.k==='crit')drawCritter(x.c);
    else if(x.k==='blk'){const b=x.b,L=SPR.prop[b.k],c=L[b.v%L.length],[sx,sy]=iso(b.i+(b.big?1:.5),b.j+(b.big?1:.5));if(sx>-120&&sx<W+120&&sy>-170&&sy<H+80){const near=(b.k==='menhir'||b.k==='tree'||b.big)&&x.d>pd+.5&&Math.abs(sx-psx)<40&&sy-psy<60&&sy-psy>-10;if(near)ctx.globalAlpha=.4;ctx.drawImage(c,sx-c.ax,sy-c.ay);ctx.globalAlpha=1}}
    else if(x.k==='glutmal')drawGlutmal();
    else if(x.k==='en')drawEnemy(x.e);
    else if(x.k==='pl')drawPlayer();else if(x.k==='mp')mpDraw(x.r);
    else if(x.k==='al')drawAlly(x.a);
    else if(x.k==='pr')drawProj(x.p)}
  drawFxWorld();
  // darkness
  if(m.kind==='dungeon'||(m.world&&(nightA()>.01||rgDark()>.01))){dctx.setTransform(1,0,0,1,0,0);dctx.globalCompositeOperation='source-over';dctx.clearRect(0,0,W,H);dctx.fillStyle=m.kind==='dungeon'?dungDark(m):darkFill();dctx.fillRect(0,0,W,H);dctx.globalCompositeOperation='destination-out';
    dctx.imageSmoothingEnabled=true;const light=(x,y,r,a=1)=>{if(!(r>0&&a>0))return;const[sx,sy]=iso(x,y),cy=sy-10;if(sx+r<0||sx-r>W||cy+r*.6<0||cy-r*.6>H)return;dctx.globalAlpha=Math.min(1,a);dctx.drawImage(lightSpr(),sx-r,cy-r*.6,r*2,r*1.2);dctx.globalAlpha=1};
    {const rd=rgDark();light(P.x,P.y,(330+(Math.sin(G.t*7)*5))*(1-rd*.38)*(m.kind==='dungeon'?plLight(m):1),1-rd*.42)}
    for(const o of m.objs)if(o.type==='shrine')light(o.x,o.y,G.lit[G.floor]?280:120,.9);else if(o.type==='stairs')light(o.x,o.y,140,.6);
    for(const p of G.proj)if(p.kind!=='arrow')light(p.x,p.y,90,.8);
    for(const t of G.tele)if(t.t>0&&t.elem==='fire')light(t.x,t.y,80,.5);
    if(G.glutmal&&G.glutmal.floor===G.floor)light(G.glutmal.x,G.glutmal.y,110,.7);
    for(const L of G.lights)light(L.x,L.y,L.r*(1+L.t/L.life*.3),L.a*(1-L.t/L.life));
    const vis=[];if(m.props)for(const p of m.props){const L=propLight(p);if(!L)continue;const[sx,sy]=iso(p.x,p.y);if(sx>-260&&sx<W+260&&sy>-260&&sy<H+260){vis.push([p,sx,sy,L]);light(p.x,p.y,L.r+Math.sin(G.t*9+p.ph)*L.f,L.a)}}
    for(const r of m.runes||[])light(r.x,r.y,140,.35+Math.sin(G.t*2)*.08);
    dctx.globalCompositeOperation='source-over';ctx.drawImage(dark,0,0,W,H);
    ctx.globalCompositeOperation='lighter';for(const[p,sx,sy,L]of vis){
      if(p.k==='shaft'){const tx=sx-70,ty=sy-330,fl=.85+Math.sin(G.t*.7+p.ph)*.15;for(const[wb,wt,a]of[[46,26,.07],[26,12,.1]]){const q=ctx.createLinearGradient(tx,ty,sx,sy);q.addColorStop(0,`rgba(210,226,255,${a*1.4*fl})`);q.addColorStop(.75,`rgba(200,218,255,${a*fl})`);q.addColorStop(1,'rgba(200,218,255,0)');ctx.fillStyle=q;ctx.beginPath();ctx.moveTo(tx-wt,ty);ctx.lineTo(tx+wt,ty);ctx.lineTo(sx+wb,sy);ctx.lineTo(sx-wb,sy);ctx.closePath();ctx.fill()}
        const g=ctx.createRadialGradient(sx,sy,0,sx,sy,60);g.addColorStop(0,`rgba(210,226,255,${.16*fl})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.save();ctx.translate(sx,sy);ctx.scale(1,.5);ctx.translate(-sx,-sy);ctx.fillRect(sx-60,sy-60,120,120);ctx.restore();continue}
      if(!L.col)continue;const r=L.r*.78,y0=sy-(L.h||14),g=ctx.createRadialGradient(sx,y0,0,sx,y0,r);g.addColorStop(0,`rgba(${L.col},.17)`);g.addColorStop(1,`rgba(${L.col},0)`);ctx.fillStyle=g;ctx.fillRect(sx-r,y0-r,r*2,r*2)}
    for(const r of m.runes||[]){const[sx,sy]=iso(r.x,r.y),a=.18+Math.sin(G.t*2)*.06;ctx.save();ctx.translate(sx,sy);ctx.scale(1,.5);const g=ctx.createRadialGradient(0,0,30,0,0,110);g.addColorStop(0,`rgba(255,30,10,${a})`);g.addColorStop(.5,`rgba(200,10,0,${a*.6})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-110,-110,220,220);ctx.restore();
      const c=SPR.deco.runes[0];ctx.globalAlpha=.55+Math.sin(G.t*2)*.25;ctx.drawImage(c,sx-c.width/2,sy-c.height/2);ctx.globalAlpha=1}
    ctx.globalCompositeOperation='source-over'}
  drawWeather();drawFxGlow();present();ctx.restore();
  ctx=uctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,ui.width,ui.height);ctx.setTransform(DPR*ZM,0,0,DPR*ZM,0,0);ctx.save();
  for(const q of G.lq)drawLabel(...q);
  // floating texts
  ctx.textAlign='center';
  for(const t of G.texts){const[sx,sy]=iso(t.x,t.y),pop=t.t<.12?1+(1-t.t/.12)*.8:1;ctx.globalAlpha=1-t.t*t.t;ctx.font=Math.round((t.big?22:16)*pop)+'px '+"'IM Fell English SC', Georgia, serif";ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.strokeText(t.txt,sx,sy-t.z*34);ctx.fillStyle=t.col;ctx.fillText(t.txt,sx,sy-t.z*34)}ctx.globalAlpha=1;
  drawLabels();
  // hover enemy outline name above
  const he=G.state==='play'?hoverEnemy():null;G.hoverE=he;
  // grain + vignette (screen space)
  ctx.setTransform(DPR,0,0,DPR,0,0);const vW=W,vH=H;W=innerWidth;H=innerHeight;

  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.drawImage(vignette(W,H),0,0,W,H);
  if(P.hp<P.d.life*.3&&!P.dead){ctx.fillStyle=`rgba(160,10,10,${.12+Math.sin(G.t*5)*.06})`;ctx.fillRect(0,0,W,H)}
  if(G.showMap&&G.state==='play')drawMinimap();
  W=vW;H=vH;ctx.restore();ctx=wctx}
function drawClouds(m,move){
  for(const c of m.clouds){if(move)c.x+=c.v*.016;if(c.x>1400)c.x=-1400;const md=(v,n)=>((v%n)+n)%n,px=md(W/2+c.x-(camX-camY)*6+1400,2800)-1400,py=md(H*.4+c.y-(camX+camY)*3+700,1400)-700;
    const R2=mulberry(c.seed);for(let k=0;k<9;k++){const ox=(R2()-.5)*150*c.s,oy=(R2()-.5)*50*c.s-Math.abs(ox)*.2,r=(26+R2()*30)*c.s;
      const g=ctx.createRadialGradient(px+ox-r*.3,py+oy-r*.4,r*.1,px+ox,py+oy,r);g.addColorStop(0,'#ffffff');g.addColorStop(.6,'#eef1f6');g.addColorStop(1,'rgba(180,196,224,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px+ox,py+oy,r,0,7);ctx.fill()}}}
function wpoly(pts){ctx.beginPath();pts.forEach(([x,y],k)=>{const[sx,sy]=iso(x,y);k?ctx.lineTo(sx,sy):ctx.moveTo(sx,sy)});ctx.closePath()}
function shapePts(t,scale=1){const pts=[];
  if(t.shape==='circle'){for(let k=0;k<36;k++){const a=k/36*Math.PI*2;pts.push([t.x+Math.cos(a)*t.r*scale,t.y+Math.sin(a)*t.r*scale])}}
  else if(t.shape==='cone'){pts.push([t.x,t.y]);for(let k=0;k<=16;k++){const a=t.ang-t.arc/2+t.arc*k/16;pts.push([t.x+Math.cos(a)*t.r*scale,t.y+Math.sin(a)*t.r*scale])}}
  else{const c=Math.cos(t.ang),s=Math.sin(t.ang),w=t.w/2,L=t.len*scale;pts.push([t.x-s*w,t.y+c*w],[t.x+c*L-s*w,t.y+s*L+c*w],[t.x+c*L+s*w,t.y+s*L-c*w],[t.x+s*w,t.y-c*w])}return pts}
function drawTele(t){const p=clamp(t.t/t.dur,0,1),col=t.elem==='fire'?'255,110,30':t.elem==='frost'?'140,200,255':'220,30,20';
  wpoly(shapePts(t));ctx.fillStyle=`rgba(${col},.13)`;ctx.fill();ctx.strokeStyle=`rgba(${col},.6)`;ctx.lineWidth=1.5;ctx.stroke();
  wpoly(shapePts(t,t.shape==='line'?p:Math.max(.05,p)));ctx.fillStyle=`rgba(${col},${.18+p*.25})`;ctx.fill();
  if(t.meteor&&p>.25){const[sx,sy]=iso(t.x,t.y),q=(p-.25)/.75,h=(1-q)*(1-q)*320,mx=sx-h*.35,my=sy-h-14;for(let k=6;k>=0;k--){const r=10-k*1.1,g=ctx.createRadialGradient(mx+k*6,my-k*16,0,mx+k*6,my-k*16,r*2);g.addColorStop(0,`rgba(255,220,140,${.9-k*.12})`);g.addColorStop(.5,`rgba(255,110,30,${.6-k*.08})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(mx+k*6-r*2,my-k*16-r*2,r*4,r*4)}blob(mx,my,5,5,RP.stone)}}
function shadow(sx,sy,r){ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(sx,sy,r*40,r*20,0,0,7);ctx.fill()}
function scrDir(a){const x=(Math.cos(a)-Math.sin(a)),y=(Math.cos(a)+Math.sin(a))*.5,l=hyp(x,y)||1;return[x/l,y/l]}
