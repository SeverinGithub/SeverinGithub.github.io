/* ---------- the hill as a village: a planned place round the tower instead of stations dropped on the grass.
   A paved ring runs round the tower; roads lead from it to every bridge, to the square before the gate and into each quarter.
   Square: bonfire in a ring of stones, well, chest, benches, banners. Market: Odalinde and Brannoc. Workshop: anvil, glyph table and
   grindstone under one lean-to. Eldrik in his corner by the west road, the yard behind the north road, a walled graveyard for the heroes
   that were let go, a wooden deck over the edge. Signposts, lanterns along the roads, hedges, gate walls at the bridge heads.
   A few villagers walk their rounds, and with every fallen guardian of the deep the hill grows ---------- */
const HVC=22.5,HVD=Math.PI/180,HVGK=SAVEKEY+'-graves';
// the yard keeps its own corner: its stray lamps, flowers and the second flock of hens give way to the plan
YDLAY.hay=YDLAY.hay.slice(0,3);YDLAY.lamp=[[30.4,15.8]];YDLAY.flower=[[24.6,11.9],[29.6,12.4]];YDLAY.hens=YDLAY.hens.slice(0,3);
PLIGHT.hvlamp={r:150,a:.75,col:'255,190,110',f:4,h:44};PLIGHT.hvwatch={r:170,a:.8,col:'255,140,60',f:7,h:96};
const hvGrow=()=>Math.min(8,Object.values(G.bossDead||{}).filter(Boolean).length);
const HVGROW=['','Am Markt steht ein Händlerzelt.','Ein neues Haus steht am Dorfplatz.','Mehr Laternen säumen die Wege, und eine Wache zieht auf.','Noch ein Haus, hinter dem Turm.',
  'Am Brückentor zur Arena steht jetzt ein Wachturm.','Eine Gärtnerin pflegt die Beete, und ein drittes Haus steht.','Wimpel flattern über dem Dorfplatz.','Der Hügel ist ein Dorf geworden: Banner an jedem Brückentor.'];
// the graveyard remembers heroes that were deleted from the list
function hvGraves(){try{return JSON.parse(localStorage.getItem(HVGK)||'[]')}catch(e){return[]}}
const _hPutHV=hPut;hPut=function(a){try{const ids=new Set(a.map(x=>x.id)),gone=hAll().filter(x=>!ids.has(x.id));
    if(gone.length){const g=hvGraves();for(const h of gone)g.push({n:hName(h),c:(CLS[h.cls]||{n:'Held'}).n,l:h.lvl||1,t:Date.now()});localStorage.setItem(HVGK,JSON.stringify(g.slice(-12)))}}catch(e){}
  return _hPutHV(a)};
const HVRIP=['Aldric · der erste Wächter des Turms','Mira · kam bis Ebene 9','Bertold · Schmied vor Brannoc','Isolde · sie ging hinab und kam nicht wieder','Ein Namenloser · der Turm nahm ihn'];

function hvEdge(m,a){const c=Math.cos(a*HVD),s=Math.sin(a*HVD);let r=3;
  while(r<24){const t=m.t[Math.floor(HOY+HVC+s*r)*m.w+Math.floor(HOX+HVC+c*r)];if(!t||t===8)break;r+=.2}return r}
function hvUndo(m){const H=m.home;if(H.hvU)for(let k=H.hvU.length-1;k>=0;k--){const[i,t,u]=H.hvU[k];m.t[i]=t;m.under[i]=u}H.hvU=null;
  H.blocks=H.blocks.filter(b=>!b.hv);H.props=H.props.filter(p=>!p.hv)}
// bridges that land on the hill, one head each: the middle of their last tiles
function hvHeads(m){const out=[];for(let j=HOY-4;j<HOY+50;j++)for(let i=HOX-4;i<HOX+50;i++){if(m.t[j*m.w+i]!==8||hyp(i+.5-HOX-HVC,j+.5-HOY-HVC)>20)continue;
    if(![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>m.t[(j+b)*m.w+i+a]===4))continue;const x=i+.5-HOX,y=j+.5-HOY,c=out.find(h=>hyp(h.x-x,h.y-y)<3.5);
    if(c){c.n++;c.sx+=x;c.sy+=y;c.x=c.sx/c.n;c.y=c.sy/c.n}else out.push({x,y,sx:x,sy:y,n:1})}
  for(const h of out){const d=hyp(h.x-HVC,h.y-HVC);h.x-=(h.x-HVC)/d*.6;h.y-=(h.y-HVC)/d*.6;h.a=Math.atan2(h.y-HVC,h.x-HVC)/HVD}return out}

