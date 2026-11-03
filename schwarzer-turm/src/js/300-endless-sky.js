/* ---------- the endless sky: a huge overworld streamed in 32-tile chunks around the player ---------- */
const WS=2560,CH=32,HOX=1248,HOY=1248;
const hsh=(a,b,c=0)=>{let h=Math.imul(a|0,374761393)^Math.imul(b|0,668265263)^Math.imul(c+1,2246822519)^Math.imul(G.seed|0,3266489917);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const isHomeC=(cx,cy)=>cx>=39&&cx<=41&&cy>=39&&cy<=40;
const OW_KIND=[['wild',24],['forest',15],['village',22],['ruins',12],['grave',10],['camp',12],['rock',5]];
const FIRE_A=['Krähen','Asche','Nebel','Wolfs','Toten','Stern','Wind','Grau','Dorn','Raben','Glut','Stein','Mond','Eisen','Kalt','Dunkel'],FIRE_B=['fels','hain','rast','feld','kamm','horst','furt','wacht','grat','senke'];
const TRADERS=[['Bertrun','„Was du nicht tragen kannst, kauf ich dir ab.“'],['Halmar','„Die Brücken halten. Meistens.“'],['Ysolde','„Klingen aus den Ruinen, kaum benutzt.“'],['Gerwin','„Glut gegen Ware, so war es immer.“'],
  ['Mira','„Hier oben kommt selten jemand lebend an.“'],['Oswin','„Ich hab gesehen, was in den Dörfern haust.“'],['Tilda','„Feuer brennt, Gold glänzt, ich handle.“'],['Brannoc','„Kauf, bevor die Krähen es holen.“']];
function islandOf(cx,cy){if(cx<2||cy<2||cx>=WS/CH-2||cy>=WS/CH-2)return null;
  if(cx===39&&cy===39)return{x:HOX+22.5,y:HOY+22.5,r:13,kind:'home',cx,cy,dist:0};if(cx===41&&cy===39)return{x:HOX+61.5,y:HOY+22.5,r:12,kind:'home',cx,cy,dist:1};if(isHomeC(cx,cy))return null;
  {const wi=wbChunks().get(cx+','+cy);if(wi!=null)return{x:cx*CH+16.5,y:cy*CH+16.5,r:12,kind:'boss',wb:wi,cx,cy,dist:Math.hypot(cx-40,cy-39.5)}}
  {const B=bigIsland(cx,cy);if(B)return B}
  if(hsh(cx,cy,1)>.84)return null;
  const x=cx*CH+16+Math.round((hsh(cx,cy,2)-.5)*8)+.5,y=cy*CH+16+Math.round((hsh(cx,cy,3)-.5)*8)+.5,r=8+Math.floor(hsh(cx,cy,4)*3.99),dist=Math.hypot(cx-40,cy-39.5);
  let k=hsh(cx,cy,5)*100,kind='wild';for(const[n,w]of OW_KIND){if(k<w){kind=n;break}k-=w}
  if(dist<2.6&&kind!=='camp'&&kind!=='rock')kind=hsh(cx,cy,6)<.6?'wild':'camp';
  return{x,y,r,kind,cx,cy,dist}}
const primLink=(cx,cy)=>{const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>islandOf(cx+dx,cy+dy));return o.length?o[Math.floor(hsh(cx,cy,9)*o.length)]:null};
function linkOn(ax,ay,bx,by){const A=islandOf(ax,ay),B=islandOf(bx,by);if(!A||!B||sameIsl(A,B))return false;if(A.kind==='home'||B.kind==='home')return true;
  if(hsh(ax,ay,bx===ax?8:7)<.6)return true;const pa=primLink(ax,ay),pb=primLink(bx,by);return!!(pa&&pa[0]===bx-ax&&pa[1]===by-ay)||!!(pb&&pb[0]===ax-bx&&pb[1]===ay-by)}
