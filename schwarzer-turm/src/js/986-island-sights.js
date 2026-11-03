/* ---------- island sights: lighthouses, fallen giants and waterfalls into the void · crypts with a treasure · bridge stones · drifting islets · weather by region · a light in the tower for every beaten guardian ---------- */
const ISN={islight:'Der alte Leuchtturm',isstatue:'Der gestürzte Riese',isfall:'Der Fall ins Nichts'};
const _owContentI=owContent;owContent=function(m,cx,cy){const c=_owContentI(m,cx,cy),I=islandOf(cx,cy);if(!I||I.kind==='home'||I.kind==='boss'||(I.big&&!(cx===I.cx&&cy===I.cy)))return c;
  const Rg=mulberry(Math.floor(hsh(cx,cy,131)*1e9)),W0=m.w,t=m.t,land=(i,j)=>t[j*W0+i]===4||t[j*W0+i]===7,key=cx+','+cy,taken=[...c.objs,...c.props,...c.blocks.map(b=>({x:b.i+.5,y:b.j+.5}))];
  const solid=(i,j,n,k)=>{for(let a=0;a<n;a++)for(let b=0;b<k;b++){const q=(j+b)*W0+i+a;m.under[q]=t[q];t[q]=9}};
  const okAt=(i,j,n,k,pad=1)=>{for(let a=-pad;a<n+pad;a++)for(let b=-pad;b<k+pad;b++)if(!land(i+a,j+b))return false;return pad===0||!taken.some(o=>o.x>i-2&&o.x<i+n+2&&o.y>j-2&&o.y<j+k+2)};
  // a landmark on about every fifth island, set on a diagonal so no road is blocked
  const lk=Rg()<.22?(I.kind==='rock'?'islight':I.kind==='ruins'?'isstatue':I.kind==='forest'?'isfall':['islight','isstatue','isfall'][Math.floor(Rg()*3)]):null;
  if(lk==='isfall'){let x=I.x,y=I.y,ex=null;for(let s=0;s<I.r*2;s+=.5){const i=Math.floor(x+s*.707),j=Math.floor(y+s*.707);if(land(i,j))ex=[i,j];else break}
    if(ex&&!land(ex[0]+1,ex[1]+1)&&hyp(ex[0]-I.x,ex[1]-I.y)>3.5){solid(ex[0],ex[1],1,1);c.props.push({k:'isfall',x:ex[0]+.5,y:ex[1]+.5,ph:Rg()*6,v:0,key})}}
  else if(lk){const n=lk==='islight'?2:3,k=2;for(let tr=0;tr<20;tr++){const a=Rg()*6.283,r=I.r*(.35+Rg()*.4),i=Math.floor(I.x+Math.cos(a)*r-n/2),j=Math.floor(I.y+Math.sin(a)*r-k/2);
    if(Math.abs(i+n/2-I.x)<n/2+2.8||Math.abs(j+k/2-I.y)<k/2+2.8||!okAt(i,j,n,k,0)||c.objs.some(o=>hyp(o.x-i-n/2,o.y-j-k/2)<3.5))continue;
    // whatever lies about on the spot makes way
    const x0=i+n/2,y0=j+k/2,cl=o=>Math.abs(o.x-x0)>n/2+1||Math.abs(o.y-y0)>k/2+1;c.props=c.props.filter(cl);c.deco=c.deco.filter(cl);
    solid(i,j,n,k);c.props.push({k:lk,x:x0,y:y0,ph:Rg()*6,v:Math.floor(Rg()*2),key});taken.push({x:x0,y:y0});break}}
  // crypts: stairs into the rock, two or three rooms below and a treasure at the end
  if(I.kind==='grave'||I.kind==='ruins'?Rg()<.45:I.kind==='wild'&&Rg()<.12)for(let tr=0;tr<8;tr++){const a=Math.PI*1.25+(Rg()-.5)*.6,r=I.r*(.45+Rg()*.2),i=Math.floor(I.x+Math.cos(a)*r),j=Math.floor(I.y+Math.sin(a)*r);
    if(!okAt(i,j,1,1)||Math.abs(i+.5-I.x)<2.8||Math.abs(j+.5-I.y)<2.8)continue;c.objs.push({type:'iscrypt',x:i+.5,y:j+.5,key,lvl:c.lvl+1,name:'Gruft '+['der Vergessenen','der Stillen','der Ahnen','der Krähen','der Namenlosen','unter der Asche'][Math.floor(Rg()*6)]});taken.push({x:i+.5,y:j+.5});break}
  // bridge stones: where two islands have no bridge, a rune stone raises one
  if(!I.big)for(const[dx,dy]of[[1,0],[0,1]]){const N=islandOf(cx+dx,cy+dy);if(!N||N.kind==='home'||N.big||linkOn(cx,cy,cx+dx,cy+dy)||hsh(cx,cy,150+dx)>.4)continue;
    const bk=`${cx},${cy}>${cx+dx},${cy+dy}`,x=Math.floor(I.x+dx*(I.r-3.2)+dy*2.6)+.5,y=Math.floor(I.y+dy*(I.r-3.2)+dx*2.6)+.5;if(!land(Math.floor(x),Math.floor(y))||taken.some(o=>hyp(o.x-x,o.y-y)<1.6))continue;
    const on=!!twS().br[bk];c.objs.push({type:'isbstone',x,y,bk,ax:cx,ay:cy,bx:cx+dx,by:cy+dy,on});taken.push({x,y});if(on)isBuild(m,cx,cy,cx+dx,cy+dy,false)}
  return c};