function hvBuild(m){const H=m.home;hvUndo(m);
  // every home bridge is laid before the roads look for them, wherever the hero stands
  for(let cy=37;cy<=42;cy++)for(let cx=37;cx<=43;cx++){owBridge(m,cx,cy,cx+1,cy);owBridge(m,cx,cy,cx,cy+1)}
  const g=H.hvG=hvGrow(),U=H.hvU=[],W0=m.w,T=(x,y)=>m.t[(HOY+Math.floor(y))*W0+HOX+Math.floor(x)],R0=mulberry(G.seed*17+3),rr=(a,b)=>a+R0()*(b-a);
  const setT=(x,y,t,u)=>{const k=(HOY+Math.floor(y))*W0+HOX+Math.floor(x);U.push([k,m.t[k],m.under[k]]);m.t[k]=t;if(u!=null)m.under[k]=u};
  const pl=(a,r,mg=1.8)=>{r=Math.min(r,hvEdge(m,a)-mg);return[HVC+Math.cos(a*HVD)*r,HVC+Math.sin(a*HVD)*r]},add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
  const pol=(c,a,r)=>[c[0]+Math.cos(a*HVD)*r,c[1]+Math.sin(a*HVD)*r],ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0])/HVD;
  const bez=(a,c,b,n=12)=>Array.from({length:n+1},(_,k)=>{const t=k/n,u=1-t;return[u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]]});
  const occ=[],isFree=(x,y,r)=>occ.every(o=>hyp(o[0]-x,o[1]-y)>r+o[2]),take=(x,y,r)=>occ.push([x,y,r]);
  const roads=H.hvR=[],road=(pts,w)=>{roads.push({pts,w});for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],n=Math.ceil(hyp(b[0]-a[0],b[1]-a[1])/.2);
      for(let q=0;q<=n;q++){const x=a[0]+(b[0]-a[0])*q/n,y=a[1]+(b[1]-a[1])*q/n;for(let j=Math.floor(y-w);j<=y+w;j++)for(let i=Math.floor(x-w);i<=x+w;i++){
        if(hyp(i+.5-x,j+.5-y)>w/2||hyp(i+.5-HVC,j+.5-HVC)>19)continue;const t=T(i,j);if(t===4||t===3)setT(i,j,7)}}}};
  const blk=(x,y,k,v=0,ok=[4])=>{const i=Math.floor(x),j=Math.floor(y);if(!ok.includes(T(i,j)))return null;setT(i,j,9,T(i,j));const B={i:HOX+i,j:HOY+j,k,v,hv:1};H.blocks.push(B);take(i+.5,j+.5,.5);return B};
  const big=(x,y,k,v=0)=>{const i=Math.floor(x),j=Math.floor(y);for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]])if(T(i+a,j+b)!==4)return null;
    for(const[a,b]of[[0,0],[1,0],[0,1],[1,1]])setT(i+a,j+b,9,4);H.blocks.push({i:HOX+i,j:HOY+j,k,v,big:true,hv:1});take(i+1,j+1,1.4);return 1};
  const prop=(k,x,y,o={})=>{const p=Object.assign({k,x:HOX+x,y:HOY+y,ph:rr(0,6),hv:1},o);H.props.push(p);return p};
  const solid=(x,y)=>{const t=T(x,y);if(t===4||t===7)setT(x,y,9,t)};
  // stray rocks on the hill go; the hill is tended
  for(let j=0;j<44;j++)for(let i=0;i<44;i++)if(T(i,j)===3&&hyp(i+.5-HVC,j+.5-HVC)<15)setT(i,j,4);
  const heads=hvHeads(m),arena=heads.find(h=>h.x>33&&Math.abs(h.y-22.5)<4);
  // the square before the gate and the stations in their quarters
  const Q=pl(45,8,4.6),door=[24.3,24.3],S={};S.shrine=Q;S.stash=pol(Q,8,2.3);S.merchant=pl(14,10.6,2.4);S.smith=pl(27,11.8,2.2);S.riftstone=pl(-14,11,1.8);
  const WC=pl(102,9.6,3),WT=[-Math.sin(102*HVD),Math.cos(102*HVD)],WR=[Math.cos(102*HVD),Math.sin(102*HVD)],wv=(t,r)=>[WC[0]+WT[0]*t+WR[0]*r,WC[1]+WT[1]*t+WR[1]*r];
  S.anvil=wv(1.7,0);S.enchant=wv(0,.1);S.grind=wv(-1.7,0);S.chronist=pl(165,8.2,3);
  const GY=pl(135,10.6,2.6),deckA=[38,45,52,30,60].find(a=>!heads.some(h=>Math.abs(((h.a-a+540)%360)-180)<22))??45,deckE=hvEdge(m,deckA);
  H.hvS={};for(const k in S)H.hvS[k]=[HOX+S[k][0],HOY+S[k][1]];for(const k in S)take(S[k][0],S[k][1],k==='shrine'?1.2:1);take(door[0],door[1],1);
  for(const o of H.objs)o.hvp=0;m.start={x:HOX+Q[0]+1.6,y:HOY+Q[1]+2.1};
  // roads: the ring, the gate road, a spoke to every bridge, the lanes into the quarters
  const ring=Array.from({length:49},(_,k)=>pol([HVC,HVC],k/48*360,4.7));road(ring,1.3);
  road([door,Q],1.8);road(Array.from({length:17},(_,k)=>pol(Q,k/16*360,2.9)).concat([Q]),1.6);
  for(let r=0;r<2.9;r+=.5)road(Array.from({length:17},(_,k)=>pol(Q,k/16*360,r)),1.2);
  for(const h of heads){const a0=pol([HVC,HVC],h.a,4.7),mid=pol([HVC,HVC],h.a,(4.7+hyp(h.x-HVC,h.y-HVC))/2);road(bez(a0,add(mid,[Math.sin(h.a*3)*.6,Math.cos(h.a*2)*.6]),[h.x,h.y]),2.0)}
  const mk=[pol([HVC,HVC],0,8)[0],HVC+.2];road(bez(mk,[30.2,25.4],add(Q,[.9,-1.6])),1.4);
  const wl=[add(Q,[-1.7,1.9]),wv(-2.2,1.5),wv(2.8,1.6)];road(bez(wl[0],add(wv(-3.2,1.6),[.4,.5]),wl[1],8).concat([wl[2]]),1.4);
  const GG=pol(GY,ang(GY,wl[2]),2.1);road([wl[2],GG],1.2);
  const west=heads.find(h=>Math.abs(((h.a-190+540)%360)-180)<35),ef=add(S.chronist,[1.3,1.1]);
  if(west)road(bez(pol([HVC,HVC],west.a,7),add(pol([HVC,HVC],west.a,7.2),[.8,1.6]),ef,6),1.3);else road([pol([HVC,HVC],165,4.7),ef],1.3);
  for(let r=0;r<1.3;r+=.5)road(Array.from({length:13},(_,k)=>pol(ef,k/12*360,r)),1.1);
  const deckIn=pol([HVC,HVC],deckA,deckE-.6);road([add(Q,pol([0,0],deckA,2)),deckIn],1.5);
  road([pol([HVC,HVC],-62,4.7),[25.6,16.9]],1.2);road([S.riftstone,pol([HVC,HVC],-14,7.6)],1.2);
  // the deck over the edge: wooden planks on the void, a bench and a spyglass
  const ei=Math.floor(deckIn[0]+Math.cos(deckA*HVD)),ej=Math.floor(deckIn[1]+Math.sin(deckA*HVD));if(!m.bw)m.bw=new Map();H.hvDeck=[];
  for(let j=ej-1;j<=ej+2;j++)for(let i=ei-1;i<=ei+2;i++)if(!T(i,j)){const k=(HOY+j)*W0+HOX+i;setT(i,j,8,8);m.bw.set(k,1);H.hvDeck.push(k)}
  const dc=pol([HVC,HVC],deckA,deckE+1.1);prop('hvtele',...pol(dc,deckA,.9));prop('hvbench',...pol(dc,deckA+90,.9),{a:deckA+90});prop('hvlamp',...pol(dc,deckA-90,1.1));
  for(const s of[-1,1])for(let k=1;k<4;k++){const a=pol(pol([HVC,HVC],deckA,deckE-k),deckA+90,s*1.3),b=pol(pol([HVC,HVC],deckA,deckE-k-1),deckA+90,s*1.3);
    if(T(a[0],a[1])===4)prop('ydfence',(a[0]+b[0])/2,(a[1]+b[1])/2,{x0:HOX+a[0],y0:HOY+a[1],x1:HOX+b[0],y1:HOY+b[1],end:k===3})}
  // the square: stones round the fire, the well, benches, banners framing the gate road, a signpost
  prop('hvring',Q[0]-.01,Q[1]-.01,{half:0});prop('hvring',Q[0]+.01,Q[1]+.01,{half:1});
  const WL=pol(Q,135,2.4);blk(WL[0],WL[1],'hvwell',0,[4,7]);
  for(const a of[95,-35]){const b=pol(Q,a,2.75);prop('hvbench',b[0],b[1],{a:a+90});take(b[0],b[1],.6)}
  for(const a of[187,263]){const b=pol(Q,a,3.15);prop('hvbanner',b[0],b[1],{v:0});take(b[0],b[1],.4)}
  const sg=pol(Q,70,3.3);prop('hvsign',sg[0],sg[1],{to:[['Turm',door],['Markt',S.merchant],['Werkstatt',S.anvil],['Aussicht',dc]].map(([n,p])=>[n,HOX+p[0],HOY+p[1]])});take(sg[0],sg[1],.5);
  // signposts at the ring where the roads part
  const sign=(a,r,to)=>{const p=pol([HVC,HVC],a,r);if(T(p[0],p[1])!==4)return;prop('hvsign',p[0],p[1],{to:to.map(([n,q])=>[n,HOX+q[0],HOY+q[1]])});take(p[0],p[1],.5)};
  for(const h of heads){const to=h===arena?[['Arena',[h.x,h.y]],['Markt',S.merchant]]:[['Zu den Inseln',[h.x,h.y]]];if(west&&h===west)to.push(['Eldrik',S.chronist],['Friedhof',GY]);
    if(Math.abs(((h.a+90+540)%360)-180)<40)to.push(['Übungsplatz',[26.5,14.5]]);sign(h.a+16,6.6,to);
    // a bridge gate: a short wall to each side and a lamp
    const hd=hyp(h.x-HVC,h.y-HVC);for(const s of[-1,1]){const p=pol(pol([HVC,HVC],h.a,hd-.5),h.a+90,s*1.75);blk(p[0],p[1],'hvwall',s>0?1:0)}
    const lp=pol(pol([HVC,HVC],h.a,hd-1.6),h.a-90,1.9);if(T(lp[0],lp[1])===4)prop('hvlamp',lp[0],lp[1]);if(g>=8){const bp=pol(pol([HVC,HVC],h.a,hd-1.4),h.a+90,1.9);if(T(bp[0],bp[1])===4)prop('hvbanner',bp[0],bp[1],{v:1})}}
  // the workshop: one lean-to over all three, tools on the back wall, wood and coal behind
  prop('hvroof',...wv(0,-1.05),{t:WT,r:WR});for(const s of[-1,1]){solid(...wv(s*3,-1.3))}
  prop('hvwood',...wv(1.4,-2.4));prop('hvcoal',...wv(-1.4,-2.4));take(...wv(0,-1.5),2.2);
  // the market: herb beds by Odalinde, barrels and crates, a quench barrel by the smith
  const M=S.merchant;for(const p of[[2.1,.7],[1.5,2.0]])prop('ydflower',M[0]+p[0],M[1]+p[1],{seed:311+p[0]*7|0,pal:YDLAY.pals[(p[1]*3|0)%YDLAY.pals.length]});
  blk(M[0]-.6,M[1]-1.6,'barrel',0);blk(M[0]+.6,M[1]-1.7,'crate',1);blk(S.smith[0]+1.3,S.smith[1]-1.1,'barrel',1);prop('hvcoal',S.smith[0]+1.4,S.smith[1]+.9);
  // Eldrik's corner: book crates, a hedge behind him, a little herb garden
  const E=S.chronist;prop('hvbooks',E[0]+1.6,E[1]-.6);prop('hvbooks',E[0]-.4,E[1]+1.9,{v:1});
  for(let k=-2;k<=1;k++)blk(E[0]-2.2,E[1]+k,'hvhedge',k&1);for(let k=-1;k<=1;k++)blk(E[0]+k,E[1]-2.3,'hvhedge',k&1);
  let hb=0;for(const[a,b]of[[2.8,-1.6],[-1.3,3],[.2,3.4],[-3.4,-.8],[2.6,2.8],[-3.2,1.4]]){const x=E[0]+a,y=E[1]+b;if(hb>1||T(x,y)!==4||hyp(x-GY[0],y-GY[1])<3.4||!isFree(x,y,.6))continue;prop('ydflower',x,y,{seed:521+hb*37,pal:YDLAY.pals[2]});take(x,y,.6);hb++}
  // the graveyard: a low wall with a gate towards the lane, graves inside, one old tree
  const ga=ang(GY,wl[2]);for(let a=0;a<360;a+=30){if(Math.abs(((a+15-ga+540)%360)-180)<20)continue;const p0=pol(GY,a,2.15),p1=pol(GY,a+30,2.15);prop('hvfence',(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,{x0:HOX+p0[0],y0:HOY+p0[1],x1:HOX+p1[0],y1:HOY+p1[1]})}
  prop('hvgate',...pol(GY,ga,2.05),{a:ga+90});const rip=hvGraves().slice(-5).reverse().map(h=>`${h.n} · ${h.c}, Stufe ${h.l}`);let gi=0;
  for(let j=Math.floor(GY[1]-1.5);j<=GY[1]+1.5;j++)for(let i=Math.floor(GY[0]-1.5);i<=GY[0]+1.5;i++){if(hyp(i+.5-GY[0],j+.5-GY[1])>1.45||hyp(i+.5-GG[0],j+.5-GG[1])<1.1)continue;
    if(gi===4){blk(i+.5,j+.5,'tree',2);gi++;continue}if(blk(i+.5,j+.5,'grave',gi%3)){prop('hvrip',i+.5,j+.5,{txt:rip[gi]||HVRIP[gi%HVRIP.length]});gi++}}
  // growth: what the hill gains with every fallen guardian
  if(g>=1){prop('hvbanner',M[0]-1.6,M[1]+.9,{v:2});for(const[a,b]of[[2.6,-1.2],[2.4,1.6],[3,.2],[-1.4,2.6]])if(blk(M[0]+a,M[1]+b,'tent',0)){blk(M[0]+a-.9,M[1]+b-.9,'crate',0);break}}
  const homes=[[62,11.4],[-120,10.4],[215,10.6],[80,12],[-32,11.6],[-150,10.5],[185,11.5],[240,11],[-58,12],[120,12]].map(([a,r])=>pl(a,r,2.6));let hn=g>=6?3:g>=4?2:g>=2?1:0;
  for(const p of homes){if(!hn)break;if(isFree(p[0]+.5,p[1]+.5,1.6)&&big(p[0],p[1],'house',hn&1))hn--}
  // hedges and a fence that make the lanes
  for(let k=0;k<4;k++){const p=wv(-3.4-k*.9,2.7);blk(p[0],p[1],'hvhedge',k&1)}
  // trees on the quiet side of the hill, away from the square so they hide nothing
  for(const p of[pl(-150,10.5,2.5),pl(-118,11,2.5)])if(isFree(p[0],p[1],1))blk(p[0],p[1],'tree',(p[0]|0)%2);
  if(g>=5&&arena){const p=pol(pol([HVC,HVC],arena.a,hyp(arena.x-HVC,arena.y-HVC)-1.8),arena.a+90,2.4);if(T(p[0],p[1])===4){prop('hvwatch',p[0],p[1]);solid(p[0],p[1])}}
  if(g>=7)for(const a of[20,110,200,290]){const p0=pol(Q,a,2.9),p1=pol(Q,a+90,2.9);prop('hvgarl',(p0[0]+p1[0])/2,(p0[1]+p1[1])/2,{x0:HOX+p0[0],y0:HOY+p0[1],x1:HOX+p1[0],y1:HOY+p1[1]})}
  // lanterns along every road
  const step=g>=3?3.4:4.6,lamps=[],lampOk=(x,y)=>lamps.every(l=>hyp(l[0]-x,l[1]-y)>2.4);for(const R of roads){if(R.w<1.3||R.pts===ring)continue;let acc=step*.5,side=1;
    for(let k=0;k<R.pts.length-1;k++){const a=R.pts[k],b=R.pts[k+1],L=hyp(b[0]-a[0],b[1]-a[1]);if(!L)continue;const n=[-(b[1]-a[1])/L,(b[0]-a[0])/L];
      for(let s=0;s<L;s+=.25){if((acc+=.25)<step)continue;const x=a[0]+(b[0]-a[0])*s/L+n[0]*side*(R.w/2+.45),y=a[1]+(b[1]-a[1])*s/L+n[1]*side*(R.w/2+.45);
        if(T(x,y)===4&&isFree(x,y,.9)&&lampOk(x,y)&&hyp(x-HVC,y-HVC)>5.6){prop('hvlamp',x,y);take(x,y,.6);lamps.push([x,y]);acc=0;side=-side}}}}
  for(let k=0;k<8;k++){const p=pol([HVC,HVC],k*45+22,6.2);if(T(p[0],p[1])===4&&isFree(p[0],p[1],1)&&lampOk(p[0],p[1])){prop('hvlamp',p[0],p[1]);lamps.push(p)}}
  // a washing line behind the well, strung across the view so the cloths hang side by side
  for(const a of[128,150,105]){const c=pol(Q,a,4.7),wl0=[c[0]-.85,c[1]+.85],wl1=[c[0]+.85,c[1]-.85];if(T(wl0[0],wl0[1])!==4||T(wl1[0],wl1[1])!==4||!isFree(c[0],c[1],1.1))continue;take(c[0],c[1],1);prop('hvline',(wl0[0]+wl1[0])/2,(wl0[1]+wl1[1])/2,{x0:HOX+wl0[0],y0:HOY+wl0[1],x1:HOX+wl1[0],y1:HOY+wl1[1]});break}
  // the villagers and their rounds
  const fk=(id,route,o={})=>prop('hvfolk',route[0][0],route[0][1],Object.assign({id,route:route.map(p=>[HOX+p[0],HOY+p[1]]),to:1,dir:1,wait:rr(0,3),sp:1.25,pause:4,seed:rr(0,9)},o));
  fk('lehrling',[add(S.smith,[-1.1,.4]),add(Q,[1.1,1.6]),add(wl[0],[.2,.3]),wv(-1.6,1.3),wv(1.7,1)],{loadA:'ore',loadB:null});
  fk('magd',[add(WL,[.9,-.4]),add(Q,[-.4,-1.3]),[30.1,24.2],add(M,[-1.4,.4])],{loadA:'bucket',loadB:'bucket',pause:5});
  fk('kind',Array.from({length:12},(_,k)=>pol(Q,k*30,2.15)),{loop:1,sp:2.2,pause:2.5,run:1});
  if(g>=3&&arena)fk('wache',[pol([HVC,HVC],arena.a,7),[arena.x-1.2,arena.y]],{sp:.8,pause:6,loadA:'spear',loadB:'spear'});
  if(g>=6)fk('gaertnerin',[add(WL,[-.6,.7]),add(Q,[-3.4,1.4]),[19.6,27.4],add(E,[1.6,2.4])],{loadA:'basket',loadB:'basket',pause:6});
  if(g>=8)fk('kind2',Array.from({length:12},(_,k)=>pol(Q,-k*30+15,2.4)),{loop:1,sp:2,pause:3,run:1});
  // the grass stays where nothing stands: no tufts on the stones, no wild flowers among the houses
  const nearP=(x,y)=>H.props.some(p=>p.hv&&hyp(p.x-x,p.y-y)<.7);
  H.deco=H.deco.filter(d=>{const lx=d.x-HOX,ly=d.y-HOY;if(d.k==='arena'||lx>44)return true;const t=T(lx,ly);if(t!==4)return false;
    if(d.k==='flowers'&&hyp(lx-HVC,ly-HVC)<14)return false;return!nearP(d.x,d.y)});
  m.ac=null;owTick()}

