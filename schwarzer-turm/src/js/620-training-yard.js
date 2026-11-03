/* ---------- the training yard: a straw dummy that never falls · hay, a weapon rack, a fence, lanterns, flower beds, hens and butterflies across the hill ---------- */
// the dummy is a local foe with endless life: every point it loses (blows, spells, poison) is counted, shown above it and summed into damage per second
const YD={x:HOX+26.5,y:HOY+14.5,log:[],tot:0,t0:0,last:-99,dps:0,straw:0,spr:null,ground:[]},DUMMY_HP=1e9;
const STRAW={k:'bone',cols:['#f0d878','#d8b450','#b08a30']};
const ydR=s=>()=>(s=(s*16807)%2147483647)/2147483647;
const ydNum=n=>Math.round(n).toLocaleString('de-DE');
// pixel art, painted once: a 1px dark rim is traced round whatever was drawn
function ydSprite(w,h,f){const c=mk(w,h,f),g=c.getContext('2d'),d=g.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(a[i+3])continue;if((x>0&&a[i-1])||(x<w-1&&a[i+7])||(y>0&&a[i-w*4+3])||(y<h-1&&a[i+w*4+3])){o[i]=26;o[i+1]=20;o[i+2]=12;o[i+3]=255}}
  d.data.set(o);g.putImageData(d,0,0);return c}