const lvlAt=(x,y)=>1+Math.floor(Math.hypot(x/CH-40,y/CH-39.5)*1.7);
function genWorld(){const w=WS,h=WS,m={kind:'town',world:true,floor:0,w,h,t:new Uint8Array(w*h),under:new Uint8Array(w*h),explored:new Uint8Array(w*h),enemies:[],items:[],objs:[],props:[],deco:[],blocks:[],crit:[],
    gen:new Set(),cdata:new Map(),bblocks:new Map(),active:new Set(),ac:null};
  const home=genTown();for(let j=0;j<home.h;j++)for(let i=0;i<home.w;i++){const k=(HOY+j)*w+HOX+i;m.t[k]=home.t[j*home.w+i];m.under[k]=home.under[j*home.w+i]}
  const sh=o=>{o.x+=HOX;o.y+=HOY;return o};
  m.home={objs:home.objs.map(sh),props:(home.props||[]).map(sh),deco:home.deco.map(sh),blocks:home.blocks.map(b=>({...b,i:b.i+HOX,j:b.j+HOY})),crit:home.crit.map(c=>{sh(c);c.cx=HOX+22.5;c.cy=HOY+22.5;return c})};
  m.tower={x:home.tower.x+HOX,y:home.tower.y+HOY};m.arena={...home.arena,x:home.arena.x+HOX,y:home.arena.y+HOY};m.start={x:home.start.x+HOX,y:home.start.y+HOY};m.clouds=home.clouds;
  for(let cy=39;cy<=40;cy++)for(let cx=39;cx<=41;cx++)m.gen.add(cx+','+cy);
  return m}
function owIsland(m,cx,cy){const key=cx+','+cy;if(m.gen.has(key))return;m.gen.add(key);const I=islandOf(cx,cy);if(!I||I.kind==='home')return;
  if(I.big){const k0=I.cx+','+I.cy+'#big';if(m.gen.has(k0))return;m.gen.add(k0)}
  const ph=hsh(I.cx,I.cy,10)*6.28,{x,y,r}=I,sx=I.sx||1,sy=I.sy||1,stoneR=I.kind==='boss'?r*.72:I.kind==='village'||I.kind==='ruins'?r*.62:I.kind==='camp'?r*.4:0;
  for(let j=Math.floor(y-r*sy-3);j<=y+r*sy+3;j++)for(let i=Math.floor(x-r*sx-3);i<=x+r*sx+3;i++){const dx=(i+.5-x)/sx,dy=(j+.5-y)/sy,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),rr=r+Math.sin(a*3+ph)*1.2+Math.sin(a*7+ph*2)*.5+(I.big==='mega'?Math.sin(a*2+ph*3)*1.6:0);
    if(d<rr){const k=j*m.w+i;if(I.big&&m.t[k])continue;m.t[k]=d<stoneR+Math.sin(a*5+ph)*1.2?7:4;m.under[k]=0}}}
function owBridge(m,ax,ay,bx,by){const key='b'+ax+','+ay+'>'+bx+','+by;if(m.gen.has(key))return;m.gen.add(key);if(!linkOn(ax,ay,bx,by))return;
  owIsland(m,ax,ay);owIsland(m,bx,by);const A=islandOf(ax,ay),B=islandOf(bx,by),W=m.w,t=m.t;
  const bk=bridgeKind(ax,ay,bx,by),hor=by===ay,wd=bk==='wood'?2:3;if(!m.bw)m.bw=new Map();
  const put=(i,j,par,q)=>{const k=j*W+i;if(t[k])return;
    if(bk==='land'){t[k]=4;m.under[k]=0;return}
    if(bk==='wood')m.bw.set(k,hor?1:2);
    if(par){t[k]=9;m.under[k]=8;if(bk==='wood'&&q%2)return;const ck=Math.floor(i/CH)+','+Math.floor(j/CH);if(!m.bblocks.has(ck))m.bblocks.set(ck,[]);
      m.bblocks.get(ck).push(bk==='wood'?{i,j,k:'ropepost',v:hor?0:1}:{i,j,k:'parapet',v:hsh(i,j,11)<.2?2:hsh(i,j,12)<.5?0:1})}else{t[k]=8;m.under[k]=0}};
  // a land bridge wanders and swells a little; it has no railing
  const wob=q=>bk==='land'?Math.round(Math.sin(q*.35+hsh(ax,ay,44)*6)*1.4):0,ext=q=>bk==='land'&&Math.sin(q*.6+hsh(bx,by,45)*6)>.55?1:0;
  if(hor){const row=Math.round((A.y+B.y)/2)-1;for(let i=Math.floor(A.x);i<=Math.ceil(B.x);i++){const o=wob(i);for(let j=row+o-ext(i);j<row+o+wd+ext(i+3);j++)put(i,j,false);if(bk!=='land'){put(i,row-1,true,i);put(i,row+wd,true,i)}}}
  else{const col=Math.round((A.x+B.x)/2)-1;for(let j=Math.floor(A.y);j<=Math.ceil(B.y);j++){const o=wob(j);for(let i=col+o-ext(j);i<col+o+wd+ext(j+3);i++)put(i,j,false);if(bk!=='land'){put(col-1,j,true,j);put(col+wd,j,true,j)}}}}