function hvTick(dt){const m=G.map;if(!m||!m.world||!m.home||!P||G.state==='title')return;const H=m.home;
  if(H.hvG==null||H.hvG!==hvGrow()){const was=H.hvG;hvBuild(m);if(was!=null&&H.hvG>was){log('Der Hügel wächst: '+HVGROW[H.hvG],'#e8d8b0');banner('Der Hügel wächst',HVGROW[H.hvG],undefined,3200)}}
  let ch=0;for(const o of H.objs){const q=H.hvS[o.type];if(q&&!o.hvp){o.x=q[0];o.y=q[1];o.hvp=1;ch=1}}if(ch){m.ac=null;owTick()}
  if(Math.abs(P.x-HOX-HVC)+Math.abs(P.y-HOY-HVC)>60)return;
  let bs=null,bd=3.6;for(const p of H.props){if(p.k==='hvfolk')hvWalk(p,dt);else if(p.k==='hvsign'){const d=hyp(p.x-P.x,p.y-P.y);if(d<bd){bd=d;bs=p}}}G.hvSign=bs;
  if(H.hvDeck&&!G.hvLook&&H.hvDeck.includes(Math.floor(P.y)*m.w+Math.floor(P.x))){G.hvLook=1;log('Vom Steg aus sieht man weit über die Inseln.','#c8d8e8')}}