function ydWhite(c){return mk(c.width,c.height,g=>{g.drawImage(c,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,250,235,.85)';g.fillRect(0,0,c.width,c.height)})}
function dummySprite(){const R=ydR(77);const c=ydSprite(42,62,g=>{const r=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)},disk=(cx,cy,rad,col)=>{for(let y=Math.floor(cy-rad);y<=cy+rad;y++)for(let x=Math.floor(cx-rad);x<=cx+rad;x++)if(Math.hypot(x+.5-cx,y+.5-cy)<=rad)r(col,x,y)},
    hay=['#f4dc80','#e0bc58','#c49a3a','#a27c26'];
  // stand and post
  r('#3e2814',11,58,20,2);r('#56381c',12,58,18,1);r('#3e2814',19,30,4,28);r('#6e4a26',19,30,1,28);r('#56381c',20,30,2,28);
  // crossbar with straw at both ends and rope at the shoulders
  r('#3e2814',4,23,34,4);r('#56381c',4,23,34,3);r('#7a5430',4,23,34,1);
  for(let k=0;k<9;k++){r(hay[k%4],1+R()*4|0,21+R()*7|0,1,1+R()*2|0);r(hay[(k+1)%4],37+R()*4|0,21+R()*7|0,1,1+R()*2|0)}r(hay[1],1,22,3,4);r(hay[1],38,22,3,4);r(hay[0],2,23,1,2);r(hay[0],39,23,1,2);
  // the sack
  const body=[[18,14,27],[19,12,29]];for(let y=20;y<=43;y++)body.push([y,11,30]);body.push([44,12,29],[45,14,27]);
  for(const[y,a,b]of body){r('#8c8678',a,y,b-a+1);r('#a8a294',a,y,2);r('#6a655a',b-1,y,2)}r('#6a655a',12,44,18,2);
  for(let y=21;y<44;y+=3)r('#5a554c',27,y);for(let k=0;k<40;k++)r(R()<.5?'#7e786c':'#9a9488',12+R()*17|0,19+R()*25|0);
  // straw bursting from the shoulders and hanging out below
  for(let k=0;k<7;k++){r(hay[R()*4|0],9+R()*4|0,17+R()*4|0);r(hay[R()*4|0],29+R()*4|0,17+R()*4|0)}r(hay[1],9,18,3,2);r(hay[1],30,18,3,2);
  for(let x=13;x<=28;x+=1+(R()*2|0)){const l=2+R()*5|0;r(hay[R()*4|0],x,46,1,l)}
  // target
  disk(21,31.5,7.2,'#b8302a');disk(21,31.5,5.4,'#efe6d2');disk(21,31.5,3.5,'#b8302a');disk(21,31.5,1.6,'#efe6d2');r('#8a2018',15,36,2,1);r('#8a2018',25,37,2,1);
  // rope belt
  r('#c8a868',11,41,20,2);r('#8a7040',11,42,20,1);r('#c8a868',18,43,2,3);r('#c8a868',22,43,1,2);
  // neck and head
  r('#c8a868',17,16,8,2);r('#8a7040',17,17,8,1);
  disk(21,9.5,7.6,'#8c8678');disk(19.6,8,4,'#9e9888');for(let y=4;y<=16;y++)for(let x=21;x<=29;x++)if(Math.hypot(x+.5-21,y+.5-9.5)<=7.6&&Math.hypot(x+.5-23,y+.5-11.5)>5.6)r('#6e695e',x,y);
  // X eyes, stitched mouth
  for(const ex of[17,24]){r('#2a2420',ex,7);r('#2a2420',ex+2,7);r('#2a2420',ex+1,8);r('#2a2420',ex,9);r('#2a2420',ex+2,9)}
  r('#3a342c',17,13,9,1);for(let x=17;x<=25;x+=2)r('#3a342c',x,12,1,3);
  // straw tuft on the crown and a patch
  for(let k=0;k<10;k++){const x=16+R()*10|0,l=2+R()*3|0;r(hay[R()*4|0],x,2-(l>>1),1,l)}r('#7a6e58',23,3,4,3);r('#5a554c',23,3,1,1);r('#5a554c',26,5,1,1)});
  return{c,w:ydWhite(c)}}
function mkDummy(){const e=makeEnemy('skel',YD.x,YD.y,'normal');Object.assign(e,{dummy:true,hp:DUMMY_HP,max:DUMMY_HP,name:'Übungspuppe',sub:'Unendlich Leben · schlag zu',r:.4,scale:1,dmg:[0,0],spd:0,xp:0,aff:[],dmgTaken:1,face:2.36,cd:1e9,wob:0});return e}
function dummyTake(d){if(!(d>0))return;if(G.t-YD.last>4){YD.log.length=0;YD.tot=0;YD.t0=G.t}YD.last=G.t;YD.tot+=d;YD.log.push([G.t,d])}
function drawDummy(e){const[sx,sy]=iso(e.x,e.y);if(sx<-80||sx>W+80||sy<-140||sy>H+60)return;if(!YD.spr)YD.spr=dummySprite();
  shadow(sx,sy,.36);const w=e.wob||0,[dx]=scrDir(e.wobA||0),rot=Math.sin(G.t*15)*w*.16*(dx>=0?1:-1),h=(e.hitT||0)/.22;
  ctx.save();ctx.translate(Math.round(sx),Math.round(sy));ctx.rotate(rot);ctx.scale(1+h*.06,1-h*.05);ctx.drawImage(e.flash>0?YD.spr.w:YD.spr.c,-21,-60);ctx.restore();
  const act=G.t-YD.last<4;if(act)label(sx,sy-78,ydNum(YD.dps)+' Schaden/s · '+ydNum(YD.tot)+' gesamt','#ffd94f');
  else if(hyp(P.x-e.x,P.y-e.y)<6)label(sx,sy-78,'Übungspuppe · unendlich Leben','#e8d8a8')}
// straw strewn on the ground, painted once per patch
function strawPatch(R0,seed){const R=ydR(seed),rx=R0*45.25,ry=R0*22.6,w=Math.ceil(rx*2+20),h=Math.ceil(ry*2+20),cx=w/2,cy=h/2;
  return mk(w,h,g=>{const ins=(x,y,f=1)=>((x-cx)/(rx*f))**2+((y-cy)/(ry*f))**2<1;
    for(let k=0;k<Math.round(R0*14);k++){const a=R()*6.283,q=Math.sqrt(R())*.75,x=cx+Math.cos(a)*rx*q,y=cy+Math.sin(a)*ry*q;g.fillStyle=`rgba(${pick(['168,136,58','190,156,70','140,110,44'])},${(.22+R()*.18).toFixed(2)})`;g.beginPath();g.ellipse(x,y,rx*(.25+R()*.3),ry*(.25+R()*.3),0,0,7);g.fill()}
    const cols=['#f0d878','#e0c060','#c8a448','#a8822e','#f8e8a8','#8a6a24'];
    for(let k=0;k<Math.round(R0*R0*170);k++){const a=R()*6.283,q=Math.pow(R(),.6),x=cx+Math.cos(a)*rx*q,y=cy+Math.sin(a)*ry*q;if(!ins(x,y))continue;const an=(R()-.5)*1.4+(R()<.5?0:3.14),l=2+R()*5;
      g.strokeStyle=cols[R()*cols.length|0];g.globalAlpha=q>.85?.55:.95;g.lineWidth=1;g.beginPath();g.moveTo(Math.round(x)+.5,Math.round(y)+.5);g.lineTo(Math.round(x+Math.cos(an)*l)+.5,Math.round(y+Math.sin(an)*l*.5)+.5);g.stroke()}
    g.globalAlpha=1;for(let k=0;k<Math.round(R0*30);k++){const a=R()*6.283,q=Math.sqrt(R())*.9;g.fillStyle=R()<.5?'#5a4418':'#fff0b8';g.fillRect(Math.round(cx+Math.cos(a)*rx*q),Math.round(cy+Math.sin(a)*ry*q),1,1)}})}
function drawStraw(){for(const s of YD.ground){const[sx,sy]=iso(s.x,s.y),c=s.c;if(sx<-c.width||sx>W+c.width||sy<-c.height||sy>H+c.height)continue;ctx.drawImage(c,Math.round(sx-c.width/2),Math.round(sy-c.height/2))}}
// props: hay bales, the weapon rack, fence rails, lantern posts, flower beds
const YDS={};
function ydBale(g,ox,oy,R){const pt=(a)=>{g.beginPath();g.moveTo(ox+a[0][0],oy+a[0][1]);for(const p of a.slice(1))g.lineTo(ox+p[0],oy+p[1]);g.closePath()};
  const faces=[[[[2,6],[16,0],[30,6],[16,12]],'#e2c466',['#f4dc80','#c8a448']],[[[2,6],[16,12],[16,23],[2,17]],'#b8963e',['#d0ae50','#8a6a24']],[[[16,12],[30,6],[30,17],[16,23]],'#94742a',['#b08a30','#6a5018']]];
  for(const[poly,col,sp]of faces){pt(poly);g.fillStyle=col;g.fill();g.save();pt(poly);g.clip();for(let k=0;k<70;k++){g.fillStyle=sp[k&1];g.fillRect(ox+R()*32|0,oy+R()*24|0,1+(R()*2|0),1)}g.restore()}
  g.strokeStyle='#5a4418';g.lineWidth=1;for(const t of[.33,.66]){g.beginPath();g.moveTo(ox+2+14*t,oy+6+6*t);g.lineTo(ox+2+14*t,oy+17+6*t);g.moveTo(ox+16+14*t,oy+12-6*t);g.lineTo(ox+16+14*t,oy+23-6*t);g.stroke()}
  g.fillStyle='#f4dc80';for(let k=0;k<6;k++)g.fillRect(ox+4+R()*24|0,oy+R()*3|0,1,2)}
function ydSprites(){const R=ydR(311);
  YDS.hay=[ydSprite(34,28,g=>ydBale(g,1,3,R)),ydSprite(62,42,g=>{ydBale(g,1,15,R);ydBale(g,29,17,R);ydBale(g,15,3,R)})];YDS.hay[0].ax=17;YDS.hay[0].ay=24;YDS.hay[1].ax=31;YDS.hay[1].ay=36;
  YDS.rack=ydSprite(50,52,g=>{const r=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    r('#3e2814',5,14,4,36);r('#6e4a26',5,14,1,36);r('#3e2814',41,14,4,36);r('#6e4a26',41,14,1,36);r('#56381c',3,18,44,3);r('#7a5430',3,18,44,1);r('#56381c',3,38,44,3);r('#7a5430',3,38,44,1);
    // sword, spear, axe, sword, shield
    r('#c8ccd4',13,6,2,32);r('#ffffff',13,6,1,30);r('#6a4a2a',12,38,4,1);r('#d8b040',10,37,8,2);r('#4a3018',13,39,2,6);
    r('#6e4a26',22,2,2,46);r('#c8ccd4',21,0,4,6);r('#ffffff',22,0,1,5);r('#b8302a',21,7,4,2);
    r('#6e4a26',31,10,2,38);r('#a8acb4',27,10,6,9);r('#d8dce0',27,10,6,2);r('#5a5e66',27,18,6,1);
    r('#c8ccd4',37,12,2,26);r('#ffffff',37,12,1,24);r('#d8b040',35,37,6,2);r('#4a3018',37,39,2,5)});YDS.rack.ax=25;YDS.rack.ay=49;
  YDS.lamp=ydSprite(26,56,g=>{const r=(c,x,y,w=1,h=1)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
    r('#3e2814',7,8,4,46);r('#6e4a26',7,8,1,46);r('#3e2814',4,52,10,3);r('#3e2814',7,8,14,3);r('#6e4a26',7,8,14,1);r('#2a2420',18,11,1,4);
    r('#2a2420',15,15,8,2);r('#2a2420',15,26,8,2);r('#2a2420',15,17,1,9);r('#2a2420',22,17,1,9);r('#ffd070',16,17,6,9);r('#fff4c8',18,19,2,5);r('#2a2420',18,17,1,9)});YDS.lamp.ax=9;YDS.lamp.ay=54}
function drawYd(p){const[sx,sy]=iso(p.x,p.y);if(sx<-90||sx>W+90||sy<-140||sy>H+80)return;if(!YDS.hay)ydSprites();
  if(p.k==='ydhay'){const c=YDS.hay[p.v];shadow(sx,sy,p.v?.6:.36);ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));return}
  if(p.k==='ydrack'){const c=YDS.rack;shadow(sx,sy,.42);ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));return}
  if(p.k==='ydlamp'){const c=YDS.lamp;shadow(sx,sy,.16);ctx.drawImage(c,Math.round(sx-c.ax),Math.round(sy-c.ay));flame(sx+9,sy-29,3,p.ph||0);return}
  if(p.k==='ydfence'){const[ax,ay]=iso(p.x0,p.y0),[bx,by]=iso(p.x1,p.y1);ctx.lineCap='square';
    for(const h of[10,19]){ctx.strokeStyle='#3e2814';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ax,ay-h);ctx.lineTo(bx,by-h);ctx.stroke();ctx.strokeStyle='#7a5430';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax,ay-h-1);ctx.lineTo(bx,by-h-1);ctx.stroke()}
    for(const[x,y]of p.end?[[ax,ay],[bx,by]]:[[ax,ay]]){ctx.fillStyle='#2a1a0c';ctx.fillRect(Math.round(x)-3,Math.round(y)-26,6,27);ctx.fillStyle='#5a3c1e';ctx.fillRect(Math.round(x)-2,Math.round(y)-25,4,25);ctx.fillStyle='#8a6034';ctx.fillRect(Math.round(x)-2,Math.round(y)-25,1,25)}ctx.lineCap='butt';return}
  if(p.k==='ydflower'){if(!p.f){const R=ydR(p.seed);p.f=[];for(let k=0;k<22;k++){const a=R()*6.283,q=Math.sqrt(R());p.f.push([Math.cos(a)*q*26,Math.sin(a)*q*11,6+R()*7,p.pal[R()*p.pal.length|0],R()*6])}p.f.sort((a,b)=>a[1]-b[1])}
    ctx.fillStyle='rgba(58,38,20,.85)';ctx.beginPath();ctx.ellipse(sx,sy,30,13,0,0,7);ctx.fill();ctx.fillStyle='rgba(90,62,34,.6)';ctx.beginPath();ctx.ellipse(sx,sy-1,26,10,0,0,7);ctx.fill();
    for(const[x,y,h,c,ph]of p.f){const b=Math.sin(G.t*1.6+ph)*1.2,X=Math.round(sx+x),Y=Math.round(sy+y);ctx.fillStyle='#3a7a2a';ctx.fillRect(X,Y-h,1,h);ctx.fillStyle='#5aa83a';ctx.fillRect(X-2,Y-h*.5|0,2,1);
      ctx.fillStyle=c;ctx.fillRect(Math.round(X+b)-1,Y-h-1,3,3);ctx.fillStyle='#fff4b0';ctx.fillRect(Math.round(X+b),Y-h,1,1)}return}}