function owContent(m,cx,cy){const c={objs:[],props:[],deco:[],blocks:[],crit:[],spawn:[],lvl:1},I=islandOf(cx,cy);if(!I||I.kind==='home')return c;
  const Rg=mulberry(Math.floor(hsh(cx,cy,20)*1e9)),rr=(a,b)=>a+Rg()*(b-a),ri=(a,b)=>Math.floor(rr(a,b+1)),pk=a=>a[Math.floor(Rg()*a.length)],W=m.w,t=m.t,T=(i,j)=>t[j*W+i];
  c.lvl=lvlAt(I.x,I.y);const fe=Math.max(1,Math.round(I.dist*.9)),lead=!I.big||(cx===I.cx&&cy===I.cy),SX=I.sx||1,SY=I.sy||1;
  // keep roads from every bridge to the middle clear of anything solid
  const roads=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>dx>0||dy>0?linkOn(cx,cy,cx+dx,cy+dy):linkOn(cx+dx,cy+dy,cx,cy));
  // on a great island every bridge of every chunk gets a lane: along its row to the middle, then across to the centre
  const lanes=[];if(I.big)for(const[a,b]of I.chunks)for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const on=dx>0||dy>0?linkOn(a,b,a+dx,b+dy):linkOn(a+dx,b+dy,a,b);if(!on)continue;const N=islandOf(a+dx,b+dy);if(!N)continue;
    if(dx){const r0=Math.round((I.y+N.y)/2)-1+1.5;lanes.push([dx,0,r0])}else{const c0=Math.round((I.x+N.x)/2)-1+1.5;lanes.push([0,dy,c0])}}
  const onRoad=(i,j)=>{const x=i+.5-I.x,y=j+.5-I.y;if(Math.hypot(x,y)<3)return true;
    if(I.big){for(const[dx,dy,l]of lanes){if(dx){const ly=l-I.y;if(Math.sign(x)===dx&&Math.abs(j+.5-l)<2.6)return true;if(Math.abs(x)<2.6&&(Math.sign(y)===Math.sign(ly)&&Math.abs(y)<=Math.abs(ly)+1))return true}
      else{const lx=l-I.x;if(Math.sign(y)===dy&&Math.abs(i+.5-l)<2.6)return true;if(Math.abs(y)<2.6&&(Math.sign(x)===Math.sign(lx)&&Math.abs(x)<=Math.abs(lx)+1))return true}}return false}
    for(const[dx,dy]of roads){if(dx&&Math.sign(x)===dx&&Math.abs(y)<2.6)return true;if(dy&&Math.sign(y)===dy&&Math.abs(x)<2.6)return true}return false};
  const spot=(minR=0,maxR=I.r-1,ok=v=>v===4||v===7)=>{for(let k=0;k<30;k++){const a=rr(0,6.28),r=rr(minR,maxR),i=Math.floor(I.x+Math.cos(a)*r*SX),j=Math.floor(I.y+Math.sin(a)*r*SY);if(ok(T(i,j)))return[i,j]}return null};
  const block=(k,minR,maxR,o={})=>{for(let tr=0;tr<12;tr++){const p=spot(minR,maxR);if(!p)return null;const[i,j]=p,big=o.big;const cells=big?[[0,0],[1,0],[0,1],[1,1]]:[[0,0]];
      if(cells.some(([a,b])=>{const v=T(i+a,j+b);return(v!==4&&v!==7)||onRoad(i+a,j+b)}))continue;for(const[a,b]of cells){const kk=(j+b)*W+i+a;m.under[kk]=t[kk];t[kk]=9}
      const L=SPR.prop[k];const B={i,j,k,v:o.v!=null?o.v:ri(0,(L?L.length:1)-1),big};c.blocks.push(B);return B}return null};
  const flat=(k,n,minR=0,maxR=I.r-1)=>{for(let q=0;q<n;q++){const p=spot(minR,maxR);if(p)c.deco.push({k,x:p[0]+rr(.1,.9),y:p[1]+rr(.1,.9),v:ri(0,SPR.deco[k].length-1)})}};
  const prop=(k,x,y,o={})=>c.props.push(Object.assign({k,x,y,ph:rr(0,6),v:0},o));
  const rock=n=>{for(let q=0;q<n;q++){const p=spot(I.r*.5,I.r-1.5);if(p&&!onRoad(p[0],p[1])&&T(p[0],p[1])===4){const kk=p[1]*W+p[0];t[kk]=3}}};
  const spawn=(bases,n,champ=0)=>{const VP=varPool(fe).filter(([id])=>bases.includes(VAR[id].base));if(!VP.length)return;const mix=[wpick(VP),wpick(VP),wpick(VP)];
    const cr=Rg()<champ;for(let q=0;q<n;q++){const p=spot(1.5,I.r-1.5);if(p)c.spawn.push({vid:cr&&q<3?mix[0]:pk(mix),x:p[0]+.5,y:p[1]+.5,rank:cr&&q<3?'champ':(q===0&&Rg()<champ*.4?'unique':'normal')})}};
  const shrine=()=>{if(!lead){c.fa=0;return}const fb=pk(FIRE_B),name='Leuchtfeuer '+(['rast','furt','wacht','senke'].includes(fb)?'an der ':'am ')+pk(FIRE_A)+fb,a=c.fa=rr(0,6.28),i=Math.floor(I.x+Math.cos(a)*2.2),j=Math.floor(I.y+Math.sin(a)*2.2);c.objs.push({type:'shrine',ow:true,key:cx+','+cy,name,x:i+.5,y:j+.5})};
  const ALL=['skel','archer','ghoul','spider','cult','wraith','golem','scorp','dragon'];
  if(I.kind==='wild'){flat('tuft',26);flat('flowers',10);flat('pebbles',6);flat('shrooms',3);for(let q=ri(3,7);q--;)block('tree',I.r*.55,I.r-1,{v:ri(0,1)});rock(ri(1,3));spawn(ALL,ri(3,6),.15)}
  if(I.kind==='forest'){flat('tuft',14);flat('leaves',10);flat('moss',6);flat('shrooms',6);for(let q=ri(12,20);q--;)block('tree',1.5,I.r-1,{v:ri(0,2)});spawn(['spider','scorp','ghoul'],ri(4,8),.2)}
  if(I.kind==='village'){flat('rubble',12);flat('blood',6);flat('bones',5);flat('smear',3);flat('tuft',8,I.r*.6);
    for(let q=ri(3,5);q--;){const B=block('ruinhouse',2.5,I.r*.75,{big:true,v:ri(0,1)});if(B&&Rg()<.8)prop('fire',B.i+1,B.j+1,{h:16+rr(0,10),s:rr(1,1.5)})}
    for(let q=ri(3,6);q--;){const p=spot(1,I.r-1);if(p)prop('fire',p[0]+.5,p[1]+.5,{s:rr(.6,1.1)})}for(let q=ri(2,4);q--;)block(pk(['barrel','crate']),2,I.r-1);
    for(let q=ri(1,2);q--;){const p=spot(1,I.r*.6);if(p)c.objs.push({type:'chest',x:p[0]+.5,y:p[1]+.5,open:false})}spawn(ALL,ri(6,10),.35)}
  if(I.kind==='ruins'){flat('moss',8);flat('rubble',10);flat('bones',4);flat('pebbles',6);for(let q=ri(5,9);q--;)block(pk(['menhir','menhir','ringwall']),2.5,I.r-1);if(Rg()<.6)block('statue',3,I.r-2);
    if(Rg()<.45)shrine();spawn(['skel','archer','wraith','golem'],ri(4,8),.25)}
  if(I.kind==='grave'){flat('bones',8);flat('skull',4);flat('moss',6);flat('tuft',8);for(let q=ri(9,15);q--;)block('grave',2,I.r-1);for(let q=ri(1,3);q--;)block('tree',I.r*.5,I.r-1,{v:2});if(lead)prop('fog',I.x,I.y,{r:I.r*Math.max(SX,SY)});
    spawn(['skel','archer','ghoul','wraith','cult'],ri(5,8),.25)}
  if(I.kind==='camp'){flat('straw',6);flat('flowers',8);flat('tuft',12);for(let q=ri(1,3);q--;)block('house',3,I.r-1.5,{big:true});for(let q=ri(2,3);q--;)block('tent',2.5,I.r-1);for(let q=ri(1,3);q--;)block(pk(['barrel','crate']),2,I.r-1);
    shrine();if(lead&&Rg()<.8){const[nm,qt]=pk(TRADERS),a=c.fa+Math.PI+rr(-.7,.7),tx=Math.floor(I.x+Math.cos(a)*3.6)+.5,ty=Math.floor(I.y+Math.sin(a)*3.6)+.5;c.objs.push({type:'merchant',name:trName(tx,ty),quote:qt,lvl:c.lvl,x:tx,y:ty})}
    const p=spot(3,5);if(p)prop('fire',p[0]+.5,p[1]+.5,{s:.8})}
  if(I.kind==='boss'){const b=WB[I.wb];flat('bones',10);flat('skull',5);flat('blood',6);flat('rubble',6);
    for(let q=0;q<12;q++){const a=q/12*6.283+.26,i=Math.floor(I.x+Math.cos(a)*(I.r-2.5)),j=Math.floor(I.y+Math.sin(a)*(I.r-2.5));if(!onRoad(i,j)&&(T(i,j)===4||T(i,j)===7)){const kk=j*W+i;m.under[kk]=t[kk];t[kk]=9;c.blocks.push({i,j,k:'menhir',v:q%2})}}
    for(let q=0;q<6;q++){const a=q/6*6.283;prop('fire',I.x+Math.cos(a)*(I.r-5),I.y+Math.sin(a)*(I.r-5),{s:1.1})}
    // a bonfire at the gate, so a lost fight is never far away
    const g=roads[0]||[1,0];c.objs.push({type:'shrine',ow:true,key:cx+','+cy,name:'Leuchtfeuer vor '+b.short,x:Math.floor(I.x+g[0]*(I.r-1.5))+.5,y:Math.floor(I.y+g[1]*(I.r-1.5))+.5});
    c.boss=I.wb;spawn(b.min,ri(2,4),.3)}
  if(I.kind==='rock'){flat('pebbles',8);flat('tuft',4);rock(ri(2,5));if(Rg()<.3){const p=spot(0,3);if(p)c.objs.push({type:'chest',x:p[0]+.5,y:p[1]+.5,open:false})}}
  return c}