const _updForgeHV=updForge;updForge=function(dt){_updForgeHV(dt);if(P&&G.map&&G.state!=='title')hvTick(dt)};

// villagers: walk the route, wait at its ends, chat when someone is near
const HVSAY={lehrling:['Das Erz ist schwer heute.','Brannoc will es heiß.','Noch drei Säcke.'],magd:['Das Wasser ist kalt wie die Tiefe.','Odalinde will frisches Wasser.','Ein schöner Abend.'],
  kind:['Fang mich doch!','Ich werd auch mal Held!','Hast du einen Drachen gesehen?'],kind2:['Wart auf mich!','Hihi!'],wache:['Die Arena ist ruhig.','Halt die Augen offen, Held.'],
  gaertnerin:['Der Salbei wächst gut.','Eldrik mag Kamille.']};
function hvWalk(p,dt){if(p.wait>0){p.wait-=dt;p.mv=false;if(hyp(p.x-P.x,p.y-P.y)<4.5&&Math.random()<dt*.12)ftext(p.x,p.y,pick(HVSAY[p.id]),'#d8ccb0');return}
  const tg=p.route[p.to],dx=tg[0]-p.x,dy=tg[1]-p.y,d=hyp(dx,dy),s=p.sp*dt;p.mv=true;
  if(d<=s){p.x=tg[0];p.y=tg[1];const n=p.route.length;
    if(p.loop){p.to=(p.to+1)%n;if(p.to===1&&Math.random()<.5)p.wait=p.pause}
    else{if(p.to===n-1||p.to===0){p.dir=p.to===0?1:-1;p.wait=p.pause*(.7+Math.random()*.6);p.load=p.to===0?p.loadA:p.loadB}p.to+=p.dir}return}
  p.x+=dx/d*s;p.y+=dy/d*s;p.face=Math.atan2(dy,dx);p.ph=(p.ph||0)+s*2.3}
const hvR=c=>[shade(c,.35),shade(c,.65),c,shade(c,1.3)];
const HVLOOK={lehrling:{n:'Lehrling Tam',skin:'#c8946c',hair:'#4a2c14',torso:'#7a4a2a',legs:'#3a3026',hat:'cap',hatC:'#3a2a1a'},
  magd:{n:'Magd Wilma',skin:'#e0b090',hair:'#a0602a',torso:'#4a6a8a',legs:'#4a6a8a',robe:1,hat:'scarf',hatC:'#e8dcc0'},
  kind:{n:'Pim',skin:'#e8b898',hair:'#d8b060',torso:'#8a3a2a',legs:'#4a3a2a',s:.68},kind2:{n:'Lotte',skin:'#c89070',hair:'#2a1a0e',torso:'#5a7a3a',legs:'#5a7a3a',robe:1,s:.66},
  wache:{n:'Wache Gernot',skin:'#b8845c',hair:'#2a2018',torso:'#5a5a62',legs:'#3a3a42',hat:'helm',hatC:'#8a8c94'},
  gaertnerin:{n:'Gärtnerin Hedda',skin:'#d8a880',hair:'#c8c4bc',torso:'#5a6a3a',legs:'#5a6a3a',robe:1,hat:'wide',hatC:'#c8a860'}};