// hens: peck about, bob, and scatter flapping from anyone who comes close
function updHen(c,dt){c.t+=dt;const d=hyp(P.x-c.x,P.y-c.y);
  if(d<1.7){c.a=Math.atan2(c.y-P.y,c.x-P.x)+rnd(-.5,.5);c.sp=3.4;c.flap=.5;c.st=0}
  else if((c.st-=dt)<=0){if(Math.random()<.45){c.sp=0;c.peck=1;c.st=rnd(.8,2.2)}else{c.sp=rnd(.6,1.1);c.peck=0;c.a+=rnd(-1.6,1.6);c.st=rnd(.6,1.6)}if(hyp(c.x-c.cx,c.y-c.cy)>c.rr)c.a=Math.atan2(c.cy-c.y,c.cx-c.x)}
  c.flap=Math.max(0,(c.flap||0)-dt);
  if(c.sp>0){const nx=c.x+Math.cos(c.a)*c.sp*dt,ny=c.y+Math.sin(c.a)*c.sp*dt;if(walkable(nx,ny)&&walkable(nx+Math.cos(c.a)*.25,ny+Math.sin(c.a)*.25)){c.x=nx;c.y=ny}else{c.a+=rnd(1.5,3)}c.sp=Math.max(0,c.sp-dt*(c.flap>0?2:.3))}}