function isBridgeTiles(m,ax,ay,bx,by){const A=islandOf(ax,ay),B=islandOf(bx,by),L=[];if(!A||!B)return L;const W0=m.w,open=k=>!m.t[k]||m.t[k]===9&&m.under[k]===8;
  if(by===ay){const row=Math.round((A.y+B.y)/2)-1;for(let i=Math.floor(A.x);i<=Math.ceil(B.x);i++)for(let j=row;j<row+3;j++)if(open(j*W0+i))L.push(j*W0+i)}
  else{const col=Math.round((A.x+B.x)/2)-1;for(let j=Math.floor(A.y);j<=Math.ceil(B.y);j++)for(let i=col;i<col+3;i++)if(open(j*W0+i))L.push(j*W0+i)}return L}
let ISB=null;
function isBuild(m,ax,ay,bx,by,anim){owIsland(m,bx,by);const L=isBridgeTiles(m,ax,ay,bx,by);for(const k of L)if(m.t[k]===9){owUnpost(m,k%m.w,Math.floor(k/m.w));m.t[k]=8;m.under[k]=0}if(!anim){for(const k of L){m.t[k]=8;m.under[k]=0}return}ISB={m,L,i:0,acc:0}}
// the sights
const _drawPropI=drawProp;drawProp=function(p){if(!ISN[p.k])return _drawPropI(p);isProp(p)};
const _propLightI=propLight;propLight=function(p){if(p.k==='islight')return{r:240,a:.9,col:'255,220,150',f:3,h:128};if(p.k==='isfall')return{r:110,a:.4,col:'150,200,255',f:2,h:10};return _propLightI(p)};
function isProp(p){const[sx,sy]=iso(p.x,p.y);if(sx<-200||sx>W+200||sy<-260||sy>H+300)return;const t=G.t;ctx.save();ctx.translate(Math.round(sx),Math.round(sy));
  if(p.k==='islight'){shadow(0,0,.9);const H0=128,bw=17,tw=10;for(let k=0;k<6;k++){const y0=-k*H0/6,y1=-(k+1)*H0/6,w0=bw-(bw-tw)*k/6,w1=bw-(bw-tw)*(k+1)/6;ctx.fillStyle=k%2?'#a82a20':'#e8e0d0';ctx.beginPath();ctx.moveTo(-w0,y0);ctx.lineTo(-w1,y1);ctx.lineTo(w1,y1);ctx.lineTo(w0,y0);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.moveTo(w0*.25,y0);ctx.lineTo(w1*.25,y1);ctx.lineTo(w1,y1);ctx.lineTo(w0,y0);ctx.closePath();ctx.fill()}
    ctx.fillStyle='#2a1a10';ctx.fillRect(-4,-14,8,14);ctx.fillStyle='#1a1410';ctx.fillRect(-2,-62,4,7);ctx.fillRect(3,-96,3,6);
    ctx.fillStyle='#2a2622';ctx.fillRect(-15,-H0-3,30,4);ctx.fillStyle='#4a453c';for(let x=-14;x<=14;x+=4)ctx.fillRect(x,-H0-9,1.4,6);ctx.fillRect(-15,-H0-10,30,1.4);
    const n=nightA?nightA():0,lg=ctx.createLinearGradient(0,-H0-24,0,-H0-6);lg.addColorStop(0,'#fff4c0');lg.addColorStop(1,'#ffb050');ctx.fillStyle=lg;ctx.fillRect(-7,-H0-24,14,17);ctx.fillStyle='#2a2622';ctx.fillRect(-1,-H0-24,2,17);ctx.fillRect(-8,-H0-25,16,2);
    ctx.fillStyle='#7a1a14';ctx.beginPath();ctx.moveTo(-10,-H0-25);ctx.lineTo(0,-H0-38);ctx.lineTo(10,-H0-25);ctx.closePath();ctx.fill();ctx.fillStyle='#2a2622';ctx.fillRect(-.7,-H0-43,1.4,6);
    ctx.globalCompositeOperation='lighter';const a0=t*.7+p.ph,al=.1+n*.35;for(const s of[0,Math.PI]){const a=a0+s,ca=Math.cos(a),len=280*(.35+.65*Math.abs(ca));const g=ctx.createLinearGradient(0,-H0-16,ca*len,-H0-16+Math.sin(a)*len*.3);g.addColorStop(0,`rgba(255,236,170,${al})`);g.addColorStop(1,'rgba(255,220,150,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-H0-16);ctx.lineTo(ca*len,-H0-16+Math.sin(a)*len*.3-len*.07);ctx.lineTo(ca*len,-H0-16+Math.sin(a)*len*.3+len*.07);ctx.closePath();ctx.fill()}
    const g=ctx.createRadialGradient(0,-H0-16,0,0,-H0-16,40);g.addColorStop(0,`rgba(255,230,160,${.3+n*.3})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-40,-H0-56,80,80)}
  else if(p.k==='isstatue'){shadow(0,4,2);ctx.scale(1.7,1.7);const St=(c)=>ctx.fillStyle=c;
    // the broken torso, the arm reaching out, the great head on its side
    St('#4a463e');ctx.beginPath();ctx.moveTo(-46,-4);ctx.lineTo(-30,-26);ctx.lineTo(-6,-22);ctx.lineTo(-2,2);ctx.lineTo(-30,12);ctx.closePath();ctx.fill();St('#6a6458');ctx.beginPath();ctx.moveTo(-46,-4);ctx.lineTo(-30,-26);ctx.lineTo(-20,-24);ctx.lineTo(-34,-2);ctx.closePath();ctx.fill();
    St('#3a362e');ctx.fillRect(-12,-18,6,4);St('#5a544a');ctx.beginPath();ctx.moveTo(-4,-2);ctx.lineTo(30,10);ctx.lineTo(34,4);ctx.lineTo(0,-10);ctx.closePath();ctx.fill();St('#6a6458');for(let k=0;k<4;k++)ctx.fillRect(32+k*3,2+k*2,2.4,8);ctx.fillRect(30,12,5,3);
    St('#5a544a');ctx.beginPath();ctx.ellipse(22,-18,20,16,-.4,0,7);ctx.fill();St('#7a7468');ctx.beginPath();ctx.ellipse(18,-22,14,10,-.4,0,7);ctx.fill();St('#2a2620');ctx.fillRect(16,-24,5,3);ctx.fillRect(26,-28,5,3);ctx.fillRect(22,-16,2,6);ctx.fillRect(18,-10,9,2);
    St('#3a6a24');for(const[x,y,w]of[[-38,-12,8],[-24,-24,6],[10,-32,9],[30,-30,5],[0,-6,5]])ctx.fillRect(x,y,w,2);St('#4a8a2a');ctx.fillRect(12,-33,4,1);ctx.strokeStyle='#2a2620';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-28,-20);ctx.lineTo(-22,-10);ctx.lineTo(-24,0);ctx.stroke()}
  else if(p.k==='isfall'){ctx.fillStyle='#2a3238';ctx.beginPath();ctx.ellipse(0,0,24,11,0,0,7);ctx.fill();const g=ctx.createRadialGradient(-4,-3,0,0,0,22);g.addColorStop(0,'#3a6a9a');g.addColorStop(1,'#14304a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,21,9.5,0,0,7);ctx.fill();
    for(let k=0;k<2;k++){const q=(t*.4+k*.5+p.ph)%1;ctx.strokeStyle=`rgba(190,225,255,${(1-q)*.4})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(-3,-1,q*16,q*7,0,0,7);ctx.stroke()}
    for(const[x,y]of[[-22,-2],[18,-6],[20,4],[-14,8]]){ctx.fillStyle='#5a544a';ctx.beginPath();ctx.ellipse(x,y,5,3,0,0,7);ctx.fill()}
    const sg=ctx.createLinearGradient(0,6,0,260);sg.addColorStop(0,'rgba(190,225,255,.95)');sg.addColorStop(.6,'rgba(160,200,240,.5)');sg.addColorStop(1,'rgba(160,200,240,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.moveTo(6,6);ctx.lineTo(18,8);ctx.quadraticCurveTo(26,120,30,260);ctx.lineTo(6,260);ctx.quadraticCurveTo(8,120,6,6);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=1;for(let k=0;k<5;k++){const o=(t*140+k*53)%240;ctx.beginPath();ctx.moveTo(9+k*2.4+o*.06,12+o);ctx.lineTo(9+k*2.4+o*.07,26+o);ctx.stroke()}
    for(let k=0;k<4;k++){const q=(t*.3+k*.25)%1;ctx.fillStyle=`rgba(220,236,255,${(1-q)*.12})`;ctx.beginPath();ctx.arc(18+Math.sin(k*2)*10,220+q*-30,14+q*18,0,7);ctx.fill()}
    if(Math.random()<.2)fxp({k:'dot',x:p.x+.3+rnd(-.1,.1),y:p.y+.3+rnd(-.1,.1),z:.1,vx:rnd(-.5,.5),vy:rnd(-.5,.5),vz:rnd(.8,1.6),life:.5,col:'#c8e4ff',s:1.3,g:7})}
  ctx.restore()}
// crypts, their exits and treasures, bridge stones
const ISO={iscrypt:o=>twS().crypt[o.key]?o.name+' (leer)':o.name+' · Stufe '+o.lvl,iscryptexit:()=>'Hinauf ans Licht',iscryptchest:o=>o.open?'Truhe (leer)':'Schatz der Gruft',isbstone:o=>o.on?'Brückenstein (erwacht)':'Brückenstein · berühren'};
const _drawObjI=drawObj;drawObj=function(o){if(!ISO[o.type])return _drawObjI(o);const[sx,sy]=iso(o.x,o.y);if(sx<-120||sx>W+120||sy<-200||sy>H+80)return;const hov=G.state==='play'&&hoverObj()===o;isObj(o,sx,sy);if(hov)label(sx,sy-58,ISO[o.type](o),'#ffd88a')};
function isObj(o,sx,sy){const t=G.t;ctx.save();ctx.translate(Math.round(sx),Math.round(sy));
  if(o.type==='iscrypt'){const done=!!twS().crypt[o.key];ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(24,0);ctx.lineTo(0,12);ctx.lineTo(-24,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#3a3630';ctx.lineWidth=1.4;for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(-17+k*5,-2+k*2.5);ctx.lineTo(7+k*5,-14+k*2.5+12);ctx.stroke()}
    for(const s of[-1,1]){ctx.fillStyle='#3e3a34';ctx.fillRect(s*20-4,-34,8,32);ctx.fillStyle='#5a544a';ctx.fillRect(s*20-4,-34,3,32)}ctx.fillStyle='#4a453c';ctx.fillRect(-26,-40,52,7);ctx.fillStyle='#6a6458';ctx.fillRect(-26,-40,52,2);ctx.fillStyle='#1a1610';ctx.fillRect(-6,-38,12,3);
    if(!done){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-4,0,0,-4,30);g.addColorStop(0,`rgba(120,255,170,${.22+Math.sin(t*2)*.08})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-30,-34,60,60);if(Math.random()<.1)fxp({k:'mote',x:o.x+rnd(-.3,.3),y:o.y+rnd(-.3,.3),z:.1,vx:0,vy:0,vz:.5,life:1.4,col:'#9affc0',s:1.1,g:-.2})}}
  else if(o.type==='iscryptexit'){ctx.fillStyle='#0a0806';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(24,0);ctx.lineTo(0,12);ctx.lineTo(-24,0);ctx.closePath();ctx.fill();ctx.fillStyle='#4a453c';for(let k=0;k<4;k++)ctx.fillRect(-14+k*4,4-k*5,26-k*4,3);
    ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,-60,0,6);g.addColorStop(0,'rgba(200,220,255,0)');g.addColorStop(1,'rgba(200,220,255,.25)');ctx.fillStyle=g;ctx.fillRect(-14,-60,28,66)}
  else if(o.type==='iscryptchest'){shadow(0,0,.5);ctx.fillStyle='#2a3a30';ctx.fillRect(-18,-16,36,16);ctx.fillStyle='#3e5244';ctx.fillRect(-18,-16,36,3);ctx.fillStyle='#8a9a7a';for(const x of[-18,-2,15])ctx.fillRect(x,-16,3,16);
    if(o.open){ctx.fillStyle='#0a0e0c';ctx.fillRect(-16,-20,32,5)}else{ctx.fillStyle='#24342a';ctx.beginPath();ctx.moveTo(-18,-16);ctx.quadraticCurveTo(0,-28,18,-16);ctx.fill();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-14,0,0,-14,32);g.addColorStop(0,`rgba(120,255,170,${.3+Math.sin(t*3)*.1})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-32,-46,64,64)}}
  else if(o.type==='isbstone'){shadow(0,0,.4);ctx.fillStyle='#24222a';ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-7,-36);ctx.lineTo(0,-44);ctx.lineTo(7,-34);ctx.lineTo(10,0);ctx.closePath();ctx.fill();ctx.fillStyle='#3a3842';ctx.beginPath();ctx.moveTo(-7,-36);ctx.lineTo(0,-44);ctx.lineTo(0,0);ctx.lineTo(-9,0);ctx.closePath();ctx.fill();
    const a=o.on?.85:.25+Math.sin(t*1.5)*.12;ctx.strokeStyle=`rgba(120,200,255,${a})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-3,-32);ctx.lineTo(3,-26);ctx.lineTo(-3,-20);ctx.lineTo(3,-14);ctx.moveTo(-4,-8);ctx.lineTo(4,-8);ctx.stroke();
    if(o.on){ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-22,0,0,-22,30);g.addColorStop(0,'rgba(120,200,255,.35)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(-30,-52,60,60)}}
  ctx.restore()}
const _interactI=interact;interact=function(o){if(!o||!ISO[o.type])return _interactI(o);
  if(o.type==='iscrypt')return enterCrypt(o);
  if(o.type==='iscryptexit'){enterFloor(0);return}
  if(o.type==='iscryptchest'){if(o.open)return;o.open=true;twLoot(o,3,G.mlvl+2);twS().crypt[o.key]=1;banner('DER SCHATZ DER GRUFT','Die Gruft ist geplündert','',2600);save();return}
  if(o.type==='isbstone'){if(o.on)return;o.on=true;twS().br[o.bk]=1;isBuild(G.map,o.ax,o.ay,o.bx,o.by,true);banner('DER BRÜCKENSTEIN ERWACHT','Eine Brücke wächst über die Leere','',2600);sample('portal',.6,{rate:.6});G.shake=5;flash(o.x,o.y,1.4,60,'120,200,255',.5);save()}};
function genCrypt(key,lvl){const R0=R;const[a,b]=key.split(',').map(Number);R=mulberry(Math.floor(hsh(a,b,160)*1e9));try{
  const w=62,h=40,t=new Uint8Array(w*h),rooms=[],carve=(i,j)=>{if(i>1&&j>1&&i<w-2&&j<h-2)t[j*w+i]=1};
  for(let k=0;k<3;k++){const rw=rint(9,12),rh=rint(9,12),x=4+k*18+rint(0,3),y=rint(4,h-rh-4),shape=pick(['hall','cave','crypt']),r={x,y,w:rw,h:rh,cx:x+(rw>>1),cy:y+(rh>>1),shape};rooms.push(r);const ph=rnd(0,6);
    for(let j=y;j<y+rh;j++)for(let i=x;i<x+rw;i++){const u=(i-x+.5)/rw*2-1,v=(j-y+.5)/rh*2-1,d=hyp(u,v),q=Math.atan2(v,u);if(shape==='cave'?d<.86+Math.sin(q*3+ph)*.1:Math.abs(u)+Math.abs(v)<1.6)carve(i,j)}}
  for(let k=1;k<3;k++){const A=rooms[k-1],B=rooms[k];let x=A.cx,y=A.cy;const br=(cx,cy)=>{for(let j=cy-1;j<=cy+1;j++)for(let i=cx-1;i<=cx+1;i++)carve(i,j)};while(x!==B.cx){br(x,y);x+=Math.sign(B.cx-x)}while(y!==B.cy){br(x,y);y+=Math.sign(B.cy-y)}br(x,y)}
  for(let j=0;j<h;j++)for(let i=0;i<w;i++)if(!t[j*w+i]){for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const q=(j+dj)*w+i+di;if(i+di>=0&&j+dj>=0&&i+di<w&&j+dj<h&&t[q]===1)t[j*w+i]=2}}
  const s=rooms[0],e=rooms[2],m={kind:'dungeon',crypt:key,floor:Math.max(2,Math.round((lvl+1)/2)),w,h,t,explored:new Uint8Array(w*h),rooms,startRoom:s,endRoom:e,boss:false,objs:[],deco:[],props:[],enemies:[],items:[],
    start:{x:s.cx+.5,y:s.cy+1.5},secret:null,boulders:1,dc:1,fth:{id:'gruft',n:'Gruft',tint:'70,140,100',dark:'2,6,4',amb:'drip'}};
  m.objs.push({type:'iscryptexit',x:s.cx-.5,y:s.cy-.5},{type:'iscryptchest',x:e.cx+.5,y:e.cy+.5,open:false,key});
  for(const q of ftWallSpots(m,9,4.5))m.props.push({k:'torch',...q,ph:rnd(0,6)});m.props.push({k:'twL',x:e.cx+.5,y:e.cy+.5,col:'120,255,170',r:150,ph:0});
  for(const[dx,dy]of[[-1.3,0],[1.3,0]])m.props.push({k:'dccand',x:e.cx+.5+dx,y:e.cy+.5+dy+.8,v:0,ph:rnd(0,6)});
  for(let k=0;k<30;k++){const i=rint(3,w-4),j=rint(3,h-4);if(t[j*w+i]===1)m.deco.push({k:pick(['bones','bones','skull','rubble']),x:i+rnd(.1,.9),y:j+rnd(.1,.9),v:rint(0,3)})}
  try{dungeonDecor(m)}catch(er){}return m}finally{R=R0}}
function enterCrypt(o){if(twS().crypt[o.key]){log('Die Gruft ist leer. Nur Staub und Knochen.','#c8b898');return}const lvl=o.lvl;G.owAt={x:P.x,y:P.y};const m=genCrypt(o.key,lvl);G.maps.crypt=m;G.cryptN=o.name;
  const pm=G.mlvl;G.mlvl=lvl;populate(m);G.mlvl=pm;enterFloor('crypt');G.mlvl=lvl;banner(o.name,'Monsterstufe '+lvl+' · am Ende wartet ein Schatz','',2800)}
const _floorTitleI=floorTitle;floorTitle=function(f){return f==='crypt'?G.cryptN||'Gruft':_floorTitleI(f)};
const _dieI=die;die=function(){const cr=G.floor==='crypt';_dieI();if(cr&&G.glutmal&&G.glutmal.floor==='crypt'){P.glut=G.glutmal.amt;G.glutmal=null;log('Die Gruft behält deine Glut nicht. Sie bleibt bei dir.','#9affc0')}};
// ticking: crypts close behind you, bridges grow, sights are discovered
const _updTrapsI=updTraps;updTraps=function(dt){_updTrapsI(dt);if(!P)return;if(G.maps&&G.maps.crypt&&G.floor!=='crypt')delete G.maps.crypt;const m=G.map;if(!m||!m.world)return;
  if(ISB&&ISB.m===m){ISB.acc+=dt*45;while(ISB.acc>=1&&ISB.i<ISB.L.length){ISB.acc--;const k=ISB.L[ISB.i++];m.t[k]=8;m.under[k]=0;const x=k%m.w+.5,y=Math.floor(k/m.w)+.5;if(ISB.i%3===0)smoke(x,y,2,'rgba(120,130,150,',5,.5);if(ISB.i%9===0)sparks(x,y,.2,-1.57,3,['#a8d0ff','#ffffff'],3)}
    G.shake=Math.max(G.shake||0,1.2);if(ISB.i>=ISB.L.length){ISB=null;G.flowT=0;computeFlow();log('Die Brücke steht. Ein neuer Weg über die Leere.','#a8d0ff')}}
  if(G.state!=='play')return;const S=twS().seen;for(const p of m.props){if(!ISN[p.k])continue;const id=p.k+'@'+p.key;if(S[id]||hyp(p.x-P.x,p.y-P.y)>5.5)continue;S[id]=1;gainXp(P.lvl*25);banner('ENTDECKT',ISN[p.k],'',2600);sfx('lvl');log(`Entdeckt: ${ISN[p.k]}.`,'#ffd88a');save()}};

// drifting islets far behind the islands, slowly sailing past
const ISL=[];
function isletSpr(v){return mk(96,74,g=>{const Rr=mulberry(v*97+3);g.fillStyle='#3a2e24';g.beginPath();g.moveTo(6,22);for(let k=0;k<=8;k++){const x=6+k*10.5,y=22+Math.sin(k/8*Math.PI)*(40+Rr()*12)+Rr()*6;g.lineTo(x,y)}g.lineTo(90,22);g.closePath();g.fill();
  g.fillStyle='#5a4a3a';g.beginPath();g.moveTo(10,22);for(let k=0;k<=6;k++)g.lineTo(10+k*9,22+Math.sin(k/6*Math.PI)*22+Rr()*4);g.lineTo(64,22);g.closePath();g.fill();g.strokeStyle='#2a3a1a';g.lineWidth=1;for(let k=0;k<5;k++){const x=16+Rr()*64;g.beginPath();g.moveTo(x,26);g.quadraticCurveTo(x+3,40,x-2,48+Rr()*12);g.stroke()}
  g.fillStyle='#2e6a22';g.beginPath();g.ellipse(48,21,43,10,0,0,7);g.fill();g.fillStyle='#4a9a34';g.beginPath();g.ellipse(44,18,36,6.5,0,0,7);g.fill();
  if(v%3===0){g.fillStyle='#3a2414';g.fillRect(60,4,3,14);g.fillStyle='#1e5a1a';g.beginPath();g.arc(61,4,8,0,7);g.fill();g.fillStyle='#2a7a24';g.beginPath();g.arc(59,2,5,0,7);g.fill()}
  else if(v%3===1){g.fillStyle='#8a8478';g.fillRect(30,2,5,16);g.fillRect(42,6,5,12);g.fillRect(28,0,21,3)}})}
const _drawCloudsI=drawClouds;drawClouds=function(m,move){if(m&&m.world&&move)drawIslets();return _drawCloudsI(m,move)};
function drawIslets(){if(!ISL.length){const Rr=mulberry(G.seed*11+5);for(let k=0;k<7;k++)ISL.push({x:Rr()*2400,y:Rr()*1500,s:.45+Rr()*.55,v:6+Rr()*10,ph:Rr()*6,spr:isletSpr(k)})}
  const n=nightA(),t=G.t;for(const I of ISL){const par=.12+I.s*.25,x=((I.x+CX*par+t*I.v)%2400+2400)%2400-300,y=((I.y+CY*par)%1500+1500)%1500-250+Math.sin(t*.4+I.ph)*5;if(x<-120||x>W+40||y<-90||y>H+20)continue;
    ctx.save();ctx.globalAlpha=(.45+I.s*.4)*(1-n*.6);ctx.drawImage(I.spr,x,y,96*I.s,74*I.s);ctx.restore()}}
// weather by region: some reaches of the sky have their own climate – rainy moors, snowfields, ash plains – and steer the weather there
WXN.snow='Schneetreiben';
const CLIM={regen:{n:'Regenmoor',k:['rain','rain','fog','clear']},schnee:{n:'Schneefelder',k:['snow','snow','fog','clear']},asche:{n:'Aschenebene',k:['ash','ash','clear']}};
function climAt(x,y){const cx=Math.floor(x/CH),cy=Math.floor(y/CH);if(Math.abs(cx-40)<=2&&Math.abs(cy-39.5)<=2)return null;const h=hsh(Math.floor(cx/5),Math.floor(cy/5),140);return h<.18?'regen':h<.32?'schnee':h<.42?'asche':null}
const _updWorldI=updWorld;updWorld=function(dt){const m=G.map,w=G.wx,t0=w&&w.t;_updWorldI(dt);if(!m||!m.world||!P||G.state!=='play'||!G.wx)return;const c=climAt(P.x,P.y),W2=G.wx;
  if(c!==G.clim){G.clim=c;if(c){log('Du betrittst '+(c==='regen'?'das ':'die ')+CLIM[c].n+'.','#a8b8c8');if(!CLIM[c].k.includes(W2.k))W2.t=Math.min(W2.t,3)}}
  // the weather just turned: in a region with a climate, the climate decides
  if(c&&t0!=null&&W2.t>t0+1){const was=W2.k;W2.k=pick(CLIM[c].k);if(W2.k!==was&&W2.k!=='clear')log(WXN[W2.k]+' zieht auf.','#8a9ab0')}};
const SNOW=[];
const _drawWeatherI=drawWeather;drawWeather=function(){_drawWeatherI();const m=G.map,w=G.wx;if(!m||!m.world||!w||w.k!=='snow'||w.i<=0){SNOW.length=0;return}const I=w.i,dt=Math.min(.05,Math.max(0,G.t-(SNOW.lt||G.t)));SNOW.lt=G.t;
  ctx.fillStyle=`rgba(200,215,235,${(.1*I).toFixed(3)})`;ctx.fillRect(0,0,W,H);const want=Math.round(130*I);while(SNOW.length<want)SNOW.push({x:rnd(0,W),y:rnd(-H,H),s:rnd(26,60),ph:rnd(0,7),z:rnd(1.6,3.2)});SNOW.length=Math.min(SNOW.length,want);
  ctx.fillStyle='rgba(240,246,255,.85)';for(const d of SNOW){d.y+=d.s*dt;d.x+=Math.sin(G.t*1.1+d.ph)*16*dt-10*dt;if(d.y>H+4){d.y=-4;d.x=rnd(0,W+60)}if(d.x<-8)d.x+=W+16;ctx.fillRect(d.x,d.y,d.z,d.z)}};
// the tower on the hill: a pale light burns in it for every guardian of the deep you have beaten
const TWLIGHTS=[[-12,470],[16,420],[-30,372],[28,300],[-16,236],[10,182],[-6,150],[6,124]];
const _drawTowerFxI=drawTowerFx;drawTowerFx=function(bx,by){_drawTowerFxI(bx,by);const n=Object.keys(G.bossDead||{}).filter(k=>/^\d+$/.test(k)&&G.bossDead[k]).length;if(!n)return;const t=G.t;
  for(let k=0;k<Math.min(n,TWLIGHTS.length);k++){const[x,y]=TWLIGHTS[k],X=bx+x,Y=by-580+y,f=.8+Math.sin(t*2+k*1.7)*.2;ctx.fillStyle='#030202';ctx.fillRect(X-3,Y-8,6,14);ctx.beginPath();ctx.arc(X,Y-8,3,Math.PI,0);ctx.fill();ctx.fillStyle=`rgba(190,225,255,${f})`;ctx.fillRect(X-1.5,Y-6,3,11);
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(X,Y,0,X,Y,26);g.addColorStop(0,`rgba(150,200,255,${.35*f})`);g.addColorStop(1,'rgba(100,160,255,0)');ctx.fillStyle=g;ctx.fillRect(X-26,Y-26,52,52);ctx.restore()}
  if(n>=TWLIGHTS.length){const X=bx,Y=by-580+40,g=ctx.createRadialGradient(X,Y,0,X,Y,90);ctx.save();ctx.globalCompositeOperation='lighter';g.addColorStop(0,`rgba(190,225,255,${.35+Math.sin(t*1.5)*.1})`);g.addColorStop(1,'rgba(100,160,255,0)');ctx.fillStyle=g;ctx.fillRect(X-90,Y-90,180,180);ctx.restore()}};