for(const k in HVLOOK){const L=HVLOOK[k],B=hvR(L.torso),Lg=hvR(L.legs);L.R={skin:hvR(L.skin),torso:B,sleeve:B,fore:B,hand:hvR(L.skin),legs:Lg,shin:Lg,feet:RP.shoe,skirt:L.robe?Lg:null};L.HR=hvR(L.hair);L.CR=L.hatC?hvR(L.hatC):null}
function hvHead(hx,hy,L,f,back){const sk=L.R.skin;
  if(back){blob(hx,hy,4.2,4.8,L.hat==='scarf'||L.hat==='helm'?L.CR:L.HR)}else{blob(hx,hy,4,4.6,sk);blob(hx-f*.9,hy-2.2,4.1,2.8,L.HR);ctx.fillStyle='#1a0e06';ctx.fillRect(hx+f*1.7-.5,hy-.4,1.2,1.3)}
  if(L.hat==='cap'){blob(hx-f*.3,hy-3.2,4.4,2.2,L.CR);ctx.fillStyle=L.hatC;ctx.fillRect(hx+(f>0?1:-5),hy-2.6,4,1.2)}
  else if(L.hat==='scarf'&&!back){blob(hx-f*.6,hy-2.6,4.6,3,L.CR);ctx.fillStyle=L.hatC;ctx.fillRect(hx-f*4-1,hy-1,2,5)}
  else if(L.hat==='helm')blob(hx,hy-2.4,4.6,3.2,L.CR,true);
  else if(L.hat==='wide'){ctx.fillStyle=shade(L.hatC,.8);ctx.beginPath();ctx.ellipse(hx,hy-3,8,2.2,0,0,7);ctx.fill();blob(hx,hy-4.6,3.8,2.6,L.CR)}}
function hvCarry(k,a,f,sx0){ctx.save();
  if(k==='bucket'){const x=a.hx,y=a.hy+1.5;ctx.strokeStyle='#3a2a1a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y+2,3,Math.PI,0);ctx.stroke();ctx.fillStyle='#6a4a2a';ctx.beginPath();ctx.moveTo(x-3.4,y+2);ctx.lineTo(x+3.4,y+2);ctx.lineTo(x+2.6,y+8);ctx.lineTo(x-2.6,y+8);ctx.closePath();ctx.fill();ctx.fillStyle='#3a2a18';ctx.fillRect(x-3.2,y+4,6.4,1)}
  else if(k==='ore'){blob(-f*1.5,-43,6,4.6,hvR('#7a6a4a'));ctx.fillStyle='#5a5a62';ctx.fillRect(-f*1.5-2,-47,2,2);ctx.fillRect(-f*1.5+1,-46,2,2)}
  else if(k==='basket'){const x=a.hx,y=a.hy;ctx.fillStyle='#8a6a3a';ctx.beginPath();ctx.ellipse(x,y+3,5,3,0,0,7);ctx.fill();blob(x-1,y+.5,2,1.6,hvR('#5a8a3a'));blob(x+1.6,y+1,1.8,1.4,hvR('#c8a040'))}
  else if(k==='spear'){ctx.strokeStyle='#5a3a1e';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a.hx,a.hy+8);ctx.lineTo(a.hx,a.hy-34);ctx.stroke();ctx.fillStyle='#b8bcc4';ctx.beginPath();ctx.moveTo(a.hx-2,a.hy-34);ctx.lineTo(a.hx,a.hy-42);ctx.lineTo(a.hx+2,a.hy-34);ctx.closePath();ctx.fill()}
  ctx.restore()}
function hvFolk(p){const[sx,sy]=iso(p.x,p.y);if(sx<-60||sx>W+60||sy<-90||sy>H+40)return;const L=HVLOOK[p.id],[fx,fy]=scrDir(p.face??.8),f=fx>=0?1:-1,back=fy<0,s=L.s||1;
  shadow(sx,sy,.34*s);ctx.save();ctx.translate(sx,sy);if(s!==1)ctx.scale(s,s);
  const aw=humanoid({R:L.R,f,back,moving:!!p.mv,ph:p.ph||0,seed:p.seed,robe:!!L.robe,run:p.run&&p.mv?1:0,armSwing:p.load?.25:1,head:(hx,hy)=>hvHead(hx,hy,L,f,back)});
  if(p.load&&aw)hvCarry(p.load,aw,f);ctx.restore();if(hyp(p.x-P.x,p.y-P.y)<1.5&&!G.hvSign)label(sx,sy-56*s,L.n,'#d8ccb0')}

// sprites for the solid pieces: hedge, low wall, well
const hvMk=(w,h,ax,ay,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.ax=ax;c.ay=ay;fn(c.getContext('2d'),ax,ay);return c};
function hvQ(g,sx,sy,pts,c){g.fillStyle=c;g.beginPath();pts.forEach(([x,y,z],k)=>{const X=sx+(x-y)*32,Y=sy+(x+y)*16-z;k?g.lineTo(X,Y):g.moveTo(X,Y)});g.closePath();g.fill()}
function hvBox(g,sx,sy,x,y,hw,hd,z0,h,c,top){const x0=x-hw,x1=x+hw,y0=y-hd,y1=y+hd,z1=z0+h;
  hvQ(g,sx,sy,[[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]],shade(c,.8));hvQ(g,sx,sy,[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],shade(c,.6));
  hvQ(g,sx,sy,[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],top||shade(c,1.12))}