function drawHen(c){const[sx,sy]=iso(c.x,c.y);if(sx<-20||sx>W+20||sy<-40||sy>H+20)return;const[dx]=scrDir(c.a),f=dx>=0?1:-1,X=Math.round(sx),walk=c.sp>0?Math.sin(c.t*22):0,hop=c.flap>0?Math.abs(Math.sin(c.t*30))*3:0,Y=Math.round(sy-hop),
    peck=c.peck&&c.sp===0&&Math.sin(c.t*7)>.3?3:0,r=(col,x,y,w=1,h=1)=>{ctx.fillStyle=col;ctx.fillRect(X+(f>0?x:-x-w),Y+y,w,h)};
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(sx,sy,6,2.5,0,0,7);ctx.fill();
  r('#e8a830',-1+(walk>0?1:0),-3,1,3);r('#e8a830',1-(walk>0?1:0),-3,1,3);
  r('#1a140c',-6,-10,11,7);r(c.col[0],-5,-10,9,6);r(c.col[1],-5,-6,9,2);r(c.col[0],-7,-12,3,3);r('#1a140c',-8,-13,1,3);
  if(c.flap>0){const u=Math.sin(c.t*40)>0;r(c.col[1],-3,u?-14:-9,5,2)}else r(c.col[1],-3,-9,5,3);
  r('#1a140c',2,-15+peck,5,6);r(c.col[0],3,-14+peck,3,5);r('#d83a2a',3,-16+peck,3,2);r('#d83a2a',5,-11+peck,1,2);r('#e8a830',6,-13+peck,2,1);r('#1a140c',4,-13+peck,1,1)}