function owSpawn(m,key){const c=m.cdata.get(key);if(!c)return;const prev=G.mlvl;G.mlvl=c.lvl;
  if(c.boss!=null&&!G.owBoss[WB[c.boss].id]){const p=wbPos(WB[c.boss]),e=makeWBoss(c.boss,p.x,p.y);e.ck=key;m.enemies.push(e)}
  if(c.spawn.length&&!G.owClear.has(key)){const pack=[];for(const s of c.spawn){if(!free(s.x,s.y,.35))continue;const e=makeEnemy(s.vid,s.x,s.y,s.rank);e.ck=key;e.pack=pack;pack.push(e);m.enemies.push(e)}}G.mlvl=prev}
// the islands stay awake around every hero who needs them; online, the host keeps the friends' corners alive too
let owCentres=(cx,cy)=>[[cx,cy]];
function owTick(){const m=G.map;if(!m||!m.world)return;const cx=Math.floor(P.x/CH),cy=Math.floor(P.y/CH),k=cx+','+cy,cs=owCentres(cx,cy),sig=cs.join('|');if(m.ac===sig)return;const mine=!m.ac||m.ac.split('|')[0]!==k;m.ac=sig;
  if(mine){const I=islandOf(cx,cy),nm=!I||I.kind==='home'?'Der Hügel':I.kind==='boss'?'Revier: '+WB[I.wb].n:({wild:'Wilde Insel',forest:'Waldinsel',village:'Brennendes Dorf',ruins:'Ruinen',grave:'Gräberinsel',camp:'Lager',rock:'Felsinsel'})[I.kind]+' · Stufe '+lvlAt(I.x,I.y);$('floorName').textContent=nm;if(I&&I.kind!=='home'&&!G.owSeen.has(k)){G.owSeen.add(k);if(I.kind==='boss'&&!G.owBoss[WB[I.wb].id])log('Du betrittst das Revier von '+WB[I.wb].n+'.','#ff8a6a')}}
  for(const[ox,oy]of cs)for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)owIsland(m,ox+dx,oy+dy);
  const want=new Set();for(const[ox,oy]of cs)for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const a=ox+dx,b=oy+dy;owBridge(m,a,b,a+1,b);owBridge(m,a,b,a,b+1);owBridge(m,a-1,b,a,b);owBridge(m,a,b-1,a,b);want.add(a+','+b)}
  for(const key of want)if(!m.cdata.has(key)){const[a,b]=key.split(',').map(Number);m.cdata.set(key,owContent(m,a,b))}
  for(const key of m.active)if(!want.has(key))m.enemies=m.enemies.filter(e=>e.ck!==key);
  for(const key of want)if(!m.active.has(key))owSpawn(m,key);
  m.active=want;const L=[...want].map(q=>m.cdata.get(q)),H=m.home;
  m.objs=[...H.objs,...L.flatMap(q=>q.objs)];m.props=[...H.props,...L.flatMap(q=>q.props)];m.deco=[...H.deco,...L.flatMap(q=>q.deco)];m.crit=[...H.crit,...L.flatMap(q=>q.crit)];
  m.blocks=[...H.blocks,...L.flatMap(q=>q.blocks),...[...want].flatMap(q=>m.bblocks.get(q)||[])]}