function hvSprites(){if(SPR.prop.hvwall)return;const R=mulberry(77);
  SPR.prop.hvhedge=[0,1].map(v=>hvMk(72,64,36,44,(g,ax,ay)=>{g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(ax,ay+2,30,14,0,0,7);g.fill();
    hvBox(g,ax,ay,0,0,.46,.46,0,20+v*3,'#2e5a1c','#4a7a2a');for(let k=0;k<90;k++){const x=R()*.92-.46,y=R()*.92-.46,z=R()<.4?20+v*3:R()*20,X=ax+(x-y)*32,Y=ay+(x+y)*16-z;
      g.fillStyle=['#1e4212','#3a6a22','#5a8a32','#2a5418'][R()*4|0];g.beginPath();g.arc(X,Y,1.2+R()*1.6,0,7);g.fill()}
    if(v)for(let k=0;k<4;k++){g.fillStyle=['#f0e0a0','#e870a0'][k&1];g.fillRect(ax-18+R()*36,ay-28+R()*14,2,2)}}));
  // a gate pillar of dressed stone with a cap and an iron lamp hook
  SPR.prop.hvwall=[0,1].map(v=>hvMk(64,84,32,64,(g,ax,ay)=>{g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(ax,ay+2,20,10,0,0,7);g.fill();
    hvBox(g,ax,ay,0,0,.3,.3,0,6,'#5a564e');hvBox(g,ax,ay,0,0,.22,.22,6,30,'#6a665c');g.strokeStyle='rgba(30,28,24,.45)';g.lineWidth=1;
    for(let k=0;k<4;k++){const z=12+k*7;g.beginPath();g.moveTo(ax-14,ay-z+1);g.lineTo(ax,ay+7-z);g.lineTo(ax+14,ay-z+1);g.stroke()}
    hvBox(g,ax,ay,0,0,.28,.28,36,4,'#8a8478','#a49e90');g.fillStyle='#8a8478';g.beginPath();g.moveTo(ax-12,ay-44);g.lineTo(ax,ay-56);g.lineTo(ax+12,ay-44);g.lineTo(ax,ay-38);g.closePath();g.fill();
    g.fillStyle='#6a665c';g.beginPath();g.moveTo(ax,ay-56);g.lineTo(ax+12,ay-44);g.lineTo(ax,ay-38);g.closePath();g.fill();if(v){g.fillStyle='#4a6a2a';g.fillRect(ax-9,ay-20,6,3);g.fillRect(ax-7,ay-17,3,4)}}));
  SPR.prop.hvwell=[hvMk(84,104,42,80,(g,ax,ay)=>{g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(ax,ay+3,26,12,0,0,7);g.fill();
    const st=g.createLinearGradient(ax-18,0,ax+18,0);st.addColorStop(0,'#8a8478');st.addColorStop(.5,'#6a665c');st.addColorStop(1,'#4a463e');g.fillStyle=st;
    g.beginPath();g.ellipse(ax,ay,18,9,0,0,Math.PI);g.lineTo(ax-18,ay-14);g.ellipse(ax,ay-14,18,9,0,Math.PI,0,true);g.closePath();g.fill();
    g.strokeStyle='rgba(30,28,24,.5)';for(let k=1;k<3;k++){g.beginPath();g.ellipse(ax,ay-k*5,18,9,0,.1,Math.PI-.1);g.stroke()}
    g.fillStyle='#a49e90';g.beginPath();g.ellipse(ax,ay-14,18,9,0,0,7);g.fill();g.fillStyle='#14202a';g.beginPath();g.ellipse(ax,ay-14,13,6,0,0,7);g.fill();
    g.fillStyle='rgba(120,170,200,.35)';g.beginPath();g.ellipse(ax-2,ay-13,6,2,0,0,7);g.fill();
    g.fillStyle='#4a3018';g.fillRect(ax-17,ay-50,3,38);g.fillRect(ax+14,ay-50,3,38);g.fillStyle='#6a4a28';g.fillRect(ax-14,ay-44,28,2);g.fillRect(ax+14,ay-46,6,2);
    g.strokeStyle='#c8b890';g.beginPath();g.moveTo(ax,ay-43);g.lineTo(ax,ay-30);g.stroke();g.fillStyle='#5a3a1e';g.fillRect(ax-3,ay-31,6,5);
    g.fillStyle='#5a2a18';g.beginPath();g.moveTo(ax-24,ay-46);g.lineTo(ax,ay-64);g.lineTo(ax+24,ay-46);g.lineTo(ax+20,ay-44);g.lineTo(ax,ay-58);g.lineTo(ax-20,ay-44);g.closePath();g.fill();
    g.fillStyle='#7a3a20';g.beginPath();g.moveTo(ax-24,ay-46);g.lineTo(ax,ay-64);g.lineTo(ax,ay-58);g.lineTo(ax-20,ay-44);g.closePath();g.fill()})]}