// the yard and the hill's new life are laid out once per world, beside the tower
const YDLAY={hay:[[24,12.5,1],[29.3,17,0],[24.1,16.6,0],[35.6,26.4,1],[12.6,27.4,0],[21.2,30.6,0],[14.2,16.2,0]],rack:[[28.9,12.2]],
  lamp:[[30.4,15.8],[31.8,31.2],[18.7,19.8],[24.4,26.9]],
  fence:[[[24.2,11.1],[30.4,11.1]],[[30.4,11.1],[30.4,14.1]]],
  flower:[[11.6,23.5],[9.6,18.6],[27.4,34.2],[31.5,33.6],[16.6,29.4],[35.4,19.6],[17.6,11.6],[13.5,13.6],[33.2,21]],
  hens:[[27.6,16.6,26.5,15.2,4],[25.4,17.2,26.5,15.2,4],[28.4,15.2,26.5,15.2,4],[13.4,26.6,13,26.8,3.5],[12.2,28.2,13,26.8,3.5]],
  pals:[['#e8483a','#f0a030','#f4e060'],['#a868e0','#e070c0','#f0f0f0'],['#4a8ae8','#80d0f0','#f4e060'],['#f070a0','#ffffff','#e8483a'],['#f4e060','#f0a030','#ffffff']]};