function owRestart(){const m=G.map;if(!m||!m.world)return;m.enemies=m.enemies.filter(e=>!e.ck);m.active=new Set();m.ac=null;owTick()}
function nearWalk(x,y){for(let r=0;r<6;r+=.5)for(let a=0;a<6.28;a+=.5){const nx=x+Math.cos(a)*r,ny=y+Math.sin(a)*r;if(free(nx,ny,.3))return[nx,ny]}return[x,y]}
function owTravel(key){const f=key==='home'?null:G.owFires[key];closeDialog();if(G.floor!==0)enterFloor(0);const m=G.map;
  if(f){const[x,y]=nearWalk(f.x+1,f.y+1);P.x=x;P.y=y}else{P.x=m.start.x;P.y=m.start.y}P.path=[];camX=P.x;camY=P.y;owRestart();sample('portal',.6,{rate:1});banner(f?f.name:'Der Hügel','',undefined,1800)}
function stockFor(o){if(o.stock)return o.stock;const lv=Math.max(1,o.lvl||P.lvl),R0=R;R=mulberry(Math.floor(Math.random()*1e9));o.stock=[];for(let k=0;k<6;k++)o.stock.push(makeItem(lv,{rarity:Math.random()<.03?'rare':Math.random()<.3?'magic':'normal'}));R=R0;return o.stock}