// drawing the open pieces
function hvDraw(p){if(p.k==='hvfolk')return hvFolk(p);const[sx,sy]=iso(p.x,p.y);if(sx<-140||sx>W+140||sy<-170||sy>H+80)return;const t=G.t,near=hyp(p.x-P.x,p.y-P.y);
  const Q=(pts,c)=>hvQ(ctx,sx,sy,pts,c),B=(x,y,hw,hd,z0,h,c,top)=>hvBox(ctx,sx,sy,x,y,hw,hd,z0,h,c,top);
  if(p.k==='hvlamp'){shadow(sx,sy,.18);ctx.fillStyle='#1a1612';ctx.fillRect(sx-1.5,sy-46,3,46);ctx.fillRect(sx-4,sy-3,8,3);ctx.fillRect(sx-1,sy-46,9,2);
    const lx=sx+7,ly=sy-43,fl=.8+Math.sin(t*7+p.ph)*.12;ctx.fillStyle='#2a2018';ctx.fillRect(lx-3.5,ly,7,9);ctx.fillRect(lx-4.5,ly-1,9,2);ctx.fillStyle=`rgba(255,200,110,${fl})`;ctx.fillRect(lx-2.2,ly+1.8,4.4,5.6);
    ctx.save();ctx.globalCompositeOperation='lighter';const gr=ctx.createRadialGradient(lx,ly+4,0,lx,ly+4,G.night?30:16);gr.addColorStop(0,`rgba(255,180,90,${G.night?.4:.18})`);gr.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=gr;ctx.fillRect(lx-30,ly-26,60,60);ctx.restore();return}
  if(p.k==='hvsign'){shadow(sx,sy,.16);ctx.fillStyle='#4a3018';ctx.fillRect(sx-1.5,sy-44,3,44);ctx.fillStyle='#2a1a0c';ctx.fillRect(sx-2,sy-46,4,3);
    const talk=G.hvSign===p;let nl=0,nr=0;p.to.forEach(([n,tx,ty],k)=>{const d=(tx-p.x)-(ty-p.y)>=0?1:-1,y=sy-40+k*7;ctx.fillStyle=k&1?'#7a5430':'#8a6038';ctx.beginPath();ctx.moveTo(sx-d*3,y);ctx.lineTo(sx+d*15,y);ctx.lineTo(sx+d*19,y+2.5);ctx.lineTo(sx+d*15,y+5);ctx.lineTo(sx-d*3,y+5);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3a2410';ctx.fillRect(sx+d*2-1,y+2,d*10,1);if(talk){const q=d>0?nr++:nl++;label(sx+d*34,sy-52-q*19,(d<0?'‹ ':'')+n+(d>0?' ›':''),'#e8d8b0')}});return}
  if(p.k==='hvbench'){const a=p.a*HVD,u=[Math.cos(a)*.48,Math.sin(a)*.48],n=[-Math.sin(a)*.16,Math.cos(a)*.16];shadow(sx,sy,.3);
    for(const s of[-.8,.8])B(u[0]*s,u[1]*s,.04,.04,0,8,'#3a2614');
    Q([[-u[0]-n[0],-u[1]-n[1],8],[u[0]-n[0],u[1]-n[1],8],[u[0]+n[0],u[1]+n[1],8],[-u[0]+n[0],-u[1]+n[1],8]],'#9a6e3a');
    Q([[-u[0]-n[0],-u[1]-n[1],8],[u[0]-n[0],u[1]-n[1],8],[u[0]-n[0],u[1]-n[1],6],[-u[0]-n[0],-u[1]-n[1],6]],'#6a4622');
    Q([[-u[0]-n[0]*1.1,-u[1]-n[1]*1.1,9],[u[0]-n[0]*1.1,u[1]-n[1]*1.1,9],[u[0]-n[0]*1.3,u[1]-n[1]*1.3,19],[-u[0]-n[0]*1.3,-u[1]-n[1]*1.3,19]],'#7a5430');return}
  if(p.k==='hvbanner'){const C=[['#5a0e0a','#8a1c14'],['#0e1a3a','#24407a'],['#3a2a08','#7a5a18']][p.v||0],sw=Math.sin(t*1.6+p.ph)*2;shadow(sx,sy,.14);
    ctx.fillStyle='#2a2018';ctx.fillRect(sx-1.5,sy-64,3,64);ctx.fillRect(sx-10,sy-62,20,2.5);ctx.fillStyle='#c8a040';ctx.beginPath();ctx.arc(sx,sy-66,2.4,0,7);ctx.fill();
    ctx.fillStyle=C[0];ctx.beginPath();ctx.moveTo(sx-9,sy-60);ctx.lineTo(sx+9,sy-60);ctx.lineTo(sx+9+sw,sy-34);ctx.lineTo(sx+sw*.6,sy-29);ctx.lineTo(sx-9+sw,sy-34);ctx.closePath();ctx.fill();
    ctx.fillStyle=C[1];ctx.fillRect(sx-7,sy-58,14,2);ctx.fillStyle='#c8a040';ctx.fillRect(sx-1.5+sw*.4,sy-54,3,14);ctx.fillRect(sx-3+sw*.4,sy-55,6,2);ctx.fillRect(sx-2.5+sw*.45,sy-42,5,2);return}
  if(p.k==='hvring'){const n=12;for(let k=0;k<n;k++){const a=k/n*6.283,front=Math.sin(a)+Math.cos(a)>0;if(front!==!!p.half)continue;const X=sx+(Math.cos(a)-Math.sin(a))*.95*32,Y=sy+(Math.cos(a)+Math.sin(a))*.95*16;
      ctx.fillStyle=k%3?'#5a5650':'#6e6a62';ctx.beginPath();ctx.ellipse(X,Y-2,5,3.2,0,0,7);ctx.fill();ctx.fillStyle='#8a8478';ctx.beginPath();ctx.ellipse(X-1,Y-3.4,3,1.6,0,0,7);ctx.fill()}return}
  if(p.k==='hvroof'){const[tx,ty]=p.t,[rx,ry]=p.r,P2=(a,b)=>[tx*a+rx*b,ty*a+ry*b],w=3.2,zb=78,zf=58,du=(P.x-p.x)*tx+(P.y-p.y)*ty,dv=(P.x-p.x)*rx+(P.y-p.y)*ry;
    // the hero under the roof or just behind it sees through it, as with the tower
    if(!p.fade&&Math.abs(du)<w+.8&&dv>-3.6&&dv<1.6){ctx.save();ctx.globalAlpha=.4;try{p.fade=1;hvDraw(p)}finally{p.fade=0;ctx.restore()}return}
    Q([[...P2(-w,-.3),0],[...P2(w,-.3),0],[...P2(w,-.3),zb],[...P2(-w,-.3),zb]],'#5a3a1e');
    for(let k=-3;k<=3;k++){const[a,b]=P2(k*.95,-.29);Q([[a-tx*.03,b-ty*.03,0],[a+tx*.03,b+ty*.03,0],[a+tx*.03,b+ty*.03,zb],[a-tx*.03,b-ty*.03,zb]],'#3a2614')}
    // tools on the back wall
    const tool=(u,z,c,f)=>{const[a,b]=P2(u,-.26),[X,Y]=[sx+(a-b)*32,sy+(a+b)*16-z];ctx.fillStyle=c;f(X,Y)};
    tool(-2.2,44,'#8a8c94',(X,Y)=>{ctx.fillRect(X-1,Y,2,12);ctx.fillRect(X-4,Y-2,8,4)});tool(-1.2,46,'#6a6c74',(X,Y)=>{ctx.fillRect(X-3,Y,1.5,13);ctx.fillRect(X+1.5,Y,1.5,13);ctx.fillRect(X-3,Y,6,2)});
    tool(.9,40,'#9a9ca4',(X,Y)=>{ctx.fillRect(X-8,Y,16,4);ctx.fillStyle='#5a3a1e';ctx.fillRect(X+8,Y,5,4)});tool(2.2,44,'#5a3a1e',(X,Y)=>{ctx.fillRect(X-1,Y,2,16);ctx.fillStyle='#8a8c94';ctx.fillRect(X-4,Y-3,8,4)});
    tool(-.2,52,'#3a2a1a',(X,Y)=>{ctx.beginPath();ctx.arc(X,Y,5,0,7);ctx.strokeStyle='#3a2a1a';ctx.lineWidth=1.5;ctx.stroke()});
    for(const s of[-w,w])for(const b of[-.3,.8]){const[a,c]=P2(s,b);B(a,c,.06,.06,0,b<0?zb:zf,'#3a2614')}
    Q([[...P2(-w-.25,-.55),zb+4],[...P2(w+.25,-.55),zb+4],[...P2(w+.25,.95),zf-2],[...P2(-w-.25,.95),zf-2]],'#6a3a22');
    for(let k=0;k<7;k++){const q=k/7,b=-.55+q*1.5,z=zb+4-q*(zb-zf+6);Q([[...P2(-w-.25,b),z],[...P2(w+.25,b),z],[...P2(w+.25,b+.04),z-.8],[...P2(-w-.25,b+.04),z-.8]],'#4a2614')}
    Q([[...P2(-w-.25,.95),zf-2],[...P2(w+.25,.95),zf-2],[...P2(w+.25,.95),zf-5],[...P2(-w-.25,.95),zf-5]],'#3a1c10');return}
  if(p.k==='hvwood'){shadow(sx,sy,.42);B(0,0,.42,.28,0,14,'#6a4622','#7a5430');for(let r=0;r<3;r++)for(let k=0;k<5-r;k++){const X=sx+(.42-(-.28+.12+k*.11+r*.05))*32,Y=sy+(.42+(-.28+.12+k*.11+r*.05))*16-3-r*4.5;
      ctx.fillStyle='#8a6a3a';ctx.beginPath();ctx.ellipse(X,Y,2.4,2.2,0,0,7);ctx.fill();ctx.fillStyle='#5a3a1e';ctx.fillRect(X-.5,Y-.5,1,1)}return}
  if(p.k==='hvcoal'){shadow(sx,sy,.3);const C=['#141418','#22222a','#30303a','#3e3e4a'];
    for(let k=0;k<26;k++){const q=k/26,r=(1-q)*12,a=k*2.4,X=sx+Math.cos(a)*r,Y=sy-1-Math.abs(Math.sin(a))*r*.45-q*13;ctx.fillStyle=C[(k*7)%4];ctx.beginPath();ctx.ellipse(X,Y,3.2-q,2.4-q*.8,a,0,7);ctx.fill()}
    ctx.fillStyle='#5a5a66';ctx.fillRect(sx-4,sy-9,1.5,1.5);ctx.fillRect(sx+3,sy-6,1.5,1.5);
    ctx.strokeStyle='#5a3a1e';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx+6,sy-6);ctx.lineTo(sx+13,sy-22);ctx.stroke();ctx.fillStyle='#6a6c74';ctx.beginPath();ctx.moveTo(sx+3,sy-3);ctx.lineTo(sx+8,sy-2);ctx.lineTo(sx+7,sy-8);ctx.lineTo(sx+4,sy-8);ctx.closePath();ctx.fill();return}
  if(p.k==='hvbooks'){shadow(sx,sy,.28);B(0,0,.3,.24,0,12,'#6a4622','#7a5430');const C=['#5a1a14','#1a3a5a','#2a4a1a','#5a4a1a','#3a1a4a'];
    for(let k=0;k<5;k++){const x=-.22+k*.11;B(x,-.04,.04,.15,12,5+((k+p.v*2)%3)*1.5,C[(k+(p.v||0))%5])}return}
  if(p.k==='hvgate'){const a=p.a*HVD,u=[Math.cos(a)*.65,Math.sin(a)*.65];for(const s of[-1,1])B(u[0]*s,u[1]*s,.15,.15,0,26,'#6a665c','#8a8478');
    const[ax0,ay0]=[sx+(u[0]-u[1])*32*-1,sy+(u[0]+u[1])*16*-1-26],[ax1,ay1]=[sx+(u[0]-u[1])*32,sy+(u[0]+u[1])*16-26];
    ctx.strokeStyle='#2a2a30';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax0,ay0);ctx.quadraticCurveTo(sx,sy-48,ax1,ay1);ctx.stroke();ctx.fillStyle='#2a2a30';ctx.fillRect(sx-1,sy-46,2,9);ctx.fillRect(sx-4,sy-43,8,2);return}
  if(p.k==='hvfence'){const[a0,b0]=iso(p.x0,p.y0),[a1,b1]=iso(p.x1,p.y1),n=Math.max(2,Math.round(hyp(a1-a0,b1-b0)/6));ctx.fillStyle='#24242a';
    for(let k=0;k<=n;k++){const X=a0+(a1-a0)*k/n,Y=b0+(b1-b0)*k/n,post=k===0||k===n;ctx.fillRect(X-(post?1.5:.6),Y-(post?20:16),post?3:1.2,post?20:16);if(!post){ctx.fillRect(X-1,Y-18,2,2)}}
    ctx.strokeStyle='#2e2e36';ctx.lineWidth=1.2;for(const h of[13,4]){ctx.beginPath();ctx.moveTo(a0,b0-h);ctx.lineTo(a1,b1-h);ctx.stroke()}return}
  if(p.k==='hvrip'){if(near<2.4)label(sx,sy-34,p.txt,'#c8c0b0');return}
  if(p.k==='hvtele'){const a=t*.15+p.ph,dx=Math.cos(a)*9,dy=Math.sin(a)*3;shadow(sx,sy,.16);ctx.strokeStyle='#3a2614';ctx.lineWidth=1.4;
    for(const q of[-5,0,5]){ctx.beginPath();ctx.moveTo(sx,sy-20);ctx.lineTo(sx+q,sy+(q?0:2));ctx.stroke()}ctx.strokeStyle='#8a6a2a';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(sx-dx*.6,sy-19-dy*.6+2);ctx.lineTo(sx+dx,sy-23+dy);ctx.stroke();
    ctx.strokeStyle='#c8a040';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(sx+dx*.8,sy-22.6+dy*.8);ctx.lineTo(sx+dx,sy-23+dy);ctx.stroke();return}
  if(p.k==='hvline'||p.k==='hvgarl'){const[a0,b0]=iso(p.x0,p.y0),[a1,b1]=iso(p.x1,p.y1),h=p.k==='hvline'?32:44,sag=p.k==='hvline'?7:10;
    if(p.k==='hvline')for(const[X,Y]of[[a0,b0],[a1,b1]]){ctx.fillStyle='#4a3018';ctx.fillRect(X-1.5,Y-h-2,3,h+2)}
    const pt=q=>[a0+(a1-a0)*q,b0+(b1-b0)*q-h+Math.sin(q*Math.PI)*sag];ctx.strokeStyle=p.k==='hvline'?'#c8b890':'#3a2a1a';ctx.lineWidth=1;ctx.beginPath();for(let q=0;q<=1.001;q+=.1){const[X,Y]=pt(q);q?ctx.lineTo(X,Y):ctx.moveTo(X,Y)}ctx.stroke();
    if(p.k==='hvline'){[[.2,'#e8dcc0',8],[.38,'#8a3a2a',7],[.58,'#4a6a8a',9],[.78,'#e8dcc0',6]].forEach(([q,c,hh],k)=>{const[X,Y]=pt(q),sw=Math.sin(t*2+k+p.ph)*1.5;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(X-4,Y);ctx.lineTo(X+4,Y);ctx.lineTo(X+4+sw,Y+hh);ctx.lineTo(X-4+sw,Y+hh);ctx.closePath();ctx.fill()})}
    else for(let k=1;k<12;k++){const q=k/12,[X,Y]=pt(q),sw=Math.sin(t*3+k)*1.2;ctx.fillStyle=['#8a1c14','#c8a040','#24407a','#e8dcc0'][k%4];ctx.beginPath();ctx.moveTo(X-3,Y);ctx.lineTo(X+3,Y);ctx.lineTo(X+sw,Y+7);ctx.closePath();ctx.fill()}return}
  if(p.k==='hvwatch'){shadow(sx,sy,.5);for(const[a,b]of[[-.38,-.38],[.38,-.38],[-.38,.38],[.38,.38]])B(a,b,.05,.05,0,64,'#4a3018');
    for(const z of[18,40]){Q([[-.38,.38,z],[.38,.38,z],[.38,.38,z+2],[-.38,.38,z+2]],'#5a3a1e');Q([[.38,-.38,z],[.38,.38,z],[.38,.38,z+2],[.38,-.38,z+2]],'#4a2e16')}
    B(0,0,.5,.5,62,4,'#6a4622','#7a5430');B(0,.48,.5,.02,66,9,'#5a3a1e');B(.48,0,.02,.5,66,9,'#4a2e16');
    for(const[a,b]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]])B(a,b,.03,.03,66,22,'#3a2614');
    ctx.fillStyle='#5a2a18';ctx.beginPath();const pk=[sx,sy-104],c4=[[-.6,-.6],[.6,-.6],[.6,.6],[-.6,.6]].map(([a,b])=>[sx+(a-b)*32,sy+(a+b)*16-88]);
    ctx.moveTo(c4[3][0],c4[3][1]);ctx.lineTo(pk[0],pk[1]);ctx.lineTo(c4[1][0],c4[1][1]);ctx.lineTo(c4[2][0],c4[2][1]);ctx.closePath();ctx.fill();ctx.fillStyle='#7a3a20';ctx.beginPath();ctx.moveTo(c4[3][0],c4[3][1]);ctx.lineTo(pk[0],pk[1]);ctx.lineTo(c4[2][0],c4[2][1]);ctx.closePath();ctx.fill();
    flame(sx+18,sy-80,5,p.ph);return}
}
const _drawPropHV=drawProp;drawProp=function(p){if(p.k&&p.k.charCodeAt(0)===104&&p.k.charCodeAt(1)===118){hvSprites();return hvDraw(p)}return _drawPropHV(p)};
const _drawHV=render;render=function(){if(G.map&&G.map.world)hvSprites();return _drawHV.apply(this,arguments)};