function yardLay(m){const H=m.home,at=(x,y)=>nearWalk(HOX+x,HOY+y),props=[],crit=[];
  for(const[x,y,v]of YDLAY.hay){const[px,py]=at(x,y);props.push({k:'ydhay',x:px,y:py,v});YD.ground.push({x:px,y:py,c:strawPatch(v?1.4:1,px*31+py)})}
  for(const[x,y]of YDLAY.rack){const[px,py]=at(x,y);props.push({k:'ydrack',x:px,y:py})}
  for(const[x,y]of YDLAY.lamp){const[px,py]=at(x,y);props.push({k:'ydlamp',x:px,y:py,ph:Math.random()*6})}
  for(const[[x0,y0],[x1,y1]]of YDLAY.fence){const n=Math.round(hyp(x1-x0,y1-y0));for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n,X0=HOX+x0+(x1-x0)*a,Y0=HOY+y0+(y1-y0)*a,X1=HOX+x0+(x1-x0)*b,Y1=HOY+y0+(y1-y0)*b;props.push({k:'ydfence',x:(X0+X1)/2,y:(Y0+Y1)/2,x0:X0,y0:Y0,x1:X1,y1:Y1,end:k===n-1})}}
  YDLAY.flower.forEach(([x,y],i)=>{const[px,py]=at(x,y);props.push({k:'ydflower',x:px,y:py,seed:101+i*37,pal:YDLAY.pals[i%YDLAY.pals.length]});
    for(let k=0;k<(i%3===0?2:1);k++)crit.push({k:'fly',x:px+rnd(-1,1),y:py+rnd(-1,1),a:rnd(0,6),t:rnd(0,9),col:pick(['#f4e060','#ffffff','#f0a030','#a8d8ff','#f070a0']),cx:px+.5,cy:py+.5})});
  YDLAY.hens.forEach(([x,y,cx,cy,rr],i)=>{const[px,py]=at(x,y);crit.push({k:'ydhen',x:px,y:py,a:rnd(0,6),t:rnd(0,9),sp:0,st:rnd(0,2),cx:HOX+cx,cy:HOY+cy,rr,col:i%3===2?['#a8682a','#7a4418']:['#f2ece0','#c8c0b0']})});
  YD.ground.unshift({x:YD.x,y:YD.y+.2,c:strawPatch(2.8,4242)});
  H.props.push(...props);H.crit.push(...crit);H.yd=1;m.ac=null;owTick()}
function dummyTick(dt){const m=G.map;if(!m||!m.world||!m.home)return;if(!m.home.yd){YD.ground=[];yardLay(m)}
  let e=m.enemies.find(e=>e.dummy);if(!e){e=mkDummy();m.enemies.push(e)}if(e.dead){e.dead=false;e.hp=DUMMY_HP}
  while(YD.log.length&&G.t-YD.log[0][0]>5)YD.log.shift();
  const act=G.t-YD.last<4,win=Math.min(5,Math.max(1,G.t-YD.t0));YD.dps=act?YD.log.reduce((s,l)=>s+l[1],0)/win:0;
  e.sub=act?'Unendlich Leben · '+ydNum(YD.dps)+' Schaden/s · '+ydNum(YD.tot)+' gesamt':'Unendlich Leben · schlag zu';
  for(const c of m.crit)if(c.k==='ydhen'&&Math.abs(c.x-P.x)+Math.abs(c.y-P.y)<40)updHen(c,dt)}
// no AI: it only sways, flashes and counts what it lost; nothing kills it, nothing moves it, and it never joins a fight
const _updEnemyY=updEnemy;updEnemy=function(e,dt){if(!e.dummy)return _updEnemyY(e,dt);
  if(e.dotT>0){e.dotT-=dt;e.hp-=e.dotD*dt*e.dmgTaken}
  e.flash=Math.max(0,e.flash-dt);e.hitT=Math.max(0,(e.hitT||0)-dt);e.wob=Math.max(0,(e.wob||0)-dt*1.8);e.slow=0;e.kvx=e.kvy=0;e.aggro=false;e.anim+=dt;
  dummyTake(DUMMY_HP-e.hp);e.hp=DUMMY_HP};
const _hitEnemyY=hitEnemy;hitEnemy=function(e,dmg,o={}){if(!e||!e.dummy)return _hitEnemyY(e,dmg,o);const n=CFG.numbers;CFG.numbers=true;YD.straw=1;
  try{_hitEnemyY(e,dmg,{...o,kb:0})}finally{CFG.numbers=n;YD.straw=0}e.aggro=false;e.wob=Math.min(1.3,(e.wob||0)+.55+(o.crit?.4:0));e.wobA=o.from!=null?o.from:Math.atan2(e.y-P.y,e.x-P.x);
  if(Math.random()<.5)fxp({k:'bone',x:e.x+rnd(-.2,.2),y:e.y+rnd(-.2,.2),z:1.1,vx:rnd(-1,1),vy:rnd(-1,1),vz:rnd(1,3),life:rnd(1,1.8),col:pick(STRAW.cols),s:rnd(1,2),g:6,rot:0,vr:rnd(-8,8)})};
const _killEnemyY=killEnemy;killEnemy=function(e,a){if(e&&e.dummy){e.hp=DUMMY_HP;return}return _killEnemyY(e,a)};
const _goreY=gore;gore=function(x,y,ang,n,g,z){return _goreY(x,y,ang,n,YD.straw?STRAW:g,z)};
const _drawEnemyY=drawEnemy;drawEnemy=function(e){if(e.dummy)return drawDummy(e);return _drawEnemyY(e)};
const _updateY=update;update=function(dt){_updateY(dt);const m=G.map;if(m&&m.world)for(const e of m.enemies)if(e.dummy){e.x=YD.x;e.y=YD.y}};
const _updForgeY=updForge;updForge=function(dt){_updForgeY(dt);if(P&&G.map&&G.state!=='title')dummyTick(dt)};
const _drawDecalsY=drawDecals;drawDecals=function(){const m=G.map;if(m&&m.world&&m.home&&m.home.yd)drawStraw();return _drawDecalsY()};
const _drawPropY=drawProp;drawProp=function(p){if(p.k&&p.k.slice(0,2)==='yd')return drawYd(p);return _drawPropY(p)};
const _drawCritterY=drawCritter;drawCritter=function(c){if(c.k==='ydhen')return drawHen(c);return _drawCritterY(c)};
const _propLightY=propLight;propLight=function(p){return p.k==='ydlamp'?{r:150,a:.8,col:'255,180,90',f:5,h:30}:_propLightY(p)};
// the butterflies' flutter in ambient() would carry the hens off, so they sit that loop out
const _ambientY=ambient;ambient=function(dt){const m=G.map,c=m&&m.crit;if(c&&c.some(h=>h.k==='ydhen')){m.crit=c.filter(h=>h.k!=='ydhen');try{_ambientY(dt)}finally{m.crit=c}}else _ambientY(dt)};
